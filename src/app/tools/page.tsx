import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import Link from "next/link";
import { AccessibilityTestingComponent } from "./components/AccessibilityTester";

export const metadata = {
  title: "Tools - samuido | 実用的なWebツール集",
  description:
    "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。",
  keywords:
    "Webツール, カラーパレット, QRコード, ポモドーロ, タイピングゲーム, 実用ツール",
  robots: "index, follow",
  canonical: "https://yusuke-kim.com/tools",
  openGraph: {
    title: "Tools - samuido | 実用的なWebツール集",
    description:
      "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。",
    type: "website",
    url: "https://yusuke-kim.com/tools",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools - samuido | 実用的なWebツール集",
    description:
      "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。",
    creator: "@361do_sleep",
  },
};

// Tool definitions with categories and accessibility features
const tools = [
  {
    id: "color-palette",
    title: "Color Palette Generator",
    description: "HSV色域指定でランダムカラーパレット生成・保存・エクスポート",
    category: "design",
    href: "/tools/color-palette",
    keyboardShortcut: "C",
    ariaLabel: "カラーパレット生成ツール - デザイナー向け色彩ツール",
  },
  {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "URL・テキストからQRコード生成・カスタマイズ・ダウンロード",
    category: "utility",
    href: "/tools/qr-generator",
    keyboardShortcut: "Q",
    ariaLabel: "QRコード生成ツール - URL・テキストをQRコードに変換",
  },
  {
    id: "text-counter",
    title: "Text Counter",
    description: "多言語対応テキスト解析・文字数・単語数・行数カウント",
    category: "text",
    href: "/tools/text-counter",
    keyboardShortcut: "T",
    ariaLabel: "テキストカウンター - 文字数・単語数・行数を解析",
  },
  {
    id: "svg2tsx",
    title: "SVG to TSX Converter",
    description: "SVG画像・コードをReact TSXコンポーネントに変換・ダウンロード",
    category: "development",
    href: "/tools/svg2tsx",
    keyboardShortcut: "S",
    ariaLabel: "SVG to TSX変換ツール - React開発者向けコンポーネント生成",
  },
  {
    id: "sequential-png-preview",
    title: "Sequential PNG Preview",
    description: "連番PNG・フォルダ・ZIPファイルのアニメーションプレビュー",
    category: "media",
    href: "/tools/sequential-png-preview",
    keyboardShortcut: "P",
    ariaLabel: "連番PNGプレビューツール - アニメーション確認ツール",
  },
  {
    id: "pomodoro",
    title: "Pomodoro Timer",
    description: "カスタマイズ可能なポモドーロタイマー・通知・統計機能",
    category: "productivity",
    href: "/tools/pomodoro",
    keyboardShortcut: "M",
    ariaLabel: "ポモドーロタイマー - 集中力向上のための時間管理ツール",
  },
  {
    id: "pi-game",
    title: "Pi Memory Game",
    description: "円周率記憶ゲーム・テンキー操作・スコア記録・学習機能",
    category: "game",
    href: "/tools/pi-game",
    keyboardShortcut: "G",
    ariaLabel: "円周率記憶ゲーム - 数学学習・記憶力トレーニング",
  },
  {
    id: "business-mail-block",
    title: "Business Mail Builder",
    description: "ビジネスメールテンプレート・ブロック組み合わせ・自動生成",
    category: "business",
    href: "/tools/business-mail-block",
    keyboardShortcut: "B",
    ariaLabel:
      "ビジネスメール作成ツール - プロフェッショナルなメールテンプレート",
  },
  {
    id: "ae-expression",
    title: "After Effects Expression Helper",
    description: "AfterEffectsエクスプレッション・パラメータ設定・コピー機能",
    category: "video",
    href: "/tools/ae-expression",
    keyboardShortcut: "A",
    ariaLabel: "After Effectsエクスプレッションヘルパー - 映像制作支援ツール",
  },
  {
    id: "ProtoType",
    title: "ProtoType Typing Game",
    description: "PIXI.js タイピングゲーム・WPM測定・スコア記録・GitHub連携",
    category: "game",
    href: "/tools/ProtoType",
    keyboardShortcut: "Y",
    ariaLabel: "ProtoTypeタイピングゲーム - タイピング練習・スキル向上",
  },
];

