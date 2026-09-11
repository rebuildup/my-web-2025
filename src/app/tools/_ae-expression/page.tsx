"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../../../external/ae-expression/src"), {
	ssr: false,
});

export default function AeExpressionPage() {
	return <App />;
}
