import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import toolsData from "@/../data/tools.json";

export const metadata: Metadata = {
  title: "Tools | samuido",
  description: "samuidoが制作した実用ツール集。Web上で利用できるツール",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Tools
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Web上で利用できる実用的なツール集。業務効率化・デザイン支援・開発補助ツールを提供
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {toolsData.tools.map((tool) => {
            const category = toolsData.categories.find(cat => cat.id === tool.category);
            
            return (
              <Card 
                key={tool.id} 
                variant="elevated" 
                className="group cursor-pointer h-full flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${category?.color}20`,
                        color: category?.color 
                      }}
                    >
                      {category?.name}
                    </span>
                    <span className="text-xs text-white/60">
                      v{tool.version}
                    </span>
                  </div>
                  
                  <CardTitle className="text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-2">
                    <span className="text-2xl">
                      {tool.icon === 'calculator' ? '🧮' : 
                       tool.icon === 'qr-code' ? '📱' : 
                       tool.icon === 'palette' ? '🎨' : '🔧'}
                    </span>
                    {tool.name}
                  </CardTitle>
                  
                  <CardDescription>
                    {tool.shortDescription}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <p className="text-white/70 mb-4 line-clamp-3">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-medium text-white/80 mb-2">主な機能</h4>
                    <ul className="space-y-1">
                      {tool.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm text-white/60 flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          {feature}
                        </li>
                      ))}
                      {tool.features.length > 3 && (
                        <li className="text-sm text-white/50">
                          ...他 {tool.features.length - 3} 個の機能
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Status and Last Updated */}
                  <div className="text-xs text-white/50 mb-4">
                    ステータス: <span className="text-green-400">稼働中</span> • 
                    最終更新: {new Date(tool.lastUpdated).toLocaleDateString('ja-JP')}
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    <Link href={tool.url} className="block">
                      <Button variant="primary" className="w-full">
                        ツールを使用
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Categories Overview */}
        <Card variant="glass" className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">ツールカテゴリ</CardTitle>
            <CardDescription className="text-center">
              用途別にツールを分類しています
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {toolsData.categories.map((category) => (
                <div key={category.id} className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon === 'briefcase' ? '💼' : 
                     category.icon === 'palette' ? '🎨' : 
                     category.icon === 'tool' ? '🔧' : 
                     category.icon === 'code' ? '💻' : '🔧'}
                  </div>
                  <h4 
                    className="font-semibold mb-2"
                    style={{ color: category.color }}
                  >
                    {category.name}
                  </h4>
                  <p className="text-sm text-white/60">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Info */}
        <Card variant="glass" className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">見積り計算について</CardTitle>
            <CardDescription className="text-center">
              透明性のある料金体系で適正価格を提案
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-blue-400 mb-2">シンプル</h4>
                <p className="text-2xl font-bold text-white mb-2">
                  ¥{toolsData.pricing.baseRates.simple.toLocaleString()}〜
                </p>
                <p className="text-sm text-white/60">
                  基本的なWebサイト制作
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-purple-400 mb-2">スタンダード</h4>
                <p className="text-2xl font-bold text-white mb-2">
                  ¥{toolsData.pricing.baseRates.medium.toLocaleString()}〜
                </p>
                <p className="text-sm text-white/60">
                  CMS・機能拡張付き
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-green-400 mb-2">プレミアム</h4>
                <p className="text-2xl font-bold text-white mb-2">
                  ¥{toolsData.pricing.baseRates.complex.toLocaleString()}〜
                </p>
                <p className="text-sm text-white/60">
                  高機能Webアプリケーション
                </p>
              </div>
            </div>
            <div className="text-center mt-6">
              <Link href="/tools/estimate">
                <Button variant="outline" size="lg">
                  詳細な見積りを計算
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card variant="glass" className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              カスタムツール開発
            </CardTitle>
            <CardDescription className="text-lg">
              特定の業務に特化したツール開発も承ります
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 mb-6">
              既存ツールでは対応できない特殊な要件がございましたら、カスタム開発も可能です。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="primary">
                  開発相談
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button size="lg" variant="outline">
                  開発実績を見る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
