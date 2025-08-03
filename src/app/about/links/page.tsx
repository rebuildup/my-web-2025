import { ExternalLink, Github, Mail, Twitter, Youtube } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Links - samuido | 外部リンク集",
  description:
    "samuidoの各種SNSアカウント、ポートフォリオサイト、プロフェッショナルリンクをまとめたリンク集。",
  keywords: [
    "リンク集",
    "SNS",
    "ポートフォリオ",
    "Twitter",
    "GitHub",
    "Instagram",
    "YouTube",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/about/links",
  },
  openGraph: {
    title: "Links - samuido | 外部リンク集",
    description:
      "samuidoの各種SNSアカウント、ポートフォリオサイト、プロフェッショナルリンクをまとめたリンク集。",
    type: "website",
    url: "https://yusuke-kim.com/about/links",
    images: [
      {
        url: "https://yusuke-kim.com/about/links-og-image.png",
        width: 1200,
        height: 630,
        alt: "Links - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Links - samuido | 外部リンク集",
    description:
      "samuidoの各種SNSアカウント、ポートフォリオサイト、プロフェッショナルリンクをまとめたリンク集。",
    images: ["https://yusuke-kim.com/about/links-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "木村友亮",
  alternateName: "samuido",
  url: "https://yusuke-kim.com/about/links",
  sameAs: [
    "https://twitter.com/361do_sleep",
    "https://twitter.com/361do_design",
    "https://github.com/361do",
    "https://instagram.com/361do_sleep",
    "https://youtube.com/@361do",
  ],
};

const socialLinks = [
  {
    name: "Twitter (Tech)",
    handle: "@361do_sleep",
    url: "https://twitter.com/361do_sleep",
    description: "技術・開発関連のツイート",
    icon: Twitter,
    category: "social",
  },
  {
    name: "Twitter (Design)",
    handle: "@361do_design",
    url: "https://twitter.com/361do_design",
    description: "映像・デザイン関連のツイート",
    icon: Twitter,
    category: "social",
  },
  {
    name: "GitHub",
    handle: "rebuildup",
    url: "https://github.com/rebuildup",
    description: "開発プロジェクトとソースコード",
    icon: Github,
    category: "professional",
  },
  {
    name: "YouTube",
    handle: "@361do_sleep",
    url: "https://www.youtube.com/@361do_sleep",
    description: "映像作品・チュートリアル",
    icon: Youtube,
    category: "portfolio",
  },
];

export default function LinksPage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  const renderLinkCard = (link: {
    name: string;
    handle: string;
    url: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <a
      key={link.name}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
    >
      <div className="flex items-center">
        <link.icon className="w-6 h-6 text-accent mr-3" />
        <div className="flex-grow">
          <h3 className="zen-kaku-gothic-new text-lg text-primary">
            {link.name}
          </h3>
          <p className="noto-sans-jp-light text-xs text-accent">
            {link.handle}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-foreground" />
      </div>
      <p className="noto-sans-jp-light text-sm text-foreground">
        {link.description}
      </p>
    </a>
  );

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
                  Links
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  各種SNSアカウント、ポートフォリオサイト、プロフェッショナルリンクをまとめました.
                  <br />
                  お気軽にフォローやコンタクトをお待ちしています.
                </p>
              </header>

              {/* Social Media Links */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Social Media
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-6">
                  {socialLinks.map(renderLinkCard)}
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Contact
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        技術・開発関連
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      rebuild.up.up(at)gmail.com
                    </p>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        映像・デザイン関連
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      361do.sleep@gmail.com
                    </p>
                  </div>
                </div>
              </section>

              {/* Link Validation Notice */}
              <section>
                <div className="bg-base border border-accent p-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                    リンクについて
                  </h3>
                  <div className="space-y-2">
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • 外部リンクは新しいタブで開きます
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      •
                      リンク先の内容については各サイトの利用規約をご確認ください
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      •
                      リンク切れやお問い合わせは上記メールアドレスまでご連絡ください
                    </p>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <nav aria-label="About navigation">
                <h3 className="sr-only">About機能</h3>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-6">
                  <Link
                    href="/about/profile/real"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Profile</span>
                  </Link>

                  <Link
                    href="/about/commission/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Commission</span>
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
                    © 2025 samuido - External Links
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
