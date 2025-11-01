"use client";

import { useEffect, useState } from "react";

interface EngagementData {
	overview: {
		totalContent: number;
		totalViews: number;
		totalDownloads: number;
		averageViewsPerContent: number;
		averageDownloadsPerContent: number;
		lastUpdated: string;
	};
	content: {
		byType: Record<string, number>;
		byCategory: Record<string, number>;
		topPerforming: Array<{
			id: string;
			title: string;
			type: string;
			category: string;
			views: number;
			downloads: number;
		}>;
	};
	engagement: {
		popularTags: Array<{ tag: string; count: number }>;
		viewToDownloadRatio: number;
	};
	performance?: {
		mostViewedType: string;
		mostDownloadedCategory: string;
		engagementScore: number;
	};
}

interface EngagementMetricsProps {
	showDetailed?: boolean;
}

export default function EngagementMetrics({
	showDetailed = false,
}: EngagementMetricsProps) {
	const [engagement, setEngagement] = useState<EngagementData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Design system classes following root page patterns
	const CardStyle = "bg-base border border-main block p-4 space-y-4";
	const Stats_number = "neue-haas-grotesk-display text-2xl text-accent";
	const Stats_label = "noto-sans-jp-light text-xs";
	const Section_title = "neue-haas-grotesk-display text-2xl text-main mb-6";

	useEffect(() => {
		async function fetchEngagement() {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(
					`/api/stats/workshop?detailed=${showDetailed}`,
				);
				if (!response.ok) {
					throw new Error("Failed to fetch engagement data");
				}
				const data = await response.json();
				setEngagement(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchEngagement();
	}, [showDetailed]);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="bg-base border border-main p-6">
					<p className="noto-sans-jp-light text-sm text-center">
						エンゲージメントデータを読み込み中...
					</p>
				</div>
			</div>
		);
	}

	if (error || !engagement) {
		return (
			<div className="space-y-6">
				<div className="bg-base border border-main p-6">
					<p className="noto-sans-jp-light text-sm text-center text-accent">
						{error || "エンゲージメントデータの読み込みに失敗しました"}
					</p>
				</div>
			</div>
		);
	}

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "blog":
				return "ブログ";
			case "plugin":
				return "プラグイン";
			case "download":
				return "ダウンロード";
			default:
				return type;
		}
	};

	return (
		<div className="space-y-10">
			{/* Engagement Overview */}
			<section aria-labelledby="engagement-overview">
				<h2 id="engagement-overview" className={Section_title}>
					User Engagement Metrics
				</h2>
				<div className="grid-system grid-2 xs:grid-2 sm:grid-3 gap-6">
					<div className={`${CardStyle} text-center`}>
						<div className={Stats_number}>
							{engagement.overview.averageViewsPerContent}
						</div>
						<div className={Stats_label}>平均閲覧数/コンテンツ</div>
					</div>
					<div className={`${CardStyle} text-center`}>
						<div className={Stats_number}>
							{engagement.overview.averageDownloadsPerContent}
						</div>
						<div className={Stats_label}>平均DL数/コンテンツ</div>
					</div>
					<div className={`${CardStyle} text-center`}>
						<div className={Stats_number}>
							{engagement.engagement.viewToDownloadRatio}
						</div>
						<div className={Stats_label}>閲覧/DL比率</div>
					</div>
				</div>
			</section>

			{/* Content Type Performance */}
			<section aria-labelledby="content-performance">
				<h2 id="content-performance" className={Section_title}>
					Content Type Performance
				</h2>
				<div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
					{Object.entries(engagement.content.byType).map(([type, count]) => (
						<div key={type} className={`${CardStyle} text-center`}>
							<div className={Stats_number}>{count}</div>
							<div className={Stats_label}>{getTypeLabel(type)}</div>
						</div>
					))}
				</div>
			</section>

			{/* Popular Tags */}
			{engagement.engagement.popularTags.length > 0 && (
				<section aria-labelledby="popular-tags">
					<h2 id="popular-tags" className={Section_title}>
						Popular Tags
					</h2>
					<div className="bg-base border border-main p-4">
						<div className="flex flex-wrap gap-3">
							{engagement.engagement.popularTags.slice(0, 10).map((tagData) => (
								<div
									key={tagData.tag}
									className="flex items-center space-x-2 bg-base border border-main px-3 py-2"
								>
									<span className="noto-sans-jp-light text-sm">
										{tagData.tag}
									</span>
									<span className="text-xs text-accent">({tagData.count})</span>
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Top Performing Content */}
			{engagement.content.topPerforming.length > 0 && (
				<section aria-labelledby="top-performing">
					<h2 id="top-performing" className={Section_title}>
						Top Performing Content
					</h2>
					<div className="space-y-3">
						{engagement.content.topPerforming
							.slice(0, 5)
							.map((content, index) => (
								<div
									key={content.id}
									className="bg-base border border-main p-4"
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<span className="text-xs text-accent">
													#{index + 1}
												</span>
												<span className="text-xs text-accent uppercase">
													{content.type}
												</span>
												<span className="text-xs text-main">•</span>
												<span className="text-xs text-main">
													{content.category}
												</span>
											</div>
											<h3 className="neue-haas-grotesk-display text-lg text-main">
												{content.title}
											</h3>
										</div>
										<div className="flex flex-col items-end space-y-1">
											<span className="text-xs text-accent">
												{content.views} views
											</span>
											{content.downloads > 0 && (
												<span className="text-xs text-accent">
													{content.downloads} downloads
												</span>
											)}
										</div>
									</div>
								</div>
							))}
					</div>
				</section>
			)}

			{/* Performance Insights */}
			{showDetailed && engagement.performance && (
				<section aria-labelledby="performance-insights">
					<h2 id="performance-insights" className={Section_title}>
						Performance Insights
					</h2>
					<div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
						<div className={`${CardStyle} text-center`}>
							<div className={Stats_number}>
								{getTypeLabel(engagement.performance.mostViewedType)}
							</div>
							<div className={Stats_label}>最も閲覧されるタイプ</div>
						</div>
						<div className={`${CardStyle} text-center`}>
							<div className={Stats_number}>
								{engagement.performance.mostDownloadedCategory}
							</div>
							<div className={Stats_label}>最もDLされるカテゴリ</div>
						</div>
						<div className={`${CardStyle} text-center`}>
							<div className={Stats_number}>
								{engagement.performance.engagementScore}
							</div>
							<div className={Stats_label}>エンゲージメントスコア</div>
						</div>
					</div>
				</section>
			)}

			{/* Last Updated */}
			<div className="text-center">
				<p className="noto-sans-jp-light text-xs text-accent">
					Last updated:{" "}
					{new Date(engagement.overview.lastUpdated).toLocaleString("ja-JP")}
				</p>
			</div>
		</div>
	);
}
