import Link from "next/link";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export const metadata = {
  title: "Workshop Analytics - samuido",
  description: "Workshop content analytics and performance metrics",
};

export default function WorkshopAnalyticsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            <header className="space-y-6">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link
                      href="/workshop"
                      className="noto-sans-jp-light text-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      Workshop
                    </Link>
                  </li>
                  <li className="text-foreground">/</li>
                  <li className="text-foreground">Analytics</li>
                </ol>
              </nav>
              <h1 className="neue-haas-grotesk-display text-4xl text-primary">
                Workshop Analytics
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                ワークショップコンテンツのパフォーマンス分析とユーザーエンゲージメント指標。
                <br />
                人気コンテンツ、ダウンロード統計、検索トレンドを確認できます。
              </p>
            </header>

            <AnalyticsDashboard />

            <nav aria-label="Site navigation">
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-6">
                <Link
                  href="/workshop"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className="noto-sans-jp-regular text-base leading-snug">
                    ← Workshop
                  </span>
                </Link>
                <Link
                  href="/"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className="noto-sans-jp-regular text-base leading-snug">
                    ← Home
                  </span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}