const categories = [
  { id: "all", name: "All Tools", count: tools.length },
  {
    id: "design",
    name: "Design",
    count: tools.filter((t) => t.category === "design").length,
  },
  {
    id: "development",
    name: "Development",
    count: tools.filter((t) => t.category === "development").length,
  },
  {
    id: "utility",
    name: "Utility",
    count: tools.filter((t) => t.category === "utility").length,
  },
  {
    id: "text",
    name: "Text",
    count: tools.filter((t) => t.category === "text").length,
  },
  {
    id: "media",
    name: "Media",
    count: tools.filter((t) => t.category === "media").length,
  },
  {
    id: "productivity",
    name: "Productivity",
    count: tools.filter((t) => t.category === "productivity").length,
  },
  {
    id: "business",
    name: "Business",
    count: tools.filter((t) => t.category === "business").length,
  },
  {
    id: "video",
    name: "Video",
    count: tools.filter((t) => t.category === "video").length,
  },
  {
    id: "game",
    name: "Game",
    count: tools.filter((t) => t.category === "game").length,
  },
];

export default function ToolsPage() {
  // Design system classes following root page patterns
  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background hover:bg-background transition-colors";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
  const Stats_number = "neue-haas-grotesk-display text-2xl text-accent";
  const Stats_label = "noto-sans-jp-light text-xs";
  const Section_title = "neue-haas-grotesk-display text-2xl text-primary mb-6";
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Tools", isCurrent: true },
                ]}
              />
            </div>
            <header className="space-y-6">
              <h1 className="neue-haas-grotesk-display text-4xl text-primary">
                Tools
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                実用的なWebツールのコレクション。すべて無償で提供しています。
                <br />
                デザイン・開発・生産性向上・エンターテイメントまで、幅広い用途に対応。
                オフライン動作・アクセシビリティ対応・レスポンシブデザイン完備。
              </p>
            </header>

            {/* Statistics Section */}
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                統計情報
              </h2>
              <div className="grid-system grid-2 xs:grid-2 sm:grid-4 gap-6">
                <div className="bg-base border border-foreground p-4 text-center">
                  <div className={Stats_number}>{tools.length}</div>
                  <div className={Stats_label}>利用可能ツール</div>
                </div>
                <div className="bg-base border border-foreground p-4 text-center">
                  <div className={Stats_number}>{categories.length - 1}</div>
                  <div className={Stats_label}>カテゴリ</div>
                </div>
                <div className="bg-base border border-foreground p-4 text-center">
                  <div className={Stats_number}>100%</div>
                  <div className={Stats_label}>無償提供</div>
                </div>
                <div className="bg-base border border-foreground p-4 text-center">
                  <div className={Stats_number}>WCAG</div>
                  <div className={Stats_label}>AA準拠</div>
                </div>
              </div>
            </section>

            {/* Category Filter */}
            <section aria-labelledby="categories-heading">
              <h2 id="categories-heading" className={Section_title}>
                Categories
              </h2>
              <div className="grid-system grid-2 xs:grid-3 sm:grid-5 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-base border border-foreground p-3 text-center"
                    role="button"
                    tabIndex={0}
                    aria-label={`${category.name}カテゴリ - ${category.count}個のツール`}
                  >
                    <div className="neue-haas-grotesk-display text-lg text-primary">
                      {category.name}
                    </div>
                    <div className="noto-sans-jp-light text-xs text-accent">
                      {category.count} tools
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tools Grid */}
            <section aria-labelledby="tools-heading">
              <h2 id="tools-heading" className={Section_title}>
                Available Tools
              </h2>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-6">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className={CardStyle}
                    aria-label={tool.ariaLabel}
                    data-keyboard-shortcut={tool.keyboardShortcut}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className={Card_title}>{tool.title}</h3>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs text-accent uppercase">
                          {tool.category}
                        </span>
                        <kbd className="text-xs bg-background border border-foreground px-2 py-1">
                          {tool.keyboardShortcut}
                        </kbd>
                      </div>
                    </div>
                    <p className={Card_description}>{tool.description}</p>
                    <div className="pt-2">
                      <span className="noto-sans-jp-light text-xs text-accent">
                        オフライン対応・アクセシビリティ準拠
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Accessibility Features */}
            <section aria-labelledby="accessibility-heading">
              <h2 id="accessibility-heading" className={Section_title}>
                Accessibility Features
              </h2>
              <div className="bg-base border border-foreground p-6">
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="neue-haas-grotesk-display text-lg text-primary">
                      Keyboard Navigation
                    </h3>
                    <p className="noto-sans-jp-light text-sm">
                      全ツールでキーボードナビゲーション対応。
                      ショートカットキーで素早くアクセス可能。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="neue-haas-grotesk-display text-lg text-primary">
                      Screen Reader Support
                    </h3>
                    <p className="noto-sans-jp-light text-sm">
                      スクリーンリーダー完全対応。 ARIA
                      ラベル・セマンティックHTML使用。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="neue-haas-grotesk-display text-lg text-primary">
                      WCAG 2.1 AA Compliance
                    </h3>
                    <p className="noto-sans-jp-light text-sm">
                      色彩コントラスト・フォーカス管理・
                      テキストスケーリング対応。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Usage Instructions */}
            <section aria-labelledby="usage-heading">
              <h2 id="usage-heading" className={Section_title}>
                How to Use
              </h2>
              <div className="bg-base border border-foreground p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="neue-haas-grotesk-display text-lg text-accent">
                      1.
                    </span>
                    <div>
                      <h3 className="neue-haas-grotesk-display text-lg text-primary">
                        ツールを選択
                      </h3>
                      <p className="noto-sans-jp-light text-sm">
                        上記のツール一覧から使用したいツールをクリック、
                        またはキーボードショートカット（表示されているキー）を使用。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="neue-haas-grotesk-display text-lg text-accent">
                      2.
                    </span>
                    <div>
                      <h3 className="neue-haas-grotesk-display text-lg text-primary">
                        オフライン使用可能
                      </h3>
                      <p className="noto-sans-jp-light text-sm">
                        すべてのツールはローカル処理。
                        インターネット接続不要で安全・高速に動作。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="neue-haas-grotesk-display text-lg text-accent">
                      3.
                    </span>
                    <div>
                      <h3 className="neue-haas-grotesk-display text-lg text-primary">
                        無償・無制限利用
                      </h3>
                      <p className="noto-sans-jp-light text-sm">
                        すべてのツールは完全無償。
                        利用制限なし・アカウント登録不要。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <nav aria-label="Site navigation">
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <Link
                  href="/search"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Search</span>
                </Link>
                <Link
                  href="/contact"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Contact</span>
                </Link>
                <Link
                  href="/"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>← Home</span>
                </Link>
              </div>
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
            "@type": "WebSite",
            name: "samuido Tools",
            description: "実用的なWebツールのコレクション",
            url: "https://yusuke-kim.com/tools",
            author: {
              "@type": "Person",
              name: "木村友亮",
              alternateName: "samuido",
            },
            mainEntity: {
              "@type": "ItemList",
              name: "Webツール一覧",
              description: "カラーパレット、QRコード、タイマーなどの実用ツール",
              numberOfItems: tools.length,
              itemListElement: tools.map((tool, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "WebApplication",
                  name: tool.title,
                  description: tool.description,
                  url: `https://yusuke-kim.com${tool.href}`,
                  applicationCategory: tool.category,
                  operatingSystem: "Any",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "JPY",
                  },
                },
              })),
            },
          }),
        }}
      />

      {/* Accessibility Testing Component (development only) */}
      {process.env.NODE_ENV === "development" && (
        <AccessibilityTestingComponent
          targetSelector="main"
          autoRun={false}
          showResults={false}
        />
      )}
    </div>
  );
}
