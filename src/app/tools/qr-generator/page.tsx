"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/qr-generator/src"), {
	ssr: false,
});

export default function QrGeneratorPage() {
	return <App />;
}
