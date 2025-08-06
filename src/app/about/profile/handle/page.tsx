import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Code, Coffee, Gamepad2, Music, Palette, Video } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Handle Profile - samuido | ハンドルネームプロフィール",
  description:
    "samuido（木村友亮）のハンドルネームプロフィール。クリエイティブ活動、技術的な取り組み、作品制作への想いなど。同業者向け。",
  keywords: [
    "samuido",
    "ハンドルネーム",
    "クリエイター",
    "開発者",
    "デザイナー",
    "映像制作",
    "同業者",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/about/profile/handle",
  },
  openGraph: {
    title: "Handle Profile - samuido | ハンドルネームプロフィール",
    description:
      "samuido（木村友亮）のハンドルネームプロフィール。クリエイティブ活動、技術的な取り組み、作品制作への想いなど。同業者向け。",
    type: "profile",
    url: "https://yusuke-kim.com/about/profile/handle",
    images: [
      {
        url: "https://yusuke-kim.com/about/profile-handle-og-image.png",
        width: 1200,
        height: 630,
        alt: "Handle Profile - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handle Profile - samuido | ハンドルネームプロフィール",
    description:
      "samuido（木村友亮）のハンドルネームプロフィール。クリエイティブ活動、技術的な取り組み、作品制作への想いなど。同業者向け。",
    images: ["https://yusuke-kim.com/about/profile-handle-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "samuido",
  alternateName: "木村友亮",
  description: "クリエイティブコーダー・デザイナー・映像制作者",
  url: "https://yusuke-kim.com/about/profile/handle",
  sameAs: [
    "https://twitter.com/361do_sleep",
    "https://twitter.com/361do_design",
    "https://github.com/361do",
  ],
  knowsAbout: [
    "Creative Coding",
    "Interactive Design",
    "Motion Graphics",
    "Game Development",
    "Web Development",
  ],
};

const creativeAreas = [
  {
    title: "Creative Coding",
    icon: Code,
    description: "p5.js、PIXI.js、Three.jsを使ったインタラクティブ作品制作",
    projects: [
      "ジェネラティブアート",
      "データビジュアライゼーション",
      "インタラクティブ体験",
    ],
    color: "accent",
  },
  {
    title: "Motion Graphics",
    icon: Video,
    description: "After Effectsを中心とした映像表現とアニメーション制作",
    projects: ["MV制作", "リリックモーション", "プロモーション映像"],
    color: "primary",
  },
  {
    title: "Game Development",
    icon: Gamepad2,
    description: "Unityとweb技術を使ったゲーム開発とインタラクティブコンテンツ",
    projects: ["ブラウザゲーム", "教育ゲーム", "実験的インタラクション"],
    color: "accent",
  },
  {
    title: "UI/UX Design",
    icon: Palette,
    description: "ユーザー体験を重視したインターフェースデザインと実装",
    projects: ["Webサイト", "アプリUI", "デザインシステム"],
    color: "primary",
  },
  {
    title: "Sound Design",
    icon: Music,
    description: "Cubaseを使った音楽制作とサウンドデザイン",
    projects: ["BGM制作", "効果音", "アンビエント"],
    color: "accent",
  },
  {
    title: "Tool Development",
    icon: Coffee,
    description: "開発効率化とクリエイティブワークフローの改善ツール制作",
    projects: ["プラグイン開発", "自動化ツール", "ユーティリティ"],
    color: "primary",
  },
];

const philosophy = {
  creativity: {
    title: "創造性への取り組み",
    content:
      "技術とアートの境界を曖昧にし、新しい表現方法を模索することを大切にしています。コードを書くことも、デザインすることも、すべて創造的な行為として捉えています。",
  },
  learning: {
    title: "継続的な学習",
    content:
      "技術の進歩は早く、常に新しいツールや手法が生まれています。好奇心を持って新しいことに挑戦し、失敗を恐れずに実験することを心がけています。",
  },
  sharing: {
    title: "知識の共有",
    content:
      "学んだことや作ったものは積極的に共有し、コミュニティに貢献したいと考えています。オープンソースプロジェクトへの参加や、ツールの公開を通じて還元していきます。",
  },
  collaboration: {
    title: "コラボレーション",
    content:
      "一人では作れないものを、異なるスキルを持つ人たちと協力して作り上げることに魅力を感じています。多様な視点が新しいアイデアを生み出すと信じています。",
  },
};

const currentFocus = [
  {
    area: "WebGL & Three.js",
    description: "ブラウザ上での3D表現とインタラクティブ体験の探求",
    status: "学習中",
  },
  {
    area: "Generative AI",
    description: "AIを活用したクリエイティブワークフローの研究",
    status: "実験中",
  },
  {
    area: "Real-time Graphics",
    description: "リアルタイム映像処理とライブパフォーマンス",
    status: "研究中",
  },
  {
    area: "Accessibility",
    description: "誰もが使いやすいデザインとインクルーシブな体験設計",
    status: "重視",
  },
];

export default function HandleProfilePage() {
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
              {/* Breadcrumbs */}
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "About", href: "/about" },
                  { label: "Profile", href: "/about/profile" },
                  { label: "Handle", isCurrent: true },
                ]}
                className="pt-4"
              />

              {/* Header */}
              <header className="space-y-12">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Handle Profile
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  ハンドルネーム「samuido」としてのクリエイティブ活動について.
                  <br />
                  技術とアートの融合を目指す同業者向けのプロフィールです.
                </p>
              </header>

              {/* Introduction */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  About samuido
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                    「samuido」は、技術とクリエイティビティの境界を探求するハンドルネームです。
                    プログラミング、デザイン、映像制作を通じて、新しい表現方法を模索しています。
                  </p>
                  <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                    コードを書くことも、デザインすることも、音楽を作ることも、
                    すべて創造的な行為として捉え、それらを組み合わせた作品作りを心がけています。
                  </p>
                  <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                    現在は高専生として学習を続けながら、個人プロジェクトやコンテストへの参加を通じて
                    スキルアップを図っています。
                  </p>
                </div>
              </section>

              {/* Creative Areas */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Creative Areas
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-6">
                  {creativeAreas.map((area, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div className="flex items-center">
                        <area.icon
                          className={`w-6 h-6 text-${area.color} mr-3`}
                        />
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          {area.title}
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {area.description}
                      </p>
                      <div className="space-y-1">
                        {area.projects.map((project, idx) => (
                          <div
                            key={idx}
                            className="noto-sans-jp-light text-xs text-accent"
                          >
                            • {project}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Philosophy */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Creative Philosophy
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {Object.entries(philosophy).map(([key, item]) => (
                    <div
                      key={key}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        {item.title}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Current Focus */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Current Focus
                </h2>
                <div className="space-y-4">
                  {currentFocus.map((focus, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="zen-kaku-gothic-new text-base text-primary">
                          {focus.area}
                        </h3>
                        <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1 inline-block w-fit">
                          {focus.status}
                        </span>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {focus.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Style */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Work Style
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-6">
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        開発環境
                      </h3>
                      <div className="space-y-2">
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          • エディタ: Visual Studio Code
                        </p>
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          • バージョン管理: Git / GitHub
                        </p>
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          • デザイン: Figma, Adobe Creative Suite
                        </p>
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          • 映像: After Effects, Premiere Pro
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        ワークフロー
                      </h3>
                      <div className="space-y-2">
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          • プロトタイプ重視の開発
                        </p>
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          • 継続的な実験と改善
                        </p>
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          • ドキュメント化と知識共有
                        </p>
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          • オープンソースへの貢献
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-foreground">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                      コラボレーション
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                      異なる専門分野の方との協働を大切にしています。
                      デザイナー、エンジニア、アーティスト、音楽家など、
                      多様なバックグラウンドを持つ方々との共同制作に興味があります。
                    </p>
                  </div>
                </div>
              </section>

              {/* Social Links */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Connect
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-6">
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      技術・開発
                    </h3>
                    <div className="space-y-2">
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        Twitter: @361do_sleep
                      </p>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        GitHub: @361do
                      </p>
                    </div>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      映像・デザイン
                    </h3>
                    <div className="space-y-2">
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        Twitter: @361do_design
                      </p>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        Instagram: @361do_sleep
                      </p>
                    </div>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      作品・ポートフォリオ
                    </h3>
                    <div className="space-y-2">
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        YouTube: @361do
                      </p>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        このサイト: /portfolio
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <nav aria-label="Profile navigation">
                <h3 className="sr-only">Profile機能</h3>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-6">
                  <Link
                    href="/about/profile/real"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Real Profile</span>
                  </Link>

                  <Link
                    href="/portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Portfolio</span>
                  </Link>

                  <Link
                    href="/about/links"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Links</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
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
    </>
  );
}
