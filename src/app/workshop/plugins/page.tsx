import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContentItem } from "@/types/content";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plugins - Workshop | samuido",
  description:
    "AfterEffects・Premiere Pro プラグインの配布。動画制作を効率化するツールを無料で提供。",
  keywords: [
    "AfterEffects",
    "Premiere Pro",
    "プラグイン",
    "動画制作",
    "ツール",
    "無料",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Plugins - Workshop | samuido",
    description:
      "AfterEffects・Premiere Pro プラグインの配布。動画制作を効率化するツールを無料で提供。",
    type: "website",
    url: "https://yusuke-kim.com/workshop/plugins",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plugins - Workshop | samuido",
    description:
      "AfterEffects・Premiere Pro プラグインの配布。動画制作を効率化するツールを無料で提供。",
    creator: "@361do_sleep",
  },
};

async function getPlugins(): Promise<ContentItem[]> {
  try {
    // Skip API calls during build if no base URL is set
    if (
      !process.env.NEXT_PUBLIC_BASE_URL &&
      process.env.NODE_ENV === "production"
    ) {
      return [];
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/plugin`,
      {
        next: { revalidate: 300 },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch plugins");
    }
    const data = await response.json();
    return data.data || [];
  } catch {
    // Silently handle API connection errors during build time
    return [];
  }
}

export default async function PluginsPage() {
  const plugins = await getPlugins();
  const publishedPlugins = plugins.filter(
    (plugin) => plugin.status === "published",
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
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Workshop", href: "/workshop" },
                  { label: "Plugins", isCurrent: true },
                ]}
              />
            </div>
            <header className="space-y-6">
              <h1 className="neue-haas-grotesk-display text-4xl text-primary">
                Plugins
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                AfterEffects・Premiere Pro プラグインを無料で配布しています。
                <br />
                動画制作を効率化するツールをダウンロードしてご利用ください。
              </p>
            </header>

            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                統計情報
              </h2>
              <div className="bg-base border border-foreground p-4 text-center">
                <div className="neue-haas-grotesk-display text-2xl text-accent">
                  {publishedPlugins.length}
                </div>
                <div className="noto-sans-jp-light text-xs">プラグイン</div>
              </div>
            </section>

            <section aria-labelledby="plugins-heading">
              <h2
                id="plugins-heading"
                className="neue-haas-grotesk-display text-2xl text-primary mb-6"
              >
                プラグイン一覧
              </h2>

              {publishedPlugins.length > 0 ? (
                <div className="grid-system grid-1 sm:grid-2 gap-6">
                  {publishedPlugins.map((plugin) => (
                    <Link
                      key={plugin.id}
                      href={`/workshop/plugins/${plugin.id}`}
                      className={CardStyle}
                      aria-describedby={`plugin-${plugin.id}-description`}
                    >
                      {plugin.thumbnail && (
                        <div className="aspect-video bg-background border border-foreground relative">
                          <Image
                            src={plugin.thumbnail}
                            alt={plugin.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h3 className={Card_title}>{plugin.title}</h3>
                        <p
                          id={`plugin-${plugin.id}-description`}
                          className={Card_description}
                        >
                          {plugin.description}
                        </p>
                        {plugin.downloadInfo && (
                          <div className="flex justify-between items-center">
                            <span className={Card_meta}>
                              v{plugin.downloadInfo.version || "1.0.0"}
                            </span>
                            <span className={Card_meta}>
                              {plugin.downloadInfo.downloadCount} ダウンロード
                            </span>
                          </div>
                        )}
                        {plugin.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {plugin.tags.map((tag) => (
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
                    プラグインはまだ公開されていません
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
