import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Estimate Calculator - samuido | 映像制作見積もり計算機",
  description:
    "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。",
  keywords: [
    "映像制作",
    "見積もり",
    "料金計算",
    "動画制作",
    "編集",
    "価格",
    "自動計算",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/about/commission/estimate",
  },
  openGraph: {
    title: "Video Estimate Calculator - samuido | 映像制作見積もり計算機",
    description:
      "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。",
    type: "website",
    url: "https://yusuke-kim.com/about/commission/estimate",
    images: [
      {
        url: "https://yusuke-kim.com/about/commission-estimate-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Video Estimate Calculator - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Estimate Calculator - samuido | 映像制作見積もり計算機",
    description:
      "映像制作の見積もりを自動計算。動画の長さ、品質、編集内容に応じてリアルタイムで料金を算出。",
    images: [
      "https://yusuke-kim.com/about/commission-estimate-twitter-image.jpg",
    ],
    creator: "@361do_design",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "samuido Video Estimate Calculator",
  description: "映像制作の見積もりを自動計算するアプリケーション",
  url: "https://yusuke-kim.com/about/commission/estimate",
  applicationCategory: "BusinessApplication",
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

export default function EstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
