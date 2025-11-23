/**
 * Vitest Test Setup
 *
 * Global configuration and utilities for converter tests
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Custom matchers for HTML comparison
expect.extend({
  toContainHtmlTag(received: string, tag: string) {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 's');
    const pass = regex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected HTML not to contain <${tag}> tag`
          : `Expected HTML to contain <${tag}> tag, but got: ${received}`,
    };
  },
});
