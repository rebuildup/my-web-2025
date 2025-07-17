'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import ToolUsageTracker from '../components/ToolUsageTracker';

// Use dynamic import for QRCodeGenerator to avoid SSR issues with browser-only APIs
const QRCodeGenerator = dynamic(() => import('../components/QRCodeGenerator'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
    </div>
  ),
});

export default function QRCodePage() {
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
          QR Code Generator
        </h1>
        <p className="noto-sans-jp text-foreground/70">QRコードジェネレーター</p>
      </div>

      <div className="mx-auto max-w-4xl">
        <ToolUsageTracker toolId="qr-code" />
        <QRCodeGenerator />

        <div className="border-foreground/10 text-foreground/70 mt-8 border-t pt-6 text-sm">
          <h2 className="text-foreground mb-2 text-base font-medium">About this tool</h2>
          <p className="mb-2">
            This QR code generator allows you to create customizable QR codes for websites, text,
            contact information, and more. You can adjust the size, error correction level, colors,
            and even add your own logo.
          </p>
          <p className="mb-2">
            Higher error correction levels make the QR code more resistant to damage or poor
            scanning conditions, but also make the code more complex.
          </p>
          <p>All processing is done in your browser - your data is never sent to a server.</p>
        </div>
      </div>
    </div>
  );
}
