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
		<>
			<div className="container-system pt-10 pb-4">
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/" },
						{ label: "Tools", href: "/tools" },
						{ label: "Sequential PNG Preview", isCurrent: true },
					]}
				/>
			</div>
			<div className="container-system">
				<div className="space-y-8">
					<div className="text-center space-y-4">
						<h1 className="text-4xl font-bold text-main">
							Sequential PNG Preview
						</h1>
						<p className="text-lg text-main max-w-2xl mx-auto">
							連番PNGファイルをアニメーションとしてプレビュー。複数ファイル、フォルダ、ZIPファイルに対応。
						</p>
					</div>

					<SequentialPngPreview />
				</div>
			</div>
		</>
	);
}
