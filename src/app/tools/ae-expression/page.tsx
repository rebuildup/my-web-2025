import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { generateBaseMetadata } from "@/lib/seo/metadata";
import AEExpressionTool from "./components/AEExpressionTool";

export const metadata = generateBaseMetadata({
	path: "/tools/ae-expression",
	title: "AE Expression",
	description:
		"AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定.アニメーション、エフェクト、変形などのエクスプレッションを一覧表示.",
	keywords: [
		"AfterEffects",
		"エクスプレッション",
		"アニメーション",
		"エフェクト",
		"Scratch",
		"ブロックUI",
	],
});

export default function AEExpressionPage() {
	notFound();
	return (
		<>
			<div className="relative min-h-screen ">
				<main className="relative z-10 min-h-screen py-10" tabIndex={-1}>
					<div className="container">
						<div className="mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
							<Breadcrumbs
								items={[
									{ label: "Home", href: "/" },
									{ label: "Tools", href: "/tools" },
									{ label: "After Effects Expression Helper", isCurrent: true },
								]}
								className="pt-4"
							/>

							<section className="space-y-6">
								<AEExpressionTool />
							</section>
						</div>
					</div>
				</main>
			</div>

			{/* Structured Data */}
			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebApplication",
					name: "AE Expression Tool",
					description:
						"AfterEffectsのエクスプレッションをScratch風ブロックUIで設定",
					url: "https://yusuke-kim.com/tools/ae-expression",
					applicationCategory: "DesignApplication",
					operatingSystem: "Web Browser",
					author: {
						"@type": "Person",
						name: "木村友亮",
						alternateName: "samuido",
					},
					offers: {
						"@type": "Offer",
						price: "0",
						priceCurrency: "JPY",
					},
				})}
			</script>
		</>
	);
}
