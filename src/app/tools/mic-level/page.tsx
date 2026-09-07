"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/mic-level/src"), {
	ssr: false,
});

export default function MicLevelPage() {
	return <App />;
}
