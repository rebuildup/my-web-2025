import { Metadata } from "next";
import { ArrowLeft, Download, Share, QrCode, Mail, Github, Twitter, Globe } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Digital Business Card - samuido | デジタル名刺",
  description: "samuidoのデジタル名刺。技術スタック、プロジェクト、連絡先をQRコードで簡単アクセス。",
  keywords: ["samuido", "デジタル名刺", "技術スタック", "QRコード", "ビジネスカード"],
  robots: "index, follow",
  openGraph: {
    title: "Digital Business Card - samuido | デジタル名刺",
    description: "samuidoのデジタル名刺。技術スタック、プロジェクト、連絡先をQRコードで簡単アクセス。",
    type: "profile",
    url: "/about/card/handle",
    images: [
      {
        url: "/about/card-handle-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "samuidoのデジタル名刺",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Business Card - samuido | デジタル名刺",
    description: "samuidoのデジタル名刺。技術スタック、プロジェクト、連絡先をQRコードで簡単アクセス。",
    images: ["/about/card-handle-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

// Business card data
const cardData = {
  handle: "samuido",
  title: "フロントエンドエンジニア",
  titleEn: "Frontend Engineer",
  tagline: "Web × Design × Video",
  contact: {
    email: "361do.sleep@gmail.com",
    website: "https://yusuke-kim.com",
    github: "samuido",
    twitter: "@361do_sleep",
    twitterDesign: "@361do_design",
  },
  mainSkills: ["React", "TypeScript", "Next.js", "AfterEffects"],
  projects: [
    "ポートフォリオサイト",
    "AEプラグイン開発",
    "インタラクティブツール",
  ],
  qrCodeUrl: "/qr-codes/profile-handle.png",
};

// QR Code placeholder component
const QRCodePlaceholder = ({ size = 120 }: { size?: number }) => (
  <div 
    className="bg-white p-2 rounded-sm flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <QrCode className="w-full h-full text-black" />
  </div>
);

// Business card component (developer style)
const BusinessCard = ({ isPreview = false }: { isPreview?: boolean }) => {
  const scale = isPreview ? 0.8 : 1;
  
  return (
    <div 
      className="bg-gradient-to-br from-[#0000ff] to-[#0066ff] text-white p-6 rounded-sm shadow-lg relative overflow-hidden"
      style={{
        width: `${85.6 * scale}mm`,
        height: `${53.98 * scale}mm`,
        minWidth: `${85.6 * scale}mm`,
        minHeight: `${53.98 * scale}mm`,
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 gap-1 h-full">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="bg-white rounded-sm" />
          ))}
        </div>
      </div>
      
      {/* Card Content */}
      <div className="relative h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="neue-haas-grotesk-display text-xl font-bold mb-1">
              {cardData.handle}
            </h3>
            <p className="text-sm opacity-90 mb-1">{cardData.title}</p>
            <p className="text-xs opacity-80">{cardData.tagline}</p>
          </div>
          <div className="bg-white p-1 rounded-sm">
            <QrCode className="w-8 h-8 text-[#0000ff]" />
          </div>
        </div>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {cardData.mainSkills.map((skill, index) => (
            <span key={index} className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded">
              {skill}
            </span>
          ))}
        </div>
        
        {/* Contact */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3" />
            <span className="truncate">{cardData.contact.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Github className="w-3 h-3" />
            <span>{cardData.contact.github}</span>
            <Twitter className="w-3 h-3 ml-2" />
            <span>{cardData.contact.twitter}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HandleCardPage() {
  const handleDownload = (format: 'png' | 'pdf') => {
    console.log(`Downloading card as ${format}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: cardData.handle + ' - Digital Business Card',
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#222] text-white">
      {/* Header */}
      <header className="bg-[#333] border-b border-[#444]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-4">
            <Link href="/about" className="text-[#0000ff] hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="neue-haas-grotesk-display text-xl text-white">デジタル名刺 - {cardData.handle}</h1>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Card Preview */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="neue-haas-grotesk-display text-2xl mb-4">名刺プレビュー</h2>
              <p className="text-gray-400 mb-6">デベロッパー向けスタイル</p>
            </div>
            
            {/* Card Display */}
            <div className="flex justify-center">
              <div className="bg-[#333] p-8 rounded-lg">
                <BusinessCard />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => handleDownload('png')}
                className="flex items-center gap-2 bg-[#0000ff] hover:bg-[#0066ff] px-6 py-3 rounded-sm text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                PNGダウンロード
              </button>
              <button 
                onClick={() => handleDownload('pdf')}
                className="flex items-center gap-2 bg-[#333] hover:bg-[#444] px-6 py-3 rounded-sm text-white border border-[#666] transition-colors"
              >
                <Download className="w-4 h-4" />
                PDFダウンロード
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 bg-[#333] hover:bg-[#444] px-6 py-3 rounded-sm text-white border border-[#666] transition-colors"
              >
                <Share className="w-4 h-4" />
                シェア
              </button>
            </div>
          </div>

          {/* Card Information */}
          <div className="space-y-8">
            <div>
              <h3 className="neue-haas-grotesk-display text-xl mb-4">プロフィール情報</h3>
              <div className="bg-[#333] p-6 rounded-sm space-y-4">
                <div>
                  <h4 className="text-[#0000ff] font-medium mb-2">基本情報</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>ハンドルネーム:</strong> {cardData.handle}</p>
                    <p><strong>職種:</strong> {cardData.title}</p>
                    <p><strong>タグライン:</strong> {cardData.tagline}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[#0000ff] font-medium mb-2">連絡先・ SNS</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#0000ff]" />
                      <a href={`mailto:${cardData.contact.email}`} className="text-[#0000ff] hover:opacity-80">
                        {cardData.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#0000ff]" />
                      <a href={cardData.contact.website} className="text-[#0000ff] hover:opacity-80">
                        {cardData.contact.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-[#0000ff]" />
                      <a href={`https://github.com/${cardData.contact.github}`} className="text-[#0000ff] hover:opacity-80">
                        {cardData.contact.github}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-[#0000ff]" />
                      <a href={`https://twitter.com/${cardData.contact.twitter.replace('@', '')}`} className="text-[#0000ff] hover:opacity-80">
                        {cardData.contact.twitter} (開発)
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-[#0000ff]" />
                      <a href={`https://twitter.com/${cardData.contact.twitterDesign.replace('@', '')}`} className="text-[#0000ff] hover:opacity-80">
                        {cardData.contact.twitterDesign} (デザイン)
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Skills */}
            <div>
              <h3 className="neue-haas-grotesk-display text-xl mb-4">主要スキル</h3>
              <div className="bg-[#333] p-6 rounded-sm">
                <div className="flex flex-wrap gap-2">
                  {cardData.mainSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-2 bg-[#0000ff] text-white text-sm rounded-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recent Projects */}
            <div>
              <h3 className="neue-haas-grotesk-display text-xl mb-4">最近のプロジェクト</h3>
              <div className="bg-[#333] p-6 rounded-sm">
                <ul className="space-y-2">
                  {cardData.projects.map((project, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-[#0000ff] rounded-full" />
                      {project}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* QR Code Info */}
            <div>
              <h3 className="neue-haas-grotesk-display text-xl mb-4">QRコード</h3>
              <div className="bg-[#333] p-6 rounded-sm">
                <div className="flex items-start gap-4">
                  <QRCodePlaceholder size={80} />
                  <div className="flex-1 text-sm text-gray-300">
                    <p className="mb-2">
                      QRコードをスキャンしてポートフォリオやプロジェクトをチェック！
                    </p>
                    <p className="text-[#0000ff]">
                      URL: {cardData.contact.website}/about/card/handle
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}