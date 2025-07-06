import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Briefcase, 
  Code, 
  Video, 
  Calculator, 
  Mail, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Users,
  Trophy
} from 'lucide-react';

export const metadata: Metadata = {
  title: '制作依頼について - samuido | 開発・映像・デザイン',
  description: 'samuidoへの制作依頼について。Web開発、映像制作、デザインのご相談を承っています。料金、納期、実績をご確認ください。',
  keywords: ['制作依頼', 'Web開発', '映像制作', 'デザイン', 'フリーランス', '料金', '見積もり'],
  openGraph: {
    title: '制作依頼について - samuido | 開発・映像・デザイン',
    description: 'samuidoへの制作依頼について。Web開発、映像制作、デザインのご相談を承っています。料金、納期、実績をご確認ください。',
    type: 'website',
    url: '/about/commission',
  },
  twitter: {
    card: 'summary_large_image',
    title: '制作依頼について - samuido | 開発・映像・デザイン',
    description: 'samuidoへの制作依頼について。Web開発、映像制作、デザインのご相談を承っています。料金、納期、実績をご確認ください。',
    creator: '@361do_sleep',
  },
};

const commissionTypes = [
  {
    id: 'develop',
    title: 'Web開発',
    subtitle: '開発・技術',
    description: 'Webサイト、Webアプリケーション、ツール開発など',
    icon: <Code size={48} />,
    gradient: 'from-blue-500 to-purple-600',
    features: [
      'React/Next.js アプリケーション',
      'レスポンシブWebサイト',
      'API・バックエンド開発',
      'パフォーマンス最適化',
    ],
    startingPrice: '¥50,000～',
    deliveryTime: '2週間～',
    contactEmail: 'rebuild.up.up@gmail.com',
  },
  {
    id: 'video',
    title: '映像制作',
    subtitle: '映像・モーション',
    description: 'モーショングラフィックス、映像編集、エフェクト制作',
    icon: <Video size={48} />,
    gradient: 'from-red-500 to-pink-600',
    features: [
      'モーショングラフィックス',
      'プロモーション映像',
      'After Effects プラグイン',
      'アニメーション制作',
    ],
    startingPrice: '¥30,000～',
    deliveryTime: '1週間～',
    contactEmail: '361do.sleep@gmail.com',
  },
];

const strengths = [
  {
    icon: <Zap size={24} />,
    title: 'スピード',
    description: '迅速な対応と効率的な制作プロセス',
  },
  {
    icon: <Star size={24} />,
    title: '品質',
    description: '妥協のない高品質な成果物をお届け',
  },
  {
    icon: <Users size={24} />,
    title: 'コミュニケーション',
    description: '密な連携でご要望を正確に形に',
  },
  {
    icon: <Trophy size={24} />,
    title: '実績',
    description: 'コンテスト受賞歴・豊富なプロジェクト経験',
  },
];

const process = [
  {
    step: '01',
    title: 'お問い合わせ',
    description: 'メールまたはフォームよりご相談内容をお聞かせください',
  },
  {
    step: '02',
    title: 'ヒアリング',
    description: '詳細な要件や希望をお伺いします',
  },
  {
    step: '03',
    title: '見積もり・提案',
    description: '料金と制作スケジュールをご提案します',
  },
  {
    step: '04',
    title: '制作開始',
    description: 'ご契約後、制作を開始いたします',
  },
  {
    step: '05',
    title: '納品',
    description: '完成した成果物をお納めします',
  },
];

const recentWorks = [
  {
    title: 'React Portfolio Website',
    category: 'Web開発',
    description: 'Next.js 15 + React 19 で構築したポートフォリオサイト',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    title: 'Interactive Tools',
    category: 'Web開発',
    description: 'Color Palette Generator、QR Generator など',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    title: 'モーショングラフィックス',
    category: '映像制作',
    description: 'プロモーション映像・エフェクト制作',
    color: 'bg-red-100 text-red-800',
  },
];

