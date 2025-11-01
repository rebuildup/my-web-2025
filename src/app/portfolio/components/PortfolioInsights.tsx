"use client";

import {
	Clock,
	Download,
	Eye,
	Minus,
	Search,
	Star,
	Target,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface InsightData {
	metric: string;
	value: number;
	change: number;
	trend: "up" | "down" | "stable";
	period: string;
	description: string;
}

interface PortfolioInsightsProps {
	contentId?: string;
	timeframe?: "7d" | "30d" | "90d" | "all";
	className?: string;
}

export default function PortfolioInsights({
	contentId: _contentId,
	timeframe = "30d",
	className = "",
}: PortfolioInsightsProps) {
	const [insights, setInsights] = useState<InsightData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const generateInsights = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch analytics data
				const response = await fetch("/api/stats/analytics?detailed=true");
				if (!response.ok) {
					throw new Error("Failed to fetch analytics data");
				}

				const analytics = await response.json();

				// Generate insights based on the data
				const generatedInsights: InsightData[] = [];

				// Portfolio-specific insights
				const portfolioViews = analytics.engagement.topContent.filter(
					(item: { id: string; views: number }) =>
						item.id.startsWith("portfolio-"),
				);

				const portfolioDownloads = analytics.engagement.topDownloads.filter(
					(item: { id: string; downloads: number }) =>
						item.id.startsWith("portfolio-"),
				);

				// View insights
				if (portfolioViews.length > 0) {
					const totalPortfolioViews = portfolioViews.reduce(
						(sum: number, item: { id: string; views: number }) =>
							sum + item.views,
						0,
					);

					generatedInsights.push({
						metric: "ポートフォリオ閲覧数",
						value: totalPortfolioViews,
						change: Math.floor(Math.random() * 20) - 10, // Simulated change
						trend: totalPortfolioViews > 100 ? "up" : "stable",
						period: timeframe,
						description: `過去${timeframe}のポートフォリオ全体の閲覧数`,
					});

					// Top performing insight
					const topItem = portfolioViews[0];
					if (topItem) {
						generatedInsights.push({
							metric: "トップパフォーマー",
							value: topItem.views,
							change: Math.floor(Math.random() * 30),
							trend: "up",
							period: timeframe,
							description: `「${topItem.id
								.replace("portfolio-", "")
								.replace(/-/g, " ")}」が最も閲覧された作品です`,
						});
					}
				}

				// Download insights
				if (portfolioDownloads.length > 0) {
					const totalPortfolioDownloads = portfolioDownloads.reduce(
						(sum: number, item: { id: string; downloads: number }) =>
							sum + item.downloads,
						0,
					);

					generatedInsights.push({
						metric: "ポートフォリオDL数",
						value: totalPortfolioDownloads,
						change: Math.floor(Math.random() * 15) - 5,
						trend: totalPortfolioDownloads > 50 ? "up" : "stable",
						period: timeframe,
						description: `過去${timeframe}のポートフォリオからのダウンロード数`,
					});
				}

				// Engagement rate insight
				if (analytics.performance) {
					const engagementRate = analytics.performance.averageViewsPerContent;
					generatedInsights.push({
						metric: "エンゲージメント率",
						value: Math.round(engagementRate * 100) / 100,
						change: Math.floor(Math.random() * 10) - 5,
						trend: engagementRate > 10 ? "up" : "stable",
						period: timeframe,
						description: "ポートフォリオ項目あたりの平均閲覧数",
					});
				}

				// Search performance insight
				const portfolioSearches = analytics.engagement.topQueries.filter(
					(query: { query: string; count: number }) =>
						query.query.toLowerCase().includes("portfolio") ||
						query.query.toLowerCase().includes("work") ||
						query.query.toLowerCase().includes("project"),
				);

				if (portfolioSearches.length > 0) {
					const totalPortfolioSearches = portfolioSearches.reduce(
						(sum: number, query: { query: string; count: number }) =>
							sum + query.count,
						0,
					);

					generatedInsights.push({
						metric: "検索関心度",
						value: totalPortfolioSearches,
						change: Math.floor(Math.random() * 25) - 10,
						trend: totalPortfolioSearches > 20 ? "up" : "stable",
						period: timeframe,
						description: `過去${timeframe}のポートフォリオ関連検索数`,
					});
				}

				// Content type distribution insight
				const portfolioCount = analytics.content.byType.portfolio || 0;
				if (portfolioCount > 0) {
					generatedInsights.push({
						metric: "ポートフォリオ項目数",
						value: portfolioCount,
						change: 0, // Static for content count
						trend: "stable",
						period: "全期間",
						description: "公開済みポートフォリオ項目の総数",
					});
				}

				setInsights(generatedInsights);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};

		generateInsights();
	}, [timeframe]);

	const getTrendIcon = (trend: "up" | "down" | "stable") => {
		switch (trend) {
			case "up":
				return <TrendingUp className="w-4 h-4 text-accent" />;
			case "down":
				return <TrendingDown className="w-4 h-4 text-accent" />;
			default:
				return <Minus className="w-4 h-4 text-main" />;
		}
	};

	const getMetricIcon = (metric: string) => {
		if (metric.includes("閲覧")) {
			return <Eye className="w-5 h-5 text-accent" />;
		}
		if (metric.includes("ダウンロード") || metric.includes("DL")) {
			return <Download className="w-5 h-5 text-accent" />;
		}
		if (metric.includes("検索")) {
			return <Search className="w-5 h-5 text-accent" />;
		}
		if (metric.includes("エンゲージメント")) {
			return <Target className="w-5 h-5 text-accent" />;
		}
		if (metric.includes("トップ") || metric.includes("パフォーマー")) {
			return <Star className="w-5 h-5 text-accent" />;
		}
		return <Clock className="w-5 h-5 text-accent" />;
	};

	const getChangeColor = (change: number, trend: string) => {
		if (trend === "stable") return "text-main";
		return change >= 0 ? "text-accent" : "text-accent";
	};

	if (loading) {
		return (
			<div className={`space-y-4 ${className}`}>
				<div className="noto-sans-jp-light text-xs text-main">
					インサイトを生成中...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={`text-center py-8 ${className}`}>
				<div className="noto-sans-jp-regular text-sm text-accent mb-2">
					インサイトの読み込みに失敗しました
				</div>
				<div className="noto-sans-jp-light text-xs text-main">{error}</div>
			</div>
		);
	}

	if (insights.length === 0) {
		return (
			<div className={`text-center py-8 ${className}`}>
				<div className="noto-sans-jp-regular text-sm text-main mb-2">
					インサイトがありません
				</div>
				<div className="noto-sans-jp-light text-xs text-main">
					ポートフォリオのエンゲージメントが増えるとインサイトが表示されます
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex items-center justify-between mb-4">
				<h3 className="zen-kaku-gothic-new text-lg text-main">
					ポートフォリオインサイト
				</h3>
				<div className="noto-sans-jp-light text-xs text-main">
					過去 {timeframe}
				</div>
			</div>

			<div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-4">
				{insights.map((insight, index) => (
					<div
						key={index}
						className="bg-base border border-main p-4 hover:border-accent transition-colors"
					>
						<div className="flex items-start justify-between mb-3">
							<div className="flex items-center gap-2">
								{getMetricIcon(insight.metric)}
								<span className="noto-sans-jp-regular text-sm text-main">
									{insight.metric}
								</span>
							</div>
							<div className="flex items-center gap-1">
								{getTrendIcon(insight.trend)}
								{insight.change !== 0 && (
									<span
										className={`noto-sans-jp-regular text-xs ${getChangeColor(
											insight.change,
											insight.trend,
										)}`}
									>
										{insight.change > 0 ? "+" : ""}
										{insight.change}%
									</span>
								)}
							</div>
						</div>

						<div className="mb-2">
							<span className="neue-haas-grotesk-display text-2xl text-main">
								{insight.value.toLocaleString()}
							</span>
						</div>

						<p className="noto-sans-jp-light text-xs text-main mb-2">
							{insight.description}
						</p>

						<div className="noto-sans-jp-light text-xs text-accent">
							期間: {insight.period}
						</div>
					</div>
				))}
			</div>

			{/* Quick Actions */}
			<div className="bg-base border border-accent p-4">
				<h4 className="zen-kaku-gothic-new text-base text-main mb-2">
					💡 おすすめアクション
				</h4>
				<div className="space-y-1">
					<div className="noto-sans-jp-light text-xs text-main">
						• 人気作品をSNSでシェアしてさらなる露出を
					</div>
					<div className="noto-sans-jp-light text-xs text-main">
						• ダウンロード可能なコンテンツを増やしてエンゲージメント向上
					</div>
					<div className="noto-sans-jp-light text-xs text-main">
						• 検索されやすいキーワードで作品説明を最適化
					</div>
					<div className="noto-sans-jp-light text-xs text-main">
						• 人気カテゴリでより多くのコンテンツ制作を検討
					</div>
				</div>
			</div>
		</div>
	);
}
