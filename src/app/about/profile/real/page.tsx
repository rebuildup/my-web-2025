import { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, GraduationCap, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Real Profile - samuido | 木村友亮のプロフィール",
  description:
    "木村友亮（samuido）の本名プロフィール。生年月日、学歴、経歴、技術スキル、受賞歴などの詳細情報。採用担当者向け。",
  keywords: [
    "木村友亮",
    "本名プロフィール",
    "経歴",
    "学歴",
    "技術スキル",
    "採用",
    "高専生",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/about/profile/real",
  },
  openGraph: {
    title: "Real Profile - samuido | 木村友亮のプロフィール",
    description:
      "木村友亮（samuido）の本名プロフィール。生年月日、学歴、経歴、技術スキル、受賞歴などの詳細情報。採用担当者向け。",
    type: "profile",
    url: "https://yusuke-kim.com/about/profile/real",
    images: [
      {
        url: "https://yusuke-kim.com/about/profile-real-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Real Profile - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Profile - samuido | 木村友亮のプロフィール",
    description:
      "木村友亮（samuido）の本名プロフィール。生年月日、学歴、経歴、技術スキル、受賞歴などの詳細情報。採用担当者向け。",
    images: ["https://yusuke-kim.com/about/profile-real-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "木村友亮",
  alternateName: "samuido",
  birthDate: "2007-10",
  jobTitle: "学生・開発者・デザイナー",
  description:
    "高等専門学校在学中の学生。プログラミング、デザイン、映像制作に従事",
  url: "https://yusuke-kim.com/about/profile/real",
  sameAs: ["https://twitter.com/361do_sleep", "https://github.com/361do"],
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "高等専門学校",
  },
  knowsAbout: [
    "Web Development",
    "Game Development",
    "Video Production",
    "Graphic Design",
    "UI/UX Design",
  ],
  award: [
    "中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位",
    "U-16プログラミングコンテスト山口大会2023 技術賞・企業賞",
    "U-16プログラミングコンテスト山口大会2022 アイデア賞",
  ],
};

const personalInfo = {
  name: "木村友亮",
  nameReading: "きむら ゆうすけ",
  handleName: "samuido",
  birthDate: "2007年10月",
  age: "17歳",
  location: "日本",
  status: "高等専門学校在学中",
  graduationYear: "2026年予定",
};

const education = [
  {
    period: "2020年4月 - 2023年3月",
    institution: "中学校",
    description: "基礎学習と美術・技術分野での活動",
  },
  {
    period: "2023年4月 - 現在",
    institution: "高等専門学校",
    description: "情報工学科にて専門技術を学習中",
    status: "在学中",
  },
  {
    period: "2026年3月予定",
    institution: "高等専門学校",
    description: "卒業予定",
    status: "予定",
  },
];

const skills = {
  programming: {
    title: "プログラミング言語",
    items: [
      "C",
      "C++",
      "C#",
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "Python",
    ],
    level: "中級〜上級",
  },
  frameworks: {
    title: "フレームワーク・ライブラリ",
    items: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "p5.js",
      "PIXI.js",
      "GSAP",
      "Unity",
    ],
    level: "中級",
  },
  design: {
    title: "デザインツール",
    items: ["Photoshop", "Illustrator", "Adobe XD", "Figma"],
    level: "中級〜上級",
  },
  video: {
    title: "映像制作",
    items: ["After Effects", "Premiere Pro", "Aviutl", "Blender"],
    level: "中級〜上級",
  },
  other: {
    title: "その他",
    items: ["Git", "GitHub", "Cubase", "音楽制作"],
    level: "中級",
  },
};

const achievements = [
  {
    year: "2024年3月",
    title: "中国地区高専コンピュータフェスティバル2024",
    award: "ゲーム部門 1位",
    description: "Unityを使用したゲーム開発で最優秀賞を受賞",
    category: "プログラミング",
  },
  {
    year: "2023年10月",
    title: "U-16プログラミングコンテスト山口大会2023",
    award: "技術賞・企業(プライムゲート)賞",
    description: "技術的な実装力と企業からの評価を獲得",
    category: "プログラミング",
  },
  {
    year: "2022年10月",
    title: "U-16プログラミングコンテスト山口大会2022",
    award: "アイデア賞",
    description: "創造的なアイデアと企画力が評価される",
    category: "プログラミング",
  },
  {
    year: "2021年〜2023年",
    title: "市区学校美術展覧会",
    award: "入選・特選 複数回受賞",
    description: "絵画・デザイン作品で継続的に入賞",
    category: "美術・デザイン",
  },
];

export default function RealProfilePage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        <main className="flex items-center py-10">
          <div className="container-system">
            <div className="space-y-10">
              {/* Header */}
              <header className="space-y-12">
                <nav className="mb-6">
                  <Link
                    href="/about"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← About に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Real Profile
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  本名プロフィール・採用担当者向けの詳細情報です.
                  <br />
                  学歴、技術スキル、受賞歴などを掲載しています.
                </p>
              </header>

              {/* Personal Information */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  基本情報
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-accent mr-2" />
                        <h3 className="zen-kaku-gothic-new text-base text-primary">
                          生年月日・年齢
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {personalInfo.birthDate}生まれ（{personalInfo.age}）
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-accent mr-2" />
                        <h3 className="zen-kaku-gothic-new text-base text-primary">
                          居住地
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {personalInfo.location}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <GraduationCap className="w-5 h-5 text-accent mr-2" />
                        <h3 className="zen-kaku-gothic-new text-base text-primary">
                          現在の状況
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {personalInfo.status}
                      </p>
                      <p className="noto-sans-jp-light text-xs text-accent">
                        卒業予定: {personalInfo.graduationYear}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-foreground">
                    <h3 className="zen-kaku-gothic-new text-base text-primary mb-2">
                      名前
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      {personalInfo.name}（{personalInfo.nameReading}）
                    </p>
                    <p className="noto-sans-jp-light text-xs text-accent">
                      ハンドルネーム: {personalInfo.handleName}
                    </p>
                  </div>
                </div>
              </section>

              {/* Education */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  学歴
                </h2>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1 inline-block w-fit">
                          {edu.period}
                        </span>
                        {edu.status && (
                          <span className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1 inline-block w-fit">
                            {edu.status}
                          </span>
                        )}
                      </div>
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        {edu.institution}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {edu.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Technical Skills */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  技術スキル
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-6">
                  {Object.entries(skills).map(([key, skill]) => (
                    <div
                      key={key}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div>
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          {skill.title}
                        </h3>
                        <p className="noto-sans-jp-light text-xs text-accent">
                          レベル: {skill.level}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {skill.items.map((item) => (
                          <div
                            key={item}
                            className="noto-sans-jp-light text-sm text-foreground"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Achievements */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  受賞歴・実績
                </h2>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1 inline-block w-fit">
                          {achievement.year}
                        </span>
                        <span className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1 inline-block w-fit">
                          {achievement.category}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <Award className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                        <div className="flex-grow">
                          <h3 className="zen-kaku-gothic-new text-base text-primary">
                            {achievement.title}
                          </h3>
                          <p className="noto-sans-jp-light text-sm text-accent mb-2">
                            {achievement.award}
                          </p>
                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Career Goals */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  将来の目標・志向
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="space-y-3">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      技術分野での成長
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      Web開発、ゲーム開発、映像制作の技術を深め、
                      クリエイティブと技術を融合した作品作りを目指しています。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      学習への取り組み
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      新しい技術への好奇心が強く、継続的な学習と実践を通じて
                      スキルアップを図っています。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      コラボレーション
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      チームでの開発やクリエイティブプロジェクトに積極的に参加し、
                      多様な視点から学ぶことを重視しています。
                    </p>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <nav aria-label="Profile navigation">
                <h3 className="sr-only">Profile機能</h3>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-6">
                  <Link
                    href="/about/profile/handle"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Handle Profile</span>
                  </Link>

                  <Link
                    href="/about/card/real"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Digital Card</span>
                  </Link>

                  <Link
                    href="/contact"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Contact</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <footer className="pt-4 border-t border-foreground">
                <div className="text-center">
                  <p className="shippori-antique-b1-regular text-sm inline-block">
                    © 2025 samuido - Real Profile
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
