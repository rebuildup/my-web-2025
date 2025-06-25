import { Metadata } from "next";

export const metadata: Metadata = {
  title: "プラグイン販売 | samuido",
  description:
    "samuidoが開発したプラグイン・拡張機能の販売ページ。After Effects、VS Code、WordPress等のプラグインを提供。",
  keywords: [
    "プラグイン",
    "拡張機能",
    "After Effects",
    "VS Code",
    "WordPress",
    "samuido",
  ],
};

export default function PluginsPage() {
  const pluginCategories = [
    { id: "wordpress", name: "WordPress", count: 0, color: "#21759b" },
    { id: "vscode", name: "VS Code", count: 0, color: "#007acc" },
    { id: "after-effects", name: "After Effects", count: 1, color: "#9999ff" },
    { id: "figma", name: "Figma", count: 0, color: "#f24e1e" },
    { id: "chrome", name: "Chrome Extension", count: 0, color: "#4285f4" },
  ];

  const featuredPlugins = [
    {
      id: "ae-automation-plugin",
      name: "AE Automation Pro",
      shortDescription: "After Effects用の作業自動化プラグイン",
      price: 1000,
      salePrice: 800,
      rating: 4.8,
      reviewCount: 24,
      downloadCount: 150,
      category: "after-effects",
      featured: true,
      availability: "available" as const,
      platforms: {
        booth: {
          url: "https://samuido.booth.pm/items/example",
          productId: "example",
        },
      },
    },
  ];

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              プラグイン販売
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            制作効率を向上させるプラグイン・拡張機能を販売しています。 After
            Effects、VS Code、WordPress等の各種プラットフォームに対応。
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                  すべて
                </button>
                {pluginCategories.map((category) => (
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

          {/* 注目のプラグイン */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              注目のプラグイン
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  {/* 商品画像 */}
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500">プラグイン画像</span>
                  </div>

                  {/* 商品情報 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        After Effects
                      </span>
                      {plugin.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          注目
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plugin.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {plugin.shortDescription}
                    </p>
                  </div>

                  {/* 評価・統計 */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{plugin.rating}</span>
                      <span className="ml-1">({plugin.reviewCount})</span>
                    </div>
                    <span>{plugin.downloadCount} downloads</span>
                  </div>

                  {/* 価格 */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {plugin.salePrice ? (
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-red-600">
                            {formatPrice(plugin.salePrice)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatPrice(plugin.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(plugin.price)}
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      販売中
                    </span>
                  </div>

                  {/* 購入ボタン */}
                  <div className="space-y-2">
                    <a
                      href={plugin.platforms.booth?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      BOOTHで購入
                    </a>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      詳細を見る
                    </button>
                  </div>
                </div>
              ))}

              {/* 準備中のプラグイン */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 opacity-75">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">準備中</span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    VS Code Extension
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    開発効率を向上させる拡張機能
                  </p>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Coming Soon
                  </span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 opacity-75">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">準備中</span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    WordPress Plugin
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    サイト管理を効率化するプラグイン
                  </p>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* サポート情報 */}
          <section className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              サポート・保証
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  技術サポート
                </h3>
                <p className="text-gray-600 text-sm">
                  購入後30日間の無料サポート
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  無料アップデート
                </h3>
                <p className="text-gray-600 text-sm">
                  メジャーバージョンまで無料更新
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">返金保証</h3>
                <p className="text-gray-600 text-sm">14日間の返金保証</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
