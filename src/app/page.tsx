"use client";

import { useState, useEffect, useCallback } from "react";
import { Editor } from "@/components/editor/Editor";
import { Toolbar } from "@/components/editor/Toolbar";
import { PreviewPane } from "@/components/editor/PreviewPane";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import {
  convert,
  type PresetType,
  type ConverterResult,
} from "@/core/converter";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [result, setResult] = useState<ConverterResult | null>(null);
  const [preset] = useState<PresetType | null>("linkedin");
  const [copiedText, setCopiedText] = useState(false);

  // Convert markdown whenever it changes
  useEffect(() => {
    const convertMarkdown = async () => {
      if (!markdown) {
        setResult(null);
        return;
      }

      const converted = await convert(markdown, {
        preset: preset || undefined,
      });

      setResult(converted);
    };

    convertMarkdown();
  }, [markdown, preset]);

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
        </div>
      </header>

      {/* Hero Section */}
      <div className="border-b bg-background">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          <h2 className="text-2xl font-bold mb-1">LinkedIn Text Formatter</h2>
          <p className="text-sm text-muted-foreground">
            Format your LinkedIn text with bold, italic and more styles!
          </p>
        </div>
      </div>

      {/* Main Content - Single Column Centered */}
      <main className="flex-1 bg-muted/20 py-4">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-5">
            {/* Editor Section */}
            <div>
              <div className="bg-background rounded-lg border shadow overflow-hidden">
                <Toolbar onInsert={handleInsert} />
                <div className="h-[380px]">
                  <Editor
                    value={markdown}
                    onChange={setMarkdown}
                    onCopy={handleCopyText}
                    placeholder="Write your post..."
                  />
                </div>
                <div className="border-t px-4 py-2.5 flex items-center gap-3">
                  <Button
                    onClick={handleCopyText}
                    variant="default"
                    size="sm"
                    className="gap-2"
                    disabled={!result?.markdown}
                  >
                    {copiedText ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Section - LinkedIn Card Style */}
            <div className="w-[340px]">
              <div className="bg-background rounded-lg border shadow overflow-hidden sticky top-24 flex flex-col ">
                <div className="border-b px-3 py-2.5 shrink-0">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                      U
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs">Jiordi Viera</p>
                      <p className="text-[11px] text-muted-foreground">
                        Growth @ PostForge
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        Now • <span className="text-[10px]">🌍</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <PreviewPane
                    html={
                      result?.html ||
                      '<p class="text-muted-foreground">Start typing to see preview...</p>'
                    }
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
