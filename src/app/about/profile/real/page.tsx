import { Metadata } from "next";
import { ArrowLeft, Mail, ExternalLink, Award, GraduationCap, Calendar, User, MapPin, Phone } from "lucide-react";
import Link from "next/link";

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
        alt: "木村友亮のプロフィール",
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

// Profile data
const profileData = {
  name: "木村友亮",
  birthDate: "平成19年10月生",
  status: "現役高専生(2025年7月現在)",
  description: "グラフィックデザイン、映像制作、個人開発など幅広く活動しています。やる気になれば何でもできるのが強みです",
  skills: {
    design: ["Photoshop", "Illustrator", "AdobeXD", "Figma"],
    programming: ["C", "C++", "C#", "HTML", "JavaScript", "TypeScript", "CSS"],
    techStack: ["React", "NextJS", "Tailwind CSS", "p5js", "PIXIjs", "GSAP"],
    video: ["AfterEffects", "Aviult", "PremierePro", "Blender"],
    other: ["Unity", "Cubase"],
  },
  education: [
    {
      date: "2023/3",
      title: "公立中学を卒業",
      type: "graduation",
    },
    {
      date: "2023/4",
      title: "高専に入学",
      type: "enrollment",
    },
    {
      date: "~2025",
      title: "現在在学中",
      type: "current",
    },
  ],
  awards: [
    {
      date: "~2023",
      title: "市区学校美術展覧会",
      detail: "受賞多数",
    },
    {
      date: "2022/10",
      title: "U-16プログラミングコンテスト山口大会2022",
      detail: "アイデア賞",
    },
    {
      date: "2023/10",
      title: "U-16プログラミングコンテスト山口大会2023",
      detail: "技術賞 企業(プライムゲート)賞",
    },
    {
      date: "2024/3",
      title: "中国地区高専コンピュータフェスティバル2024",
      detail: "ゲーム部門 1位",
    },
  ],
  contact: {
    email: "361do.sleep@gmail.com",
    twitter: {
      development: "@361do_sleep",
      design: "@361do_design",
    },
  },
};

const SkillCategory = ({ title, skills, icon: Icon }: { title: string; skills: string[]; icon: any }) => (
  <div className="bg-[#333] p-4 rounded-sm border-l-2 border-[#0000ff]">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-[#0000ff]" />
      <h3 className="neue-haas-grotesk-display text-lg text-white">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-[#222] text-[#0000ff] text-sm rounded-sm border border-[#444]"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
);

const TimelineItem = ({ date, title, detail, type }: { date: string; title: string; detail?: string; type: string }) => (
  <div className="flex gap-4 items-start">
    <div className="flex-shrink-0 w-16 text-right">
      <span className="text-sm text-[#0000ff] font-medium">{date}</span>
    </div>
    <div className="flex-shrink-0 w-4 h-4 bg-[#0000ff] rounded-full mt-1.5 relative">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-[#444] last:hidden"></div>
    </div>
    <div className="flex-1 pb-8">
      <h4 className="text-white font-medium">{title}</h4>
      {detail && <p className="text-gray-300 text-sm mt-1">{detail}</p>}
    </div>
  </div>
);

export default function RealProfilePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido",
    "jobTitle": "Webデザイナー・開発者",
    "description": "グラフィックデザイン、映像制作、個人開発など幅広く活動",
    "url": "/about/profile/real",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#222] text-white">
        {/* Header */}
        <header className="bg-[#333] border-b border-[#444]">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-4">
              <Link href="/about" className="text-[#0000ff] hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="neue-haas-grotesk-display text-xl text-white">Profile - 木村友亮</h1>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-[#0000ff] rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="neue-haas-grotesk-display text-3xl mb-2">{profileData.name}</h2>
              <p className="text-[#0000ff] text-lg mb-2">{profileData.status}</p>
              <p className="text-gray-300 max-w-2xl mx-auto">{profileData.description}</p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#333] p-4 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#0000ff]" />
                  <span className="font-medium">生年月日</span>
                </div>
                <p className="text-gray-300">{profileData.birthDate}</p>
              </div>
              <div className="bg-[#333] p-4 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-[#0000ff]" />
                  <span className="font-medium">現況</span>
                </div>
                <p className="text-gray-300">{profileData.status}</p>
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section className="mb-12">
            <h3 className="neue-haas-grotesk-display text-2xl mb-6 text-center">スキル</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkillCategory title="デザイン" skills={profileData.skills.design} icon={User} />
              <SkillCategory title="プログラミング" skills={profileData.skills.programming} icon={User} />
              <SkillCategory title="技術スタック" skills={profileData.skills.techStack} icon={User} />
              <SkillCategory title="映像" skills={profileData.skills.video} icon={User} />
              <SkillCategory title="その他" skills={profileData.skills.other} icon={User} />
            </div>
          </section>

          {/* Education Timeline */}
          <section className="mb-12">
            <h3 className="neue-haas-grotesk-display text-2xl mb-6 text-center">学歴</h3>
            <div className="max-w-2xl mx-auto">
              {profileData.education.map((item, index) => (
                <TimelineItem
                  key={index}
                  date={item.date}
                  title={item.title}
                  type={item.type}
                />
              ))}
            </div>
          </section>

          {/* Awards Section */}
          <section className="mb-12">
            <h3 className="neue-haas-grotesk-display text-2xl mb-6 text-center">受賞歴</h3>
            <div className="max-w-2xl mx-auto">
              {profileData.awards.map((award, index) => (
                <TimelineItem
                  key={index}
                  date={award.date}
                  title={award.title}
                  detail={award.detail}
                  type="award"
                />
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-8">
            <h3 className="neue-haas-grotesk-display text-2xl mb-6 text-center">連絡先</h3>
            <div className="max-w-md mx-auto">
              <div className="bg-[#333] p-6 rounded-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#0000ff]" />
                    <a href={`mailto:${profileData.contact.email}`} className="text-[#0000ff] hover:opacity-80 transition-opacity">
                      {profileData.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-[#0000ff]" />
                    <a href={`https://twitter.com/${profileData.contact.twitter.development.replace('@', '')}`} className="text-[#0000ff] hover:opacity-80 transition-opacity">
                      {profileData.contact.twitter.development} (開発関連)
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-[#0000ff]" />
                    <a href={`https://twitter.com/${profileData.contact.twitter.design.replace('@', '')}`} className="text-[#0000ff] hover:opacity-80 transition-opacity">
                      {profileData.contact.twitter.design} (映像・デザイン関連)
                    </a>
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