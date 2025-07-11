import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - samuido | プライバシーポリシー',
  description:
    'samuidoのプライバシーポリシー。個人情報の取り扱い、Cookieの使用、アクセス解析について説明しています。',
  keywords: 'プライバシーポリシー, 個人情報, Cookie, アクセス解析, 個人情報保護',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy - samuido | プライバシーポリシー',
    description:
      'samuidoのプライバシーポリシー。個人情報の取り扱い、Cookieの使用、アクセス解析について説明しています。',
    type: 'website',
    url: 'https://yusuke-kim.com/privacy-policy',
    images: [
      {
        url: 'https://yusuke-kim.com/privacy-policy-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Privacy Policy - samuido | プライバシーポリシー',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - samuido | プライバシーポリシー',
    description:
      'samuidoのプライバシーポリシー。個人情報の取り扱い、Cookieの使用、アクセス解析について説明しています。',
    images: ['https://yusuke-kim.com/privacy-policy-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'samuido Privacy Policy',
  description: 'プライバシーポリシー',
  url: 'https://yusuke-kim.com/privacy-policy',
  dateModified: '2025-01-01',
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
  mainEntity: {
    '@type': 'Article',
    name: 'プライバシーポリシー',
    description: '個人情報の取り扱いについて',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-grid">
        {/* ヒーローヘッダー */}
        <section className="py-16 text-center">
          <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">
            Privacy Policy
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            プライバシーポリシー
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            個人情報の取り扱いについて
            <br />
            ユーザーのプライバシーを保護します
          </p>
        </section>

        {/* 最終更新日 */}
        <section className="py-6 text-center">
          <div className="noto-sans-jp-regular text-sm text-gray-500">最終更新日: 2025年1月1日</div>
        </section>

        {/* 基本方針 */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">基本方針</h2>
            <div className="noto-sans-jp-regular space-y-4 leading-relaxed text-gray-300">
              <p>
                samuido（以下「当サイト」）は、ユーザーの個人情報保護を重要な責務と考え、
                個人情報保護法及び関連法令を遵守し、適切に取り扱うことをお約束いたします。
              </p>
              <p>
                当サイトでは、ユーザーが安心してサービスをご利用いただけるよう、
                個人情報の収集、利用、管理について以下の通り定めています。
              </p>
            </div>
          </div>
        </section>

        {/* 収集する情報 */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">収集する情報</h2>
            <div className="space-y-6">
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">
                  お問い合わせフォーム
                </h3>
                <ul className="noto-sans-jp-regular space-y-2 text-gray-300">
                  <li>• 名前（ハンドルネーム可）</li>
                  <li>• メールアドレス</li>
                  <li>• 件名</li>
                  <li>• お問い合わせ内容</li>
                </ul>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">アクセスログ</h3>
                <ul className="noto-sans-jp-regular space-y-2 text-gray-300">
                  <li>• IPアドレス</li>
                  <li>• アクセス日時</li>
                  <li>• ブラウザ情報（User Agent）</li>
                  <li>• リファラー情報</li>
                  <li>• 閲覧ページ情報</li>
                </ul>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">その他</h3>
                <p className="noto-sans-jp-regular text-gray-300">
                  サービスの提供に必要最小限の情報のみを収集いたします。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 利用目的 */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">利用目的</h2>
            <div className="space-y-4">
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">
                  お問い合わせへの対応
                </h3>
                <p className="noto-sans-jp-regular text-gray-300">
                  お問い合わせいただいた内容への回答、連絡、サポートのために利用いたします。
                </p>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">
                  サイトの改善・運営
                </h3>
                <p className="noto-sans-jp-regular text-gray-300">
                  アクセス解析による利用状況の把握、サイトの改善、新機能の開発のために利用いたします。
                </p>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">
                  統計情報の作成
                </h3>
                <p className="noto-sans-jp-regular text-gray-300">
                  個人を特定できない形での統計情報の作成・公開のために利用いたします。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie使用について */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
              Cookieの使用について
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">必須Cookie</h3>
                <p className="noto-sans-jp-regular text-gray-300">
                  サイトの基本機能（フォームの送信、設定の保存など）に必要なCookieです。
                  これらのCookieは無効にすることができません。
                </p>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">分析Cookie</h3>
                <p className="noto-sans-jp-regular mb-3 text-gray-300">
                  Google Analyticsによるアクセス解析のためのCookieです。
                  これらのCookieはブラウザ設定で無効にすることができます。
                </p>
                <ul className="noto-sans-jp-regular space-y-2 text-gray-300">
                  <li>• ページビュー数の計測</li>
                  <li>• 滞在時間の測定</li>
                  <li>• 参照元の分析</li>
                  <li>• デバイス・ブラウザ情報の収集</li>
                </ul>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">Cookie管理</h3>
                <p className="noto-sans-jp-regular text-gray-300">
                  Cookieの設定は、ブラウザの設定で管理できます。
                  ただし、Cookieを無効にした場合、一部の機能が正常に動作しない可能性があります。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* アクセス解析 */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
              アクセス解析について
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">
                  Google Analytics
                </h3>
                <p className="noto-sans-jp-regular mb-3 text-gray-300">
                  当サイトでは、Google Inc.が提供するGoogle
                  Analyticsを使用してアクセス解析を行っています。
                </p>
                <ul className="noto-sans-jp-regular space-y-2 text-gray-300">
                  <li>• 個人を特定する情報は収集していません</li>
                  <li>• 収集されたデータはGoogleのプライバシーポリシーに従って処理されます</li>
                  <li>• データはサイトの改善目的でのみ使用されます</li>
                </ul>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">オプトアウト</h3>
                <p className="noto-sans-jp-regular text-gray-300">
                  Google Analyticsの無効化をご希望の場合は、
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    Google Analyticsオプトアウト アドオン
                  </a>
                  をご利用ください。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 第三者提供 */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
              第三者への情報提供
            </h2>
            <div className="noto-sans-jp-regular space-y-4 leading-relaxed text-gray-300">
              <p>当サイトでは、以下の場合を除き、個人情報を第三者に提供することはありません。</p>
              <ul className="ml-6 space-y-2">
                <li>• ユーザーの同意がある場合</li>
                <li>• 法令に基づく場合</li>
                <li>• 人の生命、身体または財産の保護のために必要がある場合</li>
                <li>• 公衆衛生の向上または児童の健全な育成の推進のため特に必要がある場合</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 安全管理措置 */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">安全管理措置</h2>
            <div className="noto-sans-jp-regular space-y-4 leading-relaxed text-gray-300">
              <p>
                当サイトでは、個人情報の漏洩、滅失、毀損の防止その他の安全管理のため、
                以下の措置を講じています。
              </p>
              <ul className="ml-6 space-y-2">
                <li>• SSL/TLS暗号化通信の使用</li>
                <li>• アクセス制御による不正アクセスの防止</li>
                <li>• セキュリティソフトウェアの使用</li>
                <li>• 定期的なセキュリティ監査</li>
                <li>• 不要な個人情報の速やかな削除</li>
              </ul>
            </div>
          </div>
        </section>

        {/* お問い合わせ先 */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">お問い合わせ先</h2>
            <div className="space-y-4">
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">連絡先</h3>
                <div className="noto-sans-jp-regular space-y-2 text-gray-300">
                  <div>サイト運営者: 木村友亮（samuido）</div>
                  <div>メールアドレス: 361do.sleep@gmail.com</div>
                </div>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">対応時間</h3>
                <div className="noto-sans-jp-regular space-y-2 text-gray-300">
                  <div>平日 9:00-18:00</div>
                  <div>返信時間: 24時間以内（土日祝日を除く）</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* プライバシーポリシーの変更 */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
              プライバシーポリシーの変更
            </h2>
            <div className="noto-sans-jp-regular space-y-4 leading-relaxed text-gray-300">
              <p>
                当サイトでは、法令の変更やサービスの改善に伴い、
                プライバシーポリシーを変更する場合があります。
              </p>
              <p>
                重要な変更については、サイト上での告知またはメールにより
                ユーザーにお知らせいたします。
              </p>
              <p>
                変更後のプライバシーポリシーは、当サイトに掲載した時点から効力を生じるものとします。
              </p>
            </div>
          </div>
        </section>

        {/* ナビゲーション */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Home
            </Link>
            <div className="flex gap-4">
              <Link href="/contact" className="text-sm text-blue-400 hover:text-blue-300">
                Contact →
              </Link>
              <Link href="/search" className="text-sm text-blue-400 hover:text-blue-300">
                Search →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
