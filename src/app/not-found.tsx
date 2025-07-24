"use client";

import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors noto-sans-jp-regular text-ratio-sm"
    >
      <ArrowLeft className="w-4 h-4" />
      前のページに戻る
    </button>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="container-system text-center">
        <div className="max-w-2xl mx-auto">
          {/* Error Code */}
          <div className="mb-ratio-lg">
            <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-ratio-sm">
              404
            </h1>
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              ページが見つかりません
            </h2>
            <p className="noto-sans-jp-light text-ratio-base opacity-80 leading-ratio-tight">
              お探しのページは存在しないか、移動または削除された可能性があります。
              <br />
              サイトトップページからお探しください。
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-1 sm:grid-2 gap-ratio-sm mb-ratio-lg">
            {/* Home Button */}
            <Link
              href="/"
              className="group flex items-center justify-center gap-ratio-xs bg-primary text-background px-ratio-base py-ratio-sm hover:bg-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="noto-sans-jp-regular text-ratio-base">
                ホームに戻る
              </span>
            </Link>

            {/* Search Button */}
            <Link
              href="/search"
              className="group flex items-center justify-center gap-ratio-xs border border-foreground text-foreground px-ratio-base py-ratio-sm hover:bg-foreground hover:text-background transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="noto-sans-jp-regular text-ratio-base">
                サイト内検索
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="border-t border-foreground pt-ratio-lg">
            <p className="noto-sans-jp-light text-ratio-sm opacity-60 mb-ratio-sm">
              または、以下のページをご覧ください：
            </p>
            <nav className="flex flex-wrap justify-center gap-ratio-sm">
              <Link
                href="/about"
                className="text-primary hover:underline noto-sans-jp-regular text-ratio-sm transition-colors"
              >
                About
              </Link>
              <span className="opacity-40">|</span>
              <Link
                href="/portfolio"
                className="text-primary hover:underline noto-sans-jp-regular text-ratio-sm transition-colors"
              >
                Portfolio
              </Link>
              <span className="opacity-40">|</span>
              <Link
                href="/workshop"
                className="text-primary hover:underline noto-sans-jp-regular text-ratio-sm transition-colors"
              >
                Workshop
              </Link>
              <span className="opacity-40">|</span>
              <Link
                href="/tools"
                className="text-primary hover:underline noto-sans-jp-regular text-ratio-sm transition-colors"
              >
                Tools
              </Link>
              <span className="opacity-40">|</span>
              <Link
                href="/contact"
                className="text-primary hover:underline noto-sans-jp-regular text-ratio-sm transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Back Button */}
          <div className="mt-ratio-lg pt-ratio-lg border-t border-foreground">
            <BackButton />
          </div>
        </div>
      </div>

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
