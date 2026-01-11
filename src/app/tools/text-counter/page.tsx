import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import TextCounterTool from "./components/TextCounterTool";

export const metadata: Metadata = {
	title: "Text Counter - samuido | 文字数カウンター",
	description:
		"テキストの文字数を詳細にカウント.総文字数、単語数、行数、文字種別など豊富な統計情報を提供.",
	keywords: [
		"文字数カウンター",
		"テキスト統計",
		"文字数",
		"単語数",
		"行数",
		"文字種別",
	],
	robots: "index, follow",
	openGraph: {
		title: "Text Counter - samuido | 文字数カウンター",
		description:
			"テキストの文字数を詳細にカウント.総文字数、単語数、行数、文字種別など豊富な統計情報を提供.",
		type: "website",
		url: "https://yusuke-kim.com/tools/text-counter",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Text Counter - samuido | 文字数カウンター",
		description:
			"テキストの文字数を詳細にカウント.総文字数、単語数、行数、文字種別など豊富な統計情報を提供.",
		creator: "@361do_sleep",
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: "Text Counter",
	description: "テキストの文字数を詳細にカウントするツール",
	url: "https://yusuke-kim.com/tools/text-counter",
	applicationCategory: "UtilityApplication",
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
};

export default function TextCounterPage() {
	return (
		<>
			<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
			<div className="relative min-h-screen bg-base text-main">
				<main className="relative z-10 min-h-screen py-10" tabIndex={-1}>
					<div className="container-system">
						<div className="mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
							<Breadcrumbs
								items={[
									{ label: "Home", href: "/" },
									{ label: "Tools", href: "/tools" },
									{ label: "Text Counter", isCurrent: true },
								]}
								className="pt-4"
							/>

							<header className="space-y-6">
								<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
									Text Counter
								</h1>
								<p className="noto-sans-jp-light text-sm text-main/70 leading-relaxed max-w-2xl">
									テキストの文字数を詳細にカウント.総文字数、単語数、行数、文字種別など豊富な統計情報を提供します.
								</p>
							</header>

							<section className="space-y-6">
								<TextCounterTool />
							</section>
						</div>
					</div>
				</main>
			</div>
		</>
	);
}
