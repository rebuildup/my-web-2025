import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import ProtoTypeClient from "./components/ProtoTypeClient";

export const metadata: Metadata = {
	title: "ProtoType Typing Game | Tools - samuido",
	description:
		"PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。",
	keywords: [
		"タイピングゲーム",
		"PIXIjs",
		"WPM",
		"正確性",
		"スコア記録",
		"練習",
		"タイピング",
		"スキル向上",
	],
	robots: "index, follow",
	openGraph: {
		title: "ProtoType Typing Game | Tools - samuido",
		description:
			"PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。",
		type: "website",
		url: "https://yusuke-kim.com/tools/ProtoType",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "ProtoType Typing Game | Tools - samuido",
		description:
			"PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。",
		creator: "@361do_sleep",
	},
};

export default function ProtoTypePage() {
	return (
		<div
			className="min-h-screen"
			style={{
				backgroundColor: "var(--ProtoTypeMainBG, #000000)",
				color: "var(--ProtoTypeMainColor, #ffffff)",
			}}
		>
			<div className="container-system pt-10 pb-4">
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/" },
						{ label: "Tools", href: "/tools" },
						{ label: "ProtoType Typing Game", isCurrent: true },
					]}
				/>
			</div>
			<ProtoTypeClient />

			{/* Structured Data */}
			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebApplication",
					name: "ProtoType Typing Game",
					description: "PIXIjsを使用したタイピングゲーム",
					url: "https://yusuke-kim.com/tools/ProtoType",
					applicationCategory: "GameApplication",
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
					codeRepository: "https://github.com/rebuildup/ProtoType",
				})}
			</script>
		</div>
	);
}
