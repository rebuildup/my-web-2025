import { Metadata } from "next";
import Link from "next/link";
import { Video, Play, Clock, Calendar, Youtube } from "lucide-react";

export const metadata: Metadata = {
  title: "Video Projects - Portfolio | samuido 映像制作作品集",
  description:
    "samuidoの映像制作作品集。MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介。",
  keywords: [
    "映像制作",
    "MV制作",
    "モーショングラフィックス",
    "アニメーション",
    "After Effects",
    "Premiere Pro",
    "YouTube",
    "Vimeo",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio/gallery/video",
  },
  openGraph: {
    title: "Video Projects - Portfolio | samuido 映像制作作品集",
    description:
      "samuidoの映像制作作品集。MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介。",
    type: "website",
    url: "https://yusuke-kim.com/portfolio/gallery/video",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio/gallery-video-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Video Projects - Portfolio",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Projects - Portfolio | samuido 映像制作作品集",
    description:
      "samuidoの映像制作作品集。MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介。",
    images: [
      "https://yusuke-kim.com/portfolio/gallery-video-twitter-image.jpg",
    ],
    creator: "@361do_design",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "samuido Video Projects",
  description: "MV制作、モーショングラフィックス、アニメーション作品集",
  url: "https://yusuke-kim.com/portfolio/gallery/video",
  mainEntity: {
    "@type": "ItemList",
    name: "Video Projects",
    numberOfItems: 8,
  },
};

// 映像プロジェクトデータ（実際の実装では動的に取得）
const videoProjects = [
  {
    id: "music-video-animation",
    title: "Music Video Animation",
    description:
      "After Effectsを使用したリリックモーション制作。歌詞に合わせたタイポグラフィアニメーション。",
    category: "MV制作",
    duration: "3:24",
    software: ["After Effects", "Illustrator", "Photoshop"],
    productionTime: "2週間",
    youtubeId: "dQw4w9WgXcQ",
    vimeoId: null,
    date: "2024-12",
    featured: true,
    highlights: ["Typography Animation", "Lyric Sync", "Color Grading"],
  },
  {
    id: "motion-graphics-reel",
    title: "Motion Graphics Reel 2024",
    description:
      "2024年制作のモーショングラフィックス作品をまとめたリール映像。",
    category: "リール",
    duration: "1:30",
    software: ["After Effects", "Cinema 4D", "Illustrator"],
    productionTime: "1週間",
    youtubeId: "dQw4w9WgXcQ",
    vimeoId: "123456789",
    date: "2024-11",
    featured: true,
    highlights: ["3D Integration", "Smooth Transitions", "Brand Consistency"],
  },
  {
    id: "product-promo-video",
    title: "Product Promotion Video",
    description:
      "スタートアップ企業の製品プロモーション映像。3Dモデリングとアニメーションを組み合わせ。",
    category: "プロモーション",
    duration: "2:15",
    software: ["After Effects", "Blender", "Premiere Pro"],
    productionTime: "3週間",
    youtubeId: null,
    vimeoId: "987654321",
    date: "2024-10",
    featured: false,
    highlights: ["3D Modeling", "Product Visualization", "Corporate Branding"],
  },
  {
    id: "logo-animation",
    title: "Logo Animation Collection",
    description:
      "様々なブランドのロゴアニメーション集。シンプルで印象的な動きを重視。",
    category: "ロゴアニメーション",
    duration: "0:45",
    software: ["After Effects", "Illustrator"],
    productionTime: "1週間",
    youtubeId: "dQw4w9WgXcQ",
    vimeoId: null,
    date: "2024-09",
    featured: false,
    highlights: ["Brand Identity", "Minimal Design", "Smooth Motion"],
  },
  {
    id: "event-opening-video",
    title: "Event Opening Video",
    description:
      "技術カンファレンスのオープニング映像。パーティクルエフェクトとタイポグラフィ。",
    category: "イベント映像",
    duration: "1:00",
    software: ["After Effects", "Trapcode Suite", "Photoshop"],
    productionTime: "2週間",
    youtubeId: "dQw4w9WgXcQ",
    vimeoId: "456789123",
    date: "2024-08",
    featured: true,
    highlights: ["Particle Effects", "Event Branding", "Dynamic Typography"],
  },
  {
    id: "tutorial-animation",
    title: "Tutorial Animation Series",
    description:
      "ソフトウェアの使い方を説明するチュートリアルアニメーション。分かりやすい視覚表現。",
    category: "チュートリアル",
    duration: "5:30",
    software: ["After Effects", "Illustrator", "Premiere Pro"],
    productionTime: "1ヶ月",
    youtubeId: "dQw4w9WgXcQ",
    vimeoId: null,
    date: "2024-07",
    featured: false,
    highlights: [
      "Educational Content",
      "Clear Visualization",
      "Step-by-step Guide",
    ],
  },
  {
    id: "abstract-visual",
    title: "Abstract Visual Experiment",
    description:
      "抽象的な視覚表現の実験作品。音楽に合わせたジェネラティブアニメーション。",
    category: "実験映像",
    duration: "2:45",
    software: ["After Effects", "p5.js", "Audition"],
    productionTime: "2週間",
    youtubeId: null,
    vimeoId: "789123456",
    date: "2024-06",
    featured: false,
    highlights: ["Generative Art", "Audio Reactive", "Abstract Expression"],
  },
  {
    id: "social-media-content",
    title: "Social Media Content Pack",
    description:
      "SNS用の短尺映像コンテンツパック。Instagram、TikTok向けの縦型映像。",
    category: "SNSコンテンツ",
    duration: "0:15-0:30",
    software: ["After Effects", "Premiere Pro", "Photoshop"],
    productionTime: "1週間",
    youtubeId: "dQw4w9WgXcQ",
    vimeoId: null,
    date: "2024-05",
    featured: false,
    highlights: ["Vertical Format", "Social Optimization", "Engaging Content"],
  },
];

// ソフトウェア統計
const softwareStats = {
  primary: ["After Effects", "Premiere Pro", "Illustrator", "Photoshop"],
  secondary: ["Blender", "Cinema 4D", "Audition", "p5.js"],
  plugins: ["Trapcode Suite", "Element 3D", "Optical Flares", "Red Giant"],
};

export default function VideoProjectsPage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "MV制作":
        return "primary";
      case "リール":
        return "accent";
      case "プロモーション":
        return "primary";
      case "実験映像":
        return "accent";
      default:
        return "foreground";
    }
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
                    href="/portfolio"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Portfolio に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Video Projects
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  映像制作・モーショングラフィックス・アニメーション作品集です.
                  <br />
                  YouTube・Vimeo埋め込みと制作プロセスを含めて紹介しています.
                </p>
              </header>

              {/* Software Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Production Tools
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-3 gap-6">
                  {Object.entries(softwareStats).map(([category, software]) => (
                    <div
                      key={category}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <h3 className="zen-kaku-gothic-new text-lg text-primary capitalize">
                        {category === "primary" && "Primary Tools"}
                        {category === "secondary" && "Secondary Tools"}
                        {category === "plugins" && "Plugins & Effects"}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {software.map((tool) => (
                          <span
                            key={tool}
                            className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Featured Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Featured Videos
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {videoProjects
                    .filter((project) => project.featured)
                    .map((project) => (
                      <Link
                        key={project.id}
                        href={`/portfolio/detail/video/${project.id}`}
                        className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                      >
                        {/* Video Preview */}
                        <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative">
                          <Play className="w-12 h-12 text-accent" />
                          <div className="absolute top-2 left-2 bg-background px-2 py-1">
                            <span className="noto-sans-jp-light text-xs text-foreground">
                              {project.duration}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-2">
                            {project.youtubeId && (
                              <Youtube className="w-4 h-4 text-accent" />
                            )}
                            {project.vimeoId && (
                              <Video className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </div>

                        {/* Project Info */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className={`noto-sans-jp-light text-xs text-${getCategoryColor(project.category)} border border-${getCategoryColor(project.category)} px-2 py-1`}
                            >
                              {project.category}
                            </span>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-foreground mr-1" />
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                {project.date}
                              </span>
                            </div>
                          </div>

                          <h3 className="zen-kaku-gothic-new text-lg text-primary">
                            {project.title}
                          </h3>

                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {project.description}
                          </p>

                          {/* Production Info */}
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-accent mr-2" />
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                制作期間: {project.productionTime}
                              </span>
                            </div>
                          </div>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-1">
                            {project.highlights.map((highlight) => (
                              <span
                                key={highlight}
                                className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>

                          {/* Software */}
                          <div className="flex flex-wrap gap-1">
                            {project.software.map((tool) => (
                              <span
                                key={tool}
                                className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </section>

              {/* All Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  All Video Projects ({videoProjects.length})
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-3 gap-6">
                  {videoProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/portfolio/detail/video/${project.id}`}
                      className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      {/* Video Preview */}
                      <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative">
                        <Play className="w-8 h-8 text-accent" />
                        <div className="absolute top-2 left-2 bg-background px-2 py-1">
                          <span className="noto-sans-jp-light text-xs text-foreground">
                            {project.duration}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          {project.youtubeId && (
                            <Youtube className="w-4 h-4 text-accent" />
                          )}
                          {project.vimeoId && (
                            <Video className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`noto-sans-jp-light text-xs text-${getCategoryColor(project.category)} border border-${getCategoryColor(project.category)} px-2 py-1`}
                          >
                            {project.category}
                          </span>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-foreground mr-1" />
                            <span className="noto-sans-jp-light text-xs text-foreground">
                              {project.date}
                            </span>
                          </div>
                        </div>

                        <h3 className="zen-kaku-gothic-new text-base text-primary">
                          {project.title}
                        </h3>

                        <p className="noto-sans-jp-light text-sm text-foreground line-clamp-2">
                          {project.description}
                        </p>

                        {/* Software */}
                        <div className="flex flex-wrap gap-1">
                          {project.software.slice(0, 3).map((tool) => (
                            <span
                              key={tool}
                              className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                            >
                              {tool}
                            </span>
                          ))}
                          {project.software.length > 3 && (
                            <span className="noto-sans-jp-light text-xs text-foreground px-2 py-1">
                              +{project.software.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Production Time */}
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-foreground mr-1" />
                          <span className="noto-sans-jp-light text-xs text-foreground">
                            {project.productionTime}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Global Functions */}
              <nav aria-label="Video gallery functions">
                <h3 className="sr-only">Video Gallery機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/all"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>All Projects</span>
                  </Link>

                  <Link
                    href="/portfolio/gallery/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Development</span>
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
                    © 2025 samuido - Video Projects
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
