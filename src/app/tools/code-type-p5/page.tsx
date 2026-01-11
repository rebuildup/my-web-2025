"use client";

import dynamic from "next/dynamic";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const CodeTypeP5App = dynamic(() => import("./components/CodeTypeP5App"), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center min-h-screen bg-base text-main">
			<div className="text-center">
				<div className="text-2xl mb-4">読み込み中...</div>
				<div className="text-sm opacity-70">
					コードタイピングアニメーションを読み込み中...
				</div>
			</div>
		</div>
	),
});

export default function CodeTypeP5Page() {
	return (
		<div className="relative bg-base text-main">
			<div className="container-system">
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-4">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Tools", href: "/tools" },
							{ label: "Code Type p5", isCurrent: true },
						]}
					/>
					<header className="space-y-6 mt-6 mb-8">
						<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
							Code Type p5
						</h1>
						<p className="noto-sans-jp-light text-sm text-main/70 leading-relaxed max-w-2xl">
							p5.jsでコードタイピング風の映像素材を作るツール.コードのカスタマイズやPNGシーケンスのエクスポートが可能です.
						</p>
					</header>
				</div>
			</div>
			<CodeTypeP5App />
		</div>
	);
}
