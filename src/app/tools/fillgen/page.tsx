"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/fillgen/src"), {
	ssr: false,
});

export default function FillgenPage() {
	return <App />;
}
