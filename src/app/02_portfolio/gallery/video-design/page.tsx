import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Grid, List, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Video & Design Works - samuido | 映像&デザイン作品ギャラリー',
  description:
    'samuidoの映像&デザイン作品ギャラリー。映像とデザインを組み合わせた作品を独特なグリッドレイアウトでご覧いただけます。',
  keywords: '映像&デザイン, 映像作品, デザイン作品, グリッドレイアウト, アスペクト比',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/02_portfolio/gallery/video-design',
  },
  openGraph: {
    title: 'Video & Design Works - samuido | 映像&デザイン作品ギャラリー',
    description:
      'samuidoの映像&デザイン作品ギャラリー。映像とデザインを組み合わせた作品を独特なグリッドレイアウトでご覧いただけます。',
    type: 'website',
    url: 'https://yusuke-kim.com/02_portfolio/gallery/video-design',
    images: [
      {
        url: 'https://yusuke-kim.com/portfolio/gallery-video-design-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Video & Design Works - samuido | 映像&デザイン作品ギャラリー',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video & Design Works - samuido | 映像&デザイン作品ギャラリー',
    description:
      'samuidoの映像&デザイン作品ギャラリー。映像とデザインを組み合わせた作品を独特なグリッドレイアウトでご覧いただけます。',
    images: ['https://yusuke-kim.com/portfolio/gallery-video-design-twitter-image.jpg'],
    creator: '@361do_design',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'samuido Video & Design Works Gallery',
  description: '映像&デザイン作品ギャラリー',
  url: 'https://yusuke-kim.com/02_portfolio/gallery/video-design',
  mainEntity: {
    '@type': 'ItemList',
    name: '映像&デザイン作品一覧',
    description: '映像とデザインを組み合わせた作品の一覧',
  },
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
};

// サンプル映像&デザイン作品データ
const sampleVideoDesignWorks = [
  {
    id: 1,
    title: 'Brand Identity + Motion Graphics',
    description: '企業のブランドアイデンティティとモーショングラフィックスを組み合わせた作品。',
    thumbnail: '/api/placeholder/400/600',
    category: 'Brand Design',
    year: 2025,
    aspectRatio: 'portrait',
    sizeType: '1x2',
    externalLink: 'https://behance.net/example1',
    detailLink: '/02_portfolio/detail/brand-motion',
  },
  {
    id: 2,
    title: 'Web Design + UI Animation',
    description: 'WebデザインとUIアニメーションを組み合わせたインタラクティブな作品。',
    thumbnail: '/api/placeholder/600/400',
    category: 'Web Design',
    year: 2024,
    aspectRatio: 'landscape',
    sizeType: '2x1',
    externalLink: 'https://dribbble.com/example2',
    detailLink: '/02_portfolio/detail/web-ui',
  },
  {
    id: 3,
    title: 'Graphic Design + Video',
    description: 'グラフィックデザインと映像を組み合わせたマルチメディア作品。',
    thumbnail: '/api/placeholder/400/400',
    category: 'Graphic Design',
    year: 2024,
    aspectRatio: 'square',
    sizeType: '1x1',
    externalLink: 'https://behance.net/example3',
    detailLink: '/02_portfolio/detail/graphic-video',
  },
  {
    id: 4,
    title: 'UI/UX + Motion Design',
    description: 'UI/UXデザインとモーションデザインを組み合わせたデジタルプロダクト。',
    thumbnail: '/api/placeholder/600/600',
    category: 'UI/UX',
    year: 2024,
    aspectRatio: 'square',
    sizeType: '2x2',
    externalLink: 'https://dribbble.com/example4',
    detailLink: '/02_portfolio/detail/ui-motion',
  },
  {
    id: 5,
    title: 'Illustration + Animation',
    description: 'イラストレーションとアニメーションを組み合わせたストーリーテリング作品。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Illustration',
    year: 2023,
    aspectRatio: 'landscape',
    sizeType: '1x3',
    externalLink: 'https://behance.net/example5',
    detailLink: '/02_portfolio/detail/illustration-animation',
  },
  {
    id: 6,
    title: 'Typography + Motion',
    description: 'タイポグラフィとモーションを組み合わせたタイポグラフィック作品。',
    thumbnail: '/api/placeholder/300/400',
    category: 'Typography',
    year: 2023,
    aspectRatio: 'portrait',
    sizeType: '1x2',
    externalLink: 'https://dribbble.com/example6',
    detailLink: '/02_portfolio/detail/typography-motion',
  },
];

export default function VideoDesignWorksGalleryPage() {
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
              Video & Design Works
            </h1>
            <p className="noto-sans-jp-regular text-lg text-gray-300">
              映像とデザインを組み合わせた作品を縦3列グリッドで表示
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
                    <option value="brand-design">Brand Design</option>
                    <option value="web-design">Web Design</option>
                    <option value="graphic-design">Graphic Design</option>
                    <option value="ui-ux">UI/UX</option>
                    <option value="illustration">Illustration</option>
                    <option value="typography">Typography</option>
                  </select>
                  <select className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">全サイズ</option>
                    <option value="portrait">縦長</option>
                    <option value="landscape">横長</option>
                    <option value="square">正方形</option>
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

        {/* Works Grid - 縦3列グリッド */}
        <section className="py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sampleVideoDesignWorks.map(work => (
              <div
                key={work.id}
                className={`group cursor-pointer ${
                  work.sizeType === '2x2' ? 'xl:col-span-2 xl:row-span-2' : ''
                } ${work.sizeType === '1x3' ? 'xl:col-span-3' : ''}`}
              >
                <div className="relative overflow-hidden rounded bg-gray-700">
                  {/* サムネイル */}
                  <div
                    className={`bg-gradient-to-br from-gray-600 to-gray-800 ${
                      work.sizeType === '2x2'
                        ? 'aspect-square'
                        : work.sizeType === '1x3'
                          ? 'aspect-[3/1]'
                          : work.aspectRatio === 'portrait'
                            ? 'aspect-[2/3]'
                            : work.aspectRatio === 'landscape'
                              ? 'aspect-[3/2]'
                              : 'aspect-square'
                    }`}
                  ></div>

                  {/* ホバーオーバーレイ */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-full flex-col justify-between p-6">
                      <div>
                        <span className="bg-blue-600 px-2 py-1 text-xs text-white">
                          {work.category}
                        </span>
                      </div>
                      <div>
                        <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                          {work.title}
                        </h3>
                        <p className="noto-sans-jp-light mb-4 text-sm text-gray-300">
                          {work.description}
                        </p>
                        <div className="flex gap-3">
                          {work.externalLink && (
                            <a
                              href={work.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink size={16} />
                              作品を見る
                            </a>
                          )}
                          {work.detailLink && (
                            <Link
                              href={work.detailLink}
                              className="text-sm text-gray-400 hover:text-gray-300"
                            >
                              詳細 →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* カテゴリラベル */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 px-2 py-1 text-xs text-white">
                      {work.category}
                    </span>
                  </div>
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
                href="/02_portfolio/gallery/all"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                All Works →
              </Link>
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
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
