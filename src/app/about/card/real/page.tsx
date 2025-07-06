import { Metadata } from "next";
import { ArrowLeft, Download, Share, QrCode, Mail, Phone, MapPin, Globe } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Digital Business Card - 木村友亮 | デジタル名刺",
  description: "木村友亮のデジタル名刺。連絡先、スキル、ポートフォリオ情報をQRコードで簡単アクセス。",
  keywords: ["木村友亮", "デジタル名刺", "連絡先", "QRコード", "ビジネスカード"],
  robots: "index, follow",
  openGraph: {
    title: "Digital Business Card - 木村友亮 | デジタル名刺",
    description: "木村友亮のデジタル名刺。連絡先、スキル、ポートフォリオ情報をQRコードで簡単アクセス。",
    type: "profile",
    url: "/about/card/real",
    images: [
      {
        url: "/about/card-real-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "木村友亮のデジタル名刺",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Business Card - 木村友亮 | デジタル名刺",
    description: "木村友亮のデジタル名刺。連絡先、スキル、ポートフォリオ情報をQRコードで簡単アクセス。",
    images: ["/about/card-real-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

// Business card data
const cardData = {
  name: "木村友亮",
  nameEn: "Yusuke Kimura",
  title: "Webデザイナー・フロントエンドエンジニア",
  titleEn: "Web Designer & Frontend Engineer",
  company: "高専在学中",
  contact: {
    email: "361do.sleep@gmail.com",
    phone: "+81-XX-XXXX-XXXX", // Replace with real number if available
    website: "https://yusuke-kim.com",
    location: "日本",
  },
  social: {
    twitter: "@361do_sleep",
    github: "samuido",
  },
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "After Effects", "Photoshop"],
  qrCodeUrl: "/qr-codes/profile-real.png", // This would be generated
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

// Business card component (actual size representation)
const BusinessCard = ({ isPreview = false }: { isPreview?: boolean }) => {
  const scale = isPreview ? 0.8 : 1;
  
  return (
    <div 
      className="bg-white text-black p-6 rounded-sm shadow-lg"
      style={{
        width: `${85.6 * scale}mm`,
        height: `${53.98 * scale}mm`,
        minWidth: `${85.6 * scale}mm`,
        minHeight: `${53.98 * scale}mm`,
      }}
    >
      {/* Card Front */}
      <div className="h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="neue-haas-grotesk-display text-lg font-bold text-[#0000ff] mb-1">
              {cardData.name}
            </h3>
            <p className="text-xs text-gray-600 mb-1">{cardData.nameEn}</p>
            <p className="text-xs text-black">{cardData.title}</p>
            <p className="text-xs text-gray-600">{cardData.titleEn}</p>
          </div>
          <QRCodePlaceholder size={isPreview ? 50 : 60} />
        </div>
        
        {/* Contact Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Mail className="w-3 h-3 text-[#0000ff]" />
            <span>{cardData.contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Globe className="w-3 h-3 text-[#0000ff]" />
            <span>{cardData.contact.website}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3 h-3 text-[#0000ff]" />
            <span>{cardData.contact.location}</span>
          </div>
        </div>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {cardData.skills.slice(0, 4).map((skill, index) => (
            <span key={index} className="text-xs bg-[#f0f0f0] px-2 py-0.5 rounded text-[#0000ff]">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function RealCardPage() {
  const handleDownload = (format: 'png' | 'pdf') => {
    // Implementation would generate and download the card
    console.log(`Downloading card as ${format}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: cardData.name + ' - Digital Business Card',
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
            <h1 className="neue-haas-grotesk-display text-xl text-white">デジタル名刺 - {cardData.name}</h1>
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
              <p className="text-gray-400 mb-6">実際のサイズ (85.6mm × 53.98mm)</p>
            </div>
            
            {/* Card Display */}
            <div className="flex justify-center">
              <div className="bg-[#f0f0f0] p-8 rounded-lg">
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
              <h3 className="neue-haas-grotesk-display text-xl mb-4">名刺情報</h3>
              <div className="bg-[#333] p-6 rounded-sm space-y-4">
                <div>
                  <h4 className="text-[#0000ff] font-medium mb-2">基本情報</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>名前:</strong> {cardData.name} ({cardData.nameEn})</p>
                    <p><strong>組織:</strong> {cardData.company}</p>
                    <p><strong>職種:</strong> {cardData.title}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[#0000ff] font-medium mb-2">連絡先</h4>
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
                      <MapPin className="w-4 h-4 text-[#0000ff]" />
                      <span>{cardData.contact.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skills */}
            <div>
              <h3 className="neue-haas-grotesk-display text-xl mb-4">スキル</h3>
              <div className="bg-[#333] p-6 rounded-sm">
                <div className="flex flex-wrap gap-2">
                  {cardData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-[#222] text-[#0000ff] text-sm rounded-sm border border-[#444]">
                      {skill}
                    </span>
                  ))}
                </div>
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
                      QRコードをスキャンすると、このデジタル名刺に直接アクセスできます。
                    </p>
                    <p className="text-[#0000ff]">
                      URL: {cardData.contact.website}/about/card/real
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