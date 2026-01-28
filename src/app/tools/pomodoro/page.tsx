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
