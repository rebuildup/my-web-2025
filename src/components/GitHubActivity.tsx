/**
 * GitHub Activity Display Component
 * Fetches and displays recent GitHub activity
 */
"use client";

import { Github, Loader2 } from "lucide-react";
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

interface GitHubData {
	user: GitHubUser | null;
	events: FormattedEvent[];
}

export default function GitHubActivity() {
	const [data, setData] = useState<GitHubData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

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

	if (loading) {
		return (
			<div className="mt-8 w-full sm:w-max sm:min-w-[400px] space-y-3">
				<div className="flex items-center gap-2 text-main/40 text-sm">
					<Loader2 className="w-4 h-4 animate-spin" />
					<span>Loading GitHub activity...</span>
				</div>
			</div>
		);
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

	return (
		<div className="mt-8 w-full sm:w-max sm:min-w-[400px] space-y-4">
			{/* GitHub Profile Link */}
			<a
				href={data.user.html_url}
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center gap-3 text-main/60 hover:text-main transition-colors group"
			>
				<Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
				<div className="flex items-center gap-3">
					<span className="text-sm font-medium">{data.user.login}</span>
					<span className="text-xs text-main/40">
						{data.user.public_repos} repos · {data.user.followers} followers
					</span>
				</div>
			</a>

			{/* Recent Activity */}
			{data.events.length > 0 && (
				<div className="space-y-2">
					{data.events.slice(0, 3).map((event) => (
						<a
							key={event.id}
							href={event.link}
							target="_blank"
							rel="noopener noreferrer"
							className="block p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/30 transition-all duration-300 group"
						>
							<div className="flex items-start gap-3">
								<span className="text-lg">{event.icon}</span>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-main/70 leading-relaxed line-clamp-2">
										{event.message}
									</p>
									<span className="text-xs text-main/40 mt-1 block">
										{formatTimestamp(event.timestamp)}
									</span>
								</div>
							</div>
						</a>
					))}
				</div>
			)}
		</div>
	);
}
