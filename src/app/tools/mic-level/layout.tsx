import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Mic Level Checker - samuido | OBS基準マイク入力音量チェッカー",
	description:
		"ブラウザだけで OBS 相当の dBFS メーターを表示し、5秒間の発話からゲインの上げ下げを判定するツール.音声は録音・送信されません.",
	keywords: [
		"マイク",
		"ゲイン",
		"dBFS",
		"OBS",
		"配信",
		"音量",
		"audio meter",
		"mic level",
	],
	authors: [{ name: "samuido", url: "https://yusuke-kim.com/about" }],
	creator: "samuido",
	publisher: "samuido",
	robots: "index, follow",
	metadataBase: new URL("https://yusuke-kim.com"),
	alternates: {
		canonical: "https://yusuke-kim.com/tools/mic-level",
	},
	openGraph: {
		title: "Mic Level Checker - samuido | OBS基準マイク入力音量チェッカー",
		description:
			"ブラウザだけで OBS 相当の dBFS メーターを表示し、5秒間の発話からゲインの上げ下げを判定するツール.",
		type: "website",
		url: "https://yusuke-kim.com/tools/mic-level",
		siteName: "samuido",
		locale: "ja_JP",
		images: [
			{
				url: "https://yusuke-kim.com/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "Mic Level Checker - samuido",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Mic Level Checker - samuido | OBS基準マイク入力音量チェッカー",
		description:
			"ブラウザだけで OBS 相当の dBFS メーターを表示し、5秒間の発話からゲインの上げ下げを判定するツール.",
		creator: "@361do_sleep",
		images: ["https://yusuke-kim.com/images/twitter-image.jpg"],
	},
};

export default function MicLevelLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
