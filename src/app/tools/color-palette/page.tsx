import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import ColorPaletteGenerator from "./components/ColorPaletteGenerator";

export const metadata = {
  title: "Color Palette Generator",
  description:
    "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。",
  keywords: "カラーパレット, 色生成, デザイン, ランダム色, 色域設定, CSS変数",
  robots: "index, follow",
  canonical: "https://yusuke-kim.com/tools/color-palette",
  openGraph: {
    title: "Color Palette Generator - samuido | カラーパレット生成",
    description:
      "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。",
    type: "website",
    url: "https://yusuke-kim.com/tools/color-palette",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Palette Generator - samuido | カラーパレット生成",
    description:
      "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。",
    creator: "@361do_sleep",
  },
};

export default function ColorPalettePage() {
  return (
    <>
      <div className="container-system pt-10 pb-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Color Palette Generator", isCurrent: true },
          ]}
        />
      </div>
      <ColorPaletteGenerator />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Color Palette Generator",
            description: "色域を指定してランダムにカラーパレットを生成",
            url: "https://yusuke-kim.com/tools/color-palette",
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
