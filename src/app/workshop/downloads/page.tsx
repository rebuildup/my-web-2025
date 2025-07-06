import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Download, 
  FileText, 
  Image, 
  Video, 
  Palette, 
  Star, 
  Calendar, 
  Eye, 
  Heart,
  Share2,
  Bookmark,
  Tag,
  Search,
  Filter,
  Grid,
  List,
  Award,
  TrendingUp,
  Shield,
  CheckCircle,
  Package,
  Zap,
  Users
} from 'lucide-react';

export const metadata: Metadata = {
  title: '素材ダウンロード - samuido Workshop | テンプレート・デザイン素材',
  description: 'After Effectsテンプレート、Figmaデザインキット、アイコン、カラーパレットなどの素材を無料・有料で配布。',
  keywords: ['素材', 'テンプレート', 'After Effects', 'Figma', 'デザインキット', 'アイコン', 'カラーパレット'],
  openGraph: {
    title: '素材ダウンロード - samuido Workshop | テンプレート・デザイン素材',
    description: 'After Effectsテンプレート、Figmaデザインキット、アイコン、カラーパレットなどの素材を無料・有料で配布。',
    type: 'website',
    url: '/workshop/downloads',
  },
  twitter: {
    card: 'summary_large_image',
    title: '素材ダウンロード - samuido Workshop | テンプレート・デザイン素材',
    description: 'After Effectsテンプレート、Figmaデザインキット、アイコン、カラーパレットなどの素材を無料・有料で配布。',
    creator: '@361do_design',
  },
};

const materials = [
  {
    id: 'modern-ui-kit',
    name: 'Modern UI Design Kit',
    description: 'モダンなWebアプリケーション用UIコンポーネントの包括的なデザインキット。Figma形式で提供。',
    category: 'Design Kit',
    type: 'figma',
    price: 'Free',
    downloads: 2847,
    rating: 4.9,
    reviews: 156,
    lastUpdated: '2024-12-20',
    fileSize: '15.2 MB',
    formats: ['Figma', 'Sketch'],
    license: 'MIT',
    features: [
      '200+ UIコンポーネント',
      'ダークモード対応',
      'レスポンシブ対応',
      'カラーバリエーション',
    ],
    tags: ['UI/UX', 'Figma', 'コンポーネント', 'ダークモード'],
    featured: true,
    preview: '/images/downloads/modern-ui-kit-preview.jpg',
  },
  {
    id: 'ae-motion-graphics-pack',
    name: 'Motion Graphics Pack Vol.1',
    description: 'ビジネス・テクノロジー系の映像制作に使えるモーショングラフィックステンプレート集。',
    category: 'After Effects',
    type: 'template',
    price: '¥2,980',
    downloads: 1563,
    rating: 4.7,
    reviews: 89,
    lastUpdated: '2024-11-28',
    fileSize: '245 MB',
    formats: ['After Effects Project', 'MP4 Preview'],
    license: 'Commercial',
    features: [
      '25個のテンプレート',
      '4K解像度対応',
      'カラーカスタマイズ',
      '使用方法動画付き',
    ],
    tags: ['After Effects', 'モーション', 'ビジネス', 'テクノロジー'],
    featured: true,
    preview: '/images/downloads/motion-graphics-preview.jpg',
  },
  {
    id: 'icon-set-minimal',
    name: 'Minimal Icon Set',
    description: 'シンプルで汎用性の高いミニマルアイコンセット。SVG、PNG形式で300個のアイコンを収録。',
    category: 'Icons',
    type: 'icon',
    price: 'Free',
    downloads: 3421,
    rating: 4.6,
    reviews: 201,
    lastUpdated: '2024-10-15',
    fileSize: '8.5 MB',
    formats: ['SVG', 'PNG', 'AI'],
    license: 'CC BY 4.0',
    features: [
      '300個のアイコン',
      '複数サイズ対応',
      'ベクター形式',
      'カテゴリ別整理',
    ],
    tags: ['アイコン', 'ミニマル', 'SVG', 'UI'],
    featured: false,
    preview: '/images/downloads/icon-set-preview.jpg',
  },
  {
    id: 'color-palette-collection',
    name: 'Color Palette Collection 2025',
    description: '2025年のトレンドカラーを取り入れたカラーパレットコレクション。Adobe Swatches形式で提供。',
    category: 'Color Palette',
    type: 'palette',
    price: 'Free',
    downloads: 1876,
    rating: 4.8,
    reviews: 124,
    lastUpdated: '2024-12-01',
    fileSize: '2.1 MB',
    formats: ['ASE', 'ACO', 'JSON'],
    license: 'CC0',
    features: [
      '50種類のパレット',
      'トレンドカラー',
      'Adobe対応',
      'アクセシビリティ配慮',
    ],
    tags: ['カラー', 'パレット', 'トレンド', '2025'],
    featured: true,
    preview: '/images/downloads/color-palette-preview.jpg',
  },
  {
    id: 'presentation-templates',
    name: 'Clean Presentation Templates',
    description: 'ビジネスプレゼンテーション用のクリーンなテンプレートセット。PowerPoint、Keynote対応。',
    category: 'Presentation',
    type: 'template',
    price: '¥1,480',
    downloads: 892,
    rating: 4.5,
    reviews: 67,
    lastUpdated: '2024-09-20',
    fileSize: '125 MB',
    formats: ['PowerPoint', 'Keynote', 'Google Slides'],
    license: 'Commercial',
    features: [
      '50種類のスライド',
      'インフォグラフィック',
      'アニメーション付き',
      'フォント情報付き',
    ],
    tags: ['プレゼンテーション', 'ビジネス', 'PowerPoint', 'Keynote'],
    featured: false,
    preview: '/images/downloads/presentation-preview.jpg',
  },
  {
    id: 'web-backgrounds',
    name: 'Abstract Web Backgrounds',
    description: 'Webサイトやアプリの背景に使える抽象的なグラフィック素材集。高解像度PNG形式。',
    category: 'Graphics',
    type: 'image',
    price: 'Free',
    downloads: 2134,
    rating: 4.4,
    reviews: 156,
    lastUpdated: '2024-08-12',
    fileSize: '78 MB',
    formats: ['PNG', 'JPG', 'PSD'],
    license: 'CC BY 4.0',
    features: [
      '40種類の背景',
      '4K解像度',
      'レイヤー付きPSD',
      '商用利用可能',
    ],
    tags: ['背景', 'グラフィック', 'Web', '抽象'],
    featured: false,
    preview: '/images/downloads/web-backgrounds-preview.jpg',
  },
];

