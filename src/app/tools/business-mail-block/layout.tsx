import { generateBaseMetadata } from "@/lib/seo/metadata";

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

export default function BusinessMailBlockLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
