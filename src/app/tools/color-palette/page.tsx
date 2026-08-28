"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/color-palette/src"), {
	ssr: false,
});

export default function ColorPalettePage() {
	return <App />;
}
