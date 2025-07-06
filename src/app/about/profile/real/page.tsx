import Link from 'next/link';
import type { Metadata } from 'next';
import { User, Award, MapPin, Calendar, Mail, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: '木村友亮 - 本名プロフィール | samuido',
  description: '木村友亮（きむらゆうすけ）の正式なプロフィール。経歴、学歴、受賞歴、スキル、実績を詳しく紹介。',
  keywords: ['木村友亮', 'プロフィール', '経歴', '学歴', '受賞歴', 'エンジニア', 'デザイナー'],
  openGraph: {
    title: '木村友亮 - 本名プロフィール | samuido',
    description: '木村友亮（きむらゆうすけ）の正式なプロフィール。経歴、学歴、受賞歴、スキル、実績を詳しく紹介。',
    type: 'profile',
    url: '/about/profile/real',
  },
  twitter: {
    card: 'summary_large_image',
    title: '木村友亮 - 本名プロフィール | samuido',
    description: '木村友亮（きむらゆうすけ）の正式なプロフィール。経歴、学歴、受賞歴、スキル、実績を詳しく紹介。',
    creator: '@361do_sleep',
  },
};

const awards = [
  {
    year: '~2023',
    title: '市区学校美術展覧会',
    result: '受賞多数',
    description: '中学時代を通じて美術分野で多数の受賞を重ねる',
  },
  {
    year: '2022/10',
    title: 'U-16プログラミングコンテスト山口大会2022',
    result: 'アイデア賞',
    description: '独創的なアイデアと実装力が評価される',
  },
  {
    year: '2023/10',
    title: 'U-16プログラミングコンテスト山口大会2023',
    result: '技術賞・企業賞（プライムゲート）',
    description: '技術力と実装品質が高く評価され、企業からも認められる',
  },
  {
    year: '2024/3',
    title: '中国地区高専コンピュータフェスティバル2024',
    result: 'ゲーム部門 1位',
    description: '高専生の技術力を競うコンテストで最高位を獲得',
  },
];

const skills = [
  {
    category: 'デザイン',
    items: ['Photoshop', 'Illustrator', 'Adobe XD', 'Figma'],
    level: 'Advanced',
  },
  {
    category: 'プログラミング',
    items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML/CSS'],
    level: 'Advanced',
  },
  {
    category: 'バックエンド',
    items: ['C', 'C++', 'C#', 'Node.js'],
    level: 'Intermediate',
  },
  {
    category: '映像制作',
    items: ['After Effects', 'Premiere Pro', 'Blender', 'Aviutl'],
    level: 'Advanced',
  },
  {
    category: '技術スタック',
    items: ['Tailwind CSS', 'p5.js', 'PIXI.js', 'GSAP'],
    level: 'Intermediate',
  },
  {
    category: 'その他',
    items: ['Unity', 'Cubase'],
    level: 'Intermediate',
  },
];

