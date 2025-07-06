import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Badge, 
  Mail, 
  ExternalLink, 
  Github,
  Twitter,
  Download,
  QrCode,
  Zap,
  Coffee,
  Palette,
  Code,
  Video,
  Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'samuido - デジタル名刺 | クリエイター版',
  description: 'samuido（さむいど）のカジュアルなデジタル名刺。SNS、連絡先、活動内容を気軽にチェック。',
  keywords: ['samuido', 'さむいど', 'デジタル名刺', 'クリエイター', 'SNS', '連絡先'],
  openGraph: {
    title: 'samuido - デジタル名刺 | クリエイター版',
    description: 'samuido（さむいど）のカジュアルなデジタル名刺。SNS、連絡先、活動内容を気軽にチェック。',
    type: 'profile',
    url: '/about/card/handle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'samuido - デジタル名刺 | クリエイター版',
    description: 'samuido（さむいど）のカジュアルなデジタル名刺。SNS、連絡先、活動内容を気軽にチェック。',
    creator: '@361do_sleep',
  },
};

const contactInfo = [
  {
    icon: <Mail size={20} />,
    label: '開発のお話',
    value: 'rebuild.up.up@gmail.com',
    link: 'mailto:rebuild.up.up@gmail.com',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    icon: <Mail size={20} />,
    label: 'デザインのお話',
    value: '361do.sleep@gmail.com',
    link: 'mailto:361do.sleep@gmail.com',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    icon: <Twitter size={20} />,
    label: 'Tech Twitter',
    value: '@361do_sleep',
    link: 'https://twitter.com/361do_sleep',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    icon: <Twitter size={20} />,
    label: 'Design Twitter',
    value: '@361do_design',
    link: 'https://twitter.com/361do_design',
    color: 'bg-pink-100 text-pink-800',
  },
];

const activities = [
  {
    icon: <Code size={24} />,
    title: 'コーディング',
    subtitle: 'React/Next.js が好き',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: <Palette size={24} />,
    title: 'デザイン',
    subtitle: 'UI/UX から グラフィックまで',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: <Video size={24} />,
    title: '映像制作',
    subtitle: 'モーショングラフィックス',
    gradient: 'from-red-500 to-red-600',
  },
];

const funFacts = [
  { emoji: '☕', fact: 'コーヒーより緑茶派' },
  { emoji: '🌙', fact: '夜型人間' },
  { emoji: '🎵', fact: '作業用BGMは必須' },
  { emoji: '🔥', fact: 'やる気スイッチが大事' },
];

const currentProjects = [
  'React Portfolio Website',
  'After Effects プラグイン開発',
  'Next.js 学習中',
  '新しいツール企画中',
];

