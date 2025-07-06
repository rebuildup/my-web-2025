"use client";

import Link from "next/link";
import type { Metadata } from "next";
import { useState } from "react";
import { ArrowLeft, Badge, Code, Palette, Video, Gamepad2, Star, ExternalLink, Mail, Github } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile - samuido | samuidoのプロフィール",
  description: "フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。",
  keywords: ["samuido", "プロフィール", "フロントエンド", "技術スタック", "個人開発", "制作活動"],
  robots: "index, follow",
  openGraph: {
    title: "Profile - samuido | samuidoのプロフィール",
    description: "フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。",
    type: "profile",
    url: "/about/profile/handle",
    images: [
      {
        url: "/about/profile-handle-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Profile Handle samuido",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profile - samuido | samuidoのプロフィール",
    description: "フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。",
    images: ["/about/profile-handle-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

interface TechStack {
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'design' | 'video' | 'other';
  description: string;
  icon: React.ReactNode;
}

interface Activity {
  title: string;
  period: string;
  description: string;
  technologies: string[];
  category: 'development' | 'video' | 'web' | 'article';
  link?: string;
}

interface ContactItem {
  name: string;
  value: string;
  url: string;
  icon: React.ReactNode;
}

const techStacks: TechStack[] = [
  // Frontend
  { name: "React", level: 5, category: "frontend", description: "モダンUI開発のメイン技術", icon: <Code size={20} /> },
  { name: "Next.js", level: 5, category: "frontend", description: "フルスタック開発フレームワーク", icon: <Code size={20} /> },
  { name: "TypeScript", level: 4, category: "frontend", description: "型安全な開発", icon: <Code size={20} /> },
  { name: "JavaScript", level: 5, category: "frontend", description: "フロントエンドの基盤", icon: <Code size={20} /> },
  { name: "Tailwind CSS", level: 5, category: "frontend", description: "効率的なスタイリング", icon: <Code size={20} /> },
  { name: "p5.js", level: 4, category: "frontend", description: "クリエイティブコーディング", icon: <Code size={20} /> },
  { name: "PIXI.js", level: 4, category: "frontend", description: "2Dグラフィックス", icon: <Code size={20} /> },
  { name: "GSAP", level: 4, category: "frontend", description: "アニメーションライブラリ", icon: <Code size={20} /> },

  // Backend
  { name: "C++", level: 4, category: "backend", description: "After Effectsプラグイン開発", icon: <Code size={20} /> },
  { name: "C#", level: 3, category: "backend", description: "アプリケーション開発", icon: <Code size={20} /> },
  { name: "C", level: 3, category: "backend", description: "システムプログラミング", icon: <Code size={20} /> },

  // Design
  { name: "Photoshop", level: 5, category: "design", description: "画像編集・デザイン制作", icon: <Palette size={20} /> },
  { name: "Illustrator", level: 4, category: "design", description: "ベクター作成・ロゴデザイン", icon: <Palette size={20} /> },
  { name: "Figma", level: 4, category: "design", description: "UI/UXデザイン", icon: <Palette size={20} /> },
  { name: "Adobe XD", level: 3, category: "design", description: "プロトタイプ作成", icon: <Palette size={20} /> },

  // Video
  { name: "After Effects", level: 5, category: "video", description: "モーショングラフィックス", icon: <Video size={20} /> },
  { name: "AviUtl", level: 5, category: "video", description: "映像編集", icon: <Video size={20} /> },
  { name: "Premiere Pro", level: 3, category: "video", description: "動画編集", icon: <Video size={20} /> },
  { name: "Blender", level: 3, category: "video", description: "3D制作", icon: <Video size={20} /> },

  // Other
  { name: "Unity", level: 4, category: "other", description: "ゲーム開発", icon: <Gamepad2 size={20} /> },
  { name: "Cubase", level: 2, category: "other", description: "音楽制作", icon: <Code size={20} /> },
];

const activities: Activity[] = [
  {
    title: "After Effects プラグイン開発",
    period: "2023年 - 現在",
    description: "Ae_MultiSlicer、Ae_Stretchなど複数のプラグインを開発・公開。GitHubでオープンソース化。",
    technologies: ["C++", "After Effects SDK", "Adobe CEP"],
    category: "development",
    link: "https://github.com/rebuildup"
  },
  {
    title: "ボカロ・歌ってみたMV制作",
    period: "2022年 - 現在",
    description: "リリックモーション、アニメーションMVの制作依頼を受注。AviUtlからAfter Effectsへ移行。",
    technologies: ["After Effects", "AviUtl", "Photoshop"],
    category: "video"
  },
  {
    title: "Unityゲーム開発",
    period: "2023年",
    description: "高専1年時に音楽ゲームを制作。中国地区高専コンピュータフェスティバル2024 ゲーム部門1位受賞。",
    technologies: ["Unity", "C#", "UI/UX Design"],
    category: "development"
  },
  {
    title: "Webサイト制作",
    period: "2024年 - 現在",
    description: "ポートフォリオサイト、ツールサイトの制作。モダンな技術スタックを活用。",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    category: "web",
    link: "https://yusuke-kim.com"
  },
  {
    title: "技術記事・チュートリアル",
    period: "2024年 - 現在",
    description: "After Effectsプラグイン開発、フロントエンド技術に関する記事を執筆。",
    technologies: ["Markdown", "技術文書", "チュートリアル"],
    category: "article"
  },
];

const contactItems: ContactItem[] = [
  {
    name: "メール",
    value: "361do.sleep@gmail.com",
    url: "mailto:361do.sleep@gmail.com",
    icon: <Mail size={16} />,
  },
  {
    name: "GitHub",
    value: "rebuildup",
    url: "https://github.com/rebuildup",
    icon: <Github size={16} />,
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

export default function HandleProfilePage() {
  const [selectedTechCategory, setSelectedTechCategory] = useState<string>('all');
  const [selectedActivityCategory, setSelectedActivityCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level'>('level');

  const filteredTechStacks = techStacks.filter(tech => 
    selectedTechCategory === 'all' || tech.category === selectedTechCategory
  ).sort((a, b) => {
    if (sortBy === 'level') return b.level - a.level;
    return a.name.localeCompare(b.name);
  });

  const filteredActivities = activities.filter(activity => 
    selectedActivityCategory === 'all' || activity.category === selectedActivityCategory
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "samuido",
    "alternateName": "木村友亮",
    "jobTitle": "フロントエンドエンジニア",
    "description": "グラフィックデザイン、映像制作、個人開発など幅広く活動",
    "url": "https://yusuke-kim.com/about/profile/handle",
    "sameAs": [
      "https://twitter.com/361do_sleep",
      "https://twitter.com/361do_design"
    ],
    "knowsAbout": [
      "Frontend Development",
      "Web Design",
      "Video Production",
      "Game Development"
    ],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "フロントエンドエンジニア",
      "description": "Web開発、デザイン、映像制作"
    }
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
                <Badge size={48} className="text-primary" />
              </div>
            </div>
            <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-4">
              samuido
            </h1>
            <h2 className="zen-kaku-gothic-new text-2xl md:text-3xl text-foreground mb-6">
              フロントエンドエンジニア
            </h2>
            <p className="noto-sans-jp text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto">
              グラフィックデザイン、映像制作、個人開発など幅広く活動。<br />
              技術を使って創造的な表現を追求しています。
            </p>
          </div>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {/* Tech Stack */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              技術スタック
            </h2>
            
            {/* Tech Category Filters */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2 bg-gray/50 border border-foreground/20 p-4 rounded">
                {['all', 'frontend', 'backend', 'design', 'video', 'other'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedTechCategory(category)}
                    className={`px-4 py-2 text-sm transition-colors ${
                      selectedTechCategory === category
                        ? 'bg-primary text-white'
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {category === 'all' ? 'すべて' : 
                     category === 'frontend' ? 'フロントエンド' :
                     category === 'backend' ? 'バックエンド' :
                     category === 'design' ? 'デザイン' :
                     category === 'video' ? '映像' : 'その他'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tech Stack Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechStacks.map((tech) => (
                <div key={tech.name} className="p-6 border border-foreground/20 bg-gray/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-primary">
                      {tech.icon}
                    </div>
                    <h3 className="neue-haas-grotesk-display text-lg text-primary">
                      {tech.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Star
                        key={level}
                        size={16}
                        className={`${
                          level <= tech.level ? 'text-yellow-500 fill-current' : 'text-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className="noto-sans-jp text-sm text-foreground/70 leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Activities */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              活動履歴
            </h2>
            
            {/* Activity Category Filters */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2 bg-gray/50 border border-foreground/20 p-4 rounded">
                {['all', 'development', 'video', 'web', 'article'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedActivityCategory(category)}
                    className={`px-4 py-2 text-sm transition-colors ${
                      selectedActivityCategory === category
                        ? 'bg-primary text-white'
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {category === 'all' ? 'すべて' : 
                     category === 'development' ? '個人開発' :
                     category === 'video' ? '映像制作' :
                     category === 'web' ? 'Web開発' : '技術記事'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredActivities.map((activity, index) => (
                <div key={index} className="p-6 border border-foreground/20 bg-gray/50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="neue-haas-grotesk-display text-xl text-primary">
                      {activity.title}
                    </h3>
                    {activity.link && (
                      <Link
                        href={activity.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink size={20} />
                      </Link>
                    )}
                  </div>
                  
                  <p className="noto-sans-jp text-sm text-foreground/60 mb-3">
                    {activity.period}
                  </p>
                  
                  <p className="noto-sans-jp text-foreground/80 leading-relaxed mb-4">
                    {activity.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {activity.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-primary/20 text-primary text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
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
            © 2025 samuido. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}