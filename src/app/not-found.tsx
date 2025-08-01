"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="flex items-center gap-3 text-foreground noto-sans-jp-regular text-base leading-loose focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background px-6 py-4"
    >
      <ArrowLeft className="w-5 h-5" />
      Back
    </button>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="min-h-screen flex items-center justify-center py-20">
        <div className="container-system text-center">
          <div className="space-y-4">
            <header>
              <h1 className="neue-haas-grotesk-display text-8xl text-primary leading-relaxed px-6">
                404
              </h1>
              <h2 className="zen-kaku-gothic-new text-3xl text-foreground leading-loose px-4 py-3">
                ページが見つかりません
              </h2>
              <p className="noto-sans-jp-light text-sm leading-loose max-w mx-auto px-6">
                お探しのページは存在しないか、移動または削除された可能性があります.
                <br />
                サイトトップページからお探しください.
              </p>
            </header>
            <nav className="flex justify-center gap-16">
              <BackButton />
              <Link
                href="/"
                className="flex items-center gap-3 text-foreground noto-sans-jp-regular text-base leading-loose focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background px-6 py-4"
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
            </nav>
          </div>
        </div>
      </main>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "404 Error Page",
            description: "ページが見つかりません",
            url: "https://yusuke-kim.com/404",
            mainEntity: {
              "@type": "Article",
              name: "ページが見つかりません",
              description: "お探しのページは存在しません",
            },
          }),
        }}
      />
    </div>
  );
}
