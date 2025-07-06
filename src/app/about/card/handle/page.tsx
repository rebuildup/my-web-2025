import Link from "next/link";
import type { Metadata } from "next";
import { Download, ExternalLink, QrCode, Mail, Twitter, Globe, Github } from "lucide-react";

export const metadata: Metadata = {
  title: "Digital Business Card - samuido | samuidoのデジタル名刺",
  description: "フロントエンドエンジニアsamuidoのデジタル名刺。QRコード付きでダウンロード可能。",
  keywords: ["デジタル名刺", "samuido", "ビジネスカード", "QRコード", "連絡先", "フロントエンド"],
  robots: "index, follow",
  canonical: "https://yusuke-kim.com/about/card/handle",
  openGraph: {
    title: "Digital Business Card - samuido | samuidoのデジタル名刺",
    description: "フロントエンドエンジニアsamuidoのデジタル名刺。QRコード付きでダウンロード可能。",
    type: "website",
    url: "https://yusuke-kim.com/about/card/handle",
    images: [
      {
        url: "https://yusuke-kim.com/about/card-handle-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Digital Business Card - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Business Card - samuido | samuidoのデジタル名刺",
    description: "フロントエンドエンジニアsamuidoのデジタル名刺。QRコード付きでダウンロード可能。",
    images: ["https://yusuke-kim.com/about/card-handle-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

export default function HandleBusinessCardPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "samuido",
    "alternateName": "木村友亮",
    "jobTitle": "フロントエンドエンジニア",
    "description": "グラフィックデザイン、映像制作、個人開発など幅広く活動",
    "url": "https://yusuke-kim.com/about/card/handle",
    "email": "361do.sleep@gmail.com",
    "sameAs": [
      "https://twitter.com/361do_sleep",
      "https://twitter.com/361do_design"
    ],
    "knowsAbout": [
      "Frontend Development",
      "Web Design",
      "Video Production",
      "Game Development"
    ]
  };

  const handleDownloadPDF = () => {
    // PDF download functionality
    console.log("Downloading PDF...");
  };

  const handleDownloadPNG = () => {
    // PNG download functionality
    console.log("Downloading PNG...");
  };

  const handleQRCodeView = () => {
    // QR Code modal functionality
    console.log("Opening QR Code...");
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
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link 
              href="/about" 
              className="neue-haas-grotesk-display text-xl text-primary hover:text-primary/80"
            >
              ← About
            </Link>
            <div className="flex gap-4">
              <Link 
                href="/about/card/real" 
                className="neue-haas-grotesk-display text-sm text-foreground hover:text-primary"
              >
                Real Card
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-12 px-4">
          <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
            Digital Business Card
          </h1>
          <h2 className="zen-kaku-gothic-new text-2xl md:text-3xl text-foreground mb-6">
            samuido | フロントエンドエンジニア
          </h2>
          <div className="h-1 w-24 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {/* Business Card Display */}
          <section className="mb-16">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {/* Digital Business Card */}
                <div 
                  className="bg-gray border-2 border-primary p-8 shadow-lg"
                  style={{
                    aspectRatio: "1.618/1", // Golden ratio for business card
                    maxWidth: "340px",
                    margin: "0 auto"
                  }}
                >
                  <div className="h-full flex flex-col justify-between">
                    {/* Header */}
                    <div className="text-center">
                      <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-2">
                        samuido
                      </h3>
                      <p className="zen-kaku-gothic-new text-lg text-foreground mb-4">
                        フロントエンドエンジニア
                      </p>
                      <div className="h-px bg-primary w-full mb-4"></div>
                    </div>
                    
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Mail size={14} className="text-primary" />
                        <span className="noto-sans-jp text-sm text-foreground">
                          361do.sleep@gmail.com
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Globe size={14} className="text-primary" />
                        <span className="noto-sans-jp text-sm text-foreground">
                          yusuke-kim.com
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Twitter size={14} className="text-primary" />
                        <span className="noto-sans-jp text-sm text-foreground">
                          @361do_sleep
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Github size={14} className="text-primary" />
                        <span className="noto-sans-jp text-sm text-foreground">
                          GitHub Projects
                        </span>
                      </div>
                    </div>
                    
                    {/* Skills Section */}
                    <div className="text-center">
                      <div className="h-px bg-primary w-full mb-3"></div>
                      <p className="noto-sans-jp text-xs text-foreground/80 leading-relaxed">
                        React/Next.js • TypeScript • CSS<br />
                        Game Development • Creative Coding
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Download size={20} />
                <span className="noto-sans-jp font-medium">PDF Download</span>
              </button>
              
              <button
                onClick={handleDownloadPNG}
                className="flex items-center gap-2 px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Download size={20} />
                <span className="noto-sans-jp font-medium">PNG Download</span>
              </button>
              
              <button
                onClick={handleQRCodeView}
                className="flex items-center gap-2 px-6 py-3 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <QrCode size={20} />
                <span className="noto-sans-jp font-medium">QR Code</span>
              </button>
            </div>
          </section>

          {/* QR Code Section */}
          <section className="mb-16">
            <div className="max-w-sm mx-auto text-center">
              <h3 className="neue-haas-grotesk-display text-2xl text-foreground mb-4">
                QR Code
              </h3>
              <div className="bg-white p-4 border border-foreground/20 inline-block">
                <div className="w-32 h-32 bg-gray border border-foreground/20 flex items-center justify-center">
                  <QrCode size={48} className="text-foreground/50" />
                </div>
              </div>
              <p className="noto-sans-jp text-sm text-foreground/70 mt-4">
                このページのURLをQRコードで共有
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-16">
            <h3 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              連絡先情報
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-primary" />
                  <div>
                    <p className="noto-sans-jp text-sm text-foreground/70">Email</p>
                    <p className="noto-sans-jp text-foreground">361do.sleep@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-primary" />
                  <div>
                    <p className="noto-sans-jp text-sm text-foreground/70">Website</p>
                    <p className="noto-sans-jp text-foreground">yusuke-kim.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Github size={20} className="text-primary" />
                  <div>
                    <p className="noto-sans-jp text-sm text-foreground/70">GitHub</p>
                    <p className="noto-sans-jp text-foreground">開発プロジェクト</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Twitter size={20} className="text-primary" />
                  <div>
                    <p className="noto-sans-jp text-sm text-foreground/70">X (開発関連)</p>
                    <p className="noto-sans-jp text-foreground">@361do_sleep</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Twitter size={20} className="text-primary" />
                  <div>
                    <p className="noto-sans-jp text-sm text-foreground/70">X (映像・デザイン)</p>
                    <p className="noto-sans-jp text-foreground">@361do_design</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack Overview */}
          <section className="mb-16">
            <h3 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              Tech Stack
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 border border-foreground/20 bg-gray/50">
                <h4 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  Frontend
                </h4>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  React/Next.js<br />
                  TypeScript<br />
                  CSS/Tailwind
                </p>
              </div>
              
              <div className="text-center p-6 border border-foreground/20 bg-gray/50">
                <h4 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  Creative Coding
                </h4>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  p5.js<br />
                  PIXI.js<br />
                  GSAP
                </p>
              </div>
              
              <div className="text-center p-6 border border-foreground/20 bg-gray/50">
                <h4 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  Game Dev
                </h4>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  Unity<br />
                  C#<br />
                  WebGL
                </p>
              </div>
              
              <div className="text-center p-6 border border-foreground/20 bg-gray/50">
                <h4 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  Video/Graphics
                </h4>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  After Effects<br />
                  Blender<br />
                  Motion Graphics
                </p>
              </div>
            </div>
          </section>

          {/* Activity Highlights */}
          <section className="mb-16">
            <h3 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              Activity Highlights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h4 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  Web Development
                </h4>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-4">
                  React/Next.jsを使用したモダンなWebアプリケーション開発
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">React</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">TypeScript</span>
                </div>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h4 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  Creative Projects
                </h4>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-4">
                  p5.jsやPIXI.jsを使用した創作プロジェクト
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">p5.js</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">PIXI.js</span>
                </div>
              </div>
              
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h4 className="neue-haas-grotesk-display text-lg text-primary mb-3">
                  Video Production
                </h4>
                <p className="noto-sans-jp text-sm text-foreground/70 mb-4">
                  モーショングラフィックスと映像制作
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">AE</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs">Blender</span>
                </div>
              </div>
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-16">
            <h3 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              関連リンク
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/about/card/real"
                className="group block p-6 border border-foreground/20 bg-gray/50 hover:border-primary hover:bg-gray transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <ExternalLink size={20} className="text-primary" />
                  <h4 className="neue-haas-grotesk-display text-lg text-foreground">
                    Real Card
                  </h4>
                </div>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  木村友亮のデジタル名刺
                </p>
              </Link>
              
              <Link
                href="/portfolio"
                className="group block p-6 border border-foreground/20 bg-gray/50 hover:border-primary hover:bg-gray transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <ExternalLink size={20} className="text-primary" />
                  <h4 className="neue-haas-grotesk-display text-lg text-foreground">
                    Portfolio
                  </h4>
                </div>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  作品とプロジェクト
                </p>
              </Link>
              
              <Link
                href="/tools"
                className="group block p-6 border border-foreground/20 bg-gray/50 hover:border-primary hover:bg-gray transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <ExternalLink size={20} className="text-primary" />
                  <h4 className="neue-haas-grotesk-display text-lg text-foreground">
                    Tools
                  </h4>
                </div>
                <p className="noto-sans-jp text-sm text-foreground/70">
                  開発ツールとプラグイン
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