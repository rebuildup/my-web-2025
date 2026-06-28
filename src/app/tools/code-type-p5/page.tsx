"use client";

import dynamic from "next/dynamic";

const CodeTypeP5App = dynamic(() => import("./components/CodeTypeP5App"), {
	ssr: false,
});

export default function CodeTypeP5Page() {
	return <CodeTypeP5App />;
}
