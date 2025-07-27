import { notFound } from "next/navigation";
import Link from "next/link";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  // Mock blog data - in real implementation, this would fetch from a database
  const blogPosts = [
    {
      id: "post-1",
      title: "React Hooks の使い方",
      description: "React Hooksの基本的な使い方と実践的な例を紹介します。",
      content:
        "React Hooksは関数コンポーネントでstateやライフサイクルメソッドを使用するための機能です...",
      publishedAt: "2025-01-15",
    },
    {
      id: "post-2",
      title: "Next.js 15 の新機能",
      description: "Next.js 15で追加された新機能について詳しく解説します。",
      content: "Next.js 15では多くの新機能が追加されました...",
      publishedAt: "2025-01-10",
    },
    {
      id: "post-3",
      title: "TypeScript 実践ガイド",
      description: "TypeScriptを使った実践的な開発手法を学びます。",
      content:
        "TypeScriptは型安全性を提供するJavaScriptのスーパーセットです...",
      publishedAt: "2025-01-05",
    },
  ];

  const post = blogPosts.find((post) => post.id === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            <header className="space-y-12">
              <nav className="mb-6">
                <Link
                  href="/workshop/blog"
                  className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  ← Blog に戻る
                </Link>
              </nav>
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                {post.title}
              </h1>
              <div className="flex items-center space-x-4">
                <time className="noto-sans-jp-light text-sm text-accent">
                  {new Date(post.publishedAt).toLocaleDateString("ja-JP")}
                </time>
              </div>
            </header>

            <article
              data-testid="blog-content"
              className="bg-base border border-foreground p-4 space-y-4"
            >
              <p className="noto-sans-jp-light text-sm leading-loose">
                {post.content}
              </p>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
