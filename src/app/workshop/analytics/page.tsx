import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export const metadata = {
	title: "Workshop Analytics - samuido",
	description: "Workshop content analytics and performance metrics",
};

export default function WorkshopAnalyticsPage() {
	return (
		<div className="min-h-screen bg-base text-main">
			<main className="py-10">
				<div className="container-system">
					<div className="space-y-10">
						{/* Breadcrumbs */}
						<div className="mb-6">
							<Breadcrumbs
								items={[
									{ label: "Home", href: "/" },
									{ label: "Workshop", href: "/workshop" },
									{ label: "Analytics", isCurrent: true },
								]}
							/>
						</div>
						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl text-main">
								Workshop Analytics
							</h1>
							<p className="noto-sans-jp-light text-sm max-w leading-loose">
								ワークショップコンテンツのパフォーマンス分析とユーザーエンゲージメント指標。
								<br />
								人気コンテンツ、ダウンロード統計、検索トレンドを確認できます。
							</p>
						</header>

						<AnalyticsDashboard />

						<nav aria-label="Site navigation">
							<div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-6">
								<Link
									href="/workshop"
									className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className="noto-sans-jp-regular text-base leading-snug">
										← Workshop
									</span>
								</Link>
								<Link
									href="/"
									className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className="noto-sans-jp-regular text-base leading-snug">
										← Home
									</span>
								</Link>
							</div>
						</nav>
					</div>
				</div>
			</main>
		</div>
	);
}
