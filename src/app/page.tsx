'use client';

import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@/components/editor/Editor';
import { Toolbar } from '@/components/editor/Toolbar';
import { PreviewPane } from '@/components/editor/PreviewPane';
import { PresetSelector } from '@/components/editor/PresetSelector';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Copy, Check } from 'lucide-react';
import { convert, type PresetType, type ConverterResult } from '@/core/converter';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [result, setResult] = useState<ConverterResult | null>(null);
  const [preset, setPreset] = useState<PresetType | null>(null);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Convert markdown whenever it changes
  useEffect(() => {
    const convertMarkdown = async () => {
      if (!markdown) {
        setResult(null);
        return;
      }

      const converted = await convert(markdown, {
        preprocess: { enabled: whatsappEnabled },
        preset: preset || undefined,
      });

      setResult(converted);
    };

    convertMarkdown();
  }, [markdown, preset, whatsappEnabled]);

  const handleCopyText = useCallback(async () => {
    if (!result?.markdown) return;

    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [result]);

  const handleInsert = useCallback(
    (before: string, after: string) => {
      // Insert at current cursor position or at end
      setMarkdown((prev) => prev + before + after);
    },
    []
  );
  

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b h-14 flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">PostForge</h1>
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            pressed={whatsappEnabled}
            onPressedChange={setWhatsappEnabled}
            aria-label="Toggle WhatsApp preprocessing"
            size="sm"
          >
            WhatsApp
          </Toggle>
          <Separator orientation="vertical" className="h-6" />
          <PresetSelector value={preset} onChange={setPreset} />
          <Separator orientation="vertical" className="h-6" />
          <Button
            onClick={handleCopyText}
            size="sm"
            variant="default"
            className="gap-2"
            disabled={!result?.markdown}
          >
            {copiedText ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col border-r">
          <Toolbar onInsert={handleInsert} />
          <Editor
            value={markdown}
            onChange={setMarkdown}
            onCopy={handleCopyText}
          />
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col bg-muted/30">
          <div className="h-12 border-b flex items-center px-4 bg-background">
            <h2 className="text-sm font-medium text-muted-foreground">
              Preview
            </h2>
          </div>
          <PreviewPane
            html={result?.html || '<p class="text-muted-foreground">Start typing to see preview...</p>'}
            notes={result?.preset?.notes}
          />
        </div>
      </div>
    </div>
  );
}
