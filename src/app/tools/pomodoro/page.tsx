import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/seo/metadata";
import PomodoroTimer from "./components/PomodoroTimer";

export default function PomodoroPage() {
	return (
		<>
			{/* Hidden h1 for SEO */}
			<h1 className="sr-only">ポモドーロタイマー - Pomodoro Timer</h1>
			<div className="relative w-full h-screen overflow-hidden">
				<PomodoroTimer />
			</div>
		</>
	);
}

export const metadata: Metadata = generateBaseMetadata({
	path: "/tools/pomodoro",
	title: "Pomodoro",
	description: "シンプルなポモドーロタイマー.",
});
