import Link from "next/link";
import type { Metadata } from "next";
import { Code, Monitor, Cog, Mail, Twitter, Clock, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "開発依頼 - samuido | Web開発・アプリ開発・プラグイン開発",
  description: "Web開発、アプリケーション開発、プラグイン開発の依頼を受け付けています。React、NextJS、AfterEffectsなど幅広い技術に対応。",
  keywords: ["Web開発", "アプリ開発", "プラグイン開発", "React", "NextJS", "AfterEffects", "フリーランス"],
  robots: "index, follow",
  canonical: "https://yusuke-kim.com/about/commission/develop",
  openGraph: {
    title: "開発依頼 - samuido | Web開発・アプリ開発・プラグイン開発",
    description: "Web開発、アプリケーション開発、プラグイン開発の依頼を受け付けています。React、NextJS、AfterEffectsなど幅広い技術に対応。",
    type: "website",
    url: "https://yusuke-kim.com/about/commission/develop",
    images: [
      {
        url: "https://yusuke-kim.com/about/commission-develop-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "開発依頼 - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "開発依頼 - samuido | Web開発・アプリ開発・プラグイン開発",
    description: "Web開発、アプリケーション開発、プラグイン開発の依頼を受け付けています。React、NextJS、AfterEffectsなど幅広い技術に対応。",
    images: ["https://yusuke-kim.com/about/commission-develop-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

export default function DevelopCommissionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "samuido 開発サービス",
    "description": "Web開発、アプリケーション開発、プラグイン開発サービス",
    "url": "https://yusuke-kim.com/about/commission/develop",
    "provider": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido",
      "email": "361do.sleep@gmail.com"
    },
    "serviceType": "Web Development",
    "areaServed": "Japan",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "開発サービス",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Web開発"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "アプリケーション開発"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "プラグイン開発"
          }
        }
      ]
    }
  };

  const services = [
    {
      title: "Web開発",
      description: "ポートフォリオサイト、コーポレートサイト、ECサイト",
      icon: <Monitor size={32} />,
      features: ["React/Next.js", "TypeScript", "Responsive Design", "SEO対応"]
    },
    {
      title: "アプリケーション開発",
      description: "Webアプリ、ゲーム、ツール",
      icon: <Code size={32} />,
      features: ["p5.js/PIXI.js", "Unity", "WebGL", "インタラクティブUI"]
    },
    {
      title: "プラグイン開発",
      description: "AfterEffects、Premiere Proなどのプラグイン",
      icon: <Cog size={32} />,
      features: ["CEP/UXP", "AfterEffects", "Premiere Pro", "カスタム機能"]
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "お問い合わせ",
      description: "メールまたはXのDMで依頼内容を相談"
    },
    {
      step: "2",
      title: "要件確認",
      description: "詳細な要件と仕様の確認"
    },
    {
      step: "3",
      title: "見積もり",
      description: "開発期間と料金の見積もり"
    },
    {
      step: "4",
      title: "開発開始",
      description: "要件に基づいた開発作業"
    },
    {
      step: "5",
      title: "テスト・修正",
      description: "動作確認と必要に応じた修正"
    },
    {
      step: "6",
      title: "納品",
      description: "完成品の納品とサポート"
    }
  ];

  const techStack = [
    {
      category: "フロントエンド",
      technologies: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js"]
    },
    {
      category: "ゲーム開発",
      technologies: ["p5.js", "PIXI.js", "Unity", "C#"]
    },
    {
      category: "プラグイン開発",
      technologies: ["AfterEffects", "Premiere Pro", "CEP", "UXP"]
    },
    {
      category: "その他",
      technologies: ["C", "C++", "Python", "Node.js"]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link 
              href="/about" 
              className="neue-haas-grotesk-display text-xl text-primary hover:text-primary/80"
            >
              ← About
            </Link>
            <div className="flex gap-4">
              <Link 
                href="/about/commission/video" 
                className="neue-haas-grotesk-display text-sm text-foreground hover:text-primary"
              >
                Video
              </Link>
              <Link 
                href="/about/commission/estimate" 
                className="neue-haas-grotesk-display text-sm text-foreground hover:text-primary"
              >
                Estimate
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-16 px-4">
          <h1 className="neue-haas-grotesk-display text-5xl md:text-7xl text-primary mb-4">
            開発依頼
          </h1>
          <h2 className="zen-kaku-gothic-new text-2xl md:text-3xl text-foreground mb-6">
            Web開発・アプリ開発・プラグイン開発
          </h2>
          <p className="noto-sans-jp text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            React、Next.js、Unity、AfterEffectsなど幅広い技術に対応。<br />
            ポートフォリオサイトから企業サイト、ゲーム、プラグインまで
          </p>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {/* Services Overview */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              開発サービス概要
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="p-8 border-2 border-foreground/20 bg-gray/50 hover:border-primary transition-colors">
                  <div className="text-primary mb-6 flex justify-center">
                    {service.icon}
                  </div>
                  
                  <h3 className="neue-haas-grotesk-display text-2xl text-foreground text-center mb-4">
                    {service.title}
                  </h3>
                  
                  <p className="noto-sans-jp text-foreground/70 text-center mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-primary" />
                        <span className="noto-sans-jp text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Process Flow */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              依頼の流れ
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {processSteps.map((process, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="neue-haas-grotesk-display text-xl font-bold">
                      {process.step}
                    </span>
                  </div>
                  
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-3">
                    {process.title}
                  </h3>
                  
                  <p className="noto-sans-jp text-foreground/70 text-sm leading-relaxed">
                    {process.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              料金体系
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-4">
                  基本料金
                </h3>
                <ul className="noto-sans-jp text-foreground/70 space-y-2">
                  <li>• プロジェクト規模に応じた基本料金</li>
                  <li>• 技術難易度による調整</li>
                  <li>• 開発期間による見積もり</li>
                </ul>
              </div>
              
              <div className="p-8 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-4">
                  追加オプション
                </h3>
                <ul className="noto-sans-jp text-foreground/70 space-y-2">
                  <li>• 機能追加・拡張</li>
                  <li>• 修正・メンテナンス</li>
                  <li>• 緊急対応・短納期</li>
                </ul>
              </div>
              
              <div className="p-8 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-4">
                  支払い方法
                </h3>
                <ul className="noto-sans-jp text-foreground/70 space-y-2">
                  <li>• 前払い・分割払い対応</li>
                  <li>• 銀行振込・PayPay</li>
                  <li>• プロジェクト進行に応じた分割</li>
                </ul>
              </div>
              
              <div className="p-8 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-4">
                  保証・サポート
                </h3>
                <ul className="noto-sans-jp text-foreground/70 space-y-2">
                  <li>• 納品後の保証期間</li>
                  <li>• バグ修正対応</li>
                  <li>• 運用サポート</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              技術スキル
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((tech, index) => (
                <div key={index} className="p-6 border border-foreground/20 bg-gray/50">
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-4 text-center">
                    {tech.category}
                  </h3>
                  <div className="space-y-2">
                    {tech.technologies.map((technology, techIndex) => (
                      <div key={techIndex} className="text-center">
                        <span className="noto-sans-jp text-sm text-foreground/70">
                          {technology}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio Highlights */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              開発実績
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-xl text-primary mb-3">
                  Webサイト
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-4">
                  ポートフォリオサイト、コーポレートサイトの制作実績
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">React</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">Next.js</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">TypeScript</span>
                </div>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-xl text-primary mb-3">
                  Webアプリ
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-4">
                  ツールサイト、ゲームアプリの開発実績
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">p5.js</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">PIXI.js</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">WebGL</span>
                </div>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-xl text-primary mb-3">
                  プラグイン
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-4">
                  AfterEffects、Premiere Proプラグインの開発実績
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">CEP</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">UXP</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">JavaScript</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              連絡方法
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="text-center p-8 border border-foreground/20 bg-gray/50">
                  <Mail size={48} className="text-primary mx-auto mb-4" />
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-2">
                    Email
                  </h3>
                  <p className="noto-sans-jp text-foreground">
                    361do.sleep@gmail.com
                  </p>
                </div>
                
                <div className="text-center p-8 border border-foreground/20 bg-gray/50">
                  <Twitter size={48} className="text-primary mx-auto mb-4" />
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-2">
                    X (Twitter)
                  </h3>
                  <p className="noto-sans-jp text-foreground">
                    @361do_sleep
                  </p>
                </div>
              </div>
              
              <div className="text-center p-8 border border-foreground/20 bg-primary/10">
                <Clock size={32} className="text-primary mx-auto mb-4" />
                <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">
                  対応時間
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="noto-sans-jp text-sm text-foreground/70">対応時間</p>
                    <p className="noto-sans-jp text-foreground">平日 9:00-18:00</p>
                  </div>
                  <div>
                    <p className="noto-sans-jp text-sm text-foreground/70">返信時間</p>
                    <p className="noto-sans-jp text-foreground">24時間以内</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              関連ページ
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/about/commission/video"
                className="group block p-6 border border-foreground/20 bg-gray/50 hover:border-primary hover:bg-gray transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3 group-hover:text-primary">
                  映像依頼
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  MV制作・アニメーション・プロモーション映像
                </p>
              </Link>
              
              <Link
                href="/about/commission/estimate"
                className="group block p-6 border border-foreground/20 bg-gray/50 hover:border-primary hover:bg-gray transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3 group-hover:text-primary">
                  見積もり計算機
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  映像制作の見積もり自動計算
                </p>
              </Link>
              
              <Link
                href="/contact"
                className="group block p-6 border border-foreground/20 bg-gray/50 hover:border-primary hover:bg-gray transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3 group-hover:text-primary">
                  お問い合わせ
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  直接ご相談・お見積もり依頼
                </p>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}