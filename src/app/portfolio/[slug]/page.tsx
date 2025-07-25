import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Code,
  Video,
  Palette,
  Calendar,
  Clock,
  Github,
  ExternalLink,
  Play,
  Youtube,
  Eye,
} from "lucide-react";

// サンプルプロジェクトデータ（実際の実装では動的に取得）
const projectsData = {
  "interactive-portfolio": {
    id: "interactive-portfolio",
    title: "Interactive Portfolio Website",
    description:
      "Next.js 15とTailwind CSSを使用したレスポンシブポートフォリオサイト。アクセシビリティとSEOを重視した設計。",
    category: "develop",
    type: "Web Development",
    status: "completed",
    date: "2025-01",
    duration: "3週間",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Vercel"],
    githubUrl: "https://github.com/361do/portfolio-website",
    liveUrl: "https://yusuke-kim.com",
    youtubeId: null,
    vimeoId: null,
    highlights: [
      "100% Lighthouse Score",
      "TypeScript Strict Mode",
      "Responsive Design",
    ],
    content: `# Interactive Portfolio Website

このプロジェクトは、Next.js 15とTailwind CSSを使用して構築された現代的なポートフォリオサイトです。

## 主な特徴

- **パフォーマンス最適化**: Lighthouse 100%スコア達成
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **SEO最適化**: 構造化データとメタデータ管理
- **レスポンシブデザイン**: 全デバイス対応

## 技術実装

### アーキテクチャ
Next.js App Routerを使用したモダンなWebアプリケーション設計を採用しています。

### パフォーマンス最適化
- 画像最適化とWebP形式の採用
- コード分割と動的インポート
- キャッシュ戦略の実装

## 学習内容

このプロジェクトを通じて、Next.js 15の新機能活用やTailwind CSS 4.xの実装について深く学ぶことができました。`,
    featured: true,
  },
  "music-video-animation": {
    id: "music-video-animation",
    title: "Music Video Animation",
    description:
      "After Effectsを使用したリリックモーション制作。歌詞に合わせたタイポグラフィアニメーションと視覚効果。",
    category: "video",
    type: "MV制作",
    status: "completed",
    date: "2024-12",
    duration: "2週間",
    technologies: ["After Effects", "Illustrator", "Photoshop", "Audition"],
    githubUrl: null,
    liveUrl: null,
    youtubeId: "dQw4w9WgXcQ",
    vimeoId: null,
    highlights: ["Typography Animation", "Lyric Sync", "Color Grading"],
    content: `# Music Video Animation

After Effectsを使用したリリックモーション制作プロジェクトです。

## プロジェクト概要

歌詞に合わせたタイポグラフィアニメーションと視覚効果を組み合わせた音楽ビデオを制作しました。

## 制作プロセス

### プリプロダクション
- 楽曲分析と歌詞理解
- ビジュアルコンセプトの開発
- カラーパレットの決定

### プロダクション
- タイポグラフィアニメーション制作
- 背景エレメントの作成
- 音楽との同期調整

### ポストプロダクション
- カラーグレーディング
- 最終レンダリング
- 品質チェック

## 技術手法

キネティックタイポグラフィを中心とした表現で、文字の動きを通じて楽曲の感情を視覚化しました。`,
    featured: true,
  },
  "brand-identity-motion": {
    id: "brand-identity-motion",
    title: "Brand Identity Motion System",
    description:
      "スタートアップ企業のブランドアイデンティティとモーションシステムの統合デザイン。",
    category: "video-design",
    type: "Brand Design",
    status: "completed",
    date: "2024-12",
    duration: "6週間",
    technologies: ["After Effects", "Illustrator", "Figma", "Photoshop"],
    githubUrl: null,
    liveUrl: null,
    youtubeId: null,
    vimeoId: "123456789",
    highlights: ["Brand Consistency", "Motion System", "Design Guidelines"],
    content: `# Brand Identity Motion System

スタートアップ企業のブランドアイデンティティとモーションシステムの統合デザインプロジェクトです。

## デザインコンセプト

"シンプルさと革新性を表現するミニマルなデザインシステム"

## クリエイティブ意図

ブランドの価値観を動きで表現し、記憶に残るビジュアル体験を創造することを目指しました。

## デザインプロセス

### 1. リサーチ・分析
ブランドの本質と市場環境を深く理解するための調査を実施。

### 2. コンセプト開発
ビジュアルコンセプトとデザイン方向性を決定。

### 3. デザイン制作
ロゴデザインからアイコンシステムまで包括的に制作。

### 4. モーション制作
動的な表現とアニメーションを実装。

### 5. システム化
一貫性のあるデザインシステムを構築。

## 成果

統合されたブランド体験により、企業の認知度向上に貢献しました。`,
    featured: true,
  },
};

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsData[slug as keyof typeof projectsData];

  if (!project) {
    return {
      title: "Project Not Found - Portfolio | samuido",
      description: "The requested portfolio project could not be found.",
    };
  }

  return {
    title: `${project.title} - Portfolio | samuido`,
    description: project.description,
    keywords: [project.title, project.type, ...project.technologies],
    robots: "index, follow",
    alternates: {
      canonical: `https://yusuke-kim.com/portfolio/${project.id}`,
    },
    openGraph: {
      title: `${project.title} - Portfolio | samuido`,
      description: project.description,
      type: "article",
      url: `https://yusuke-kim.com/portfolio/${project.id}`,
      images: [
        {
          url: `https://yusuke-kim.com/portfolio/${project.id}-og-image.jpg`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      siteName: "samuido",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} - Portfolio | samuido`,
      description: project.description,
      images: [
        `https://yusuke-kim.com/portfolio/${project.id}-twitter-image.jpg`,
      ],
      creator: project.category === "video" ? "@361do_design" : "@361do_sleep",
    },
  };
}

