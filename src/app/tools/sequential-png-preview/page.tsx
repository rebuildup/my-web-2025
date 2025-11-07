import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import SequentialPngPreview from "./components/SequentialPngPreview";

export const metadata: Metadata = {
	title: "Sequential PNG Preview - samuido | 連番PNGプレビュー",
	description:
		"連番PNGファイルをアニメーションとしてプレビュー。複数ファイル、フォルダ、ZIPファイルに対応。",
	keywords: [
		"連番PNG",
		"プレビュー",
		"アニメーション",
		"画像表示",
		"ZIP対応",
		"フォルダ対応",
	],
	robots: "index, follow",
	openGraph: {
		title: "Sequential PNG Preview - samuido | 連番PNGプレビュー",
		description:
			"連番PNGファイルをアニメーションとしてプレビュー。複数ファイル、フォルダ、ZIPファイルに対応。",
		type: "website",
		url: "https://yusuke-kim.com/tools/sequential-png-preview",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Sequential PNG Preview - samuido | 連番PNGプレビュー",
		description:
			"連番PNGファイルをアニメーションとしてプレビュー。複数ファイル、フォルダ、ZIPファイルに対応。",
		creator: "@361do_sleep",
	},
};

export default function SequentialPngPreviewPage() {
	return (
		<div className="relative min-h-screen bg-base text-main">
			<main className="relative z-10 min-h-screen py-10" tabIndex={-1}>
				<div className="container-system">
					<div className="mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Tools", href: "/tools" },
								{ label: "Sequential PNG Preview", isCurrent: true },
							]}
							className="pt-4"
						/>

						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
								Sequential PNG Preview
							</h1>
							<p className="noto-sans-jp-light text-sm text-main/70 leading-relaxed max-w-2xl">
								連番PNGファイルをアニメーションとしてプレビュー。複数ファイル、フォルダ、ZIPファイルに対応。
							</p>
						</header>

						<section className="space-y-6">
							<SequentialPngPreview />
						</section>
					</div>
				</div>
			</main>
		</div>
	);
}
