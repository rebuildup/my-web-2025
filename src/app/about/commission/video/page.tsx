import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  CheckCircle,
  Clock,
  Mail,
  Megaphone,
  MessageCircle,
  Music,
  Palette,
  Video,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像",
  description:
    "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。",
  keywords: [
    "映像制作",
    "MV制作",
    "リリックモーション",
    "アニメーション",
    "AfterEffects",
    "Premiere Pro",
    "フリーランス",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/about/commission/video",
  },
  openGraph: {
    title: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像",
    description:
      "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。",
    type: "website",
    url: "https://yusuke-kim.com/about/commission/video",
    images: [
      {
        url: "https://yusuke-kim.com/about/commission-video-og-image.png",
        width: 1200,
        height: 630,
        alt: "映像依頼 - samuido",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "映像依頼 - samuido | MV制作・アニメーション・プロモーション映像",
    description:
      "MV制作、リリックモーション、イラストアニメーション、プロモーション映像の制作依頼を受け付けています。AfterEffects、Premiere Proを使用した高品質な映像制作。",
    images: ["https://yusuke-kim.com/about/commission-video-twitter-image.jpg"],
    creator: "@361do_design",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "samuido 映像制作サービス",
  description: "MV制作、アニメーション、プロモーション映像制作サービス",
  url: "https://yusuke-kim.com/about/commission/video",
  provider: {
    "@type": "Person",
    name: "木村友亮",
    alternateName: "samuido",
    email: "361do.sleep(at)gmail.com",
  },
  serviceType: "Video Production",
  areaServed: "Japan",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "映像制作サービス",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "MV制作",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "リリックモーション",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "イラストアニメーション",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "プロモーション映像",
        },
      },
    ],
  },
};

