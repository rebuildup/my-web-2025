"use client";

import dynamicImport from "next/dynamic";

const DarkVeil = dynamicImport(() => import("@/components/DarkVeil"), {
	ssr: false,
});

export default DarkVeil;
