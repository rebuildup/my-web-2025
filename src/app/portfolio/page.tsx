import Card from "@/components/Card";
import Button from "@/components/Button";
import siteConfig from "@/../data/site-config.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | samuido",
  description:
    "samuidoのポートフォリオ。Web開発、デザイン、ツール制作のプロジェクト事例を紹介。",
  keywords: [
    "samuido",
    "ポートフォリオ",
    "Web開発",
    "プロジェクト",
    "制作実績",
  ],
  openGraph: {
    title: "Portfolio | samuido",
    description:
      "samuidoのポートフォリオ。Web開発、デザイン、ツール制作のプロジェクト事例を紹介。",
    url: "https://yusuke-kim.com/portfolio",
  },
  twitter: {
    title: "Portfolio | samuido",
    description:
      "samuidoのポートフォリオ。Web開発、デザイン、ツール制作のプロジェクト事例を紹介。",
  },
};

export default function PortfolioPage() {
  // サンプルポートフォリオデータ
  const portfolioCategories = [
    {
      id: "web-development",
      title: "Web Development",
      description: "Webサイト・Webアプリケーションの開発",
      count: 0,
      color: "bg-blue-500",
    },
    {
      id: "ui-design",
      title: "UI/UX Design",
      description: "ユーザーインターフェース・ユーザー体験の設計",
      count: 0,
      color: "bg-purple-500",
    },
    {
      id: "plugins",
      title: "Plugins & Extensions",
      description: "プラグイン・拡張機能の開発",
      count: 0,
      color: "bg-green-500",
    },
    {
      id: "graphics",
      title: "Graphics & Assets",
      description: "グラフィック・素材制作",
      count: 0,
      color: "bg-orange-500",
    },
  ];

  const featuredProjects = [
    {
      id: 1,
      title: "このサイト（制作中）",
      description: "Next.js + TailwindCSS v4で構築された個人Webサイト",
      category: "Web Development",
      status: "制作中",
      technologies: ["Next.js", "TypeScript", "TailwindCSS v4"],
    },
    {
      id: 2,
      title: "プロジェクト準備中",
      description: "近日公開予定の新しいプロジェクト",
      category: "Coming Soon",
      status: "準備中",
      technologies: ["TBD"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Portfolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Web開発・デザイン・ツール制作のプロジェクト事例をご紹介します。
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Project cards will be added here */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              プロジェクト事例を準備中です。しばらくお待ちください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
