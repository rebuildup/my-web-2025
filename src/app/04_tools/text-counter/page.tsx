import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TextCounter from '../components/TextCounter';
import ToolUsageTracker from '../components/ToolUsageTracker';

export const metadata: Metadata = {
  title: 'Text Counter | Tools | samuido',
  description: 'Count characters, words, sentences, and more in your text',
};

export default function TextCounterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/04_tools"
          className="text-foreground/70 hover:text-primary inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Tools
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h1 className="neue-haas-grotesk-display text-foreground mb-2 text-3xl font-bold">
          Text Counter
        </h1>
        <p className="noto-sans-jp text-foreground/70">テキストカウンター</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <ToolUsageTracker toolId="text-counter" />
        <TextCounter />

        <div className="border-foreground/10 text-foreground/70 mt-8 border-t pt-6 text-sm">
          <h2 className="text-foreground mb-2 text-base font-medium">About this tool</h2>
          <p className="mb-2">
            This text counter tool helps you analyze your text by counting characters, words,
            sentences, paragraphs, and more. It also estimates reading time based on different
            reading speeds.
          </p>
          <p>All processing is done in your browser - your text is never sent to a server.</p>
        </div>
      </div>
    </div>
  );
}
