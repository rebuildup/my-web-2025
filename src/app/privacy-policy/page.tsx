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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container-system py-ratio-lg">
        {/* Page Header */}
        <header className="mb-ratio-lg">
          <h1 className="neue-haas-grotesk-display text-ratio-xl text-primary mb-ratio-sm">
            Privacy Policy
          </h1>
          <p className="noto-sans-jp-light text-ratio-base opacity-80 mb-ratio-xs">
            プライバシーポリシー
          </p>
          <div className="flex items-center gap-ratio-sm text-ratio-sm opacity-60">
            <span className="noto-sans-jp-light">
              最終更新日: {lastUpdated}
            </span>
            <span className="noto-sans-jp-light">バージョン: {version}</span>
          </div>
        </header>

        {/* Privacy Policy Content */}
        <main className="max-w-4xl">
          {/* 基本方針 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              基本方針
            </h2>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-sm">
              samuido（以下「当サイト」）は、ユーザーの個人情報の保護を重要な責務と考え、個人情報保護法及び関連法令を遵守し、適切な個人情報の取り扱いを行います。
            </p>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight">
              本プライバシーポリシーは、当サイトがどのような個人情報を収集し、どのように利用・保護するかについて説明するものです。
            </p>
          </section>

          {/* 収集する情報 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              収集する情報
            </h2>

            <h3 className="neue-haas-grotesk-display text-ratio-base text-primary mb-ratio-sm">
              お問い合わせフォーム
            </h3>
            <ul className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-base space-y-2">
              <li>• 名前（ハンドルネーム可）</li>
              <li>• メールアドレス</li>
              <li>• 件名</li>
              <li>• お問い合わせ内容</li>
            </ul>

            <h3 className="neue-haas-grotesk-display text-ratio-base text-primary mb-ratio-sm">
              アクセスログ
            </h3>
            <ul className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-base space-y-2">
              <li>• IPアドレス</li>
              <li>• アクセス日時</li>
              <li>• ブラウザ情報</li>
              <li>• 参照元URL</li>
              <li>• アクセスページ</li>
            </ul>
          </section>

          {/* 利用目的 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              利用目的
            </h2>
            <ul className="noto-sans-jp-light text-ratio-base leading-ratio-tight space-y-2">
              <li>• お問い合わせへの対応</li>
              <li>• サイトの改善・運営</li>
              <li>• 統計情報の作成（個人を特定しない形で）</li>
              <li>• セキュリティの確保</li>
              <li>• 法的義務の履行</li>
            </ul>
          </section>

          {/* Cookieの使用 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              Cookieの使用
            </h2>

            <h3 className="neue-haas-grotesk-display text-ratio-base text-primary mb-ratio-sm">
              必須Cookie
            </h3>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-sm">
              サイトの基本機能（セッション管理、セキュリティ）に必要なCookieです。これらのCookieは無効にできません。
            </p>

            <h3 className="neue-haas-grotesk-display text-ratio-base text-primary mb-ratio-sm">
              分析Cookie（Google Analytics）
            </h3>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-sm">
              サイトの利用状況を分析するためのCookieです。個人を特定する情報は収集しません。
            </p>
            <ul className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-base space-y-2">
              <li>• ページビュー数</li>
              <li>• 滞在時間</li>
              <li>• 参照元サイト</li>
              <li>• 使用デバイス・ブラウザ</li>
            </ul>

            <h3 className="neue-haas-grotesk-display text-ratio-base text-primary mb-ratio-sm">
              Cookie管理
            </h3>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight">
              ブラウザの設定でCookieを無効にすることができますが、サイトの一部機能が正常に動作しない場合があります。
            </p>
          </section>

          {/* 第三者提供 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              第三者への提供
            </h2>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-sm">
              当サイトは、以下の場合を除き、個人情報を第三者に提供することはありません：
            </p>
            <ul className="noto-sans-jp-light text-ratio-base leading-ratio-tight space-y-2">
              <li>• ユーザーの同意がある場合</li>
              <li>• 法令に基づく場合</li>
              <li>• 人の生命、身体または財産の保護のために必要がある場合</li>
              <li>
                •
                公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合
              </li>
            </ul>
          </section>

          {/* 安全管理措置 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              安全管理措置
            </h2>
            <ul className="noto-sans-jp-light text-ratio-base leading-ratio-tight space-y-2">
              <li>• SSL/TLS暗号化による通信の保護</li>
              <li>• アクセス制御による不正アクセスの防止</li>
              <li>• 定期的なセキュリティ監査</li>
              <li>• 個人情報の適切な廃棄</li>
            </ul>
          </section>

          {/* 保存期間 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              保存期間
            </h2>
            <ul className="noto-sans-jp-light text-ratio-base leading-ratio-tight space-y-2">
              <li>• お問い合わせ情報: 対応完了後1年間</li>
              <li>• アクセスログ: 6ヶ月間</li>
              <li>• 分析データ: Google Analyticsの設定に準拠（最大26ヶ月）</li>
            </ul>
          </section>

          {/* ユーザーの権利 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              ユーザーの権利
            </h2>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-sm">
              ユーザーは、自身の個人情報について以下の権利を有します：
            </p>
            <ul className="noto-sans-jp-light text-ratio-base leading-ratio-tight space-y-2">
              <li>• 開示請求権</li>
              <li>• 訂正・削除請求権</li>
              <li>• 利用停止請求権</li>
              <li>• データポータビリティの権利</li>
            </ul>
          </section>

          {/* プライバシーポリシーの変更 */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              プライバシーポリシーの変更
            </h2>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight">
              当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、サイト上で通知いたします。
            </p>
          </section>

          {/* お問い合わせ */}
          <section className="mb-ratio-lg">
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-base">
              お問い合わせ
            </h2>
            <p className="noto-sans-jp-light text-ratio-base leading-ratio-tight mb-ratio-sm">
              本プライバシーポリシーに関するお問い合わせは、以下までご連絡ください：
            </p>
            <div className="border border-foreground p-ratio-sm bg-base">
              <p className="noto-sans-jp-regular text-ratio-base mb-ratio-xs">
                <strong>連絡先:</strong> 361do.sleep@gmail.com
              </p>
              <p className="noto-sans-jp-regular text-ratio-base mb-ratio-xs">
                <strong>対応時間:</strong> 平日 9:00-18:00
              </p>
              <p className="noto-sans-jp-regular text-ratio-base">
                <strong>返信時間:</strong> 24時間以内（営業日）
              </p>
            </div>
          </section>
        </main>

        {/* Back to Home Link */}
        <div className="mt-ratio-xl pt-ratio-lg border-t border-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline noto-sans-jp-regular text-ratio-base"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>

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
