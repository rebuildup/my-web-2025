import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./index.css";
import "./styles/001_tab.css";
import "./styles/002_header.css";
import "./styles/004_game.css";
import "./styles/007_setting.css";
import "./styles/009_webglPopup.css";
import "./styles/010_colorpalette.css";
import "./styles/011_rankingtable.css";
import "./styles/012_footer.css";
import "./styles/013_BGAnim.css";
import "./styles/014_animation-setting.css";
import "./styles/015_RankingLoad.css";

export const metadata: Metadata = {
	title: "ProtoType - samuido | タイピングゲーム",
	description:
		"PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。プログラミング言語のコードでタイピング練習ができます。",
	keywords: [
		"タイピング",
		"タイピングゲーム",
		"WPM",
		"タイピング練習",
		"プログラミング",
		"コード",
		"PIXI.js",
	],
	authors: [{ name: "samuido", url: "https://yusuke-kim.com/about" }],
	creator: "samuido",
	publisher: "samuido",
	robots: "index, follow",
	metadataBase: new URL("https://prototype.yusuke-kim.com"),
	alternates: {
		canonical: "https://prototype.yusuke-kim.com",
	},
	openGraph: {
		title: "ProtoType - samuido | タイピングゲーム",
		description:
			"PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。",
		type: "website",
		url: "https://prototype.yusuke-kim.com",
		siteName: "samuido",
		locale: "ja_JP",
		images: [
			{
				url: "https://yusuke-kim.com/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "ProtoType - samuido",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "ProtoType - samuido | タイピングゲーム",
		description:
			"PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。",
		creator: "@361do_sleep",
		images: ["https://yusuke-kim.com/images/twitter-image.jpg"],
	},
};

export default function ProtoTypeLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
