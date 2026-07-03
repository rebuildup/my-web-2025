"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("./src/App"), {
	loading: () => (
		<div className="flex h-screen items-center justify-center">
			<div className="animate-spin h-8 w-8  border-t-transparent rounded-full" />
		</div>
	),
	ssr: false,
});

export default function ProtoTypePage() {
	return <App />;
}
