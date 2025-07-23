import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Container System */}
      <main className="min-h-screen flex items-center">
        <div className="container-system">
          <div className="space-y-ratio-lg">
            {/* Hero Header with Site Overview */}
            <header className="space-y-ratio-base">
              {/* Main Heading with Neue Haas Grotesk Display */}
              <h1 className="neue-haas-grotesk-display text-ratio-xl text-primary">
                samuido
              </h1>

              {/* Subtitle with Zen Kaku Gothic New */}
              <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground">
                クリエイティブポートフォリオ & ツール
              </h2>

              {/* Description with Noto Sans JP */}
              <p className="noto-sans-jp-light text-ratio-base max-w-3xl">
                映像制作、デザイン、プログラミングを中心とした創作活動と、
                インタラクティブなツールを提供しています。
                フロントエンドエンジニアsamuidoの個人サイト。
                自己紹介/作品ギャラリー/プラグイン配布/ツール
                など欲しいもの全部詰め込みました。
              </p>
            </header>

            {/* Category Navigation Cards - Responsive with Hover Effects */}
            <nav aria-label="Main navigation" className="pt-ratio-lg">
              <h3 className="sr-only">メインカテゴリ</h3>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4">
                <Link
                  href="/about"
                  className="group bg-base border border-primary p-ratio-sm hover:bg-primary hover:text-background transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  aria-describedby="about-description"
                >
                  <h3 className="neue-haas-grotesk-display text-ratio-base group-hover:scale-105 transition-transform">
                    About
                  </h3>
                  <p
                    id="about-description"
                    className="noto-sans-jp-light text-ratio-sm opacity-80 group-hover:opacity-100"
                  >
                    プロフィール・経歴・スキル
                  </p>
                </Link>

                <Link
                  href="/portfolio"
                  className="group bg-base border border-primary p-ratio-sm hover:bg-primary hover:text-background transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  aria-describedby="portfolio-description"
                >
                  <h3 className="neue-haas-grotesk-display text-ratio-base group-hover:scale-105 transition-transform">
                    Portfolio
                  </h3>
                  <p
                    id="portfolio-description"
                    className="noto-sans-jp-light text-ratio-sm opacity-80 group-hover:opacity-100"
                  >
                    作品集・開発・映像・デザイン
                  </p>
                </Link>

                <Link
                  href="/workshop"
                  className="group bg-base border border-primary p-ratio-sm hover:bg-primary hover:text-background transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  aria-describedby="workshop-description"
                >
                  <h3 className="neue-haas-grotesk-display text-ratio-base group-hover:scale-105 transition-transform">
                    Workshop
                  </h3>
                  <p
                    id="workshop-description"
                    className="noto-sans-jp-light text-ratio-sm opacity-80 group-hover:opacity-100"
                  >
                    ブログ・プラグイン・配布物
                  </p>
                </Link>

                <Link
                  href="/tools"
                  className="group bg-base border border-primary p-ratio-sm hover:bg-primary hover:text-background transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  aria-describedby="tools-description"
                >
                  <h3 className="neue-haas-grotesk-display text-ratio-base group-hover:scale-105 transition-transform">
                    Tools
                  </h3>
                  <p
                    id="tools-description"
                    className="noto-sans-jp-light text-ratio-sm opacity-80 group-hover:opacity-100"
                  >
                    インタラクティブツール集
                  </p>
                </Link>
              </div>
            </nav>

            {/* Global Function Cards - Responsive with Proper Routing */}
            <nav aria-label="Global functions" className="pt-ratio-base">
              <h3 className="sr-only">グローバル機能</h3>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3">
                <Link
                  href="/search"
                  className="group border border-foreground p-ratio-xs hover:bg-foreground hover:text-background transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className="noto-sans-jp-regular text-ratio-sm group-hover:font-medium transition-all">
                    Search
                  </span>
                </Link>

                <Link
                  href="/contact"
                  className="group border border-foreground p-ratio-xs hover:bg-foreground hover:text-background transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className="noto-sans-jp-regular text-ratio-sm group-hover:font-medium transition-all">
                    Contact
                  </span>
                </Link>

                <Link
                  href="/privacy-policy"
                  className="group border border-foreground p-ratio-xs hover:bg-foreground hover:text-background transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className="noto-sans-jp-regular text-ratio-sm group-hover:font-medium transition-all">
                    Privacy
                  </span>
                </Link>
              </div>
            </nav>

            {/* Latest Content Highlights */}
            <section className="pt-ratio-lg" aria-labelledby="latest-content">
              <h3
                id="latest-content"
                className="zen-kaku-gothic-new text-ratio-base text-foreground mb-ratio-sm"
              >
                最新コンテンツ
              </h3>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-3">
                {/* Portfolio Highlight */}
                <div className="border border-foreground p-ratio-xs">
                  <h4 className="neue-haas-grotesk-display text-ratio-sm text-primary mb-2">
                    Portfolio
                  </h4>
                  <p className="noto-sans-jp-light text-ratio-xs opacity-80">
                    最新の作品やプロジェクトを随時更新中
                  </p>
                </div>

                {/* Workshop Highlight */}
                <div className="border border-foreground p-ratio-xs">
                  <h4 className="neue-haas-grotesk-display text-ratio-sm text-primary mb-2">
                    Workshop
                  </h4>
                  <p className="noto-sans-jp-light text-ratio-xs opacity-80">
                    プラグインやブログ記事を定期的に公開
                  </p>
                </div>

                {/* Tools Highlight */}
                <div className="border border-foreground p-ratio-xs">
                  <h4 className="neue-haas-grotesk-display text-ratio-sm text-primary mb-2">
                    Tools
                  </h4>
                  <p className="noto-sans-jp-light text-ratio-xs opacity-80">
                    便利なWebツールを継続的に開発・追加
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer with Container System */}
      <footer className="border-t border-foreground py-ratio-base">
        <div className="container-system text-center">
          <p className="shippori-antique-b1-regular text-ratio-sm">
            © 2025 samuido - Creative Portfolio & Tools
          </p>
        </div>
      </footer>
    </div>
  );
}
