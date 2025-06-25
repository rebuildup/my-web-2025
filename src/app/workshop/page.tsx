import Card from "@/components/Card";
import Button from "@/components/Button";
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
  const workshopCategories = [
    {
      id: "plugins",
      title: "プラグイン・素材",
      description: "無料・有料のプラグインや素材の配布",
      icon: "package",
      count: 0,
      color: "bg-purple-500",
    },
    {
      id: "blog",
      title: "ブログ・記事",
      description: "技術記事、開発日記、知見の共有",
      icon: "edit",
      count: 0,
      color: "bg-green-500",
    },
    {
      id: "tutorials",
      title: "チュートリアル",
      description: "実践的な技術解説・ハンズオン",
      icon: "book",
      count: 0,
      color: "bg-blue-500",
    },
    {
      id: "resources",
      title: "リソース・Tips",
      description: "便利なツール、コード片、設定方法",
      icon: "lightbulb",
      count: 0,
      color: "bg-orange-500",
    },
  ];

  const recentPosts = [
    {
      id: 1,
      title: "Next.js + TailwindCSS v4でモダンなWebサイトを構築",
      description: "最新のNext.js 15とTailwindCSS v4を使った効率的な開発手法",
      category: "チュートリアル",
      date: "2025-01-01",
      readTime: "10分",
      tags: ["Next.js", "TailwindCSS", "TypeScript"],
    },
    {
      id: 2,
      title: "TypeScript型定義のベストプラクティス",
      description: "保守性の高いTypeScriptコードを書くための型設計",
      category: "ブログ",
      date: "2024-12-25",
      readTime: "15分",
      tags: ["TypeScript", "ベストプラクティス"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Workshop
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Web開発に関する技術情報やチュートリアルを提供しています。
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Content will be added here */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              技術記事とチュートリアルを準備中です。しばらくお待ちください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
