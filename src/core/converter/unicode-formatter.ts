/**
 * Unicode Text Formatter
 *
 * Converts plain text to Unicode styled characters for visual formatting
 * on platforms that don't support markdown (like LinkedIn posts)
 */

// Unicode character ranges for text styling
const UNICODE_MAPS = {
  // Mathematical Bold (𝗔𝗕𝗖)
  bold: {
    upper: 0x1D5D4, // A = U+1D5D4
    lower: 0x1D5EE, // a = U+1D5EE
    digits: 0x1D7EC, // 0 = U+1D7EC
  },
  // Mathematical Italic (𝘈𝘉𝘊)
  italic: {
    upper: 0x1D608, // A = U+1D608
    lower: 0x1D622, // a = U+1D622
  },
  // Mathematical Bold Italic (𝘼𝘽𝘾)
  boldItalic: {
    upper: 0x1D63C, // A = U+1D63C
    lower: 0x1D656, // a = U+1D656
  },
};

/**
 * Convert a character to Unicode bold
 */
function toBoldChar(char: string): string {
  const code = char.charCodeAt(0);

  // Uppercase A-Z
  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(UNICODE_MAPS.bold.upper + (code - 65));
  }
  // Lowercase a-z
  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(UNICODE_MAPS.bold.lower + (code - 97));
  }
  // Digits 0-9
  if (code >= 48 && code <= 57) {
    return String.fromCodePoint(UNICODE_MAPS.bold.digits + (code - 48));
  }

  return char;
}

/**
 * Convert a character to Unicode italic
 */
function toItalicChar(char: string): string {
  const code = char.charCodeAt(0);

  // Uppercase A-Z
  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(UNICODE_MAPS.italic.upper + (code - 65));
  }
  // Lowercase a-z
  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(UNICODE_MAPS.italic.lower + (code - 97));
  }

  return char;
}

/**
 * Convert a character to Unicode bold italic
 */
function toBoldItalicChar(char: string): string {
  const code = char.charCodeAt(0);

  // Uppercase A-Z
  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(UNICODE_MAPS.boldItalic.upper + (code - 65));
  }
  // Lowercase a-z
  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(UNICODE_MAPS.boldItalic.lower + (code - 97));
  }

  return char;
}

/**
 * Convert text to Unicode bold
 * Example: "Hello" → "𝗛𝗲𝗹𝗹𝗼"
 */
export function toBold(text: string): string {
  return Array.from(text).map(toBoldChar).join('');
}

/**
 * Convert text to Unicode italic
 * Example: "Hello" → "𝘏𝘦𝘭𝘭𝘰"
 */
export function toItalic(text: string): string {
  return Array.from(text).map(toItalicChar).join('');
}

/**
 * Convert text to Unicode bold italic
 * Example: "Hello" → "𝙃𝙚𝙡𝙡𝙤"
 */
export function toBoldItalic(text: string): string {
  return Array.from(text).map(toBoldItalicChar).join('');
}

/**
 * Convert markdown formatting to Unicode styled text
 * Handles: **bold**, *italic*, ***bold italic***
 * Protects code blocks and inline code from transformation
 */
export function markdownToUnicode(text: string): string {
  // Step 1: Protect inline code (`code`)
  const codeBlocks: string[] = [];
  let result = text.replace(/`([^`]+)`/g, (match) => {
    const placeholder = `\u0000CODE${codeBlocks.length}\u0000`; // Use null char as delimiter
    codeBlocks.push(match);
    return placeholder;
  });

  // Step 2: Apply Unicode transformations
  // Bold italic (***text***)
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, (_, content) => toBoldItalic(content));

  // Bold (**text**)
  result = result.replace(/\*\*(.+?)\*\*/g, (_, content) => toBold(content));

  // Italic (*text*)
  result = result.replace(/\*(.+?)\*/g, (_, content) => toItalic(content));

  // Italic (_text_)
  result = result.replace(/_(.+?)_/g, (_, content) => toItalic(content));

  // Step 3: Restore code blocks
  codeBlocks.forEach((code, index) => {
    result = result.replace(`\u0000CODE${index}\u0000`, code);
  });

  return result;
}

/**
 * Convert markdown lists to Unicode bullets
 * - item → • item
 * * item → • item
 * 1. item → 1. item (keep numbered)
 */
export function listToBullets(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      // Unordered lists with - or *
      if (/^[\s]*[-*]\s+/.test(line)) {
        return line.replace(/^([\s]*)[-*]\s+/, '$1• ');
      }
      return line;
    })
    .join('\n');
}

/**
 * Full LinkedIn post formatter
 * Converts markdown to visually formatted text for LinkedIn posts
 */
export function formatForLinkedIn(markdown: string): string {
  let formatted = markdown;

  // Convert markdown formatting to Unicode
  formatted = markdownToUnicode(formatted);

  // Remove backticks from inline code (LinkedIn doesn't render monospace)
  formatted = formatted.replace(/`([^`]+)`/g, '$1');

  // Convert lists to bullets
  formatted = listToBullets(formatted);

  // Ensure double newlines for paragraph separation
  formatted = formatted.replace(/\n{1}(?!\n)/g, '\n\n');

  // Extract and move hashtags to end
  const hashtagRegex = /#[\w]+/g;
  const hashtags: string[] = [];
  formatted = formatted.replace(hashtagRegex, (match) => {
    hashtags.push(match);
    return '';
  });

  if (hashtags.length > 0) {
    formatted = formatted.trim() + '\n\n' + hashtags.join(' ');
  }

  return formatted.trim();
}
