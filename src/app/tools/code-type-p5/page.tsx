"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/code-type-p5/src"), {
	ssr: false,
});

export default function CodeTypeP5Page() {
	return <App />;
}
