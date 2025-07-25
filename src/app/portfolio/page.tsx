import { Metadata } from "next";
import Link from "next/link";
import { Code, Video, Palette, Eye, Calendar } from "lucide-react";
import { PortfolioAnalytics, GoogleAnalytics } from "./components";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Portfolio - samuido | 作品集・開発・映像・デザイン",
  description:
    "samuidoの作品集。Web開発、ゲーム開発、映像制作、デザインなど幅広いクリエイティブ作品を紹介。技術スタックと制作プロセスも掲載。",
  keywords: [
    "ポートフォリオ",
    "作品集",
    "Web開発",
    "ゲーム開発",
    "映像制作",
    "デザイン",
    "React",
    "Unity",
    "AfterEffects",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio",
  },
  openGraph: {
    title: "Portfolio - samuido | 作品集・開発・映像・デザイン",
    description:
      "samuidoの作品集。Web開発、ゲーム開発、映像制作、デザインなど幅広いクリエイティブ作品を紹介。技術スタックと制作プロセスも掲載。",
    type: "website",
    url: "https://yusuke-kim.com/portfolio",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Portfolio - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio - samuido | 作品集・開発・映像・デザイン",
    description:
      "samuidoの作品集。Web開発、ゲーム開発、映像制作、デザインなど幅広いクリエイティブ作品を紹介。技術スタックと制作プロセスも掲載。",
    images: ["https://yusuke-kim.com/portfolio-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "samuido Portfolio",
  description: "Web開発、ゲーム開発、映像制作、デザインの作品集",
  url: "https://yusuke-kim.com/portfolio",
  creator: {
    "@type": "Person",
    name: "木村友亮",
    alternateName: "samuido",
  },
  genre: ["Web Development", "Game Development", "Video Production", "Design"],
  workExample: [
    {
      "@type": "SoftwareApplication",
      name: "Web開発プロジェクト",
      applicationCategory: "WebApplication",
    },
    {
      "@type": "VideoObject",
      name: "映像制作作品",
      genre: "Motion Graphics",
    },
    {
      "@type": "Game",
      name: "ゲーム開発作品",
      genre: "Interactive",
    },
  ],
};

// ポートフォリオ統計データ（実際の実装では動的に取得）
const portfolioStats = {
  totalProjects: 24,
  categories: {
    develop: 12,
    video: 8,
    design: 4,
  },
  technologies: ["React", "Unity", "After Effects", "TypeScript", "Blender"],
  latestUpdate: "2025年1月",
};

// カテゴリ情報
const categories = [
  {
    id: "all",
    title: "All Projects",
    description: "全ての作品を時系列・カテゴリ・技術で絞り込み表示",
    icon: Eye,
    count: portfolioStats.totalProjects,
    href: "/portfolio/gallery/all",
    color: "primary",
  },
  {
    id: "develop",
    title: "Development",
    description: "Web開発・ゲーム開発・技術実装に重点を置いた作品",
    icon: Code,
    count: portfolioStats.categories.develop,
    href: "/portfolio/gallery/develop",
    color: "accent",
  },
  {
    id: "video",
    title: "Video Production",
    description: "映像制作・モーショングラフィックス・アニメーション作品",
    icon: Video,
    count: portfolioStats.categories.video,
    href: "/portfolio/gallery/video",
    color: "primary",
  },
  {
    id: "video-design",
    title: "Video & Design",
    description: "デザインコンセプトと映像表現を融合した作品",
    icon: Palette,
    count: portfolioStats.categories.design,
    href: "/portfolio/gallery/video&design",
    color: "accent",
  },
];

// 最新作品のハイライト（実際の実装では動的に取得）
const featuredProjects = [
  {
    id: "project-1",
    title: "Interactive Portfolio Website",
    category: "develop",
    description: "Next.js 15とTailwind CSSを使用したポートフォリオサイト",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    thumbnail: "/images/portfolio/project-1-thumb.jpg",
    date: "2025-01",
  },
  {
    id: "project-2",
    title: "Music Video Animation",
    category: "video",
    description: "After Effectsを使用したリリックモーション制作",
    technologies: ["After Effects", "Illustrator"],
    thumbnail: "/images/portfolio/project-2-thumb.jpg",
    date: "2024-12",
  },
  {
    id: "project-3",
    title: "Unity Game Prototype",
    category: "develop",
    description: "2Dアクションゲームのプロトタイプ開発",
    technologies: ["Unity", "C#", "Photoshop"],
    thumbnail: "/images/portfolio/project-3-thumb.jpg",
    date: "2024-11",
  },
];

export default function PortfolioPage() {
  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
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
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Portfolio
                </h1>

                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  Web開発・ゲーム開発・映像制作・デザインの作品集です.
                  <br />
                  技術スタックと制作プロセスも含めて紹介しています.
                </p>
              </header>

              {/* Portfolio Statistics */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Portfolio Overview
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-4 md:grid-4 gap-6">
                    <div className="text-center">
                      <div className="neue-haas-grotesk-display text-3xl text-accent mb-2">
                        {portfolioStats.totalProjects}
                      </div>
                      <div className="noto-sans-jp-light text-sm text-foreground">
                        総プロジェクト数
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="neue-haas-grotesk-display text-3xl text-accent mb-2">
                        {portfolioStats.categories.develop}
                      </div>
                      <div className="noto-sans-jp-light text-sm text-foreground">
                        開発プロジェクト
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="neue-haas-grotesk-display text-3xl text-accent mb-2">
                        {portfolioStats.categories.video}
                      </div>
                      <div className="noto-sans-jp-light text-sm text-foreground">
                        映像作品
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="neue-haas-grotesk-display text-3xl text-accent mb-2">
                        {portfolioStats.technologies.length}+
                      </div>
                      <div className="noto-sans-jp-light text-sm text-foreground">
                        使用技術
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-foreground">
                    <div className="flex flex-wrap gap-2">
                      {portfolioStats.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Analytics */}
                  <div className="pt-4 border-t border-foreground">
                    <Suspense
                      fallback={
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      }
                    >
                      <PortfolioAnalytics showSummary={true} />
                    </Suspense>
                  </div>
                </div>
              </section>

              {/* Category Navigation */}
              <nav aria-label="Portfolio categories">
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Browse by Category
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-8">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={category.href}
                      className={CardStyle}
                      aria-describedby={`${category.id}-description`}
                    >
                      <div className="flex items-center">
                        <category.icon
                          className={`w-6 h-6 text-${category.color} mr-3`}
                        />
                        <h3 className={Card_title}>{category.title}</h3>
                      </div>
                      <p
                        id={`${category.id}-description`}
                        className={Card_description}
                      >
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="noto-sans-jp-light text-xs text-accent">
                          {category.count} projects
                        </span>
                        <span className="noto-sans-jp-light text-xs text-foreground">
                          →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Featured Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Featured Projects
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-3 gap-6">
                  {featuredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
                        <span className="noto-sans-jp-light text-xs text-foreground">
                          {project.title}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="zen-kaku-gothic-new text-base text-primary">
                            {project.title}
                          </h3>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-accent mr-1" />
                            <span className="noto-sans-jp-light text-xs text-accent">
                              {project.date}
                            </span>
                          </div>
                        </div>

                        <p className="noto-sans-jp-light text-sm text-foreground">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Playground Section */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Experimental Playground
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  <Link
                    href="/portfolio/playground/design"
                    className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <div className="flex items-center">
                      <Palette className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        Design Experiments
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      インタラクティブデモとデザイン実験
                    </p>
                  </Link>

                  <Link
                    href="/portfolio/playground/WebGL"
                    className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <div className="flex items-center">
                      <Code className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        WebGL Experiments
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      Three.js・WebGPU実装とインタラクティブ体験
                    </p>
                  </Link>
                </div>
              </section>

              {/* Global Functions */}
              <nav aria-label="Portfolio functions">
                <h3 className="sr-only">Portfolio機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/all"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>All Projects</span>
                  </Link>

                  <Link
                    href="/search?type=portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Search</span>
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
                    © 2025 samuido - Creative Portfolio
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </main>

        {/* Google Analytics */}
        <GoogleAnalytics />
      </div>
    </>
  );
}
