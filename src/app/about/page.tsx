import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - samuido | 木村友亮について",
  description:
    "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。",
  keywords: [
    "木村友亮",
    "プロフィール",
    "経歴",
    "スキル",
    "Webデザイナー",
    "フロントエンド開発者",
  ],
  robots: "index, follow",
  openGraph: {
    title: "About - samuido | 木村友亮について",
    description:
      "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。",
    type: "profile",
    url: "https://yusuke-kim.com/about",
    images: [
      {
        url: "https://yusuke-kim.com/about-og-image.png",
        width: 1200,
        height: 630,
        alt: "About - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "About - samuido | 木村友亮について",
    description:
      "Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。",
    images: ["https://yusuke-kim.com/about-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
  alternates: {
    canonical: "https://yusuke-kim.com/about",
  },
};

// 構造化データ
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "木村友亮",
  alternateName: "samuido",
  jobTitle: "Webデザイナー・開発者",
  description: "グラフィックデザイン、映像制作、個人開発など幅広く活動",
  url: "https://yusuke-kim.com/about",
  sameAs: [
    "https://twitter.com/361do_sleep",
    "https://twitter.com/361do_design",
  ],
  knowsAbout: [
    "Web Design",
    "Frontend Development",
    "Video Production",
    "Graphic Design",
  ],
};

const skills = {
  design: ["Photoshop", "Illustrator", "AdobeXD", "Figma"],
  programming: ["C", "C++", "C#", "HTML", "JavaScript", "TypeScript", "CSS"],
  techStack: ["React", "NextJS", "Tailwind CSS", "p5js", "PIXIjs", "GSAP"],
  video: ["AfterEffects", "Aviutl", "PremierePro", "Blender"],
  other: ["Unity", "Cubase"],
};

const achievements = [
  {
    year: "2024/3",
    title: "中国地区高専コンピュータフェスティバル2024",
    award: "ゲーム部門 1位",
    description: "Unity を使用したゲーム開発で最優秀賞を受賞",
    category: "programming",
  },
  {
    year: "2023/10",
    title: "U-16プログラミングコンテスト山口大会2023",
    award: "技術賞 企業(プライムゲート)賞",
    description: "技術的な実装力と企業からの評価を獲得",
    category: "programming",
  },
  {
    year: "2022/10",
    title: "U-16プログラミングコンテスト山口大会2022",
    award: "アイデア賞",
    description: "創造的なアイデアと企画力が評価される",
    category: "programming",
  },
  {
    year: "2023",
    title: "市区学校美術展覧会",
    award: "入選・特選 複数回受賞",
    description: "絵画・デザイン作品で継続的に入賞",
    category: "art",
  },
  {
    year: "2022",
    title: "地域デザインコンペティション",
    award: "優秀賞",
    description: "地域活性化をテーマとしたデザイン提案",
    category: "design",
  },
  {
    year: "2021",
    title: "学校文化祭ポスターコンテスト",
    award: "最優秀賞",
    description: "学校行事のビジュアルデザインを担当",
    category: "design",
  },
];

export default function AboutPage() {
  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        <main
          id="main-content"
          role="main"
          className="flex items-center py-10"
          tabIndex={-1}
        >
          <div className="container-system">
            <div className="space-y-10">
              {/* Breadcrumbs */}
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "About", isCurrent: true },
                ]}
                className="pt-4"
              />

              {/* ヘッダー */}
              <header className="space-y-12">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  About samuido
                </h1>

                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  グラフィックデザイン、映像制作、個人開発など幅広く活動.
                  <br />
                  やる気になれば何でもできるのが強み.
                  <br />
                  平成19年10月生、現役高専生（2025年7月現在）
                </p>
              </header>

              {/* プロフィール選択 */}
              <nav aria-label="Profile navigation">
                <h3 className="sr-only">プロフィール選択</h3>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-8">
                  <Link
                    href="/about/profile/real"
                    className={CardStyle}
                    aria-describedby="real-profile-description"
                  >
                    <h3 className={Card_title}>Real Profile</h3>
                    <p
                      id="real-profile-description"
                      className={Card_description}
                    >
                      本名プロフィール・採用担当者向け
                    </p>
                  </Link>

                  <Link
                    href="/about/profile/handle"
                    className={CardStyle}
                    aria-describedby="handle-profile-description"
                  >
                    <h3 className={Card_title}>Handle Profile</h3>
                    <p
                      id="handle-profile-description"
                      className={Card_description}
                    >
                      ハンドルネーム・同業者向け
                    </p>
                  </Link>
                </div>
              </nav>

              {/* スキル */}
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

              {/* 受賞歴 */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Awards & Achievements
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
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        {achievement.title}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-accent">
                        {achievement.award}
                      </p>
                      {achievement.description && (
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          {achievement.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* ナビゲーション */}
              <nav aria-label="About navigation">
                <h3 className="sr-only">About機能</h3>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-6">
                  <Link
                    href="/about/card/real"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Digital Card</span>
                  </Link>

                  <Link
                    href="/about/links"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Links</span>
                  </Link>

                  <Link
                    href="/about/commission/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Commission</span>
                  </Link>
                </div>
              </nav>

              {/* フッター */}
              <footer className="pt-4 border-t border-foreground">
                <div className="text-center">
                  <p className="shippori-antique-b1-regular text-sm inline-block">
                    © 2025 samuido - About Profile
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
