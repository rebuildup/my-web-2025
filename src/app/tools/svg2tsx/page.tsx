"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/svg2tsx/src"), {
	ssr: false,
});

export default function SVGToTSXPage() {
	return <App />;
}
