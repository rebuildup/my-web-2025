import { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロフィール | samuido（木村友亮）",
  description:
    "samuido（木村友亮）のプロフィール、スキル、経歴を詳しく紹介。Web開発者・デザイナーとしての背景と実績。",
  keywords: [
    "samuido",
    "木村友亮",
    "プロフィール",
    "Web開発",
    "フロントエンド",
    "デザイナー",
  ],
};

export default function ProfilePage() {
  const profileData = {
    personalInfo: {
      name: "samuido",
      realName: "木村友亮",
      title: "Web開発者・デザイナー",
      location: "日本",
      avatar: "/avatar.jpg",
      bio: "モダンな技術でユーザー体験を向上させることに情熱を注ぐWeb開発者。Next.js、React、TypeScriptを中心とした開発と、ユーザビリティを重視したUI/UXデザインを得意としています。",
    },
    contact: {
      email: "rebuild.up.up@gmail.com",
      website: "https://yusuke-kim.com",
      github: "https://github.com/samuido",
      twitter: "https://twitter.com/361do_sleep",
      booth: "https://samuido.booth.pm",
    },
    skills: {
      frontend: [
        "HTML5",
        "CSS3",
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "TailwindCSS",
      ],
      backend: ["Node.js", "Express", "API開発"],
      tools: ["Git", "GitHub", "Figma", "Photoshop", "VS Code"],
      languages: ["日本語（ネイティブ）", "英語（中級）"],
    },
    experience: [
      {
        period: "2024年〜現在",
        position: "フリーランス Web開発者",
        company: "個人事業",
        description:
          "モダンな技術スタックを使用したWebサイト・Webアプリケーションの開発。Next.js、React、TypeScriptを中心とした開発業務。",
      },
      {
        period: "2023年〜2024年",
        position: "Web開発学習・スキルアップ",
        company: "自主学習",
        description:
          "フロントエンド技術の集中学習。React、Next.js、TypeScript、TailwindCSSなどのモダンな技術スタックを習得。",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダーセクション */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-gray-700">
                S
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              samuido
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">木村友亮</p>
          <p className="text-lg text-gray-700 font-medium">
            {profileData.personalInfo.title}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-8">
              {/* 自己紹介 */}
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    👋
                  </span>
                  自己紹介
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {profileData.personalInfo.bio}
                </p>
              </section>

              {/* スキル */}
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    🛠️
                  </span>
                  スキル
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      フロントエンド
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.frontend.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      バックエンド
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.backend.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      ツール・環境
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.tools.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      言語
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.languages.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 経歴 */}
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    📈
                  </span>
                  経歴
                </h2>
                <div className="space-y-6">
                  {profileData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-200 pl-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exp.position}
                        </h3>
                        <span className="text-sm text-blue-600 font-medium">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{exp.company}</p>
                      <p className="text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 連絡先 */}
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">連絡先</h3>
                <div className="space-y-3">
                  <a
                    href={`mailto:${profileData.contact.email}`}
                    className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      📧
                    </span>
                    <span className="text-gray-700 text-sm">Email</span>
                  </a>
                  <a
                    href={profileData.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      🐙
                    </span>
                    <span className="text-gray-700 text-sm">GitHub</span>
                  </a>
                  <a
                    href={profileData.contact.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      🐦
                    </span>
                    <span className="text-gray-700 text-sm">Twitter</span>
                  </a>
                  <a
                    href={profileData.contact.booth}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      🛍️
                    </span>
                    <span className="text-gray-700 text-sm">BOOTH</span>
                  </a>
                </div>
              </section>

              {/* ステータス */}
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  現在のステータス
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                    <span className="text-gray-700 text-sm">案件受注可能</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                    <span className="text-gray-700 text-sm">
                      学習中: Next.js 15
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
                    <span className="text-gray-700 text-sm">
                      開発中: ツール群
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
