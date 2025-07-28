/**
 * Portfolio Playground Pages with Dynamic SEO Metadata
 * Generates optimized metadata for playground experiments
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";

interface PlaygroundPageProps {
  params: Promise<{
    type: string;
  }>;
}

// Valid playground types
const validTypes = ["design", "WebGL"];

/**
 * Generate dynamic metadata for playground pages
 */
export async function generateMetadata({
  params,
}: PlaygroundPageProps): Promise<Metadata> {
  try {
    const { type } = await params;

    // Validate type
    if (!validTypes.includes(type)) {
      return {
        title: "Playground Not Found | Portfolio | samuido",
        description: "The requested playground type was not found.",
        robots: "noindex, nofollow",
      };
    }

    // Generate metadata using SEO metadata generator
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { metadata } = await seoGenerator.generatePlaygroundMetadata(type);

    return metadata;
  } catch (error) {
    console.error(`Error generating playground metadata for ${params}:`, error);

    // Fallback metadata
    return {
      title: "Portfolio Playground | samuido",
      description: "Interactive experiments and creative playground",
      robots: "index, follow",
    };
  }
}

/**
 * Generate static params for all playground types
 */
export async function generateStaticParams() {
  return validTypes.map((type) => ({
    type,
  }));
}

/**
 * Playground page component with dynamic structured data
 */
export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { type } = await params;

  // Validate type
  if (!validTypes.includes(type)) {
    notFound();
  }

  try {
    // Generate structured data
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { structuredData } =
      await seoGenerator.generatePlaygroundMetadata(type);

    // Get playground info for display
    const playgroundInfo = getPlaygroundDisplayInfo(type);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <div className="min-h-screen bg-background text-foreground">
          <main
            id="main-content"
            role="main"
            className="flex items-center py-10"
          >
            <div className="container-system">
              <div className="space-y-10">
                {/* Header */}
                <header className="space-y-8">
                  <nav aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                      <li>
                        <Link
                          href="/"
                          className="text-foreground hover:text-accent"
                        >
                          Home
                        </Link>
                      </li>
                      <li className="text-foreground">/</li>
                      <li>
                        <Link
                          href="/portfolio"
                          className="text-foreground hover:text-accent"
                        >
                          Portfolio
                        </Link>
                      </li>
                      <li className="text-foreground">/</li>
                      <li>
                        <span className="text-foreground">Playground</span>
                      </li>
                      <li className="text-foreground">/</li>
                      <li className="text-accent">{playgroundInfo.title}</li>
                    </ol>
                  </nav>

                  <div className="space-y-4">
                    <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                      {playgroundInfo.title}
                    </h1>
                    <p className="noto-sans-jp-light text-sm max-w leading-loose">
                      {playgroundInfo.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {playgroundInfo.features.map((feature) => (
                        <span
                          key={feature}
                          className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </header>

                {/* Playground Content */}
                <section>
                  <div className="bg-base border border-foreground p-8">
                    <div className="text-center py-16">
                      <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-4">
                        {playgroundInfo.title} Experiments
                      </h2>
                      <p className="noto-sans-jp-light text-sm text-foreground mb-8">
                        インタラクティブな実験とデモンストレーションをお楽しみください。
                      </p>

                      {/* Placeholder for actual playground content */}
                      <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-4">🚧</div>
                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {playgroundInfo.title} experiments coming soon...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Features */}
                <section>
                  <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                    Features
                  </h2>
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
                    {playgroundInfo.features.map((feature, index) => (
                      <div
                        key={feature}
                        className="bg-base border border-foreground p-4 space-y-2"
                      >
                        <div className="text-accent text-lg font-bold">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <h3 className="zen-kaku-gothic-new text-base text-primary">
                          {feature}
                        </h3>
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          {getFeatureDescription(feature)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  } catch (error) {
    console.error(`Error rendering playground page for ${type}:`, error);

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-primary mb-4">Playground Error</h1>
          <p className="text-foreground">
            Sorry, there was an error loading the playground.
          </p>
        </div>
      </div>
    );
  }
}

/**
 * Get playground display information
 */
function getPlaygroundDisplayInfo(type: string) {
  const playgroundMap: Record<
    string,
    { title: string; description: string; features: string[] }
  > = {
    design: {
      title: "Design Experiments",
      description:
        "インタラクティブデザインとアニメーションの実験場。CSS、SVG、Canvasを使った視覚的表現の探求。",
      features: [
        "インタラクティブアニメーション",
        "CSS実験",
        "SVGアニメーション",
        "Canvas描画",
      ],
    },
    WebGL: {
      title: "WebGL Experiments",
      description:
        "Three.js・WebGPU実装とインタラクティブ体験。シェーダー、パーティクル、3Dグラフィックス。",
      features: [
        "3Dグラフィックス",
        "シェーダープログラミング",
        "パーティクルシステム",
        "インタラクティブ3D",
      ],
    },
  };

  return playgroundMap[type] || playgroundMap["design"];
}

/**
 * Get feature description
 */
function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    インタラクティブアニメーション:
      "マウスやタッチに反応する動的なアニメーション",
    CSS実験: "最新のCSS機能を使った視覚効果の実験",
    SVGアニメーション: "ベクターグラフィックスを使った滑らかなアニメーション",
    Canvas描画: "HTML5 Canvasを使ったリアルタイム描画",
    "3Dグラフィックス": "WebGLを使った立体的な視覚表現",
    シェーダープログラミング: "GPU上で動作するカスタムシェーダー",
    パーティクルシステム: "大量の粒子を使った動的な表現",
    インタラクティブ3D: "ユーザー操作に反応する3D体験",
  };

  return descriptions[feature] || "実験的な機能の実装";
}
