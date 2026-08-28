import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "SVG to TSX Converter - samuido | SVG React変換",
	description:
		"SVG画像をReactコンポーネント（TSX）に変換.TypeScript対応で最適化されたコードを生成.",
	robots: "index, follow",
	openGraph: {
		title: "SVG to TSX Converter - samuido | SVG React変換",
		description:
			"SVG画像をReactコンポーネント（TSX）に変換.TypeScript対応で最適化されたコードを生成.",
		type: "website",
		url: "https://yusuke-kim.com/tools/svg2tsx",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "SVG to TSX Converter - samuido | SVG React変換",
		description:
			"SVG画像をReactコンポーネント（TSX）に変換.TypeScript対応で最適化されたコードを生成.",
		creator: "@361do_sleep",
	},

	alternates: {
		canonical: "https://yusuke-kim.com/tools/svg2tsx",
	},
};

export default function SVGToTSXLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
