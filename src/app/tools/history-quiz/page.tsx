"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/history-quiz/src"), {
	ssr: false,
});

export default function HistoryQuizPage() {
	return <App />;
}
