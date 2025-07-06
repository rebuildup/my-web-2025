import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Video, 
  Play, 
  Palette, 
  Layers, 
  Zap, 
  Download, 
  CheckCircle, 
  Mail,
  ArrowRight,
  Clock,
  DollarSign,
  Star,
  Monitor,
  Camera,
  Film,
  Sparkles,
  Settings
} from 'lucide-react';

export const metadata: Metadata = {
  title: '映像制作依頼 - samuido | モーショングラフィックス・After Effects',
  description: 'samuidoの映像制作サービス。モーショングラフィックス、プロモーション映像、After Effectsプラグイン開発など。',
  keywords: ['映像制作', 'モーショングラフィックス', 'After Effects', 'プロモーション映像', 'アニメーション'],
  openGraph: {
    title: '映像制作依頼 - samuido | モーショングラフィックス・After Effects',
    description: 'samuidoの映像制作サービス。モーショングラフィックス、プロモーション映像、After Effectsプラグイン開発など。',
    type: 'website',
    url: '/about/commission/video',
  },
  twitter: {
    card: 'summary_large_image',
    title: '映像制作依頼 - samuido | モーショングラフィックス・After Effects',
    description: 'samuidoの映像制作サービス。モーショングラフィックス、プロモーション映像、After Effectsプラグイン開発など。',
    creator: '@361do_design',
  },
};

const services = [
  {
    icon: <Sparkles size={32} />,
    title: 'モーショングラフィックス',
    description: 'ロゴアニメーション、タイトル、インフォグラフィック',
    price: '¥30,000～¥150,000',
    duration: '1～3週間',
    features: [
      'ロゴアニメーション',
      'タイトルデザイン',
      'インフォグラフィック',
      '複数パターン提案',
    ],
    color: 'border-purple-500',
  },
  {
    icon: <Camera size={32} />,
    title: 'プロモーション映像',
    description: '企業PR、商品紹介、イベント映像の制作',
    price: '¥100,000～¥500,000',
    duration: '3～8週間',
    features: [
      '企画・構成案',
      '撮影・編集',
      'カラーグレーディング',
      '音響・MA',
    ],
    color: 'border-red-500',
  },
  {
    icon: <Settings size={32} />,
    title: 'After Effects プラグイン',
    description: 'カスタムエフェクト、自動化ツールの開発',
    price: '¥50,000～¥200,000',
    duration: '2～6週間',
    features: [
      'カスタムエフェクト',
      'ワークフロー自動化',
      'スクリプト開発',
      '使用方法マニュアル',
    ],
    color: 'border-blue-500',
  },
  {
    icon: <Film size={32} />,
    title: '動画編集・ポストプロダクション',
    description: '素材の編集、カラコレ、音響調整',
    price: '¥20,000～¥100,000',
    duration: '1～2週間',
    features: [
      'カット編集',
      'カラーコレクション',
      '音響調整',
      'テロップ・字幕',
    ],
    color: 'border-green-500',
  },
];

const software = [
  {
    name: 'After Effects',
    description: 'モーショングラフィックス・エフェクト制作',
    level: 95,
    experience: '5年',
    specialties: ['モーショングラフィックス', 'プラグイン開発', 'エクスプレッション'],
  },
  {
    name: 'Premiere Pro',
    description: '動画編集・ポストプロダクション',
    level: 85,
    experience: '4年',
    specialties: ['動画編集', 'カラーコレクション', 'オーディオ調整'],
  },
  {
    name: 'Blender',
    description: '3Dモデリング・アニメーション',
    level: 70,
    experience: '2年',
    specialties: ['3Dアニメーション', 'モデリング', 'レンダリング'],
  },
  {
    name: 'DaVinci Resolve',
    description: 'カラーグレーディング・編集',
    level: 75,
    experience: '2年',
    specialties: ['カラーグレーディング', 'プロフェッショナル編集'],
  },
];

