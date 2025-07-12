import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Grid, List } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Works - samuido | 全作品ギャラリー',
  description:
    'samuidoの全作品ギャラリー。Web開発、映像制作、デザイン作品を一覧でご覧いただけます。',
  keywords: 'ポートフォリオ, 作品ギャラリー, Web開発, 映像制作, デザイン, サムネイル',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/02_portfolio/gallery/all',
  },
  openGraph: {
    title: 'All Works - samuido | 全作品ギャラリー',
    description:
      'samuidoの全作品ギャラリー。Web開発、映像制作、デザイン作品を一覧でご覧いただけます。',
    type: 'website',
    url: 'https://yusuke-kim.com/02_portfolio/gallery/all',
    images: [
      {
        url: 'https://yusuke-kim.com/portfolio/gallery-all-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'All Works - samuido | 全作品ギャラリー',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Works - samuido | 全作品ギャラリー',
    description:
      'samuidoの全作品ギャラリー。Web開発、映像制作、デザイン作品を一覧でご覧いただけます。',
    images: ['https://yusuke-kim.com/portfolio/gallery-all-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'samuido All Works Gallery',
  description: '全作品ギャラリー',
  url: 'https://yusuke-kim.com/02_portfolio/gallery/all',
  mainEntity: {
    '@type': 'ItemList',
    name: '作品一覧',
    description: 'Web開発、映像制作、デザイン作品の一覧',
  },
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
};

// サンプル作品データ
const sampleWorks = [
  {
    id: 1,
    title: 'React Portfolio Website',
    category: 'Development',
    description: 'Next.js 15 + React 19 + Tailwind CSSで構築したモダンなポートフォリオサイト。',
    thumbnail: '/api/placeholder/400/300',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    year: 2025,
  },
  {
    id: 2,
    title: 'Motion Graphics Reel',
    category: 'Video',
    description: 'After Effectsを使用したモーショングラフィックス作品集。',
    thumbnail: '/api/placeholder/400/300',
    tags: ['After Effects', 'Motion Graphics', 'Animation'],
    year: 2024,
  },
  {
    id: 3,
    title: 'UI/UX Design System',
    category: 'Design',
    description: 'モダンなWebアプリケーション向けのデザインシステム。',
    thumbnail: '/api/placeholder/400/300',
    tags: ['Figma', 'UI/UX', 'Design System'],
    year: 2024,
  },
  {
    id: 4,
    title: 'WebGL Particle System',
    category: 'Development',
    description: 'Three.jsを使用したインタラクティブなパーティクルシステム。',
    thumbnail: '/api/placeholder/400/300',
    tags: ['Three.js', 'WebGL', 'JavaScript'],
    year: 2024,
  },
  {
    id: 5,
    title: 'Music Video Production',
    category: 'Video',
    description: 'アーティストの楽曲に合わせたミュージックビデオ制作。',
    thumbnail: '/api/placeholder/400/300',
    tags: ['After Effects', 'Premiere Pro', 'Motion Graphics'],
    year: 2023,
  },
  {
    id: 6,
    title: 'Brand Identity Design',
    category: 'Design',
    description: '企業のブランドアイデンティティデザイン。',
    thumbnail: '/api/placeholder/400/300',
    tags: ['Illustrator', 'Photoshop', 'Branding'],
    year: 2023,
  },
];

export default function AllWorksGalleryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-grid">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <div className="container mx-auto">
            <Link
              href="/02_portfolio"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 flex items-center space-x-2 text-xl"
            >
              <ArrowLeft size={20} />
              <span>← Portfolio</span>
            </Link>
          </div>
        </nav>

        {/* Header */}
        <header className="border-foreground/20 border-b">
          <div className="container mx-auto py-8">
            <h1 className="neue-haas-grotesk-display mb-4 text-3xl text-white md:text-4xl">
              All Works Gallery
            </h1>
            <p className="noto-sans-jp-regular text-lg text-gray-300">
              全作品をサムネイル画像のカード一覧で表示
            </p>
          </div>
        </header>

        {/* Filter and Search */}
        <section className="py-8">
          <div className="card">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="作品を検索..."
                    className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-400" />
                  <select className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">全カテゴリ</option>
                    <option value="development">Development</option>
                    <option value="video">Video</option>
                    <option value="design">Design</option>
                  </select>
                  <select className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">全年度</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded border border-gray-600 p-2 text-gray-400 hover:border-blue-500 hover:text-blue-400">
                  <Grid size={20} />
                </button>
                <button className="rounded border border-gray-600 p-2 text-gray-400 hover:border-blue-500 hover:text-blue-400">
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Works Grid */}
        <section className="py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sampleWorks.map(work => (
              <div
                key={work.id}
                className="card group cursor-pointer transition-all hover:border-blue-500"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded bg-gray-700">
                  <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="bg-blue-600 px-2 py-1 text-xs text-white">{work.category}</span>
                  <span className="text-xs text-gray-500">{work.year}</span>
                </div>
                <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white group-hover:text-blue-400">
                  {work.title}
                </h3>
                <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">{work.description}</p>
                <div className="flex flex-wrap gap-2">
                  {work.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="bg-gray-600 px-2 py-1 text-xs text-white">
                      {tag}
                    </span>
                  ))}
                  {work.tags.length > 3 && (
                    <span className="bg-gray-600 px-2 py-1 text-xs text-white">
                      +{work.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Load More */}
        <section className="py-8 text-center">
          <button className="bg-blue-600 px-8 py-3 text-white transition-colors hover:bg-blue-700">
            さらに読み込む
          </button>
        </section>

        {/* Navigation */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/02_portfolio"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Portfolio
            </Link>
            <div className="flex gap-4">
              <Link
                href="/02_portfolio/gallery/develop"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Development →
              </Link>
              <Link
                href="/02_portfolio/gallery/video"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Video →
              </Link>
              <Link
                href="/02_portfolio/gallery/video-design"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Video & Design →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
