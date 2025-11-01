"use client";

import { useEffect } from "react";

export default function OfflinePageClient() {
	useEffect(() => {
		function updateConnectionStatus() {
			const status = document.getElementById("connection-status");
			if (status) {
				status.textContent = navigator.onLine ? "オンライン" : "オフライン";
				status.className = navigator.onLine ? "text-green-500" : "text-red-500";
			}
		}

		updateConnectionStatus();
		window.addEventListener("online", updateConnectionStatus);
		window.addEventListener("offline", updateConnectionStatus);

		// Auto-retry when connection is restored
		const handleOnline = () => {
			setTimeout(() => {
				window.location.href = "/";
			}, 1000);
		};

		window.addEventListener("online", handleOnline);

		return () => {
			window.removeEventListener("online", updateConnectionStatus);
			window.removeEventListener("offline", updateConnectionStatus);
			window.removeEventListener("online", handleOnline);
		};
	}, []);

	return (
		<div className="min-h-screen bg-base text-main flex items-center justify-center">
			<div className="container-system text-center">
				<div className="max-w-md mx-auto">
					{/* Offline icon */}
					<div className="mb-8">
						<svg
							className="w-24 h-24 mx-auto text-accent"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>オフライン</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
							/>
						</svg>
					</div>

					{/* Title */}
					<h1 className="neue-haas-grotesk-display text-4xl mb-6 text-accent">
						オフライン
					</h1>

					{/* Description */}
					<div className="space-y-4 mb-8 text-lg">
						<p>インターネット接続を確認してください。</p>
						<p className="text-sm text-gray-400">
							一部のツールはオフラインでも利用可能です。
						</p>
					</div>

					{/* Available offline tools */}
					<div className="mb-8">
						<h2 className="text-xl mb-4 zen-kaku-gothic-new">
							オフライン利用可能なツール
						</h2>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<a
								href="/tools/color-palette"
								className="p-3 border border-gray-600 rounded hover:border-accent transition-colors"
							>
								カラーパレット生成
							</a>
							<a
								href="/tools/text-counter"
								className="p-3 border border-gray-600 rounded hover:border-accent transition-colors"
							>
								文字数カウンター
							</a>
							<a
								href="/tools/svg2tsx"
								className="p-3 border border-gray-600 rounded hover:border-accent transition-colors"
							>
								SVG to TSX変換
							</a>
							<a
								href="/tools/pomodoro"
								className="p-3 border border-gray-600 rounded hover:border-accent transition-colors"
							>
								ポモドーロタイマー
							</a>
							<a
								href="/tools/pi-game"
								className="p-3 border border-gray-600 rounded hover:border-accent transition-colors"
							>
								円周率ゲーム
							</a>
							<a
								href="/tools/business-mail-block"
								className="p-3 border border-gray-600 rounded hover:border-accent transition-colors"
							>
								ビジネスメール作成
							</a>
						</div>
					</div>

					{/* Actions */}
					<div className="space-y-4">
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="w-full bg-accent text-white py-3 px-6 rounded hover:bg-blue-600 transition-colors"
						>
							再試行
						</button>

						<button
							type="button"
							onClick={() => {
								window.location.href = "/";
							}}
							className="block w-full border border-accent text-accent py-3 px-6 rounded hover:bg-accent hover:text-white transition-colors"
						>
							ホームに戻る
						</button>
					</div>

					{/* Connection status */}
					<div className="mt-8 text-xs text-gray-500">
						<p>
							接続状況: <span id="connection-status">確認中...</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
