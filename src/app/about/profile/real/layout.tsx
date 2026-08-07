import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateBaseMetadata({
	path: "/about/profile/real",
	title: "Real",
	description: "本名の詳細プロフィール.",
});

export default function PageLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
