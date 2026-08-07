import { generateBaseMetadata } from "@/lib/seo/metadata";
import QRCodeGenerator from "./components/QRCodeGenerator";

export const metadata = generateBaseMetadata({
	path: "/tools/qr-generator",
	title: "QR Code Generator",
	description:
		"URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能付きツール",
	keywords: [
		"QRコード",
		"QR生成",
		"URL",
		"テキスト",
		"ダウンロード",
		"カスタマイズ",
	],
});

export default function QRGeneratorPage() {
	return (
		<>
			<QRCodeGenerator />

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
