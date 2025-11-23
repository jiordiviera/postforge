/**
 * Markdown Engine Tests
 *
 * Tests for unified/remark/rehype conversion pipeline
 */

import { describe, it, expect } from 'vitest';
import { convertMarkdownToHtml } from '../markdown';

describe('Markdown Converter', () => {
  // Test 1: Emphasis (italic)
  it('should convert italic syntax to <em> tag', async () => {
    const input = '*italic*';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<em>italic</em>');
  });

  // Test 2: Strong (bold)
  it('should convert bold syntax to <strong> tag', async () => {
    const input = '**bold**';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<strong>bold</strong>');
  });

  // Test 3: Both (bold + italic)
  it('should convert bold+italic syntax to nested tags', async () => {
    const input = '***bolditalic***';
    const result = await convertMarkdownToHtml(input);
    // Can be either <strong><em> or <em><strong> depending on parser
    expect(result).toMatch(/<(strong|em)><(strong|em)>bolditalic<\/(strong|em)><\/(strong|em)>/);
  });

  // Test 4: Code inline preserved
  it('should preserve code inline without transformation', async () => {
    const input = '`a*b*c`';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<code>a*b*c</code>');
    expect(result).not.toContain('<em>');
  });

  // Test 5: Code block preserved
  it('should preserve code blocks without transformation', async () => {
    const input = '```\n*not bold*\n```';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('*not bold*');
    expect(result).not.toContain('<em>');
  });

  // Test 13: Links
  it('should convert markdown links to <a> tags', async () => {
    const input = '[text](https://example.com)';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<a href="https://example.com">text</a>');
  });

  // Test 14: XSS sanitization
  it('should sanitize XSS attempts', async () => {
    const input = '<script>alert("XSS")</script>';
    const result = await convertMarkdownToHtml(input);
    expect(result).not.toContain('<script>');
  });

  // Test 15: Images
  it('should convert markdown images to <img> tags', async () => {
    const input = '![alt text](https://example.com/image.jpg)';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<img');
    expect(result).toContain('alt="alt text"');
    expect(result).toContain('src="https://example.com/image.jpg"');
  });

  // Test 6: Nested lists (3 levels)
  it('should handle nested lists up to 3 levels', async () => {
    const input = `- Level 1
  - Level 2
    - Level 3`;
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Level 1');
    expect(result).toContain('<li>Level 2');
    expect(result).toContain('<li>Level 3');
  });

  // Test 7: Blockquotes with code
  it('should handle blockquotes with code inside', async () => {
    const input = '> Quote with `code`';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<blockquote>');
    expect(result).toContain('<code>code</code>');
  });

  // Test 8: GFM tables
  it('should parse GitHub Flavored Markdown tables', async () => {
    const input = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<table>');
    expect(result).toContain('<th>Header 1</th>');
    expect(result).toContain('<td>Cell 1</td>');
  });

  // Test 9: Smart quotes normalization
  it('should normalize smart quotes', async () => {
    const input = '"quoted text"';
    const result = await convertMarkdownToHtml(input, { smartQuotes: true });
    expect(result).toContain('"quoted text"');
  });

  // Test 10: Blank lines collapse
  it('should collapse multiple blank lines', async () => {
    const input = 'Paragraph 1\n\n\n\nParagraph 2';
    const result = await convertMarkdownToHtml(input);
    // Should not have more than 2 consecutive newlines
    expect(result).not.toMatch(/\n{3,}/);
  });

  // Headings
  it('should convert headings to appropriate tags', async () => {
    const input = '# H1\n## H2\n### H3';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<h1>H1</h1>');
    expect(result).toContain('<h2>H2</h2>');
    expect(result).toContain('<h3>H3</h3>');
  });

  // Strikethrough (GFM)
  it('should support GFM strikethrough', async () => {
    const input = '~~strikethrough~~';
    const result = await convertMarkdownToHtml(input);
    expect(result).toContain('<del>strikethrough</del>');
  });

  // Options: Disable GFM
  it('should respect gfm option when disabled', async () => {
    const input = '~~strikethrough~~';
    const result = await convertMarkdownToHtml(input, { gfm: false });
    // Without GFM, ~~ is not recognized as strikethrough
    expect(result).not.toContain('<del>');
  });

  // Options: Disable sanitization
  it('should respect sanitize option when disabled', async () => {
    const input = '<div class="custom">content</div>';
    const resultSanitized = await convertMarkdownToHtml(input, {
      sanitize: true,
    });
    const resultUnsanitized = await convertMarkdownToHtml(input, {
      sanitize: false,
    });
    // Sanitized should remove class attribute
    expect(resultSanitized).not.toContain('class="custom"');
    // Unsanitized should keep it
    expect(resultUnsanitized).toContain('class="custom"');
  });
});
