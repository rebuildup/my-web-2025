import Link from 'next/link';
import { Search, Home, ArrowLeft, Mail } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-base-gray min-h-screen text-white">
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* 404 Header */}
          <div className="mb-12">
            <h1 className="font-neue-haas text-primary mb-4 text-6xl font-bold italic">404</h1>
            <h2 className="font-zen-kaku mb-6 text-2xl font-bold">
              ページが見つかりません / Page Not Found
            </h2>
            <p className="font-noto-sans mb-8 text-lg text-gray-300">
              お探しのページは存在しないか、移動した可能性があります。
              <br />
              The page you are looking for might have been removed, had its name changed, or is
              temporarily unavailable.
            </p>
          </div>

          {/* Navigation Options */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Home */}
            <Link
              href="/"
              className="group hover:border-primary border border-gray-700 bg-gray-800 p-6 transition-colors"
            >
              <Home className="text-primary mx-auto mb-4 h-8 w-8 transition-transform group-hover:scale-110" />
              <h3 className="font-neue-haas mb-2 text-lg font-bold italic">ホーム / Home</h3>
              <p className="text-sm text-gray-400">サイトのトップページに戻る</p>
            </Link>

            {/* Portfolio */}
            <Link
              href="/portfolio"
              className="group hover:border-primary border border-gray-700 bg-gray-800 p-6 transition-colors"
            >
              <div className="bg-primary mx-auto mb-4 h-8 w-8 transition-transform group-hover:scale-110"></div>
              <h3 className="font-neue-haas mb-2 text-lg font-bold italic">
                ポートフォリオ / Portfolio
              </h3>
              <p className="text-sm text-gray-400">作品一覧を見る</p>
            </Link>

            {/* Tools */}
            <Link
              href="/tools"
              className="group hover:border-primary border border-gray-700 bg-gray-800 p-6 transition-colors"
            >
              <div className="border-primary mx-auto mb-4 h-8 w-8 border-2 transition-transform group-hover:scale-110"></div>
              <h3 className="font-neue-haas mb-2 text-lg font-bold italic">ツール / Tools</h3>
              <p className="text-sm text-gray-400">便利なツール集</p>
            </Link>

            {/* Workshop */}
            <Link
              href="/workshop"
              className="group hover:border-primary border border-gray-700 bg-gray-800 p-6 transition-colors"
            >
              <div className="border-primary mx-auto mb-4 flex h-8 w-8 items-center justify-center border transition-transform group-hover:scale-110">
                <div className="bg-primary h-3 w-3"></div>
              </div>
              <h3 className="font-neue-haas mb-2 text-lg font-bold italic">
                ワークショップ / Workshop
              </h3>
              <p className="text-sm text-gray-400">ブログとプラグイン</p>
            </Link>

            {/* About */}
            <Link
              href="/about"
              className="group hover:border-primary border border-gray-700 bg-gray-800 p-6 transition-colors"
            >
              <div className="border-primary mx-auto mb-4 h-8 w-8 rounded-full border-2 transition-transform group-hover:scale-110"></div>
              <h3 className="font-neue-haas mb-2 text-lg font-bold italic">プロフィール / About</h3>
              <p className="text-sm text-gray-400">サイト制作者について</p>
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className="group hover:border-primary border border-gray-700 bg-gray-800 p-6 transition-colors"
            >
              <Mail className="text-primary mx-auto mb-4 h-8 w-8 transition-transform group-hover:scale-110" />
              <h3 className="font-neue-haas mb-2 text-lg font-bold italic">
                お問い合わせ / Contact
              </h3>
              <p className="text-sm text-gray-400">メッセージを送る</p>
            </Link>
          </div>

          {/* Search Section */}
          <div className="mb-12 border border-gray-700 bg-gray-800 p-8">
            <h3 className="font-neue-haas mb-4 flex items-center justify-center gap-2 text-xl font-bold italic">
              <Search className="text-primary h-6 w-6" />
              サイト内検索 / Search
            </h3>
            <p className="mb-6 text-gray-400">お探しのコンテンツを検索してみてください</p>
            <Link
              href="/search"
              className="bg-primary font-neue-haas inline-block px-8 py-3 font-bold text-white italic transition-colors hover:bg-blue-600"
            >
              検索ページへ / Go to Search
            </Link>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => window.history.back()}
              className="font-neue-haas hover:border-primary inline-flex items-center gap-2 border border-gray-700 bg-gray-800 px-6 py-3 font-bold text-white italic transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              前のページに戻る / Go Back
            </button>

            <Link
              href="/contact"
              className="bg-primary font-neue-haas inline-flex items-center gap-2 px-6 py-3 font-bold text-white italic transition-colors hover:bg-blue-600"
            >
              <Mail className="h-5 w-5" />
              問題を報告 / Report Issue
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-sm text-gray-500">
            <p className="mb-2">Error Code: 404 | Page Not Found</p>
            <p>
              If you believe this is an error, please{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
