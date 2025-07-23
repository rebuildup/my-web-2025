export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Container System */}
      <main className="min-h-screen flex items-center">
        <div className="container-system">
          <div className="space-y-ratio-lg">
            {/* Main Heading with Neue Haas Grotesk Display */}
            <h1 className="neue-haas-grotesk-display text-ratio-xl text-primary">
              samuido
            </h1>

            {/* Subtitle with Zen Kaku Gothic New */}
            <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground">
              クリエイティブポートフォリオ & ツール
            </h2>

            {/* Description with Noto Sans JP */}
            <p className="noto-sans-jp-light text-ratio-base">
              映像制作、デザイン、プログラミングを中心とした創作活動と、
              インタラクティブなツールを提供しています。
            </p>

            {/* Navigation Grid - Responsive */}
            <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 pt-ratio-lg">
              <div className="bg-base border border-primary p-ratio-sm hover:bg-primary hover:text-background transition-colors cursor-pointer">
                <h3 className="neue-haas-grotesk-display text-ratio-base">
                  About
                </h3>
                <p className="noto-sans-jp-light text-ratio-sm">プロフィール</p>
              </div>

              <div className="bg-base border border-primary p-ratio-sm hover:bg-primary hover:text-background transition-colors cursor-pointer">
                <h3 className="neue-haas-grotesk-display text-ratio-base">
                  Portfolio
                </h3>
                <p className="noto-sans-jp-light text-ratio-sm">作品集</p>
              </div>

              <div className="bg-base border border-primary p-ratio-sm hover:bg-primary hover:text-background transition-colors cursor-pointer">
                <h3 className="neue-haas-grotesk-display text-ratio-base">
                  Workshop
                </h3>
                <p className="noto-sans-jp-light text-ratio-sm">
                  ブログ・配布物
                </p>
              </div>

              <div className="bg-base border border-primary p-ratio-sm hover:bg-primary hover:text-background transition-colors cursor-pointer">
                <h3 className="neue-haas-grotesk-display text-ratio-base">
                  Tools
                </h3>
                <p className="noto-sans-jp-light text-ratio-sm">
                  インタラクティブツール
                </p>
              </div>
            </div>

            {/* Global Functions - Responsive */}
            <div className="grid-system grid-1 xs:grid-3 sm:grid-3 pt-ratio-base">
              <div className="border border-foreground p-ratio-xs hover:bg-foreground hover:text-background transition-colors cursor-pointer text-center">
                <span className="noto-sans-jp-regular text-ratio-sm">
                  Search
                </span>
              </div>

              <div className="border border-foreground p-ratio-xs hover:bg-foreground hover:text-background transition-colors cursor-pointer text-center">
                <span className="noto-sans-jp-regular text-ratio-sm">
                  Contact
                </span>
              </div>

              <div className="border border-foreground p-ratio-xs hover:bg-foreground hover:text-background transition-colors cursor-pointer text-center">
                <span className="noto-sans-jp-regular text-ratio-sm">
                  Privacy
                </span>
              </div>
            </div>
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
