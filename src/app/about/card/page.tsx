import { Metadata } from "next";

export const metadata: Metadata = {
  title: "デジタル名刺 | samuido（木村友亮）",
  description:
    "samuidoのデジタル名刺。印刷対応、ダウンロード可能な名刺デザイン。",
  keywords: ["デジタル名刺", "samuido", "木村友亮", "名刺", "ビジネスカード"],
};

export default function DigitalCardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent">
              デジタル名刺
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            印刷対応、ダウンロード可能なデジタル名刺。
            ビジネス、カジュアル、クリエイティブの3つのデザインから選択できます。
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* デザインタブ */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-200">
              <button className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium">
                ビジネス
              </button>
              <button className="px-6 py-2 rounded-md text-gray-600 hover:bg-gray-100 font-medium">
                カジュアル
              </button>
              <button className="px-6 py-2 rounded-md text-gray-600 hover:bg-gray-100 font-medium">
                クリエイティブ
              </button>
            </div>
          </div>

          {/* 名刺プレビュー */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-8">
            <div className="aspect-[1.75/1] max-w-md mx-auto bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border-2 border-gray-200 p-6 flex flex-col justify-between">
              {/* 名刺内容 */}
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  samuido
                </div>
                <div className="text-sm text-gray-600 mb-3">木村友亮</div>
                <div className="text-sm font-medium text-gray-800">
                  Web開発者・デザイナー
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📧 rebuild.up.up@gmail.com</div>
                  <div>🌐 yusuke-kim.com</div>
                  <div>🐙 github.com/samuido</div>
                </div>
              </div>

              {/* QRコード placeholder */}
              <div className="absolute bottom-4 right-4 w-16 h-16 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              📄 PDFダウンロード
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              🖼️ PNG画像保存
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              🖨️ 印刷用CSS
            </button>
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              📱 SNSシェア
            </button>
          </div>

          {/* カスタマイズオプション */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              カスタマイズ
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カラーテーマ
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>モノクロ</option>
                  <option>ブルー</option>
                  <option>パープル</option>
                  <option>グリーン</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  フォントサイズ
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>小</option>
                  <option>標準</option>
                  <option>大</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
