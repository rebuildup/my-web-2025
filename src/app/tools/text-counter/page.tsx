import { Metadata } from "next";
import TextCounterTool from "./components/TextCounterTool";

export const metadata: Metadata = {
  title: "Text Counter - samuido | 文字数カウンター",
  description:
    "テキストの文字数を詳細にカウント。総文字数、単語数、行数、文字種別など豊富な統計情報を提供。",
  keywords: [
    "文字数カウンター",
    "テキスト統計",
    "文字数",
    "単語数",
    "行数",
    "文字種別",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Text Counter - samuido | 文字数カウンター",
    description:
      "テキストの文字数を詳細にカウント。総文字数、単語数、行数、文字種別など豊富な統計情報を提供。",
    type: "website",
    url: "https://yusuke-kim.com/tools/text-counter",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Text Counter - samuido | 文字数カウンター",
    description:
      "テキストの文字数を詳細にカウント。総文字数、単語数、行数、文字種別など豊富な統計情報を提供。",
    creator: "@361do_sleep",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Text Counter",
  description: "テキストの文字数を詳細にカウントするツール",
  url: "https://yusuke-kim.com/tools/text-counter",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web Browser",
  author: {
    "@type": "Person",
    name: "木村友亮",
    alternateName: "samuido",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
};

export default function TextCounterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-system">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Text Counter</h1>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              テキストの文字数を詳細にカウント。総文字数、単語数、行数、文字種別など豊富な統計情報を提供します。
            </p>
          </div>

          <TextCounterTool />
        </div>
      </div>
    </>
  );
}
