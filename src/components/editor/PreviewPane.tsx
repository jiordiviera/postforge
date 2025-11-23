'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface PreviewPaneProps {
  html: string;
  notes?: string[];
}

export function PreviewPane({ html, notes }: PreviewPaneProps) {
  return (
    <div className="h-full flex flex-col">
      {notes && notes.length > 0 && (
        <div className="px-6 py-3 bg-muted/30 border-b">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {notes.map((note, i) => (
              <span key={i} className="inline-block">
                {note}
                {i < notes.length - 1 && ' • '}
              </span>
            ))}
          </p>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div
            className="prose dark:prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
            aria-label="Preview"
          />
        </div>
      </ScrollArea>
    </div>
  );
}
