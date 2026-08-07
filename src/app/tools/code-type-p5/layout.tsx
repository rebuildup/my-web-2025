import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateBaseMetadata({
	path: "/tools/code-type-p5",
	title: "Code Type P5",
	description: "p5.jsでコードタイピング風の映像素材を作成.",
});

export default function PageLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
