/**
 * PostForge Converter - WhatsApp Preprocessor
 *
 * Converts WhatsApp-style markdown syntax to standard markdown.
 * CRITICAL: Must be strictly non-destructive within code blocks.
 *
 * Transformations:
 * - *text* → **text** (bold)
 * - _text_ → *text* (italic)
 * - ~text~ → ~~text~~ (strikethrough)
 */

import type { PreprocessOptions } from './types';

/**
 * Preprocess WhatsApp markdown syntax to standard markdown
 *
 * @param input - Raw input text (potentially with WhatsApp syntax)
 * @param options - Preprocessing options
 * @returns Standard markdown text
 *
 * @example
 * ```ts
 * const result = preprocessWhatsApp('Hello *world*!');
 * // Returns: 'Hello **world**!'
 * ```
 *
 * @security NEVER transforms syntax inside code blocks or inline code
 */
export function preprocessWhatsApp(
  input: string,
  options: PreprocessOptions = { enabled: true, preserveCode: true }
): string {
  if (!options.enabled) {
    return input;
  }

  // Step 1: Protect code blocks and inline code
  const { text, protectedRanges } = protectCodeBlocks(input);

  // Step 2: Apply WhatsApp transformations
  let processed = text;

  // IMPORTANT: Bold must come BEFORE italic to avoid conflicts
  // If italic runs first, _text_ → *text*, then bold transforms it to **text**

  // Transform strikethrough: ~text~ → ~~text~~
  processed = transformStrikethrough(processed, protectedRanges);

  // Transform bold: *text* → **text** (FIRST)
  processed = transformBold(processed, protectedRanges);

  // Transform italic: _text_ → *text* (SECOND)
  processed = transformItalic(processed, protectedRanges);

  // Step 3: Restore protected code blocks
  processed = restoreCodeBlocks(processed, protectedRanges);

  return processed;
}

/**
 * Protected range marking code blocks and inline code
 */
interface ProtectedRange {
  start: number;
  end: number;
  type: 'fence' | 'inline';
  placeholder: string;
  original: string;
}

/**
 * Protect code blocks and inline code from transformation
 *
 * @param text - Input text
 * @returns Text with placeholders and list of protected ranges
 */
function protectCodeBlocks(text: string): {
  text: string;
  protectedRanges: ProtectedRange[];
} {
  const ranges: ProtectedRange[] = [];
  let result = text;

  // Protect fenced code blocks (``` or ~~~)
  const fenceRegex = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
  let match;

  while ((match = fenceRegex.exec(text)) !== null) {
    const placeholder = `__PROTECTED_FENCE_${ranges.length}__`;
    ranges.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'fence',
      placeholder,
      original: match[0],
    });
  }

  // Protect inline code (`code`)
  const inlineRegex = /`[^`\n]+`/g;
  while ((match = inlineRegex.exec(text)) !== null) {
    // Check if this inline code is inside a fence
    const isInsideFence = ranges.some(
      (range) =>
        range.type === 'fence' &&
        match!.index >= range.start &&
        match!.index < range.end
    );

    if (!isInsideFence) {
      const placeholder = `__PROTECTED_INLINE_${ranges.length}__`;
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'inline',
        placeholder,
        original: match[0],
      });
    }
  }

  // Sort ranges by start position (descending) for safe replacement
  ranges.sort((a, b) => b.start - a.start);

  // Replace with placeholders
  for (const range of ranges) {
    result =
      result.slice(0, range.start) +
      range.placeholder +
      result.slice(range.end);
  }

  return { text: result, protectedRanges: ranges };
}

/**
 * Restore protected code blocks
 *
 * @param text - Text with placeholders
 * @param ranges - Protected ranges
 * @returns Original text with code blocks restored
 */
function restoreCodeBlocks(
  text: string,
  ranges: ProtectedRange[]
): string {
  let result = text;

  for (const range of ranges) {
    result = result.replace(range.placeholder, range.original);
  }

  return result;
}

/**
 * Check if position is inside a protected range
 * (Note: This function is currently unused but kept for potential future use)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isProtected(
  position: number,
  ranges: ProtectedRange[],
  text: string
): boolean {
  return ranges.some((range) => {
    const placeholderIndex = text.indexOf(range.placeholder);
    if (placeholderIndex === -1) return false;
    return (
      position >= placeholderIndex &&
      position < placeholderIndex + range.placeholder.length
    );
  });
}

/**
 * Transform WhatsApp bold: *text* → **text**
 *
 * Only transforms single asterisks that are NOT:
 * - Inside code blocks
 * - Already double asterisks
 * - Escaped with backslash
 */
function transformBold(
  text: string,
  protectedRanges: ProtectedRange[]
): string {
  // Match single asterisks that wrap text
  // Negative lookahead/lookbehind to avoid double asterisks
  const regex = /(?<!\\)(?<!\*)\*(?!\*)([^\*\n]+?)\*(?!\*)/g;

  return text.replace(regex, (match, content, offset) => {
    // Don't transform if inside protected range
    const placeholder = protectedRanges.find((r) =>
      text.slice(offset, offset + match.length).includes(r.placeholder)
    );

    if (placeholder) {
      return match;
    }

    return `**${content}**`;
  });
}

/**
 * Transform WhatsApp italic: _text_ → *text*
 *
 * Only transforms underscores that are NOT:
 * - Inside code blocks
 * - Part of snake_case
 * - Escaped with backslash
 */
function transformItalic(
  text: string,
  protectedRanges: ProtectedRange[]
): string {
  // Match underscores with whitespace boundaries
  const regex = /(?<!\\)(?<![a-zA-Z0-9])_([^_\n]+?)_(?![a-zA-Z0-9])/g;

  return text.replace(regex, (match, content, offset) => {
    // Don't transform if inside protected range
    const placeholder = protectedRanges.find((r) =>
      text.slice(offset, offset + match.length).includes(r.placeholder)
    );

    if (placeholder) {
      return match;
    }

    return `*${content}*`;
  });
}

/**
 * Transform WhatsApp strikethrough: ~text~ → ~~text~~
 *
 * Only transforms single tildes that are NOT:
 * - Inside code blocks
 * - Already double tildes
 * - Escaped with backslash
 */
function transformStrikethrough(
  text: string,
  protectedRanges: ProtectedRange[]
): string {
  const regex = /(?<!\\)(?<!~)~(?!~)([^~\n]+?)~(?!~)/g;

  return text.replace(regex, (match, content, offset) => {
    // Don't transform if inside protected range
    const placeholder = protectedRanges.find((r) =>
      text.slice(offset, offset + match.length).includes(r.placeholder)
    );

    if (placeholder) {
      return match;
    }

    return `~~${content}~~`;
  });
}
