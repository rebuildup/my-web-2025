import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Download, Puzzle, Calendar, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Workshop - samuido | ブログ・プラグイン・ダウンロード",
  description: "Web開発、映像制作、デザインに関するブログ記事、After Effectsプラグイン、素材ダウンロードコンテンツを提供。",
  keywords: ["ブログ", "プラグイン", "ダウンロード", "After Effects", "Web開発", "映像制作", "デザイン", "チュートリアル"],
  robots: "index, follow",
  openGraph: {
    title: "Workshop - samuido | ブログ・プラグイン・ダウンロード",
    description: "Web開発、映像制作、デザインに関するブログ記事、After Effectsプラグイン、素材ダウンロードコンテンツを提供。",
    type: "website",
    url: "/workshop",
    images: [
      {
        url: "/workshop-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Workshop samuido",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Workshop - samuido | ブログ・プラグイン・ダウンロード",
    description: "Web開発、映像制作、デザインに関するブログ記事、After Effectsプラグイン、素材ダウンロードコンテンツを提供。",
    images: ["/workshop-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

interface WorkshopCategory {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  count: number;
  lastUpdated: string;
}

const workshopCategories: WorkshopCategory[] = [
  {
    id: "blog",
    title: "Blog",
    description: "技術ブログ・記事",
    detailedDescription: "Web開発、映像制作、デザインに関する実践的な記事とチュートリアル。最新技術の解説から実務に役立つTipsまで幅広く投稿。",
    href: "/workshop/blog",
    icon: <BookOpen size={32} />,
    color: "border-blue-500",
    features: ["技術記事", "チュートリアル", "実践Tips", "最新技術解説"],
    count: 15,
    lastUpdated: "2024.12.10",
  },
  {
    id: "downloads",
    title: "Downloads",
    description: "素材・テンプレート",
    detailedDescription: "After Effects テンプレート、デザイン素材、アイコンセット、カラーパレットなど、クリエイティブワークに役立つ素材の配布。",
    href: "/workshop/downloads",
    icon: <Download size={32} />,
    color: "border-green-500",
    features: ["AEテンプレート", "デザイン素材", "アイコンセット", "フリー素材"],
    count: 8,
    lastUpdated: "2024.12.05",
  },
  {
    id: "plugins",
    title: "Plugins",
    description: "プラグイン・ツール",
    detailedDescription: "After Effects プラグイン、Webブラウザ拡張機能、開発ツールなど、作業効率を向上させるプラグインの開発・配布。",
    href: "/workshop/plugins",
    icon: <Puzzle size={32} />,
    color: "border-purple-500",
    features: ["AEプラグイン", "ブラウザ拡張", "開発ツール", "オープンソース"],
    count: 6,
    lastUpdated: "2024.12.01",
  },
];

export default function WorkshopPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Workshop - samuido",
    "description": "Web開発、映像制作、デザインに関するブログ記事、プラグイン、ダウンロードコンテンツ",
    "url": "https://yusuke-kim.com/workshop",
    "mainEntity": {
      "@type": "ItemList",
      "name": "ワークショップコンテンツ",
      "description": "ブログ記事、プラグイン、ダウンロード素材のコレクション"
    },
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80"
            >
              ← Home
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-16 px-4">
          <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-6">
            Workshop
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="noto-sans-jp text-xl md:text-2xl text-foreground/80 leading-relaxed mb-8">
              技術ブログ、プラグイン開発、素材配布<br />
              クリエイティブワークを支援するコンテンツを提供
            </p>
          </div>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {/* Statistics Overview */}
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  29
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  総コンテンツ数
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  15
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  ブログ記事
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  8
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  ダウンロード
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  6
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  プラグイン
                </div>
              </div>
            </div>
          </section>

          {/* Workshop Categories */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              ワークショップカテゴリ
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-4xl mx-auto">
              {workshopCategories.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className={`group block p-8 border-2 ${category.color} bg-gray transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                >
                  <div className="flex items-start space-x-6">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {category.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="neue-haas-grotesk-display text-2xl text-foreground">
                          {category.title}
                        </h3>
                        <div className="text-sm text-primary font-medium">
                          {category.count}件
                        </div>
                      </div>
                      
                      <p className="zen-kaku-gothic-new text-lg text-primary mb-3">
                        {category.description}
                      </p>
                      
                      <p className="noto-sans-jp text-sm text-foreground/70 leading-relaxed mb-4">
                        {category.detailedDescription}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <h4 className="noto-sans-jp text-xs text-foreground/60 font-medium">
                          コンテンツ内容：
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-1 bg-foreground/10 text-foreground/70 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-foreground/50">
                          最終更新: {category.lastUpdated}
                        </div>
                        <div className="text-primary text-sm font-medium group-hover:underline">
                          詳細を見る →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Latest Content */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              最新のコンテンツ
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/workshop/blog/nextjs-15-react-19"
                className="group border border-foreground/20 bg-gray/50 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <BookOpen size={20} className="text-primary" />
                  <span className="text-xs text-foreground/50">Blog</span>
                </div>
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  Next.js 15 & React 19 解説
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-3 leading-relaxed">
                  最新のNext.js 15とReact 19の新機能について、実際のプロジェクトでの活用方法を解説。
                </p>
                <div className="flex items-center justify-between text-xs text-foreground/50">
                  <span>2024.12.10</span>
                  <span className="text-primary group-hover:underline">続きを読む →</span>
                </div>
              </Link>
              
              <Link
                href="/workshop/downloads/ae-motion-templates"
                className="group border border-foreground/20 bg-gray/50 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Download size={20} className="text-primary" />
                  <span className="text-xs text-foreground/50">Downloads</span>
                </div>
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  モーショングラフィックステンプレート集
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-3 leading-relaxed">
                  After Effectsで使用できるモーショングラフィックステンプレート。ロゴアニメーション、トランジション等。
                </p>
                <div className="flex items-center justify-between text-xs text-foreground/50">
                  <span>2024.12.05</span>
                  <span className="text-primary group-hover:underline">ダウンロード →</span>
                </div>
              </Link>
              
              <Link
                href="/workshop/plugins/sequential-png-preview"
                className="group border border-foreground/20 bg-gray/50 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Puzzle size={20} className="text-primary" />
                  <span className="text-xs text-foreground/50">Plugins</span>
                </div>
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  Sequential PNG Preview
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-3 leading-relaxed">
                  連番PNGファイルをプレビューできるAfter Effectsプラグイン。フレームレート調整、書き出し機能付き。
                </p>
                <div className="flex items-center justify-between text-xs text-foreground/50">
                  <span>2024.12.01</span>
                  <span className="text-primary group-hover:underline">詳細を見る →</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              クイックアクション
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link
                href="/workshop/blog?sort=latest"
                className="group p-6 border border-foreground/20 bg-gray/50 hover:bg-gray transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar size={24} className="text-primary" />
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground">
                    最新記事
                  </h3>
                </div>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  新着順で並んだブログ記事を表示
                </p>
                <div className="text-primary text-xs font-medium group-hover:underline mt-2">
                  記事一覧 →
                </div>
              </Link>
              
              <Link
                href="/workshop/downloads?category=popular"
                className="group p-6 border border-foreground/20 bg-gray/50 hover:bg-gray transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp size={24} className="text-primary" />
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground">
                    人気ダウンロード
                  </h3>
                </div>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  ダウンロード数の多い素材・テンプレート
                </p>
                <div className="text-primary text-xs font-medium group-hover:underline mt-2">
                  素材一覧 →
                </div>
              </Link>
              
              <Link
                href="/search?type=workshop"
                className="group p-6 border border-foreground/20 bg-gray/50 hover:bg-gray transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Users size={24} className="text-primary" />
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground">
                    コミュニティ
                  </h3>
                </div>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  コンテンツ検索とコミュニティ機能
                </p>
                <div className="text-primary text-xs font-medium group-hover:underline mt-2">
                  検索・交流 →
                </div>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-8 text-center">
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