import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshop - samuido | プラグイン・ブログ・素材配布",
  description:
    "AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。",
  keywords: [
    "AfterEffects",
    "プラグイン",
    "技術記事",
    "素材配布",
    "チュートリアル",
    "ブログ",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Workshop - samuido | プラグイン・ブログ・素材配布",
    description:
      "AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。",
    type: "website",
    url: "https://yusuke-kim.com/workshop",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Workshop - samuido | プラグイン・ブログ・素材配布",
    description:
      "AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。",
    creator: "@361do_sleep",
  },
};

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
