"use client";

import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import blogData from "@/../data/blog.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshop | samuido",
  description:
    "samuidoのワークショップ・ブログ。Web開発の技術情報、チュートリアル、学習リソースを提供。",
  keywords: [
    "samuido",
    "ワークショップ",
    "ブログ",
    "Web開発",
    "チュートリアル",
    "技術情報",
  ],
  openGraph: {
    title: "Workshop | samuido",
    description:
      "samuidoのワークショップ・ブログ。Web開発の技術情報、チュートリアル、学習リソースを提供。",
    url: "https://yusuke-kim.com/workshop",
  },
  twitter: {
    title: "Workshop | samuido",
    description:
      "samuidoのワークショップ・ブログ。Web開発の技術情報、チュートリアル、学習リソースを提供。",
  },
};

export default function WorkshopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categoriesWithCount = blogData.categories.map((category) => ({
    ...category,
    count: blogData.items.filter((item) => item.category === category.id).length,
  }));

  const filteredPosts = selectedCategory === "all" 
    ? blogData.items 
    : blogData.items.filter((item) => item.category === selectedCategory);

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, string> = {
      blog: "📝",
      tutorials: "📚",
      resources: "💡",
      plugins: "🔌",
    };
    return icons[categoryId] || "📄";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Workshop
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Web開発に関する技術情報やチュートリアルを提供しています。
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            カテゴリー
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categoriesWithCount.map((category) => (
              <Card
                key={category.id}
                className={`text-center cursor-pointer transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "ring-2 ring-blue-500 dark:ring-blue-400"
                    : ""
                }`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? "all" : category.id
                  )
                }
              >
                <div className="text-4xl mb-4">
                  {getCategoryIcon(category.id)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {category.description}
                </p>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">
                  {category.count} 記事
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant={selectedCategory === "all" ? "primary" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              すべて表示 ({blogData.items.length})
            </Button>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group cursor-pointer h-full">
              <div className="flex flex-col h-full">
                {/* Post Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="text-4xl opacity-60">
                    {getCategoryIcon(post.category)}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                      {categoriesWithCount.find((cat) => cat.id === post.category)?.name}
                    </span>
                  </div>
                </div>

                {/* Post Info */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">
                    {post.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <div>公開日: {formatDate(post.publishedAt)}</div>
                    {post.metadata?.readTime && (
                      <div>読了時間: {post.metadata.readTime}</div>
                    )}
                    {post.metadata?.difficulty && (
                      <div>難易度: {post.metadata.difficulty}</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button size="sm" className="w-full">
                    記事を読む
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              該当する記事が見つかりません
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              カテゴリーを変更して再度お試しください。
            </p>
            <Button
              onClick={() => setSelectedCategory("all")}
              variant="outline"
            >
              すべて表示
            </Button>
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-16">
          <Card className="p-8 max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  BOOTH でプラグイン販売中
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  After Effects用の便利なプラグインやWeb開発用のツールを
                  BOOTHで販売しています。作業効率化にお役立てください。
                </p>
                <div className="flex gap-4">
                  <Button 
                    href="https://samuido.booth.pm" 
                    external
                    variant="primary"
                  >
                    BOOTHを見る
                  </Button>
                  <Button href="/portfolio" variant="outline">
                    制作実績
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <div className="text-8xl mb-4">🛍️</div>
                <div className="text-gray-600 dark:text-gray-300">
                  プラグイン・素材・ツールを販売
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Newsletter CTA */}
        <div className="text-center mt-16">
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              最新情報をチェック
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              新しい記事やチュートリアル、プラグインの情報は
              GitHubやTwitterでお知らせしています。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                href="https://github.com/samuido" 
                external
                variant="outline"
              >
                GitHub フォロー
              </Button>
              <Button 
                href="https://twitter.com/361do_sleep" 
                external
                variant="outline"
              >
                Twitter フォロー
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
