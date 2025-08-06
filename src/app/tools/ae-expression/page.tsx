import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import AEExpressionTool from "./components/AEExpressionTool";

export const metadata = {
  title: "AE Expression Tool",
  description:
    "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。",
  keywords:
    "AfterEffects, エクスプレッション, アニメーション, エフェクト, Scratch, ブロックUI",
  robots: "index, follow",
  canonical: "https://yusuke-kim.com/tools/ae-expression",
  openGraph: {
    title: "AE Expression Tool - samuido | AfterEffects エクスプレッション",
    description:
      "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。",
    type: "website",
    url: "https://yusuke-kim.com/tools/ae-expression",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "AE Expression Tool - samuido | AfterEffects エクスプレッション",
    description:
      "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。",
    creator: "@361do_sleep",
  },
};

export default function AEExpressionPage() {
  return (
    <>
      <div className="container-system pt-10 pb-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "After Effects Expression Helper", isCurrent: true },
          ]}
        />
      </div>
      <AEExpressionTool />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "AE Expression Tool",
            description:
              "AfterEffectsのエクスプレッションをScratch風ブロックUIで設定",
            url: "https://yusuke-kim.com/tools/ae-expression",
            applicationCategory: "DesignApplication",
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
          }),
        }}
      />
    </>
  );
}