const categories = [
  { name: 'すべて', slug: 'all', count: materials.length, icon: <Package size={16} /> },
  { name: 'Design Kit', slug: 'design-kit', count: materials.filter(m => m.category === 'Design Kit').length, icon: <Palette size={16} /> },
  { name: 'After Effects', slug: 'ae', count: materials.filter(m => m.category === 'After Effects').length, icon: <Video size={16} /> },
  { name: 'Icons', slug: 'icons', count: materials.filter(m => m.category === 'Icons').length, icon: <Image size={16} /> },
  { name: 'Color Palette', slug: 'color', count: materials.filter(m => m.category === 'Color Palette').length, icon: <Palette size={16} /> },
  { name: 'Graphics', slug: 'graphics', count: materials.filter(m => m.category === 'Graphics').length, icon: <Image size={16} /> },
];

const featuredMaterials = materials.filter(material => material.featured);
const popularTags = ['UI/UX', 'After Effects', 'アイコン', 'カラー', 'ビジネス', 'ミニマル', 'モーション', 'Web'];

const stats = {
  totalMaterials: materials.length,
  totalDownloads: materials.reduce((sum, material) => sum + material.downloads, 0),
  averageRating: (materials.reduce((sum, material) => sum + material.rating, 0) / materials.length).toFixed(1),
  freeMaterials: materials.filter(material => material.price === 'Free').length,
};

const licenses = [
  {
    name: 'MIT License',
    description: 'The MIT License is a permissive free software license.',
    shortDesc: '商用利用可・改変可・再配布可',
    color: 'bg-green-100 text-green-800',
  },
  {
    name: 'CC BY 4.0',
    description: 'Creative Commons Attribution 4.0 International License.',
    shortDesc: '商用利用可・クレジット表記必要',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    name: 'CC0',
    description: 'Creative Commons Zero - Public Domain Dedication.',
    shortDesc: '制限なし・パブリックドメイン',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    name: 'Commercial',
    description: 'Commercial license for business use.',
    shortDesc: '商用ライセンス・購入者のみ',
    color: 'bg-yellow-100 text-yellow-800',
  },
];

