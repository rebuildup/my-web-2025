import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BusinessMailBlocker from '../components/BusinessMailBlocker';
import ToolUsageTracker from '../components/ToolUsageTracker';

export const metadata: Metadata = {
  title: 'Business Mail Blocker | Tools | samuido',
  description: 'Filter and categorize email addresses based on business domains',
};

export default function BusinessMailBlockerPage() {
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
          Business Mail Blocker
        </h1>
        <p className="noto-sans-jp text-foreground/70">ビジネスメールブロッカー</p>
      </div>

      <div className="mx-auto max-w-4xl">
        <ToolUsageTracker toolId="business-mail-blocker" />
        <BusinessMailBlocker />

        <div className="border-foreground/10 text-foreground/70 mt-8 border-t pt-6 text-sm">
          <h2 className="text-foreground mb-2 text-base font-medium">About this tool</h2>
          <p className="mb-2">
            This tool helps you identify and filter business email addresses from personal ones.
            It&apos;s useful for separating professional contacts from personal ones, or for
            filtering out business emails when sending personal communications.
          </p>
          <p className="mb-2">
            The tool analyzes email domains and patterns to determine if an email is likely to be a
            business address. You can upload a list of emails or enter them manually, then export
            the filtered results.
          </p>
          <p>All processing is done in your browser - your email data is never sent to a server.</p>
        </div>
      </div>
    </div>
  );
}
