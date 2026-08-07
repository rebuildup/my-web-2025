import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateBaseMetadata({
	path: "/about/commission/estimate",
	title: "Estimate",
	description: "制作依頼の見積もり例と料金目安.",
});

export default function PageLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
