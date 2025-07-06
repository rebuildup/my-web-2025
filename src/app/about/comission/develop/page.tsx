import { Metadata } from "next";
import { ArrowLeft, Code, Globe, Smartphone, Database, Palette, Clock, DollarSign, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "開発依頼 - samuido | Web開発サービス",
  description: "Webサイト、アプリケーション開発の依頼承ります。React, Next.js, TypeScriptを使ったモダンな開発。",
  keywords: ["Web開発", "依頼", "React", "Next.js", "TypeScript", "アプリ開発", "サイト制作"],
  robots: "index, follow",
  openGraph: {
    title: "開発依頼 - samuido | Web開発サービス",
    description: "Webサイト、アプリケーション開発の依頼承ります。React, Next.js, TypeScriptを使ったモダンな開発。",
    type: "website",
    url: "/about/comission/develop",
    images: [
      {
        url: "/about/comission-develop-og.jpg",
        width: 1200,
        height: 630,
        alt: "Web開発サービス",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "開発依頼 - samuido | Web開発サービス",
    description: "Webサイト、アプリケーション開発の依頼承ります。React, Next.js, TypeScriptを使ったモダンな開発。",
    images: ["/about/comission-develop-twitter.jpg"],
    creator: "@361do_sleep",
  },
};

// Service data
const services = [
  {
    icon: Globe,
    title: "Webサイト制作",
    description: "コーポレートサイトから個人ポートフォリオまで",
    features: ["レスポンシブデザイン", "SEO最適化", "高速読み込み", "アクセシビリティ対応"],
    basePrice: "¥50,000~",
    duration: "2-4週間",
  },
  {
    icon: Smartphone,
    title: "Webアプリケーション",
    description: "React/Next.jsを使ったインタラクティブなアプリ",
    features: ["SPA開発", "API連携", "状態管理", "リアルタイム機能"],
    basePrice: "¥100,000~",
    duration: "4-8週間",
  },
  {
    icon: Database,
    title: "API開発",
    description: "バックエンドAPIおよびデータベース設計",
    features: ["REST API", "GraphQL", "データベース設計", "セキュリティ対応"],
    basePrice: "¥80,000~",
    duration: "3-6週間",
  },
  {
    icon: Palette,
    title: "UI/UXデザイン",
    description: "ユーザー体験を重視したデザイン設計",
    features: ["ワイヤーフレーム", "プロトタイプ", "デザインシステム", "ユーザビリティテスト"],
    basePrice: "¥40,000~",
    duration: "1-3週間",
  },
];

const techStack = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", 
  "Node.js", "Python", "PostgreSQL", "MongoDB",
  "AWS", "Vercel", "Docker", "Git"
];

const workflow = [
  {
    step: "01",
    title: "ヒアリング",
    description: "要件や目標を詳しくお伺いし、プロジェクトの方向性を決めます",
  },
  {
    step: "02",
    title: "設計・提案",
    description: "ワイヤーフレームやデザインモックアップを作成し、方針を固めます",
  },
  {
    step: "03",
    title: "開発・実装",
    description: "アジャイル開発手法で、定期的に進捗をシェアしながら開発します",
  },
  {
    step: "04",
    title: "テスト・デプロイ",
    description: "品質チェック、パフォーマンス最適化を行い、本番環境にリリースします",
  },
];

const ServiceCard = ({ service }: { service: typeof services[0] }) => {
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
        <h4 className="text-[#0000ff] font-medium mb-2 text-sm">主な機能</h4>
        <ul className="space-y-1">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle className="w-3 h-3 text-[#0000ff]" />
              {feature}
            </li>
          ))}
        </ul>
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

const WorkflowStep = ({ step }: { step: typeof workflow[0] }) => (
  <div className="bg-[#333] p-6 rounded-sm">
    <div className="flex items-center gap-4 mb-3">
      <div className="w-10 h-10 bg-[#0000ff] rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">{step.step}</span>
      </div>
      <h3 className="neue-haas-grotesk-display text-lg text-white">{step.title}</h3>
    </div>
    <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
  </div>
);

export default function DevelopCommissionPage() {
  return (
    <div className="min-h-screen bg-[#222] text-white">
      {/* Header */}
      <header className="bg-[#333] border-b border-[#444]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-4">
            <Link href="/about" className="text-[#0000ff] hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="neue-haas-grotesk-display text-xl text-white">開発依頼サービス</h1>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="w-20 h-20 bg-[#0000ff] rounded-full mx-auto mb-6 flex items-center justify-center">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h2 className="neue-haas-grotesk-display text-4xl mb-4">開発依頼サービス</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            モダンな技術スタックで、あなたのアイデアを形にします。<br />
            Webサイトから複雑なアプリケーションまで、幅広く対応します。
          </p>
        </section>

        {/* Services */}
        <section className="mb-16">
          <h3 className="neue-haas-grotesk-display text-3xl text-center mb-8">サービス一覧</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h3 className="neue-haas-grotesk-display text-3xl text-center mb-8">技術スタック</h3>
          <div className="bg-[#333] p-8 rounded-sm">
            <p className="text-center text-gray-300 mb-6">
              最新の技術を使って、高品質でスケーラブルなシステムを構築します
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-[#0000ff] text-white rounded-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="mb-16">
          <h3 className="neue-haas-grotesk-display text-3xl text-center mb-8">開発フロー</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((step, index) => (
              <WorkflowStep key={index} step={step} />
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-[#333] p-8 rounded-sm border border-[#444]">
            <h3 className="neue-haas-grotesk-display text-2xl mb-4">お気軽にご相談ください</h3>
            <p className="text-gray-300 mb-6">
              プロジェクトの規模や要件に関わらず、まずはお話をお聞かせください。<br />
              無料で見積もりや技術的なアドバイスを提供します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:rebuild.up.up@gmail.com"
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
              連絡先: rebuild.up.up@gmail.com | Twitter: @361do_sleep
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}