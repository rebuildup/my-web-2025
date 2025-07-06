"use client";

import Link from "next/link";
import type { Metadata } from "next";
import { useState } from "react";
import { ArrowLeft, User, Trophy, GraduationCap, Star, Calendar, Mail, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile - samuido | 木村友亮の詳細プロフィール",
  description: "Webデザイナー・開発者木村友亮の詳細プロフィール。学歴、職歴、スキル、受賞歴を時系列でご紹介。",
  keywords: ["木村友亮", "プロフィール", "経歴", "学歴", "スキル", "職歴", "受賞歴", "高専生"],
  robots: "index, follow",
  openGraph: {
    title: "Profile - samuido | 木村友亮の詳細プロフィール",
    description: "Webデザイナー・開発者木村友亮の詳細プロフィール。学歴、職歴、スキル、受賞歴を時系列でご紹介。",
    type: "profile",
    url: "/about/profile/real",
    images: [
      {
        url: "/about/profile-real-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Profile Real samuido",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profile - samuido | 木村友亮の詳細プロフィール",
    description: "Webデザイナー・開発者木村友亮の詳細プロフィール。学歴、職歴、スキル、受賞歴を時系列でご紹介。",
    images: ["/about/profile-real-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

interface TimelineItem {
  year: string;
  month: string;
  title: string;
  description: string;
  category: 'education' | 'achievement' | 'activity';
  icon: React.ReactNode;
}

interface SkillItem {
  name: string;
  level: number;
  category: 'design' | 'programming' | 'video' | 'other';
  description: string;
}

interface ContactItem {
  name: string;
  value: string;
  url: string;
  icon: React.ReactNode;
}

const timelineItems: TimelineItem[] = [
  {
    year: "2023",
    month: "3",
    title: "公立中学校卒業",
    description: "義務教育を修了",
    category: "education",
    icon: <GraduationCap size={16} />,
  },
  {
    year: "2023",
    month: "4",
    title: "高専入学",
    description: "制御情報工学科に入学、現在在学中",
    category: "education",
    icon: <GraduationCap size={16} />,
  },
  {
    year: "2022",
    month: "10",
    title: "U-16プログラミングコンテスト山口大会2022",
    description: "アイデア賞受賞",
    category: "achievement",
    icon: <Trophy size={16} />,
  },
  {
    year: "2023",
    month: "10",
    title: "U-16プログラミングコンテスト山口大会2023",
    description: "技術賞 企業(プライムゲート)賞受賞",
    category: "achievement",
    icon: <Trophy size={16} />,
  },
  {
    year: "2024",
    month: "3",
    title: "中国地区高専コンピュータフェスティバル2024",
    description: "ゲーム部門1位受賞",
    category: "achievement",
    icon: <Trophy size={16} />,
  },
  {
    year: "~2023",
    month: "",
    title: "市区学校美術展覧会",
    description: "受賞多数",
    category: "achievement",
    icon: <Star size={16} />,
  },
];

const skillItems: SkillItem[] = [
  // Design
  { name: "Photoshop", level: 5, category: "design", description: "画像編集・デザイン制作" },
  { name: "Illustrator", level: 4, category: "design", description: "ベクター作成・ロゴデザイン" },
  { name: "Adobe XD", level: 3, category: "design", description: "UI/UXデザイン" },
  { name: "Figma", level: 4, category: "design", description: "コラボレーションデザイン" },
  
  // Programming
  { name: "JavaScript", level: 4, category: "programming", description: "フロントエンド開発" },
  { name: "TypeScript", level: 4, category: "programming", description: "型安全な開発" },
  { name: "React", level: 4, category: "programming", description: "モダンUI開発" },
  { name: "Next.js", level: 4, category: "programming", description: "フルスタック開発" },
  { name: "C/C++", level: 3, category: "programming", description: "システムプログラミング" },
  { name: "C#", level: 3, category: "programming", description: "アプリケーション開発" },
  { name: "HTML/CSS", level: 5, category: "programming", description: "Web標準技術" },
  { name: "Tailwind CSS", level: 4, category: "programming", description: "効率的なスタイリング" },
  { name: "p5.js", level: 3, category: "programming", description: "クリエイティブコーディング" },
  { name: "PIXI.js", level: 3, category: "programming", description: "2Dグラフィックス" },
  { name: "GSAP", level: 3, category: "programming", description: "アニメーションライブラリ" },
  
  // Video
  { name: "After Effects", level: 4, category: "video", description: "モーショングラフィックス" },
  { name: "Premiere Pro", level: 3, category: "video", description: "動画編集" },
  { name: "Blender", level: 3, category: "video", description: "3D制作" },
  { name: "AviUtl", level: 4, category: "video", description: "映像編集" },
  
  // Other
  { name: "Unity", level: 3, category: "other", description: "ゲーム開発" },
  { name: "Cubase", level: 2, category: "other", description: "音楽制作" },
];

const contactItems: ContactItem[] = [
  {
    name: "メール",
    value: "361do.sleep@gmail.com",
    url: "mailto:361do.sleep@gmail.com",
    icon: <Mail size={16} />,
  },
  {
    name: "X (開発関連)",
    value: "@361do_sleep",
    url: "https://twitter.com/361do_sleep",
    icon: <ExternalLink size={16} />,
  },
  {
    name: "X (映像・デザイン関連)",
    value: "@361do_design",
    url: "https://twitter.com/361do_design",
    icon: <ExternalLink size={16} />,
  },
];

export default function RealProfilePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido",
    "jobTitle": "Webデザイナー・開発者",
    "description": "グラフィックデザイン、映像制作、個人開発など幅広く活動",
    "url": "https://yusuke-kim.com/about/profile/real",
    "sameAs": [
      "https://twitter.com/361do_sleep",
      "https://twitter.com/361do_design"
    ],
    "knowsAbout": [
      "Web Design",
      "Frontend Development",
      "Video Production",
      "Graphic Design"
    ],
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "高専"
    },
    "award": [
      "U-16プログラミングコンテスト山口大会2022 アイデア賞",
      "U-16プログラミングコンテスト山口大会2023 技術賞",
      "中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位"
    ]
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level'>('level');

  const filteredSkills = skillItems.filter(skill => 
    selectedCategory === 'all' || skill.category === selectedCategory
  ).sort((a, b) => {
    if (sortBy === 'level') return b.level - a.level;
    return a.name.localeCompare(b.name);
  });

  const categoryColors: Record<string, string> = {
    education: "border-blue-500",
    achievement: "border-yellow-500",
    activity: "border-green-500"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/about" 
              className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80 flex items-center gap-2"
            >
              <ArrowLeft size={24} />
              About
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 border-2 border-primary rounded-full">
                <User size={48} className="text-primary" />
              </div>
            </div>
            <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-4">
              木村友亮
            </h1>
            <h2 className="zen-kaku-gothic-new text-2xl md:text-3xl text-foreground mb-6">
              Webデザイナー・開発者
            </h2>
            <p className="noto-sans-jp text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto">
              グラフィックデザイン、映像制作、個人開発など幅広く活動しています。<br />
              やる気になれば何でもできるのが強みです。
            </p>
          </div>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {/* Basic Information */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              基本情報
            </h2>
            
            <div className="max-w-3xl mx-auto bg-gray/50 border border-foreground/20 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2">
                    名前
                  </h3>
                  <p className="noto-sans-jp text-foreground/80">
                    木村友亮（きむらゆうすけ）
                  </p>
                </div>
                
                <div>
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2">
                    生年月日
                  </h3>
                  <p className="noto-sans-jp text-foreground/80">
                    平成19年10月生
                  </p>
                </div>
                
                <div>
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2">
                    現在の状況
                  </h3>
                  <p className="noto-sans-jp text-foreground/80">
                    現役高専生（2025年7月現在）
                  </p>
                </div>
                
                <div>
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2">
                    専攻
                  </h3>
                  <p className="noto-sans-jp text-foreground/80">
                    制御情報工学科
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="neue-haas-grotesk-display text-lg text-primary mb-2">
                    自己紹介
                  </h3>
                  <p className="noto-sans-jp text-foreground/80 leading-relaxed">
                    グラフィックデザイン、映像制作、個人開発など幅広く活動しています。やる気になれば何でもできるのが強みです。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              経歴・受賞歴
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/30"></div>
                
                <div className="space-y-6">
                  {timelineItems.map((item, index) => (
                    <div key={index} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 w-8 h-8 rounded-full border-2 ${categoryColors[item.category]} bg-gray flex items-center justify-center`}>
                        {item.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="ml-16 pb-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="neue-haas-grotesk-display text-primary text-lg">
                            {item.year}
                          </span>
                          {item.month && (
                            <span className="noto-sans-jp text-foreground/60 text-sm">
                              {item.month}月
                            </span>
                          )}
                        </div>
                        
                        <h3 className="zen-kaku-gothic-new text-xl text-foreground mb-2">
                          {item.title}
                        </h3>
                        
                        <p className="noto-sans-jp text-foreground/80 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              スキル
            </h2>
            
            {/* Skill Filters */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2 bg-gray/50 border border-foreground/20 p-4 rounded">
                {['all', 'design', 'programming', 'video', 'other'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {category === 'all' ? 'すべて' : 
                     category === 'design' ? 'デザイン' :
                     category === 'programming' ? 'プログラミング' :
                     category === 'video' ? '映像' : 'その他'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill) => (
                <div key={skill.name} className="p-6 border border-foreground/20 bg-gray/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="neue-haas-grotesk-display text-lg text-primary">
                      {skill.name}
                    </h3>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Star
                          key={level}
                          size={16}
                          className={`${
                            level <= skill.level ? 'text-yellow-500 fill-current' : 'text-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="noto-sans-jp text-sm text-foreground/70 leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              連絡先
            </h2>
            
            <div className="max-w-2xl mx-auto space-y-4">
              {contactItems.map((contact) => (
                <Link
                  key={contact.name}
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-6 border border-foreground/20 bg-gray/50 hover:bg-gray transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-primary group-hover:scale-110 transition-transform">
                      {contact.icon}
                    </div>
                    
                    <div>
                      <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-1">
                        {contact.name}
                      </h3>
                      <p className="noto-sans-jp text-primary">
                        {contact.value}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 木村友亮 (samuido). All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}