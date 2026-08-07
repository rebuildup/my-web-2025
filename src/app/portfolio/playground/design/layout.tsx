import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateBaseMetadata({
	path: "/portfolio/playground/design",
	title: "Design",
	description: "デザインに関する実験的なプロジェクト.",
});

export default function DesignPlaygroundLayout({
	children,
}: {
	children: ReactNode;
}) {
	return <>{children}</>;
}
