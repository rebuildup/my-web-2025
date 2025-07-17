import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ColorPalette from '../components/ColorPalette';
import ToolUsageTracker from '../components/ToolUsageTracker';

export const metadata: Metadata = {
  title: 'Color Palette Generator | Tools | samuido',
  description: 'Create harmonious color palettes with HEX, RGB, and HSL color formats',
};

export default function ColorPalettePage() {
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
          Color Palette Generator
        </h1>
        <p className="noto-sans-jp text-foreground/70">カラーパレットジェネレーター</p>
      </div>

      <div className="mx-auto max-w-4xl">
        <ToolUsageTracker toolId="color-palette" />
        <ColorPalette />

        <div className="border-foreground/10 text-foreground/70 mt-8 border-t pt-6 text-sm">
          <h2 className="text-foreground mb-2 text-base font-medium">About this tool</h2>
          <p className="mb-2">
            This color palette generator helps you create harmonious color schemes based on color
            theory. Choose a base color and harmony type to generate a palette, then export it in
            various formats for use in your projects.
          </p>
          <p className="mb-2">
            You can save your favorite palettes for future reference, and they will be stored in
            your browser.
          </p>
          <p>All processing is done in your browser - your color data is never sent to a server.</p>
        </div>
      </div>
    </div>
  );
}
