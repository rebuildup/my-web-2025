"use client";

import dynamic from "next/dynamic";

const App = dynamic(
	() => import("../../../../external/business-mail-block/src"),
	{ ssr: false },
);

export default function BusinessMailBlockPage() {
	return <App />;
}
