"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/pi-game/src"), {
	ssr: false,
});

export default function PiGamePage() {
	return <App />;
}
