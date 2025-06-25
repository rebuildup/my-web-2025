"use client";

import { useState, useMemo } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import portfolioData from "@/../data/portfolio.json";

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("");

  const filteredProjects = useMemo(() => {
    let filtered = portfolioData.projects;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item: any) => item.category === selectedCategory
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((item: any) =>
        item.tags.includes(selectedTag)
      );
    }

    return filtered;
  }, [selectedCategory, selectedTag]);

  const categoriesWithCount = portfolioData.categories.map((category: any) => ({
    ...category,
    count: portfolioData.projects.filter(
      (item: any) => item.category === category.id
    ).length,
  }));

  const allTags = Array.from(
    new Set(portfolioData.projects.flatMap((item: any) => item.tags))
  ).sort();

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      "web-development": "bg-blue-500",
      "ui-design": "bg-purple-500",
      plugins: "bg-green-500",
      tools: "bg-orange-500",
    };
    return colors[categoryId] || "bg-gray-500";
  };

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, string> = {
      "web-development": "💻",
      "ui-design": "🎨",
      plugins: "🔌",
      tools: "🛠️",
    };
    return icons[categoryId] || "📁";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Portfolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Web開発・デザイン・ツール制作のプロジェクト事例をご紹介します。
          </p>
        </div>

        {/* Category Filters */}
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
                  {category.label}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {category.description}
                </p>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">
                  {category.count} プロジェクト
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant={selectedCategory === "all" ? "primary" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="mr-4"
            >
              すべて表示 ({portfolioData.projects.length})
            </Button>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            タグで絞り込み
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedTag("")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === ""
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              すべて
            </button>
            {allTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredProjects.map((project: any) => (
            <Card key={project.id} className="group cursor-pointer h-full">
              <div className="flex flex-col h-full">
                {/* Project Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="text-4xl opacity-60">
                    {getCategoryIcon(project.category)}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                      {
                        categoriesWithCount.find(
                          (cat: any) => cat.id === project.category
                        )?.label
                      }
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    {project.projectPeriod && (
                      <div>期間: {project.projectPeriod}</div>
                    )}
                    {project.client && (
                      <div>クライアント: {project.client}</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      詳細を見る
                    </Button>
                    {project.links?.demo && (
                      <Button
                        href={project.links.demo}
                        external
                        variant="outline"
                        size="sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              該当するプロジェクトが見つかりません
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              フィルターを変更して再度お試しください。
            </p>
            <Button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedTag("");
              }}
              variant="outline"
            >
              フィルターをクリア
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              プロジェクトのご相談
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              新しいプロジェクトのご相談やお見積りをご希望の場合は、
              お気軽にお問い合わせください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/about#contact" size="lg">
                お問い合わせ
              </Button>
              <Button href="/tools/estimate" variant="outline" size="lg">
                見積り計算機
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