export default function DownloadsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'samuido Workshop Downloads',
    description: 'デザイン素材、テンプレート、アイコンなどの配布',
    url: 'https://yusuke-kim.com/workshop/downloads',
    author: {
      '@type': 'Person',
      name: 'samuido',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: materials.map((material, index) => ({
        '@type': 'CreativeWork',
        position: index + 1,
        name: material.name,
        description: material.description,
        category: material.category,
        license: material.license,
      })),
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
              href="/workshop"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Workshop
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-12 text-center">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center">
            <Download size={40} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
            Downloads
          </h1>
          <p className="noto-sans-jp text-foreground/80 text-lg md:text-xl">
            テンプレート・デザイン素材・アイコン
          </p>
          <div className="bg-gradient-to-r from-red-600 to-pink-600 mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 pb-16">
          {/* Stats */}
          <section className="mb-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="text-primary text-3xl font-bold">{stats.totalMaterials}</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">素材数</div>
              </div>

              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="text-primary text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">総ダウンロード数</div>
              </div>

              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="text-primary text-3xl font-bold">{stats.averageRating}</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">平均評価</div>
              </div>

              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="text-primary text-3xl font-bold">{stats.freeMaterials}</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">無料素材</div>
              </div>
            </div>
          </section>

          {/* Search and Controls */}
          <section className="mb-12">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              {/* Search */}
              <div className="relative max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <input
                  type="text"
                  placeholder="素材を検索..."
                  className="border-foreground/20 bg-gray/50 text-foreground w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button className="text-foreground/60 hover:text-primary p-2 rounded">
                    <Grid size={20} />
                  </button>
                  <button className="text-foreground/60 hover:text-primary p-2 rounded">
                    <List size={20} />
                  </button>
                  <button className="text-foreground/60 hover:text-primary p-2 rounded">
                    <Filter size={20} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="mb-12">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  className="border-foreground/20 text-foreground hover:border-primary hover:text-primary border px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <span className="text-xs opacity-60">({category.count})</span>
                </button>
              ))}
            </div>
          </section>

          {/* Featured Materials */}
          {featuredMaterials.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center space-x-2 mb-8">
                <Award size={24} className="text-primary" />
                <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                  おすすめ素材
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {featuredMaterials.slice(0, 2).map((material) => (
                  <div
                    key={material.id}
                    className="border-foreground/20 bg-gray/50 border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Preview */}
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 h-48 flex items-center justify-center">
                      <div className="text-white text-6xl opacity-70">
                        {material.type === 'figma' && <Palette size={48} />}
                        {material.type === 'template' && <Video size={48} />}
                        {material.type === 'icon' && <Image size={48} />}
                        {material.type === 'palette' && <Palette size={48} />}
                        {material.type === 'image' && <Image size={48} />}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-primary bg-primary/10 px-3 py-1 rounded text-sm font-medium">
                          {material.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star size={16} className="text-yellow-500" />
                          <span className="text-foreground/80 text-sm">{material.rating}</span>
                        </div>
                      </div>

                      <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-xl">
                        {material.name}
                      </h3>
                      <p className="noto-sans-jp text-foreground/80 mb-4 leading-relaxed">
                        {material.description}
                      </p>

                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="neue-haas-grotesk-display text-foreground mb-2 text-sm">
                          含まれる内容:
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {material.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle size={14} className="text-primary" />
                              <span className="noto-sans-jp text-foreground/80 text-xs">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray/30 rounded">
                          <div className="text-primary text-sm font-bold">{material.downloads.toLocaleString()}</div>
                          <div className="text-foreground/60 text-xs">DL</div>
                        </div>
                        <div className="text-center p-2 bg-gray/30 rounded">
                          <div className="text-primary text-sm font-bold">{material.fileSize}</div>
                          <div className="text-foreground/60 text-xs">Size</div>
                        </div>
                        <div className="text-center p-2 bg-gray/30 rounded">
                          <div className="text-primary text-sm font-bold">{material.price}</div>
                          <div className="text-foreground/60 text-xs">Price</div>
                        </div>
                        <div className="text-center p-2 bg-gray/30 rounded">
                          <div className={`text-xs font-bold px-1 py-1 rounded ${
                            licenses.find(l => l.name === material.license)?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {material.license}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button className="bg-primary hover:bg-primary/90 text-white flex-1 px-4 py-3 rounded flex items-center justify-center space-x-2 transition-colors">
                          <Download size={16} />
                          <span>ダウンロード</span>
                        </button>
                        <button className="border-foreground/20 text-foreground hover:border-primary border px-4 py-3 rounded">
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Materials */}
          <section className="mb-16">
            <div className="flex items-center space-x-2 mb-8">
              <TrendingUp size={24} className="text-primary" />
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                すべての素材
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 border rounded-lg overflow-hidden transition-colors"
                >
                  {/* Preview */}
                  <div className="bg-gradient-to-r from-gray-400 to-gray-600 h-32 flex items-center justify-center">
                    <div className="text-white text-4xl opacity-70">
                      {material.type === 'figma' && <Palette size={32} />}
                      {material.type === 'template' && <Video size={32} />}
                      {material.type === 'icon' && <Image size={32} />}
                      {material.type === 'palette' && <Palette size={32} />}
                      {material.type === 'image' && <Image size={32} />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-medium">
                        {material.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="text-foreground/80 text-sm">{material.rating}</span>
                      </div>
                    </div>

                    <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                      {material.name}
                    </h3>
                    <p className="noto-sans-jp text-foreground/80 mb-3 text-sm leading-relaxed line-clamp-2">
                      {material.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {material.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-primary bg-primary/10 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between mb-3 text-foreground/60 text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Download size={10} />
                          <span>{material.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={10} />
                          <span>{material.lastUpdated}</span>
                        </div>
                      </div>
                      <div className="text-primary font-medium">
                        {material.price}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded text-sm transition-colors">
                        ダウンロード
                      </button>

                      <div className="flex items-center space-x-2">
                        <button className="text-foreground/60 hover:text-red-500 p-1 rounded">
                          <Heart size={14} />
                        </button>
                        <button className="text-foreground/60 hover:text-primary p-1 rounded">
                          <Bookmark size={14} />
                        </button>
                        <button className="text-foreground/60 hover:text-primary p-1 rounded">
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* License Information */}
          <section className="mb-16">
            <div className="flex items-center space-x-2 mb-6">
              <Shield size={24} className="text-primary" />
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                ライセンス情報
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {licenses.map((license) => (
                <div
                  key={license.name}
                  className="border-foreground/20 bg-gray/50 border rounded-lg p-4"
                >
                  <div className={`${license.color} px-3 py-1 rounded text-sm font-medium mb-3`}>
                    {license.name}
                  </div>
                  <p className="noto-sans-jp text-foreground/80 text-sm leading-relaxed">
                    {license.shortDesc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Tags */}
          <section className="mb-16">
            <div className="flex items-center space-x-2 mb-6">
              <Tag size={24} className="text-primary" />
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                人気のタグ
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  className="border-foreground/20 text-foreground hover:border-primary hover:text-primary border px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </section>

          {/* Community */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 rounded-lg p-8">
              <Users size={48} className="text-red-600 mx-auto mb-4" />
              <h2 className="neue-haas-grotesk-display text-red-800 mb-4 text-2xl">
                コミュニティ・リクエスト
              </h2>
              <p className="noto-sans-jp text-red-700 mb-6 leading-relaxed">
                欲しい素材やテンプレートのリクエスト、制作した素材の共有など
                <br />
                コミュニティでの交流をお待ちしています。
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <a
                  href="mailto:361do.sleep@gmail.com"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Package size={20} />
                  <span>素材をリクエスト</span>
                </a>

                <Link
                  href="/contact"
                  className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Zap size={20} />
                  <span>フィードバック</span>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido Workshop Downloads. Create amazing things! 🎨
          </p>
        </footer>
      </div>
    </>
  );
}