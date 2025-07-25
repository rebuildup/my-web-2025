import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ContentItem } from "@/types/content";

export const metadata: Metadata = {
  title: "Downloads - Workshop | samuido",
  description:
    "テンプレート・素材集・サンプルファイルの配布。クリエイティブ制作に役立つ素材を無料で提供。",
  keywords: [
    "テンプレート",
    "素材集",
    "サンプル",
    "ダウンロード",
    "無料",
    "クリエイティブ",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Downloads - Workshop | samuido",
    description:
      "テンプレート・素材集・サンプルファイルの配布。クリエイティブ制作に役立つ素材を無料で提供。",
    type: "website",
    url: "https://yusuke-kim.com/workshop/downloads",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Downloads - Workshop | samuido",
    description:
      "テンプレート・素材集・サンプルファイルの配布。クリエイティブ制作に役立つ素材を無料で提供。",
    creator: "@361do_sleep",
  },
};

async function getDownloads(): Promise<ContentItem[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/download`,
      {
        next: { revalidate: 300 },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch downloads");
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching downloads:", error);
    return [];
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default async function DownloadsPage() {
  const downloads = await getDownloads();
  const publishedDownloads = downloads.filter(
    (download) => download.status === "published",
  );

  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
  const Card_meta = "noto-sans-jp-light text-xs text-accent";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            <header className="space-y-6">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link
                      href="/workshop"
                      className="text-accent hover:text-primary"
                    >
                      Workshop
                    </Link>
                  </li>
                  <li className="text-foreground">/</li>
                  <li className="text-primary">Downloads</li>
                </ol>
              </nav>
              <h1 className="neue-haas-grotesk-display text-4xl text-primary">
                Downloads
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                テンプレート・素材集・サンプルファイルを無料で配布しています。
                <br />
                クリエイティブ制作にお役立てください。
              </p>
            </header>

            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                統計情報
              </h2>
              <div className="bg-base border border-foreground p-4 text-center">
                <div className="neue-haas-grotesk-display text-2xl text-accent">
                  {publishedDownloads.length}
                </div>
                <div className="noto-sans-jp-light text-xs">素材</div>
              </div>
            </section>

            <section aria-labelledby="downloads-heading">
              <h2
                id="downloads-heading"
                className="neue-haas-grotesk-display text-2xl text-primary mb-6"
              >
                素材一覧
              </h2>

              {publishedDownloads.length > 0 ? (
                <div className="grid-system grid-1 sm:grid-2 gap-6">
                  {publishedDownloads.map((download) => (
                    <Link
                      key={download.id}
                      href={`/workshop/downloads/${download.id}`}
                      className={CardStyle}
                      aria-describedby={`download-${download.id}-description`}
                    >
                      {download.thumbnail && (
                        <div className="aspect-video bg-background border border-foreground relative">
                          <Image
                            src={download.thumbnail}
                            alt={download.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h3 className={Card_title}>{download.title}</h3>
                        <p
                          id={`download-${download.id}-description`}
                          className={Card_description}
                        >
                          {download.description}
                        </p>
                        {download.downloadInfo && (
                          <div className="flex justify-between items-center">
                            <span className={Card_meta}>
                              {download.downloadInfo.fileType.toUpperCase()} •{" "}
                              {formatFileSize(download.downloadInfo.fileSize)}
                            </span>
                            <span className={Card_meta}>
                              {download.downloadInfo.downloadCount} ダウンロード
                            </span>
                          </div>
                        )}
                        {download.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {download.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-background border border-foreground px-2 py-1 text-xs noto-sans-jp-light"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-base border border-foreground p-6">
                  <p className="noto-sans-jp-light text-sm text-center">
                    素材はまだ公開されていません
                  </p>
                </div>
              )}
            </section>

            <nav aria-label="Site navigation">
              <Link
                href="/workshop"
                className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
              >
                <span className="noto-sans-jp-regular text-base leading-snug">
                  ← Workshop
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
