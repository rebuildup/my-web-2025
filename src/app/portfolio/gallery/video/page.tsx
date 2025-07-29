import { Metadata } from "next";
import Link from "next/link";
import { ContentItem } from "@/types";

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
        url: "https://yusuke-kim.com/portfolio/gallery-video-og-image.png",
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

// Fetch video portfolio data using data manager (consistent with other pages)
async function getVideoPortfolioData(): Promise<ContentItem[]> {
  try {
    const { portfolioDataManager } = await import(
      "@/lib/portfolio/data-manager"
    );

    // Get all portfolio data and filter for video category
    const allItems = await portfolioDataManager.getPortfolioData(false);
    const videoItems = allItems.filter((item) => item.category === "video");

    console.log(
      `Data manager: Found ${videoItems.length} video items out of ${allItems.length} total items`,
    );

    // Sort by updatedAt desc
    const sortedItems = videoItems.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime(),
    );

    return sortedItems;
  } catch (error) {
    console.error("Error fetching video portfolio data:", error);
    return [];
  }
}

import VideoGallery from "./components/VideoGallery";

export default async function VideoProjectsPage() {
  const videoItems = await getVideoPortfolioData();

  // Debug information for development
  if (process.env.NODE_ENV === "development") {
    console.log("Video page debug:", {
      totalVideoItems: videoItems.length,
      videoCategories: videoItems.map((item) => item.category),
      videoTitles: videoItems.map((item) => item.title).slice(0, 5),
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "samuido Video Projects",
    description: "MV制作、モーショングラフィックス、アニメーション作品集",
    url: "https://yusuke-kim.com/portfolio/gallery/video",
    mainEntity: {
      "@type": "ItemList",
      name: "Video Projects",
      numberOfItems: videoItems.length,
    },
  };
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

              {/* Video Gallery */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Video Projects ({videoItems.length})
                </h2>
                {process.env.NODE_ENV === "development" && (
                  <div className="mb-4 p-2 bg-gray-100 text-gray-800 text-xs">
                    Debug: Loaded {videoItems.length} video items
                  </div>
                )}
                <VideoGallery items={videoItems} />
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
