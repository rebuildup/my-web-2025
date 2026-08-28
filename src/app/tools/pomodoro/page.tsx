"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/pomodoro/src"), {
	ssr: false,
});

export default function PomodoroPage() {
	return <App />;
}
