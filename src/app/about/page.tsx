import type { Metadata } from "next";
import { getStaticPortfolioItems } from "@/lib/portfolio/static-portfolio";
import { generateBaseMetadata } from "@/lib/seo/metadata";
import AboutStitchClient from "./AboutStitchClient";

export const metadata: Metadata = generateBaseMetadata({
	title: "About",
	description:
		"フロントエンドエンジニアsamuidoの自己紹介ページ.スキル、経歴、制作実績、プロフィール情報を掲載しています.",
	path: "/about",
});

export default async function AboutPage() {
	const portfolioItems = await getStaticPortfolioItems(12);

	return (
		<main>
			<AboutStitchClient initialPortfolio={portfolioItems} />
		</main>
	);
}
