"use client";

import { AlertTriangle, CheckCircle, Eye, EyeOff, Info, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	type AccessibilityReport,
	autoFixAccessibilityIssues,
	logAccessibilityReport,
	runAccessibilityAudit,
} from "@/lib/utils/accessibility-testing";

interface AccessibilityTesterProps {
	enabled?: boolean;
	autoRun?: boolean;
	showFloatingButton?: boolean;
}

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export const AccessibilityTester: React.FC<AccessibilityTesterProps> = ({
	enabled,
	autoRun = true,
	showFloatingButton = true,
}) => {
	const isEnabled = enabled !== undefined ? enabled : IS_DEVELOPMENT;
	const [isOpen, setIsOpen] = useState(false);
	const [report, setReport] = useState<AccessibilityReport | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [autoFixCount, setAutoFixCount] = useState(0);

	// Run accessibility audit
	const runAudit = async () => {
		setIsRunning(true);
		try {
			const newReport = await runAccessibilityAudit();
			setReport(newReport);
			logAccessibilityReport(newReport);
			setIsRunning(false);
		} catch (error) {
			console.error("Accessibility audit failed:", error);
			setIsRunning(false);
		}
	};

	// Auto-fix issues
	const runAutoFix = async () => {
		const violations = report?.issues || [];
		const result = await autoFixAccessibilityIssues(violations);
		setAutoFixCount(result.fixed || 0);

		// Re-run audit after fixes
		setTimeout(() => {
			runAudit();
		}, 500);
	};

	// Auto-run on mount and DOM changes
	useEffect(() => {
		if (!isEnabled || !autoRun) return;

		let timeoutId: NodeJS.Timeout;

		const runDelayedAudit = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(runAudit, 1000);
		};

		// Initial audit
		runDelayedAudit();

		// Monitor DOM changes
		const observer = new MutationObserver(runDelayedAudit);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [
				"class",
				"style",
				"aria-label",
				"aria-labelledby",
				"alt",
			],
		});

		return () => {
			clearTimeout(timeoutId);
			observer.disconnect();
		};
	}, [isEnabled, autoRun, runAudit]);

	if (!isEnabled) return null;

	const getIssueIcon = (type: string) => {
		switch (type) {
			case "error":
				return <AlertTriangle className="h-4 w-4 " />;
			case "warning":
				return <AlertTriangle className="h-4 w-4 " />;
			case "info":
				return <Info className="h-4 w-4 " />;
			default:
				return <Info className="h-4 w-4" />;
		}
	};

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "critical":
				return "  ";
			case "serious":
				return "  ";
			case "moderate":
				return "  ";
			case "minor":
				return "  ";
			default:
				return "  ";
		}
	};

	return (
		<>
			{/* Floating Button */}
			{showFloatingButton && (
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="fixed bottom-4 right-4 z-50 bg-accent p-3 rounded-full  hover:bg-accent/90   focus:ring-accent focus:ring-offset-2"
					aria-label="アクセシビリティテスターを開く"
					title="Accessibility Tester"
				>
					{isOpen ? (
						<EyeOff className="h-5 w-5" />
					) : (
						<Eye className="h-5 w-5" />
					)}
					{report?.summary && (report.summary.total || 0) > 0 && (
						<span className="absolute -top-2 -right-2   text-xs rounded-full h-6 w-6 flex items-center justify-center">
							{report.summary.total || 0}
						</span>
					)}
				</button>
			)}

			{/* Accessibility Panel */}
			{isOpen && (
				<div className="fixed bottom-20 right-4 z-50   rounded-lg w-96 max-h-96 overflow-hidden">
					<div className="flex items-center justify-between p-4  ">
						<h3 className="font-semibold ">Accessibility Tester</h3>
						<div className="flex items-center space-x-2">
							<button
								type="button"
								onClick={runAudit}
								disabled={isRunning}
								className="px-3 py-1 text-sm bg-accent rounded hover:bg-accent/90 "
							>
								{isRunning ? "Running..." : "Run Audit"}
							</button>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className=" hover:text-accent"
								aria-label="閉じる"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					</div>

					<div className="p-4 overflow-y-auto max-h-80">
						{!report ? (
							<div className="text-center /60">
								<p>Click &quot;Run Audit&quot; to check accessibility</p>
							</div>
						) : (
							<div className="space-y-4">
								{/* Summary */}
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="   p-2 rounded">
										<div className=" font-medium">Violations</div>
										<div className=" text-lg">
											{report.summary.errors || 0}
										</div>
									</div>
									<div className="   p-2 rounded">
										<div className=" font-medium">Warnings</div>
										<div className=" text-lg">
											{report.summary.warnings || 0}
										</div>
									</div>
								</div>

								{/* Auto-fix button */}
								{(report.summary.total || 0) > 0 && (
									<div className="flex items-center justify-between">
										<button
											type="button"
											onClick={runAutoFix}
											className="px-3 py-1 text-sm   rounded "
										>
											Auto-fix Issues
										</button>
										{autoFixCount > 0 && (
											<span className="text-sm ">
												Fixed {autoFixCount} issues
											</span>
										)}
									</div>
								)}

								{/* Passed Checks */}
								{report.passedChecks.length > 0 && (
									<div className="   p-3 rounded">
										<div className="flex items-center space-x-2 mb-2">
											<CheckCircle className="h-4 w-4 " />
											<span className=" font-medium">
												Passed Checks
											</span>
										</div>
										<div className="text-sm ">
											{report.passedChecks.join(", ")}
										</div>
									</div>
								)}

								{/* Issues/Violations */}
								{(report.issues || []).length > 0 && (
									<div className="space-y-2">
										<h4 className="font-medium ">Issues:</h4>
										{(report.issues || [])
											.slice(0, 10)
											.map((issue, index: number) => {
												const issueKey = `${issue.rule}-${issue.message}-${index}`;
												return (
													<div
														key={issueKey}
														className={`p-3 rounded  text-sm ${getSeverityColor(issue.severity)}`}
													>
														<div className="flex items-start space-x-2">
															{getIssueIcon(issue.type)}
															<div className="flex-1">
																<div className="font-medium">{issue.rule}</div>
																<div className="mt-1">{issue.message}</div>
																<div className="mt-1 text-xs ">
																	Severity: {issue.severity}
																</div>
															</div>
														</div>
													</div>
												);
											})}
										{(report.issues || []).length > 10 && (
											<div className="text-sm /60 text-center">
												... and {(report.issues || []).length - 10} more issues
											</div>
										)}
									</div>
								)}

								{(report.issues || []).length === 0 && (
									<div className="   p-4 rounded text-center">
										<CheckCircle className="h-8 w-8  mx-auto mb-2" />
										<div className=" font-medium">
											No accessibility issues found!
										</div>
										<div className=" text-sm mt-1">
											Your page meets WCAG 2.1 AA standards
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default AccessibilityTester;
