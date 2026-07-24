/**
 * Playground Statistics Component
 * Displays statistics and insights about playground experiments
 * Task 1.3: プレイグラウンド共通機能の実装
 */

"use client";

import { BarChart3, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { playgroundManager } from "@/lib/playground/playground-manager";

export interface PlaygroundStatisticsProps {
	className?: string;
}

export function PlaygroundStatistics({
	className = "",
}: PlaygroundStatisticsProps) {
	const [stats, setStats] = useState<ReturnType<
		typeof playgroundManager.getStatistics
	> | null>(null);

	useEffect(() => {
		const statistics = playgroundManager.getStatistics();
		setStats(statistics);
	}, []);

	if (!stats) {
		return (
			<div className={`  p-4 ${className}`}>
				<div className="animate-pulse">
					<div className="h-4  rounded mb-2"></div>
					<div className="h-8  rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={`  ${className}`}>
			{/* Header */}
			<div className="p-4  ">
				<h3 className="zen-kaku-gothic-new text-lg flex items-center">
					<BarChart3 className="w-5 h-5 mr-2" />
					Playground Statistics
				</h3>
			</div>

			<div className="p-4 space-y-6">
				{/* Overview Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold ">{stats.totalExperiments}</div>
						<div className="text-sm ">Total Experiments</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold ">{stats.designExperiments}</div>
						<div className="text-sm ">Design</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold ">{stats.webglExperiments}</div>
						<div className="text-sm ">WebGL</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold ">{stats.requiresWebGL}</div>
						<div className="text-sm ">Requires WebGL</div>
					</div>
				</div>

				{/* Category Breakdown */}
				<div className="space-y-3">
					<h4 className="font-medium flex items-center">
						<TrendingUp className="w-4 h-4 mr-2" />
						By Category
					</h4>
					<div className="space-y-2">
						{Object.entries(stats.byCategory).map(([category, count]) => (
							<div key={category} className="flex items-center justify-between">
								<span className="text-sm capitalize">{category}</span>
								<div className="flex items-center space-x-2">
									<div className="w-20 h-2  rounded-full overflow-hidden">
										<div
											className="h-full "
											style={{
												width: `${(count / stats.totalExperiments) * 100}%`,
											}}
										/>
									</div>
									<span className="text-sm  font-medium w-6 text-right">
										{count}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Difficulty Breakdown */}
				<div className="space-y-3">
					<h4 className="font-medium flex items-center">
						<Zap className="w-4 h-4 mr-2" />
						By Difficulty
					</h4>
					<div className="space-y-2">
						{Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
							<div
								key={difficulty}
								className="flex items-center justify-between"
							>
								<span className="text-sm capitalize">{difficulty}</span>
								<div className="flex items-center space-x-2">
									<div className="w-20 h-2  rounded-full overflow-hidden">
										<div
											className={`h-full ${
												difficulty === "beginner"
													? ""
													: difficulty === "intermediate"
														? ""
														: ""
											}`}
											style={{
												width: `${(count / stats.totalExperiments) * 100}%`,
											}}
										/>
									</div>
									<span className="text-sm  font-medium w-6 text-right">
										{count}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* WebGL Requirements */}
				<div className="  p-3 rounded">
					<h4 className="font-medium mb-2">WebGL Requirements</h4>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className=" ">WebGL Required:</span>
							<span className="ml-2  font-medium">
								{stats.requiresWebGL} / {stats.totalExperiments}
							</span>
						</div>
						<div>
							<span className=" ">WebGL2 Required:</span>
							<span className="ml-2  font-medium">
								{stats.requiresWebGL2} / {stats.totalExperiments}
							</span>
						</div>
					</div>
					<div className="mt-2 text-xs ">
						{((stats.requiresWebGL / stats.totalExperiments) * 100).toFixed(1)}%
						of experiments require WebGL support
					</div>
				</div>

				{/* Technology Distribution */}
				<div className="space-y-3">
					<h4 className="font-medium ">Popular Technologies</h4>
					<div className="grid grid-cols-2 gap-2 text-sm">
						<div className="flex justify-between">
							<span className="">Three.js</span>
							<span className="">{stats.webglExperiments}</span>
						</div>
						<div className="flex justify-between">
							<span className="">Canvas</span>
							<span className="">{stats.byCategory.canvas || 0}</span>
						</div>
						<div className="flex justify-between">
							<span className="">SVG</span>
							<span className="">{stats.byCategory.svg || 0}</span>
						</div>
						<div className="flex justify-between">
							<span className="">CSS</span>
							<span className="">{stats.byCategory.css || 0}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
