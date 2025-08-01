import { notFound } from "next/navigation";
import Link from "next/link";

interface PluginDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PluginDetailPage({
  params,
}: PluginDetailPageProps) {
  const { slug } = await params;

  // Mock plugin data - in real implementation, this would fetch from a database
  const plugins = [
    {
      id: "plugin-1",
      title: "VS Code Theme Extension",
      description: "カスタムVS Codeテーマ拡張機能",
      installUrl: "vscode:extension/samuido.custom-theme",
      version: "1.2.0",
    },
    {
      id: "plugin-2",
      title: "Figma Design System Plugin",
      description: "デザインシステム管理用Figmaプラグイン",
      installUrl: "https://figma.com/plugins/design-system",
      version: "3.0.1",
    },
  ];

  const plugin = plugins.find((item) => item.id === slug);

  if (!plugin) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            <header className="space-y-12">
              <nav className="mb-6">
                <Link
                  href="/workshop/plugins"
                  className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  ← Plugins に戻る
                </Link>
              </nav>
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                {plugin.title}
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                {plugin.description}
              </p>
            </header>

            <section
              data-testid="plugin-detail"
              className="bg-base border border-foreground p-4 space-y-4"
            >
              <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                Plugin Details
              </h2>
              <p className="noto-sans-jp-light text-sm">
                Version: {plugin.version}
              </p>
              <a
                href={plugin.installUrl}
                className="inline-block bg-primary text-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                target="_blank"
                rel="noopener noreferrer"
              >
                Install Plugin
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
