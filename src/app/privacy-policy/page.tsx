import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - samuido | プライバシーポリシー",
  description:
    "samuidoのプライバシーポリシー。個人情報の取り扱い、Cookieの使用、アクセス解析について説明しています。",
  keywords: [
    "プライバシーポリシー",
    "個人情報",
    "Cookie",
    "アクセス解析",
    "個人情報保護",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy - samuido | プライバシーポリシー",
    description:
      "samuidoのプライバシーポリシー。個人情報の取り扱い、Cookieの使用、アクセス解析について説明しています。",
    type: "website",
    url: "https://yusuke-kim.com/privacy-policy",
    images: [
      {
        url: "https://yusuke-kim.com/privacy-policy-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Privacy Policy - samuido | プライバシーポリシー",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - samuido | プライバシーポリシー",
    description:
      "samuidoのプライバシーポリシー。個人情報の取り扱い、Cookieの使用、アクセス解析について説明しています。",
    images: ["https://yusuke-kim.com/privacy-policy-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

export default function PrivacyPolicy() {
  const lastUpdated = "2025年1月24日";
  const version = "1.0";

  // Style variables matching root page
  const SectionStyle = "space-y-4";
  const Section_title =
    "neue-haas-grotesk-display text-4xl text-primary leading-snug mb-6";
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex items-center py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* Page Header */}
            <header className="space-y-12">
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                Privacy Policy
              </h1>
              <div className="space-y-4">
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  samuidoのプライバシーポリシー。
                  <br />
                  個人情報の取り扱い、Cookieの使用、アクセス解析について説明しています。
                </p>
                <div className="flex items-center gap-4 text-sm opacity-60">
                  <span className="noto-sans-jp-light">
                    最終更新日: {lastUpdated}
                  </span>
                  <span className="noto-sans-jp-light">
                    バージョン: {version}
                  </span>
                </div>
              </div>
            </header>

            {/* Privacy Policy Content */}
            <section className="max-w-4xl space-y-12">
              {/* 基本方針 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>基本方針</h2>
                <div className="space-y-4">
                  <p className="noto-sans-jp-light text-sm leading-loose">
                    samuido（以下「当サイト」）は、ユーザーの個人情報の保護を重要な責務と考え、個人情報保護法及び関連法令を遵守し、適切な個人情報の取り扱いを行います。
                  </p>
                  <p className="noto-sans-jp-light text-sm leading-loose">
                    本プライバシーポリシーは、当サイトがどのような個人情報を収集し、どのように利用・保護するかについて説明するものです。
                  </p>
                </div>
              </article>

              {/* 収集する情報 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>収集する情報</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className={`${Global_title} text-primary mb-3`}>
                      お問い合わせフォーム
                    </h3>
                    <ul className="noto-sans-jp-light text-sm leading-loose space-y-1">
                      <li>• 名前（ハンドルネーム可）</li>
                      <li>• メールアドレス</li>
                      <li>• 件名</li>
                      <li>• お問い合わせ内容</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className={`${Global_title} text-primary mb-3`}>
                      アクセスログ
                    </h3>
                    <ul className="noto-sans-jp-light text-sm leading-loose space-y-1">
                      <li>• IPアドレス</li>
                      <li>• アクセス日時</li>
                      <li>• ブラウザ情報</li>
                      <li>• 参照元URL</li>
                      <li>• アクセスページ</li>
                    </ul>
                  </div>
                </div>
              </article>

              {/* 利用目的 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>利用目的</h2>
                <ul className="noto-sans-jp-light text-sm leading-loose space-y-1">
                  <li>• お問い合わせへの対応</li>
                  <li>• サイトの改善・運営</li>
                  <li>• 統計情報の作成（個人を特定しない形で）</li>
                  <li>• セキュリティの確保</li>
                  <li>• 法的義務の履行</li>
                </ul>
              </article>

              {/* Cookieの使用 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>Cookieの使用</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className={`${Global_title} text-primary mb-3`}>
                      必須Cookie
                    </h3>
                    <p className="noto-sans-jp-light text-sm leading-loose">
                      サイトの基本機能（セッション管理、セキュリティ）に必要なCookieです。これらのCookieは無効にできません。
                    </p>
                  </div>

                  <div>
                    <h3 className={`${Global_title} text-primary mb-3`}>
                      分析Cookie（Google Analytics）
                    </h3>
                    <p className="noto-sans-jp-light text-sm leading-loose mb-3">
                      サイトの利用状況を分析するためのCookieです。個人を特定する情報は収集しません。
                    </p>
                    <ul className="noto-sans-jp-light text-sm leading-loose space-y-1">
                      <li>• ページビュー数</li>
                      <li>• 滞在時間</li>
                      <li>• 参照元サイト</li>
                      <li>• 使用デバイス・ブラウザ</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className={`${Global_title} text-primary mb-3`}>
                      Cookie管理
                    </h3>
                    <p className="noto-sans-jp-light text-sm leading-loose">
                      ブラウザの設定でCookieを無効にすることができますが、サイトの一部機能が正常に動作しない場合があります。
                    </p>
                  </div>
                </div>
              </article>

              {/* 第三者提供 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>第三者への提供</h2>
                <div className="space-y-4">
                  <p className="noto-sans-jp-light text-sm leading-loose">
                    当サイトは、以下の場合を除き、個人情報を第三者に提供することはありません：
                  </p>
                  <ul className="noto-sans-jp-light text-sm leading-loose space-y-1">
                    <li>• ユーザーの同意がある場合</li>
                    <li>• 法令に基づく場合</li>
                    <li>
                      • 人の生命、身体または財産の保護のために必要がある場合
                    </li>
                    <li>
                      •
                      公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合
                    </li>
                  </ul>
                </div>
              </article>

              {/* 安全管理措置 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>安全管理措置</h2>
                <ul className="noto-sans-jp-light text-sm leading-loose space-y-1">
                  <li>• SSL/TLS暗号化による通信の保護</li>
                  <li>• アクセス制御による不正アクセスの防止</li>
                  <li>• 定期的なセキュリティ監査</li>
                  <li>• 個人情報の適切な廃棄</li>
                </ul>
              </article>

              {/* 保存期間 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>保存期間</h2>
                <ul className="noto-sans-jp-light text-sm leading-loose space-y-1">
                  <li>• お問い合わせ情報: 対応完了後1年間</li>
                  <li>• アクセスログ: 6ヶ月間</li>
                  <li>
                    • 分析データ: Google Analyticsの設定に準拠（最大26ヶ月）
                  </li>
                </ul>
              </article>

              {/* ユーザーの権利 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>ユーザーの権利</h2>
                <div className="space-y-4">
                  <p className="noto-sans-jp-light text-sm leading-loose">
                    ユーザーは、自身の個人情報について以下の権利を有します：
                  </p>
                  <ul className="noto-sans-jp-light text-sm leading-loose space-y-1">
                    <li>• 開示請求権</li>
                    <li>• 訂正・削除請求権</li>
                    <li>• 利用停止請求権</li>
                    <li>• データポータビリティの権利</li>
                  </ul>
                </div>
              </article>

              {/* プライバシーポリシーの変更 */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>プライバシーポリシーの変更</h2>
                <p className="noto-sans-jp-light text-sm leading-loose">
                  当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、サイト上で通知いたします。
                </p>
              </article>

              {/* お問い合わせ */}
              <article className={SectionStyle}>
                <h2 className={Section_title}>お問い合わせ</h2>
                <div className="space-y-4">
                  <p className="noto-sans-jp-light text-sm leading-loose">
                    本プライバシーポリシーに関するお問い合わせは、以下までご連絡ください：
                  </p>
                  <div className="p-4 bg-base">
                    <p className={`${Global_title} mb-2`}>
                      <strong>連絡先:</strong> 361do.sleep@gmail.com
                    </p>
                    <p className={`${Global_title} mb-2`}>
                      <strong>対応時間:</strong> 平日 9:00-18:00
                    </p>
                    <p className={Global_title}>
                      <strong>返信時間:</strong> 24時間以内（営業日）
                    </p>
                  </div>
                </div>
              </article>
            </section>

            {/* Back to Home Link */}
            <nav aria-label="Navigation">
              <Link
                href="/"
                className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background hover:bg-foreground hover:text-background transition-colors"
              >
                <span className={Global_title}>← ホームに戻る</span>
              </Link>
            </nav>

            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - Creative Portfolio & Tools
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "samuido Privacy Policy",
            description: "プライバシーポリシー",
            url: "https://yusuke-kim.com/privacy-policy",
            dateModified: "2025-01-24",
            author: {
              "@type": "Person",
              name: "木村友亮",
              alternateName: "samuido",
            },
            mainEntity: {
              "@type": "Article",
              name: "プライバシーポリシー",
              description: "個人情報の取り扱いについて",
            },
          }),
        }}
      />
    </div>
  );
}
