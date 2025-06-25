import type { Metadata } from "next";
import Button from "@/components/Button";
import Card from "@/components/Card";
import siteConfig from "@/../data/site-config.json";

export const metadata: Metadata = {
  title: "About | samuido",
  description:
    "samuido（木村友亮）について。Web開発者・デザイナーとしてのスキル、経歴、プロフィールを紹介。",
  keywords: [
    "samuido",
    "木村友亮",
    "プロフィール",
    "Web開発者",
    "デザイナー",
    "経歴",
  ],
  openGraph: {
    title: "About samuido（木村友亮）",
    description:
      "samuido（木村友亮）について。Web開発者・デザイナーとしてのスキル、経歴、プロフィールを紹介。",
    url: "https://yusuke-kim.com/about",
  },
  twitter: {
    title: "About samuido（木村友亮）",
    description:
      "samuido（木村友亮）について。Web開発者・デザイナーとしてのスキル、経歴、プロフィールを紹介。",
  },
};

export default function AboutPage() {
  const skills = [
    { name: "JavaScript/TypeScript", level: 95, icon: "⚡" },
    { name: "React & Next.js", level: 90, icon: "⚛️" },
    { name: "Node.js", level: 85, icon: "🟢" },
    { name: "Python", level: 80, icon: "🐍" },
    { name: "UI/UXデザイン", level: 75, icon: "🎨" },
    { name: "クラウドサービス", level: 70, icon: "☁️" },
  ];

  const experience = [
    {
      period: "2020 - Present",
      title: "フルスタック開発者",
      company: "フリーランス",
      description: "モダンな技術を使用したWebアプリケーション開発とツール制作",
    },
    {
      period: "2018 - 2020",
      title: "フロントエンド開発者",
      company: "Web制作会社",
      description: "レスポンシブWebサイトの構築とユーザー体験の改善",
    },
    {
      period: "2016 - 2018",
      title: "初級開発者",
      company: "システム開発会社",
      description: "Web開発の基礎を学び、フルスタック開発の基盤を構築",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Profile Image & Basic Info */}
              <div className="text-center lg:text-left">
                <div className="w-48 h-48 mx-auto lg:mx-0 mb-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-6xl text-white shadow-xl">
                  👨‍💻
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    samuido
                  </span>
                </h1>
                <p className="text-xl text-blue-600 dark:text-blue-400 mb-2 font-medium">
                  {siteConfig.author.realName}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Web Developer & Designer
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Button href="#contact" variant="primary" size="lg">
                    Contact
                  </Button>
                  <Button href="/portfolio" variant="outline" size="lg">
                    Portfolio
                  </Button>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-6">
                <Card className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    About Me
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {siteConfig.author.bio}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Handle:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        @{siteConfig.author.handle}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Location:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {siteConfig.author.location}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Status:
                      </span>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        Available
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Focus:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Web Development
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
              Skills & Expertise
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {skills.map((skill, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{skill.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {skill.name}
                    </h3>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    <span className="absolute right-0 -top-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {skill.level}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
              Professional Experience
            </h2>
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <Card key={index} className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {exp.title}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium mt-2 md:mt-0">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {exp.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section id="contact" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Let's Connect
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              プロジェクトのご相談や技術的な質問がございましたら、
              ソーシャルメディアを通じてお気軽にお声がけください。
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center p-6">
                <div className="text-3xl mb-4">🐙</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  GitHub
                </h3>
                <a
                  href={`https://github.com/${siteConfig.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  github.com/{siteConfig.social.github}
                </a>
              </Card>

              <Card className="text-center p-6">
                <div className="text-3xl mb-4">🐦</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Twitter
                </h3>
                <a
                  href={`https://twitter.com/${siteConfig.social.twitter.replace(
                    "@",
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {siteConfig.social.twitter}
                </a>
              </Card>

              <Card className="text-center p-6">
                <div className="text-3xl mb-4">🛍️</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  BOOTH
                </h3>
                <a
                  href={`https://${siteConfig.social.booth}.booth.pm`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {siteConfig.social.booth}.booth.pm
                </a>
              </Card>
            </div>

            <Button
              href={`mailto:${siteConfig.author.email}`}
              variant="primary"
              size="lg"
            >
              Send Email
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
