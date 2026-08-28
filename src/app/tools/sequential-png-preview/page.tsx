"use client";

import dynamic from "next/dynamic";

const App = dynamic(
	() => import("../../../../external/sequential-png-preview/src"),
	{ ssr: false },
);

export default function SequentialPngPreviewPage() {
	return <App />;
}
