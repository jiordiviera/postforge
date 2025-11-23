'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Code,
  List,
  Link as LinkIcon,
} from 'lucide-react';

interface ToolbarProps {
  onInsert: (before: string, after: string) => void;
}

export function Toolbar({ onInsert }: ToolbarProps) {
  const tools = [
    {
      icon: Bold,
      label: 'Bold',
      shortcut: 'Ctrl+B',
      before: '**',
      after: '**',
    },
    {
      icon: Italic,
      label: 'Italic',
      shortcut: 'Ctrl+I',
      before: '*',
      after: '*',
    },
    {
      icon: Code,
      label: 'Code',
      shortcut: 'Ctrl+Shift+C',
      before: '`',
      after: '`',
    },
    {
      icon: List,
      label: 'List',
      shortcut: null,
      before: '- ',
      after: '',
    },
    {
      icon: LinkIcon,
      label: 'Link',
      shortcut: null,
      before: '[',
      after: '](url)',
    },
  ];

  return (
    <TooltipProvider>
      <div
        className="flex items-center gap-1 px-4 py-2 border-b bg-background"
        role="toolbar"
        aria-label="Formatting toolbar"
      >
        {tools.map((tool, index) => (
          <div key={tool.label} className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onInsert(tool.before, tool.after)}
                  aria-label={tool.label}
                  className="h-8 w-8 p-0"
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {tool.label}
                  {tool.shortcut && (
                    <span className="ml-2 text-muted-foreground text-xs">
                      {tool.shortcut}
                    </span>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
            {index === 2 && <Separator orientation="vertical" className="mx-1 h-6" />}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
