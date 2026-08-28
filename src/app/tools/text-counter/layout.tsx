import type { Metadata } from "next";

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

	alternates: {
		canonical: "https://yusuke-kim.com/tools/text-counter",
	},
};

export default function TextCounterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
