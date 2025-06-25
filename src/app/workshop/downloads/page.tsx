import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ダウンロード | samuido",
  description:
    "samuidoが提供する無料・有料のダウンロードコンテンツ。テンプレート、リソース、ツール等。",
  keywords: ["ダウンロード", "テンプレート", "リソース", "ツール", "samuido"],
};

export default function DownloadsPage() {
  const downloadCategories = [
    { id: "free", name: "無料", count: 3, color: "#10b981" },
    { id: "premium", name: "有料", count: 2, color: "#f59e0b" },
    { id: "template", name: "テンプレート", count: 2, color: "#8b5cf6" },
    { id: "resource", name: "リソース", count: 1, color: "#ef4444" },
    { id: "tool", name: "ツール", count: 2, color: "#3b82f6" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              ダウンロード
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            無料・有料のダウンロードコンテンツを提供。
            テンプレート、リソース、開発ツールなどをご利用ください。
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* カテゴリーフィルター */}
          <div className="mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                カテゴリー
              </h2>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">
                  すべて
                </button>
                {downloadCategories.map((category) => (
                  <button
                    key={category.id}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center"
                    style={{ borderLeft: `4px solid ${category.color}` }}
                  >
                    {category.name}
                    <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ダウンロードアイテム */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 無料アイテム例 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-emerald-600 text-lg">🎨</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  無料
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                  テンプレート
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                React Component Template
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                再利用可能なReactコンポーネントテンプレート集
              </p>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>📁 2.5MB</span>
                <span>⬇️ 245 downloads</span>
              </div>
              <button className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                無料ダウンロード
              </button>
            </div>

            {/* 準備中アイテム */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 opacity-75">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">準備中</span>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  UI Kit Collection
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  モダンなUIコンポーネントキット
                </p>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
