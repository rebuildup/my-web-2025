import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import Link from "next/link";
import { notFound } from "next/navigation";

interface DownloadDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DownloadDetailPage({
  params,
}: DownloadDetailPageProps) {
  const { slug } = await params;

  // Mock download data - in real implementation, this would fetch from a database
  const downloads = [
    {
      id: "download-1",
      title: "React Component Library",
      description: "再利用可能なReactコンポーネントライブラリ",
      downloadUrl: "/downloads/react-components.zip",
      version: "1.0.0",
    },
    {
      id: "download-2",
      title: "CSS Animation Pack",
      description: "CSSアニメーションのサンプル集",
      downloadUrl: "/downloads/css-animations.zip",
      version: "2.1.0",
    },
  ];

  const download = downloads.find((item) => item.id === slug);

  if (!download) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Workshop", href: "/workshop" },
                  { label: "Downloads", href: "/workshop/downloads" },
                  { label: download.title, isCurrent: true },
                ]}
              />
            </div>
            <header className="space-y-12">
              <nav className="mb-6">
                <Link
                  href="/workshop/downloads"
                  className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  ← Downloads に戻る
                </Link>
              </nav>
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                {download.title}
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                {download.description}
              </p>
            </header>

            <section
              data-testid="download-detail"
              className="bg-base border border-foreground p-4 space-y-4"
            >
              <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                Download Details
              </h2>
              <p className="noto-sans-jp-light text-sm">
                Version: {download.version}
              </p>
              <a
                href={download.downloadUrl}
                className="inline-block bg-primary text-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                download
              >
                Download
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
