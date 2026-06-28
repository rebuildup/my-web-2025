import type { Metadata } from "next";
import SequentialPngPreview from "./components/SequentialPngPreview";

export const metadata: Metadata = {
	title: "Sequential PNG Preview - samuido | 連番PNGプレビュー",
	description:
		"連番PNGファイルをアニメーションとしてプレビュー.複数ファイル、フォルダ、ZIPファイルに対応.",
	robots: "index, follow",
	openGraph: {
		title: "Sequential PNG Preview - samuido | 連番PNGプレビュー",
		description:
			"連番PNGファイルをアニメーションとしてプレビュー.複数ファイル、フォルダ、ZIPファイルに対応.",
		type: "website",
		url: "https://yusuke-kim.com/tools/sequential-png-preview",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Sequential PNG Preview - samuido | 連番PNGプレビュー",
		description:
			"連番PNGファイルをアニメーションとしてプレビュー.複数ファイル、フォルダ、ZIPファイルに対応.",
		creator: "@361do_sleep",
	},
};

export default function SequentialPngPreviewPage() {
	return <SequentialPngPreview />;
}
