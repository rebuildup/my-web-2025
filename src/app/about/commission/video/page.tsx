import Link from "next/link";
import type { Metadata } from "next";
import { Video, Music, Image, Megaphone, Mail, Twitter, Clock, CheckCircle, Star, Play } from "lucide-react";

export const metadata: Metadata = {
  title: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像",
  description: "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。",
  keywords: ["映像制作", "MV制作", "リリックモーション", "アニメーション", "AfterEffects", "Premiere Pro", "フリーランス"],
  robots: "index, follow",
  canonical: "https://yusuke-kim.com/about/commission/video",
  openGraph: {
    title: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像",
    description: "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。",
    type: "website",
    url: "https://yusuke-kim.com/about/commission/video",
    images: [
      {
        url: "https://yusuke-kim.com/about/commission-video-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "映像依頼 - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像",
    description: "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。",
    images: ["https://yusuke-kim.com/about/commission-video-twitter-image.jpg"],
    creator: "@361do_design",
  },
};

export default function VideoCommissionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "samuido 映像制作サービス",
    "description": "MV制作、アニメーション、プロモーション映像制作サービス",
    "url": "https://yusuke-kim.com/about/commission/video",
    "provider": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido",
      "email": "361do.sleep@gmail.com"
    },
    "serviceType": "Video Production",
    "areaServed": "Japan",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "映像制作サービス",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "MV制作"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "リリックモーション"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "イラストアニメーション"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "プロモーション映像"
          }
        }
      ]
    }
  };

  const services = [
    {
      title: "MV制作",
      description: "ミュージックビデオの制作",
      icon: <Music size={32} />,
      features: ["オリジナル楽曲対応", "歌ってみた対応", "エフェクト制作", "カラーグレーディング"],
      price: "¥6,000~"
    },
    {
      title: "リリックモーション",
      description: "歌詞に合わせたアニメーション",
      icon: <Video size={32} />,
      features: ["歌詞同期", "タイポグラフィ", "アニメーション", "背景制作"],
      price: "¥5,000~"
    },
    {
      title: "イラストアニメーション", 
      description: "イラストを使ったアニメーション",
      icon: <Image size={32} />,
      features: ["2Dアニメーション", "キャラクター動画", "モーション制作", "エフェクト"],
      price: "¥4,000~"
    },
    {
      title: "プロモーション映像",
      description: "商品・サービスのプロモーション映像",
      icon: <Megaphone size={32} />,
      features: ["企業PR", "商品紹介", "サービス説明", "イベント映像"],
      price: "¥8,000~"
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
      description: "映像の内容、長さ、スタイルの確認"
    },
    {
      step: "3",
      title: "見積もり",
      description: "制作期間と料金の見積もり"
    },
    {
      step: "4",
      title: "制作開始",
      description: "企画、脚本、制作作業"
    },
    {
      step: "5",
      title: "レビュー・修正",
      description: "クライアントからのフィードバック反映"
    },
    {
      step: "6",
      title: "納品",
      description: "完成映像の納品とサポート"
    }
  ];

  const software = [
    {
      name: "AfterEffects",
      purpose: "アニメーション制作、エフェクト",
      level: 5
    },
    {
      name: "Premiere Pro", 
      purpose: "動画編集、カラーグレーディング",
      level: 4
    },
    {
      name: "Blender",
      purpose: "3DCG制作",
      level: 3
    },
    {
      name: "Photoshop",
      purpose: "イラスト制作、画像編集",
      level: 5
    },
    {
      name: "Illustrator",
      purpose: "ベクターグラフィックス",
      level: 4
    }
  ];

  const pricingExamples = [
    {
      type: "歌ってみたMV制作",
      price: "¥5,000~",
      duration: "3-4分",
      features: ["基本編集", "エフェクト", "カラーグレーディング"]
    },
    {
      type: "オリジナルMV制作", 
      price: "¥6,000~",
      duration: "3-5分",
      features: ["オリジナル演出", "高品質エフェクト", "カスタムアニメーション"]
    },
    {
      type: "短編映像制作",
      price: "¥1,000~",
      duration: "20秒以内",
      features: ["OP/ED", "トランジション", "ロゴアニメーション"]
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
                href="/about/commission/develop" 
                className="neue-haas-grotesk-display text-sm text-foreground hover:text-primary"
              >
                Develop
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
            映像依頼
          </h1>
          <h2 className="zen-kaku-gothic-new text-2xl md:text-3xl text-foreground mb-6">
            MV制作・アニメーション・プロモーション映像
          </h2>
          <p className="noto-sans-jp text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            AfterEffects、Premiere Proを使用した高品質な映像制作。<br />
            個人から企業まで幅広いニーズに対応
          </p>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {/* Services Overview */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              映像制作サービス概要
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div key={index} className="p-8 border-2 border-foreground/20 bg-gray/50 hover:border-primary transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-primary">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="neue-haas-grotesk-display text-2xl text-foreground">
                        {service.title}
                      </h3>
                      <p className="noto-sans-jp text-primary font-bold">
                        {service.price}
                      </p>
                    </div>
                  </div>
                  
                  <p className="noto-sans-jp text-foreground/70 mb-6 leading-relaxed">
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

          {/* Detailed Process */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              詳細な制作フロー
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-xl text-primary mb-4">
                  1. 見積もり段階
                </h3>
                <div className="space-y-2 noto-sans-jp text-foreground/70">
                  <p>• 何を作るか (歌ってみたのMV制作など)</p>
                  <p>• 納期 (目安は1ヶ月です)</p>
                  <p>• 予算 (料金の例は下記参照)</p>
                  <p>• 作る映像の尺または楽曲名</p>
                  <p>• イメージ (指標となる作例や、箇条書き、絵コンテ、なんでもOK!)</p>
                </div>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-xl text-primary mb-4">
                  2. 素材提供
                </h3>
                <p className="noto-sans-jp text-foreground/70">
                  映像の中で使いたい素材（イラストや動画素材など）があればGigaFile便やGoogleドライブなどで送付してください。
                </p>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-xl text-primary mb-4">
                  3. 制作・進捗確認
                </h3>
                <p className="noto-sans-jp text-foreground/70 mb-3">
                  MVの場合はサビ前あたりまで完成させ、一度GigaFile便にて進捗を送付させていただきます。
                </p>
                <p className="noto-sans-jp text-foreground/70">
                  リテイクはこちらのミスを除き、無料で3回まで引き受けさせていただきます。
                  4回目以降のリテイクに関しましては、一回につき依頼報酬の半額を報酬額に加えさせていただきます。
                </p>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-xl text-primary mb-4">
                  4. 納品・お支払い
                </h3>
                <div className="space-y-2 noto-sans-jp text-foreground/70">
                  <p>• 映像完成後、GigaFile便にて納品</p>
                  <p>• お支払いは納品確認から30日以内</p>
                  <p>• 銀行振込・PayPay・Amazonギフト対応</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Examples */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              料金例
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {pricingExamples.map((pricing, index) => (
                <div key={index} className="p-6 border-2 border-foreground/20 bg-gray/50 text-center">
                  <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-2">
                    {pricing.type}
                  </h3>
                  <p className="neue-haas-grotesk-display text-2xl text-primary mb-4">
                    {pricing.price}
                  </p>
                  <p className="noto-sans-jp text-sm text-foreground/70 mb-4">
                    {pricing.duration}
                  </p>
                  <div className="space-y-1">
                    {pricing.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-center gap-2">
                        <CheckCircle size={14} className="text-primary" />
                        <span className="noto-sans-jp text-xs text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="max-w-2xl mx-auto p-6 border border-foreground/20 bg-foreground/5">
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3 text-center">
                重要事項
              </h3>
              <div className="space-y-2 noto-sans-jp text-sm text-foreground/70">
                <p>• 料金設定は変更する場合がございます</p>
                <p>• 制作開始後のキャンセル料は本来の料金の50%です</p>
                <p>• 尺や納期、料金によってはお断りする場合がございます</p>
                <p>• その他ジャンルの映像の料金は要相談</p>
                <p>• 通話などでのミーティングの対応は致しかねます</p>
              </div>
            </div>
          </section>

          {/* Software & Skills */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              使用ソフトウェア
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {software.map((soft, index) => (
                <div key={index} className="p-6 border border-foreground/20 bg-gray/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground">
                      {soft.name}
                    </h3>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < soft.level ? "text-primary fill-primary" : "text-foreground/20"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="noto-sans-jp text-sm text-foreground/70">
                    {soft.purpose}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio Showcase */}
          <section className="mb-20">
            <h2 className="neue-haas-grotesk-display text-4xl text-foreground text-center mb-12">
              制作実績
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="aspect-video bg-gray border border-foreground/20 flex items-center justify-center group hover:border-primary transition-colors">
                <div className="text-center">
                  <Play size={32} className="text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="noto-sans-jp text-sm text-foreground/70">MV作品 #1</p>
                </div>
              </div>
              
              <div className="aspect-video bg-gray border border-foreground/20 flex items-center justify-center group hover:border-primary transition-colors">
                <div className="text-center">
                  <Play size={32} className="text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="noto-sans-jp text-sm text-foreground/70">アニメーション #1</p>
                </div>
              </div>
              
              <div className="aspect-video bg-gray border border-foreground/20 flex items-center justify-center group hover:border-primary transition-colors">
                <div className="text-center">
                  <Play size={32} className="text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="noto-sans-jp text-sm text-foreground/70">プロモーション #1</p>
                </div>
              </div>
              
              <div className="aspect-video bg-gray border border-foreground/20 flex items-center justify-center group hover:border-primary transition-colors">
                <div className="text-center">
                  <Play size={32} className="text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="noto-sans-jp text-sm text-foreground/70">リリック #1</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                すべての作品を見る →
              </Link>
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
                    @361do_design
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

          {/* Call to Action */}
          <section className="mb-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="neue-haas-grotesk-display text-3xl text-foreground mb-6">
                お見積もり・ご相談はお気軽に
              </h2>
              <p className="noto-sans-jp text-foreground/80 mb-8 leading-relaxed">
                まずはお気軽にお問い合わせください。<br />
                詳細な見積もりは見積もり計算機もご利用いただけます。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  お問い合わせ →
                </Link>
                
                <Link
                  href="/about/commission/estimate"
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  見積もり計算機 →
                </Link>
              </div>
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