// 静的パス生成
export async function generateStaticParams() {
  return Object.keys(projectsData).map((slug) => ({
    slug,
  }));
}

export default async function PortfolioItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectsData[slug as keyof typeof projectsData];

  if (!project) {
    notFound();
  }

  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "develop":
        return Code;
      case "video":
        return Video;
      case "video-design":
        return Palette;
      default:
        return Code;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "develop":
        return "accent";
      case "video":
        return "primary";
      case "video-design":
        return "accent";
      default:
        return "foreground";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "develop":
        return "Development";
      case "video":
        return "Video";
      case "video-design":
        return "Video & Design";
      default:
        return "Project";
    }
  };

  const getBackLink = (category: string) => {
    switch (category) {
      case "develop":
        return "/portfolio/gallery/develop";
      case "video":
        return "/portfolio/gallery/video";
      case "video-design":
        return "/portfolio/gallery/video&design";
      default:
        return "/portfolio/gallery/all";
    }
  };

  const CategoryIcon = getCategoryIcon(project.category);
  const categoryColor = getCategoryColor(project.category);
  const categoryName = getCategoryName(project.category);
  const backLink = getBackLink(project.category);

  // 構造化データ
  const structuredData = {
    "@context": "https://schema.org",
    "@type": project.category === "video" ? "VideoObject" : "CreativeWork",
    name: project.title,
    description: project.description,
    url: `https://yusuke-kim.com/portfolio/${project.id}`,
    creator: {
      "@type": "Person",
      name: "木村友亮",
      alternateName: "samuido",
    },
    dateCreated: project.date,
    genre: project.type,
    keywords: project.technologies.join(", "),
  };

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
                    href={backLink}
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← {categoryName} Gallery に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  {project.title}
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  {project.description}
                </p>
              </header>

              {/* Project Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Project Overview
                </h2>
                <div className="grid-system grid-1 lg:grid-2 gap-6">
                  {/* Media Preview */}
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    {project.category === "video" ||
                    project.category === "video-design" ? (
                      <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative">
                        <Play className="w-16 h-16 text-accent" />
                        {project.duration && (
                          <div className="absolute top-2 left-2 bg-background px-2 py-1">
                            <span className="noto-sans-jp-light text-xs text-foreground">
                              {project.duration}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          {project.youtubeId && (
                            <Youtube className="w-5 h-5 text-accent" />
                          )}
                          {project.vimeoId && (
                            <Video className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
                        <CategoryIcon
                          className={`w-16 h-16 text-${categoryColor}`}
                        />
                      </div>
                    )}

                    {/* External Links */}
                    <div className="flex flex-wrap gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center border border-foreground px-3 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          <span className="noto-sans-jp-light text-sm">
                            GitHub
                          </span>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center border border-foreground px-3 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          <span className="noto-sans-jp-light text-sm">
                            Live Demo
                          </span>
                        </a>
                      )}
                      {project.youtubeId && (
                        <a
                          href={`https://youtube.com/watch?v=${project.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center border border-foreground px-3 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          <Youtube className="w-4 h-4 mr-2" />
                          <span className="noto-sans-jp-light text-sm">
                            YouTube
                          </span>
                        </a>
                      )}
                      {project.vimeoId && (
                        <a
                          href={`https://vimeo.com/${project.vimeoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center border border-foreground px-3 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          <span className="noto-sans-jp-light text-sm">
                            Vimeo
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CategoryIcon
                          className={`w-5 h-5 text-${categoryColor} mr-2`}
                        />
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          Category: {project.type}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-accent mr-2" />
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          Completed: {project.date}
                        </span>
                      </div>
                      {project.duration && (
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            Duration: {project.duration}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Eye className="w-5 h-5 text-accent mr-2" />
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          Status: {project.status}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-foreground">
                      <h4 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                        Key Highlights
                      </h4>
                      <div className="space-y-2">
                        {project.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-accent mr-3"></div>
                            <span className="noto-sans-jp-light text-sm text-foreground">
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-foreground">
                      <h4 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
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
              </section>

              {/* Project Content */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Project Details
                </h2>
                <div className="bg-base border border-foreground p-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="noto-sans-jp-light text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {project.content}
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Related Projects
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-3 gap-6">
                  {Object.values(projectsData)
                    .filter(
                      (p) =>
                        p.id !== project.id && p.category === project.category
                    )
                    .slice(0, 3)
                    .map((relatedProject) => {
                      const RelatedIcon = getCategoryIcon(
                        relatedProject.category
                      );
                      const relatedColor = getCategoryColor(
                        relatedProject.category
                      );

                      return (
                        <Link
                          key={relatedProject.id}
                          href={`/portfolio/${relatedProject.id}`}
                          className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
                            <RelatedIcon
                              className={`w-8 h-8 text-${relatedColor}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="zen-kaku-gothic-new text-base text-primary">
                              {relatedProject.title}
                            </h3>
                            <p className="noto-sans-jp-light text-sm text-foreground line-clamp-2">
                              {relatedProject.description}
                            </p>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-foreground mr-1" />
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                {relatedProject.date}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </section>

              {/* Navigation */}
              <nav aria-label="Portfolio item navigation">
                <h3 className="sr-only">Portfolio Item機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href={backLink}
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Back to Gallery</span>
                  </Link>

                  <Link
                    href="/portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Portfolio Home</span>
                  </Link>

                  <Link
                    href={
                      project.category === "video"
                        ? "/about/commission/video"
                        : "/about/commission/develop"
                    }
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
                    © 2025 samuido - {project.title}
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
