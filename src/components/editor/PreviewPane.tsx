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
        <div className="px-4 py-2 bg-muted/50 border-b">
          <p className="text-xs text-muted-foreground">
            {notes.map((note, i) => (
              <span key={i}>
                {note}
                {i < notes.length - 1 && ' • '}
              </span>
            ))}
          </p>
        </div>
      )}
      <ScrollArea className="flex-1">
        <Card className="m-4 p-6 border-0 shadow-none">
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
            aria-label="Preview"
          />
        </Card>
      </ScrollArea>
    </div>
  );
}
