import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Code, 
  Globe, 
  Smartphone, 
  Database, 
  Zap, 
  Shield, 
  CheckCircle, 
  Mail,
  ArrowRight,
  Clock,
  DollarSign,
  Star,
  Layers,
  Monitor,
  Cpu
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Web開発依頼 - samuido | React・Next.js・フルスタック開発',
  description: 'samuidoのWeb開発サービス。React/Next.js、レスポンシブサイト、API開発など。料金、納期、実績をご確認ください。',
  keywords: ['Web開発', 'React', 'Next.js', 'フルスタック', 'API開発', 'レスポンシブ', '料金'],
  openGraph: {
    title: 'Web開発依頼 - samuido | React・Next.js・フルスタック開発',
    description: 'samuidoのWeb開発サービス。React/Next.js、レスポンシブサイト、API開発など。料金、納期、実績をご確認ください。',
    type: 'website',
    url: '/about/commission/develop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web開発依頼 - samuido | React・Next.js・フルスタック開発',
    description: 'samuidoのWeb開発サービス。React/Next.js、レスポンシブサイト、API開発など。料金、納期、実績をご確認ください。',
    creator: '@361do_sleep',
  },
};

const services = [
  {
    icon: <Globe size={32} />,
    title: 'Webサイト制作',
    description: 'コーポレートサイト、ポートフォリオ、LP制作',
    price: '¥50,000～¥200,000',
    duration: '2～4週間',
    features: [
      'レスポンシブデザイン',
      'SEO最適化',
      'パフォーマンス最適化',
      'CMS導入可能',
    ],
    color: 'border-blue-500',
  },
  {
    icon: <Smartphone size={32} />,
    title: 'Webアプリケーション',
    description: 'React/Next.js を使った高機能Webアプリ',
    price: '¥100,000～¥500,000',
    duration: '4～12週間',
    features: [
      'SPA・PWA対応',
      'リアルタイム機能',
      '認証システム',
      'データ管理機能',
    ],
    color: 'border-purple-500',
  },
  {
    icon: <Database size={32} />,
    title: 'API・バックエンド',
    description: 'データベース設計、API開発、サーバー構築',
    price: '¥80,000～¥300,000',
    duration: '3～8週間',
    features: [
      'REST・GraphQL API',
      'データベース設計',
      'セキュリティ対策',
      'デプロイ・運用',
    ],
    color: 'border-green-500',
  },
  {
    icon: <Zap size={32} />,
    title: 'パフォーマンス最適化',
    description: '既存サイトの高速化・改善',
    price: '¥30,000～¥100,000',
    duration: '1～3週間',
    features: [
      'Core Web Vitals改善',
      '画像・コード最適化',
      'CDN導入',
      '監視・分析',
    ],
    color: 'border-yellow-500',
  },
];

const technologies = [
  {
    category: 'フロントエンド',
    items: [
      { name: 'React', level: 95 },
      { name: 'Next.js', level: 90 },
      { name: 'TypeScript', level: 90 },
      { name: 'Tailwind CSS', level: 95 },
    ],
  },
  {
    category: 'バックエンド',
    items: [
      { name: 'Node.js', level: 80 },
      { name: 'Express', level: 75 },
      { name: 'PostgreSQL', level: 70 },
      { name: 'MongoDB', level: 65 },
    ],
  },
  {
    category: 'ツール・その他',
    items: [
      { name: 'Git/GitHub', level: 90 },
      { name: 'Docker', level: 70 },
      { name: 'Vercel/Netlify', level: 85 },
      { name: 'Figma', level: 80 },
    ],
  },
];

