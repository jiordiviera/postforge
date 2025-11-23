/**
 * WhatsApp Preprocessor Tests
 *
 * Tests for WhatsApp syntax normalization and code block preservation
 */

import { describe, it, expect } from 'vitest';
import { preprocessWhatsApp } from '../preprocess';

describe('WhatsApp Preprocessor', () => {
  // Core transformations
  it('should transform WhatsApp bold (*text*) to markdown bold (**text**)', () => {
    const input = 'Hello *world*!';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('Hello **world**!');
  });

  it('should transform WhatsApp italic (_text_) to markdown italic (*text*)', () => {
    const input = 'Hello _world_!';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('Hello *world*!');
  });

  // Test 11: WhatsApp strikethrough
  it('should transform WhatsApp strikethrough (~text~) to markdown (~~text~~)', () => {
    const input = 'Hello ~world~!';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('Hello ~~world~~!');
  });

  // Test 12: Escape characters
  it('should preserve escaped characters', () => {
    const input = 'Not \\*bold\\* text';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('Not \\*bold\\* text');
  });

  // Code block preservation (CRITICAL)
  it('should NOT transform syntax inside fenced code blocks', () => {
    const input = '```\n*not bold*\n_not italic_\n~not strike~\n```';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toContain('*not bold*');
    expect(result).toContain('_not italic_');
    expect(result).toContain('~not strike~');
    expect(result).not.toContain('**not bold**');
  });

  it('should NOT transform syntax inside inline code', () => {
    const input = 'Code: `*bold* _italic_ ~strike~`';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toContain('`*bold* _italic_ ~strike~`');
    expect(result).not.toContain('**bold**');
  });

  // Complex scenarios
  it('should handle multiple formatting in same text', () => {
    const input = '*bold* and _italic_ and ~strike~';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('**bold** and *italic* and ~~strike~~');
  });

  it('should preserve already-formatted markdown bold', () => {
    const input = '**already bold**';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('**already bold**');
  });

  it('should preserve already-formatted markdown strikethrough', () => {
    const input = '~~already strike~~';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('~~already strike~~');
  });

  // Snake_case preservation for italic
  it('should NOT transform underscores in snake_case identifiers', () => {
    const input = 'my_variable_name';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('my_variable_name');
    expect(result).not.toContain('*');
  });

  it('should transform underscores with whitespace boundaries', () => {
    const input = 'This is _italic_ text';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('This is *italic* text');
  });

  // Multiline handling
  it('should NOT transform across newlines', () => {
    const input = '*text\nmore text*';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe('*text\nmore text*');
    expect(result).not.toContain('**');
  });

  // Options handling
  it('should respect enabled: false option', () => {
    const input = 'Hello *world*!';
    const result = preprocessWhatsApp(input, { enabled: false });
    expect(result).toBe('Hello *world*!');
  });

  it('should return original when disabled', () => {
    const input = '*bold* _italic_ ~strike~';
    const result = preprocessWhatsApp(input, { enabled: false });
    expect(result).toBe(input);
  });

  // Edge cases
  it('should handle empty string', () => {
    const result = preprocessWhatsApp('', { enabled: true });
    expect(result).toBe('');
  });

  it('should handle text with no formatting', () => {
    const input = 'Plain text without any formatting';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toBe(input);
  });

  // Code fence variants
  it('should preserve syntax in triple-tilde code blocks', () => {
    const input = '~~~\n*not bold*\n~~~';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toContain('*not bold*');
    expect(result).not.toContain('**not bold**');
  });

  // Mixed code and text
  it('should transform outside code but preserve inside', () => {
    const input = '*bold* text `*not bold*` more *bold*';
    const result = preprocessWhatsApp(input, { enabled: true });
    expect(result).toContain('**bold** text');
    expect(result).toContain('`*not bold*`');
    expect(result).toContain('more **bold**');
  });
});
