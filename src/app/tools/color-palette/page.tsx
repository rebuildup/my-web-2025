import { Metadata } from "next";

export const metadata: Metadata = {
  title: "カラーパレット生成器 | Tools | samuido",
  description:
    "基準色から調和色を自動生成。アクセシビリティチェック機能付き。CSS・JSON形式でエクスポート可能。",
  keywords: [
    "カラーパレット",
    "配色",
    "色彩",
    "カラー生成",
    "アクセシビリティ",
    "CSS",
  ],
};

export default function ColorPalettePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              カラーパレット生成器
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            基準色から美しい調和色を自動生成。
            アクセシビリティチェック機能でWCAG準拠の配色を作成できます。
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* 基準色設定 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              基準色設定
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  基準色
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    defaultValue="#3b82f6"
                    className="w-16 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    defaultValue="#3b82f6"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配色タイプ
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>単色配色</option>
                  <option>補色配色</option>
                  <option>三色配色</option>
                  <option>四角配色</option>
                  <option>類似色配色</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  色数
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>5色</option>
                  <option>7色</option>
                  <option>10色</option>
                  <option>12色</option>
                </select>
              </div>
            </div>

            <button className="mt-6 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium">
              パレット生成
            </button>
          </div>

          {/* 生成されたパレット */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              生成パレット
            </h2>

            <div className="grid grid-cols-5 gap-4 mb-6">
              {/* カラーサンプル */}
              {["#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe", "#eff6ff"].map(
                (color, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="w-full h-24 rounded-lg border border-gray-200 mb-2 cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="text-sm font-medium text-gray-900">
                      {color}
                    </div>
                    <div className="text-xs text-gray-500">
                      RGB(59, 130, 246)
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                📋 全色コピー
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                💾 CSS変数で保存
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                📄 JSON形式で保存
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                🎨 Adobe Swatchで保存
              </button>
            </div>
          </div>

          {/* アクセシビリティチェック */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              アクセシビリティチェック
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  コントラスト比チェック
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded mr-3"></div>
                      <span className="text-sm">青色 on 白背景</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-600 mr-2">
                        AA準拠
                      </span>
                      <span className="text-xs text-gray-500">4.5:1</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-300 rounded mr-3"></div>
                      <span className="text-sm">薄青色 on 白背景</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-red-600 mr-2">
                        不適合
                      </span>
                      <span className="text-xs text-gray-500">2.1:1</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  推奨組み合わせ
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-600 text-white rounded-lg">
                    <span className="font-medium">メインテキスト例</span>
                    <div className="text-sm opacity-90 mt-1">
                      背景: #3b82f6, テキスト: #ffffff
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 text-blue-900 rounded-lg border">
                    <span className="font-medium">セカンダリテキスト例</span>
                    <div className="text-sm opacity-75 mt-1">
                      背景: #eff6ff, テキスト: #1e3a8a
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
