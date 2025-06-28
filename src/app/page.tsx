import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import siteConfig from "@/../data/site-config.json";
import portfolioData from "@/../data/portfolio.json";

export default function HomePage() {
  const featuredProjects = portfolioData.projects.filter(project => project.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
              {siteConfig.site.name}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-4">
            {siteConfig.author.title}
          </p>
          
          <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto">
            {siteConfig.author.bio}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/portfolio">
              <Button size="lg" variant="primary">
                Portfolio を見る
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                お問い合わせ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Featured Projects
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <Card key={project.id} variant="elevated" className="group cursor-pointer">
              <CardHeader>
                <CardTitle className="text-blue-400 group-hover:text-blue-300 transition-colors">
                  {project.title}
                </CardTitle>
                <CardDescription>
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-white/60 text-sm">
                  {project.projectPeriod}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/portfolio">
            <Button variant="outline">
              全てのプロジェクトを見る
            </Button>
          </Link>
        </div>
      </section>

      {/* Services Overview */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          サービス
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteConfig.navigation.map((item) => (
            <Card key={item.id} variant="glass" className="text-center hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-lg">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={item.href}>
                  <Button variant="ghost" className="w-full">
                    詳しく見る
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card variant="glass" className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              プロジェクトのご相談
            </CardTitle>
            <CardDescription className="text-lg">
              Web制作・デザインのお仕事をお探しですか？
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 mb-6">
              お気軽にお問い合わせください。お見積りは無料です。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="primary">
                  お問い合わせ
                </Button>
              </Link>
              <Link href="/tools/estimate">
                <Button size="lg" variant="outline">
                  見積り計算
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
