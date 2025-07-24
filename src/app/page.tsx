import Link from "next/link";

export default function Home() {
  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex items-center py-10">
        <div className="container-system">
          <div className="space-y-10">
            <header className="space-y-12">
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                samuido&apos;s website
              </h1>

              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                ようこそ！ このサイトはsamuidoの個人サイトです.
                <br />
                映像制作/デザイン/プログラミングを中心とした創作/開発の記録と、
                便利なツールたちを公開します.
              </p>
            </header>
            <nav aria-label="Main navigation">
              <h3 className="sr-only">メインカテゴリ</h3>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-8">
                <Link
                  href="/about"
                  className={CardStyle}
                  aria-describedby="about-description"
                >
                  <h3 className={Card_title}>About</h3>
                  <p id="about-description" className={Card_description}>
                    プロフィール・経歴・スキル
                  </p>
                </Link>

                <Link
                  href="/portfolio"
                  className={CardStyle}
                  aria-describedby="portfolio-description"
                >
                  <h3 className={Card_title}>Portfolio</h3>
                  <p id="portfolio-description" className={Card_description}>
                    作品集・開発・映像・デザイン
                  </p>
                </Link>

                <Link
                  href="/workshop"
                  className={CardStyle}
                  aria-describedby="workshop-description"
                >
                  <h3 className={Card_title}>Workshop</h3>
                  <p id="workshop-description" className={Card_description}>
                    ブログ・プラグイン・配布物
                  </p>
                </Link>

                <Link
                  href="/tools"
                  className={CardStyle}
                  aria-describedby="tools-description"
                >
                  <h3 className={Card_title}>Tools</h3>
                  <p id="tools-description" className={Card_description}>
                    インタラクティブツール集
                  </p>
                </Link>
              </div>
            </nav>

            <nav aria-label="Global functions">
              <h3 className="sr-only">グローバル機能</h3>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <Link
                  href="/search"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Search</span>
                </Link>

                <Link
                  href="/contact"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Contact</span>
                </Link>

                <Link
                  href="/privacy-policy"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Privacy</span>
                </Link>
              </div>
            </nav>

            <footer className="pt-4 border-t border-foreground">
              <div className="text-center ">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - Creative Portfolio & Tools
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
