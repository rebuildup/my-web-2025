import { Metadata } from "next";
import Link from "next/link";
import { ContentItem } from "@/types/content";

export const metadata: Metadata = {
  title: "Blog - Workshop | samuido",
  description:
    "技術記事・チュートリアル・解説記事の一覧。フロントエンド開発、動画制作、デザインに関する情報を発信。",
  keywords: [
    "技術記事",
    "チュートリアル",
    "ブログ",
    "フロントエンド",
    "開発",
    "解説",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Blog - Workshop | samuido",
    description:
      "技術記事・チュートリアル・解説記事の一覧。フロントエンド開発、動画制作、デザインに関する情報を発信。",
    type: "website",
    url: "https://yusuke-kim.com/workshop/blog",
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Workshop | samuido",
    description:
      "技術記事・チュートリアル・解説記事の一覧。フロントエンド開発、動画制作、デザインに関する情報を発信。",
    creator: "@361do_sleep",
  },
};

async function getBlogPosts(): Promise<ContentItem[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/blog`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch blog posts");
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  const publishedPosts = blogPosts.filter(
    (post) => post.status === "published",
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
                  <li className="text-primary">Blog</li>
                </ol>
              </nav>
              <h1 className="neue-haas-grotesk-display text-4xl text-primary">
                Blog
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                技術記事・チュートリアル・解説記事を公開しています。
                <br />
                フロントエンド開発、動画制作、デザインに関する情報を発信。
              </p>
            </header>

            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                統計情報
              </h2>
              <div className="bg-base border border-foreground p-4 text-center">
                <div className="neue-haas-grotesk-display text-2xl text-accent">
                  {publishedPosts.length}
                </div>
                <div className="noto-sans-jp-light text-xs">記事</div>
              </div>
            </section>

            <section aria-labelledby="articles-heading">
              <h2
                id="articles-heading"
                className="neue-haas-grotesk-display text-2xl text-primary mb-6"
              >
                記事一覧
              </h2>

              {publishedPosts.length > 0 ? (
                <div className="grid-system grid-1 gap-6">
                  {publishedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/workshop/blog/${post.id}`}
                      className={CardStyle}
                      aria-describedby={`post-${post.id}-description`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className={Card_title}>{post.title}</h3>
                        <time className={Card_meta}>
                          {new Date(
                            post.publishedAt || post.createdAt,
                          ).toLocaleDateString("ja-JP")}
                        </time>
                      </div>
                      <p
                        id={`post-${post.id}-description`}
                        className={Card_description}
                      >
                        {post.description}
                      </p>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-background border border-foreground px-2 py-1 text-xs noto-sans-jp-light"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {post.stats && (
                        <div className={Card_meta}>
                          {post.stats.views} 回閲覧
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-base border border-foreground p-6">
                  <p className="noto-sans-jp-light text-sm text-center">
                    記事はまだ公開されていません
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
