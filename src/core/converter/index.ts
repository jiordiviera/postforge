/**
 * PostForge Converter - Main Export
 *
 * Orchestrates the 3-layer conversion pipeline:
 * 1. Preprocessor (WhatsApp syntax normalization)
 * 2. Markdown Engine (unified/remark/rehype)
 * 3. Preset Engine (platform-specific transformations)
 */

import type { ConverterOptions, ConverterResult } from './types';
import { preprocessWhatsApp } from './preprocess';
import { convertMarkdownToHtml } from './markdown';
import { applyPreset } from './presets';

/**
 * Convert markdown to HTML with optional preprocessing and presets
 *
 * @param input - Raw markdown input
 * @param options - Conversion options
 * @returns Processed markdown and HTML output
 *
 * @example
 * ```ts
 * // Basic conversion
 * const result = await convert('# Hello\n*world*');
 * // result.html: '<h1>Hello</h1>\n<p><em>world</em></p>'
 *
 * // With WhatsApp preprocessing
 * const whatsapp = await convert('Hello *bold*', {
 *   preprocess: { enabled: true }
 * });
 * // Input transformed: *bold* -> **bold**
 *
 * // With LinkedIn preset
 * const linkedin = await convert('Post\n\n#hashtag', {
 *   preset: 'linkedin'
 * });
 * // Hashtags moved to end, double newlines enforced
 * ```
 */
export async function convert(
  input: string,
  options: ConverterOptions = {}
): Promise<ConverterResult> {
  const {
    preprocess = { enabled: false, preserveCode: true },
    markdown = { gfm: true, sanitize: true, smartQuotes: true },
    preset,
  } = options;

  // Layer 1: WhatsApp Preprocessing (optional)
  let processedMarkdown = input;
  if (preprocess.enabled) {
    processedMarkdown = preprocessWhatsApp(input, preprocess);
  }

  // Layer 2: Markdown to HTML Conversion
  let html = await convertMarkdownToHtml(processedMarkdown, markdown);

  // Layer 3: Platform Preset (optional)
  let presetResult;
  if (preset) {
    presetResult = await applyPreset(processedMarkdown, preset);
    // Use preset HTML instead of basic conversion
    html = presetResult.html;
    processedMarkdown = presetResult.markdown;
  }

  return {
    markdown: processedMarkdown,
    html,
    preset: presetResult,
  };
}

/**
 * Re-export all types for convenience
 */
export type {
  MarkdownOptions,
  PreprocessOptions,
  PresetType,
  PresetResult,
  ConverterOptions,
  ConverterResult,
} from './types';

/**
 * Re-export individual pipeline functions for advanced usage
 */
export { preprocessWhatsApp } from './preprocess';
export { convertMarkdownToHtml } from './markdown';
export { applyPreset } from './presets';
