/**
 * PostForge Converter - Platform Presets
 *
 * Platform-specific transformations for LinkedIn, WhatsApp, and Email.
 * Each preset optimizes markdown/HTML for its target platform.
 */

import type { PresetType, PresetResult } from './types';
import { convertMarkdownToHtml } from './markdown';
import { formatForLinkedIn } from './unicode-formatter';

/**
 * Apply platform-specific preset transformation
 *
 * @param markdown - Input markdown
 * @param preset - Target platform
 * @returns Transformed markdown and HTML with notes
 *
 * @example
 * ```ts
 * const result = await applyPreset('# Hello\nWorld', 'linkedin');
 * // result.notes: ['Normalized paragraph spacing']
 * ```
 */
export async function applyPreset(
  markdown: string,
  preset: PresetType
): Promise<PresetResult> {
  switch (preset) {
    case 'linkedin':
      return applyLinkedInPreset(markdown);
    case 'whatsapp':
      return applyWhatsAppPreset(markdown);
    case 'email':
      return applyEmailPreset(markdown);
    default:
      throw new Error(`Unknown preset: ${preset}`);
  }
}

/**
 * LinkedIn Preset
 *
 * Optimizations:
 * - Convert markdown formatting to Unicode styled text (**bold** → 𝗯𝗼𝗹𝗱)
 * - Convert lists to Unicode bullets (- item → • item)
 * - Force double newlines between paragraphs
 * - Move hashtags to end of post
 * - Clean up extra spaces
 */
async function applyLinkedInPreset(
  markdown: string
): Promise<PresetResult> {
  const notes: string[] = [];

  // Use Unicode formatter for LinkedIn-compatible text
  const processed = formatForLinkedIn(markdown);

  // Count formatting transformations
  const boldCount = (markdown.match(/\*\*(.+?)\*\*/g) || []).length;
  const italicCount = (markdown.match(/\*(.+?)\*/g) || []).length;
  const listCount = (markdown.match(/^[\s]*[-*]\s+/gm) || []).length;
  const hashtagCount = (markdown.match(/#[\w]+/g) || []).length;

  if (boldCount > 0) {
    notes.push(`Converted ${boldCount} bold text(s) to Unicode 𝗯𝗼𝗹𝗱`);
  }
  if (italicCount > 0) {
    notes.push(`Converted ${italicCount} italic text(s) to Unicode 𝘪𝘵𝘢𝘭𝘪𝘤`);
  }
  if (listCount > 0) {
    notes.push(`Converted ${listCount} list item(s) to • bullets`);
  }
  if (hashtagCount > 0) {
    notes.push(`Moved ${hashtagCount} hashtag(s) to end`);
  }
  notes.push('Normalized paragraph spacing to double newlines');

  // For LinkedIn preview: show the actual text that will be copied (plain Unicode text)
  // Wrap in basic HTML for display, preserving line breaks
  const html = `<div style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5;">${escapeHtml(processed)}</div>`;

  return {
    markdown: processed,
    html,
    notes,
  };
}

/**
 * Escape HTML special characters for safe display
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * WhatsApp Preset
 *
 * Reverse conversion for WhatsApp compatibility:
 * - **bold** → *bold*
 * - *italic* → _italic_
 * - No paragraph spacing (single \n)
 * - Plain text output preferred
 */
async function applyWhatsAppPreset(
  markdown: string
): Promise<PresetResult> {
  const notes: string[] = [];
  let processed = markdown;

  // Step 1: Convert double newlines to single
  processed = processed.replace(/\n\n+/g, '\n');
  notes.push('Normalized to single newlines for WhatsApp');

  // Step 2: Convert to HTML first
  let html = await convertMarkdownToHtml(processed, {
    gfm: true,
    sanitize: true,
  });

  // Step 3: Reverse transformation - Markdown to WhatsApp syntax
  // IMPORTANT: Process italic BEFORE bold to avoid conflicts

  // *italic* → _italic_ (FIRST - before bold conversion creates more *)
  processed = processed.replace(/(?<!\*)\*(?!\*)([^*\n]+?)\*(?!\*)/g, '_$1_');
  html = html.replace(/<em>(.*?)<\/em>/g, '_$1_');

  // **bold** → *bold* (SECOND - won't conflict with _ syntax)
  processed = processed.replace(/\*\*(.*?)\*\*/g, '*$1*');
  html = html.replace(/<strong>(.*?)<\/strong>/g, '*$1*');

  notes.push('Converted formatting to WhatsApp syntax');

  return {
    markdown: processed,
    html,
    notes,
  };
}

/**
 * Email Preset
 *
 * Generate full HTML email with:
 * - Complete HTML wrapper
 * - Inline styles for compatibility
 * - Gmail/Outlook safe formatting
 */
async function applyEmailPreset(
  markdown: string
): Promise<PresetResult> {
  const notes: string[] = [];

  // Convert markdown to HTML
  const bodyHtml = await convertMarkdownToHtml(markdown, {
    gfm: true,
    sanitize: true,
  });

  // Wrap in full HTML email template
  const html = generateEmailTemplate(bodyHtml);
  notes.push('Generated full HTML email template');

  return {
    markdown,
    html,
    notes,
  };
}

/**
 * Generate email HTML template with inline styles
 *
 * @param body - HTML body content
 * @returns Complete HTML email
 */
function generateEmailTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      color: #1a1a1a;
    }
    h1 { font-size: 28px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    p {
      margin-bottom: 16px;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    ul, ol {
      margin-bottom: 16px;
      padding-left: 24px;
    }
    li {
      margin-bottom: 8px;
    }
    blockquote {
      border-left: 4px solid #dddddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666666;
      font-style: italic;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid #dddddd;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${body}
  </div>
</body>
</html>`;
}
