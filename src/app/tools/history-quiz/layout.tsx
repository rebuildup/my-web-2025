import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateBaseMetadata({
	path: "/tools/history-quiz",
	title: "History Quiz",
	description: "歴史を穴埋め問題で学習するクイズ.",
});

export default function PageLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
