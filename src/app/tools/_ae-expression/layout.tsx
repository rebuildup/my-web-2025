import { generateBaseMetadata } from "@/lib/seo/metadata";

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

export default function AeExpressionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
