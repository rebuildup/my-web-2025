import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Github,
  Twitter,
  Download,
  QrCode,
  Award,
  Briefcase
} from 'lucide-react';

export const metadata: Metadata = {
  title: '木村友亮 - デジタル名刺 | samuido',
  description: '木村友亮のデジタル名刺。連絡先、SNS、基本情報を一覧で確認できます。',
  keywords: ['木村友亮', 'デジタル名刺', '連絡先', 'SNS', '名刺', 'vCard'],
  openGraph: {
    title: '木村友亮 - デジタル名刺 | samuido',
    description: '木村友亮のデジタル名刺。連絡先、SNS、基本情報を一覧で確認できます。',
    type: 'profile',
    url: '/about/card/real',
  },
  twitter: {
    card: 'summary_large_image',
    title: '木村友亮 - デジタル名刺 | samuido',
    description: '木村友亮のデジタル名刺。連絡先、SNS、基本情報を一覧で確認できます。',
    creator: '@361do_sleep',
  },
};

const contactInfo = [
  {
    icon: <Mail size={20} />,
    label: '開発・技術依頼',
    value: 'rebuild.up.up@gmail.com',
    link: 'mailto:rebuild.up.up@gmail.com',
  },
  {
    icon: <Mail size={20} />,
    label: '映像・デザイン依頼',
    value: '361do.sleep@gmail.com',
    link: 'mailto:361do.sleep@gmail.com',
  },
  {
    icon: <Twitter size={20} />,
    label: 'Twitter (開発)',
    value: '@361do_sleep',
    link: 'https://twitter.com/361do_sleep',
  },
  {
    icon: <Twitter size={20} />,
    label: 'Twitter (デザイン)',
    value: '@361do_design',
    link: 'https://twitter.com/361do_design',
  },
];

const achievements = [
  '中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位',
  'U-16プログラミングコンテスト山口大会2023 技術賞・企業賞',
  'U-16プログラミングコンテスト山口大会2022 アイデア賞',
  '市区学校美術展覧会 受賞多数',
];

const skills = [
  'JavaScript/TypeScript',
  'React/Next.js',
  'HTML/CSS',
  'Photoshop/Illustrator',
  'After Effects',
  'Figma',
  'C/C++/C#',
  'Unity',
];

export default function RealCardPage() {
  const handleDownloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:木村友亮
N:木村;友亮;;;
ORG:高等専門学校
TITLE:エンジニア・デザイナー
EMAIL;TYPE=work:rebuild.up.up@gmail.com
EMAIL;TYPE=work:361do.sleep@gmail.com
URL:https://yusuke-kim.com
NOTE:グラフィックデザイン、映像制作、個人開発など幅広く活動
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kimura_yusuke.vcf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '木村友亮',
    jobTitle: 'エンジニア・デザイナー',
    email: 'rebuild.up.up@gmail.com',
    url: 'https://yusuke-kim.com',
    sameAs: [
      'https://twitter.com/361do_sleep',
      'https://twitter.com/361do_design',
    ],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: '高等専門学校',
    },
    knowsAbout: skills,
    award: achievements,
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
          {/* Digital Business Card */}
          <div className="border-foreground/20 bg-gray/50 border shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm mx-auto mb-4 h-24 w-24 rounded-full flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
                <h1 className="neue-haas-grotesk-display mb-2 text-3xl font-bold">
                  木村友亮
                </h1>
                <p className="zen-kaku-gothic-new mb-1 text-xl">
                  Kimura Yusuke
                </p>
                <p className="text-white/80">
                  エンジニア・デザイナー
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-primary" />
                  <div>
                    <p className="neue-haas-grotesk-display text-foreground text-sm">生年月日</p>
                    <p className="noto-sans-jp text-foreground/80 text-sm">2007年10月</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin size={20} className="text-primary" />
                  <div>
                    <p className="neue-haas-grotesk-display text-foreground text-sm">現在</p>
                    <p className="noto-sans-jp text-foreground/80 text-sm">高専生</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Briefcase size={20} className="text-primary" />
                  <div>
                    <p className="neue-haas-grotesk-display text-foreground text-sm">専門</p>
                    <p className="noto-sans-jp text-foreground/80 text-sm">Web開発・デザイン</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Award size={20} className="text-primary" />
                  <div>
                    <p className="neue-haas-grotesk-display text-foreground text-sm">最新受賞</p>
                    <p className="noto-sans-jp text-foreground/80 text-sm">高専コンテスト 1位</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-foreground/20 p-6">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                連絡先
              </h2>
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-primary">{contact.icon}</div>
                    <div className="flex-1">
                      <p className="neue-haas-grotesk-display text-foreground text-sm">
                        {contact.label}
                      </p>
                      <a
                        href={contact.link}
                        className="noto-sans-jp text-primary hover:text-primary/80 text-sm underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {contact.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="border-t border-foreground/20 p-6">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                主要スキル
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {skills.map((skill, index) => (
                  <div key={index} className="text-primary bg-primary/10 px-3 py-1 rounded text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="border-t border-foreground/20 p-6">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                主な受賞歴
              </h2>
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="text-primary mt-1">
                      <Award size={16} />
                    </div>
                    <p className="noto-sans-jp text-foreground/80 text-sm leading-relaxed">
                      {achievement}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Website & Portfolio */}
            <div className="border-t border-foreground/20 p-6">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                ウェブサイト
              </h2>
              <div className="space-y-3">
                <a
                  href="/"
                  className="flex items-center space-x-3 p-3 border border-foreground/20 rounded hover:border-primary transition-colors"
                >
                  <ExternalLink size={20} className="text-primary" />
                  <div>
                    <p className="neue-haas-grotesk-display text-foreground text-sm">
                      ポートフォリオサイト
                    </p>
                    <p className="noto-sans-jp text-foreground/70 text-xs">
                      作品・ツール・ブログ
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-foreground/20 p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  onClick={handleDownloadVCard}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download size={20} />
                  <span>連絡先を保存</span>
                </button>

                <Link
                  href="/contact"
                  className="border-primary text-primary hover:bg-primary hover:text-white border px-4 py-2 rounded flex items-center justify-center space-x-2 transition-colors"
                >
                  <Mail size={20} />
                  <span>メッセージ送信</span>
                </Link>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-8 text-center">
            <div className="border-foreground/20 bg-gray/50 border rounded-lg p-6">
              <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                QRコード
              </h3>
              <div className="bg-white mx-auto mb-4 h-32 w-32 rounded-lg flex items-center justify-center border">
                <QrCode size={48} className="text-foreground/50" />
              </div>
              <p className="noto-sans-jp text-foreground/70 text-sm">
                このページのURLをQRコードで共有
              </p>
              <p className="noto-sans-jp text-foreground/50 text-xs mt-1">
                ※ QRコード生成機能は実装予定
              </p>
            </div>
          </div>

          {/* Navigation */}
          <section className="mt-8 text-center">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link
                href="/about/card/handle"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 rounded transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  ハンドルネーム版
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">samuido の名刺</p>
              </Link>

              <Link
                href="/about/links"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 rounded transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  リンク集
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">SNS・作品リンク</p>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 木村友亮 (Kimura Yusuke). All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}