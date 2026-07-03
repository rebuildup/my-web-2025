/**
 * Monitoring Dashboard Component (Development Only)
 * Displays error tracking and performance monitoring data
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
	type ErrorReport,
	getErrorStats,
	getErrors,
	getPerformanceIssues,
	type PerformanceIssue,
} from "@/lib/analytics/error-tracking";
import {
	getPerformanceSummary,
	type PerformanceAlert,
} from "@/lib/analytics/performance-monitoring";

interface MonitoringDashboardProps {
	className?: string;
}

interface ErrorStats {
	total: number;
	bySeverity: {
		low: number;
		medium: number;
		high: number;
		critical: number;
	};
	byCategory: {
		javascript: number;
		network: number;
		performance: number;
		user: number;
		system: number;
	};
	resolved: number;
	unresolved: number;
}

interface PerformanceSummary {
	metrics: unknown[];
	alerts: PerformanceAlert[];
	budgetStatus: Record<string, "pass" | "warning" | "fail">;
}

export function MonitoringDashboard({
	className = "",
}: MonitoringDashboardProps) {
	const [activeTab, setActiveTab] = useState<
		"errors" | "performance" | "alerts"
	>("errors");
	const [errors, setErrors] = useState<ErrorReport[]>([]);
	const [performanceIssues, setPerformanceIssues] = useState<
		PerformanceIssue[]
	>([]);
	const [errorStats, setErrorStats] = useState<ErrorStats>({
		total: 0,
		bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
		byCategory: {
			javascript: 0,
			network: 0,
			performance: 0,
			user: 0,
			system: 0,
		},
		resolved: 0,
		unresolved: 0,
	});
	const [performanceSummary, setPerformanceSummary] =
		useState<PerformanceSummary>({
			metrics: [],
			alerts: [],
			budgetStatus: {},
		});
	const [isLoading, setIsLoading] = useState(true);

	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			// Load client-side data
			const clientErrors = getErrors();
			const clientPerformanceIssues = getPerformanceIssues();
			const clientErrorStats = getErrorStats();
			const clientPerformanceSummary = getPerformanceSummary();

			setErrors(clientErrors);
			setPerformanceIssues(clientPerformanceIssues);
			setErrorStats(clientErrorStats);
			setPerformanceSummary(clientPerformanceSummary);

			// Load server-side data
			try {
				const [serverErrors, serverPerformance] = await Promise.all([
					fetch("/api/monitoring/errors").then((res) =>
						res.ok ? res.json() : null,
					),
					fetch("/api/monitoring/performance").then((res) =>
						res.ok ? res.json() : null,
					),
				]);

				if (serverErrors) {
					setErrors((prev) => [...prev, ...serverErrors.errors]);
				}

				if (serverPerformance) {
					setPerformanceSummary((prev) => ({
						...prev,
						serverMetrics: serverPerformance.metrics,
						serverStats: serverPerformance.stats,
					}));
				}
			} catch (serverError) {
				console.warn("Failed to load server monitoring data:", serverError);
			}
			setIsLoading(false);
		} catch (error) {
			console.error("Failed to load monitoring data:", error);
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (process.env.NODE_ENV !== "development") return;

		loadData();
		const interval = setInterval(loadData, 30000);
		return () => clearInterval(interval);
	}, [loadData]);

	const formatTimestamp = (timestamp: string) => {
		return new Date(timestamp).toLocaleString();
	};

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "critical":
				return " ";
			case "high":
				return " ";
			case "warning":
				return " ";
			case "medium":
				return " ";
			case "low":
				return " ";
			default:
				return " ";
		}
	};

	// Only show in development
	if (process.env.NODE_ENV !== "development") {
		return (
			<div className="p-4    rounded-lg">
				<p className="">
					Monitoring dashboard is only available in development mode.
				</p>
			</div>
		);
	}

	return (
		<div className={` rounded-lg   ${className}`}>
			{/* Header */}
			<div className="  p-4">
				<h2 className="text-xl font-semibold ">
					Monitoring Dashboard
				</h2>
				<p className="text-sm  mt-1">
					Real-time error tracking and performance monitoring
				</p>
			</div>

			{/* Tabs */}
			<div className=" ">
				<nav className="flex space-x-8 px-4" aria-label="Tabs">
					{[
						{ id: "errors", name: "Errors", count: errors.length },
						{
							id: "performance",
							name: "Performance",
							count: performanceIssues.length,
						},
						{
							id: "alerts",
							name: "Alerts",
							count: performanceSummary.alerts.length || 0,
						},
					].map((tab) => (
						<button
							type="button"
							key={tab.id}
							onClick={() =>
								setActiveTab(tab.id as "errors" | "performance" | "alerts")
							}
							className={`py-2 px-1  font-medium text-sm ${
								activeTab === tab.id
									? " "
									: "   "
							}`}
						>
							{tab.name}
							{tab.count > 0 && (
								<span className="ml-2   py-0.5 px-2 rounded-full text-xs">
									{tab.count}
								</span>
							)}
						</button>
					))}
				</nav>
			</div>

			{/* Content */}
			<div className="p-4">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8  "></div>
						<span className="ml-2 ">
							Loading monitoring data...
						</span>
					</div>
				) : (
					<>
						{/* Errors Tab */}
						{activeTab === "errors" && (
							<div>
								{/* Error Statistics */}
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
									<div className=" p-4 rounded-lg">
										<h3 className="text-sm font-medium ">
											Total Errors
										</h3>
										<p className="text-2xl font-bold ">
											{errorStats.total}
										</p>
									</div>
									<div className=" p-4 rounded-lg">
										<h3 className="text-sm font-medium ">
											Critical
										</h3>
										<p className="text-2xl font-bold ">
											{errorStats.bySeverity.critical}
										</p>
									</div>
									<div className=" p-4 rounded-lg">
										<h3 className="text-sm font-medium ">
											High
										</h3>
										<p className="text-2xl font-bold ">
											{errorStats.bySeverity.high}
										</p>
									</div>
									<div className=" p-4 rounded-lg">
										<h3 className="text-sm font-medium ">
											Resolved
										</h3>
										<p className="text-2xl font-bold ">
											{errorStats.resolved}
										</p>
									</div>
								</div>

								{/* Error List */}
								<div className="space-y-4">
									<h3 className="text-lg font-medium ">
										Recent Errors
									</h3>
									{errors.length === 0 ? (
										<p className=" text-center py-8">
											No errors recorded
										</p>
									) : (
										<div className="space-y-2">
											{errors.slice(0, 10).map((error, index) => (
												<div
													key={error.id || index}
													className="  rounded-lg p-4"
												>
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-2">
																<span
																	className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}
																>
																	{error.severity}
																</span>
																<span className="text-xs ">
																	{error.category}
																</span>
																<span className="text-xs ">
																	{formatTimestamp(error.timestamp)}
																</span>
															</div>
															<h4 className="font-medium  mb-1">
																{error.message}
															</h4>
															<p className="text-sm ">
																{error.url}
															</p>
															{error.stack && (
																<details className="mt-2">
																	<summary className="text-sm  cursor-pointer">
																		Stack trace
																	</summary>
																	<pre className="text-xs  mt-1  p-2 rounded overflow-x-auto">
																		{error.stack.substring(0, 500)}...
																	</pre>
																</details>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						)}

						{/* Performance Tab */}
						{activeTab === "performance" && (
							<div>
								{/* Performance Metrics */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
									{Object.entries(performanceSummary.budgetStatus).map(
										([metric, status]) => (
											<div
												key={metric}
												className={`p-4 rounded-lg ${
													status === "pass"
														? ""
														: status === "warning"
															? ""
															: ""
												}`}
											>
												<h3 className="text-sm font-medium ">
													{metric.toUpperCase()}
												</h3>
												<p
													className={`text-lg font-bold ${
														status === "pass"
															? ""
															: status === "warning"
																? ""
																: ""
													}`}
												>
													{status}
												</p>
											</div>
										),
									)}
								</div>

								{/* Performance Issues */}
								<div className="space-y-4">
									<h3 className="text-lg font-medium ">
										Performance Issues
									</h3>
									{performanceIssues.length === 0 ? (
										<p className=" text-center py-8">
											No performance issues detected
										</p>
									) : (
										<div className="space-y-2">
											{performanceIssues.slice(0, 10).map((issue, index) => (
												<div
													key={issue.id || index}
													className="  rounded-lg p-4"
												>
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-2">
																<span
																	className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}
																>
																	{issue.severity}
																</span>
																<span className="text-xs ">
																	{formatTimestamp(issue.timestamp)}
																</span>
															</div>
															<h4 className="font-medium  mb-1">
																{issue.type.toUpperCase()}: {issue.value}ms
																(threshold: {issue.threshold}ms)
															</h4>
															<p className="text-sm ">
																{issue.url}
															</p>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						)}

						{/* Alerts Tab */}
						{activeTab === "alerts" && (
							<div>
								<h3 className="text-lg font-medium  mb-4">
									System Alerts
								</h3>
								{performanceSummary.alerts.length === 0 ? (
									<p className=" text-center py-8">
										No active alerts
									</p>
								) : (
									<div className="space-y-2">
										{performanceSummary.alerts
											.slice(0, 10)
											.map((alert, index: number) => (
												<div
													key={alert.id || index}
													className="  rounded-lg p-4"
												>
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<div className="flex items-center space-x-2 mb-2">
																<span
																	className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}
																>
																	{alert.severity}
																</span>
																<span className="text-xs ">
																	{formatTimestamp(alert.timestamp)}
																</span>
															</div>
															<h4 className="font-medium  mb-1">
																{alert.metric}: {alert.value} (threshold:{" "}
																{alert.threshold})
															</h4>
															<p className="text-sm ">
																{alert.url}
															</p>
														</div>
													</div>
												</div>
											))}
									</div>
								)}
							</div>
						)}
					</>
				)}
			</div>

			{/* Footer */}
			<div className="  p-4 ">
				<div className="flex items-center justify-between text-sm ">
					<span>Last updated: {new Date().toLocaleTimeString()}</span>
					<button
						type="button"
						onClick={loadData}
						className=" "
					>
						Refresh
					</button>
				</div>
			</div>
		</div>
	);
}
