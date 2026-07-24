import { getStaticPortfolioItems } from "@/lib/portfolio/static-portfolio";
import AboutStitchClient from "./AboutStitchClient";

export default async function AboutPage() {
	const portfolioItems = await getStaticPortfolioItems(12);

	return (
		<main>
			<AboutStitchClient initialPortfolio={portfolioItems} />
		</main>
	);
}