export default function CommissionPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'samuido 制作依頼サービス',
    description: 'Web開発、映像制作、デザインの制作依頼を承っています',
    provider: {
      '@type': 'Person',
      name: 'samuido',
      email: 'rebuild.up.up@gmail.com',
    },
    areaServed: 'Japan',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '制作サービス',
      itemListElement: commissionTypes.map(type => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: type.title,
          description: type.description,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-gray min-h-screen">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/about"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← About
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-12 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center">
            <Briefcase size={40} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
            制作依頼
          </h1>
          <p className="noto-sans-jp text-foreground/80 text-lg md:text-xl">
            あなたのアイデアを形にします
          </p>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-4 pb-16">
          {/* Introduction */}
          <section className="mb-16 text-center">
            <div className="mx-auto max-w-3xl">
              <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
                一緒に何か作りませんか？
              </h2>
              <p className="noto-sans-jp text-foreground/80 text-lg leading-relaxed">
                Web開発から映像制作まで、幅広い分野で制作をお手伝いします。
                個人から企業まで、規模を問わずご相談をお受けしています。
                <br />
                まずはお気軽にお問い合わせください。
              </p>
            </div>
          </section>

          {/* Commission Types */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              制作サービス
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {commissionTypes.map((type, index) => (
                <div
                  key={type.id}
                  className="border-foreground/20 bg-gray/50 border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${type.gradient} text-white p-6`}>
                    <div className="flex items-center space-x-4">
                      {type.icon}
                      <div>
                        <h3 className="neue-haas-grotesk-display text-2xl font-bold">
                          {type.title}
                        </h3>
                        <p className="opacity-90">{type.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="noto-sans-jp text-foreground/80 mb-4 leading-relaxed">
                      {type.description}
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="neue-haas-grotesk-display text-foreground mb-3 text-lg">
                        主なサービス
                      </h4>
                      <div className="space-y-2">
                        {type.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-primary" />
                            <span className="noto-sans-jp text-foreground/80 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & Timeline */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray/30 rounded">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Calculator size={16} className="text-primary" />
                          <span className="neue-haas-grotesk-display text-foreground text-sm">
                            料金
                          </span>
                        </div>
                        <p className="text-primary text-lg font-bold">{type.startingPrice}</p>
                      </div>

                      <div className="text-center p-3 bg-gray/30 rounded">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Clock size={16} className="text-primary" />
                          <span className="neue-haas-grotesk-display text-foreground text-sm">
                            納期
                          </span>
                        </div>
                        <p className="text-primary text-lg font-bold">{type.deliveryTime}</p>
                      </div>
                    </div>

                    {/* Contact & Details */}
                    <div className="space-y-3">
                      <Link
                        href={`/about/commission/${type.id}`}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full px-4 py-3 rounded flex items-center justify-center space-x-2 transition-all"
                      >
                        <span>詳細を見る</span>
                        <ArrowRight size={16} />
                      </Link>

                      <a
                        href={`mailto:${type.contactEmail}`}
                        className="border-2 border-primary text-primary hover:bg-primary hover:text-white w-full px-4 py-3 rounded flex items-center justify-center space-x-2 transition-colors"
                      >
                        <Mail size={16} />
                        <span>相談する</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              選ばれる理由
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {strengths.map((strength, index) => (
                <div
                  key={index}
                  className="border-foreground/20 bg-gray/50 border p-6 rounded-lg text-center"
                >
                  <div className="text-primary mx-auto mb-4">{strength.icon}</div>
                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                    {strength.title}
                  </h3>
                  <p className="noto-sans-jp text-foreground/70 text-sm leading-relaxed">
                    {strength.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Process */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              制作の流れ
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
              {process.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary text-white mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                    {step.title}
                  </h3>
                  <p className="noto-sans-jp text-foreground/70 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Works */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              最近の制作実績
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {recentWorks.map((work, index) => (
                <div
                  key={index}
                  className="border-foreground/20 bg-gray/50 border p-6 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="neue-haas-grotesk-display text-foreground text-lg">
                      {work.title}
                    </h3>
                    <span className={`${work.color} px-3 py-1 rounded text-xs font-medium`}>
                      {work.category}
                    </span>
                  </div>
                  <p className="noto-sans-jp text-foreground/80 text-sm leading-relaxed">
                    {work.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/portfolio"
                className="text-primary hover:text-primary/80 inline-flex items-center space-x-2 font-medium"
              >
                <span>全ての実績を見る</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Pricing Calculator CTA */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-8 text-center">
              <Calculator size={48} className="text-purple-600 mx-auto mb-4" />
              <h2 className="neue-haas-grotesk-display text-purple-800 mb-4 text-2xl">
                料金を知りたい方へ
              </h2>
              <p className="noto-sans-jp text-purple-700 mb-6 leading-relaxed">
                簡単な質問にお答えいただくだけで、概算見積もりを自動算出します。
              </p>
              <Link
                href="/about/commission/estimate"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
              >
                <Calculator size={20} />
                <span>料金計算機を使う</span>
              </Link>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              まずはお気軽にご相談ください
            </h2>
            <p className="noto-sans-jp text-foreground/80 mb-8 leading-relaxed">
              どんな小さなことでも構いません。<br />
              あなたのアイデアをお聞かせください。
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <a
                href="mailto:rebuild.up.up@gmail.com"
                className="border-foreground/20 bg-gray/50 hover:border-blue-500 border p-6 rounded-lg transition-colors"
              >
                <Code size={32} className="text-blue-500 mx-auto mb-3" />
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  開発のご相談
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  rebuild.up.up@gmail.com
                </p>
              </a>

              <a
                href="mailto:361do.sleep@gmail.com"
                className="border-foreground/20 bg-gray/50 hover:border-red-500 border p-6 rounded-lg transition-colors"
              >
                <Video size={32} className="text-red-500 mx-auto mb-3" />
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  映像のご相談
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  361do.sleep@gmail.com
                </p>
              </a>

              <Link
                href="/contact"
                className="border-foreground/20 bg-gray/50 hover:border-purple-500 border p-6 rounded-lg transition-colors"
              >
                <Mail size={32} className="text-purple-500 mx-auto mb-3" />
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  フォームから
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  お問い合わせフォーム
                </p>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido. Let's create something amazing together! 🚀
          </p>
        </footer>
      </div>
    </>
  );
}