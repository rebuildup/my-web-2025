import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import PiGame from "./components/PiGame";

export const metadata: Metadata = {
	title: "Pi Memory Game | Tools - samuido",
	description:
		"円周率の桁を記憶して入力するゲーム。テンキーインターフェースで楽しく学習できます。",
	keywords: [
		"円周率",
		"記憶ゲーム",
		"数学",
		"学習",
		"テンキー",
		"Pi",
		"記憶力",
		"教育",
	],
	robots: "index, follow",
	openGraph: {
		title: "Pi Memory Game | Tools - samuido",
		description:
			"円周率の桁を記憶して入力するゲーム。テンキーインターフェースで楽しく学習できます。",
		type: "website",
		url: "https://yusuke-kim.com/tools/pi-game",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Pi Memory Game | Tools - samuido",
		description:
			"円周率の桁を記憶して入力するゲーム。テンキーインターフェースで楽しく学習できます。",
		creator: "@361do_sleep",
	},
};

export default function PiGamePage() {
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
									{ label: "Tools", href: "/tools" },
									{ label: "Pi Memory Game", isCurrent: true },
								]}
							/>
						</div>
						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl text-main">
								Pi Memory Game
							</h1>
							<p className="noto-sans-jp-light text-sm max-w leading-loose">
								円周率の桁を記憶して入力するゲームです。
								<br />
								テンキーインターフェースで楽しく学習できます。
							</p>
						</header>

						<PiGame />
						<div className="max-w h-8" />
						<nav aria-label="Site navigation">
							<a
								href="/tools"
								className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
							>
								<span className="noto-sans-jp-regular text-base leading-snug">
									← Tools
								</span>
							</a>
						</nav>
					</div>
				</div>
			</main>
		</div>
	);
}