const pricingTable = [
  {
    type: 'ショートアニメーション',
    description: '15秒以下のロゴ・タイトルアニメーション',
    price: '¥30,000～¥80,000',
    duration: '1～2週間',
    includes: [
      '企画・構成案',
      '3パターン提案',
      'HD・4K出力',
      '1回の修正',
    ],
  },
  {
    type: 'プロモーション映像',
    description: '1～3分の企業PR・商品紹介動画',
    price: '¥150,000～¥400,000',
    duration: '4～8週間',
    includes: [
      '企画・絵コンテ',
      '撮影・編集',
      'カラーグレーディング',
      '音響・MA',
    ],
  },
  {
    type: 'プラグイン開発',
    description: 'After Effects 用カスタムプラグイン',
    price: '¥100,000～¥300,000',
    duration: '3～8週間',
    includes: [
      '要件定義・設計',
      'プラグイン開発',
      'テスト・デバッグ',
      'マニュアル作成',
    ],
  },
];

const recentProjects = [
  {
    title: 'ブランドロゴアニメーション',
    description: '企業ブランディング用のロゴアニメーション制作',
    duration: '2週間',
    highlights: ['5パターン提案', '4K出力対応', 'ブランドガイドライン準拠'],
  },
  {
    title: '製品紹介プロモーション',
    description: '新製品発表用の3分間プロモーション映像',
    duration: '6週間',
    highlights: ['撮影・編集一式', '3Dアニメーション', 'カラーグレーディング'],
  },
  {
    title: 'AE ワークフロープラグイン',
    description: 'レンダリング自動化のためのAfter Effectsプラグイン',
    duration: '4週間',
    highlights: ['作業時間50%短縮', 'バッチ処理対応', '詳細マニュアル付き'],
  },
];

const advantages = [
  {
    icon: <Star size={24} />,
    title: '受賞歴・実績',
    description: '学生時代から映像分野で多数の受賞歴',
  },
  {
    icon: <Zap size={24} />,
    title: '技術力',
    description: 'プログラミングスキルを活かしたプラグイン開発',
  },
  {
    icon: <Palette size={24} />,
    title: 'デザインセンス',
    description: 'グラフィックデザインの知識を映像に活用',
  },
  {
    icon: <Settings size={24} />,
    title: 'ワークフロー最適化',
    description: '効率的な制作プロセスで短納期を実現',
  },
];

const deliverables = [
  {
    type: '映像ファイル',
    formats: ['MP4 (H.264)', 'MOV (ProRes)', 'AVI (非圧縮)'],
    resolutions: ['HD (1920×1080)', '4K (3840×2160)', 'カスタム解像度'],
  },
  {
    type: 'プロジェクトファイル',
    formats: ['After Effects プロジェクト', 'Premiere Pro プロジェクト', 'Blender ファイル'],
    notes: ['素材ファイル込み', '編集可能な状態', '詳細なコメント付き'],
  },
  {
    type: 'その他',
    formats: ['静止画 (PNG/JPG)', 'オーディオファイル', 'プラグインファイル'],
    notes: ['各種解像度', '素材データ', 'インストーラー付き'],
  },
];

