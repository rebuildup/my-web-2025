import Link from "next/link";
import type { Metadata } from "next";
import { User, Badge, ExternalLink, MapPin, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About - samuido | 木村友亮について",
  description: "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。",
  keywords: ["木村友亮", "プロフィール", "経歴", "スキル", "Webデザイナー", "フロントエンド開発者"],
  robots: "index, follow",
  openGraph: {
    title: "About - samuido | 木村友亮について",
    description: "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。",
    type: "profile",
    url: "/about",
    images: [
      {
        url: "/about-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "About samuido",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About - samuido | 木村友亮について",
    description: "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。",
    images: ["/about-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

interface ProfileCard {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

interface NavigationCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const profileCards: ProfileCard[] = [
  {
    title: "本名プロフィール",
    subtitle: "木村友亮 (Kimura Yusuke)",
    description: "採用担当者や企業向けの正式な自己紹介",
    href: "/about/profile/real",
    icon: <User size={32} />,
    color: "border-blue-500",
  },
  {
    title: "ハンドルネームプロフィール",
    subtitle: "samuido",
    description: "ラフな自己紹介、同業者・仲間向け",
    href: "/about/profile/handle",
    icon: <Badge size={32} />,
    color: "border-purple-500",
  },
];

const navigationCards: NavigationCard[] = [
  {
    title: "デジタル名刺",
    description: "連絡先・SNS・基本情報をまとめたカード",
    href: "/about/card",
    icon: <ExternalLink size={24} />,
    color: "border-green-500",
  },
  {
    title: "リンクマップ",
    description: "SNS・作品・プラットフォームへのリンク集",
    href: "/about/links",
    icon: <MapPin size={24} />,
    color: "border-yellow-500",
  },
  {
    title: "依頼について",
    description: "制作依頼・コラボレーション・お仕事の相談",
    href: "/about/commission",
    icon: <Award size={24} />,
    color: "border-red-500",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido",
    "jobTitle": "Webデザイナー・開発者",
    "description": "グラフィックデザイン、映像制作、個人開発など幅広く活動",
    "url": "https://yusuke-kim.com/about",
    "sameAs": [
      "https://twitter.com/361do_sleep",
      "https://twitter.com/361do_design"
    ],
    "knowsAbout": [
      "Web Design",
      "Frontend Development",
      "Video Production",
      "Graphic Design"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80"
            >
              ← Home
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-16 px-4">
          <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-4">
            About
          </h1>
          <div className="max-w-4xl mx-auto">
            <h2 className="zen-kaku-gothic-new text-3xl md:text-4xl text-foreground mb-6">
              木村友亮 / samuido
            </h2>
            <p className="noto-sans-jp text-xl md:text-2xl text-foreground/80 leading-relaxed">
              グラフィックデザイン、映像制作、個人開発など幅広く活動。<br />
              やる気になれば何でもできるのが強み
            </p>
          </div>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {/* Profile Selection */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              プロフィール選択
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {profileCards.map((profile) => (
                <Link
                  key={profile.title}
                  href={profile.href}
                  className={`group block p-8 border-2 ${profile.color} bg-gray transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                      {profile.icon}
                    </div>
                    
                    <h3 className="neue-haas-grotesk-display text-2xl text-foreground">
                      {profile.title}
                    </h3>
                    
                    <p className="zen-kaku-gothic-new text-lg text-primary">
                      {profile.subtitle}
                    </p>
                    
                    <p className="noto-sans-jp text-foreground/70 leading-relaxed">
                      {profile.description}
                    </p>
                    
                    <div className="mt-4 text-primary text-sm font-medium group-hover:underline">
                      詳細を見る →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Navigation Cards */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              関連ページ
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {navigationCards.map((nav) => (
                <Link
                  key={nav.title}
                  href={nav.href}
                  className={`group block p-6 border ${nav.color} bg-gray/50 transition-all duration-300 hover:scale-105 hover:shadow-md`}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                      {nav.icon}
                    </div>
                    
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground">
                      {nav.title}
                    </h3>
                    
                    <p className="noto-sans-jp text-sm text-foreground/70 leading-relaxed">
                      {nav.description}
                    </p>
                    
                    <div className="text-primary text-xs font-medium group-hover:underline">
                      詳細を見る →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Skills Overview */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              スキル概要
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  デザイン
                </h3>
                <div className="noto-sans-jp text-sm text-foreground/70 space-y-1">
                  <div>Photoshop</div>
                  <div>Illustrator</div>
                  <div>Adobe XD</div>
                  <div>Figma</div>
                </div>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  プログラミング
                </h3>
                <div className="noto-sans-jp text-sm text-foreground/70 space-y-1">
                  <div>JavaScript/TypeScript</div>
                  <div>React/Next.js</div>
                  <div>HTML/CSS</div>
                  <div>C/C++/C#</div>
                </div>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  映像制作
                </h3>
                <div className="noto-sans-jp text-sm text-foreground/70 space-y-1">
                  <div>After Effects</div>
                  <div>Premiere Pro</div>
                  <div>Blender</div>
                  <div>Aviutl</div>
                </div>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  その他
                </h3>
                <div className="noto-sans-jp text-sm text-foreground/70 space-y-1">
                  <div>Unity</div>
                  <div>Cubase</div>
                  <div>p5.js/PIXI.js</div>
                  <div>GSAP</div>
                </div>
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              基本情報
            </h2>
            
            <div className="max-w-2xl mx-auto bg-gray/50 border border-foreground/20 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2">
                    生年月日
                  </h3>
                  <p className="noto-sans-jp text-foreground/80">
                    平成19年10月生
                  </p>
                </div>
                
                <div>
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2">
                    現在
                  </h3>
                  <p className="noto-sans-jp text-foreground/80">
                    現役高専生（2025年7月現在）
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2">
                    経歴・学歴
                  </h3>
                  <div className="noto-sans-jp text-foreground/80 space-y-1">
                    <div>2023/3 公立中学卒業</div>
                    <div>2023/4 高専入学、現在在学中</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Highlights */}
          <section>
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              最新のハイライト
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/portfolio"
                className="group p-6 border border-foreground/20 bg-gray/50 hover:bg-gray transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2 group-hover:underline">
                  最新作品
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  React Portfolio Website - モダンなポートフォリオサイト
                </p>
                <p className="text-xs text-foreground/50 mt-2">
                  Portfolio →
                </p>
              </Link>
              
              <Link
                href="/tools"
                className="group p-6 border border-foreground/20 bg-gray/50 hover:bg-gray transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2 group-hover:underline">
                  最新ツール
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  Color Palette Generator - カラーパレット生成ツール
                </p>
                <p className="text-xs text-foreground/50 mt-2">
                  Tools →
                </p>
              </Link>
              
              <Link
                href="/workshop"
                className="group p-6 border border-foreground/20 bg-gray/50 hover:bg-gray transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2 group-hover:underline">
                  最新記事
                </h3>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  Next.js 15 & React 19 - 最新技術の解説
                </p>
                <p className="text-xs text-foreground/50 mt-2">
                  Workshop →
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
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
              Contact
            </Link>
            <Link href="/privacy-policy" className="text-foreground/60 hover:text-primary text-sm">
              Privacy Policy
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}