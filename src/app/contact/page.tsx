import { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ | samuido",
  description:
    "samuidoへのお問い合わせ。プロジェクトのご相談、業務依頼、技術に関するご質問など。",
  keywords: ["お問い合わせ", "コンタクト", "相談", "依頼", "samuido"],
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              お問い合わせ
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            プロジェクトのご相談、業務依頼、技術に関するご質問など、
            お気軽にお問い合わせください。
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* お問い合わせフォーム */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  お問い合わせフォーム
                </h2>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お名前 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="山田太郎"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会社名・組織名
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="株式会社サンプル"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      お問い合わせ種別 <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">選択してください</option>
                      <option value="project">プロジェクトのご相談</option>
                      <option value="work">業務依頼</option>
                      <option value="technical">技術的なご質問</option>
                      <option value="collaboration">コラボレーション</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      件名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Webサイト制作のご相談"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メッセージ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="プロジェクトの詳細、ご質問内容などをご記入ください。"
                    ></textarea>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        required
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        プライバシーポリシーに同意します{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    送信する
                  </button>
                </form>
              </div>
            </div>

            {/* 連絡先情報 */}
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">連絡先</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      📧
                    </span>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <a
                        href="mailto:rebuild.up.up@gmail.com"
                        className="text-blue-600 hover:underline"
                      >
                        rebuild.up.up@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      🐦
                    </span>
                    <div>
                      <div className="text-sm text-gray-500">Twitter</div>
                      <a
                        href="https://twitter.com/361do_sleep"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        @361do_sleep
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      🐙
                    </span>
                    <div>
                      <div className="text-sm text-gray-500">GitHub</div>
                      <a
                        href="https://github.com/samuido"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        github.com/samuido
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 対応時間 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  対応時間
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>平日</span>
                    <span>9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>土日祝</span>
                    <span>不定期</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-3">
                    ※ 緊急度に応じて24時間以内にご返信いたします
                  </div>
                </div>
              </div>

              {/* よくある質問 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  よくある質問
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-800 mb-1">
                      Q. 制作期間はどのくらいですか？
                    </div>
                    <div className="text-gray-600">
                      プロジェクトの規模により2週間〜2ヶ月程度です。
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">
                      Q. 料金はどのように決まりますか？
                    </div>
                    <div className="text-gray-600">
                      機能・デザイン・期間に応じてお見積りいたします。
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">
                      Q. 技術的な相談のみでも可能ですか？
                    </div>
                    <div className="text-gray-600">
                      はい、技術相談のみでも承っております。
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