const pricingTable = [
  {
    type: 'シンプルサイト',
    description: '5ページ以下のコーポレートサイト',
    price: '¥50,000～¥100,000',
    duration: '2～3週間',
    includes: [
      'レスポンシブデザイン',
      'お問い合わせフォーム',
      'SEO基本対策',
      '1か月間の保守',
    ],
  },
  {
    type: '高機能サイト',
    description: 'CMS・会員機能付きサイト',
    price: '¥150,000～¥300,000',
    duration: '4～8週間',
    includes: [
      'カスタムCMS',
      '会員登録・ログイン',
      '管理画面',
      '3か月間の保守',
    ],
  },
  {
    type: 'Webアプリケーション',
    description: 'SPA・PWA・複雑な機能',
    price: '¥300,000～¥1,000,000',
    duration: '8～20週間',
    includes: [
      '要件定義・設計',
      'API開発',
      'テスト・デプロイ',
      '6か月間の保守',
    ],
  },
];

const recentProjects = [
  {
    title: 'Portfolio Website',
    description: 'Next.js 15 + React 19 による高性能ポートフォリオサイト',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    highlight: 'Lighthouse 95+ スコア達成',
  },
  {
    title: 'Interactive Tools Collection',
    description: 'Color Palette Generator、QR Generator など11のツール',
    tech: ['React', 'Canvas API', 'WebAPI'],
    highlight: 'リアルタイム処理・エクスポート機能',
  },
  {
    title: 'Admin Dashboard',
    description: 'コンテンツ管理システム・統計分析機能',
    tech: ['React', 'Chart.js', 'API'],
    highlight: '開発環境限定セキュリティ実装',
  },
];

const advantages = [
  {
    icon: <Star size={24} />,
    title: '受賞歴・実績',
    description: '高専コンテスト1位、プログラミングコンテスト技術賞など',
  },
  {
    icon: <Zap size={24} />,
    title: '最新技術',
    description: 'React 19、Next.js 15 など最新技術を積極的に活用',
  },
  {
    icon: <Shield size={24} />,
    title: 'セキュリティ',
    description: 'セキュリティベストプラクティスに基づいた開発',
  },
  {
    icon: <Cpu size={24} />,
    title: 'パフォーマンス',
    description: 'Core Web Vitals に配慮した高速化・最適化',
  },
];

