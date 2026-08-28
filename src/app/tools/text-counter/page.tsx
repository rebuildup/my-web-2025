"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/text-counter/src"), {
	ssr: false,
});

export default function TextCounterPage() {
	return <App />;
}
