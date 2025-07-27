import { notFound } from "next/navigation";

interface PortfolioDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { slug } = await params;

  // Mock portfolio data - in real implementation, this would fetch from a database
  const portfolioItems = [
    {
      id: "project-1",
      title: "Interactive Portfolio Website",
      description: "Next.js 15とTailwind CSSを使用したポートフォリオサイト",
      category: "develop",
    },
    {
      id: "project-2",
      title: "Music Video Animation",
      description: "After Effectsを使用したリリックモーション制作",
      category: "video",
    },
    {
      id: "project-3",
      title: "Unity Game Prototype",
      description: "2Dアクションゲームのプロトタイプ開発",
      category: "develop",
    },
  ];

  const item = portfolioItems.find((item) => item.id === slug);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            <header className="space-y-12">
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                {item.title}
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                {item.description}
              </p>
            </header>

            <section
              data-testid="portfolio-detail"
              className="bg-base border border-foreground p-4 space-y-4"
            >
              <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                Project Details
              </h2>
              <p className="noto-sans-jp-light text-sm">
                This is a detailed view of the portfolio item.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
