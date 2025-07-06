import Link from 'next/link';
import { Search, Home, ArrowLeft, Mail } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray text-foreground">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Header */}
          <div className="mb-12">
            <h1 className="text-6xl neue-haas-grotesk-display text-primary mb-4">
              404
            </h1>
            <h2 className="text-2xl zen-kaku-gothic-new mb-6">
              ページが見つかりません / Page Not Found
            </h2>
            <p className="text-lg noto-sans-jp text-foreground/70 mb-8">
              お探しのページは存在しないか、移動した可能性があります。<br />
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Home */}
            <Link 
              href="/" 
              className="group bg-gray border border-foreground/20 p-6 hover:border-primary transition-colors"
            >
              <Home className="w-8 h-8 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg neue-haas-grotesk-display mb-2">ホーム / Home</h3>
              <p className="text-sm text-foreground/60">サイトのトップページに戻る</p>
            </Link>

            {/* Portfolio */}
            <Link 
              href="/portfolio" 
              className="group bg-gray border border-foreground/20 p-6 hover:border-primary transition-colors"
            >
              <div className="w-8 h-8 bg-primary mx-auto mb-4 group-hover:scale-110 transition-transform"></div>
              <h3 className="text-lg neue-haas-grotesk-display mb-2">ポートフォリオ / Portfolio</h3>
              <p className="text-sm text-foreground/60">作品一覧を見る</p>
            </Link>

            {/* Tools */}
            <Link 
              href="/tools" 
              className="group bg-gray border border-foreground/20 p-6 hover:border-primary transition-colors"
            >
              <div className="w-8 h-8 border-2 border-primary mx-auto mb-4 group-hover:scale-110 transition-transform"></div>
              <h3 className="text-lg neue-haas-grotesk-display mb-2">ツール / Tools</h3>
              <p className="text-sm text-foreground/60">便利なツール集</p>
            </Link>

            {/* Workshop */}
            <Link 
              href="/workshop" 
              className="group bg-gray border border-foreground/20 p-6 hover:border-primary transition-colors"
            >
              <div className="w-8 h-8 border border-primary mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 bg-primary"></div>
              </div>
              <h3 className="text-lg neue-haas-grotesk-display mb-2">ワークショップ / Workshop</h3>
              <p className="text-sm text-foreground/60">ブログとプラグイン</p>
            </Link>

            {/* About */}
            <Link 
              href="/about" 
              className="group bg-gray border border-foreground/20 p-6 hover:border-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-full border-2 border-primary mx-auto mb-4 group-hover:scale-110 transition-transform"></div>
              <h3 className="text-lg neue-haas-grotesk-display mb-2">プロフィール / About</h3>
              <p className="text-sm text-foreground/60">サイト制作者について</p>
            </Link>

            {/* Contact */}
            <Link 
              href="/contact" 
              className="group bg-gray border border-foreground/20 p-6 hover:border-primary transition-colors"
            >
              <Mail className="w-8 h-8 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg neue-haas-grotesk-display mb-2">お問い合わせ / Contact</h3>
              <p className="text-sm text-foreground/60">メッセージを送る</p>
            </Link>
          </div>

          {/* Search Section */}
          <div className="bg-gray border border-foreground/20 p-8 mb-12">
            <h3 className="text-xl neue-haas-grotesk-display mb-4 flex items-center justify-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              サイト内検索 / Search
            </h3>
            <p className="text-foreground/60 mb-6">
              お探しのコンテンツを検索してみてください
            </p>
            <Link 
              href="/search"
              className="inline-block bg-primary text-foreground px-8 py-3 neue-haas-grotesk-display hover:bg-primary/80 transition-colors"
            >
              検索ページへ / Go to Search
            </Link>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 bg-gray border border-foreground/20 text-foreground px-6 py-3 neue-haas-grotesk-display hover:border-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              前のページに戻る / Go Back
            </button>
            
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-foreground px-6 py-3 neue-haas-grotesk-display hover:bg-primary/80 transition-colors"
            >
              <Mail className="w-5 h-5" />
              問題を報告 / Report Issue
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-sm text-foreground/50">
            <p className="mb-2">
              Error Code: 404 | Page Not Found
            </p>
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