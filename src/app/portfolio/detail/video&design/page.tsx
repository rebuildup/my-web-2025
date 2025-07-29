import { Metadata } from "next";
import Link from "next/link";
import {
  Palette,
  Video,
  Lightbulb,
  Eye,
  Calendar,
  Play,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Video & Design Detail - Portfolio | samuido 映像×デザイン詳細",
  description:
    "samuidoの映像とデザインを融合したプロジェクトの詳細ページ。デザインコンセプト、クリエイティブな意図、視覚表現手法を詳しく解説。",
  keywords: [
    "映像デザイン詳細",
    "デザインコンセプト",
    "クリエイティブ意図",
    "視覚表現",
    "ブランドデザイン",
    "モーションデザイン",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio/detail/video&design",
  },
  openGraph: {
    title: "Video & Design Detail - Portfolio | samuido 映像×デザイン詳細",
    description:
      "samuidoの映像とデザインを融合したプロジェクトの詳細ページ。デザインコンセプト、クリエイティブな意図、視覚表現手法を詳しく解説。",
    type: "article",
    url: "https://yusuke-kim.com/portfolio/detail/video&design",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio/detail-video-design-og-image.png",
        width: 1200,
        height: 630,
        alt: "Video & Design Detail - Portfolio",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video & Design Detail - Portfolio | samuido 映像×デザイン詳細",
    description:
      "samuidoの映像とデザインを融合したプロジェクトの詳細ページ。デザインコンセプト、クリエイティブな意図、視覚表現手法を詳しく解説。",
    images: [
      "https://yusuke-kim.com/portfolio/detail-video-design-twitter-image.jpg",
    ],
    creator: "@361do_design",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Video & Design Project Details",
  description:
    "デザインコンセプトと映像表現を融合したクリエイティブプロジェクトの詳細",
  url: "https://yusuke-kim.com/portfolio/detail/video&design",
  creator: {
    "@type": "Person",
    name: "木村友亮",
    alternateName: "samuido",
  },
  genre: ["Motion Design", "Brand Design"],
};

// サンプル映像×デザインプロジェクトデータ（実際の実装では動的に取得）
const projectData = {
  id: "brand-identity-motion",
  title: "Brand Identity Motion System",
  description:
    "スタートアップ企業のブランドアイデンティティとモーションシステムの統合デザイン。ロゴから映像まで一貫したビジュアル言語を構築。",
  concept: "シンプルさと革新性を表現するミニマルなデザインシステム",
  creativeIntent:
    "ブランドの価値観を動きで表現し、記憶に残るビジュアル体験を創造",
  designEmphasis: "Brand Consistency",
  duration: "2:30",
  date: "2024-12",
  client: "Tech Startup",
  deliverables: [
    "Brand Identity",
    "Motion Graphics",
    "Style Guide",
    "Asset Library",
  ],
  software: ["After Effects", "Illustrator", "Figma", "Photoshop"],
};

// デザインプロセスの詳細
const designProcess = {
  research: {
    title: "リサーチ・分析",
    description: "ブランドの本質と市場環境の理解",
    duration: "1週間",
    activities: [
      "ブランド価値の分析",
      "競合他社調査",
      "ターゲット層の理解",
      "市場トレンド分析",
      "ブランドポジショニング",
    ],
  },
  concept: {
    title: "コンセプト開発",
    description: "ビジュアルコンセプトとデザイン方向性の決定",
    duration: "1週間",
    activities: [
      "ムードボード作成",
      "コンセプトスケッチ",
      "カラーパレット検討",
      "タイポグラフィ選定",
      "ビジュアル言語定義",
    ],
  },
  design: {
    title: "デザイン制作",
    description: "ブランドアイデンティティの具体的な制作",
    duration: "2週間",
    activities: [
      "ロゴデザイン",
      "アイコンシステム",
      "カラーシステム",
      "タイポグラフィシステム",
      "レイアウトシステム",
    ],
  },
  motion: {
    title: "モーション制作",
    description: "動的な表現とアニメーションの実装",
    duration: "2週間",
    activities: [
      "ロゴアニメーション",
      "トランジション効果",
      "UI アニメーション",
      "ブランド映像",
      "モーションガイドライン",
    ],
  },
  system: {
    title: "システム化",
    description: "一貫性のあるデザインシステムの構築",
    duration: "1週間",
    activities: [
      "スタイルガイド作成",
      "アセットライブラリ",
      "実装ガイドライン",
      "品質管理基準",
      "運用マニュアル",
    ],
  },
};

// ビジュアル要素の詳細
const visualElements = {
  color: {
    title: "カラーシステム",
    description: "ブランドの個性を表現する色彩設計",
    elements: [
      "プライマリーカラー: 革新性を表現する鮮やかなブルー",
      "セカンダリーカラー: 信頼性を示すダークグレー",
      "アクセントカラー: エネルギーを表現するオレンジ",
      "ニュートラルカラー: 可読性を重視したグレースケール",
    ],
  },
  typography: {
    title: "タイポグラフィ",
    description: "読みやすさと個性を両立したフォントシステム",
    elements: [
      "ヘッドライン: モダンなサンセリフで力強い印象",
      "ボディテキスト: 可読性を重視したクリーンなフォント",
      "アクセント: ブランドの個性を表現する特徴的なフォント",
      "システムフォント: 実装時の代替フォント設定",
    ],
  },
  layout: {
    title: "レイアウトシステム",
    description: "一貫性のある構成とグリッドシステム",
    elements: [
      "グリッドシステム: 12カラムベースの柔軟なレイアウト",
      "余白設定: 8pxベースのスペーシングシステム",
      "階層構造: 明確な情報階層とビジュアル階層",
      "レスポンシブ: 全デバイス対応の適応的レイアウト",
    ],
  },
  motion: {
    title: "モーションデザイン",
    description: "ブランドの動的な表現とアニメーション",
    elements: [
      "イージング: ブランドらしい自然で心地よい動き",
      "タイミング: 一貫性のあるアニメーション速度",
      "トランジション: 滑らかで意味のある画面遷移",
      "フィードバック: ユーザーアクションに対する適切な反応",
    ],
  },
};

// クリエイティブな意図
const creativeIntents = [
  {
    aspect: "ブランド価値の可視化",
    description:
      "企業の革新性と信頼性を視覚的に表現し、ターゲット層に的確に伝える",
    approach:
      "シンプルで力強いビジュアル言語を通じて、複雑な技術を分かりやすく表現",
  },
  {
    aspect: "感情的なつながり",
    description: "論理的な情報伝達だけでなく、感情に訴えかける体験を創造",
    approach: "色彩心理学と動きの心理効果を活用した感情的なコミュニケーション",
  },
  {
    aspect: "記憶に残る体験",
    description: "一度見たら忘れられない、印象的で独特なビジュアル体験の提供",
    approach: "独創的でありながら機能的な、バランスの取れたデザインアプローチ",
  },
  {
    aspect: "システムの拡張性",
    description:
      "将来的な成長と変化に対応できる柔軟で拡張可能なデザインシステム",
    approach: "モジュラー設計とスケーラブルなコンポーネントシステムの構築",
  },
];

export default function VideoDesignDetailPage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        <main className="flex items-center py-10">
          <div className="container-system">
            <div className="space-y-10">
              {/* Header */}
              <header className="space-y-12">
                <nav className="mb-6">
                  <Link
                    href="/portfolio/gallery/video&design"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Video & Design Gallery に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Video & Design Detail
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  映像とデザインを融合したプロジェクトの詳細を紹介します.
                  <br />
                  デザインコンセプト、クリエイティブな意図、視覚表現手法を詳しく解説します.
                </p>
              </header>

              {/* Project Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Project Overview
                </h2>
                <div className="grid-system grid-1 lg:grid-2 gap-6">
                  {/* Video Preview */}
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative">
                      <Play className="w-16 h-16 text-accent" />
                      <div className="absolute top-2 left-2 bg-background px-2 py-1">
                        <span className="noto-sans-jp-light text-xs text-foreground">
                          {projectData.duration}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-background px-2 py-1">
                        <span className="noto-sans-jp-light text-xs text-accent">
                          {projectData.designEmphasis}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="flex items-center">
                        <Palette className="w-5 h-5 text-accent mr-2" />
                        <Video className="w-5 h-5 text-primary mr-2" />
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          Video & Design Integration
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-xl text-primary">
                      {projectData.title}
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                      {projectData.description}
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Lightbulb className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-xs text-accent">
                            Design Concept:
                          </span>
                        </div>
                        <p className="noto-sans-jp-light text-sm text-foreground italic pl-7">
                          &ldquo;{projectData.concept}&rdquo;
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Eye className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-xs text-accent">
                            Creative Intent:
                          </span>
                        </div>
                        <p className="noto-sans-jp-light text-sm text-foreground pl-7">
                          {projectData.creativeIntent}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-xs text-accent">
                            Project Info:
                          </span>
                        </div>
                        <div className="pl-7 space-y-1">
                          <p className="noto-sans-jp-light text-sm text-foreground">
                            Client: {projectData.client}
                          </p>
                          <p className="noto-sans-jp-light text-sm text-foreground">
                            Completed: {projectData.date}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-foreground">
                      <h4 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                        Deliverables
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {projectData.deliverables.map((item) => (
                          <span
                            key={item}
                            className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Design Process */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Design Process
                </h2>
                <div className="space-y-6">
                  {Object.entries(designProcess).map(
                    ([key, process], index) => (
                      <div
                        key={key}
                        className="bg-base border border-foreground p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-accent text-background flex items-center justify-center font-bold mr-4 text-sm">
                              {index + 1}
                            </div>
                            <h3 className="zen-kaku-gothic-new text-lg text-primary">
                              {process.title}
                            </h3>
                          </div>
                          <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                            {process.duration}
                          </span>
                        </div>
                        <p className="noto-sans-jp-light text-sm text-foreground ml-12">
                          {process.description}
                        </p>
                        <div className="ml-12 grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-5 gap-2">
                          {process.activities.map((activity, idx) => (
                            <div
                              key={idx}
                              className="bg-background border border-foreground p-2 text-center"
                            >
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                {activity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>

              {/* Visual Elements */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Visual Elements
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {Object.entries(visualElements).map(([key, element]) => (
                    <div
                      key={key}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div className="flex items-center">
                        {key === "color" && (
                          <Palette className="w-6 h-6 text-accent mr-3" />
                        )}
                        {key === "typography" && (
                          <Sparkles className="w-6 h-6 text-accent mr-3" />
                        )}
                        {key === "layout" && (
                          <Eye className="w-6 h-6 text-accent mr-3" />
                        )}
                        {key === "motion" && (
                          <Video className="w-6 h-6 text-accent mr-3" />
                        )}
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          {element.title}
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {element.description}
                      </p>
                      <div className="space-y-2">
                        {element.elements.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-1 h-1 bg-accent mt-2 mr-3 flex-shrink-0"></div>
                            <span className="noto-sans-jp-light text-sm text-foreground">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Creative Intent */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Creative Intent & Approach
                </h2>
                <div className="space-y-6">
                  {creativeIntents.map((intent, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        {intent.aspect}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                        {intent.description}
                      </p>
                      <div className="bg-background border border-foreground p-3">
                        <span className="noto-sans-jp-light text-xs text-accent">
                          Approach:
                        </span>
                        <p className="noto-sans-jp-light text-sm text-foreground mt-1">
                          {intent.approach}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Software & Tools */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Software & Tools
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary">
                    Production Pipeline
                  </h3>
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-4 md:grid-4 gap-4">
                    {projectData.software.map((tool, index) => (
                      <div
                        key={tool}
                        className="bg-background border border-foreground p-3 text-center"
                      >
                        <div className="w-8 h-8 bg-accent text-background flex items-center justify-center font-bold mx-auto mb-2 text-sm">
                          {index + 1}
                        </div>
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          {tool}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    統合されたワークフローにより、デザインから映像まで一貫した品質を実現
                  </p>
                </div>
              </section>

              {/* Navigation */}
              <nav aria-label="Video & Design detail navigation">
                <h3 className="sr-only">Video & Design Detail機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/video&design"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>More Projects</span>
                  </Link>

                  <Link
                    href="/portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Portfolio Home</span>
                  </Link>

                  <Link
                    href="/about/commission/video"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Commission</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <footer className="pt-4 border-t border-foreground">
                <div className="text-center">
                  <p className="shippori-antique-b1-regular text-sm inline-block">
                    © 2025 samuido - Video & Design Project Detail
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
