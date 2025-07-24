import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "本名プロフィール - 木村友亮 | samuido",
  description:
    "木村友亮の正式なプロフィール。経歴、学歴、受賞歴、スキルを詳しくご紹介。採用担当者や企業向けの詳細情報。",
  keywords: [
    "木村友亮",
    "本名",
    "プロフィール",
    "経歴",
    "学歴",
    "受賞歴",
    "高専生",
    "プログラミング",
  ],
  robots: "index, follow",
  openGraph: {
    title: "本名プロフィール - 木村友亮 | samuido",
    description:
      "木村友亮の正式なプロフィール。経歴、学歴、受賞歴、スキルを詳しくご紹介。",
    type: "profile",
    url: "https://yusuke-kim.com/about/profile/real",
    images: [
      {
        url: "https://yusuke-kim.com/profile-real-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "木村友亮 - 本名プロフィール",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "本名プロフィール - 木村友亮 | samuido",
    description:
      "木村友亮の正式なプロフィール。経歴、学歴、受賞歴、スキルを詳しくご紹介。",
    images: ["https://yusuke-kim.com/profile-real-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
  alternates: {
    canonical: "https://yusuke-kim.com/about/profile/real",
  },
};

const skills = {
  design: ["Photoshop", "Illustrator", "AdobeXD", "Figma"],
  programming: ["C", "C++", "C#", "HTML", "JavaScript", "TypeScript", "CSS"],
  techStack: ["React", "NextJS", "Tailwind CSS", "p5js", "PIXIjs", "GSAP"],
  video: ["AfterEffects", "Aviult", "PremierePro", "Blender"],
  other: ["Unity", "Cubase"],
};

const achievements = [
  {
    year: "2024年3月",
    title: "中国地区高専コンピュータフェスティバル2024",
    award: "ゲーム部門 1位",
    description: "高専生による技術コンテストにて最優秀賞を受賞",
  },
  {
    year: "2023年10月",
    title: "U-16プログラミングコンテスト山口大会2023",
    award: "技術賞・企業(プライムゲート)賞",
    description: "16歳以下のプログラミングコンテストにて技術力を評価され受賞",
  },
  {
    year: "2022年10月",
    title: "U-16プログラミングコンテスト山口大会2022",
    award: "アイデア賞",
    description: "創造性とアイデアの独創性が評価され受賞",
  },
  {
    year: "~2023年",
    title: "市区学校美術展覧会",
    award: "受賞多数",
    description: "中学生時代を通じて美術作品で複数回受賞",
  },
];

const education = [
  {
    period: "2023年4月 - 現在",
    institution: "高等専門学校",
    status: "在学中",
    description: "情報工学系学科にて専門技術を学習中",
  },
  {
    period: "2023年3月",
    institution: "公立中学校",
    status: "卒業",
    description: "美術分野での活動と技術への興味を深める",
  },
];

export default function RealProfilePage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex items-center py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* ナビゲーション */}
            <nav className="mb-8">
              <Link
                href="/about"
                className="noto-sans-jp-light text-sm text-accent border border-accent px-4 py-2 inline-block focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                ← About に戻る
              </Link>
            </nav>

            {/* ヘッダー */}
            <header className="space-y-12">
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                木村友亮
              </h1>

              <div className="space-y-4">
                <p className="zen-kaku-gothic-new text-xl text-primary">
                  Webデザイナー・開発者
                </p>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  グラフィックデザイン、映像制作、個人開発など幅広く活動.
                  <br />
                  やる気になれば何でもできるのが強みで、新しい技術や表現方法に積極的に取り組んでいます.
                  <br />
                  現在は高等専門学校で情報工学を学びながら、実践的なスキルを身につけています.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="noto-sans-jp-light text-foreground">
                    平成19年10月生（17歳）
                  </span>
                  <span className="noto-sans-jp-light text-foreground">
                    現役高専生
                  </span>
                  <span className="noto-sans-jp-light text-foreground">
                    日本
                  </span>
                </div>
              </div>
            </header>

            {/* 学歴・経歴 */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className="bg-base border border-foreground p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1 inline-block w-fit">
                        {edu.period}
                      </span>
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        {edu.institution}
                      </h3>
                      <span
                        className={`noto-sans-jp-light text-xs px-2 py-1 inline-block w-fit ${
                          edu.status === "在学中"
                            ? "text-accent border border-accent"
                            : "text-foreground border border-foreground"
                        }`}
                      >
                        {edu.status}
                      </span>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      {edu.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 受賞歴 */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Awards
              </h2>
              <div className="space-y-6">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-base border border-foreground p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1 inline-block w-fit">
                        {achievement.year}
                      </span>
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        {achievement.title}
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-accent mb-2">
                      {achievement.award}
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* スキル・技術 */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Skills
              </h2>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-4 gap-6">
                <div className="bg-base border border-foreground p-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary mb-4">
                    デザイン
                  </h3>
                  <div className="space-y-2">
                    {skills.design.map((skill) => (
                      <div
                        key={skill}
                        className="noto-sans-jp-light text-sm text-foreground"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-base border border-foreground p-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary mb-4">
                    プログラミング
                  </h3>
                  <div className="space-y-2">
                    {skills.programming.map((skill) => (
                      <div
                        key={skill}
                        className="noto-sans-jp-light text-sm text-foreground"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-base border border-foreground p-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary mb-4">
                    技術スタック
                  </h3>
                  <div className="space-y-2">
                    {skills.techStack.map((skill) => (
                      <div
                        key={skill}
                        className="noto-sans-jp-light text-sm text-foreground"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-base border border-foreground p-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary mb-4">
                    映像制作
                  </h3>
                  <div className="space-y-2">
                    {skills.video.map((skill) => (
                      <div
                        key={skill}
                        className="noto-sans-jp-light text-sm text-foreground"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 連絡先 */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Contact
              </h2>
              <div className="grid-system grid-1 xs:grid-2 gap-4">
                <div className="bg-base border border-foreground p-4">
                  <h3 className="zen-kaku-gothic-new text-base text-primary mb-2">
                    開発・技術関連
                  </h3>
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    rebuild.up.up(at)gmail.com
                  </p>
                </div>
                <div className="bg-base border border-foreground p-4">
                  <h3 className="zen-kaku-gothic-new text-base text-primary mb-2">
                    X (Twitter)
                  </h3>
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    @361do_sleep
                  </p>
                </div>
              </div>
            </section>

            {/* アクション */}
            <nav aria-label="Profile actions">
              <h3 className="sr-only">プロフィール関連アクション</h3>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <Link
                  href="/about/card/real"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Digital Card</span>
                </Link>

                <Link
                  href="/about/commission/develop"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Commission</span>
                </Link>

                <Link
                  href="/portfolio"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Portfolio</span>
                </Link>
              </div>
            </nav>

            {/* フッター */}
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
  );
}
