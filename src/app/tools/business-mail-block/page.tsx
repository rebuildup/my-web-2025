import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import BusinessMailBlockTool from "./components/BusinessMailBlockTool";

export const metadata = {
	title: "Business Mail Block Tool",
	description:
		"ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成.",
	keywords:
		"ビジネスメール, テンプレート, Scratch, ブロックUI, メール作成, ビジネス文書",
	robots: "index, follow",
	canonical: "https://yusuke-kim.com/tools/business-mail-block",
	openGraph: {
		title: "Business Mail Block Tool - samuido | ビジネスメール作成",
		description:
			"ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成.",
		type: "website",
		url: "https://yusuke-kim.com/tools/business-mail-block",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Business Mail Block Tool - samuido | ビジネスメール作成",
		description:
			"ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成.",
		creator: "@361do_sleep",
	},
};

export default function BusinessMailBlockPage() {
	return (
		<>
			<div className="relative min-h-screen bg-base text-main">
				<main className="relative z-10 min-h-screen py-10" tabIndex={-1}>
					<div className="container-system">
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
