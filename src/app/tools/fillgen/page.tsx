import FillGenTool from "./components/FillGenTool";

export const metadata = {
	title: "穴埋めプリントジェネレーター - samuido",
	description:
		"テキストに穴埋めを挿入して、プレビュー / HTML / React コードを即座に生成.",
	robots: "index, follow",
	openGraph: {
		title: "穴埋めプリントジェネレーター - samuido",
		description:
			"テキストに穴埋めを挿入して、プレビュー / HTML / React コードを即座に生成.",
		type: "website",
		url: "https://yusuke-kim.com/tools/fillgen",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "穴埋めプリントジェネレーター - samuido",
		description:
			"テキストに穴埋めを挿入して、プレビュー / HTML / React コードを即座に生成.",
		creator: "@361do_sleep",
	},
};

export default function FillGenPage() {
	return <FillGenTool />;
}
