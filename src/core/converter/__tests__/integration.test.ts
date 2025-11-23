/**
 * Integration Tests
 *
 * End-to-end tests for the complete converter pipeline
 */

import { describe, it, expect } from 'vitest';
import { convert } from '../index';

describe('Converter Integration', () => {
  describe('Basic Conversion', () => {
    it('should convert markdown to HTML', async () => {
      const result = await convert('# Hello\n\n**World**');
      expect(result.html).toContain('<h1>Hello</h1>');
      expect(result.html).toContain('<strong>World</strong>');
      expect(result.markdown).toBe('# Hello\n\n**World**');
    });

    it('should return markdown and html', async () => {
      const result = await convert('*test*');
      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('html');
    });
  });

  describe('With WhatsApp Preprocessing', () => {
    it('should preprocess WhatsApp syntax before conversion', async () => {
      const result = await convert('Hello *world*!', {
        preprocess: { enabled: true },
      });
      // *world* should be converted to **world** by preprocessor
      expect(result.html).toContain('<strong>world</strong>');
    });

    it('should preserve code blocks during preprocessing', async () => {
      const result = await convert('Text `*not bold*`', {
        preprocess: { enabled: true },
      });
      expect(result.html).toContain('<code>*not bold*</code>');
      expect(result.html).not.toContain('<strong>not bold</strong>');
    });

    it('should handle WhatsApp italic conversion', async () => {
      const result = await convert('Hello _italic_!', {
        preprocess: { enabled: true },
      });
      expect(result.html).toContain('<em>italic</em>');
    });

    it('should handle WhatsApp strikethrough conversion', async () => {
      const result = await convert('Hello ~strike~!', {
        preprocess: { enabled: true },
      });
      expect(result.html).toContain('<del>strike</del>');
    });
  });

  describe('With Platform Presets', () => {
    it('should apply LinkedIn preset transformations', async () => {
      const result = await convert('Post\n#hashtag', {
        preset: 'linkedin',
      });
      expect(result.preset).toBeDefined();
      expect(result.preset?.notes).toBeDefined();
      expect(result.preset?.markdown).toContain('#hashtag');
    });

    it('should apply WhatsApp preset transformations', async () => {
      const result = await convert('**bold**', {
        preset: 'whatsapp',
      });
      expect(result.preset).toBeDefined();
      expect(result.preset?.markdown).toContain('*bold*');
    });

    it('should apply Email preset transformations', async () => {
      const result = await convert('# Email', {
        preset: 'email',
      });
      expect(result.preset).toBeDefined();
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<h1>Email</h1>');
    });
  });

  describe('Combined Preprocessing + Preset', () => {
    it('should apply preprocessing then LinkedIn preset', async () => {
      const result = await convert('*bold* text\n#tag', {
        preprocess: { enabled: true },
        preset: 'linkedin',
      });
      // Preprocessing: *bold* → **bold**
      // LinkedIn: move hashtag to end
      expect(result.html).toContain('<strong>bold</strong>');
      expect(result.preset?.markdown).toMatch(/#tag$/);
    });

    it('should apply preprocessing then WhatsApp preset', async () => {
      const result = await convert('*bold*', {
        preprocess: { enabled: true },
        preset: 'whatsapp',
      });
      // Preprocessing: *bold* → **bold**
      // WhatsApp preset: **bold** → *bold* (reverse)
      expect(result.preset?.markdown).toContain('*bold*');
    });
  });

  describe('Markdown Options', () => {
    it('should respect GFM option', async () => {
      const withGfm = await convert('~~strike~~', {
        markdown: { gfm: true },
      });
      const withoutGfm = await convert('~~strike~~', {
        markdown: { gfm: false },
      });
      expect(withGfm.html).toContain('<del>strike</del>');
      expect(withoutGfm.html).not.toContain('<del>strike</del>');
    });

    it('should respect sanitize option', async () => {
      const sanitized = await convert('<div class="test">text</div>', {
        markdown: { sanitize: true },
      });
      const unsanitized = await convert('<div class="test">text</div>', {
        markdown: { sanitize: false },
      });
      expect(sanitized.html).not.toContain('class="test"');
      expect(unsanitized.html).toContain('class="test"');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle complex markdown with all features', async () => {
      const input = `# Title

Paragraph with **bold** and *italic*.

- List item 1
- List item 2

\`\`\`js
const code = "preserved";
\`\`\`

[Link](https://example.com)

| Table | Header |
|-------|--------|
| Cell  | Data   |`;

      const result = await convert(input);
      expect(result.html).toContain('<h1>Title</h1>');
      expect(result.html).toContain('<strong>bold</strong>');
      expect(result.html).toContain('<em>italic</em>');
      expect(result.html).toContain('<ul>');
      expect(result.html).toContain('<li>List item 1</li>');
      expect(result.html).toContain('<pre>');
      expect(result.html).toMatch(/<code/); // Can have attributes like class
      expect(result.html).toContain('<a href="https://example.com">');
      expect(result.html).toContain('<table>');
    });

    it('should be idempotent (same result on multiple calls)', async () => {
      const input = '**bold** text';
      const result1 = await convert(input);
      const result2 = await convert(input);
      expect(result1.html).toBe(result2.html);
      expect(result1.markdown).toBe(result2.markdown);
    });

    it('should handle empty input', async () => {
      const result = await convert('');
      expect(result.html).toBeDefined();
      expect(result.markdown).toBe('');
    });

    it('should handle plain text without markdown', async () => {
      const result = await convert('Plain text');
      expect(result.html).toContain('Plain text');
    });
  });

  describe('Security', () => {
    it('should sanitize dangerous HTML by default', async () => {
      const result = await convert('<script>alert("XSS")</script>');
      expect(result.html).not.toContain('<script>');
    });

    it('should remove onclick handlers', async () => {
      const result = await convert('<a onclick="alert()">link</a>');
      expect(result.html).not.toContain('onclick');
    });

    it('should remove javascript: protocols', async () => {
      const result = await convert('[link](javascript:alert())');
      expect(result.html).not.toContain('javascript:');
    });
  });

  describe('Type Exports', () => {
    it('should export all types', () => {
      // This is a compile-time test
      // If types are not exported, TypeScript will error
      const options: import('../index').ConverterOptions = {
        preprocess: { enabled: true },
        preset: 'linkedin',
      };
      expect(options).toBeDefined();
    });
  });
});
