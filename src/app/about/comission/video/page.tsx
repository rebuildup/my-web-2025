import { Metadata } from "next";
import { ArrowLeft, Video, Music, Palette, Zap, Clock, DollarSign, CheckCircle, Mail, Play } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "映像制作依頼 - samuido | 映像・デザインサービス",
  description: "MV、アニメーション、モーショングラフィックスの制作依頼。After Effects, Premiere Proを使った高品質な映像。",
  keywords: ["映像制作", "MV", "アニメーション", "モーショングラフィックス", "After Effects", "依頼"],
  robots: "index, follow",
  openGraph: {
    title: "映像制作依頼 - samuido | 映像・デザインサービス",
    description: "MV、アニメーション、モーショングラフィックスの制作依頼。After Effects, Premiere Proを使った高品質な映像。",
    type: "website",
    url: "/about/comission/video",
    images: [
      {
        url: "/about/comission-video-og.jpg",
        width: 1200,
        height: 630,
        alt: "映像制作サービス",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "映像制作依頼 - samuido | 映像・デザインサービス",
    description: "MV、アニメーション、モーショングラフィックスの制作依頼。After Effects, Premiere Proを使った高品質な映像。",
    images: ["/about/comission-video-twitter.jpg"],
    creator: "@361do_design",
  },
};

// Video services data
const videoServices = [
  {
    icon: Music,
    title: "ミュージックビデオ (MV)",
    description: "楽曲に合わせたインパクトのある映像作品",
    features: ["コンセプト企画", "絵コンテ作成", "撮影・編集", "カラーグレーディング"],
    basePrice: "¥200,000~",
    duration: "4-8週間",
    examples: ["インディーズアーティスト", "ロックバンド", "ポップス"],
  },
  {
    icon: Zap,
    title: "モーショングラフィックス",
    description: "ロゴやテキストのアニメーション",
    features: ["ロゴアニメーション", "タイポグラフィ", "インフォグラフィックス", "2D/3Dアニメ"],
    basePrice: "¥50,000~",
    duration: "1-3週間",
    examples: ["企業プロモ", "CM映像", "サービス紹介"],
  },
  {
    icon: Palette,
    title: "アニメーション動画",
    description: "キャラクターやイラストのアニメーション",
    features: ["キャラクターアニメ", "エフェクトアニメ", "背景アニメ", "リピートアニメ"],
    basePrice: "¥80,000~",
    duration: "3-6週間",
    examples: ["ゲームトレーラー", "YouTubeアニメ", "広告アニメ"],
  },
  {
    icon: Video,
    title: "動画編集・ポスプロ",
    description: "撮影済み映像の編集と加工",
    features: ["カット編集", "カラーコレクション", "音声ミックス", "エフェクト付与"],
    basePrice: "¥30,000~",
    duration: "1-2週間",
    examples: ["イベント映像", "企業プロモ", "インタビュー"],
  },
];

// Pricing structure
const pricingTable = [
  {
    category: "長さ",
    options: [
      { name: "30秒以下", price: "¥+0" },
      { name: "1分以下", price: "¥+20,000" },
      { name: "3分以下", price: "¥+50,000" },
      { name: "5分以下", price: "¥+100,000" },
    ],
  },
  {
    category: "複雑度",
    options: [
      { name: "シンプル", price: "¥+0" },
      { name: "標準", price: "¥+30,000" },
      { name: "高品質", price: "¥+80,000" },
      { name: "プレミアム", price: "¥+150,000" },
    ],
  },
  {
    category: "編集回数",
    options: [
      { name: "1回", price: "¥+0" },
      { name: "3回", price: "¥+10,000" },
      { name: "5回", price: "¥+20,000" },
      { name: "無制限", price: "¥+50,000" },
    ],
  },
];

const software = [
  "After Effects", "Premiere Pro", "Photoshop", "Illustrator", 
  "Blender", "DaVinci Resolve", "Audition", "Media Encoder"
];

const VideoServiceCard = ({ service }: { service: typeof videoServices[0] }) => {
  const Icon = service.icon;
  
  return (
    <div className="bg-[#333] p-6 rounded-sm border-l-4 border-[#0000ff] hover:bg-[#3a3a3a] transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-[#0000ff] p-3 rounded-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="neue-haas-grotesk-display text-lg text-white mb-2">{service.title}</h3>
          <p className="text-gray-300 text-sm">{service.description}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-[#0000ff] font-medium mb-2 text-sm">主な作業</h4>
        <ul className="space-y-1">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle className="w-3 h-3 text-[#0000ff]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mb-4">
        <h4 className="text-[#0000ff] font-medium mb-2 text-sm">事例</h4>
        <div className="flex flex-wrap gap-1">
          {service.examples.map((example, index) => (
            <span key={index} className="text-xs bg-[#222] text-[#0000ff] px-2 py-1 rounded">
              {example}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-[#444]">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#0000ff]" />
          <span className="text-white font-medium">{service.basePrice}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0000ff]" />
          <span className="text-gray-300 text-sm">{service.duration}</span>
        </div>
      </div>
    </div>
  );
};

export default function VideoCommissionPage() {
  return (
    <div className="min-h-screen bg-[#222] text-white">
      {/* Header */}
      <header className="bg-[#333] border-b border-[#444]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-4">
            <Link href="/about" className="text-[#0000ff] hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="neue-haas-grotesk-display text-xl text-white">映像制作依頼</h1>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="w-20 h-20 bg-[#0000ff] rounded-full mx-auto mb-6 flex items-center justify-center">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h2 className="neue-haas-grotesk-display text-4xl mb-4">映像制作サービス</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            音楽、アート、テクノロジーを組み合わせて、<br />
            あなたのビジョンを魅力的な映像作品に変えます。
          </p>
        </section>

        {/* Video Services */}
        <section className="mb-16">
          <h3 className="neue-haas-grotesk-display text-3xl text-center mb-8">サービス一覧</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videoServices.map((service, index) => (
              <VideoServiceCard key={index} service={service} />
            ))}
          </div>
        </section>

        {/* Pricing Structure */}
        <section className="mb-16">
          <h3 className="neue-haas-grotesk-display text-3xl text-center mb-8">料金体系</h3>
          <div className="bg-[#333] p-8 rounded-sm">
            <p className="text-center text-gray-300 mb-8">
              ベース料金に以下のオプション料金が加算されます
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingTable.map((category, index) => (
                <div key={index} className="bg-[#222] p-6 rounded-sm">
                  <h4 className="neue-haas-grotesk-display text-lg text-[#0000ff] mb-4 text-center">
                    {category.category}
                  </h4>
                  <div className="space-y-3">
                    {category.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex justify-between items-center py-2 border-b border-[#444] last:border-b-0">
                        <span className="text-gray-300">{option.name}</span>
                        <span className="text-white font-medium">{option.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-6">
              ※ 料金はプロジェクトの内容によって変動する場合があります
            </p>
          </div>
        </section>

        {/* Software & Tools */}
        <section className="mb-16">
          <h3 className="neue-haas-grotesk-display text-3xl text-center mb-8">使用ソフトウェア</h3>
          <div className="bg-[#333] p-8 rounded-sm">
            <p className="text-center text-gray-300 mb-6">
              業界標準のプロ用ソフトウェアで、高品質な作品を制作します
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {software.map((soft, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-[#0000ff] text-white rounded-sm font-medium"
                >
                  {soft}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Preview */}
        <section className="mb-16">
          <h3 className="neue-haas-grotesk-display text-3xl text-center mb-8">作品事例</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-[#333] rounded-sm overflow-hidden hover:bg-[#3a3a3a] transition-colors">
                <div className="aspect-video bg-[#222] flex items-center justify-center">
                  <Play className="w-12 h-12 text-[#0000ff]" />
                </div>
                <div className="p-4">
                  <h4 className="text-white font-medium mb-2">作品タイトル {item}</h4>
                  <p className="text-gray-300 text-sm mb-2">サンプル作品の説明テキスト...</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-[#222] text-[#0000ff] px-2 py-1 rounded">MV</span>
                    <span className="text-xs bg-[#222] text-[#0000ff] px-2 py-1 rounded">After Effects</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              href="/portfolio/gallery/video"
              className="inline-flex items-center gap-2 bg-[#333] hover:bg-[#444] px-6 py-3 rounded-sm text-white border border-[#666] transition-colors"
            >
              <Video className="w-4 h-4" />
              すべての作品を見る
            </Link>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-[#333] p-8 rounded-sm border border-[#444]">
            <h3 className="neue-haas-grotesk-display text-2xl mb-4">ご相談・お見積もり</h3>
            <p className="text-gray-300 mb-6">
              プロジェクトの内容や予算に合わせて、最適なプランをご提案します。<br />
              まずはお気軽にご相談ください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:361do.sleep@gmail.com"
                className="flex items-center gap-2 bg-[#0000ff] hover:bg-[#0066ff] px-8 py-3 rounded-sm text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                メールで相談
              </a>
              <Link 
                href="/about/comission/estimate"
                className="flex items-center gap-2 bg-[#333] hover:bg-[#444] px-8 py-3 rounded-sm text-white border border-[#666] transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                料金計算機
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              連絡先: 361do.sleep@gmail.com | Twitter: @361do_design
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}