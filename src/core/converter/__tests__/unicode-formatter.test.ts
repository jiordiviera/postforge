import { describe, it, expect } from 'vitest';
import {
  toBold,
  toItalic,
  toBoldItalic,
  markdownToUnicode,
  listToBullets,
  formatForLinkedIn,
} from '../unicode-formatter';

describe('unicode-formatter', () => {
  describe('toBold', () => {
    it('should convert text to Unicode bold', () => {
      expect(toBold('Hello')).toBe('𝗛𝗲𝗹𝗹𝗼');
      expect(toBold('WORLD')).toBe('𝗪𝗢𝗥𝗟𝗗');
      expect(toBold('Test123')).toBe('𝗧𝗲𝘀𝘁𝟭𝟮𝟯');
    });

    it('should preserve spaces and punctuation', () => {
      expect(toBold('Hello World!')).toBe('𝗛𝗲𝗹𝗹𝗼 𝗪𝗼𝗿𝗹𝗱!');
    });
  });

  describe('toItalic', () => {
    it('should convert text to Unicode italic', () => {
      expect(toItalic('Hello')).toBe('𝘏𝘦𝘭𝘭𝘰');
      expect(toItalic('WORLD')).toBe('𝘞𝘖𝘙𝘓𝘋');
    });

    it('should preserve spaces and punctuation', () => {
      expect(toItalic('Hello World!')).toBe('𝘏𝘦𝘭𝘭𝘰 𝘞𝘰𝘳𝘭𝘥!');
    });
  });

  describe('toBoldItalic', () => {
    it('should convert text to Unicode bold italic', () => {
      expect(toBoldItalic('Hello')).toBe('𝙃𝙚𝙡𝙡𝙤');
      expect(toBoldItalic('WORLD')).toBe('𝙒𝙊𝙍𝙇𝘿');
    });
  });

  describe('markdownToUnicode', () => {
    it('should convert bold markdown to Unicode', () => {
      const result = markdownToUnicode('This is **bold** text');
      expect(result).toContain('𝗯𝗼𝗹𝗱');
      expect(result).not.toContain('**');
    });

    it('should convert italic markdown to Unicode', () => {
      const result = markdownToUnicode('This is *italic* text');
      expect(result).toContain('𝘪𝘵𝘢𝘭𝘪𝘤');
      expect(result).not.toContain('*italic*');
    });

    it('should convert italic with underscore to Unicode', () => {
      const result = markdownToUnicode('This is _italic_ text');
      expect(result).toContain('𝘪𝘵𝘢𝘭𝘪𝘤');
      expect(result).not.toContain('_italic_');
    });

    it('should convert bold italic markdown to Unicode', () => {
      const result = markdownToUnicode('This is ***bold italic*** text');
      expect(result).toContain('𝙗𝙤𝙡𝙙');
      expect(result).toContain('𝙞𝙩𝙖𝙡𝙞𝙘');
      expect(result).not.toContain('***');
    });

    it('should handle multiple formatting in one text', () => {
      const result = markdownToUnicode('**Bold** and *italic* together');
      expect(result).toContain('𝗕𝗼𝗹𝗱');
      expect(result).toContain('𝘪𝘵𝘢𝘭𝘪𝘤');
    });

    it('should not transform text inside backticks (inline code)', () => {
      const result = markdownToUnicode('**html** `kfjfjjfjfjfj`');
      expect(result).toContain('𝗵𝘁𝗺𝗹'); // html should be bold
      expect(result).toContain('`kfjfjjfjfjfj`'); // code should stay as-is
      expect(result).not.toContain('𝗸𝗳𝗷'); // code content should NOT be bold
    });

    it('should protect multiple inline code blocks', () => {
      const result = markdownToUnicode('**bold** `code1` and `code2`');
      expect(result).toContain('𝗯𝗼𝗹𝗱');
      expect(result).toContain('`code1`');
      expect(result).toContain('`code2`');
    });
  });

  describe('listToBullets', () => {
    it('should convert dash lists to bullets', () => {
      const result = listToBullets('- Item 1\n- Item 2');
      expect(result).toBe('• Item 1\n• Item 2');
    });

    it('should convert asterisk lists to bullets', () => {
      const result = listToBullets('* Item 1\n* Item 2');
      expect(result).toBe('• Item 1\n• Item 2');
    });

    it('should preserve indentation', () => {
      const result = listToBullets('  - Indented item');
      expect(result).toBe('  • Indented item');
    });

    it('should not affect numbered lists', () => {
      const result = listToBullets('1. First\n2. Second');
      expect(result).toBe('1. First\n2. Second');
    });
  });

  describe('formatForLinkedIn', () => {
    it('should convert markdown to LinkedIn-formatted text', () => {
      const input = '**Bold** and *italic* text\n- List item';
      const result = formatForLinkedIn(input);

      expect(result).toContain('𝗕𝗼𝗹𝗱');
      expect(result).toContain('𝘪𝘵𝘢𝘭𝘪𝘤');
      expect(result).toContain('• List item');
    });

    it('should normalize paragraph spacing', () => {
      const input = 'Paragraph 1\nParagraph 2';
      const result = formatForLinkedIn(input);
      expect(result).toContain('Paragraph 1\n\nParagraph 2');
    });

    it('should move hashtags to end', () => {
      const input = 'Post content #hashtag1 more text #hashtag2';
      const result = formatForLinkedIn(input);

      expect(result).toMatch(/Post content\s+more text\s+#hashtag1 #hashtag2$/);
    });

    it('should handle complex LinkedIn post', () => {
      const input = `**Important announcement**

This is my post with *key points*:
- Point 1
- Point 2

#marketing #business`;

      const result = formatForLinkedIn(input);

      // Check Unicode formatting
      expect(result).toContain('𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁');
      expect(result).toContain('𝗮𝗻𝗻𝗼𝘂𝗻𝗰𝗲𝗺𝗲𝗻𝘁');
      expect(result).toContain('𝘬𝘦𝘺');
      expect(result).toContain('𝘱𝘰𝘪𝘯𝘵𝘴');

      // Check bullets
      expect(result).toContain('• Point 1');
      expect(result).toContain('• Point 2');

      // Check hashtags at end
      expect(result).toMatch(/#marketing #business$/);
    });

    it('should remove backticks from inline code for LinkedIn', () => {
      const input = '**html** `kfjfjjfjfjfj` and more `code`';
      const result = formatForLinkedIn(input);

      // html should be bold
      expect(result).toContain('𝗵𝘁𝗺𝗹');

      // Backticks should be removed, but content preserved
      expect(result).not.toContain('`');
      expect(result).toContain('kfjfjjfjfjfj');
      expect(result).toContain('code');
    });
  });
});
