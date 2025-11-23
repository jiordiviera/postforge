"use client";

import { useState, useEffect, useCallback } from "react";
import { Editor } from "@/components/editor/Editor";
import { Toolbar } from "@/components/editor/Toolbar";
import { PreviewPane } from "@/components/editor/PreviewPane";
import { Button } from "@/components/ui/button";
import { Copy, Check, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handlePublish = useCallback((platform: 'linkedin' | 'x') => {
    if (!result?.markdown) return;

    // LinkedIn - Open LinkedIn share dialog with text pre-filled
    if (platform === 'linkedin') {
      const text = encodeURIComponent(result.markdown);
      const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${text}`;
      window.open(linkedinUrl, '_blank');
    }

    // X (Twitter) Intent URL with text pre-filled
    if (platform === 'x') {
      const text = encodeURIComponent(result.markdown);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
      window.open(twitterUrl, '_blank', 'width=600,height=600');
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2 bg-[#0ea5e9] hover:bg-[#0284c7]"
                        disabled={!result?.markdown}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Publish now
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handlePublish('linkedin')}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Publish on LinkedIn
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublish('x')}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Publish on X
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    onClick={handleCopyText}
                    variant="outline"
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
