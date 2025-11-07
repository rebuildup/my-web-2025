import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import QRCodeGenerator from "./components/QRCodeGenerator";

export const metadata = {
	title: "QR Code Generator",
	description:
		"URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能付きツール",
	keywords: "QRコード, QR生成, URL, テキスト, ダウンロード, カスタマイズ",
	robots: "index, follow",
	canonical: "https://yusuke-kim.com/tools/qr-generator",
	openGraph: {
		title: "QR Code Generator - samuido | QRコード生成",
		description:
			"URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能付きツール",
		type: "website",
		url: "https://yusuke-kim.com/tools/qr-generator",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "QR Code Generator - samuido | QRコード生成",
		description:
			"URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能付きツール",
		creator: "@361do_sleep",
	},
};

export default function QRGeneratorPage() {
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
									{ label: "QR Code Generator", isCurrent: true },
								]}
								className="pt-4"
							/>

							<section className="space-y-6">
								<QRCodeGenerator />
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
					name: "QR Code Generator",
					description: "URL・テキストからQRコード生成",
					url: "https://yusuke-kim.com/tools/qr-generator",
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
				})}
			</script>
		</>
	);
}
