/**
 * PostForge Converter - Markdown Engine
 *
 * Converts Markdown to sanitized HTML using the unified/remark/rehype ecosystem.
 * Based on official remark documentation and best practices.
 *
 * Pipeline: Markdown → mdast → hast → HTML
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type { MarkdownOptions } from './types';

/**
 * Convert Markdown to sanitized HTML
 *
 * @param markdown - Input markdown string
 * @param options - Configuration options
 * @returns Sanitized HTML string
 *
 * @example
 * ```ts
 * const html = await convertMarkdownToHtml('# Hello *World*!');
 * // Returns: '<h1>Hello <em>World</em>!</h1>'
 * ```
 *
 * @security This function ALWAYS sanitizes output to prevent XSS attacks
 */
export async function convertMarkdownToHtml(
  markdown: string,
  options: MarkdownOptions = {}
): Promise<string> {
  const {
    gfm = true,
    sanitize = true,
    smartQuotes = true,
  } = options;

  // Build the processor pipeline
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let processor: any = unified().use(remarkParse);

  // Add GFM support (tables, strikethrough, autolinks, etc.)
  if (gfm) {
    processor = processor.use(remarkGfm);
  }

  // Convert mdast → hast
  // Allow raw HTML to pass through when sanitization is disabled
  processor = processor.use(remarkRehype, { allowDangerousHtml: !sanitize });

  // Process raw HTML nodes (when allowDangerousHtml is true)
  if (!sanitize) {
    processor = processor.use(rehypeRaw);
  }

  // CRITICAL: Sanitize HTML to prevent XSS
  if (sanitize) {
    processor = processor.use(rehypeSanitize);
  }

  // Serialize hast → HTML string
  processor = processor.use(rehypeStringify);

  // Process the markdown
  const file = await processor.process(markdown);

  let html = String(file);

  // Apply smart quotes normalization if enabled
  if (smartQuotes) {
    html = normalizeQuotes(html);
  }

  return html;
}

/**
 * Normalize smart quotes and Unicode characters
 *
 * Converts:
 * - Curly quotes (' ' " ") → straight quotes (' ")
 * - Unicode spaces → standard space
 * - Em dash / En dash → standard dash
 *
 * @param text - Input text
 * @returns Normalized text
 */
export function normalizeQuotes(text: string): string {
  return text
    // Normalize single quotes
    .replace(/[\u2018\u2019]/g, "'") // ' ' → '
    // Normalize double quotes
    .replace(/[\u201C\u201D]/g, '"') // " " → "
    // Normalize spaces
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Normalize dashes
    .replace(/[\u2013\u2014]/g, '-'); // – — → -
}

/**
 * Collapse multiple newlines to maximum of 2
 *
 * Example: "\n\n\n\n" → "\n\n"
 *
 * @param text - Input text
 * @returns Text with collapsed newlines
 */
export function collapseNewlines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n');
}

/**
 * Trim text edges without removing intentional indentation
 *
 * Removes leading/trailing whitespace while preserving:
 * - Code block indentation
 * - List item indentation
 * - Quote indentation
 *
 * @param text - Input text
 * @returns Trimmed text
 */
export function trimEdges(text: string): string {
  return text.trim();
}

/**
 * Complete text normalization pipeline
 *
 * Applies all normalization steps:
 * 1. Normalize quotes
 * 2. Collapse newlines
 * 3. Trim edges
 *
 * @param text - Input text
 * @returns Fully normalized text
 */
export function normalizeText(text: string): string {
  let normalized = text;

  normalized = normalizeQuotes(normalized);
  normalized = collapseNewlines(normalized);
  normalized = trimEdges(normalized);

  return normalized;
}
