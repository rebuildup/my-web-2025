import React from 'react';
import Link from 'next/link';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';
import {
  User,
  Award,
  Calendar,
  MapPin,
  Mail,
  ExternalLink,
  Code,
  Palette,
  Video,
  Gamepad2,
} from 'lucide-react';

export default function RealProfilePage() {
  const skills = [
    {
      category: 'デザイン',
      icon: <Palette size={20} className="text-primary" />,
      items: [
        { name: 'Photoshop', level: 90 },
        { name: 'Illustrator', level: 85 },
        { name: 'AdobeXD', level: 80 },
        { name: 'Figma', level: 75 },
      ],
    },
    {
      category: 'プログラミング言語',
      icon: <Code size={20} className="text-primary" />,
      items: [
        { name: 'C', level: 85 },
        { name: 'C++', level: 80 },
        { name: 'C#', level: 75 },
        { name: 'HTML', level: 95 },
        { name: 'JavaScript', level: 90 },
        { name: 'TypeScript', level: 85 },
        { name: 'CSS', level: 90 },
      ],
    },
    {
      category: '技術スタック',
      icon: <Code size={20} className="text-primary" />,
      items: [
        { name: 'React', level: 85 },
        { name: 'NextJS', level: 80 },
        { name: 'Tailwind CSS', level: 90 },
        { name: 'p5js', level: 85 },
        { name: 'PIXIjs', level: 80 },
        { name: 'GSAP', level: 75 },
      ],
    },
    {
      category: '映像',
      icon: <Video size={20} className="text-primary" />,
      items: [
        { name: 'AfterEffects', level: 85 },
        { name: 'Aviult', level: 80 },
        { name: 'PremierePro', level: 80 },
        { name: 'Blender', level: 70 },
      ],
    },
    {
      category: 'その他',
      icon: <Gamepad2 size={20} className="text-primary" />,
      items: [
        { name: 'Unity', level: 75 },
        { name: 'Cubase', level: 70 },
      ],
    },
  ];

  const timeline = [
    {
      year: '2023/3',
      title: '公立中学卒業',
      description: '公立中学を卒業',
      type: 'education',
    },
    {
      year: '2023/4',
      title: '高専入学',
      description: '高専に入学し、現在在学中',
      type: 'education',
    },
    {
      year: '2022/10',
      title: 'U-16プログラミングコンテスト山口大会2022',
      description: 'アイデア賞を受賞',
      type: 'award',
    },
    {
      year: '2023/10',
      title: 'U-16プログラミングコンテスト山口大会2023',
      description: '技術賞 企業(プライムゲート)賞を受賞',
      type: 'award',
    },
    {
      year: '2024/3',
      title: '中国地区高専コンピュータフェスティバル2024',
      description: 'ゲーム部門 1位を受賞',
      type: 'award',
    },
  ];

  return (
    <GridLayout background={false} className="bg-gray">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <GridContainer padding={false} className="flex items-center justify-between">
          <Link
            href="/01_about"
            className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-xl"
          >
            ← About
          </Link>
          <div className="text-foreground/60 text-sm">木村友亮 プロフィール</div>
        </GridContainer>
      </nav>

      {/* Header */}
      <GridSection spacing="md">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h1 className="neue-haas-grotesk-display text-primary text-3xl md:text-4xl">
              木村友亮
            </h1>
            <p className="noto-sans-jp text-foreground/80 text-lg">Webデザイナー・開発者</p>
          </div>
        </div>
        <p className="noto-sans-jp text-foreground/80">
          グラフィックデザイン、映像制作、個人開発など幅広く活動しています。やる気になれば何でもできるのが強みです。
        </p>
      </GridSection>

      {/* Main Content */}
      <main>
        <GridContainer className="pb-16">
          <GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }} className="gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">基本情報</h2>

              <div className="border-foreground/20 bg-gray/50 border p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-foreground/60" />
                    <div>
                      <p className="text-foreground/60 text-sm">生年月日</p>
                      <p className="text-foreground font-medium">平成19年10月生</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-foreground/60" />
                    <div>
                      <p className="text-foreground/60 text-sm">現況</p>
                      <p className="text-foreground font-medium">現役高専生(2025年7月現在)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Code size={20} className="text-foreground/60" />
                    <div>
                      <p className="text-foreground/60 text-sm">職種</p>
                      <p className="text-foreground font-medium">Webデザイナー・開発者</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border-foreground/20 bg-gray/50 border p-6">
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 flex items-center gap-2 text-lg">
                  <Mail size={20} />
                  連絡先
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-foreground/60" />
                    <span className="text-foreground">361do.sleep@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExternalLink size={16} className="text-foreground/60" />
                    <span className="text-foreground">@361do_sleep (開発関連)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExternalLink size={16} className="text-foreground/60" />
                    <span className="text-foreground">@361do_design (映像・デザイン関連)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-foreground flex items-center gap-2 text-2xl">
                <Award size={24} />
                経歴・受賞歴
              </h2>

              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="border-foreground/20 bg-gray/50 border p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`min-w-fit rounded px-3 py-1 text-xs ${
                          item.type === 'award'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-primary text-white'
                        }`}
                      >
                        {item.year}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-foreground mb-1 font-medium">{item.title}</h4>
                        <p className="text-foreground/60 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">スキル</h2>

              <div className="space-y-6">
                {skills.map(skillGroup => (
                  <div
                    key={skillGroup.category}
                    className="border-foreground/20 bg-gray/50 border p-6"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      {skillGroup.icon}
                      <h3 className="neue-haas-grotesk-display text-foreground text-lg">
                        {skillGroup.category}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {skillGroup.items.map(skill => (
                        <div key={skill.name}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-foreground text-sm">{skill.name}</span>
                            <span className="text-foreground/60 text-xs">{skill.level}%</span>
                          </div>
                          <div className="bg-foreground/10 h-2 w-full rounded-full">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GridContent>
        </GridContainer>
      </main>
    </GridLayout>
  );
}
