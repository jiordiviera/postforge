'use client';

import { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onCopy?: () => void;
  placeholder?: string;
}

const AUTOSAVE_INTERVAL = 1000; // 1 second
const STORAGE_KEY = 'md-draft-v1';

export function Editor({ value, onChange, onCopy, placeholder }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autosave to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, value);
    }, AUTOSAVE_INTERVAL);

    return () => clearTimeout(timer);
  }, [value]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && !value) {
      onChange(saved);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + B: Bold
      if (isMod && e.key === 'b') {
        e.preventDefault();
        wrapSelection('**', '**');
      }

      // Ctrl/Cmd + I: Italic
      if (isMod && e.key === 'i') {
        e.preventDefault();
        wrapSelection('*', '*');
      }

      // Ctrl/Cmd + Shift + C: Code
      if (isMod && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        wrapSelection('`', '`');
      }

      // Ctrl/Cmd + Enter: Copy HTML
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        onCopy?.();
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, [onCopy]);

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newValue = `${beforeText}${before}${selectedText}${after}${afterText}`;
    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  return (
    <ScrollArea className="h-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Write your markdown here...'}
        className="min-h-full resize-none border-0 focus-visible:ring-0 font-mono text-base p-6 leading-relaxed"
        aria-label="Markdown editor"
      />
    </ScrollArea>
  );
}
