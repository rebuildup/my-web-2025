/**
 * Floating GitHub Activity Sidebar
 * Appears on scroll from the right side, keeping main content clean
 */
"use client";

import { Calendar, GitFork, Github, Star, X } from "lucide-react";
import { useEffect, useState } from "react";

interface GitHubUser {
	login: string;
	name?: string;
	bio?: string;
	blog?: string;
	location?: string;
	avatar_url: string;
	followers: number;
	following: number;
	public_repos: number;
	company?: string;
	email?: string;
	hireable?: boolean;
	twitter_username?: string;
	created_at: string;
	updated_at: string;
	html_url: string;
}

interface FormattedEvent {
	id: string;
	type: string;
	message: string;
	icon: string;
	link: string;
	timestamp: string;
}

interface PinnedRepo {
	name: string;
	description?: string;
	language?: string;
	stars: number;
	forks: number;
	url: string;
}

interface GitHubData {
	user: GitHubUser | null;
	events: FormattedEvent[];
	pinnedRepos: PinnedRepo[];
	topRepos: PinnedRepo[];
	contributions: {
		total: number;
		year: number;
	};
}

export default function GitHubActivitySidebar() {
	const [data, setData] = useState<GitHubData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [visible, setVisible] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [tab, setTab] = useState<"activity" | "repos">("activity");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/github/activity");
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

	if (error || !data?.user) {
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

	const joinDate = new Date(data.user.created_at);
	const accountAge = `${joinDate.getFullYear()}年${joinDate.getMonth() + 1}月`;

	return (
		<div
			className={`fixed right-4 top-24 z-40 transition-all duration-500 ease-out ${
				visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
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
							href={data.user.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-main/60 hover:text-main transition-colors"
						>
							<Github className="w-4 h-4" />
							<span className="text-sm font-medium">{data.user.login}</span>
						</a>
					)}
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						className="text-main/40 hover:text-main transition-colors p-1"
						aria-label={collapsed ? "Expand" : "Collapse"}
					>
						{collapsed ? (
							<Github className="w-4 h-4" />
						) : (
							<X className="w-4 h-4" />
						)}
					</button>
				</div>

				{/* Content */}
				{!collapsed && (
					<div className="p-3 space-y-4 max-h-[70vh] overflow-y-auto">
						{/* Stats */}
						<div className="grid grid-cols-2 gap-2 text-xs">
							<div className="text-main/40">
								<div className="flex items-center gap-1">
									<Star className="w-3 h-3" />
									<span>{data.user.public_repos}</span>
								</div>
								<div>Repos</div>
							</div>
							<div className="text-main/40">
								<div className="flex items-center gap-1">
									<Github className="w-3 h-3" />
									<span>{data.user.followers}</span>
								</div>
								<div>Followers</div>
							</div>
						</div>

						{/* Account age */}
						<div className="text-xs text-main/40 flex items-center gap-1">
							<Calendar className="w-3 h-3" />
							<span>Since {accountAge}</span>
						</div>

						{/* Contributions */}
						{data.contributions.total > 0 && (
							<div className="text-xs">
								<div className="text-main/30 mb-1">
									{data.contributions.year} Contributions
								</div>
								<div className="text-main/60">
									{data.contributions.total} contributions
								</div>
							</div>
						)}

						{/* Tabs */}
						<div className="flex gap-2 border-b border-white/10">
							<button
								type="button"
								onClick={() => setTab("activity")}
								className={`text-xs px-2 py-1 transition-colors ${
									tab === "activity"
										? "text-main border-b border-main"
										: "text-main/40 hover:text-main/60"
								}`}
							>
								Activity
							</button>
							<button
								type="button"
								onClick={() => setTab("repos")}
								className={`text-xs px-2 py-1 transition-colors ${
									tab === "repos"
										? "text-main border-b border-main"
										: "text-main/40 hover:text-main/60"
								}`}
							>
								Repos
							</button>
						</div>

						{/* Tab Content */}
						{tab === "activity" && (
							<div className="space-y-2">
								<div className="text-xs text-main/30 font-medium">
									Recent Activity
								</div>
								{data.events.length > 0 ? (
									data.events.slice(0, 6).map((event) => (
										<a
											key={event.id}
											href={event.link}
											target="_blank"
											rel="noopener noreferrer"
											className="block p-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200"
										>
											<div className="flex items-start gap-2">
												<span className="text-sm mt-0.5">{event.icon}</span>
												<div className="flex-1 min-w-0">
													<p className="text-xs text-main/60 leading-snug line-clamp-2">
														{event.message}
													</p>
													<span className="text-xs text-main/30 mt-0.5 block">
														{formatTimestamp(event.timestamp)}
													</span>
												</div>
											</div>
										</a>
									))
								) : (
									<div className="text-xs text-main/40">No recent activity</div>
								)}
							</div>
						)}

						{tab === "repos" && (
							<div className="space-y-2">
								<div className="text-xs text-main/30 font-medium">
									Top Repositories
								</div>
								{data.topRepos.length > 0 ? (
									data.topRepos.slice(0, 5).map((repo) => (
										<a
											key={repo.name}
											href={repo.url}
											target="_blank"
											rel="noopener noreferrer"
											className="block p-2 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200"
										>
											<div className="flex items-center justify-between mb-1">
												<span className="text-xs font-medium text-main/80 line-clamp-1">
													{repo.name}
												</span>
												{repo.language && (
													<span className="text-xs text-main/40">
														{repo.language}
													</span>
												)}
											</div>
											<div className="flex items-center gap-3 text-xs text-main/40">
												<div className="flex items-center gap-1">
													<Star className="w-3 h-3" />
													<span>{repo.stars}</span>
												</div>
												<div className="flex items-center gap-1">
													<GitFork className="w-3 h-3" />
													<span>{repo.forks}</span>
												</div>
											</div>
										</a>
									))
								) : (
									<div className="text-xs text-main/40">No repositories</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
