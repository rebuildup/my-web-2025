import { Metadata } from "next";
import { ArrowLeft, Mail, ExternalLink, Github, User, Code, Palette, Video, Settings } from "lucide-react";
import Link from "next/link";

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
        alt: "samuidoのプロフィール",
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

// Profile data
const profileData = {
  handle: "samuido",
  birthDate: "2007年10月生",
  status: "現役高専生(2025年7月現在)",
  description: "グラフィックデザイン、映像制作、個人開発など幅広く活動しています。やる気になれば何でもできるのが強みです",
  skills: {
    design: {
      items: ["Photoshop", "Illustrator", "AdobeXD", "Figma"],
      level: 85,
    },
    programming: {
      items: ["JavaScript", "TypeScript", "HTML", "CSS", "C", "C++", "C#"],
      level: 90,
    },
    techStack: {
      items: ["React", "NextJS", "Tailwind CSS", "p5js", "PIXIjs", "GSAP"],
      level: 88,
    },
    video: {
      items: ["AfterEffects", "Aviult", "PremierePro", "Blender"],
      level: 75,
    },
    other: {
      items: ["Unity", "Cubase"],
      level: 70,
    },
  },
  activities: [
    {
      category: "個人開発",
      items: ["プラグイン開発", "ツール作成", "ゲーム制作"],
    },
    {
      category: "映像制作",
      items: ["MV制作", "リリックモーション", "アニメーション"],
    },
    {
      category: "Web開発",
      items: ["ポートフォリオサイト", "ツールサイト", "API開発"],
    },
    {
      category: "技術共有",
      items: ["ブログ記事", "チュートリアル", "オープンソース"],
    },
  ],
  contact: {
    email: "361do.sleep@gmail.com",
    twitter: {
      development: "@361do_sleep",
      design: "@361do_design",
    },
    github: "samuido",
  },
};

const getSkillIcon = (category: string) => {
  switch (category) {
    case 'design': return Palette;
    case 'programming': return Code;
    case 'techStack': return Code;
    case 'video': return Video;
    default: return Settings;
  }
};

const SkillCategory = ({ title, skills, level, category }: { 
  title: string; 
  skills: string[]; 
  level: number;
  category: string;
}) => {
  const Icon = getSkillIcon(category);
  
  return (
    <div className="bg-[#333] p-6 rounded-sm border-l-4 border-[#0000ff]">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-[#0000ff]" />
        <h3 className="neue-haas-grotesk-display text-xl text-white">{title}</h3>
      </div>
      
      {/* Skill Level Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">習熟度</span>
          <span className="text-sm text-[#0000ff] font-medium">{level}%</span>
        </div>
        <div className="w-full bg-[#222] rounded-full h-2">
          <div 
            className="bg-[#0000ff] h-2 rounded-full transition-all duration-300" 
            style={{ width: `${level}%` }}
          />
        </div>
      </div>
      
      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-[#222] text-[#0000ff] text-sm rounded-sm border border-[#444] hover:border-[#0000ff] transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const ActivityCategory = ({ category, items }: { category: string; items: string[] }) => (
  <div className="bg-[#333] p-4 rounded-sm">
    <h4 className="neue-haas-grotesk-display text-lg text-[#0000ff] mb-3">{category}</h4>
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
          <div className="w-1 h-1 bg-[#0000ff] rounded-full" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default function HandleProfilePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "samuido",
    "alternateName": "木村友亮",
    "jobTitle": "フロントエンドエンジニア",
    "description": "グラフィックデザイン、映像制作、個人開発など幅広く活動",
    "url": "/about/profile/handle",
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
      <div className="min-h-screen bg-[#222] text-white">
        {/* Header */}
        <header className="bg-[#333] border-b border-[#444]">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-4">
              <Link href="/about" className="text-[#0000ff] hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="neue-haas-grotesk-display text-xl text-white">Profile - samuido</h1>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-[#0000ff] to-[#0066ff] rounded-full mx-auto mb-6 flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
              <h2 className="neue-haas-grotesk-display text-4xl mb-3">{profileData.handle}</h2>
              <p className="text-[#0000ff] text-xl mb-3">フロントエンドエンジニア</p>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">{profileData.description}</p>
            </div>
          </section>

          {/* Skills Section */}
          <section className="mb-16">
            <h3 className="neue-haas-grotesk-display text-3xl mb-8 text-center">技術スタック</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SkillCategory 
                title="デザイン" 
                skills={profileData.skills.design.items} 
                level={profileData.skills.design.level}
                category="design"
              />
              <SkillCategory 
                title="プログラミング" 
                skills={profileData.skills.programming.items} 
                level={profileData.skills.programming.level}
                category="programming"
              />
              <SkillCategory 
                title="技術スタック" 
                skills={profileData.skills.techStack.items} 
                level={profileData.skills.techStack.level}
                category="techStack"
              />
              <SkillCategory 
                title="映像" 
                skills={profileData.skills.video.items} 
                level={profileData.skills.video.level}
                category="video"
              />
            </div>
            <div className="mt-8 max-w-md mx-auto">
              <SkillCategory 
                title="その他" 
                skills={profileData.skills.other.items} 
                level={profileData.skills.other.level}
                category="other"
              />
            </div>
          </section>

          {/* Activities Section */}
          <section className="mb-16">
            <h3 className="neue-haas-grotesk-display text-3xl mb-8 text-center">活動内容</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profileData.activities.map((activity, index) => (
                <ActivityCategory
                  key={index}
                  category={activity.category}
                  items={activity.items}
                />
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-8">
            <h3 className="neue-haas-grotesk-display text-3xl mb-8 text-center">連絡先</h3>
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#333] p-6 rounded-sm">
                  <h4 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">メール</h4>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#0000ff]" />
                    <a href={`mailto:${profileData.contact.email}`} className="text-white hover:text-[#0000ff] transition-colors">
                      {profileData.contact.email}
                    </a>
                  </div>
                </div>
                
                <div className="bg-[#333] p-6 rounded-sm">
                  <h4 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">SNS</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-[#0000ff]" />
                      <a href={`https://twitter.com/${profileData.contact.twitter.development.replace('@', '')}`} className="text-white hover:text-[#0000ff] transition-colors">
                        {profileData.contact.twitter.development}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-[#0000ff]" />
                      <a href={`https://twitter.com/${profileData.contact.twitter.design.replace('@', '')}`} className="text-white hover:text-[#0000ff] transition-colors">
                        {profileData.contact.twitter.design}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-[#0000ff]" />
                      <a href={`https://github.com/${profileData.contact.github}`} className="text-white hover:text-[#0000ff] transition-colors">
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}