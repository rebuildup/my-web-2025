import { Metadata } from "next";
import Link from "next/link";
import blogData from "../../../../data/blog.json";

export const metadata: Metadata = {
  title: "ブログ | samuido",
  description:
    "Web開発、デザイン、技術に関する記事を発信。Next.js、React、TypeScriptなどの最新技術情報。",
  keywords: [
    "ブログ",
    "Web開発",
    "Next.js",
    "React",
    "TypeScript",
    "フロントエンド",
  ],
};

export default function BlogPage() {
  const { posts, categories } = blogData;
  const publishedPosts = posts.filter((post) => post.status === "published");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryData = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ブログ
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Web開発、デザイン、技術に関する記事を発信しています。
            最新の技術情報やベストプラクティスを共有します。
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              {/* 注目記事 */}
              {blogData.featuredPosts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    注目記事
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {blogData.featuredPosts.slice(0, 2).map((postId) => {
                      const post = posts.find((p) => p.id === postId);
                      if (!post) return null;
                      const categoryData = getCategoryData(post.category);

                      return (
                        <article
                          key={post.id}
                          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center mb-3">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{
                                backgroundColor: "#6b7280",
                              }}
                            >
                              {categoryData?.name || post.category}
                            </span>
                            <span className="text-sm text-gray-500 ml-3">
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                            <Link
                              href={`/workshop/blog/${post.slug}`}
                              className="hover:text-purple-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {post.readTime}分で読める
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 記事一覧 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  最新記事
                </h2>
                <div className="space-y-6">
                  {publishedPosts.map((post) => {
                    const categoryData = getCategoryData(post.category);

                    return (
                      <article
                        key={post.id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{
                                  backgroundColor: "#6b7280",
                                }}
                              >
                                {categoryData?.name || post.category}
                              </span>
                              <span className="text-sm text-gray-500 ml-3">
                                {formatDate(post.publishedAt)}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              <Link
                                href={`/workshop/blog/${post.slug}`}
                                className="hover:text-purple-600 transition-colors"
                              >
                                {post.title}
                              </Link>
                            </h3>
                            <p className="text-gray-600 mb-4">{post.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {post.readTime}分で読める
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* カテゴリー */}
              <section className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  カテゴリー
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const categoryPostCount = posts.filter(
                      (post) =>
                        post.category === category.id &&
                        post.status === "published"
                    ).length;

                    return (
                      <Link
                        key={category.id}
                        href={`/workshop/blog?category=${category.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center">
                          <span
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: "#6b7280" }}
                          ></span>
                          <span className="text-gray-700 group-hover:text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {categoryPostCount}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* タグクラウド */}
              <section className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  人気タグ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(posts.flatMap((post) => post.tags)))
                    .slice(0, 12)
                    .map((tag) => (
                      <Link
                        key={tag}
                        href={`/workshop/blog?tag=${tag}`}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full text-sm transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                </div>
              </section>

              {/* 最近の投稿 */}
              <section className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  最近の投稿
                </h3>
                <div className="space-y-3">
                  {publishedPosts.slice(0, 5).map((post) => (
                    <Link
                      key={post.id}
                      href={`/workshop/blog/${post.slug}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(post.publishedAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
