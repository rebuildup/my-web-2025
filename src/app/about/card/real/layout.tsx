import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateBaseMetadata({
	path: "/about/card/real",
	title: "Real",
	description: "本名名義用のプロフィールカード情報.",
});

export default function PageLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
