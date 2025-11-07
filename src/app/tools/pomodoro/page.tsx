import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import PomodoroTimer from "./components/PomodoroTimer";

export const metadata: Metadata = {
	title: "Pomodoro Timer - samuido | ポモドーロタイマー",
	description:
		"シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。",
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
		<div className="relative min-h-screen bg-base text-main">
			<main className="relative z-10 min-h-screen py-10" tabIndex={-1}>
				<div className="container-system">
					<div className="mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Tools", href: "/tools" },
								{ label: "Pomodoro Timer", isCurrent: true },
							]}
							className="pt-4"
						/>

						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
								Pomodoro Timer
							</h1>
							<p className="noto-sans-jp-light text-sm text-main/70 leading-relaxed max-w-2xl">
								シンプルなポモドーロタイマー。25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。
							</p>
						</header>

						<section className="space-y-6">
							<PomodoroTimer />
						</section>
					</div>
				</div>
			</main>
		</div>
	);
}
