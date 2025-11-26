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
		<div className="relative min-h-screen bg-base text-main">
			<main className="relative z-10 min-h-screen py-10" tabIndex={-1}>
				<div className="container-system">
					<div className="mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Tools", href: "/tools" },
								{ label: "Pi Memory Game", isCurrent: true },
							]}
							className="pt-4"
						/>

						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
								Pi Memory Game
							</h1>
							<p className="noto-sans-jp-light text-sm text-main/70 leading-relaxed max-w-2xl">
								円周率の桁を記憶して入力するゲームです。
								<br />
								テンキーインターフェースで楽しく学習できます。
							</p>
						</header>

						<section className="space-y-6">
							<PiGame />
						</section>
					</div>
				</div>
			</main>
		</div>
	);
}
