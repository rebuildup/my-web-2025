import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Grid, List, Play, Code } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Design Playground - samuido | デザインプレイグラウンド',
  description:
    'samuidoのデザインプレイグラウンド。デザインの実験や試作品を自由に展示し、デザインの可能性を探ります。',
  keywords: 'デザインプレイグラウンド, デザイン実験, インタラクティブ, CSS, JavaScript, WebGL',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/02_portfolio/playground/design',
  },
  openGraph: {
    title: 'Design Playground - samuido | デザインプレイグラウンド',
    description:
      'samuidoのデザインプレイグラウンド。デザインの実験や試作品を自由に展示し、デザインの可能性を探ります。',
    type: 'website',
    url: 'https://yusuke-kim.com/02_portfolio/playground/design',
    images: [
      {
        url: 'https://yusuke-kim.com/portfolio/playground-design-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Design Playground - samuido | デザインプレイグラウンド',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Playground - samuido | デザインプレイグラウンド',
    description:
      'samuidoのデザインプレイグラウンド。デザインの実験や試作品を自由に展示し、デザインの可能性を探ります。',
    images: ['https://yusuke-kim.com/portfolio/playground-design-twitter-image.jpg'],
    creator: '@361do_design',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'samuido Design Playground',
  description: 'デザインプレイグラウンド',
  url: 'https://yusuke-kim.com/02_portfolio/playground/design',
  mainEntity: {
    '@type': 'ItemList',
    name: 'デザイン実験一覧',
    description: 'デザインの実験や試作品の一覧',
  },
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
};

// サンプルデザイン実験データ
const sampleDesignExperiments = [
  {
    id: 1,
    title: 'CSS Animation Experiments',
    description:
      'CSSアニメーションを使った様々な実験。ホバーエフェクト、トランジション、キーフレームアニメーション。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Animation',
    technology: ['CSS', 'HTML', 'JavaScript'],
    year: 2025,
    interactive: true,
    experimentType: 'CSS Animation',
    demoLink: '/playground/css-animations',
    codeLink: 'https://github.com/samuido/css-experiments',
  },
  {
    id: 2,
    title: 'Interactive Color Palette',
    description: 'インタラクティブなカラーパレット生成器。マウス操作でリアルタイムにカラーを変更。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Interactive',
    technology: ['JavaScript', 'Canvas', 'CSS'],
    year: 2024,
    interactive: true,
    experimentType: 'Color Theory',
    demoLink: '/playground/color-palette',
    codeLink: 'https://github.com/samuido/color-experiments',
  },
  {
    id: 3,
    title: 'Typography Experiments',
    description: 'タイポグラフィの実験。フォント、サイズ、スペーシングの動的変更。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Typography',
    technology: ['CSS', 'JavaScript', 'Web Fonts'],
    year: 2024,
    interactive: true,
    experimentType: 'Typography',
    demoLink: '/playground/typography',
    codeLink: 'https://github.com/samuido/typography-experiments',
  },
  {
    id: 4,
    title: 'Particle System',
    description:
      'JavaScriptで制作したパーティクルシステム。マウスに反応するインタラクティブなパーティクル。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Particles',
    technology: ['JavaScript', 'Canvas', 'Math'],
    year: 2023,
    interactive: true,
    experimentType: 'Particle System',
    demoLink: '/playground/particles',
    codeLink: 'https://github.com/samuido/particle-experiments',
  },
  {
    id: 5,
    title: '3D CSS Transformations',
    description: 'CSS 3D変換を使った実験。キューブ、カード、オブジェクトの3D回転。',
    thumbnail: '/api/placeholder/400/300',
    category: '3D',
    technology: ['CSS', '3D Transforms', 'JavaScript'],
    year: 2023,
    interactive: true,
    experimentType: '3D CSS',
    demoLink: '/playground/3d-css',
    codeLink: 'https://github.com/samuido/3d-experiments',
  },
  {
    id: 6,
    title: 'Generative Art',
    description: 'アルゴリズムを使ったジェネラティブアート。数学的パターンの生成。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Generative',
    technology: ['JavaScript', 'Canvas', 'Math'],
    year: 2023,
    interactive: true,
    experimentType: 'Generative Art',
    demoLink: '/playground/generative',
    codeLink: 'https://github.com/samuido/generative-experiments',
  },
];

export default function DesignPlaygroundPage() {
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
              Design Playground
            </h1>
            <p className="noto-sans-jp-regular text-lg text-gray-300">
              デザインの実験や試作品を自由に展示し、デザインの可能性を探る
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
                    placeholder="実験を検索..."
                    className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-400" />
                  <select className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">全カテゴリ</option>
                    <option value="animation">Animation</option>
                    <option value="interactive">Interactive</option>
                    <option value="typography">Typography</option>
                    <option value="particles">Particles</option>
                    <option value="3d">3D</option>
                    <option value="generative">Generative</option>
                  </select>
                  <select className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">全技術</option>
                    <option value="css">CSS</option>
                    <option value="javascript">JavaScript</option>
                    <option value="canvas">Canvas</option>
                    <option value="webgl">WebGL</option>
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

        {/* Experiments Grid */}
        <section className="py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sampleDesignExperiments.map(experiment => (
              <div
                key={experiment.id}
                className="card group cursor-pointer transition-all hover:border-blue-500"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded bg-gray-700">
                  <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                  {/* インタラクティブアイコン */}
                  {experiment.interactive && (
                    <div className="absolute top-2 right-2">
                      <div className="rounded-full bg-green-600 p-1">
                        <Play size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="bg-blue-600 px-2 py-1 text-xs text-white">
                    {experiment.category}
                  </span>
                  <span className="text-xs text-gray-500">{experiment.year}</span>
                </div>
                <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white group-hover:text-blue-400">
                  {experiment.title}
                </h3>
                <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                  {experiment.description}
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {experiment.technology.slice(0, 3).map(tech => (
                    <span key={tech} className="bg-gray-600 px-2 py-1 text-xs text-white">
                      {tech}
                    </span>
                  ))}
                  {experiment.technology.length > 3 && (
                    <span className="bg-gray-600 px-2 py-1 text-xs text-white">
                      +{experiment.technology.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {experiment.demoLink && (
                    <Link
                      href={experiment.demoLink}
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Play size={16} />
                      デモを見る
                    </Link>
                  )}
                  {experiment.codeLink && (
                    <a
                      href={experiment.codeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
                    >
                      <Code size={16} />
                      コード
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
                href="/02_portfolio/playground/webgl"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                WebGL Playground →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
