import type { Metadata } from "next";
import PomodoroTimer from "./components/PomodoroTimer";

export const metadata: Metadata = {
	title: "Pomodoro Timer - samuido | ポモドーロタイマー",
	description:
		"進歩的なポモドーロタイマー。作業時間が段階的に延長されるサイクルで、集中力を高めながら効率的な作業時間管理を実現。",
	keywords: [
		"ポモドーロ",
		"タイマー",
		"時間管理",
		"集中力",
		"作業効率",
		"25分作業",
	],
	robots: "index, follow",
	openGraph: {
		title: "Pomodoro Timer - samuido | ポモドーロタイマー",
		description:
			"シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。",
		type: "website",
		url: "https://yusuke-kim.com/tools/pomodoro",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Pomodoro Timer - samuido | ポモドーロタイマー",
		description:
			"シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。",
		creator: "@361do_sleep",
	},
};

export default function PomodoroPage() {
	return (
		<div className="relative w-full h-screen overflow-hidden">
			<PomodoroTimer />
		</div>
	);
}
