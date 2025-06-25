import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";
import siteConfig from "@/../data/site-config.json";

export default function HomePage() {
  const featuredProjects = [
    {
      id: 1,
      title: "モダンWebアプリケーション",
      description: "React・Next.jsを使用したレスポンシブWebアプリケーション",
      image: "/images/project-1.jpg",
      tags: ["React", "Next.js", "TypeScript"],
      href: "/portfolio/modern-webapp",
    },
    {
      id: 2,
      title: "開発ツール・プラグイン",
      description: "開発効率を向上させるツールやプラグインの制作",
      image: "/images/project-2.jpg",
      tags: ["JavaScript", "Plugin", "Tools"],
      href: "/portfolio/dev-tools",
    },
    {
      id: 3,
      title: "UIコンポーネント",
      description: "再利用可能で美しいUIコンポーネントライブラリ",
      image: "/images/project-3.jpg",
      tags: ["CSS", "Components", "Design"],
      href: "/portfolio/ui-components",
    },
  ];

  const services = [
    {
      icon: "💻",
      title: "Web開発",
      description: "モダンな技術スタックを使用したWebアプリケーション開発",
    },
    {
      icon: "🎨",
      title: "UI/UXデザイン",
      description: "ユーザビリティを重視した直感的なインターフェース設計",
    },
    {
      icon: "🛠️",
      title: "ツール制作",
      description: "開発効率や日常業務を改善する実用的なツール開発",
    },
    {
      icon: "📱",
      title: "レスポンシブ対応",
      description: "あらゆるデバイスで最適な表示を実現するレスポンシブ設計",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                samuido
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Web開発者・デザイナーとして、
              <br />
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                創造的で実用的なソリューション
              </span>
              を提供します
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/portfolio" variant="primary" size="lg">
                作品を見る
              </Button>
              <Button href="/about" variant="outline" size="lg">
                プロフィール
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              最新の技術を活用して制作したプロジェクトをご紹介します
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProjects.map((project) => (
              <Card key={project.id} className="group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-4xl opacity-50">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button href="/portfolio" variant="outline" size="lg">
              すべてのプロジェクトを見る
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              提供サービス
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              技術力と創造性を活かして、様々なWebソリューションを提供します
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="text-center p-8">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            プロジェクトを始めませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            アイデアを形にするお手伝いをさせてください。
            お気軽にご相談ください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/about#contact" variant="white" size="lg">
              お問い合わせ
            </Button>
            <Button
              href="/tools"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              ツールを試す
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
