import Link from 'next/link';
import type { Metadata } from 'next';
import { Grid, Code, Video, Palette, Search, Filter, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Portfolio - samuido | 作品ギャラリー',
  description:
    'Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。',
  keywords: [
    'ポートフォリオ',
    '作品ギャラリー',
    'Webデザイン',
    'アプリケーション',
    'フロントエンド',
    'UI/UX',
    '映像制作',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Portfolio - samuido | 作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。',
    type: 'website',
    url: '/portfolio',
    images: [
      {
        url: '/portfolio-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfolio samuido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio - samuido | 作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。',
    images: ['/portfolio-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

interface GalleryCategory {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  count: number;
}

const galleryCategories: GalleryCategory[] = [
  {
    id: 'all',
    title: 'All Works',
    description: '全作品一覧',
    detailedDescription:
      'バラエティを重視した全作品の一覧。時系列ソート、カテゴリフィルター、検索機能を備えたギャラリー',
    href: '/portfolio/gallery/all',
    icon: <Grid size={32} />,
    color: 'border-blue-500',
    features: ['時系列ソート', 'カテゴリフィルター', 'タグフィルター', '検索機能'],
    count: 12,
  },
  {
    id: 'develop',
    title: 'Development',
    description: '開発系作品',
    detailedDescription:
      'プログラミング関連の制作物。プラグイン開発、ゲーム制作、Webアプリケーション、技術詳細を重視した表示',
    href: '/portfolio/gallery/develop',
    icon: <Code size={32} />,
    color: 'border-green-500',
    features: ['2列交互表示', 'プレビュー動画', '技術タグフィルター', 'リポジトリリンク'],
    count: 5,
  },
  {
    id: 'video',
    title: 'Video Production',
    description: '映像作品',
    detailedDescription: '映像制作のみ。依頼映像、個人制作映像をforiioライクなギャラリー表示で紹介',
    href: '/portfolio/gallery/video',
    icon: <Video size={32} />,
    color: 'border-purple-500',
    features: ['foriioライク表示', '埋め込み動画', '軽量プレビュー', '制作過程重視'],
    count: 4,
  },
  {
    id: 'video&design',
    title: 'Video & Design',
    description: '映像・デザイン作品',
    detailedDescription:
      '映像に加えて画像デザイン、Webデザインなど。デザインスキルを強調したクリエイティブギャラリー',
    href: '/portfolio/gallery/video&design',
    icon: <Palette size={32} />,
    color: 'border-yellow-500',
    features: ['縦3列表示', '動的サイズ', 'ホバー表示', 'デザインコンセプト重視'],
    count: 3,
  },
];

export default function PortfolioPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Portfolio - samuido',
    description: 'Webデザイナー・開発者木村友亮の作品ポートフォリオ',
    url: 'https://yusuke-kim.com/portfolio',
    mainEntity: {
      '@type': 'ItemList',
      name: '作品一覧',
      description: 'Webサイト、アプリケーション、デザイン作品のコレクション',
    },
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-gray min-h-screen">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Home
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-16 text-center">
          <h1 className="neue-haas-grotesk-display text-primary mb-6 text-6xl md:text-8xl">
            Portfolio
          </h1>
          <div className="mx-auto max-w-4xl">
            <p className="noto-sans-jp text-foreground/80 mb-8 text-xl leading-relaxed md:text-2xl">
              Webデザイン、開発、映像制作における作品ギャラリー
              <br />
              カテゴリ別に整理された制作実績をご覧ください
            </p>
          </div>
          <div className="bg-primary mx-auto mt-8 h-1 w-32"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 pb-16">
          {/* Statistics Overview */}
          <section className="mb-16">
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
              <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">12</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">総作品数</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">5</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">開発作品</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">4</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">映像作品</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">3</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">デザイン作品</div>
              </div>
            </div>
          </section>

          {/* Gallery Categories */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              ギャラリーカテゴリ
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {galleryCategories.map(category => (
                <Link
                  key={category.id}
                  href={category.href}
                  className={`group block border-2 p-8 ${category.color} bg-gray transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                >
                  <div className="flex items-start space-x-6">
                    <div className="text-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                      {category.icon}
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="neue-haas-grotesk-display text-foreground text-2xl">
                          {category.title}
                        </h3>
                        <div className="text-primary text-sm font-medium">{category.count}作品</div>
                      </div>

                      <p className="zen-kaku-gothic-new text-primary mb-3 text-lg">
                        {category.description}
                      </p>

                      <p className="noto-sans-jp text-foreground/70 mb-4 text-sm leading-relaxed">
                        {category.detailedDescription}
                      </p>

                      <div className="mb-4 space-y-2">
                        <h4 className="noto-sans-jp text-foreground/60 text-xs font-medium">
                          主な機能：
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.features.map(feature => (
                            <span
                              key={feature}
                              className="bg-foreground/10 text-foreground/70 rounded px-2 py-1 text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-primary text-sm font-medium group-hover:underline">
                        ギャラリーを見る →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              クイックアクション
            </h2>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              <Link
                href="/portfolio/gallery/all?sort=newest"
                className="group border-foreground/20 bg-gray/50 hover:bg-gray border p-6 transition-colors"
              >
                <div className="mb-3 flex items-center space-x-3">
                  <Calendar size={24} className="text-primary" />
                  <h3 className="neue-haas-grotesk-display text-foreground text-lg">最新作品</h3>
                </div>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  新着順で並んだ全作品を表示
                </p>
                <div className="text-primary mt-2 text-xs font-medium group-hover:underline">
                  表示 →
                </div>
              </Link>

              <Link
                href="/search?type=portfolio"
                className="group border-foreground/20 bg-gray/50 hover:bg-gray border p-6 transition-colors"
              >
                <div className="mb-3 flex items-center space-x-3">
                  <Search size={24} className="text-primary" />
                  <h3 className="neue-haas-grotesk-display text-foreground text-lg">作品検索</h3>
                </div>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  キーワードやタグで作品を検索
                </p>
                <div className="text-primary mt-2 text-xs font-medium group-hover:underline">
                  検索 →
                </div>
              </Link>

              <Link
                href="/portfolio/gallery/all?view=filter"
                className="group border-foreground/20 bg-gray/50 hover:bg-gray border p-6 transition-colors"
              >
                <div className="mb-3 flex items-center space-x-3">
                  <Filter size={24} className="text-primary" />
                  <h3 className="neue-haas-grotesk-display text-foreground text-lg">
                    詳細フィルター
                  </h3>
                </div>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  技術タグやカテゴリで絞り込み
                </p>
                <div className="text-primary mt-2 text-xs font-medium group-hover:underline">
                  フィルター →
                </div>
              </Link>
            </div>
          </section>

          {/* Featured Works */}
          <section>
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              注目の作品
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Link
                href="/portfolio/detail/portfolio-1"
                className="group border-foreground/20 bg-gray/50 overflow-hidden border transition-shadow hover:shadow-lg"
              >
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <Code size={48} className="text-primary/60" />
                </div>
                <div className="p-6">
                  <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg transition-colors">
                    React Portfolio Website
                  </h3>
                  <p className="noto-sans-jp text-foreground/70 mb-3 text-sm">
                    Modern portfolio website built with React and Next.js featuring responsive
                    design and interactive animations.
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs">
                      React
                    </span>
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs">
                      Next.js
                    </span>
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs">
                      TypeScript
                    </span>
                  </div>
                  <div className="text-primary text-xs font-medium group-hover:underline">
                    詳細を見る →
                  </div>
                </div>
              </Link>

              <Link
                href="/portfolio/detail/portfolio-2"
                className="group border-foreground/20 bg-gray/50 overflow-hidden border transition-shadow hover:shadow-lg"
              >
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Video size={48} className="text-primary/60" />
                </div>
                <div className="p-6">
                  <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg transition-colors">
                    Music Video Production
                  </h3>
                  <p className="noto-sans-jp text-foreground/70 mb-3 text-sm">
                    Creative music video production featuring advanced visual effects and
                    cinematography for emerging artist.
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs">
                      After Effects
                    </span>
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs">
                      Premiere Pro
                    </span>
                  </div>
                  <div className="text-primary text-xs font-medium group-hover:underline">
                    詳細を見る →
                  </div>
                </div>
              </Link>

              <Link
                href="/portfolio/detail/portfolio-3"
                className="group border-foreground/20 bg-gray/50 overflow-hidden border transition-shadow hover:shadow-lg"
              >
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Palette size={48} className="text-primary/60" />
                </div>
                <div className="p-6">
                  <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg transition-colors">
                    Brand Identity Design
                  </h3>
                  <p className="noto-sans-jp text-foreground/70 mb-3 text-sm">
                    Complete brand identity design including logo, color palette, typography, and
                    brand guidelines for tech startup.
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs">
                      Brand Design
                    </span>
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs">
                      Logo Design
                    </span>
                  </div>
                  <div className="text-primary text-xs font-medium group-hover:underline">
                    詳細を見る →
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
              Contact
            </Link>
            <Link href="/about" className="text-foreground/60 hover:text-primary text-sm">
              About
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