export default function VideoCommissionPage() {
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
                  { label: "Commission", href: "/about/commission" },
                  { label: "Video", isCurrent: true },
                ]}
                className="pt-4"
              />

              {/* Header */}
              <header className="space-y-12">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  映像依頼
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  MV制作・アニメーション・プロモーション映像の制作を承ります.
                  <br />
                  クリエイティブな映像表現で想いを形にします.
                </p>
              </header>

              {/* Services Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  映像制作サービス概要
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="flex items-center">
                      <Music className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        MV制作
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      ミュージックビデオの制作
                    </p>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="flex items-center">
                      <Video className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        リリックモーション
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      歌詞に合わせたアニメーション
                    </p>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="flex items-center">
                      <Palette className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        イラストアニメーション
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      イラストを使ったアニメーション
                    </p>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <div className="flex items-center">
                      <Megaphone className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        プロモーション映像
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      商品・サービスのプロモーション映像
                    </p>
                  </div>
                </div>
              </section>

              {/* Process */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  依頼の流れ
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "お問い合わせ",
                      description: "メールまたはXのDMで依頼内容を相談",
                      icon: MessageCircle,
                    },
                    {
                      step: 2,
                      title: "要件確認",
                      description: "映像の内容、長さ、スタイルの確認",
                      icon: CheckCircle,
                    },
                    {
                      step: 3,
                      title: "見積もり",
                      description: "制作期間と料金の見積もり",
                      icon: Clock,
                    },
                    {
                      step: 4,
                      title: "制作開始",
                      description: "企画、脚本、制作作業",
                      icon: Video,
                    },
                    {
                      step: 5,
                      title: "レビュー・修正",
                      description: "クライアントからのフィードバック反映",
                      icon: CheckCircle,
                    },
                    {
                      step: 6,
                      title: "納品",
                      description: "完成映像の納品とサポート",
                      icon: CheckCircle,
                    },
                  ].map(({ step, title, description, icon: Icon }) => (
                    <div
                      key={step}
                      className="bg-base border border-foreground p-4"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-accent text-background flex items-center justify-center font-bold mr-4 text-sm">
                          {step}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center mb-2">
                            <Icon className="w-5 h-5 text-accent mr-2" />
                            <h3 className="zen-kaku-gothic-new text-base text-primary">
                              {title}
                            </h3>
                          </div>
                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pricing */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  料金体系
                </h2>

                <div className="bg-base border border-accent p-4 mb-6">
                  <p className="noto-sans-jp-light text-sm text-accent">
                    ※このページに記載した料金設定/依頼の流れ等はまだ検討段階であり、今後変更される可能性が高いです。
                  </p>
                </div>

                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6 mb-8">
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      料金例
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          歌ってみたMV制作
                        </span>
                        <span className="zen-kaku-gothic-new text-sm text-accent">
                          5,000円〜
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          オリジナルMV制作
                        </span>
                        <span className="zen-kaku-gothic-new text-sm text-accent">
                          6,000円〜
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          OP/ED/トランジション（20秒以内）
                        </span>
                        <span className="zen-kaku-gothic-new text-sm text-accent">
                          1,000円〜
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      支払い・キャンセル
                    </h3>
                    <div className="space-y-2">
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        • 納品確認から30日以内にお支払い
                      </p>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        • 銀行振込、PayPay、Amazonギフト対応
                      </p>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        • 制作開始後のキャンセル料：本来料金の50%
                      </p>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        • リテイク：無料3回まで、4回目以降は料金の半額
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-base border border-accent p-4">
                  <p className="noto-sans-jp-light text-sm text-accent">
                    ※料金設定は変更する場合がございます。依頼時点でここに記載されている金額が料金となります。
                    <br />
                    ※尺や納期、料金によってはお断りする場合がございます。
                  </p>
                </div>
              </section>

              {/* Software */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  使用ソフトウェア
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      映像制作
                    </h3>
                    <div className="space-y-2">
                      {["AfterEffects", "Premiere Pro", "Blender"].map(
                        (software) => (
                          <div
                            key={software}
                            className="noto-sans-jp-light text-sm text-foreground"
                          >
                            {software}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      グラフィック
                    </h3>
                    <div className="space-y-2">
                      {["Photoshop", "Illustrator"].map((software) => (
                        <div
                          key={software}
                          className="noto-sans-jp-light text-sm text-foreground"
                        >
                          {software}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Requirements */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  見積もりに必要な情報
                </h2>
                <div className="bg-base border border-foreground p-4">
                  <p className="noto-sans-jp-light text-sm text-foreground mb-4">
                    361do.sleep(at)gmail.com
                    またはXのDMにて以下の内容をお教えください：
                  </p>
                  <div className="space-y-2">
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • 何を作るか（歌ってみたのMV制作など）
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • 納期（目安は1ヶ月です）
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • 予算
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • 作る映像の尺または楽曲名
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      •
                      イメージ（指標となる作例や、箇条書き、絵コンテ、なんでもOK!）
                    </p>
                  </div>
                  <p className="noto-sans-jp-light text-sm text-accent mt-4">
                    ※場合によっては、追加で音源やイラスト、曲名などを教えていただくようお願いすることがあります。
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  連絡方法
                </h2>
                <div className="bg-base border border-foreground p-4">
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                    <div>
                      <div className="flex items-center mb-3">
                        <Mail className="w-5 h-5 text-accent mr-2" />
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          メール
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground mb-4">
                        361do.sleep(at)gmail.com
                      </p>

                      <div className="flex items-center mb-3">
                        <MessageCircle className="w-5 h-5 text-accent mr-2" />
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          X (Twitter)
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        @361do_design
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center mb-3">
                        <Clock className="w-5 h-5 text-accent mr-2" />
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          対応時間
                        </h3>
                      </div>
                      <p className="noto-sans-jp-light text-sm text-foreground mb-4">
                        平日 9:00-18:00
                      </p>

                      <h3 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                        返信時間
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        24時間以内
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-base border border-accent p-4">
                    <p className="noto-sans-jp-light text-sm text-accent">
                      通話などでのミーティングの対応は致しかねます
                    </p>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <nav aria-label="Commission navigation">
                <h3 className="sr-only">Commission機能</h3>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  <Link
                    href="/contact"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>お問い合わせフォーム</span>
                  </Link>

                  <Link
                    href="/about/commission/estimate"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>料金計算機</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <footer className="pt-4 border-t border-foreground">
                <div className="text-center">
                  <p className="shippori-antique-b1-regular text-sm inline-block">
                    © 2025 samuido - Video Commission
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
