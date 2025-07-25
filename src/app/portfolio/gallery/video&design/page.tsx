import { Metadata } from "next";
import Link from "next/link";
import { Palette, Video, Lightbulb, Calendar, Play, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
  description:
    "samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
  keywords: [
    "映像デザイン",
    "デザインコンセプト",
    "映像表現",
    "クリエイティブ",
    "ビジュアルデザイン",
    "コンセプトアート",
    "映像制作",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio/gallery/video&design",
  },
  openGraph: {
    title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
    description:
      "samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
    type: "website",
    url: "https://yusuke-kim.com/portfolio/gallery/video&design",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio/gallery-video-design-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Video & Design Projects - Portfolio",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
    description:
      "samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
    images: [
      "https://yusuke-kim.com/portfolio/gallery-video-design-twitter-image.jpg",
    ],
    creator: "@361do_design",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "samuido Video & Design Projects",
  description: "デザインコンセプトと映像表現を融合した創造的なプロジェクト集",
  url: "https://yusuke-kim.com/portfolio/gallery/video&design",
  mainEntity: {
    "@type": "ItemList",
    name: "Video & Design Projects",
    numberOfItems: 4,
  },
};

// 映像×デザインプロジェクトデータ（実際の実装では動的に取得）
const videoDesignProjects = [
  {
    id: "brand-identity-motion",
    title: "Brand Identity Motion System",
    description:
      "スタートアップ企業のブランドアイデンティティとモーションシステムの統合デザイン。ロゴから映像まで一貫したビジュアル言語を構築。",
    concept: "シンプルさと革新性を表現するミニマルなデザインシステム",
    designProcess: [
      "ブランド分析",
      "コンセプト開発",
      "ビジュアルアイデンティティ",
      "モーションデザイン",
      "システム化",
    ],
    visualElements: [
      "Typography",
      "Color System",
      "Logo Animation",
      "Transition Effects",
    ],
    software: ["After Effects", "Illustrator", "Figma", "Photoshop"],
    duration: "2:30",
    date: "2024-12",
    featured: true,
    designEmphasis: "Brand Consistency",
    creativeIntent:
      "ブランドの価値観を動きで表現し、記憶に残るビジュアル体験を創造",
  },
  {
    id: "experimental-typography",
    title: "Experimental Typography Motion",
    description:
      "実験的なタイポグラフィアニメーション。文字の形と動きを通じて感情と意味を表現する試み。",
    concept: "文字が持つ表現力を最大限に引き出すキネティックタイポグラフィ",
    designProcess: [
      "文字研究",
      "動きの実験",
      "感情表現",
      "リズム構築",
      "視覚的詩",
    ],
    visualElements: [
      "Kinetic Typography",
      "Emotional Expression",
      "Rhythm Design",
      "Abstract Forms",
    ],
    software: ["After Effects", "Illustrator", "p5.js"],
    duration: "1:45",
    date: "2024-11",
    featured: true,
    designEmphasis: "Emotional Expression",
    creativeIntent:
      "文字と動きの融合により、言葉を超えた感情的なコミュニケーションを実現",
  },
  {
    id: "ui-animation-showcase",
    title: "UI Animation Design Showcase",
    description:
      "ユーザーインターフェースのアニメーションデザイン集。使いやすさと美しさを両立したマイクロインタラクション。",
    concept: "直感的で楽しいユーザー体験を生み出すマイクロインタラクション",
    designProcess: [
      "UX分析",
      "インタラクション設計",
      "プロトタイピング",
      "アニメーション制作",
      "ユーザビリティテスト",
    ],
    visualElements: [
      "Micro Interactions",
      "Smooth Transitions",
      "Feedback Design",
      "Loading Animations",
    ],
    software: ["After Effects", "Figma", "Principle", "Lottie"],
    duration: "3:00",
    date: "2024-10",
    featured: false,
    designEmphasis: "User Experience",
    creativeIntent:
      "機能性と美しさを兼ね備えたインターフェースで、ユーザーに喜びを提供",
  },
  {
    id: "abstract-visual-narrative",
    title: "Abstract Visual Narrative",
    description:
      "抽象的な視覚表現による物語の構築。色、形、動きを使って感情的なストーリーを語る実験作品。",
    concept: "言葉を使わずに感情と物語を伝える抽象的ビジュアルナラティブ",
    designProcess: [
      "ストーリー構築",
      "視覚言語開発",
      "色彩設計",
      "動きの演出",
      "感情の表現",
    ],
    visualElements: [
      "Abstract Forms",
      "Color Psychology",
      "Emotional Journey",
      "Visual Metaphors",
    ],
    software: ["After Effects", "Cinema 4D", "Illustrator", "Audition"],
    duration: "4:15",
    date: "2024-09",
    featured: true,
    designEmphasis: "Emotional Storytelling",
    creativeIntent:
      "抽象的な表現を通じて、観る人の内面に直接語りかける体験を創造",
  },
];

// デザインアプローチ
const designApproaches = {
  concept: {
    title: "Concept Development",
    description:
      "プロジェクトの核となるコンセプトを明確化し、一貫したビジュアル言語を構築",
    methods: [
      "ブレインストーミング",
      "ムードボード作成",
      "コンセプトマップ",
      "ビジュアルリサーチ",
    ],
  },
  visual: {
    title: "Visual Language",
    description: "色彩、形状、タイポグラフィを統合したビジュアルシステムの設計",
    methods: [
      "カラーパレット",
      "タイポグラフィシステム",
      "グリッドシステム",
      "アイコンデザイン",
    ],
  },
  motion: {
    title: "Motion Design",
    description: "時間軸を活用した動的な表現とユーザー体験の設計",
    methods: [
      "タイミング設計",
      "イージング調整",
      "トランジション",
      "インタラクション",
    ],
  },
  integration: {
    title: "System Integration",
    description: "デザインと映像を統合した一貫性のあるブランド体験の構築",
    methods: [
      "ブランドガイドライン",
      "モーションガイドライン",
      "実装仕様",
      "品質管理",
    ],
  },
};

export default function VideoDesignProjectsPage() {
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
                    href="/portfolio"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Portfolio に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Video & Design
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  デザインコンセプトと映像表現を融合した創造的なプロジェクト集です.
                  <br />
                  クリエイティブな意図と視覚的な表現手法を重視して紹介しています.
                </p>
              </header>

              {/* Design Approach */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Design Approach
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
                  {Object.entries(designApproaches).map(([key, approach]) => (
                    <div
                      key={key}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div className="flex items-center">
                        {key === "concept" && (
                          <Lightbulb className="w-6 h-6 text-accent mr-3" />
                        )}
                        {key === "visual" && (
                          <Palette className="w-6 h-6 text-accent mr-3" />
                        )}
                        {key === "motion" && (
                          <Video className="w-6 h-6 text-accent mr-3" />
                        )}
                        {key === "integration" && (
                          <Eye className="w-6 h-6 text-accent mr-3" />
                        )}
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          {approach.title}
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {approach.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {approach.methods.map((method) => (
                          <span
                            key={method}
                            className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Featured Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Featured Projects
                </h2>
                <div className="space-y-8">
                  {videoDesignProjects
                    .filter((project) => project.featured)
                    .map((project) => (
                      <Link
                        key={project.id}
                        href={`/portfolio/detail/video&design/${project.id}`}
                        className="bg-base border border-foreground p-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                      >
                        <div className="grid-system grid-1 lg:grid-2 gap-6">
                          {/* Video Preview */}
                          <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative">
                            <Play className="w-12 h-12 text-accent" />
                            <div className="absolute top-2 left-2 bg-background px-2 py-1">
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                {project.duration}
                              </span>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-background px-2 py-1">
                              <span className="noto-sans-jp-light text-xs text-accent">
                                {project.designEmphasis}
                              </span>
                            </div>
                          </div>

                          {/* Project Details */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Palette className="w-5 h-5 text-accent mr-2" />
                                <Video className="w-5 h-5 text-primary mr-2" />
                                <span className="noto-sans-jp-light text-xs text-foreground">
                                  Video & Design
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-foreground mr-1" />
                                <span className="noto-sans-jp-light text-xs text-foreground">
                                  {project.date}
                                </span>
                              </div>
                            </div>

                            <h3 className="zen-kaku-gothic-new text-xl text-primary">
                              {project.title}
                            </h3>

                            <p className="noto-sans-jp-light text-sm text-foreground">
                              {project.description}
                            </p>

                            {/* Design Concept */}
                            <div className="space-y-2">
                              <h4 className="noto-sans-jp-light text-xs text-accent">
                                Design Concept:
                              </h4>
                              <p className="noto-sans-jp-light text-sm text-foreground italic">
                                &ldquo;{project.concept}&rdquo;
                              </p>
                            </div>

                            {/* Creative Intent */}
                            <div className="space-y-2">
                              <h4 className="noto-sans-jp-light text-xs text-accent">
                                Creative Intent:
                              </h4>
                              <p className="noto-sans-jp-light text-sm text-foreground">
                                {project.creativeIntent}
                              </p>
                            </div>

                            {/* Visual Elements */}
                            <div className="space-y-2">
                              <h4 className="noto-sans-jp-light text-xs text-accent">
                                Visual Elements:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {project.visualElements.map((element) => (
                                  <span
                                    key={element}
                                    className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                                  >
                                    {element}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Software */}
                            <div className="flex flex-wrap gap-1">
                              {project.software.map((tool) => (
                                <span
                                  key={tool}
                                  className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </section>

              {/* All Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  All Video & Design Projects ({videoDesignProjects.length})
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {videoDesignProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/portfolio/detail/video&design/${project.id}`}
                      className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      {/* Video Preview */}
                      <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative">
                        <Play className="w-8 h-8 text-accent" />
                        <div className="absolute top-2 left-2 bg-background px-2 py-1">
                          <span className="noto-sans-jp-light text-xs text-foreground">
                            {project.duration}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-background px-2 py-1">
                          <span className="noto-sans-jp-light text-xs text-accent">
                            {project.designEmphasis}
                          </span>
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Palette className="w-4 h-4 text-accent mr-1" />
                            <Video className="w-4 h-4 text-primary mr-1" />
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-foreground mr-1" />
                            <span className="noto-sans-jp-light text-xs text-foreground">
                              {project.date}
                            </span>
                          </div>
                        </div>

                        <h3 className="zen-kaku-gothic-new text-base text-primary">
                          {project.title}
                        </h3>

                        <p className="noto-sans-jp-light text-sm text-foreground line-clamp-2">
                          {project.description}
                        </p>

                        {/* Concept */}
                        <p className="noto-sans-jp-light text-xs text-accent italic">
                          &ldquo;{project.concept}&rdquo;
                        </p>

                        {/* Software */}
                        <div className="flex flex-wrap gap-1">
                          {project.software.slice(0, 3).map((tool) => (
                            <span
                              key={tool}
                              className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                            >
                              {tool}
                            </span>
                          ))}
                          {project.software.length > 3 && (
                            <span className="noto-sans-jp-light text-xs text-foreground px-2 py-1">
                              +{project.software.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Global Functions */}
              <nav aria-label="Video & Design gallery functions">
                <h3 className="sr-only">Video & Design Gallery機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/all"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>All Projects</span>
                  </Link>

                  <Link
                    href="/portfolio/gallery/video"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Video Only</span>
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
                    © 2025 samuido - Video & Design Projects
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
