import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Grid, List, Play, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Video Works - samuido | 映像作品ギャラリー',
  description:
    'samuidoの映像作品ギャラリー。MV、リリックモーション、アニメーション、プロモーション映像などの作品を一覧でご覧いただけます。',
  keywords: '映像作品, MV, リリックモーション, アニメーション, プロモーション映像, foriio',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/02_portfolio/gallery/video',
  },
  openGraph: {
    title: 'Video Works - samuido | 映像作品ギャラリー',
    description:
      'samuidoの映像作品ギャラリー。MV、リリックモーション、アニメーション、プロモーション映像などの作品を一覧でご覧いただけます。',
    type: 'website',
    url: 'https://yusuke-kim.com/02_portfolio/gallery/video',
    images: [
      {
        url: 'https://yusuke-kim.com/portfolio/gallery-video-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Video Works - samuido | 映像作品ギャラリー',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Works - samuido | 映像作品ギャラリー',
    description:
      'samuidoの映像作品ギャラリー。MV、リリックモーション、アニメーション、プロモーション映像などの作品を一覧でご覧いただけます。',
    images: ['https://yusuke-kim.com/portfolio/gallery-video-twitter-image.jpg'],
    creator: '@361do_design',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'samuido Video Works Gallery',
  description: '映像作品ギャラリー',
  url: 'https://yusuke-kim.com/02_portfolio/gallery/video',
  mainEntity: {
    '@type': 'ItemList',
    name: '映像作品一覧',
    description: 'MV、リリックモーション、アニメーション、プロモーション映像などの作品',
  },
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
};

// サンプル映像作品データ
const sampleVideoWorks = [
  {
    id: 1,
    title: 'Music Video - "Future Dreams"',
    description:
      'アーティストの楽曲に合わせたミュージックビデオ制作。モーショングラフィックスと実写を組み合わせた作品。',
    thumbnail: '/api/placeholder/400/300',
    category: 'MV',
    year: 2025,
    duration: '3:45',
    software: ['After Effects', 'Premiere Pro', 'Cinema 4D'],
    externalLink: 'https://youtube.com/watch?v=example1',
    previewVideo: 'https://youtube.com/watch?v=example1',
  },
  {
    id: 2,
    title: 'Lyric Motion - "Digital Love"',
    description:
      '歌詞に合わせたリリックモーション制作。タイポグラフィとアニメーションを組み合わせた作品。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Lyric Motion',
    year: 2024,
    duration: '4:12',
    software: ['After Effects', 'Illustrator', 'Photoshop'],
    externalLink: 'https://youtube.com/watch?v=example2',
    previewVideo: 'https://youtube.com/watch?v=example2',
  },
  {
    id: 3,
    title: 'Animation - "The Journey"',
    description:
      '2Dアニメーション作品。キャラクターアニメーションと背景アートを組み合わせた物語性のある作品。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Animation',
    year: 2024,
    duration: '2:30',
    software: ['After Effects', 'Photoshop', 'Illustrator'],
    externalLink: 'https://youtube.com/watch?v=example3',
    previewVideo: 'https://youtube.com/watch?v=example3',
  },
  {
    id: 4,
    title: 'Promotion Video - "Tech Startup"',
    description:
      'テックスタートアップ企業のプロモーション映像。モダンでクリーンなデザインで企業イメージを表現。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Promotion',
    year: 2023,
    duration: '1:15',
    software: ['After Effects', 'Premiere Pro', 'Cinema 4D'],
    externalLink: 'https://youtube.com/watch?v=example4',
    previewVideo: 'https://youtube.com/watch?v=example4',
  },
  {
    id: 5,
    title: 'Motion Graphics Reel',
    description:
      'モーショングラフィックス作品集。様々なテクニックとスタイルを組み合わせたショーリール。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Motion Graphics',
    year: 2023,
    duration: '1:30',
    software: ['After Effects', 'Cinema 4D', 'Trapcode Suite'],
    externalLink: 'https://youtube.com/watch?v=example5',
    previewVideo: 'https://youtube.com/watch?v=example5',
  },
  {
    id: 6,
    title: 'Commercial - "Product Launch"',
    description: '新製品ローンチのコマーシャル映像。製品の特徴を魅力的に表現した作品。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Commercial',
    year: 2023,
    duration: '0:30',
    software: ['After Effects', 'Premiere Pro', 'Cinema 4D'],
    externalLink: 'https://youtube.com/watch?v=example6',
    previewVideo: 'https://youtube.com/watch?v=example6',
  },
];

export default function VideoWorksGalleryPage() {
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
              Video Works
            </h1>
            <p className="noto-sans-jp-regular text-lg text-gray-300">
              foriioライクな映像作品ギャラリー
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
                    <option value="mv">MV</option>
                    <option value="lyric-motion">Lyric Motion</option>
                    <option value="animation">Animation</option>
                    <option value="promotion">Promotion</option>
                    <option value="motion-graphics">Motion Graphics</option>
                    <option value="commercial">Commercial</option>
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

        {/* Works Grid - foriioライク */}
        <section className="py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {sampleVideoWorks.map(work => (
              <div key={work.id} className="group cursor-pointer">
                {/* サムネイル */}
                <div className="relative mb-4 aspect-video overflow-hidden rounded bg-gray-700">
                  <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                  {/* 再生ボタン */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white">
                      <Play size={24} fill="white" />
                    </div>
                  </div>
                  {/* カテゴリと時間 */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <span className="bg-blue-600 px-2 py-1 text-xs text-white">
                      {work.category}
                    </span>
                    <span className="bg-black/50 px-2 py-1 text-xs text-white">
                      {work.duration}
                    </span>
                  </div>
                </div>

                {/* タイトルと説明 */}
                <div className="mb-4">
                  <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white group-hover:text-blue-400">
                    {work.title}
                  </h3>
                  <p className="noto-sans-jp-light text-sm text-gray-400">{work.description}</p>
                </div>

                {/* 使用ソフトウェア */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {work.software.slice(0, 3).map(software => (
                    <span key={software} className="bg-gray-600 px-2 py-1 text-xs text-white">
                      {software}
                    </span>
                  ))}
                  {work.software.length > 3 && (
                    <span className="bg-gray-600 px-2 py-1 text-xs text-white">
                      +{work.software.length - 3}
                    </span>
                  )}
                </div>

                {/* リンク */}
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
                  {work.previewVideo && (
                    <a
                      href={work.previewVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                    >
                      <Play size={16} />
                      プレビュー
                    </a>
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
