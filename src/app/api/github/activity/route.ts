import { NextResponse } from "next/server";

const GITHUB_USERNAME = "rebuildup";
const CACHE_DURATION = 300; // 5 minutes

interface GitHubEvent {
	id: string;
	type: string;
	created_at: string;
	repo?: {
		name: string;
	};
	payload?: {
		commits?: Array<{ message?: string }>;
		issue?: { title?: string; number?: number };
		pull_request?: { title?: string; number?: number };
		release?: { tag_name?: string; name?: string };
	};
}

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
}

interface PinnedRepo {
	name: string;
	description?: string;
	language?: string;
	languageColor?: string;
	stars: number;
	forks: number;
	url: string;
}

interface Repository {
	name: string;
	description?: string;
	language?: string;
	stargazers_count: number;
	forks_count: number;
	updated_at: string;
	topics?: string[];
	fork?: boolean;
}

interface CachedData {
	user: GitHubUser;
	events: GitHubEvent[];
	pinnedRepos: PinnedRepo[];
	topRepos: PinnedRepo[];
	contributions: {
		total: number;
		year: number;
	};
	timestamp: number;
}

const cache = new Map<string, CachedData>();

async function fetchPinnedRepos(): Promise<PinnedRepo[]> {
	// GitHub GraphQL API for pinned repos
	// Fallback: fetch user repos and sort by stars
	const reposRes = await fetch(
		`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
		{ next: { revalidate: CACHE_DURATION } },
	);
	if (!reposRes.ok) return [];

	const repos: Repository[] = await reposRes.json();

	// Get top repos by stars
	return repos
		.filter((repo) => !repo.fork)
		.sort((a, b) => b.stargazers_count - a.stargazers_count)
		.slice(0, 6)
		.map((repo) => ({
			name: repo.name,
			description: repo.description,
			language: repo.language,
			stars: repo.stargazers_count,
			forks: repo.forks_count,
			url: `https://github.com/${GITHUB_USERNAME}/${repo.name}`,
		}));
}

async function fetchContributions(): Promise<{
	total: number;
	year: number;
}> {
	// Get contributions for current year
	const year = new Date().getFullYear();
	try {
		const res = await fetch(
			`https://api.github.com/search/issues?q=author:${GITHUB_USERNAME}+is:pr+is:merged&merged:>${year}-01-01&per_page=1`,
			{ next: { revalidate: CACHE_DURATION } },
		);
		if (res.ok) {
			const data = await res.json();
			return { total: data.total_count || 0, year };
		}
	} catch {
		// Fallback
	}

	// Fallback to event count
	const eventsRes = await fetch(
		`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=1`,
		{ next: { revalidate: CACHE_DURATION } },
	);
	if (eventsRes.ok) {
		const events: GitHubEvent[] = await eventsRes.json();
		// Estimate: roughly 30% of events are contributions
		return { total: Math.floor(events.length * 30), year };
	}

	return { total: 0, year };
}

async function fetchGitHubData() {
	// Check cache
	const cached = cache.get("default");
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 1000) {
		return cached;
	}

	// Fetch user data
	const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
		next: { revalidate: CACHE_DURATION },
	});
	if (!userRes.ok) {
		throw new Error("Failed to fetch GitHub user");
	}
	const user: GitHubUser = await userRes.json();

	// Fetch recent events
	const eventsRes = await fetch(
		`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=15`,
		{ next: { revalidate: CACHE_DURATION } },
	);
	if (!eventsRes.ok) {
		throw new Error("Failed to fetch GitHub events");
	}
	const events: GitHubEvent[] = await eventsRes.json();

	// Fetch pinned/repos
	const pinnedRepos = await fetchPinnedRepos();

	// Fetch contributions
	const contributions = await fetchContributions();

	const data: CachedData = {
		user,
		events,
		pinnedRepos,
		topRepos: pinnedRepos,
		contributions,
		timestamp: Date.now(),
	};

	cache.set("default", data);
	return data;
}

export async function GET() {
	try {
		const data = await fetchGitHubData();

		// Format events for display
		const formattedEvents = data.events.map((event) => {
			let message = "";
			let icon = "";
			let link = "";

			switch (event.type) {
				case "PushEvent":
					const commits = event.payload?.commits || [];
					message = `Pushed ${commits.length} commit${
						commits.length !== 1 ? "s" : ""
					} to ${event.repo?.name || "unknown"}`;
					icon = "📝";
					link = `https://github.com/${event.repo?.name || ""}`;
					break;
				case "CreateEvent":
					message = `Created ${event.repo?.name || "repository"}`;
					icon = "✨";
					link = `https://github.com/${event.repo?.name || ""}`;
					break;
				case "DeleteEvent":
					message = `Deleted from ${event.repo?.name || "repository"}`;
					icon = "🗑️";
					break;
				case "WatchEvent":
					message = `Starred ${event.repo?.name || "repository"}`;
					icon = "⭐";
					link = `https://github.com/${event.repo?.name || ""}`;
					break;
				case "ForkEvent":
					message = `Forked ${event.repo?.name || "repository"}`;
					icon = "🔱";
					link = `https://github.com/${event.repo?.name || ""}`;
					break;
				case "IssuesEvent":
					message = `Opened issue: ${event.payload?.issue?.title || ""} in ${event.repo?.name || ""}`;
					icon = "🐛";
					link = `https://github.com/${event.repo?.name || ""}/issues/${event.payload?.issue?.number || ""}`;
					break;
				case "IssueCommentEvent":
					message = `Commented on issue in ${event.repo?.name || ""}`;
					icon = "💬";
					link = `https://github.com/${event.repo?.name || ""}`;
					break;
				case "PullRequestEvent":
					message = `Opened PR: ${event.payload?.pull_request?.title || ""} in ${event.repo?.name || ""}`;
					icon = "🔀";
					link = `https://github.com/${event.repo?.name || ""}/pull/${event.payload?.pull_request?.number || ""}`;
					break;
				case "PullRequestReviewEvent":
					message = `Reviewed PR in ${event.repo?.name || ""}`;
					icon = "👀";
					link = `https://github.com/${event.repo?.name || ""}`;
					break;
				case "ReleaseEvent":
					message = `Released ${event.payload?.release?.tag_name || event.payload?.release?.name || ""} in ${event.repo?.name || ""}`;
					icon = "🚀";
					link = `https://github.com/${event.repo?.name || ""}/releases`;
					break;
				default:
					message = `Activity in ${event.repo?.name || "repository"}`;
					icon = "🔄";
					link = `https://github.com/${event.repo?.name || ""}`;
			}

			return {
				id: event.id,
				type: event.type,
				message,
				icon,
				link,
				timestamp: event.created_at,
			};
		});

		return NextResponse.json({
			user: {
				login: data.user.login,
				name: data.user.name,
				bio: data.user.bio,
				blog: data.user.blog,
				location: data.user.location,
				avatar_url: data.user.avatar_url,
				followers: data.user.followers,
				following: data.user.following,
				public_repos: data.user.public_repos,
				company: data.user.company,
				email: data.user.email,
				hireable: data.user.hireable,
				twitter_username: data.user.twitter_username,
				created_at: data.user.created_at,
				updated_at: data.user.updated_at,
				html_url: `https://github.com/${GITHUB_USERNAME}`,
			},
			events: formattedEvents,
			pinnedRepos: data.pinnedRepos,
			topRepos: data.topRepos,
			contributions: data.contributions,
		});
	} catch (error) {
		console.error("GitHub API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch GitHub data", user: null, events: [] },
			{ status: 500 },
		);
	}
}
