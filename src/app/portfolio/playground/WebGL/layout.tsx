import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateBaseMetadata({
	path: "/portfolio/playground/WebGL",
	title: "WebGL",
	description: "WebGLによる実験的なプロジェクト.",
});

export default function PageLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
