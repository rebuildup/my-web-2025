'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container-grid container-grid-debug">
      {/* ヒーローヘッダー */}
      <section className="py-16 text-center">
        <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">samuido</h1>
        <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
          フロントエンドエンジニアの個人サイト
        </p>
        <p className="noto-sans-jp-regular mx-auto max-w-3xl text-gray-400 md:text-lg">
          自己紹介 / 作品ギャラリー / プラグイン配布 / ツール など
          <br />
          欲しいもの全部詰め込みました
        </p>
      </section>

      {/* カテゴリカード */}
      <section className="py-12">
        <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
          Main Categories
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* About */}
          <Link href="/about" className="card block transition-colors hover:border-blue-500">
            <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">About</h3>
            <p className="noto-sans-jp-regular mb-4 text-gray-300">
              プロフィール、デジタル名刺、依頼ページへの導線
            </p>
            <ul className="noto-sans-jp-light space-y-1 text-sm text-gray-400">
              <li>• 本名プロフィール（採用担当者・企業向け）</li>
              <li>• ハンドルネームプロフィール（同業者向け）</li>
              <li>• スキル・経歴・受賞歴</li>
            </ul>
          </Link>

          {/* Portfolio */}
          <Link href="/portfolio" className="card block transition-colors hover:border-blue-500">
            <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Portfolio</h3>
            <p className="noto-sans-jp-regular mb-4 text-gray-300">
              4つのギャラリー（all / develop / video / video&design）への導線
            </p>
            <ul className="noto-sans-jp-light space-y-1 text-sm text-gray-400">
              <li>• 全作品一覧（バラエティ重視）</li>
              <li>• 開発系作品（プログラミング関連）</li>
              <li>• 映像作品（foriioライク表示）</li>
              <li>• 映像・デザイン作品（クリエイティブ）</li>
            </ul>
          </Link>

          {/* Workshop */}
          <Link href="/workshop" className="card block transition-colors hover:border-blue-500">
            <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Workshop</h3>
            <p className="noto-sans-jp-regular mb-4 text-gray-300">
              プラグイン配布、ブログ、素材ダウンロードへの導線
            </p>
            <ul className="noto-sans-jp-light space-y-1 text-sm text-gray-400">
              <li>• プラグイン配布（After Effects等）</li>
              <li>• 技術ブログ・制作記録</li>
              <li>• 素材・テンプレートダウンロード</li>
            </ul>
          </Link>

          {/* Tools */}
          <Link href="/tools" className="card block transition-colors hover:border-blue-500">
            <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Tools</h3>
            <p className="noto-sans-jp-regular mb-4 text-gray-300">実用的なWebツール集への導線</p>
            <ul className="noto-sans-jp-light space-y-1 text-sm text-gray-400">
              <li>• カラーパレット生成ツール</li>
              <li>• QRコード生成器</li>
              <li>• テキストカウンタ</li>
              <li>• その他便利ツール</li>
            </ul>
          </Link>
        </div>
      </section>

      {/* ルート機能カード */}
      <section className="py-12">
        <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
          Site Functions
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Privacy Policy */}
          <Link
            href="/privacy-policy"
            className="card block text-center transition-colors hover:border-blue-500"
          >
            <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">Privacy Policy</h3>
            <p className="noto-sans-jp-regular text-sm text-gray-300">プライバシーポリシー</p>
          </Link>

          {/* Search */}
          <Link
            href="/search"
            className="card block text-center transition-colors hover:border-blue-500"
          >
            <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">Search</h3>
            <p className="noto-sans-jp-regular text-sm text-gray-300">サイト内検索機能</p>
          </Link>

          {/* Contact */}
          <Link
            href="/contact"
            className="card block text-center transition-colors hover:border-blue-500"
          >
            <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">Contact</h3>
            <p className="noto-sans-jp-regular text-sm text-gray-300">お問い合わせフォーム</p>
          </Link>
        </div>
      </section>

      {/* 最新コンテンツハイライト */}
      <section className="py-12">
        <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
          Latest Updates
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* ポートフォリオ最新 */}
          <div className="card">
            <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Portfolio</div>
            <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">最新作品タイトル</h3>
            <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
              最新の制作作品についての簡単な説明です。技術スタックや制作期間など。
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-600 px-2 py-1 text-xs text-white">React</span>
              <span className="bg-blue-600 px-2 py-1 text-xs text-white">TypeScript</span>
            </div>
          </div>

          {/* ブログ最新 */}
          <div className="card">
            <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Blog</div>
            <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">最新ブログ記事</h3>
            <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
              最新の技術記事や制作過程についての記事です。学習した内容の共有など。
            </p>
            <div className="text-xs text-gray-500">2025/01/20</div>
          </div>

          {/* ツール最新 */}
          <div className="card">
            <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Tools</div>
            <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">新機能追加</h3>
            <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
              既存ツールに新機能を追加しました。使いやすさの向上を図っています。
            </p>
            <div className="text-xs text-gray-500">2025/01/18</div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="mt-16 border-t border-gray-600 py-12 text-center">
        <p className="noto-sans-jp-regular mb-2 text-sm text-gray-400">
          © 2025 samuido (木村友亮)
        </p>
        <p className="noto-sans-jp-light text-xs text-gray-500">
          フロントエンドエンジニア・Webデザイナー・映像クリエイター
        </p>
      </footer>
    </div>
  );
}
