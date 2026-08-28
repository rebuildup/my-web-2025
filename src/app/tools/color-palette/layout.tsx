import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata = generateBaseMetadata({
	path: "/tools/color-palette",
	title: "Color Palette",
	description:
		"色域を指定してランダムにカラーパレットを生成.デザインに活用できる美しい色の組み合わせを作成.",
	keywords: [
		"カラーパレット",
		"色生成",
		"デザイン",
		"ランダム色",
		"色域設定",
		"CSS変数",
	],
});

export default function ColorPaletteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
