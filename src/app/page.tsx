'use client';

import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@/components/editor/Editor';
import { Toolbar } from '@/components/editor/Toolbar';
import { PreviewPane } from '@/components/editor/PreviewPane';
import { PresetSelector } from '@/components/editor/PresetSelector';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              PostForge
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              pressed={whatsappEnabled}
              onPressedChange={setWhatsappEnabled}
              aria-label="Toggle WhatsApp preprocessing"
              size="sm"
            >
              WhatsApp
            </Toggle>
            <PresetSelector value={preset} onChange={setPreset} />
          </div>
        </div>
      </header>

      {/* Main Content - Centered Layout */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">LinkedIn Text Formatter</h2>
            <p className="text-muted-foreground">
              Format your LinkedIn text with bold, italic and more styles!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Section */}
            <div className="space-y-4">
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <Toolbar onInsert={handleInsert} />
                <div className="h-[500px]">
                  <Editor
                    value={markdown}
                    onChange={setMarkdown}
                    onCopy={handleCopyText}
                    placeholder="Write your post..."
                  />
                </div>
                <div className="border-t p-4 flex items-center justify-between bg-muted/30">
                  <Button
                    onClick={handleCopyText}
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
                        Copy post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                      U
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Your Name</p>
                      <p className="text-xs text-muted-foreground">Growth @ PostForge</p>
                      <p className="text-xs text-muted-foreground">Now</p>
                    </div>
                  </div>
                </div>
                <div className="h-[500px]">
                  <PreviewPane
                    html={result?.html || '<p class="text-muted-foreground">Start typing to see preview...</p>'}
                    notes={result?.preset?.notes}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
