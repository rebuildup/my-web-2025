"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToolAccessibility } from "@/hooks/useAccessibility";
import PerformanceOptimizer from "./PerformanceOptimizer";

interface ToolWrapperProps {
	children: React.ReactNode;
	toolName: string;
	description: string;
	category: string;
	keyboardShortcuts?: Array<{
		key: string;
		description: string;
	}>;
	showPerformanceInfo?: boolean;
	enableOptimizations?: boolean;
}

export default function ToolWrapper({
	children,
	toolName,
	description,
	category,
	keyboardShortcuts = [],
	showPerformanceInfo = false,
	enableOptimizations = true,
}: ToolWrapperProps) {
	const [showAccessibilityInfo, setShowAccessibilityInfo] = useState(false);
	const { containerRef, state, announce, runAccessibilityChecks } =
		useToolAccessibility();

	// Track tool usage
	useEffect(() => {
		const trackToolUsage = async () => {
			try {
				await fetch("/api/stats/view", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						contentId: `tool-${toolName.toLowerCase().replace(/\s+/g, "-")}`,
					}),
				});
			} catch (error) {
				console.error("Error tracking tool usage:", error);
			}
		};

		// Track usage after a short delay to ensure user is actually using the tool
		const timer = setTimeout(trackToolUsage, 3000);
		return () => clearTimeout(timer);
	}, [toolName]);

	// Announce tool loading
	useEffect(() => {
		announce(
			`${toolName}ツールが読み込まれました。キーボードショートカットが利用可能です。`,
		);
	}, [toolName, announce]);

	// Enhanced keyboard shortcuts handler with accessibility
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			// Only handle shortcuts when not in input fields
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement
			) {
				return;
			}

			// Handle accessibility info toggle
			if (event.key === "?" && event.shiftKey) {
				event.preventDefault();
				setShowAccessibilityInfo(!showAccessibilityInfo);
				announce(
					showAccessibilityInfo
						? "アクセシビリティ情報を非表示にしました"
						: "アクセシビリティ情報を表示しました",
				);
				return;
			}

			// Handle accessibility check
			if (event.key.toLowerCase() === "a" && event.ctrlKey) {
				event.preventDefault();
				const issues = runAccessibilityChecks();
				announce(
					`アクセシビリティチェック完了。${issues.length}個の問題が見つかりました。`,
				);
				return;
			}

			keyboardShortcuts.forEach((shortcut) => {
				if (event.key.toLowerCase() === shortcut.key.toLowerCase()) {
					event.preventDefault();
					// Announce shortcut activation
					announce(`${shortcut.description}を実行しました`);
					// Trigger custom event for tool-specific shortcuts
					const customEvent = new CustomEvent("toolShortcut", {
						detail: { key: shortcut.key, description: shortcut.description },
					});
					document.dispatchEvent(customEvent);
				}
			});

			// Global shortcuts
			if (event.key === "Escape") {
				// Focus back to main content
				const mainContent = document.querySelector("main");
				if (mainContent) {
					(mainContent as HTMLElement).focus();
					announce("メインコンテンツにフォーカスを移動しました");
				}
			}
		};

		document.addEventListener("keydown", handleKeyPress);
		return () => document.removeEventListener("keydown", handleKeyPress);
	}, [
		keyboardShortcuts,
		showAccessibilityInfo,
		announce,
		runAccessibilityChecks,
	]);

	return (
		<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
			<main className="py-10" tabIndex={-1} ref={containerRef}>
				<div className="container-system">
					<div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
						{/* Header */}
						<header className="space-y-6">
							<div className="space-y-4">
								<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
									{toolName}
								</h1>
								<p className="noto-sans-jp-light text-sm leading-loose max-w-2xl">
									{description}
								</p>

								<div className="flex flex-wrap gap-4 items-center">
									<span className="noto-sans-jp-light rounded-full bg-main/10 px-3 py-1 text-[0.75rem] text-main">
										{category}
									</span>
									<span className="noto-sans-jp-light text-xs text-main/60">
										オフライン対応・アクセシビリティ準拠
									</span>
								</div>
							</div>
						</header>

						{/* Enhanced Keyboard Shortcuts Help */}
						{keyboardShortcuts.length > 0 && (
							<section
								aria-labelledby="shortcuts-heading"
								className="rounded-2xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] p-6"
							>
								<h2
									id="shortcuts-heading"
									className="neue-haas-grotesk-display text-lg text-main mb-4"
								>
									Keyboard Shortcuts
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{keyboardShortcuts.map((shortcut, index) => (
										<div key={index} className="flex items-center space-x-2">
											<kbd
												className="text-xs rounded bg-main/10 px-2 py-1 min-w-[2rem] text-center text-main"
												aria-label={`キー ${shortcut.key}`}
											>
												{shortcut.key}
											</kbd>
											<span className="noto-sans-jp-light text-xs text-main/80">
												{shortcut.description}
											</span>
										</div>
									))}
									<div className="flex items-center space-x-2">
										<kbd
											className="text-xs rounded bg-main/10 px-2 py-1 min-w-[2rem] text-center text-main"
											aria-label="エスケープキー"
										>
											Esc
										</kbd>
										<span className="noto-sans-jp-light text-xs text-main/80">
											メインコンテンツにフォーカス
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<kbd
											className="text-xs rounded bg-main/10 px-2 py-1 min-w-[2rem] text-center text-main"
											aria-label="シフト + クエスチョンマーク"
										>
											?
										</kbd>
										<span className="noto-sans-jp-light text-xs text-main/80">
											アクセシビリティ情報表示
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<kbd
											className="text-xs rounded bg-main/10 px-2 py-1 min-w-[2rem] text-center text-main"
											aria-label="コントロール + A"
										>
											Ctrl+A
										</kbd>
										<span className="noto-sans-jp-light text-xs text-main/80">
											アクセシビリティチェック
										</span>
									</div>
								</div>
							</section>
						)}

						{/* Accessibility Information Panel */}
						{showAccessibilityInfo && (
							<section
								aria-labelledby="accessibility-info-heading"
								className="rounded-2xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] p-6"
							>
								<h2
									id="accessibility-info-heading"
									className="neue-haas-grotesk-display text-lg mb-4 text-main"
								>
									アクセシビリティ情報
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<h3 className="neue-haas-grotesk-display text-base text-main">
											現在の設定
										</h3>
										<ul className="noto-sans-jp-light text-sm space-y-1 text-main/80">
											<li>
												• モーション設定:{" "}
												{state.prefersReducedMotion ? "軽減" : "通常"}
											</li>
											<li>
												• テキストスケール:{" "}
												{Math.round(state.textScaling * 100)}%
											</li>
											<li>
												• ハイコントラスト:{" "}
												{state.highContrastMode ? "有効" : "無効"}
											</li>
											<li>
												• キーボード使用:{" "}
												{state.keyboardNavigation ? "検出" : "未検出"}
											</li>
										</ul>
									</div>
									<div className="space-y-2">
										<h3 className="neue-haas-grotesk-display text-base text-main">
											対応機能
										</h3>
										<ul className="noto-sans-jp-light text-sm space-y-1 text-main/80">
											<li>• スクリーンリーダー対応</li>
											<li>• キーボードナビゲーション</li>
											<li>• WCAG 2.1 AA準拠</li>
											<li>• 色覚多様性対応</li>
											<li>• タッチターゲット最適化</li>
										</ul>
									</div>
								</div>
								{state.accessibilityIssues.length > 0 && (
									<div className="mt-4 p-3 rounded-lg bg-main/5">
										<h4 className="neue-haas-grotesk-display text-sm mb-2 text-main">
											検出された問題:
										</h4>
										<ul className="noto-sans-jp-light text-xs space-y-1 text-main/70">
											{state.accessibilityIssues.map((issue, index) => (
												<li key={index}>• {issue}</li>
											))}
										</ul>
									</div>
								)}
								<button
									type="button"
									onClick={() => setShowAccessibilityInfo(false)}
									className="mt-4 rounded-lg bg-main/10 text-main px-3 py-1 hover:bg-main/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
									aria-label="アクセシビリティ情報を閉じる"
								>
									閉じる
								</button>
							</section>
						)}

						{/* Tool Content with Performance Optimization */}
						<PerformanceOptimizer
							toolName={toolName}
							showPerformanceInfo={showPerformanceInfo}
							enableOptimizations={enableOptimizations}
						>
							<div
								role="application"
								aria-label={`${toolName} tool`}
								className={`focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-base ${
									state.prefersReducedMotion
										? ""
										: "transition-all duration-200"
								}`}
							>
								<h2 className="sr-only">{toolName} Tool Interface</h2>
								{children}
							</div>
						</PerformanceOptimizer>

						{/* Navigation */}
						<nav aria-label="Site navigation">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								<Link
									href="/tools"
									className="rounded-2xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] text-center p-4 flex items-center justify-center transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className="noto-sans-jp-regular text-base leading-snug text-main">
										← Tools
									</span>
								</Link>
								<Link
									href="/"
									className="rounded-2xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] text-center p-4 flex items-center justify-center transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className="noto-sans-jp-regular text-base leading-snug text-main">
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
