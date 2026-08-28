import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Pi Memory Game | Tools - samuido",
	description:
		"円周率の桁を記憶して入力するゲーム.テンキーインターフェースで楽しく学習できます.",
	keywords: [
		"円周率",
		"記憶ゲーム",
		"数学",
		"学習",
		"テンキー",
		"Pi",
		"記憶力",
		"教育",
	],
	robots: "index, follow",
	openGraph: {
		title: "Pi Memory Game | Tools - samuido",
		description:
			"円周率の桁を記憶して入力するゲーム.テンキーインターフェースで楽しく学習できます.",
		type: "website",
		url: "https://yusuke-kim.com/tools/pi-game",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Pi Memory Game | Tools - samuido",
		description:
			"円周率の桁を記憶して入力するゲーム.テンキーインターフェースで楽しく学習できます.",
		creator: "@361do_sleep",
	},
	alternates: {
		canonical: "https://yusuke-kim.com/tools/pi-game",
	},
};

export default function PiGameLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
