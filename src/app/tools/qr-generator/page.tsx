import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QRコード生成器 | Tools | samuido",
  description:
    "URL・テキストからQRコードを生成。カスタマイズ機能、PNG・SVG対応。",
  keywords: ["QRコード", "QR", "生成器", "ジェネレーター", "URL", "テキスト"],
};

export default function QRGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              QRコード生成器
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            URL・テキストから高品質なQRコードを生成。
            カスタマイズ機能でオリジナルQRコードが作成できます。
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 入力フォーム */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                QRコード設定
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テキスト・URL
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="https://example.com または任意のテキスト"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    サイズ
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>200x200px</option>
                    <option>300x300px</option>
                    <option>400x400px</option>
                    <option>500x500px</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    前景色
                  </label>
                  <input
                    type="color"
                    defaultValue="#000000"
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    背景色
                  </label>
                  <input
                    type="color"
                    defaultValue="#ffffff"
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    エラー訂正レベル
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>L (低) - 約7%</option>
                    <option>M (中) - 約15%</option>
                    <option>Q (準高) - 約25%</option>
                    <option>H (高) - 約30%</option>
                  </select>
                </div>

                <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  QRコード生成
                </button>
              </div>
            </div>

            {/* プレビュー・ダウンロード */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                プレビュー
              </h2>

              <div className="text-center mb-6">
                <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-gray-500">
                    QRコードがここに表示されます
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  📄 PNG形式でダウンロード
                </button>
                <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  🖼️ SVG形式でダウンロード
                </button>
                <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  📋 クリップボードにコピー
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 ヒント</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• URLは必ずhttps://から始めてください</li>
                  <li>• エラー訂正レベルが高いほど読み取り精度が向上します</li>
                  <li>• 印刷用途にはSVG形式がおすすめです</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
