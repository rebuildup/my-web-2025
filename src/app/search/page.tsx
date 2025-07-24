import { Metadata } from "next";
import { Suspense } from "react";
import SearchPage from "./components/SearchPage";

export const metadata: Metadata = {
  title: "Search - samuido | サイト内検索",
  description:
    "samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。",
  keywords: [
    "検索",
    "サイト内検索",
    "ポートフォリオ",
    "プロフィール",
    "ツール",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/search",
  },
  openGraph: {
    title: "Search - samuido | サイト内検索",
    description:
      "samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。",
    type: "website",
    url: "https://yusuke-kim.com/search",
    images: [
      {
        url: "https://yusuke-kim.com/search-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Search - samuido | サイト内検索",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search - samuido | サイト内検索",
    description:
      "samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。",
    images: ["https://yusuke-kim.com/search-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

export default function Search() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container-system py-ratio-lg">
        <header className="mb-ratio-lg">
          <h1 className="neue-haas-grotesk-display text-ratio-xl text-primary mb-ratio-sm">
            Search
          </h1>
          <p className="noto-sans-jp-light text-ratio-base opacity-80">
            サイト内のコンテンツを検索できます
          </p>
        </header>
        <div className="text-center py-ratio-lg">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-ratio-sm noto-sans-jp-light text-ratio-sm">
            読み込み中...
          </p>
        </div>
      </div>
    </div>
  );
}
