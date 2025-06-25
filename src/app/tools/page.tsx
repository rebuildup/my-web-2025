import type { Metadata } from "next";
import Card from "@/components/Card";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Tools | samuido",
  description:
    "samuidoが制作した実用ツール集。見積り計算機、開発ツール、便利なユーティリティを提供。",
  keywords: [
    "samuido",
    "ツール",
    "見積り計算機",
    "開発ツール",
    "ユーティリティ",
  ],
  openGraph: {
    title: "Tools | samuido",
    description:
      "samuidoが制作した実用ツール集。見積り計算機、開発ツール、便利なユーティリティを提供。",
    url: "https://yusuke-kim.com/tools",
  },
  twitter: {
    title: "Tools | samuido",
    description:
      "samuidoが制作した実用ツール集。見積り計算機、開発ツール、便利なユーティリティを提供。",
  },
};

export default function ToolsPage() {
  const toolCategories = [
    {
      id: "calculators",
      title: "計算機・見積りツール",
      description: "依頼費用計算、各種計算機",
      icon: "calculator",
      count: 1,
      color: "bg-blue-500",
    },
    {
      id: "converters",
      title: "変換ツール",
      description: "データ形式変換、単位変換",
      icon: "refresh",
      count: 0,
      color: "bg-green-500",
    },
    {
      id: "generators",
      title: "生成ツール",
      description: "QRコード、パスワード、コード生成",
      icon: "wand",
      count: 0,
      color: "bg-purple-500",
    },
    {
      id: "utilities",
      title: "ユーティリティ",
      description: "便利ツール、ヘルパー機能",
      icon: "tool",
      count: 0,
      color: "bg-orange-500",
    },
  ];

  const featuredTools = [
    {
      id: "estimate",
      title: "依頼費用計算機",
      description: "プロジェクトの見積りを簡単に計算できるツール",
      category: "計算機",
      status: "利用可能",
      features: ["基本料金設定", "複雑度調整", "納期計算", "PDF出力"],
      path: "/tools/estimate",
    },
    {
      id: "contact-form",
      title: "お問い合わせフォーム",
      description: "多段階フォームでスムーズなお問い合わせ",
      category: "コミュニケーション",
      status: "準備中",
      features: ["バリデーション", "自動返信", "ファイル添付"],
      path: "/tools/contact",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-20">
      {/* Page Header */}
      <section className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-slate-100">
          Tools
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Web上で利用できる実用的なツール集。開発や日常業務に役立つ機能を提供します
        </p>
      </section>

      {/* Tool Categories */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {toolCategories.map((category) => (
          <Card key={category.id} className="text-center">
            <div
              className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mb-6 mx-auto`}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {category.icon === "calculator" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                )}
                {category.icon === "refresh" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                )}
                {category.icon === "wand" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                )}
                {category.icon === "tool" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                )}
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">
              {category.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              {category.description}
            </p>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
              {category.count} ツール
            </div>
            <Button variant="outline" size="sm" className="w-full">
              カテゴリを見る
            </Button>
          </Card>
        ))}
      </section>

      {/* Featured Tools */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            おすすめツール
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            よく使われる便利ツール
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {featuredTools.map((tool) => (
            <Card key={tool.id} padding="lg">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      {tool.title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                      {tool.category}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      tool.status === "利用可能"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {tool.status}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300">
                  {tool.description}
                </p>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    主な機能：
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-3">
                    {tool.status === "利用可能" ? (
                      <Button href={tool.path} size="sm">
                        ツールを使う
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        準備中
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      詳細を見る
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="mt-16 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            クイックアクセス
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            よく使われるツールへの直接アクセス
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="text-center" padding="sm">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                見積り計算
              </h4>
              <Button
                href="/tools/estimate"
                variant="outline"
                size="sm"
                className="w-full"
              >
                開く
              </Button>
            </div>
          </Card>

          <Card className="text-center" padding="sm">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                お問い合わせ
              </h4>
              <Button variant="outline" size="sm" className="w-full" disabled>
                準備中
              </Button>
            </div>
          </Card>

          <Card className="text-center" padding="sm">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                QRコード生成
              </h4>
              <Button variant="outline" size="sm" className="w-full" disabled>
                準備中
              </Button>
            </div>
          </Card>

          <Card className="text-center" padding="sm">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                データ変換
              </h4>
              <Button variant="outline" size="sm" className="w-full" disabled>
                準備中
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