export default function RealProfilePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'Kimura Yusuke',
    jobTitle: 'エンジニア・デザイナー',
    description: 'グラフィックデザイン、映像制作、個人開発など幅広く活動する高専生',
    birthDate: '2007-10',
    email: 'rebuild.up.up@gmail.com',
    url: 'https://yusuke-kim.com/about/profile/real',
    sameAs: ['https://twitter.com/361do_sleep', 'https://twitter.com/361do_design'],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: '高等専門学校',
    },
    knowsAbout: [
      'Web Design',
      'Frontend Development',
      'Video Production',
      'Graphic Design',
      'React',
      'Next.js',
      'TypeScript',
      'Adobe Creative Suite',
    ],
    award: [
      '市区学校美術展覧会 受賞多数',
      'U-16プログラミングコンテスト山口大会2022 アイデア賞',
      'U-16プログラミングコンテスト山口大会2023 技術賞・企業賞',
      '中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位',
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

        {/* Hero Header */}
        <header className="px-4 py-12 text-center">
          <div className="bg-primary mx-auto mb-6 h-24 w-24 rounded-full flex items-center justify-center">
            <User size={48} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-2 text-4xl md:text-6xl">
            木村友亮
          </h1>
          <p className="zen-kaku-gothic-new text-foreground/80 mb-4 text-xl md:text-2xl">
            Kimura Yusuke
          </p>
          <p className="noto-sans-jp text-foreground/60 text-lg">
            エンジニア・デザイナー
          </p>
          <div className="bg-primary mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 pb-16">
          {/* Basic Information */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              基本情報
            </h2>

            <div className="border-foreground/20 bg-gray/50 border p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-primary" />
                  <div>
                    <h3 className="neue-haas-grotesk-display text-foreground text-lg">生年月日</h3>
                    <p className="noto-sans-jp text-foreground/80">平成19年10月生（2007年10月）</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin size={20} className="text-primary" />
                  <div>
                    <h3 className="neue-haas-grotesk-display text-foreground text-lg">現在</h3>
                    <p className="noto-sans-jp text-foreground/80">現役高専生（2025年7月現在）</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 md:col-span-2">
                  <Mail size={20} className="text-primary" />
                  <div>
                    <h3 className="neue-haas-grotesk-display text-foreground text-lg">連絡先</h3>
                    <p className="noto-sans-jp text-foreground/80">
                      開発・技術依頼: rebuild.up.up@gmail.com
                    </p>
                    <p className="noto-sans-jp text-foreground/80">
                      映像・デザイン依頼: 361do.sleep@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Education History */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              経歴・学歴
            </h2>

            <div className="space-y-4">
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <div className="flex items-center justify-between">
                  <h3 className="neue-haas-grotesk-display text-foreground text-lg">2023年4月 - 現在</h3>
                  <span className="text-primary bg-primary/10 px-3 py-1 rounded text-sm">在学中</span>
                </div>
                <p className="noto-sans-jp text-foreground/80 mt-2">高等専門学校 入学・在学中</p>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-6">
                <div className="flex items-center justify-between">
                  <h3 className="neue-haas-grotesk-display text-foreground text-lg">2023年3月</h3>
                  <span className="text-foreground/50 bg-foreground/10 px-3 py-1 rounded text-sm">卒業</span>
                </div>
                <p className="noto-sans-jp text-foreground/80 mt-2">公立中学校 卒業</p>
              </div>
            </div>
          </section>

          {/* Awards */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              受賞歴
            </h2>

            <div className="space-y-4">
              {awards.map((award, index) => (
                <div key={index} className="border-foreground/20 bg-gray/50 border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Award size={20} className="text-primary" />
                        <h3 className="neue-haas-grotesk-display text-foreground text-lg">
                          {award.title}
                        </h3>
                      </div>
                      <p className="noto-sans-jp text-foreground/80 mb-1">{award.description}</p>
                      <p className="noto-sans-jp text-foreground/60 text-sm">{award.year}</p>
                    </div>
                    <span className="text-primary bg-primary/10 px-3 py-1 rounded text-sm font-medium">
                      {award.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              スキル・技術
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {skills.map((skill, index) => (
                <div key={index} className="border-foreground/20 bg-gray/50 border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="neue-haas-grotesk-display text-foreground text-lg">
                      {skill.category}
                    </h3>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      skill.level === 'Advanced' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {skill.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="noto-sans-jp text-foreground/80 text-sm">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              自己紹介
            </h2>

            <div className="border-foreground/20 bg-gray/50 border p-8">
              <div className="noto-sans-jp text-foreground/80 space-y-4 text-lg leading-relaxed">
                <p>
                  グラフィックデザイン、映像制作、個人開発など幅広く活動している高専生です。
                  中学時代から美術分野で多数の受賞を重ね、プログラミングコンテストでも継続的に結果を残してきました。
                </p>
                <p>
                  技術力と創造性を組み合わせた作品制作を得意とし、
                  WebデザインからAfter Effectsプラグイン開発まで、
                  幅広い分野でのプロジェクトを手がけています。
                </p>
                <p>
                  「やる気になれば何でもできる」をモットーに、
                  常に新しい技術や表現方法に挑戦し続けています。
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              お問い合わせ
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg">
                  開発・技術依頼
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-primary" />
                    <span className="noto-sans-jp text-foreground/80">rebuild.up.up@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ExternalLink size={16} className="text-primary" />
                    <span className="noto-sans-jp text-foreground/80">@361do_sleep</span>
                  </div>
                </div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg">
                  映像・デザイン依頼
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-primary" />
                    <span className="noto-sans-jp text-foreground/80">361do.sleep@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ExternalLink size={16} className="text-primary" />
                    <span className="noto-sans-jp text-foreground/80">@361do_design</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="text-center">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link
                href="/about/profile/handle"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  ハンドルネーム版
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">もっとラフな紹介</p>
              </Link>

              <Link
                href="/about/card/real"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  デジタル名刺
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">連絡先情報</p>
              </Link>

              <Link
                href="/about/commission"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  依頼について
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">制作依頼・相談</p>
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