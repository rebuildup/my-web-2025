import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ハンドルネームプロフィール - samuido",
  description:
    "samuidoのカジュアルなプロフィール。クリエイティブな活動や趣味、同業者向けの情報をご紹介。",
  keywords: [
    "samuido",
    "ハンドルネーム",
    "プロフィール",
    "クリエイター",
    "デザイナー",
    "開発者",
  ],
  robots: "index, follow",
  openGraph: {
    title: "ハンドルネームプロフィール - samuido",
    description:
      "samuidoのカジュアルなプロフィール。クリエイティブな活動や趣味をご紹介。",
    type: "profile",
    url: "https://yusuke-kim.com/about/profile/handle",
    images: [
      {
        url: "https://yusuke-kim.com/profile-handle-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "samuido - ハンドルネームプロフィール",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "ハンドルネームプロフィール - samuido",
    description:
      "samuidoのカジュアルなプロフィール。クリエイティブな活動や趣味をご紹介。",
    images: ["https://yusuke-kim.com/profile-handle-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
  alternates: {
    canonical: "https://yusuke-kim.com/about/profile/handle",
  },
};

const creativeSkills = {
  design: {
    title: "デザイン",
    skills: ["UI/UX", "グラフィック", "ロゴ", "イラスト"],
    description: "美しく機能的なデザインを心がけています",
  },
  development: {
    title: "開発",
    skills: ["Web開発", "ゲーム開発", "ツール作成", "API設計"],
    description: "アイデアを形にするのが得意です",
  },
  video: {
    title: "映像制作",
    skills: ["モーション", "編集", "エフェクト", "3D"],
    description: "動きのある表現で魅力を伝えます",
  },
  music: {
    title: "音楽制作",
    skills: ["作曲", "編曲", "ミックス", "効果音"],
    description: "音で空間を演出します",
  },
};

const personality = [
  {
    trait: "好奇心旺盛",
    description: "新しい技術や表現方法にワクワクします",
  },
  {
    trait: "完璧主義",
    description: "細部にこだわって作品を仕上げます",
  },
  {
    trait: "チャレンジ精神",
    description: "難しそうなことほど燃えます",
  },
  {
    trait: "コーヒー好き",
    description: "作業のお供は必ずコーヒー",
  },
];

const currentProjects = [
  {
    title: "個人サイトリニューアル",
    status: "進行中",
    description: "Next.js 15で全面的に作り直し中",
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "便利ツール集",
    status: "継続開発",
    description: "日常で使える小さなツールを作成",
    tech: ["React", "Canvas API", "Web APIs"],
  },
  {
    title: "映像作品制作",
    status: "企画中",
    description: "新しい表現技法を試したい",
    tech: ["After Effects", "Blender", "Premiere Pro"],
  },
];

export default function HandleProfilePage() {
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
                samuido
              </h1>

              <div className="space-y-4">
                <p className="zen-kaku-gothic-new text-xl text-primary">
                  クリエイティブ・デベロッパー
                </p>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  こんにちは！samuidoです 👋
                  <br />
                  デザインから開発、映像制作まで、「面白そう！」と思ったことは何でも手を出してしまう性格です.
                  <br />
                  完璧主義なところがあって、納得いくまで作り込んでしまうことも...
                  <br />
                  最近はNext.jsにハマっていて、このサイトも全部自分で作りました.
                  <br />
                  コーヒーを飲みながらコードを書いている時間が一番幸せです ☕
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                    デザイナー
                  </span>
                  <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                    開発者
                  </span>
                  <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                    映像クリエイター
                  </span>
                  <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                    高専生
                  </span>
                </div>
              </div>
            </header>

            {/* 性格・特徴 */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Personality
              </h2>
              <div className="grid-system grid-1 xs:grid-2 gap-4">
                {personality.map((trait, index) => (
                  <div
                    key={index}
                    className="bg-base border border-foreground p-4"
                  >
                    <h3 className="zen-kaku-gothic-new text-base text-primary mb-2">
                      {trait.trait}
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      {trait.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* クリエイティブスキル */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Creative Skills
              </h2>
              <div className="grid-system grid-1 xs:grid-2 gap-6">
                {Object.entries(creativeSkills).map(([key, skill]) => (
                  <div
                    key={key}
                    className="bg-base border border-foreground p-4"
                  >
                    <h3 className="zen-kaku-gothic-new text-lg text-primary mb-2">
                      {skill.title}
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground mb-3">
                      {skill.description}
                    </p>
                    <div className="space-y-1">
                      {skill.skills.map((s) => (
                        <div
                          key={s}
                          className="noto-sans-jp-light text-xs text-accent"
                        >
                          • {s}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 現在の取り組み */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Current Projects
              </h2>
              <div className="space-y-4">
                {currentProjects.map((project, index) => (
                  <div
                    key={index}
                    className="bg-base border border-foreground p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        {project.title}
                      </h3>
                      <span
                        className={`noto-sans-jp-light text-xs px-2 py-1 inline-block w-fit ${
                          project.status === "進行中"
                            ? "text-accent border border-accent"
                            : "text-foreground border border-foreground"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground mb-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="noto-sans-jp-light text-xs text-accent"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
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
                    X (Twitter)
                  </h3>
                  <div className="space-y-1">
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      @361do_sleep (技術系)
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      @361do_design (デザイン系)
                    </p>
                  </div>
                </div>
                <div className="bg-base border border-foreground p-4">
                  <h3 className="zen-kaku-gothic-new text-base text-primary mb-2">
                    メール
                  </h3>
                  <div className="space-y-1">
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      技術: rebuild.up.up(at)gmail.com
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      デザイン: 361do.sleep(at)gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* アクション */}
            <nav aria-label="Profile actions">
              <h3 className="sr-only">プロフィール関連アクション</h3>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <Link
                  href="/about/card/handle"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Digital Card</span>
                </Link>

                <Link
                  href="/tools"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Tools</span>
                </Link>

                <Link
                  href="/about/links"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Links</span>
                </Link>
              </div>
            </nav>

            {/* フッター */}
            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - Handle Profile
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
