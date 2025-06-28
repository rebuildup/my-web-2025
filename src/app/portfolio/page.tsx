'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import portfolioData from "@/../data/portfolio.json";

// We'll export this for the metadata
export const pageMetadata: Metadata = {
  title: "Portfolio | samuido",
  description: "samuidoのポートフォリオ・作品集。Web開発、デザイン、ツール制作の実績",
};

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTech, setSelectedTech] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    return portfolioData.projects.filter(project => {
      const categoryMatch = selectedCategory === "all" || project.category === selectedCategory;
      const techMatch = selectedTech === "all" || project.technologies.includes(selectedTech);
      return categoryMatch && techMatch && project.status === "published";
    });
  }, [selectedCategory, selectedTech]);

  // Get unique technologies
  const allTechnologies = useMemo(() => {
    const techs = new Set<string>();
    portfolioData.projects.forEach(project => {
      project.technologies.forEach(tech => techs.add(tech));
    });
    return Array.from(techs);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Web開発・デザイン・ツール制作のプロジェクト事例
          </p>
        </div>

        {/* Filters */}
        <Card variant="glass" className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">フィルター</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-3">カテゴリ</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    全て
                  </Button>
                  {portfolioData.categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Technology Filter */}
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-3">技術スタック</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTech === "all" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTech("all")}
                  >
                    全て
                  </Button>
                  {allTechnologies.slice(0, 8).map((tech) => (
                    <Button
                      key={tech}
                      variant={selectedTech === tech ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTech(tech)}
                    >
                      {tech}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-white/60">
            {filteredProjects.length} 件のプロジェクトが見つかりました
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => {
            const category = portfolioData.categories.find(cat => cat.id === project.category);
            
            return (
              <Card 
                key={project.id} 
                variant="elevated" 
                className="group cursor-pointer h-full flex flex-col"
              >
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${category?.color}20`,
                        color: category?.color 
                      }}
                    >
                      {category?.label}
                    </span>
                    {project.featured && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  
                  <CardTitle className="text-blue-400 group-hover:text-blue-300 transition-colors">
                    {project.title}
                  </CardTitle>
                  
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span 
                        key={tech} 
                        className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600/20 text-gray-300 rounded text-xs">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 mb-4 text-sm text-white/60">
                    {project.client && (
                      <p>👤 クライアント: {project.client}</p>
                    )}
                    <p>📅 期間: {project.projectPeriod}</p>
                  </div>

                  {/* Links */}
                  <div className="mt-auto flex gap-2">
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="primary" size="sm" className="w-full">
                          ライブ版
                        </Button>
                      </a>
                    )}
                    {project.sourceUrl && (
                      <a 
                        href={project.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          ソース
                        </Button>
                      </a>
                    )}
                    <Link href={`/portfolio/${project.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        詳細
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <Card variant="glass" className="text-center py-12">
            <CardHeader>
              <CardTitle>プロジェクトが見つかりませんでした</CardTitle>
              <CardDescription>
                フィルター条件を変更してお試しください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTech("all");
                }}
              >
                フィルターをリセット
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact CTA */}
        <Card variant="glass" className="mt-16 text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              あなたのプロジェクトを実現しませんか？
            </CardTitle>
            <CardDescription className="text-lg">
              Web制作・アプリ開発のご相談をお受けしています
            </CardDescription>
          </CardHeader>
          <CardContent>
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
