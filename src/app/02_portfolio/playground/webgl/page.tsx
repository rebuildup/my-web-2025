import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Grid, List, Play, Code, Box } from 'lucide-react';

export const metadata: Metadata = {
  title: 'WebGL Playground - samuido | WebGLプレイグラウンド',
  description:
    'samuidoのWebGLプレイグラウンド。WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示し、WebGLの可能性を探ります。',
  keywords: 'WebGLプレイグラウンド, 3Dグラフィックス, シェーダー, Three.js, GLSL, WebGL',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/02_portfolio/playground/webgl',
  },
  openGraph: {
    title: 'WebGL Playground - samuido | WebGLプレイグラウンド',
    description:
      'samuidoのWebGLプレイグラウンド。WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示し、WebGLの可能性を探ります。',
    type: 'website',
    url: 'https://yusuke-kim.com/02_portfolio/playground/webgl',
    images: [
      {
        url: 'https://yusuke-kim.com/portfolio/playground-webgl-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WebGL Playground - samuido | WebGLプレイグラウンド',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebGL Playground - samuido | WebGLプレイグラウンド',
    description:
      'samuidoのWebGLプレイグラウンド。WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示し、WebGLの可能性を探ります。',
    images: ['https://yusuke-kim.com/portfolio/playground-webgl-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'samuido WebGL Playground',
  description: 'WebGLプレイグラウンド',
  url: 'https://yusuke-kim.com/02_portfolio/playground/webgl',
  mainEntity: {
    '@type': 'ItemList',
    name: 'WebGL実験一覧',
    description: 'WebGLを使った3Dグラフィックスやシェーダーの実験一覧',
  },
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
};

// サンプルWebGL実験データ
const sampleWebGLExperiments = [
  {
    id: 1,
    title: 'Three.js Particle System',
    description: 'Three.jsを使用したパーティクルシステム。マウス操作でパーティクルを制御できます。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Particles',
    technology: ['Three.js', 'WebGL', 'JavaScript', 'GLSL'],
    year: 2025,
    interactive: true,
    webglType: 'Particle System',
    demoLink: '/playground/three-particles',
    codeLink: 'https://github.com/samuido/three-particles',
  },
  {
    id: 2,
    title: 'Custom Shader Experiments',
    description:
      'カスタムシェーダーを使った実験。頂点シェーダーとフラグメントシェーダーの組み合わせ。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Shaders',
    technology: ['WebGL', 'GLSL', 'JavaScript'],
    year: 2024,
    interactive: true,
    webglType: 'Custom Shaders',
    demoLink: '/playground/custom-shaders',
    codeLink: 'https://github.com/samuido/custom-shaders',
  },
  {
    id: 3,
    title: '3D Model Viewer',
    description: '3Dモデルビューアー。OBJファイルの読み込みと表示、マウスでの回転操作。',
    thumbnail: '/api/placeholder/400/300',
    category: '3D Models',
    technology: ['Three.js', 'WebGL', 'OBJ Loader'],
    year: 2024,
    interactive: true,
    webglType: '3D Models',
    demoLink: '/playground/3d-viewer',
    codeLink: 'https://github.com/samuido/3d-viewer',
  },
  {
    id: 4,
    title: 'Post-Processing Effects',
    description: 'ポストプロセシングエフェクト。ブルーム、ドップ、モーションブラーなどの効果。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Effects',
    technology: ['Three.js', 'WebGL', 'Post-Processing'],
    year: 2023,
    interactive: true,
    webglType: 'Post-Processing',
    demoLink: '/playground/post-processing',
    codeLink: 'https://github.com/samuido/post-processing',
  },
  {
    id: 5,
    title: 'Procedural Terrain',
    description: 'プロシージャル地形生成。ノイズ関数を使った地形の自動生成。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Terrain',
    technology: ['WebGL', 'GLSL', 'Noise Functions'],
    year: 2023,
    interactive: true,
    webglType: 'Procedural Generation',
    demoLink: '/playground/terrain',
    codeLink: 'https://github.com/samuido/terrain-generation',
  },
  {
    id: 6,
    title: 'Real-time Reflections',
    description: 'リアルタイム反射。環境マッピングとキューブマップを使った反射効果。',
    thumbnail: '/api/placeholder/400/300',
    category: 'Reflections',
    technology: ['Three.js', 'WebGL', 'Cubemap'],
    year: 2023,
    interactive: true,
    webglType: 'Reflections',
    demoLink: '/playground/reflections',
    codeLink: 'https://github.com/samuido/reflections',
  },
];

export default function WebGLPlaygroundPage() {
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
              WebGL Playground
            </h1>
            <p className="noto-sans-jp-regular text-lg text-gray-300">
              WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示
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
                    <option value="particles">Particles</option>
                    <option value="shaders">Shaders</option>
                    <option value="3d-models">3D Models</option>
                    <option value="effects">Effects</option>
                    <option value="terrain">Terrain</option>
                    <option value="reflections">Reflections</option>
                  </select>
                  <select className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">全技術</option>
                    <option value="threejs">Three.js</option>
                    <option value="webgl">WebGL</option>
                    <option value="glsl">GLSL</option>
                    <option value="babylonjs">Babylon.js</option>
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
            {sampleWebGLExperiments.map(experiment => (
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
                  {/* WebGLアイコン */}
                  <div className="absolute top-2 left-2">
                    <div className="rounded-full bg-purple-600 p-1">
                      <Box size={12} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="bg-purple-600 px-2 py-1 text-xs text-white">
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
                href="/02_portfolio/playground/design"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Design Playground →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
