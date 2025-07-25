import { Metadata } from "next";
import Link from "next/link";
import { Code, Github, ExternalLink, Calendar, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Development Detail - Portfolio | samuido 開発プロジェクト詳細",
  description:
    "samuidoの開発プロジェクトの詳細ページ。技術実装の詳細、使用技術、開発プロセス、ソースコードを含む包括的な情報。",
  keywords: [
    "開発詳細",
    "技術実装",
    "プロジェクト詳細",
    "ソースコード",
    "開発プロセス",
    "技術スタック",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio/detail/develop",
  },
  openGraph: {
    title: "Development Detail - Portfolio | samuido 開発プロジェクト詳細",
    description:
      "samuidoの開発プロジェクトの詳細ページ。技術実装の詳細、使用技術、開発プロセス、ソースコードを含む包括的な情報。",
    type: "article",
    url: "https://yusuke-kim.com/portfolio/detail/develop",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio/detail-develop-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Development Detail - Portfolio",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Development Detail - Portfolio | samuido 開発プロジェクト詳細",
    description:
      "samuidoの開発プロジェクトの詳細ページ。技術実装の詳細、使用技術、開発プロセス、ソースコードを含む包括的な情報。",
    images: [
      "https://yusuke-kim.com/portfolio/detail-develop-twitter-image.jpg",
    ],
    creator: "@361do_sleep",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  name: "Development Project Details",
  description: "技術実装の詳細と開発プロセスの解説",
  url: "https://yusuke-kim.com/portfolio/detail/develop",
  author: {
    "@type": "Person",
    name: "木村友亮",
    alternateName: "samuido",
  },
  programmingLanguage: ["TypeScript", "JavaScript", "React", "Next.js"],
};

// サンプルプロジェクトデータ（実際の実装では動的に取得）
const projectData = {
  id: "interactive-portfolio",
  title: "Interactive Portfolio Website",
  description:
    "Next.js 15とTailwind CSSを使用したレスポンシブポートフォリオサイト。アクセシビリティとSEOを重視した設計。",
  category: "Web Development",
  status: "completed",
  date: "2025-01",
  duration: "3週間",
  technologies: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Vercel"],
  githubUrl: "https://github.com/361do/portfolio-website",
  liveUrl: "https://yusuke-kim.com",
  highlights: [
    "100% Lighthouse Score",
    "TypeScript Strict Mode",
    "Responsive Design",
  ],
  challenges: [
    "パフォーマンス最適化",
    "アクセシビリティ対応",
    "SEO最適化",
    "レスポンシブデザイン",
  ],
  learnings: [
    "Next.js 15の新機能活用",
    "Tailwind CSS 4.xの実装",
    "TypeScript strict modeの運用",
    "Lighthouse 100%スコア達成手法",
  ],
};

// 技術実装の詳細
const technicalDetails = {
  architecture: {
    title: "アーキテクチャ",
    description: "Next.js App Routerを使用したモダンなWebアプリケーション設計",
    details: [
      "App Router による ファイルベースルーティング",
      "Server Components と Client Components の適切な分離",
      "TypeScript strict mode による型安全性の確保",
      "Tailwind CSS による効率的なスタイリング",
    ],
  },
  performance: {
    title: "パフォーマンス最適化",
    description: "Core Web Vitals 100%スコア達成のための最適化手法",
    details: [
      "画像最適化とWebP形式の採用",
      "コード分割と動的インポート",
      "キャッシュ戦略の実装",
      "バンドルサイズの最適化",
    ],
  },
  accessibility: {
    title: "アクセシビリティ",
    description: "WCAG 2.1 AA準拠のアクセシブルな設計",
    details: [
      "セマンティックHTMLの使用",
      "適切なARIAラベルの実装",
      "キーボードナビゲーション対応",
      "スクリーンリーダー対応",
    ],
  },
  seo: {
    title: "SEO最適化",
    description: "検索エンジン最適化とメタデータ管理",
    details: [
      "構造化データ（JSON-LD）の実装",
      "Open Graph・Twitter Cards対応",
      "サイトマップとrobots.txt",
      "ページ固有のメタデータ管理",
    ],
  },
};

// コードサンプル
const codeExamples = [
  {
    title: "Next.js App Router Layout",
    language: "typescript",
    code: `// app/layout.tsx
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'samuido Portfolio',
  description: 'Creative Portfolio & Tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}`,
  },
  {
    title: "Tailwind CSS Configuration",
    language: "typescript",
    code: `// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0000ff',
        background: '#ffffff',
        foreground: '#222222',
        accent: '#0000ff',
        base: '#f8f8f8',
      },
      fontFamily: {
        'neue-haas': ['Neue Haas Grotesk Display', 'sans-serif'],
        'noto-sans': ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config`,
  },
];

export default function DevelopDetailPage() {
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
                    href="/portfolio/gallery/develop"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Development Gallery に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Development Detail
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  開発プロジェクトの技術実装詳細と開発プロセスを紹介します.
                  <br />
                  使用技術、課題解決、学習内容を含む包括的な情報です.
                </p>
              </header>

              {/* Project Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Project Overview
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-6">
                  <div className="grid-system grid-1 lg:grid-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="zen-kaku-gothic-new text-xl text-primary">
                        {projectData.title}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                        {projectData.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Code className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            Category: {projectData.category}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            Duration: {projectData.duration} ({projectData.date}
                            )
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            Status: {projectData.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="zen-kaku-gothic-new text-lg text-primary">
                        Key Highlights
                      </h4>
                      <div className="space-y-2">
                        {projectData.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-accent mr-3"></div>
                            <span className="noto-sans-jp-light text-sm text-foreground">
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4">
                        <h4 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                          Technologies Used
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {projectData.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-foreground">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href={projectData.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center border border-foreground px-4 py-3 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        <span className={Global_title}>View Source Code</span>
                      </a>
                      <a
                        href={projectData.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center border border-foreground px-4 py-3 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        <span className={Global_title}>Live Demo</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* Technical Implementation */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Technical Implementation
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {Object.entries(technicalDetails).map(([key, detail]) => (
                    <div
                      key={key}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        {detail.title}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {detail.description}
                      </p>
                      <div className="space-y-2">
                        {detail.details.map((item, index) => (
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

              {/* Code Examples */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Code Examples
                </h2>
                <div className="space-y-6">
                  {codeExamples.map((example, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          {example.title}
                        </h3>
                        <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                          {example.language}
                        </span>
                      </div>
                      <div className="bg-background border border-foreground p-4 overflow-x-auto">
                        <pre className="text-sm text-foreground">
                          <code>{example.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Challenges & Learnings */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Challenges & Learnings
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      主な課題
                    </h3>
                    <div className="space-y-3">
                      {projectData.challenges.map((challenge, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary mt-2 mr-3 flex-shrink-0"></div>
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            {challenge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      学習内容
                    </h3>
                    <div className="space-y-3">
                      {projectData.learnings.map((learning, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-accent mt-2 mr-3 flex-shrink-0"></div>
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            {learning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Navigation */}
              <nav aria-label="Portfolio detail navigation">
                <h3 className="sr-only">Portfolio Detail機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>More Development</span>
                  </Link>

                  <Link
                    href="/portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Portfolio Home</span>
                  </Link>

                  <Link
                    href="/about/commission/develop"
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
                    © 2025 samuido - Development Project Detail
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
