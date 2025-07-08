import Link from 'next/link';
import type { Metadata } from 'next';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';

export const metadata: Metadata = {
  title: 'Privacy Policy - samuido',
  description: 'samuidoウェブサイトのプライバシーポリシー。個人情報の取り扱いについて説明します。',
  robots: 'index, follow',
};

export default function PrivacyPolicyPage() {
  return (
    <GridLayout background={false} className="bg-gray">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <GridContainer>
          <Link
            href="/"
            className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
          >
            ← Home
          </Link>
        </GridContainer>
      </nav>

      {/* Header */}
      <header className="px-4 py-16 text-center">
        <h1 className="neue-haas-grotesk-display text-primary mb-6 text-4xl md:text-6xl">
          Privacy Policy
        </h1>
        <p className="noto-sans-jp text-foreground/80 text-lg">個人情報保護方量</p>
        <div className="bg-primary mx-auto mt-8 h-1 w-32"></div>
      </header>

      {/* Content */}
      <main className="pb-16">
        <GridContainer>
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">基本方針</h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <p>
                samuido（以下「当サイト」）は、個人情報の重要性を認識し、個人情報保護法等の関連法令を遵守して、
                適切に個人情報を取り扱います。
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">収集する情報</h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <h3 className="text-foreground text-lg font-medium">お問い合わせフォーム</h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>お名前</li>
                <li>メールアドレス</li>
                <li>会社名・組織名（任意）</li>
                <li>電話番号（任意）</li>
                <li>お問い合わせ内容</li>
              </ul>

              <h3 className="text-foreground text-lg font-medium">アクセス情報</h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>IPアドレス</li>
                <li>ブラウザ情報</li>
                <li>アクセス日時</li>
                <li>アクセスページ</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">利用目的</h2>
            <div className="noto-sans-jp text-foreground/80">
              <ul className="list-disc space-y-2 pl-6">
                <li>お問い合わせへの回答</li>
                <li>サービス向上のための分析</li>
                <li>ウェブサイトの改善</li>
                <li>統計データの作成（個人を特定しない形式）</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">第三者への提供</h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <p>当サイトは、以下の場合を除き、個人情報を第三者に提供することはありません。</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>ご本人の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>生命、身体または財産の保護のために必要がある場合</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">Cookieの使用</h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <p>
                当サイトでは、ユーザー体験の向上のためにCookieを使用する場合があります。
                Cookieは個人を特定する情報を含みません。
              </p>
              <p>
                ブラウザの設定でCookieを無効にすることができますが、
                一部機能が正常に動作しない場合があります。
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">
              Google Analytics
            </h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <p>
                当サイトでは、ウェブサイトの分析のためにGoogle Analyticsを使用しています。 Google
                Analyticsは、Cookieを使用してユーザーの行動を分析します。
              </p>
              <p>
                この分析は匿名で行われ、個人を特定することはありません。
                データの使用を希望しない場合は、
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Analytics オプトアウトページ
                </a>
                で無効にできます。
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">reCAPTCHA</h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <p>
                当サイトのお問い合わせフォームでは、スパム防止のためにGoogle
                reCAPTCHAを使用しています。 reCAPTCHAの使用には、Googleの
                <a
                  href="https://policies.google.com/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  プライバシーポリシー
                </a>
                と
                <a
                  href="https://policies.google.com/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  利用規約
                </a>
                が適用されます。
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">
              個人情報の開示・訂正・削除
            </h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <p>
                ご自身の個人情報について、開示・訂正・削除をご希望の場合は、
                お問い合わせフォームまたはメールでご連絡ください。
              </p>
              <p>本人確認の上、合理的な期間内に対応いたします。</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">
              プライバシーポリシーの変更
            </h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <p>
                当サイトは、必要に応じてプライバシーポリシーを変更する場合があります。
                変更した場合は、当ページに掲載してお知らせします。
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-primary mb-4 text-2xl">お問い合わせ</h2>
            <div className="noto-sans-jp text-foreground/80 space-y-4">
              <p>個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。</p>
              <div className="bg-gray/50 border-foreground/20 border p-4">
                <p>
                  <strong>メール:</strong> 361do.sleep@gmail.com
                  <br />
                  <strong>運営者:</strong> samuido（木村友亮）
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="text-foreground/60 border-foreground/20 border-t pt-6 text-sm">
              <p>制定日: 2025年7月6日</p>
              <p>最終更新日: 2025年7月6日</p>
            </div>
          </section>
        </div>
        </GridContainer>
      </main>

      {/* Footer */}
      <footer className="border-foreground/20 border-t py-8 text-center">
        <GridContainer>
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
              Contact
            </Link>
            <Link href="/about" className="text-foreground/60 hover:text-primary text-sm">
              About
            </Link>
          </div>
        </GridContainer>
      </footer>
    </GridLayout>
  );
}
