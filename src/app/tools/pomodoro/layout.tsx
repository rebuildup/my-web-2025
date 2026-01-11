import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Pomodoro Timer - samuido | ポモドーロタイマー",
	description:
		"進歩的なポモドーロタイマー.作業時間が段階的に延長されるサイクルで、集中力を高めながら効率的な作業時間管理を実現.",
	keywords: [
		"ポモドーロ",
		"タイマー",
		"時間管理",
		"集中力",
		"作業効率",
		"25分作業",
	],
	authors: [{ name: "samuido", url: "https://yusuke-kim.com/about" }],
	creator: "samuido",
	publisher: "samuido",
	robots: "index, follow",
	metadataBase: new URL("https://pomodoro.yusuke-kim.com"),
	alternates: {
		canonical: "https://pomodoro.yusuke-kim.com",
	},
	openGraph: {
		title: "Pomodoro Timer - samuido | ポモドーロタイマー",
		description:
			"シンプルなポモドーロタイマー.25分作業・5分休憩のサイクルで効率的な作業時間管理を実現.",
		type: "website",
		url: "https://pomodoro.yusuke-kim.com",
		siteName: "samuido",
		locale: "ja_JP",
		images: [
			{
				url: "https://yusuke-kim.com/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "Pomodoro Timer - samuido",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Pomodoro Timer - samuido | ポモドーロタイマー",
		description:
			"シンプルなポモドーロタイマー.25分作業・5分休憩のサイクルで効率的な作業時間管理を実現.",
		creator: "@361do_sleep",
		images: ["https://yusuke-kim.com/images/twitter-image.jpg"],
	},
};

export default function PomodoroLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