export default function DevelopCommissionPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Web開発サービス',
    description: 'React/Next.js を使ったWebサイト・アプリケーション開発',
    provider: {
      '@type': 'Person',
      name: 'samuido',
      email: 'rebuild.up.up@gmail.com',
    },
    offers: pricingTable.map(item => ({
      '@type': 'Offer',
      name: item.type,
      description: item.description,
      price: item.price,
    })),
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
              href="/about/commission"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← 制作依頼
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center">
            <Code size={40} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
            Web開発
          </h1>
          <p className="noto-sans-jp text-foreground/80 text-lg md:text-xl">
            React・Next.js によるモダンなWeb開発
          </p>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-4 pb-16">
          {/* Introduction */}
          <section className="mb-16 text-center">
            <div className="mx-auto max-w-3xl">
              <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
                あなたのアイデアを形にします
              </h2>
              <p className="noto-sans-jp text-foreground/80 text-lg leading-relaxed">
                React/Next.js を使った高品質なWebサイト・アプリケーション開発を承ります。
                パフォーマンス、セキュリティ、ユーザビリティにこだわった制作で、
                あなたのビジネスやプロジェクトを成功に導きます。
              </p>
            </div>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              開発サービス
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`border-2 ${service.color} bg-gray/50 rounded-lg p-6`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-primary">{service.icon}</div>
                    <div>
                      <h3 className="neue-haas-grotesk-display text-foreground text-xl">
                        {service.title}
                      </h3>
                      <p className="noto-sans-jp text-foreground/70 text-sm">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray/30 rounded">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <DollarSign size={16} className="text-primary" />
                        <span className="neue-haas-grotesk-display text-foreground text-sm">
                          料金
                        </span>
                      </div>
                      <p className="text-primary text-sm font-bold">{service.price}</p>
                    </div>

                    <div className="text-center p-3 bg-gray/30 rounded">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Clock size={16} className="text-primary" />
                        <span className="neue-haas-grotesk-display text-foreground text-sm">
                          期間
                        </span>
                      </div>
                      <p className="text-primary text-sm font-bold">{service.duration}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-primary" />
                        <span className="noto-sans-jp text-foreground/80 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Technology Stack */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              技術スタック
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {technologies.map((tech, index) => (
                <div key={index} className="border-foreground/20 bg-gray/50 border rounded-lg p-6">
                  <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg text-center">
                    {tech.category}
                  </h3>
                  <div className="space-y-4">
                    {tech.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="noto-sans-jp text-foreground/80 text-sm">
                            {item.name}
                          </span>
                          <span className="text-primary text-sm font-medium">
                            {item.level}%
                          </span>
                        </div>
                        <div className="bg-foreground/20 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-1000"
                            style={{ width: `${item.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Table */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              料金プラン
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pricingTable.map((plan, index) => (
                <div
                  key={index}
                  className={`border-foreground/20 bg-gray/50 border rounded-lg p-6 ${
                    index === 1 ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {index === 1 && (
                    <div className="bg-primary text-white text-center py-2 px-4 rounded-t-lg -mx-6 -mt-6 mb-6">
                      <span className="text-sm font-medium">人気プラン</span>
                    </div>
                  )}

                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-xl">
                    {plan.type}
                  </h3>
                  <p className="noto-sans-jp text-foreground/70 mb-4 text-sm">
                    {plan.description}
                  </p>

                  <div className="text-center mb-6">
                    <p className="text-primary text-2xl font-bold">{plan.price}</p>
                    <p className="noto-sans-jp text-foreground/60 text-sm">{plan.duration}</p>
                  </div>

                  <div className="space-y-3">
                    {plan.includes.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-primary" />
                        <span className="noto-sans-jp text-foreground/80 text-sm">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="noto-sans-jp text-foreground/70 text-sm mb-4">
                ※ 料金は参考価格です。詳細な見積もりはお打ち合わせ後にご提示いたします。
              </p>
              <Link
                href="/about/commission/estimate"
                className="text-primary hover:text-primary/80 inline-flex items-center space-x-2 font-medium"
              >
                <span>詳細見積もりを取る</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Recent Projects */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              最近のプロジェクト
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {recentProjects.map((project, index) => (
                <div
                  key={index}
                  className="border-foreground/20 bg-gray/50 border rounded-lg p-6"
                >
                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                    {project.title}
                  </h3>
                  <p className="noto-sans-jp text-foreground/80 mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="text-primary bg-primary/10 px-2 py-1 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-100 text-green-800 p-3 rounded text-center">
                    <Star size={16} className="inline mr-2" />
                    <span className="text-sm font-medium">{project.highlight}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advantages */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              選ばれる理由
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {advantages.map((advantage, index) => (
                <div
                  key={index}
                  className="border-foreground/20 bg-gray/50 border p-6 rounded-lg text-center"
                >
                  <div className="text-primary mx-auto mb-4">{advantage.icon}</div>
                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                    {advantage.title}
                  </h3>
                  <p className="noto-sans-jp text-foreground/70 text-sm leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-lg p-8">
              <Code size={48} className="text-blue-600 mx-auto mb-4" />
              <h2 className="neue-haas-grotesk-display text-blue-800 mb-4 text-2xl">
                開発のご相談はこちら
              </h2>
              <p className="noto-sans-jp text-blue-700 mb-6 leading-relaxed">
                まずはお気軽にご相談ください。<br />
                要件をお聞きして、最適なプランをご提案いたします。
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <a
                  href="mailto:rebuild.up.up@gmail.com"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Mail size={20} />
                  <span>メールで相談</span>
                </a>

                <Link
                  href="/contact"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Monitor size={20} />
                  <span>フォームから相談</span>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido. Let's build something amazing! 🚀
          </p>
        </footer>
      </div>
    </>
  );
}