import { Metadata } from "next";
import Link from "next/link";
import { Video, Play, Clock, Calendar, Youtube } from "lucide-react";

export const metadata: Metadata = {
  title: "Video Detail - Portfolio | samuido 映像制作詳細",
  description:
    "samuidoの映像制作プロジェクトの詳細ページ。制作プロセス、使用ソフトウェア、技術手法、制作期間を含む包括的な情報。",
  keywords: [
    "映像制作詳細",
    "制作プロセス",
    "After Effects",
    "Premiere Pro",
    "モーショングラフィックス",
    "制作期間",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio/detail/video",
  },
  openGraph: {
    title: "Video Detail - Portfolio | samuido 映像制作詳細",
    description:
      "samuidoの映像制作プロジェクトの詳細ページ。制作プロセス、使用ソフトウェア、技術手法、制作期間を含む包括的な情報。",
    type: "article",
    url: "https://yusuke-kim.com/portfolio/detail/video",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio/detail-video-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Video Detail - Portfolio",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Detail - Portfolio | samuido 映像制作詳細",
    description:
      "samuidoの映像制作プロジェクトの詳細ページ。制作プロセス、使用ソフトウェア、技術手法、制作期間を含む包括的な情報。",
    images: ["https://yusuke-kim.com/portfolio/detail-video-twitter-image.jpg"],
    creator: "@361do_design",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Video Production Details",
  description: "映像制作プロセスと技術手法の詳細解説",
  url: "https://yusuke-kim.com/portfolio/detail/video",
  creator: {
    "@type": "Person",
    name: "木村友亮",
    alternateName: "samuido",
  },
  genre: "Motion Graphics",
};

// サンプル映像プロジェクトデータ（実際の実装では動的に取得）
const videoData = {
  id: "music-video-animation",
  title: "Music Video Animation",
  description:
    "After Effectsを使用したリリックモーション制作。歌詞に合わせたタイポグラフィアニメーションと視覚効果。",
  category: "MV制作",
  duration: "3:24",
  productionTime: "2週間",
  date: "2024-12",
  software: ["After Effects", "Illustrator", "Photoshop", "Audition"],
  youtubeId: "dQw4w9WgXcQ",
  vimeoId: null,
  highlights: ["Typography Animation", "Lyric Sync", "Color Grading"],
  client: "Independent Artist",
  budget: "Medium",
  teamSize: "Solo Project",
};

// 制作プロセスの詳細
const productionProcess = {
  preproduction: {
    title: "プリプロダクション",
    description: "企画・コンセプト開発・準備段階",
    duration: "3日",
    tasks: [
      "楽曲分析と歌詞理解",
      "ビジュアルコンセプトの開発",
      "カラーパレットの決定",
      "タイポグラフィスタイルの選定",
      "ストーリーボード作成",
    ],
  },
  production: {
    title: "プロダクション",
    description: "実際の映像制作・アニメーション作業",
    duration: "8日",
    tasks: [
      "タイポグラフィアニメーション制作",
      "背景エレメントの作成",
      "パーティクルエフェクトの実装",
      "音楽との同期調整",
      "トランジション効果の追加",
    ],
  },
  postproduction: {
    title: "ポストプロダクション",
    description: "最終調整・カラーグレーディング・書き出し",
    duration: "3日",
    tasks: [
      "カラーグレーディング",
      "音声レベル調整",
      "最終レンダリング",
      "品質チェック",
      "各種フォーマット書き出し",
    ],
  },
};

// 技術手法の詳細
const technicalMethods = {
  typography: {
    title: "タイポグラフィアニメーション",
    description: "歌詞に合わせた文字の動きと表現",
    techniques: [
      "キネティックタイポグラフィ",
      "文字の出現・消失アニメーション",
      "音楽のリズムに合わせたタイミング調整",
      "感情表現のための文字変形",
    ],
  },
  effects: {
    title: "視覚効果",
    description: "映像を彩る各種エフェクト",
    techniques: [
      "パーティクルシステム",
      "グロー・ブラー効果",
      "カラーコレクション",
      "レンズフレア効果",
    ],
  },
  animation: {
    title: "アニメーション技法",
    description: "滑らかで印象的な動きの実現",
    techniques: [
      "イージング調整",
      "モーションブラー",
      "レイヤー管理",
      "キーフレーム最適化",
    ],
  },
  workflow: {
    title: "ワークフロー",
    description: "効率的な制作プロセス",
    techniques: [
      "プロジェクト管理",
      "アセット整理",
      "バックアップ戦略",
      "レンダリング最適化",
    ],
  },
};

// 使用ソフトウェアの詳細
const softwareDetails = [
  {
    name: "After Effects",
    usage: "メインアニメーション制作",
    features: [
      "タイポグラフィアニメーション",
      "エフェクト処理",
      "コンポジション管理",
    ],
    version: "2024",
  },
  {
    name: "Illustrator",
    usage: "ベクターグラフィック作成",
    features: ["ロゴデザイン", "アイコン作成", "ベクター素材"],
    version: "2024",
  },
  {
    name: "Photoshop",
    usage: "画像処理・テクスチャ作成",
    features: ["画像補正", "テクスチャ作成", "マスク処理"],
    version: "2024",
  },
  {
    name: "Audition",
    usage: "音声処理・同期",
    features: ["音声編集", "ノイズ除去", "レベル調整"],
    version: "2024",
  },
];

export default function VideoDetailPage() {
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
                <nav className="mb-6">
                  <Link
                    href="/portfolio/gallery/video"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Video Gallery に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Video Detail
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  映像制作プロジェクトの制作プロセスと技術手法を詳しく紹介します.
                  <br />
                  使用ソフトウェア、制作期間、技術的な工夫を含む包括的な情報です.
                </p>
              </header>

              {/* Video Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Video Overview
                </h2>
                <div className="grid-system grid-1 lg:grid-2 gap-6">
                  {/* Video Player */}
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative">
                      <Play className="w-16 h-16 text-accent" />
                      <div className="absolute top-2 left-2 bg-background px-2 py-1">
                        <span className="noto-sans-jp-light text-xs text-foreground">
                          {videoData.duration}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        {videoData.youtubeId && (
                          <Youtube className="w-5 h-5 text-accent" />
                        )}
                        {videoData.vimeoId && (
                          <Video className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {videoData.youtubeId && (
                        <a
                          href={`https://youtube.com/watch?v=${videoData.youtubeId}`}
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
                      {videoData.vimeoId && (
                        <a
                          href={`https://vimeo.com/${videoData.vimeoId}`}
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

                  {/* Project Info */}
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-xl text-primary">
                      {videoData.title}
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                      {videoData.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Video className="w-5 h-5 text-accent mr-2" />
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          Category: {videoData.category}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-accent mr-2" />
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          Production Time: {videoData.productionTime}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-accent mr-2" />
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          Completed: {videoData.date}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-foreground">
                      <h4 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                        Key Highlights
                      </h4>
                      <div className="space-y-2">
                        {videoData.highlights.map((highlight, index) => (
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
                        Project Details
                      </h4>
                      <div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-4">
                        <div>
                          <span className="noto-sans-jp-light text-xs text-accent">
                            Client:
                          </span>
                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {videoData.client}
                          </p>
                        </div>
                        <div>
                          <span className="noto-sans-jp-light text-xs text-accent">
                            Team Size:
                          </span>
                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {videoData.teamSize}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Production Process */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Production Process
                </h2>
                <div className="space-y-6">
                  {Object.entries(productionProcess).map(([key, process]) => (
                    <div
                      key={key}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          {process.title}
                        </h3>
                        <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                          {process.duration}
                        </span>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {process.description}
                      </p>
                      <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-5 gap-2">
                        {process.tasks.map((task, index) => (
                          <div
                            key={index}
                            className="bg-background border border-foreground p-2 text-center"
                          >
                            <span className="noto-sans-jp-light text-xs text-foreground">
                              {task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Technical Methods */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Technical Methods
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {Object.entries(technicalMethods).map(([key, method]) => (
                    <div
                      key={key}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        {method.title}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {method.description}
                      </p>
                      <div className="space-y-2">
                        {method.techniques.map((technique, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-1 h-1 bg-accent mt-2 mr-3 flex-shrink-0"></div>
                            <span className="noto-sans-jp-light text-sm text-foreground">
                              {technique}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Software Details */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Software & Tools
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {softwareDetails.map((software, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          {software.name}
                        </h3>
                        <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                          {software.version}
                        </span>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {software.usage}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {software.features.map((feature) => (
                          <span
                            key={feature}
                            className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Navigation */}
              <nav aria-label="Video detail navigation">
                <h3 className="sr-only">Video Detail機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/video"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>More Videos</span>
                  </Link>

                  <Link
                    href="/portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Portfolio Home</span>
                  </Link>

                  <Link
                    href="/about/commission/video"
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
                    © 2025 samuido - Video Project Detail
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
