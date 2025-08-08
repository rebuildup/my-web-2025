import Link from "next/link";
import { redirect } from "next/navigation";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

// System status check
function getSystemStatus() {
  return {
    environment: process.env.NODE_ENV || "unknown",
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

export default function AdminPage() {
  // Redirect if not in development environment
  if (!isDevelopment()) {
    if (typeof redirect === "function") {
      redirect("/");
    } else {
      // Fallback for test environment
      return <div>Access denied</div>;
    }
  }

  const systemStatus = getSystemStatus();

  // Design system classes matching root page
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
            {/* Header */}
            <header className="space-y-12">
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                Admin Dashboard
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                開発環境専用の管理パネルです.
                <br />
                コンテンツ管理・ファイル処理・システム監視などの機能を提供します.
              </p>
              <div className="inline-block border border-accent px-4 py-2">
                <span className="noto-sans-jp-regular text-sm text-accent">
                  Development Mode - {systemStatus.environment}
                </span>
              </div>
            </header>

            {/* System Status */}
            <section className="space-y-6">
              <h2 className="neue-haas-grotesk-display text-2xl text-primary">
                System Status
              </h2>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
                <div className="border border-foreground p-4 space-y-2">
                  <h3 className={Global_title}>Environment</h3>
                  <p className="noto-sans-jp-light text-sm text-accent">
                    {systemStatus.environment}
                  </p>
                </div>
                <div className="border border-foreground p-4 space-y-2">
                  <h3 className={Global_title}>Node.js</h3>
                  <p className="noto-sans-jp-light text-sm">
                    {systemStatus.nodeVersion}
                  </p>
                </div>
                <div className="border border-foreground p-4 space-y-2">
                  <h3 className={Global_title}>Uptime</h3>
                  <p className="noto-sans-jp-light text-sm">
                    {Math.floor(systemStatus.uptime / 60)}m{" "}
                    {Math.floor(systemStatus.uptime % 60)}s
                  </p>
                </div>
                <div className="border border-foreground p-4 space-y-2">
                  <h3 className={Global_title}>Status</h3>
                  <p className="noto-sans-jp-light text-sm text-accent">
                    Online
                  </p>
                </div>
              </div>
            </section>

            {/* Admin Functions */}
            <nav aria-label="Admin functions">
              <h2 className="neue-haas-grotesk-display text-2xl text-primary mb-6">
                Admin Functions
              </h2>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-8">
                {/* Data Manager */}
                <Link
                  href="/admin/data-manager"
                  className={CardStyle}
                  aria-describedby="data-manager-description"
                >
                  <h3 className={Card_title}>Data Manager</h3>
                  <p id="data-manager-description" className={Card_description}>
                    コンテンツデータ・ファイル・メディア管理
                  </p>
                  <div className="space-y-1 text-xs noto-sans-jp-light">
                    <p>• Portfolio, blog, plugin content</p>
                    <p>• File upload and organization</p>
                    <p>• Real-time preview and editing</p>
                  </div>
                </Link>

                {/* File Management */}
                <div
                  className="bg-base border border-foreground opacity-50 p-4 space-y-4"
                  aria-describedby="file-management-description"
                >
                  <h3 className={Card_title}>File Management</h3>
                  <p
                    id="file-management-description"
                    className={Card_description}
                  >
                    ファイルアップロード・処理・整理
                  </p>
                  <div className="space-y-1 text-xs noto-sans-jp-light">
                    <p>• Image processing with ffmpeg.wasm</p>
                    <p>• Automatic thumbnail generation</p>
                    <p>• File organization and backup</p>
                  </div>
                  <p className="text-xs noto-sans-jp-light text-accent">
                    Coming Soon
                  </p>
                </div>

                {/* OGP & Favicon Manager */}
                <div
                  className="bg-base border border-foreground opacity-50 p-4 space-y-4"
                  aria-describedby="ogp-favicon-description"
                >
                  <h3 className={Card_title}>OGP & Favicon</h3>
                  <p id="ogp-favicon-description" className={Card_description}>
                    ソーシャルメディア画像・サイトアイコン管理
                  </p>
                  <div className="space-y-1 text-xs noto-sans-jp-light">
                    <p>• Per-page OGP image management</p>
                    <p>• Favicon upload and replacement</p>
                    <p>• Social media optimization</p>
                  </div>
                  <p className="text-xs noto-sans-jp-light text-accent">
                    Coming Soon
                  </p>
                </div>

                {/* Content Processing */}
                <div
                  className="bg-base border border-foreground opacity-50 p-4 space-y-4"
                  aria-describedby="content-processing-description"
                >
                  <h3 className={Card_title}>Content Processing</h3>
                  <p
                    id="content-processing-description"
                    className={Card_description}
                  >
                    自動コンテンツ生成・最適化
                  </p>
                  <div className="space-y-1 text-xs noto-sans-jp-light">
                    <p>• Markdown generation from input</p>
                    <p>• JSON data structure updates</p>
                    <p>• Search index regeneration</p>
                  </div>
                  <p className="text-xs noto-sans-jp-light text-accent">
                    Coming Soon
                  </p>
                </div>

                {/* Analytics & Monitoring */}
                <Link
                  href="/admin/analytics"
                  className={CardStyle}
                  aria-describedby="analytics-description"
                >
                  <h3 className={Card_title}>Analytics</h3>
                  <p id="analytics-description" className={Card_description}>
                    サイト統計・パフォーマンス監視
                  </p>
                  <div className="space-y-1 text-xs noto-sans-jp-light">
                    <p>• Content performance metrics</p>
                    <p>• System health monitoring</p>
                    <p>• Audit logging and alerts</p>
                  </div>
                </Link>

                {/* System Tools */}
                <div
                  className="bg-base border border-foreground opacity-50 p-4 space-y-4"
                  aria-describedby="system-tools-description"
                >
                  <h3 className={Card_title}>System Tools</h3>
                  <p id="system-tools-description" className={Card_description}>
                    開発ユーティリティ・メンテナンス
                  </p>
                  <div className="space-y-1 text-xs noto-sans-jp-light">
                    <p>• Backup and restore functionality</p>
                    <p>• Cache management</p>
                    <p>• Development tools</p>
                  </div>
                  <p className="text-xs noto-sans-jp-light text-accent">
                    Coming Soon
                  </p>
                </div>
              </div>
            </nav>

            {/* Security Notice */}
            <section className="border border-accent p-6 space-y-4">
              <h2 className="neue-haas-grotesk-display text-xl text-accent">
                Security Notice
              </h2>
              <div className="space-y-3">
                <p className="noto-sans-jp-regular text-sm">
                  Development Environment Only
                </p>
                <div className="space-y-2 text-xs noto-sans-jp-light">
                  <p>
                    • This admin panel is only accessible in development mode
                  </p>
                  <p>• All operations are performed locally on your machine</p>
                  <p>
                    • No authentication is required in development environment
                  </p>
                  <p>
                    • Production builds will not include admin functionality
                  </p>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <nav aria-label="Global navigation">
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-6">
                <Link
                  href="/"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>← Back to Main Site</span>
                </Link>

                <div className="border border-foreground text-center p-4 flex items-center justify-center">
                  <span className="noto-sans-jp-light text-sm">
                    {new Date().toLocaleDateString()} • Development Mode
                  </span>
                </div>
              </div>
            </nav>

            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - Admin Dashboard
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
