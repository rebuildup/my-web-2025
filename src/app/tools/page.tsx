import Link from "next/link";
import DarkVeil from "@/components/DarkVeil";

export default function ToolsPage() {
	return (
		<div className="min-h-screen relative">
			<div id="main-content" className="absolute inset-0">
				<div id="bg" className="fixed inset-0">
					<DarkVeil />
				</div>
			</div>

			<main
				id="main-content"
				className="relative z-10 flex min-h-screen items-center justify-center"
				tabIndex={-1}
			>
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-4xl sm:text-4xl font-bold italic tracking-tight text-main">
							整備中
						</h1>
						<p className="mt-4 text-xs sm:text-xs text-main/70">
							このページは現在準備中です。
						</p>
						<div className="mt-8">
							<Link
								href="/"
								className="text-xs sm:text-sm text-main/70 hover:text-main transition-colors underline underline-offset-4"
							>
								ホームに戻る
							</Link>
						</div>
					</div>
				</div>
			</main>

			<footer className="fixed bottom-2 left-0 right-0 z-10 flex items-center justify-center gap-4 py-3 backdrop-blur-sm">
				<span className="text-xs text-main">© 2025 361do_sleep</span>
				<Link
					href="/privacy-policy"
					className="text-xs transition underline underline-offset-4 text-main"
				>
					Privacy Policy
				</Link>
			</footer>
		</div>
	);
}
