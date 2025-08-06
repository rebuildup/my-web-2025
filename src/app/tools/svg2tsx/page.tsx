import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Metadata } from "next";
import { SVGToTSXConverter } from "./components/SVGToTSXConverter";

export const metadata: Metadata = {
  title: "SVG to TSX Converter - samuido | SVG React変換",
  description:
    "SVG画像をReactコンポーネント（TSX）に変換。TypeScript対応で最適化されたコードを生成。",
  keywords: "SVG, TSX, React, 変換, TypeScript, コンポーネント, コード生成",
  robots: "index, follow",
  openGraph: {
    title: "SVG to TSX Converter - samuido | SVG React変換",
    description:
      "SVG画像をReactコンポーネント（TSX）に変換。TypeScript対応で最適化されたコードを生成。",
    type: "website",
    url: "https://yusuke-kim.com/tools/svg2tsx",
    images: [
      {
        url: "https://yusuke-kim.com/tools/svg2tsx-og-image.png",
        width: 1200,
        height: 630,
        alt: "SVG to TSX Converter",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "SVG to TSX Converter - samuido | SVG React変換",
    description:
      "SVG画像をReactコンポーネント（TSX）に変換。TypeScript対応で最適化されたコードを生成。",
    images: ["https://yusuke-kim.com/tools/svg2tsx-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SVG to TSX Converter",
  description: "SVG画像をReactコンポーネントに変換",
  url: "https://yusuke-kim.com/tools/svg2tsx",
  applicationCategory: "DeveloperApplication",
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

export default function SVGToTSXPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-system pt-10 pb-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "SVG to TSX Converter", isCurrent: true },
          ]}
        />
      </div>
      <SVGToTSXConverter />
    </>
  );
}
