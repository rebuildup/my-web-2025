import { Metadata } from "next";
import Link from "next/link";
import { Palette, Video, Lightbulb, Eye } from "lucide-react";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { VideoDesignGallery } from "./components/VideoDesignGallery";

export const metadata: Metadata = {
  title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
  description:
    "samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
  keywords: [
    "映像デザイン",
    "デザインコンセプト",
    "映像表現",
    "クリエイティブ",
    "ビジュアルデザイン",
    "コンセプトアート",
    "映像制作",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio/gallery/video&design",
  },
  openGraph: {
    title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
    description:
      "samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
    type: "website",
    url: "https://yusuke-kim.com/portfolio/gallery/video&design",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio/gallery-video-design-og-image.png",
        width: 1200,
        height: 630,
        alt: "Video & Design Projects - Portfolio",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
    description:
      "samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
    images: [
      "https://yusuke-kim.com/portfolio/gallery-video-design-twitter-image.jpg",
    ],
    creator: "@361do_design",
  },
};

// デザインアプローチ
const designApproaches = {
  concept: {
    title: "Concept Development",
    description:
      "プロジェクトの核となるコンセプトを明確化し、一貫したビジュアル言語を構築",
    methods: [
      "ブレインストーミング",
      "ムードボード作成",
      "コンセプトマップ",
      "ビジュアルリサーチ",
    ],
  },
  visual: {
    title: "Visual Language",
    description: "色彩、形状、タイポグラフィを統合したビジュアルシステムの設計",
    methods: [
      "カラーパレット",
      "タイポグラフィシステム",
      "グリッドシステム",
      "アイコンデザイン",
    ],
  },
  motion: {
    title: "Motion Design",
    description: "時間軸を活用した動的な表現とユーザー体験の設計",
    methods: [
      "タイミング設計",
      "イージング調整",
      "トランジション",
      "インタラクション",
    ],
  },
  integration: {
    title: "System Integration",
    description: "デザインと映像を統合した一貫性のあるブランド体験の構築",
    methods: [
      "ブランドガイドライン",
      "モーションガイドライン",
      "実装仕様",
      "品質管理",
    ],
  },
};

export default async function VideoDesignProjectsPage() {
  console.log("=== VideoDesignProjectsPage EXECUTED ===");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Timestamp:", new Date().toISOString());

  try {
    // Get portfolio data with minimal error handling
    console.log("Fetching portfolio data...");
    const items = await portfolioDataManager.getPortfolioData(false);

    // Filter for video&design category items
    // Show video items and design items that have video-related content
    const videoDesignItems = items.filter(
      (item) =>
        item.category === "video&design" ||
        item.category === "video" ||
        (item.category === "design" &&
          ((item.videos && item.videos.length > 0) ||
            (item.tags &&
              (item.tags.some((tag) => tag.toLowerCase().includes("video")) ||
                item.tags.some((tag) => tag.toLowerCase().includes("motion")) ||
                item.tags.some((tag) =>
                  tag.toLowerCase().includes("animation"),
                ))))),
    );

    console.log("Video&Design page debug:", {
      totalItems: items.length,
      videoDesignItems: videoDesignItems.length,
      categories: videoDesignItems.map((item) => item.category),
      itemsWithVideos: videoDesignItems.filter(
        (item) => item.videos && item.videos.length > 0,
      ).length,
    });

    // Generate SEO metadata and structured data
    let structuredData = null;
    try {
      const seoGenerator = new PortfolioSEOMetadataGenerator(
        portfolioDataManager,
      );
      const seoData =
        await seoGenerator.generateGalleryMetadata("video&design");
      structuredData = seoData.structuredData;
    } catch (seoError) {
      console.error("SEO generation error:", seoError);
    }

    const Global_title = "noto-sans-jp-regular text-base leading-snug";

    return (
      <>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}

        <div className="min-h-screen bg-background text-foreground">
          <main className="py-10">
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
                    Video & Design
                  </h1>
                  <p className="noto-sans-jp-light text-sm max-w leading-loose">
                    デザインコンセプトと映像表現を融合した創造的なプロジェクト集です.
                    <br />
                    クリエイティブな意図と視覚的な表現手法を重視して紹介しています.
                    <br />
                    縦3列グリッドでコンテンツに応じたサイズの独特なギャラリー表現を実現しています.
                  </p>
                </header>

                {/* Design Approach */}
                <section>
                  <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                    Design Approach
                  </h2>
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
                    {Object.entries(designApproaches).map(([key, approach]) => (
                      <div
                        key={key}
                        className="bg-base border border-foreground p-4 space-y-4"
                      >
                        <div className="flex items-center">
                          {key === "concept" && (
                            <Lightbulb className="w-6 h-6 text-accent mr-3" />
                          )}
                          {key === "visual" && (
                            <Palette className="w-6 h-6 text-accent mr-3" />
                          )}
                          {key === "motion" && (
                            <Video className="w-6 h-6 text-accent mr-3" />
                          )}
                          {key === "integration" && (
                            <Eye className="w-6 h-6 text-accent mr-3" />
                          )}
                          <h3 className="zen-kaku-gothic-new text-lg text-primary">
                            {approach.title}
                          </h3>
                        </div>
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          {approach.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {approach.methods.map((method) => (
                            <span
                              key={method}
                              className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Main Gallery */}
                <section>
                  <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                    Video & Design Gallery
                  </h2>
                  {videoDesignItems.length > 0 ? (
                    <VideoDesignGallery items={videoDesignItems} />
                  ) : (
                    <div className="bg-base border border-foreground p-8 text-center">
                      <Eye className="w-12 h-12 text-accent mx-auto mb-4" />
                      <h3 className="zen-kaku-gothic-new text-xl text-primary mb-2">
                        No video & design projects found
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        Video and design projects will appear here once they are
                        published.
                      </p>
                    </div>
                  )}
                </section>

                {/* Global Functions */}
                <nav aria-label="Video & Design gallery functions">
                  <h3 className="sr-only">Video & Design Gallery機能</h3>
                  <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                    <Link
                      href="/portfolio/gallery/all"
                      className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <span className={Global_title}>All Projects</span>
                    </Link>

                    <Link
                      href="/portfolio/gallery/video"
                      className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <span className={Global_title}>Video Only</span>
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
                      © 2025 samuido - Video & Design Projects
                    </p>
                  </div>
                </footer>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error in VideoDesignProjectsPage:", error);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <div className="container-system">
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-800">
                Error loading video & design gallery:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
