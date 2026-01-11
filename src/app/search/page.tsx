import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPage from "./components/SearchPage";

export const metadata: Metadata = {
	title: "Search - samuido | サイト内検索",
	description:
		"samuidoのサイト内検索.プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます.",
	keywords: [
		"検索",
		"サイト内検索",
		"ポートフォリオ",
		"プロフィール",
		"ツール",
	],
	robots: "index, follow",
	alternates: {
		canonical: "https://yusuke-kim.com/search",
	},
	openGraph: {
		title: "Search - samuido | サイト内検索",
		description:
			"samuidoのサイト内検索.プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます.",
		type: "website",
		url: "https://yusuke-kim.com/search",
		images: [
			{
				url: "https://yusuke-kim.com/search-og-image.png",
				width: 1200,
				height: 630,
				alt: "Search - samuido | サイト内検索",
			},
		],
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Search - samuido | サイト内検索",
		description:
			"samuidoのサイト内検索.プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます.",
		images: ["https://yusuke-kim.com/search-twitter-image.jpg"],
		creator: "@361do_sleep",
	},
};

export default function Search() {
	return (
		<Suspense fallback={<SearchPageFallback />}>
			<SearchPage />
		</Suspense>
	);
}

function SearchPageFallback() {
	return (
		<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
			<main className="flex items-center py-10">
				<div className="container-system">
					<div className="space-y-10">
						<header className="space-y-12">
							<h1 className="neue-haas-grotesk-display text-6xl text-main">
								Search
							</h1>
							<p className="noto-sans-jp-light text-sm max-w leading-loose">
								サイト内のコンテンツを検索できます.
								<br />
								ポートフォリオ、ブログ、ツールなど、必要な情報を素早く見つけることができます.
							</p>
						</header>
						<div className="text-center py-16">
							<div className="inline-block w-8 h-8 border-2 border-main border-t-transparent rounded-full animate-spin"></div>
							<p className="mt-4 noto-sans-jp-light text-sm">読み込み中...</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
