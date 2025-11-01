/**
 * Accessibility testing component for tools
 * Provides real-time accessibility validation and reporting
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToolAccessibility } from "@/hooks/useAccessibility";
import { AccessibilityTester } from "@/lib/accessibility";

interface AccessibilityTesterProps {
	targetSelector?: string;
	autoRun?: boolean;
	showResults?: boolean;
}

interface AccessibilityReport {
	timestamp: string;
	totalIssues: number;
	issues: Array<{
		type: "error" | "warning" | "info";
		message: string;
		element?: string;
		suggestion?: string;
	}>;
	score: number; // 0-100
}

export default function AccessibilityTestingComponent({
	targetSelector = "main",
	autoRun = false,
	showResults = false,
}: AccessibilityTesterProps) {
	const [report, setReport] = useState<AccessibilityReport | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [isVisible, setIsVisible] = useState(showResults);
	const { announce } = useToolAccessibility();
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const getSuggestion = useCallback((issue: string): string => {
		if (issue.includes("missing alt text")) {
			return "画像には適切なalt属性を追加してください";
		}
		if (issue.includes("missing label")) {
			return "フォーム要素にはlabel要素またはaria-label属性を追加してください";
		}
		if (issue.includes("skips levels")) {
			return "見出しレベルは順序立てて使用してください";
		}
		if (issue.includes("color contrast")) {
			return "WCAG AA基準（4.5:1）以上のコントラスト比を確保してください";
		}
		return "詳細については WCAG 2.1 ガイドラインを参照してください";
	}, []);

	const runCustomChecks = useCallback(async (element: HTMLElement) => {
		const issues: Array<{
			type: "error" | "warning" | "info";
			message: string;
			element?: string;
			suggestion?: string;
		}> = [];

		const focusableElements = element.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);

		if (focusableElements.length === 0) {
			issues.push({
				type: "warning",
				message: "フォーカス可能な要素が見つかりません",
				suggestion: "インタラクティブな要素にはtabindex属性を追加してください",
			});
		}

		const interactiveElements = element.querySelectorAll(
			"button, input, select, textarea",
		);
		interactiveElements.forEach((el, index) => {
			const hasLabel =
				el.getAttribute("aria-label") ||
				el.getAttribute("aria-labelledby") ||
				element.querySelector(`label[for="${el.id}"]`);

			if (!hasLabel) {
				issues.push({
					type: "error",
					message: `インタラクティブ要素 ${index + 1} にラベルがありません`,
					element: el.tagName.toLowerCase(),
					suggestion: "aria-label属性またはlabel要素を追加してください",
				});
			}
		});

		const buttons = element.querySelectorAll('button, [role="button"]');
		buttons.forEach((button, index) => {
			const rect = button.getBoundingClientRect();
			if (rect.width < 44 || rect.height < 44) {
				issues.push({
					type: "warning",
					message: `ボタン ${index + 1} のタッチターゲットサイズが小さすぎます (${Math.round(
						rect.width,
					)}x${Math.round(rect.height)}px)`,
					element: "button",
					suggestion: "最小44x44pxのタッチターゲットサイズを確保してください",
				});
			}
		});

		const textElements = element.querySelectorAll(
			"p, span, div, h1, h2, h3, h4, h5, h6, label",
		);
		let contrastIssues = 0;
		textElements.forEach((el) => {
			const styles = window.getComputedStyle(el);
			const color = styles.color;
			const backgroundColor = styles.backgroundColor;

			if (
				color === "rgb(128, 128, 128)" &&
				backgroundColor === "rgb(255, 255, 255)"
			) {
				contrastIssues++;
			}
		});

		if (contrastIssues > 0) {
			issues.push({
				type: "warning",
				message: `${contrastIssues}個の要素で色のコントラストが不十分な可能性があります`,
				suggestion:
					"WCAG AA基準（4.5:1）以上のコントラスト比を確保してください",
			});
		}

		const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6");
		let previousLevel = 0;
		headings.forEach((heading, index) => {
			const level = parseInt(heading.tagName.charAt(1), 10);
			if (level > previousLevel + 1) {
				issues.push({
					type: "error",
					message: `見出し ${index + 1} でレベルがスキップされています (h${previousLevel} → h${level})`,
					element: heading.tagName.toLowerCase(),
					suggestion: "見出しレベルは順序立てて使用してください",
				});
			}
			previousLevel = level;
		});

		const images = element.querySelectorAll("img");
		images.forEach((img, index) => {
			if (
				!img.alt &&
				!img.getAttribute("aria-label") &&
				!img.getAttribute("role")
			) {
				issues.push({
					type: "error",
					message: `画像 ${index + 1} にalt属性がありません`,
					element: "img",
					suggestion: "画像には適切なalt属性を追加してください",
				});
			}
		});

		return issues;
	}, []);

	// Run accessibility test
	const runTest = useCallback(async () => {
		setIsRunning(true);

		try {
			const targetElement = document.querySelector(
				targetSelector,
			) as HTMLElement;
			if (!targetElement) {
				throw new Error(`Target element not found: ${targetSelector}`);
			}

			// Run basic accessibility checks
			const basicIssues = AccessibilityTester.runBasicChecks(targetElement);

			// Additional custom checks
			const customIssues = await runCustomChecks(targetElement);

			// Combine all issues
			const allIssues = [
				...basicIssues.map((issue) => ({
					type: "error" as const,
					message: issue,
					suggestion: getSuggestion(issue),
				})),
				...customIssues,
			];

			// Calculate score (100 - (issues * 10), minimum 0)
			const score = Math.max(0, 100 - allIssues.length * 10);

			const newReport: AccessibilityReport = {
				timestamp: new Date().toISOString(),
				totalIssues: allIssues.length,
				issues: allIssues,
				score,
			};

			setReport(newReport);

			// Announce results
			announce(
				`アクセシビリティテスト完了。スコア: ${score}点、問題: ${allIssues.length}件`,
			);
		} catch (error) {
			console.error("Accessibility test failed:", error);
			announce("アクセシビリティテストでエラーが発生しました");
		} finally {
			setIsRunning(false);
		}
	}, [targetSelector, announce, getSuggestion, runCustomChecks]);

	// Custom accessibility checks

	// Auto-run test
	useEffect(() => {
		if (autoRun) {
			const timer = setTimeout(() => {
				runTest();
			}, 2000); // Wait for content to load

			return () => clearTimeout(timer);
		}
	}, [autoRun, runTest]);

	// Periodic testing
	useEffect(() => {
		if (autoRun) {
			intervalRef.current = setInterval(() => {
				runTest();
			}, 30000); // Run every 30 seconds

			return () => {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
			};
		}
	}, [autoRun, runTest]);

	if (!isVisible && !showResults) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-md">
			<div className="bg-base border border-main shadow-lg rounded-lg overflow-hidden">
				{/* Header */}
				<div className="bg-accent text-main p-3 flex justify-between items-center">
					<h3 className="neue-haas-grotesk-display text-sm font-medium">
						アクセシビリティテスト
					</h3>
					<div className="flex items-center space-x-2">
						<button
							type="button"
							onClick={runTest}
							disabled={isRunning}
							className="bg-base text-accent px-2 py-1 text-xs rounded hover:bg-opacity-90 disabled:opacity-50"
							aria-label="テストを実行"
						>
							{isRunning ? "実行中..." : "実行"}
						</button>
						<button
							type="button"
							onClick={() => setIsVisible(!isVisible)}
							className="bg-base text-accent px-2 py-1 text-xs rounded hover:bg-opacity-90"
							aria-label="パネルを閉じる"
						>
							×
						</button>
					</div>
				</div>

				{/* Results */}
				{isVisible && (
					<div className="p-3 max-h-96 overflow-y-auto">
						{report ? (
							<div className="space-y-3">
								{/* Score */}
								<div className="flex justify-between items-center">
									<span className="text-sm">スコア:</span>
									<span
										className={`text-lg font-bold ${
											report.score >= 80
												? "text-green-600"
												: report.score >= 60
													? "text-yellow-600"
													: "text-red-600"
										}`}
									>
										{report.score}/100
									</span>
								</div>

								{/* Issues count */}
								<div className="flex justify-between items-center">
									<span className="text-sm">問題数:</span>
									<span className="text-sm">{report.totalIssues}件</span>
								</div>

								{/* Issues list */}
								{report.issues.length > 0 && (
									<div className="space-y-2">
										<h4 className="text-sm font-medium">検出された問題:</h4>
										<div className="space-y-2 max-h-48 overflow-y-auto">
											{report.issues.map((issue, index) => (
												<div
													key={index}
													className={`p-2 rounded text-xs border-l-4 ${
														issue.type === "error"
															? "border-red-500 bg-red-50"
															: issue.type === "warning"
																? "border-yellow-500 bg-yellow-50"
																: "border-blue-500 bg-blue-50"
													}`}
												>
													<div className="font-medium">{issue.message}</div>
													{issue.suggestion && (
														<div className="mt-1 opacity-75">
															{issue.suggestion}
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{/* Timestamp */}
								<div className="text-xs opacity-50">
									最終実行:{" "}
									{new Date(report.timestamp).toLocaleTimeString("ja-JP")}
								</div>
							</div>
						) : (
							<div className="text-center py-4">
								<p className="text-sm text-main opacity-75">
									テストを実行してください
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export { AccessibilityTestingComponent };
