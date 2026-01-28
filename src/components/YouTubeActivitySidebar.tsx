/**
 * Floating YouTube Activity Sidebar
 * Displays recent YouTube video uploads from RSS feed
 */
"use client";

import { Clock, ExternalLink, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

interface YouTubeVideo {
	id: string;
	title: string;
	published: string;
	updated: string;
	thumbnail: string;
	description: string;
	url: string;
}

interface YouTubeData {
	channelTitle: string;
	videos: YouTubeVideo[];
}

export default function YouTubeActivitySidebar() {
	const [data, setData] = useState<YouTubeData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [visible, setVisible] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/youtube/activity");
				if (!res.ok) throw new Error("Failed to fetch");
				const json = await res.json();
				setData(json);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Show sidebar after scrolling past 100px
	useEffect(() => {
		const handleScroll = () => {
			setVisible(window.scrollY > 100);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (loading) {
		return null;
	}

	if (error || !data?.videos || data.videos.length === 0) {
		return null;
	}

	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${diffDays}d ago`;
	};

	return (
		<div
			className={`fixed left-4 top-24 z-40 transition-all duration-500 ease-out ${
				visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
			}`}
		>
			<div
				className={`bg-[#0a0a0a]/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden transition-all duration-300 ${
					collapsed ? "w-12" : "w-80"
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-white/10">
					{!collapsed && (
						<a
							href="https://www.youtube.com/@361do_sleep"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-main/60 hover:text-main transition-colors"
						>
							<Youtube className="w-4 h-4" />
							<span className="text-sm font-medium">YouTube</span>
						</a>
					)}
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						className="text-main/40 hover:text-main transition-colors p-1"
						aria-label={collapsed ? "Expand" : "Collapse"}
					>
						{collapsed ? (
							<Youtube className="w-4 h-4" />
						) : (
							<Youtube className="w-4 h-4" />
						)}
					</button>
				</div>

				{/* Content */}
				{!collapsed && (
					<div className="p-3 space-y-4 max-h-[70vh] overflow-y-auto">
						{/* Channel Title */}
						<div className="text-xs text-main/60">{data.channelTitle}</div>

						{/* Recent Videos */}
						<div className="space-y-2">
							<div className="text-xs text-main/30 font-medium">
								Recent Videos
							</div>
							{data.videos.map((video) => (
								<a
									key={video.id}
									href={video.url}
									target="_blank"
									rel="noopener noreferrer"
									className="block group"
								>
									<div className="relative rounded overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-200 bg-white/5">
										{/* Thumbnail */}
										<div className="relative aspect-video bg-black/50">
											{video.thumbnail ? (
												<img
													src={video.thumbnail}
													alt={video.title}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<Youtube className="w-8 h-8 text-main/30" />
												</div>
											)}
											{/* Play overlay */}
											<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
												<Youtube className="w-8 h-8 text-white drop-shadow-lg" />
											</div>
										</div>

										{/* Video Info */}
										<div className="p-2">
											<h3 className="text-xs text-main/80 font-medium line-clamp-2 leading-snug mb-1">
												{video.title}
											</h3>
											<div className="flex items-center gap-1 text-xs text-main/30">
												<Clock className="w-3 h-3" />
												<span>{formatTimestamp(video.published)}</span>
											</div>
										</div>
									</div>
								</a>
							))}
						</div>

						{/* Channel Link */}
						<a
							href="https://www.youtube.com/@361do_sleep"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-main/40 hover:text-main bg-white/5 hover:bg-white/10 rounded transition-colors"
						>
							<span>Visit Channel</span>
							<ExternalLink className="w-3 h-3" />
						</a>
					</div>
				)}
			</div>
		</div>
	);
}
