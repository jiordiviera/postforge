"use client";

import { useState, useEffect, useCallback } from "react";
import { Editor } from "@/components/editor/Editor";
import { Toolbar } from "@/components/editor/Toolbar";
import { PreviewPane } from "@/components/editor/PreviewPane";
import { PresetSelector } from "@/components/editor/PresetSelector";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Copy, Check } from "lucide-react";
import {
  convert,
  type PresetType,
  type ConverterResult,
} from "@/core/converter";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
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
      console.error("Failed to copy text:", error);
    }
  }, [result]);

  const handleInsert = useCallback((before: string, after: string) => {
    // Insert at current cursor position or at end
    setMarkdown((prev) => prev + before + after);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">PostForge</h1>
          <div className="flex items-center gap-3">
            <PresetSelector value={preset} onChange={setPreset} />
            <Toggle
              pressed={whatsappEnabled}
              onPressedChange={setWhatsappEnabled}
              aria-label="Toggle WhatsApp preprocessing"
              size="sm"
            >
              WhatsApp
            </Toggle>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="border-b bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h2 className="text-4xl font-bold mb-3">LinkedIn Text Formatter</h2>
          <p className="text-lg text-muted-foreground">
            Format your LinkedIn text with bold, italic and more styles!
          </p>
        </div>
      </div>

      {/* Main Content - Single Column Centered */}
      <main className="flex-1 bg-muted/20 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr),400px] gap-8">
            {/* Editor Section */}
            <div>
              <div className="bg-background rounded-2xl border shadow-lg overflow-hidden">
                <Toolbar onInsert={handleInsert} />
                <div className="h-[600px]">
                  <Editor
                    value={markdown}
                    onChange={setMarkdown}
                    onCopy={handleCopyText}
                    placeholder="Write your post..."
                  />
                </div>
                <div className="border-t px-6 py-4 flex items-center gap-3">
                  <Button
                    onClick={handleCopyText}
                    variant="default"
                    size="lg"
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

            {/* Preview Section - LinkedIn Card Style */}
            <ScrollArea className="h-full lg:sticky lg:top-24">
              <div className="bg-background rounded-2xl border shadow-lg overflow-hidden">
                <div className="border-b px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      U
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">Your Name</p>
                      <p className="text-sm text-muted-foreground">
                        Growth @ PostForge
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Now • <span className="text-xs">🌍</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="max-h-[600px]">
                  <PreviewPane
                    html={
                      result?.html ||
                      '<p class="text-muted-foreground">Start typing to see preview...</p>'
                    }
                    notes={result?.preset?.notes}
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
}
