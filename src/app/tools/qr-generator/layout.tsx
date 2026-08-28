import { generateBaseMetadata } from "@/lib/seo/metadata";

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

export default function QrGeneratorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
