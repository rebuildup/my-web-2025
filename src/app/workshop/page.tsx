import Link from "next/link";
import { ContentItem } from "@/types/content";

async function getWorkshopStats() {
  try {
    const [blogResponse, pluginResponse, downloadResponse] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/blog`,
        { cache: "no-store" },
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/plugin`,
        { cache: "no-store" },
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/download`,
        { cache: "no-store" },
      ),
    ]);

    const [blogData, pluginData, downloadData] = await Promise.all([
      blogResponse.ok ? blogResponse.json() : { data: [] },
      pluginResponse.ok ? pluginResponse.json() : { data: [] },
      downloadResponse.ok ? downloadResponse.json() : { data: [] },
    ]);

    const blogPosts = blogData.data || [];
    const plugins = pluginData.data || [];
    const downloads = downloadData.data || [];

    return {
      blogCount: blogPosts.filter(
        (item: ContentItem) => item.status === "published",
      ).length,
      pluginCount: plugins.filter(
        (item: ContentItem) => item.status === "published",
      ).length,
      downloadCount: downloads.filter(
        (item: ContentItem) => item.status === "published",
      ).length,
      latestContent: [
        ...blogPosts
          .filter((item: ContentItem) => item.status === "published")
          .slice(0, 2),
        ...plugins
          .filter((item: ContentItem) => item.status === "published")
          .slice(0, 2),
        ...downloads
          .filter((item: ContentItem) => item.status === "published")
          .slice(0, 2),
      ]
        .sort(
          (a, b) =>
            new Date(b.publishedAt || b.createdAt).getTime() -
            new Date(a.publishedAt || a.createdAt).getTime(),
        )
        .slice(0, 3),
    };
  } catch (error) {
    console.error("Error fetching workshop stats:", error);
    return {
      blogCount: 0,
      pluginCount: 0,
      downloadCount: 0,
      latestContent: [],
    };
  }
}

export default async function WorkshopPage() {
  const stats = await getWorkshopStats();
  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
  const Stats_number = "neue-haas-grotesk-display text-2xl text-accent";
  const Stats_label = "noto-sans-jp-light text-xs";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            <header className="space-y-6">
              <h1 className="neue-haas-grotesk-display text-4xl text-primary">
                Workshop
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                プラグイン配布、技術記事、素材ダウンロードのクリエイティブハブ。
                <br />
                AfterEffectsプラグインから開発チュートリアルまで、制作に役立つコンテンツを公開しています。
              </p>
            </header>
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                統計情報
              </h2>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <div className="bg-base border border-foreground p-4 text-center">
                  <div className={Stats_number}>{stats.blogCount}</div>
                  <div className={Stats_label}>記事</div>
                </div>
                <div className="bg-base border border-foreground p-4 text-center">
                  <div className={Stats_number}>{stats.pluginCount}</div>
                  <div className={Stats_label}>プラグイン</div>
                </div>
                <div className="bg-base border border-foreground p-4 text-center">
                  <div className={Stats_number}>{stats.downloadCount}</div>
                  <div className={Stats_label}>ダウンロード</div>
                </div>
              </div>
            </section>
            <nav aria-label="Workshop categories">
              <h2 className="sr-only">カテゴリ</h2>
              <div className="grid-system grid-1 xs:grid-1 sm:grid-3 gap-8">
                <Link
                  href="/workshop/blog"
                  className={CardStyle}
                  aria-describedby="blog-description"
                >
                  <h3 className={Card_title}>Blog</h3>
                  <p id="blog-description" className={Card_description}>
                    技術記事・チュートリアル・解説記事
                  </p>
                  <div className="pt-2">
                    <span className="noto-sans-jp-light text-xs text-accent">
                      {stats.blogCount}件の記事
                    </span>
                  </div>
                </Link>
                <Link
                  href="/workshop/plugins"
                  className={CardStyle}
                  aria-describedby="plugins-description"
                >
                  <h3 className={Card_title}>Plugins</h3>
                  <p id="plugins-description" className={Card_description}>
                    AfterEffects・Premiere Pro プラグイン
                  </p>
                  <div className="pt-2">
                    <span className="noto-sans-jp-light text-xs text-accent">
                      {stats.pluginCount}個のプラグイン
                    </span>
                  </div>
                </Link>
                <Link
                  href="/workshop/downloads"
                  className={CardStyle}
                  aria-describedby="downloads-description"
                >
                  <h3 className={Card_title}>Downloads</h3>
                  <p id="downloads-description" className={Card_description}>
                    テンプレート・素材集・サンプル
                  </p>
                  <div className="pt-2">
                    <span className="noto-sans-jp-light text-xs text-accent">
                      {stats.downloadCount}個の素材
                    </span>
                  </div>
                </Link>
              </div>
            </nav>
            <section aria-labelledby="latest-heading">
              <h2
                id="latest-heading"
                className="neue-haas-grotesk-display text-2xl text-primary mb-6"
              >
                Latest Content
              </h2>
              {stats.latestContent.length > 0 ? (
                <div className="grid-system grid-1 gap-4">
                  {stats.latestContent.map((content) => {
                    const getContentUrl = (content: ContentItem) => {
                      switch (content.type) {
                        case "blog":
                          return `/workshop/blog/${content.id}`;
                        case "plugin":
                          return `/workshop/plugins/${content.id}`;
                        case "download":
                          return `/workshop/downloads/${content.id}`;
                        default:
                          return "#";
                      }
                    };

                    const getContentTypeLabel = (type: string) => {
                      switch (type) {
                        case "blog":
                          return "Blog";
                        case "plugin":
                          return "Plugin";
                        case "download":
                          return "Download";
                        default:
                          return type;
                      }
                    };

                    return (
                      <Link
                        key={content.id}
                        href={getContentUrl(content)}
                        className={CardStyle}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className={Card_title}>{content.title}</h3>
                          <div className="flex flex-col items-end space-y-1">
                            <span className="text-xs text-accent uppercase">
                              {getContentTypeLabel(content.type)}
                            </span>
                            <time className="text-xs text-accent">
                              {new Date(
                                content.publishedAt || content.createdAt,
                              ).toLocaleDateString("ja-JP")}
                            </time>
                          </div>
                        </div>
                        <p className={Card_description}>
                          {content.description}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-base border border-foreground p-6">
                  <p className="noto-sans-jp-light text-sm text-center">
                    最新のコンテンツは各カテゴリページでご確認ください
                  </p>
                </div>
              )}
            </section>
            <nav aria-label="Site navigation">
              <Link
                href="/"
                className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
              >
                <span className="noto-sans-jp-regular text-base leading-snug">
                  ← Home
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
