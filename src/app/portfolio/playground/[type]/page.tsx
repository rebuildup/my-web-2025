/**
 * Portfolio Playground Pages with Dynamic SEO Metadata
 * Generates optimized metadata for playground experiments
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
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
				<script type="application/ld+json">
					{JSON.stringify(structuredData)}
				</script>

				<div className="min-h-screen bg-base text-main">
					<main id="main-content" className="flex items-center py-10">
						<div className="container-system">
							<div className="space-y-10">
								{/* Breadcrumbs */}
								<Breadcrumbs
									items={[
										{ label: "Home", href: "/" },
										{ label: "Portfolio", href: "/portfolio" },
										{
											label: "Playground",
											href: "/portfolio/playground/design",
										},
										{ label: playgroundInfo.title, isCurrent: true },
									]}
									className="pt-4"
								/>

								{/* Header */}
								<header className="space-y-8">
									<div className="space-y-4">
										<h1 className="neue-haas-grotesk-display text-6xl text-main">
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
									<div className="bg-base border border-main p-8">
										<div className="text-center py-16">
											<h2 className="neue-haas-grotesk-display text-3xl text-main mb-4">
												{playgroundInfo.title} Experiments
											</h2>
											<p className="noto-sans-jp-light text-sm text-main mb-8">
												インタラクティブな実験とデモンストレーションをお楽しみください。
											</p>

											{/* Placeholder for actual playground content */}
											<div className="aspect-video bg-base border border-main flex items-center justify-center">
												<div className="text-center">
													<div className="text-4xl mb-4">🚧</div>
													<p className="noto-sans-jp-light text-sm text-main">
														{playgroundInfo.title} experiments coming soon...
													</p>
												</div>
											</div>
										</div>
									</div>
								</section>

								{/* Features */}
								<section>
									<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
										Features
									</h2>
									<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
										{playgroundInfo.features.map((feature, index) => (
											<div
												key={feature}
												className="bg-base border border-main p-4 space-y-2"
											>
												<div className="text-accent text-lg font-bold">
													{String(index + 1).padStart(2, "0")}
												</div>
												<h3 className="zen-kaku-gothic-new text-base text-main">
													{feature}
												</h3>
												<p className="noto-sans-jp-light text-sm text-main">
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
			<div className="min-h-screen bg-base text-main flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl text-main mb-4">Playground Error</h1>
					<p className="text-main">
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

	return playgroundMap[type] || playgroundMap.design;
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
