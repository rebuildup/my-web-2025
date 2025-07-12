import React from 'react';
import Link from 'next/link';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';
import {
  User,
  Code,
  Palette,
  Video,
  Mail,
  ExternalLink,
  Award,
  // Calendar,
  // MapPin,
} from 'lucide-react';

export default function AboutPage() {
  const skills = [
    { category: 'デザイン', items: ['Photoshop', 'Illustrator', 'AdobeXD', 'Figma'] },
    {
      category: 'プログラミング',
      items: ['C', 'C++', 'C#', 'HTML', 'JavaScript', 'TypeScript', 'CSS'],
    },
    {
      category: '技術スタック',
      items: ['React', 'NextJS', 'Tailwind CSS', 'p5js', 'PIXIjs', 'GSAP'],
    },
    { category: '映像', items: ['AfterEffects', 'Aviult', 'PremierePro', 'Blender'] },
    { category: 'その他', items: ['Unity', 'Cubase'] },
  ];

  const achievements = [
    { year: '2022/10', title: 'U-16プログラミングコンテスト山口大会2022', award: 'アイデア賞' },
    {
      year: '2023/10',
      title: 'U-16プログラミングコンテスト山口大会2023',
      award: '技術賞 企業(プライムゲート)賞',
    },
    {
      year: '2024/3',
      title: '中国地区高専コンピュータフェスティバル2024',
      award: 'ゲーム部門 1位',
    },
  ];

  return (
    <GridLayout background={false} className="bg-gray">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <GridContainer padding={false} className="flex items-center justify-between">
          <Link
            href="/"
            className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-xl"
          >
            ← Home
          </Link>
          <div className="text-foreground/60 text-sm">About</div>
        </GridContainer>
      </nav>

      {/* Header */}
      <GridSection spacing="md">
        <h1 className="neue-haas-grotesk-display text-primary mb-4 text-3xl md:text-4xl">About</h1>
        <p className="noto-sans-jp text-foreground/80">
          グラフィックデザイン、映像制作、個人開発など幅広く活動しています。やる気になれば何でもできるのが強みです。
        </p>
      </GridSection>

      {/* Main Content */}
      <main>
        <GridContainer className="pb-16">
          <GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }} className="gap-8">
            {/* Profile Selection Cards */}
            <div className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">プロフィール</h2>

              {/* Real Name Profile Card */}
              <Link
                href="/about/profile/real"
                className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-6 transition-all duration-300"
              >
                <div className="mb-4 flex items-center gap-3">
                  <User size={24} className="text-primary" />
                  <h3 className="neue-haas-grotesk-display text-foreground text-xl">木村友亮</h3>
                </div>
                <p className="text-foreground/70 mb-4">
                  採用担当者や企業向けの正式な自己紹介。経歴、学歴、受賞歴を詳細に紹介します。
                </p>
                <div className="text-foreground/60 flex items-center gap-2 text-sm">
                  <span>Webデザイナー・開発者</span>
                  <ExternalLink size={16} />
                </div>
              </Link>

              {/* Handle Name Profile Card */}
              <Link
                href="/about/profile/handle"
                className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-6 transition-all duration-300"
              >
                <div className="mb-4 flex items-center gap-3">
                  <Code size={24} className="text-primary" />
                  <h3 className="neue-haas-grotesk-display text-foreground text-xl">samuido</h3>
                </div>
                <p className="text-foreground/70 mb-4">
                  同業者向けのラフな自己紹介。技術的な興味や活動を中心に紹介します。
                </p>
                <div className="text-foreground/60 flex items-center gap-2 text-sm">
                  <span>フロントエンドエンジニア</span>
                  <ExternalLink size={16} />
                </div>
              </Link>

              {/* AI Chat Profile Card */}
              <Link
                href="/about/profile/ai"
                className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-6 transition-all duration-300"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                  <h3 className="neue-haas-grotesk-display text-foreground text-xl">AI Chat</h3>
                </div>
                <p className="text-foreground/70 mb-4">
                  AIのsamuidoとチャット形式で対話。プロフィールや作品について質問できます。
                </p>
                <div className="text-foreground/60 flex items-center gap-2 text-sm">
                  <span>対話型プロフィール</span>
                  <ExternalLink size={16} />
                </div>
              </Link>
            </div>

            {/* Navigation Cards */}
            <div className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">ナビゲーション</h2>

              {/* Digital Business Cards */}
              <div className="space-y-4">
                <Link
                  href="/about/card/real"
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-8 rounded bg-gradient-to-r from-blue-500 to-green-500"></div>
                    <div>
                      <h4 className="neue-haas-grotesk-display text-foreground font-medium">
                        デジタル名刺 (本名)
                      </h4>
                      <p className="text-foreground/60 text-sm">QRコード付きでダウンロード可能</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/about/card/handle"
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-8 rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <div>
                      <h4 className="neue-haas-grotesk-display text-foreground font-medium">
                        デジタル名刺 (ハンドル)
                      </h4>
                      <p className="text-foreground/60 text-sm">QRコード付きでダウンロード可能</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Links */}
              <Link
                href="/about/links"
                className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-4 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={20} className="text-primary" />
                  <div>
                    <h4 className="neue-haas-grotesk-display text-foreground font-medium">
                      リンクマップ
                    </h4>
                    <p className="text-foreground/60 text-sm">
                      SNS、開発関連、クリエイティブ関連の外部リンク
                    </p>
                  </div>
                </div>
              </Link>

              {/* Commission */}
              <div className="space-y-4">
                <Link
                  href="/about/commission/develop"
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Code size={20} className="text-primary" />
                    <div>
                      <h4 className="neue-haas-grotesk-display text-foreground font-medium">
                        開発依頼
                      </h4>
                      <p className="text-foreground/60 text-sm">
                        Web開発・アプリ開発・プラグイン開発
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/about/commission/video"
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Video size={20} className="text-primary" />
                    <div>
                      <h4 className="neue-haas-grotesk-display text-foreground font-medium">
                        映像依頼
                      </h4>
                      <p className="text-foreground/60 text-sm">
                        MV制作・アニメーション・プロモーション映像
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/about/commission/estimate"
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 block border p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Palette size={20} className="text-primary" />
                    <div>
                      <h4 className="neue-haas-grotesk-display text-foreground font-medium">
                        見積もり計算機
                      </h4>
                      <p className="text-foreground/60 text-sm">映像制作の見積もりを自動計算</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Skills & Achievements */}
            <div className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">スキル & 実績</h2>

              {/* Skills */}
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">スキル</h3>
                <div className="space-y-4">
                  {skills.map(skillGroup => (
                    <div key={skillGroup.category}>
                      <h4 className="text-foreground/80 mb-2 font-medium">{skillGroup.category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items.map(skill => (
                          <span
                            key={skill}
                            className="bg-foreground/10 text-foreground/80 rounded px-2 py-1 text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 flex items-center gap-2 text-lg">
                  <Award size={20} />
                  受賞歴
                </h3>
                <div className="space-y-3">
                  {achievements.map(achievement => (
                    <div key={achievement.year} className="flex items-start gap-3">
                      <div className="bg-primary min-w-fit rounded px-2 py-1 text-xs text-white">
                        {achievement.year}
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{achievement.title}</p>
                        <p className="text-foreground/60 text-sm">{achievement.award}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 flex items-center gap-2 text-lg">
                  <Mail size={20} />
                  連絡先
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-foreground/60" />
                    <span className="text-foreground">361do.sleep@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink size={16} className="text-foreground/60" />
                    <span className="text-foreground">@361do_sleep (開発関連)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink size={16} className="text-foreground/60" />
                    <span className="text-foreground">@361do_design (映像・デザイン関連)</span>
                  </div>
                </div>
              </div>
            </div>
          </GridContent>
        </GridContainer>
      </main>
    </GridLayout>
  );
}