export default function VideoCommissionPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '映像制作サービス',
    description: 'モーショングラフィックス、プロモーション映像、After Effectsプラグイン開発',
    provider: {
      '@type': 'Person',
      name: 'samuido',
      email: '361do.sleep@gmail.com',
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
          <div className="bg-gradient-to-r from-red-600 to-pink-600 mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center">
            <Video size={40} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
            映像制作
          </h1>
          <p className="noto-sans-jp text-foreground/80 text-lg md:text-xl">
            モーショングラフィックス・プロモーション映像
          </p>
          <div className="bg-gradient-to-r from-red-600 to-pink-600 mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-4 pb-16">
          {/* Introduction */}
          <section className="mb-16 text-center">
            <div className="mx-auto max-w-3xl">
              <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
                動きで伝える、心に残る映像を
              </h2>
              <p className="noto-sans-jp text-foreground/80 text-lg leading-relaxed">
                モーショングラフィックスからプロモーション映像まで、
                幅広い映像制作を承ります。技術とクリエイティブを融合させた
                独創的な映像で、あなたのメッセージを効果的に伝えます。
              </p>
            </div>
          </section>

          {/* Services */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              映像制作サービス
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

          {/* Software & Skills */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              使用ソフトウェア・スキル
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {software.map((soft, index) => (
                <div key={index} className="border-foreground/20 bg-gray/50 border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="neue-haas-grotesk-display text-foreground text-lg">
                      {soft.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-primary text-sm font-bold">{soft.level}%</div>
                      <div className="text-foreground/60 text-xs">{soft.experience}</div>
                    </div>
                  </div>

                  <p className="noto-sans-jp text-foreground/80 mb-4 text-sm">
                    {soft.description}
                  </p>

                  <div className="bg-foreground/20 h-2 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-primary h-full transition-all duration-1000"
                      style={{ width: `${soft.level}%` }}
                    ></div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {soft.specialties.map((specialty, specialtyIndex) => (
                      <span
                        key={specialtyIndex}
                        className="text-primary bg-primary/10 px-2 py-1 rounded text-xs"
                      >
                        {specialty}
                      </span>
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
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock size={16} className="text-primary" />
                      <span className="noto-sans-jp text-foreground/80 text-sm">
                        制作期間: {project.duration}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {project.highlights.map((highlight, highlightIndex) => (
                      <div key={highlightIndex} className="flex items-center space-x-2">
                        <Star size={14} className="text-primary" />
                        <span className="noto-sans-jp text-foreground/80 text-xs">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Deliverables */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              納品形式
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {deliverables.map((deliverable, index) => (
                <div
                  key={index}
                  className="border-foreground/20 bg-gray/50 border rounded-lg p-6"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Download size={20} className="text-primary" />
                    <h3 className="neue-haas-grotesk-display text-foreground text-lg">
                      {deliverable.type}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    {deliverable.formats.map((format, formatIndex) => (
                      <div key={formatIndex} className="flex items-center space-x-2">
                        <CheckCircle size={14} className="text-primary" />
                        <span className="noto-sans-jp text-foreground/80 text-sm">
                          {format}
                        </span>
                      </div>
                    ))}
                  </div>

                  {deliverable.resolutions && (
                    <div className="space-y-2 mb-4">
                      <h4 className="neue-haas-grotesk-display text-foreground text-sm">
                        解像度:
                      </h4>
                      {deliverable.resolutions.map((resolution, resolutionIndex) => (
                        <div key={resolutionIndex} className="flex items-center space-x-2">
                          <Monitor size={14} className="text-primary" />
                          <span className="noto-sans-jp text-foreground/80 text-sm">
                            {resolution}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {deliverable.notes && (
                    <div className="space-y-2">
                      <h4 className="neue-haas-grotesk-display text-foreground text-sm">
                        備考:
                      </h4>
                      {deliverable.notes.map((note, noteIndex) => (
                        <div key={noteIndex} className="flex items-center space-x-2">
                          <Sparkles size={14} className="text-primary" />
                          <span className="noto-sans-jp text-foreground/80 text-sm">
                            {note}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
            <div className="bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 rounded-lg p-8">
              <Video size={48} className="text-red-600 mx-auto mb-4" />
              <h2 className="neue-haas-grotesk-display text-red-800 mb-4 text-2xl">
                映像制作のご相談はこちら
              </h2>
              <p className="noto-sans-jp text-red-700 mb-6 leading-relaxed">
                どんなイメージでも構いません。<br />
                まずはお気軽にご相談ください。
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <a
                  href="mailto:361do.sleep@gmail.com"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Mail size={20} />
                  <span>メールで相談</span>
                </a>

                <Link
                  href="/contact"
                  className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Play size={20} />
                  <span>フォームから相談</span>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido. Let's create amazing visuals! 🎬
          </p>
        </footer>
      </div>
    </>
  );
}