export default function HandleCardPage() {
  const handleDownloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:samuido
N:samuido;;;;
ORG:Freelance
TITLE:クリエイター・エンジニア
EMAIL;TYPE=work:rebuild.up.up@gmail.com
EMAIL;TYPE=work:361do.sleep@gmail.com
URL:https://yusuke-kim.com
X-TWITTER:@361do_sleep
NOTE:Web開発、デザイン、映像制作など幅広く活動するクリエイター
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'samuido.vcf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'samuido',
    alternateName: 'さむいど',
    jobTitle: 'クリエイター・エンジニア',
    email: 'rebuild.up.up@gmail.com',
    url: 'https://yusuke-kim.com',
    sameAs: [
      'https://twitter.com/361do_sleep',
      'https://twitter.com/361do_design',
    ],
    knowsAbout: [
      'Web Development',
      'UI/UX Design',
      'Motion Graphics',
      'Creative Coding',
    ],
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

        {/* Main Content */}
        <main className="mx-auto max-w-2xl px-4 py-8">
          {/* Creative Digital Card */}
          <div className="border-foreground/20 bg-gray/50 border shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 text-white p-8 relative">
              <div className="absolute top-4 right-4">
                <Sparkles size={24} className="text-white/70" />
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm mx-auto mb-4 h-24 w-24 rounded-full flex items-center justify-center ring-4 ring-white/30">
                  <Badge size={48} className="text-white" />
                </div>
                <h1 className="neue-haas-grotesk-display mb-2 text-4xl font-bold">
                  samuido
                </h1>
                <p className="zen-kaku-gothic-new mb-1 text-xl opacity-90">
                  さむいど
                </p>
                <p className="text-white/80 text-lg">
                  クリエイター・エンジニア
                </p>
              </div>
            </div>

            {/* What I Do */}
            <div className="p-6">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg flex items-center space-x-2">
                <Zap size={20} className="text-primary" />
                <span>What I Do</span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${activity.gradient} text-white p-4 rounded-lg`}
                  >
                    <div className="flex items-center space-x-3">
                      {activity.icon}
                      <div>
                        <h3 className="font-semibold">{activity.title}</h3>
                        <p className="text-white/80 text-sm">{activity.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact with Style */}
            <div className="border-t border-foreground/20 p-6">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg flex items-center space-x-2">
                <Mail size={20} className="text-primary" />
                <span>Contact Me</span>
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {contactInfo.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.link}
                    className={`${contact.color} p-3 rounded-lg flex items-center space-x-3 hover:scale-105 transition-transform`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contact.icon}
                    <div>
                      <p className="font-medium text-sm">{contact.label}</p>
                      <p className="text-xs opacity-80">{contact.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Fun Facts */}
            <div className="border-t border-foreground/20 p-6">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg flex items-center space-x-2">
                <Coffee size={20} className="text-primary" />
                <span>Fun Facts</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {funFacts.map((item, index) => (
                  <div
                    key={index}
                    className="border-foreground/20 bg-gray/30 border p-3 rounded-lg text-center"
                  >
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <p className="noto-sans-jp text-foreground/80 text-xs">{item.fact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Projects */}
            <div className="border-t border-foreground/20 p-6">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                今やってること
              </h2>
              <div className="space-y-2">
                {currentProjects.map((project, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-gray/30 rounded"
                  >
                    <div className="bg-primary w-2 h-2 rounded-full"></div>
                    <p className="noto-sans-jp text-foreground/80 text-sm">{project}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Website Link */}
            <div className="border-t border-foreground/20 p-6">
              <a
                href="/"
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white p-4 rounded-lg flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105"
              >
                <ExternalLink size={20} />
                <span className="font-medium">Portfolio & More</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-foreground/20 p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  onClick={handleDownloadVCard}
                  className="bg-foreground text-gray hover:bg-foreground/90 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download size={20} />
                  <span>連絡先を保存</span>
                </button>

                <Link
                  href="/contact"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Mail size={20} />
                  <span>メッセージ</span>
                </Link>
              </div>
            </div>
          </div>

          {/* QR Code Section with Style */}
          <div className="mt-8">
            <div className="border-foreground/20 bg-gradient-to-br from-gray/50 to-gray/30 border rounded-2xl p-6 text-center">
              <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg flex items-center justify-center space-x-2">
                <QrCode size={20} className="text-primary" />
                <span>QR Code</span>
              </h3>
              <div className="bg-white mx-auto mb-4 h-32 w-32 rounded-xl flex items-center justify-center border-2 border-foreground/20 shadow-lg">
                <QrCode size={48} className="text-foreground/50" />
              </div>
              <p className="noto-sans-jp text-foreground/70 text-sm">
                この名刺をシェア
              </p>
              <p className="noto-sans-jp text-foreground/50 text-xs mt-1">
                ※ QRコード生成機能は実装予定
              </p>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">✨</div>
              <p className="neue-haas-grotesk-display text-purple-800 text-lg font-medium mb-2">
                "やる気になれば何でもできる"
              </p>
              <p className="noto-sans-jp text-purple-600 text-sm">
                - samuido's モットー
              </p>
            </div>
          </div>

          {/* Navigation */}
          <section className="mt-8 text-center">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link
                href="/about/card/real"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 rounded-lg transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  正式版の名刺
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">木村友亮 名義</p>
              </Link>

              <Link
                href="/about/profile/handle"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 rounded-lg transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  詳しいプロフィール
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">カジュアル版</p>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido. Keep creating! ✨
          </p>
        </footer>
      </div>
    </>
  );
}