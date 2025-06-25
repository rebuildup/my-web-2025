import { Metadata } from "next";

export const metadata: Metadata = {
  title: "リンクマップ | samuido",
  description: "samuidoの全ソーシャルメディア・プロフェッショナルリンク一覧。",
  keywords: [
    "リンクマップ",
    "samuido",
    "ソーシャルメディア",
    "プロフィール",
    "リンク",
  ],
};

export default function LinksPage() {
  const linkCategories = [
    {
      category: "social",
      title: "ソーシャルメディア",
      description: "日常の発信・交流",
      color: "blue",
      links: [
        {
          name: "Twitter",
          url: "https://twitter.com/361do_sleep",
          icon: "🐦",
          description: "技術情報・日常のつぶやき",
          isPrimary: true,
        },
        {
          name: "GitHub",
          url: "https://github.com/samuido",
          icon: "🐙",
          description: "コード・プロジェクト公開",
          isPrimary: true,
        },
        {
          name: "note",
          url: "#",
          icon: "📝",
          description: "技術記事・エッセイ",
        },
        { name: "Zenn", url: "#", icon: "📚", description: "技術記事・Tips" },
      ],
    },
    {
      category: "professional",
      title: "プロフェッショナル",
      description: "ビジネス・キャリア関連",
      color: "purple",
      links: [
        {
          name: "Portfolio",
          url: "/portfolio",
          icon: "💼",
          description: "制作実績・プロジェクト",
          isPrimary: true,
        },
        {
          name: "LinkedIn",
          url: "#",
          icon: "💼",
          description: "プロフェッショナルプロフィール",
        },
        {
          name: "Wantedly",
          url: "#",
          icon: "🤝",
          description: "キャリア・求人情報",
        },
      ],
    },
    {
      category: "creative",
      title: "クリエイティブ",
      description: "創作活動・販売",
      color: "green",
      links: [
        {
          name: "BOOTH",
          url: "https://samuido.booth.pm",
          icon: "🛍️",
          description: "プラグイン・素材販売",
          isPrimary: true,
        },
        {
          name: "pixiv",
          url: "#",
          icon: "🎨",
          description: "イラスト・アート作品",
        },
        {
          name: "DeviantArt",
          url: "#",
          icon: "🖼️",
          description: "デジタルアート作品",
        },
      ],
    },
    {
      category: "other",
      title: "その他",
      description: "ブログ・メディア",
      color: "orange",
      links: [
        {
          name: "Blog",
          url: "/workshop/blog",
          icon: "📖",
          description: "技術ブログ・記事",
          isPrimary: true,
        },
        {
          name: "YouTube",
          url: "#",
          icon: "📺",
          description: "技術解説・チュートリアル",
        },
        {
          name: "Podcast",
          url: "#",
          icon: "🎧",
          description: "音声コンテンツ",
        },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      purple:
        "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      green:
        "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      orange:
        "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              リンクマップ
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            samuidoの活動拠点一覧。
            ソーシャルメディア、プロフェッショナルサイト、創作活動まで。
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* メイン連絡先 */}
          <div className="text-center mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                メイン連絡先
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:rebuild.up.up@gmail.com"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="mr-2">📧</span>
                  Email
                </a>
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="mr-2">🌐</span>
                  Website
                </a>
              </div>
            </div>
          </div>

          {/* リンクカテゴリー */}
          <div className="grid lg:grid-cols-2 gap-8">
            {linkCategories.map((category) => (
              <div
                key={category.category}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>

                <div className="space-y-3">
                  {category.links.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : "_self"}
                      rel={
                        link.url.startsWith("http") ? "noopener noreferrer" : ""
                      }
                      className={`block p-4 rounded-xl bg-gradient-to-r ${getColorClasses(
                        category.color
                      )} text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
                        link.isPrimary
                          ? "ring-2 ring-white ring-opacity-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{link.icon}</span>
                          <div>
                            <div className="font-semibold flex items-center">
                              {link.name}
                              {link.isPrimary && (
                                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                                  主要
                                </span>
                              )}
                            </div>
                            <div className="text-sm opacity-90">
                              {link.description}
                            </div>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 opacity-70"
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
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* QRコード */}
          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 inline-block">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                このページのQRコード
              </h3>
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500 text-sm">QR Code</span>
              </div>
              <p className="text-sm text-gray-600">
                スマートフォンでスキャンしてアクセス
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
