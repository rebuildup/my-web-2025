import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { generateBaseMetadata } from "@/lib/seo/metadata";
import BusinessMailBlockTool from "./components/BusinessMailBlockTool";

export const metadata = generateBaseMetadata({
	path: "/tools/business-mail-block",
	title: "Business Mail Block",
	description:
		"ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成.",
	keywords: [
		"ビジネスメール",
		"テンプレート",
		"Scratch",
		"ブロックUI",
		"メール作成",
		"ビジネス文書",
	],
});

export default function BusinessMailBlockPage() {
	notFound();
	return (
		<>
			<div className="relative min-h-screen ">
				<main className="relative z-10 min-h-screen py-10" tabIndex={-1}>
					<div className="mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Tools", href: "/tools" },
								{ label: "Business Mail Builder", isCurrent: true },
							]}
							className="pt-4"
						/>

						<section className="space-y-6">
							<BusinessMailBlockTool />
						</section>
					</div>
				</main>
			</div>

			{/* Structured Data */}
			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebApplication",
					name: "Business Mail Block Tool",
					description: "ビジネスメールをScratch風ブロックUIで作成",
					url: "https://yusuke-kim.com/tools/business-mail-block",
					applicationCategory: "BusinessApplication",
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
