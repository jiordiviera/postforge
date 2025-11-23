/**
 * Platform Presets Tests
 *
 * Tests for LinkedIn, WhatsApp, and Email preset transformations
 */

import { describe, it, expect } from 'vitest';
import { applyPreset } from '../presets';

describe('Platform Presets', () => {
  describe('LinkedIn Preset', () => {
    it('should normalize paragraph spacing to double newlines', async () => {
      const input = 'Paragraph 1\nParagraph 2\nParagraph 3';
      const result = await applyPreset(input, 'linkedin');
      expect(result.markdown).toContain('Paragraph 1\n\nParagraph 2\n\nParagraph 3');
      expect(result.notes).toContain(
        'Normalized paragraph spacing to double newlines'
      );
    });

    it('should move hashtags to end of post', async () => {
      const input = 'Check out #tech innovations\nThis is #amazing';
      const result = await applyPreset(input, 'linkedin');
      expect(result.markdown).toMatch(/#tech #amazing$/);
      expect(result.notes).toContain('Moved 2 hashtag(s) to end');
    });

    it('should handle post with no hashtags', async () => {
      const input = 'Regular post without hashtags';
      const result = await applyPreset(input, 'linkedin');
      expect(result.markdown).toBe('Regular post without hashtags');
    });

    it('should convert bold to Unicode', async () => {
      const input = '**Bold** text';
      const result = await applyPreset(input, 'linkedin');
      expect(result.markdown).toContain('𝗕𝗼𝗹𝗱');
      expect(result.markdown).not.toContain('**');
    });

    it('should convert italic to Unicode', async () => {
      const input = '*italic* text';
      const result = await applyPreset(input, 'linkedin');
      expect(result.markdown).toContain('𝘪𝘵𝘢𝘭𝘪𝘤');
      expect(result.markdown).not.toContain('*italic*');
    });

    it('should convert lists to bullets', async () => {
      const input = '- Item 1\n- Item 2';
      const result = await applyPreset(input, 'linkedin');
      expect(result.markdown).toContain('• Item 1');
      expect(result.markdown).toContain('• Item 2');
    });

    it('should preserve links', async () => {
      const input = 'Check out [this link](https://example.com)';
      const result = await applyPreset(input, 'linkedin');
      expect(result.html).toContain('<a href="https://example.com">');
    });
  });

  describe('WhatsApp Preset', () => {
    it('should convert double newlines to single', async () => {
      const input = 'Line 1\n\nLine 2\n\n\nLine 3';
      const result = await applyPreset(input, 'whatsapp');
      expect(result.markdown).not.toContain('\n\n');
      expect(result.notes).toContain('Normalized to single newlines for WhatsApp');
    });

    it('should convert markdown bold (**text**) to WhatsApp (*text*)', async () => {
      const input = '**bold text**';
      const result = await applyPreset(input, 'whatsapp');
      expect(result.markdown).toContain('*bold text*');
      expect(result.markdown).not.toContain('**bold text**');
    });

    it('should convert markdown italic (*text*) to WhatsApp (_text_)', async () => {
      const input = '*italic text*';
      const result = await applyPreset(input, 'whatsapp');
      expect(result.markdown).toContain('_italic text_');
    });

    it('should handle mixed formatting', async () => {
      const input = '**bold** and *italic*';
      const result = await applyPreset(input, 'whatsapp');
      expect(result.markdown).toContain('*bold*');
      expect(result.markdown).toContain('_italic_');
    });

    it('should include conversion notes', async () => {
      const input = '**text**';
      const result = await applyPreset(input, 'whatsapp');
      expect(result.notes).toContain('Converted formatting to WhatsApp syntax');
    });
  });

  describe('Email Preset', () => {
    it('should generate full HTML email template', async () => {
      const input = '# Hello\n\nEmail content';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html lang="en">');
      expect(result.html).toContain('</html>');
    });

    it('should include email container wrapper', async () => {
      const input = 'Content';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('class="email-container"');
    });

    it('should include responsive meta tags', async () => {
      const input = 'Content';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('<meta charset="UTF-8">');
      expect(result.html).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      );
    });

    it('should include inline styles', async () => {
      const input = 'Content';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('<style>');
      expect(result.html).toContain('font-family:');
      expect(result.html).toContain('line-height:');
    });

    it('should convert markdown headings', async () => {
      const input = '# Heading 1\n## Heading 2';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('<h1>Heading 1</h1>');
      expect(result.html).toContain('<h2>Heading 2</h2>');
    });

    it('should convert markdown paragraphs', async () => {
      const input = 'Paragraph 1\n\nParagraph 2';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('<p>Paragraph 1</p>');
      expect(result.html).toContain('<p>Paragraph 2</p>');
    });

    it('should convert markdown links', async () => {
      const input = '[Link](https://example.com)';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('<a href="https://example.com">Link</a>');
    });

    it('should preserve original markdown', async () => {
      const input = '**Bold** text';
      const result = await applyPreset(input, 'email');
      expect(result.markdown).toBe(input);
    });

    it('should include generation note', async () => {
      const input = 'Content';
      const result = await applyPreset(input, 'email');
      expect(result.notes).toContain('Generated full HTML email template');
    });

    it('should style code blocks', async () => {
      const input = '```\ncode\n```';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('<code>');
    });

    it('should style inline code', async () => {
      const input = 'Text with `code`';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('<code>code</code>');
    });

    it('should have max-width container', async () => {
      const input = 'Content';
      const result = await applyPreset(input, 'email');
      expect(result.html).toContain('max-width: 600px');
    });
  });

  describe('Preset Error Handling', () => {
    it('should throw error for unknown preset', async () => {
      await expect(
        applyPreset('test', 'unknown' as any)
      ).rejects.toThrow('Unknown preset: unknown');
    });
  });

  describe('Preset Output Structure', () => {
    it('should return PresetResult with required fields for LinkedIn', async () => {
      const result = await applyPreset('test', 'linkedin');
      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('notes');
      expect(Array.isArray(result.notes)).toBe(true);
    });

    it('should return PresetResult with required fields for WhatsApp', async () => {
      const result = await applyPreset('test', 'whatsapp');
      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('notes');
      expect(Array.isArray(result.notes)).toBe(true);
    });

    it('should return PresetResult with required fields for Email', async () => {
      const result = await applyPreset('test', 'email');
      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('notes');
      expect(Array.isArray(result.notes)).toBe(true);
    });
  });
});
