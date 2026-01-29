/**
 * Unified Floating Cards System
 * Manages all floating card types (GitHub, YouTube, Portfolio) in one system
 */
"use client";

import {
	Bug,
	Calendar,
	Clock,
	Eye,
	FileEdit,
	FileText,
	GitBranch,
	GitCommit,
	GitFork,
	Github,
	MessageSquare,
	Rocket,
	Sparkles,
	Star,
	Trash2,
	Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Format date helper
function formatDate(dateString: string): string {
	const date = new Date(dateString);
	// Check for invalid date
	if (Number.isNaN(date.getTime())) {
		return "Unknown date";
	}
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
	if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
	return `${Math.floor(diffDays / 365)}y ago`;
}

// Format relative time helper
function formatRelativeTime(dateString?: string): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	// Check for invalid date
	if (Number.isNaN(date.getTime())) {
		return "Unknown";
	}
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	return formatDate(dateString);
}

// Import links data
import { contactLinks, links } from "@/app/about/links/data";

// Map links to the expected format, excluding GitHub and mailto links
const MAPPED_LINKS = [...links, ...contactLinks]
	.filter((link) => link.id !== "github" && !link.url.startsWith("mailto:"))
	.map((link) => {
		let domain = "";
		try {
			const url = new URL(link.url);
			domain = url.hostname;
		} catch {
			domain = "";
		}
		return {
			title: link.title,
			url: link.url,
			description: link.description,
			favicon: domain
				? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
				: undefined,
		};
	});

// Type definitions
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
	full_name?: string;
	description?: string;
	language?: string;
	stars: number;
	forks: number;
	url: string;
	topics?: string[];
	license?: string;
	openIssues?: number;
	openPullRequests?: number;
	size?: number;
	createdAt?: string;
	updatedAt?: string;
	homepage?: string;
}

interface GitHubUserStatus {
	emoji?: string;
	message?: string;
	limited_availability?: boolean;
}

interface GitHubData {
	user: GitHubUser | null;
	status: GitHubUserStatus | null;
	events: FormattedEvent[];
	pinnedRepos: PinnedRepo[];
	topRepos: PinnedRepo[];
	contributions: {
		total: number;
		year: number;
	};
}

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

interface PortfolioContent {
	id: string;
	slug?: string;
	title: string;
	description: string;
	thumbnail?: string;
	tags?: string[];
	technologies?: string[];
	category?: string;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
}

// Unified card type
type CardType =
	| "github-repo"
	| "github-event"
	| "youtube"
	| "portfolio"
	| "link";

interface UnifiedCard {
	id: number;
	type: CardType;
	x: number;
	y: number;
	displayY: number;
	data: any; // Will contain the specific data for each card type
}

// Icon mapping for GitHub events
const iconMap: Record<string, React.ReactNode> = {
	FileEdit: <FileEdit className="w-6 h-6" />,
	Sparkles: <Sparkles className="w-6 h-6" />,
	Trash2: <Trash2 className="w-6 h-6" />,
	Star: <Star className="w-6 h-6" />,
	GitFork: <GitFork className="w-6 h-6" />,
	Bug: <Bug className="w-6 h-6" />,
	MessageSquare: <MessageSquare className="w-6 h-6" />,
	GitBranch: <GitBranch className="w-6 h-6" />,
	Eye: <Eye className="w-6 h-6" />,
	Rocket: <Rocket className="w-6 h-6" />,
	GitCommit: <GitCommit className="w-6 h-6" />,
};

function getEventIcon(type: string): React.ReactNode {
	switch (type) {
		case "PushEvent":
			return iconMap.FileEdit;
		case "CreateEvent":
			return iconMap.Sparkles;
		case "DeleteEvent":
			return iconMap.Trash2;
		case "WatchEvent":
			return iconMap.Star;
		case "ForkEvent":
			return iconMap.GitFork;
		case "IssuesEvent":
			return iconMap.Bug;
		case "IssueCommentEvent":
			return iconMap.MessageSquare;
		case "PullRequestEvent":
			return iconMap.GitBranch;
		case "PullRequestReviewEvent":
			return iconMap.Eye;
		case "ReleaseEvent":
			return iconMap.Rocket;
		default:
			return iconMap.GitCommit;
	}
}

export default function UnifiedFloatingCards() {
	const [cards, setCards] = useState<UnifiedCard[]>([]);
	const [githubData, setGithubData] = useState<GitHubData | null>(null);
	const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
	const [portfolioData, setPortfolioData] = useState<PortfolioContent[]>([]);

	const nextIdRef = useRef(0);
	const scrollAccumulator = useRef(0);

	// Type indices for round-robin spawning
	const githubRepoIndexRef = useRef(0);
	const githubEventIndexRef = useRef(0);
	const youtubeIndexRef = useRef(0);
	const portfolioIndexRef = useRef(0);
	const linkIndexRef = useRef(0);

	// Fetch all data
	useEffect(() => {
		const fetchAllData = async () => {
			try {
				// Fetch GitHub data
				const githubRes = await fetch("/api/github/activity");
				if (githubRes.ok) {
					setGithubData(await githubRes.json());
				} else {
					console.error("GitHub API failed:", githubRes.status);
				}

				// Fetch YouTube data
				const youtubeRes = await fetch("/api/youtube/activity");
				if (youtubeRes.ok) {
					setYoutubeData(await youtubeRes.json());
				} else {
					console.error("YouTube API failed:", youtubeRes.status);
				}

				// Fetch Portfolio data
				const portfolioRes = await fetch("/api/content/portfolio?limit=50");
				if (portfolioRes.ok) {
					const json = await portfolioRes.json();
					if (json.success && json.data) {
						console.log("Portfolio data loaded:", json.data.length, "items");
						setPortfolioData(json.data);
					} else {
						console.error("Portfolio API returned error:", json);
					}
				} else {
					console.error("Portfolio API failed:", portfolioRes.status);
				}
			} catch (error) {
				console.error("Failed to fetch data:", error);
			}
		};

		fetchAllData();
	}, []);

	// Unified scroll handler
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			const deltaY = e.deltaY;
			const absDelta = Math.abs(deltaY);
			const scrollDirection = deltaY > 0 ? "up" : "down";
			scrollAccumulator.current += absDelta;

			// Spawn new card every 120px of scroll
			const spawnThreshold = 120;
			const itemsToSpawn = Math.floor(
				scrollAccumulator.current / spawnThreshold,
			);

			if (itemsToSpawn > 0) {
				scrollAccumulator.current %= spawnThreshold;

				for (let i = 0; i < itemsToSpawn; i++) {
					const card = spawnRandomCard(scrollDirection);
					if (card) {
						setCards((prev) => [...prev, card]);
					}
				}
			}

			// Update positions
			setCards((prev) => {
				const screenHeight = window.innerHeight;
				return prev
					.map((card) => {
						const newDisplayY =
							scrollDirection === "up"
								? card.displayY - absDelta
								: card.displayY + absDelta;
						return {
							...card,
							displayY: newDisplayY,
						};
					})
					.filter(
						(card) =>
							card.displayY > -200 && card.displayY < screenHeight + 300,
					);
			});
		};

		const handleTouchMove = () => {
			const delta = 10;
			const scrollDirection = "up";
			scrollAccumulator.current += delta;

			const spawnThreshold = 120;
			const itemsToSpawn = Math.floor(
				scrollAccumulator.current / spawnThreshold,
			);

			if (itemsToSpawn > 0) {
				scrollAccumulator.current %= spawnThreshold;

				for (let i = 0; i < itemsToSpawn; i++) {
					const card = spawnRandomCard(scrollDirection);
					if (card) {
						setCards((prev) => [...prev, card]);
					}
				}
			}

			setCards((prev) => {
				const screenHeight = window.innerHeight;
				return prev
					.map((card) => ({
						...card,
						displayY: card.displayY - delta,
					}))
					.filter(
						(card) =>
							card.displayY > -200 && card.displayY < screenHeight + 300,
					);
			});
		};

		window.addEventListener("wheel", handleWheel, { passive: true });
		window.addEventListener("touchmove", handleTouchMove, { passive: true });

		return () => {
			window.removeEventListener("wheel", handleWheel);
			window.removeEventListener("touchmove", handleTouchMove);
		};
	}, [githubData, youtubeData, portfolioData]);

	// Unified spawn function
	const spawnRandomCard = (
		scrollDirection: "up" | "down",
	): UnifiedCard | null => {
		const padding = 50;
		const centerX = window.innerWidth / 2;
		const centerWidth = 150; // Narrow exclusion area - cards can appear much closer to center

		// Calculate X position (avoid center area)
		const useLeftZone = Math.random() > 0.5;
		let x: number;

		// Determine card type with balanced probabilities
		const availableTypes: CardType[] = [];
		if (githubData?.topRepos.length) availableTypes.push("github-repo");
		if (githubData?.events.length) availableTypes.push("github-event");
		if (youtubeData?.videos.length) availableTypes.push("youtube");
		if (portfolioData.length) availableTypes.push("portfolio");
		if (MAPPED_LINKS.length) availableTypes.push("link");

		if (availableTypes.length === 0) return null;

		const cardType =
			availableTypes[Math.floor(Math.random() * availableTypes.length)];
		let cardWidth = 280;

		// Calculate X based on card type width
		switch (cardType) {
			case "github-repo":
				cardWidth = 340;
				break;
			case "youtube":
				cardWidth = 224;
				break;
			case "portfolio":
				cardWidth = 280;
				break;
			case "link":
				cardWidth = 220;
				break;
			default:
				cardWidth = 320;
		}

		if (useLeftZone) {
			const maxLeftX = centerX - centerWidth / 2 - cardWidth - padding;
			x = padding + Math.random() * Math.max(0, maxLeftX - padding);
		} else {
			const minRightX = centerX + centerWidth / 2 + padding;
			const maxX = window.innerWidth - padding - cardWidth;
			x = minRightX + Math.random() * Math.max(0, maxX - minRightX);
		}

		const y = scrollDirection === "up" ? window.innerHeight + 100 : -200;

		// Get card data based on type
		let data: any;
		switch (cardType) {
			case "github-repo": {
				const repo =
					githubData!.topRepos[
						githubRepoIndexRef.current % githubData!.topRepos.length
					];
				githubRepoIndexRef.current++;
				data = repo;
				break;
			}
			case "github-event": {
				const event =
					githubData!.events[
						githubEventIndexRef.current % githubData!.events.length
					];
				githubEventIndexRef.current++;
				data = event;
				break;
			}
			case "youtube": {
				const video =
					youtubeData!.videos[
						youtubeIndexRef.current % youtubeData!.videos.length
					];
				youtubeIndexRef.current++;
				data = video;
				break;
			}
			case "portfolio": {
				const content =
					portfolioData[portfolioIndexRef.current % portfolioData.length];
				portfolioIndexRef.current++;
				data = content;
				break;
			}
			case "link": {
				const link = MAPPED_LINKS[linkIndexRef.current % MAPPED_LINKS.length];
				linkIndexRef.current++;
				data = link;
				break;
			}
		}

		return {
			id: nextIdRef.current++,
			type: cardType,
			x,
			y,
			displayY: y,
			data,
		};
	};

	// Render card based on type
	const renderCard = (card: UnifiedCard) => {
		const { displayY } = card;
		const screenHeight = window.innerHeight;
		const opacity =
			displayY > 0 && displayY < screenHeight
				? 1
				: Math.max(0, 1 - Math.abs(displayY) / (screenHeight + 150));

		switch (card.type) {
			case "github-repo":
				return <GitHubRepoCard key={card.id} card={card} opacity={opacity} />;
			case "github-event":
				return <GitHubEventCard key={card.id} card={card} opacity={opacity} />;
			case "youtube":
				return <YouTubeCard key={card.id} card={card} opacity={opacity} />;
			case "portfolio":
				return <PortfolioCard key={card.id} card={card} opacity={opacity} />;
			case "link":
				return <LinkCard key={card.id} card={card} opacity={opacity} />;
			default:
				return null;
		}
	};

	return (
		<div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
			{cards.map((card) => renderCard(card))}
		</div>
	);
}

// Individual card components
function GitHubRepoCard({
	card,
	opacity,
}: {
	card: UnifiedCard;
	opacity: number;
}) {
	const repo = card.data as PinnedRepo;
	return (
		<div
			className="absolute"
			style={{ left: `${card.x}px`, top: `${card.displayY}px`, opacity }}
		>
			<a
				href={repo.url}
				target="_blank"
				rel="noopener noreferrer"
				className="pointer-events-auto block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 max-w-[340px] backdrop-blur-sm"
			>
				{/* Title with language and icon */}
				<div className="flex items-center gap-2 mb-2">
					<Github className="w-4 h-4 text-main/40 flex-shrink-0" />
					<span className="text-sm font-semibold text-main/90 flex-1 truncate">
						{repo.name}
					</span>
					{repo.language && (
						<span className="text-xs text-main/50 flex-shrink-0 flex items-center gap-1">
							<span className="w-2 h-2 rounded-full bg-blue-400" />
							{repo.language}
						</span>
					)}
				</div>

				{/* Description - more compact */}
				{repo.description && (
					<p className="text-xs text-main/60 mb-2 line-clamp-2 leading-snug">
						{repo.description}
					</p>
				)}

				{/* Stats, topics, and date all on one line */}
				<div className="flex items-center gap-2 text-[10px] text-main/30 flex-wrap">
					<span className="flex items-center gap-1">
						<Star className="w-3 h-3" />
						{repo.stars}
					</span>
					<span className="flex items-center gap-1">
						<GitFork className="w-3 h-3" />
						{repo.forks}
					</span>
					{repo.topics &&
						repo.topics.length > 0 &&
						repo.topics.slice(0, 2).map((topic) => (
							<span
								key={topic}
								className="px-1.5 py-0.5 bg-accent/10 text-accent/70 rounded whitespace-nowrap"
							>
								{topic}
							</span>
						))}
					<span className="flex items-center gap-1 ml-auto">
						<Calendar className="w-3 h-3" />
						{formatDate(repo.createdAt!)}
					</span>
				</div>
			</a>
		</div>
	);
}

function GitHubEventCard({
	card,
	opacity,
}: {
	card: UnifiedCard;
	opacity: number;
}) {
	const event = card.data as FormattedEvent;
	return (
		<div
			className="absolute"
			style={{ left: `${card.x}px`, top: `${card.displayY}px`, opacity }}
		>
			<a
				href={event.link}
				target="_blank"
				rel="noopener noreferrer"
				className="pointer-events-auto block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 max-w-[320px] backdrop-blur-sm"
			>
				<div className="flex items-start gap-3">
					<div className="text-main/60 mt-0.5">{getEventIcon(event.type)}</div>
					<div className="flex-1 min-w-0">
						<p className="text-xs text-main/70 leading-snug line-clamp-4 mb-2">
							{event.message}
						</p>
						<div className="flex items-center gap-1 text-[10px] text-main/30">
							<Clock className="w-3 h-3" />
							<span>{formatRelativeTime(event.timestamp)}</span>
						</div>
					</div>
				</div>
			</a>
		</div>
	);
}

function YouTubeCard({
	card,
	opacity,
}: {
	card: UnifiedCard;
	opacity: number;
}) {
	const video = card.data as YouTubeVideo;
	return (
		<div
			className="absolute"
			style={{ left: `${card.x}px`, top: `${card.displayY}px`, opacity }}
		>
			<a
				href={video.url}
				target="_blank"
				rel="noopener noreferrer"
				className="pointer-events-auto block"
			>
				<div className="relative group">
					{video.thumbnail && (
						<div className="relative">
							<img
								src={video.thumbnail}
								alt={video.title}
								className="w-56 h-auto object-cover rounded-lg"
							/>
							<div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
								YT
							</div>
						</div>
					)}
					<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
						<Youtube className="w-12 h-12 text-white drop-shadow-lg" />
					</div>
					<div className="mt-2 max-w-[224px]">
						<p className="text-xs text-main/80 line-clamp-3 leading-snug font-medium mb-2">
							{video.title}
						</p>
						<div className="flex items-center gap-2 text-[10px] text-main/30">
							<Calendar className="w-3 h-3" />
							<span>{formatDate(video.published)}</span>
						</div>
					</div>
				</div>
			</a>
		</div>
	);
}

function PortfolioCard({
	card,
	opacity,
}: {
	card: UnifiedCard;
	opacity: number;
}) {
	const content = card.data as PortfolioContent;
	const technologies = content.technologies || content.tags || [];
	const effectiveDate =
		content.publishedAt || content.updatedAt || content.createdAt || "";

	return (
		<div
			className="absolute"
			style={{ left: `${card.x}px`, top: `${card.displayY}px`, opacity }}
		>
			<a
				href={`/portfolio/${content.slug || content.id}`}
				className="pointer-events-auto block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 max-w-[280px] backdrop-blur-sm"
			>
				<div className="aspect-video bg-base overflow-hidden relative rounded-md mb-3">
					{content.thumbnail ? (
						<img
							src={content.thumbnail}
							alt={content.title}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-base">
							<FileText className="w-8 h-8 text-main/30" />
						</div>
					)}
				</div>
				<h3 className="text-sm font-semibold text-main/90 leading-tight line-clamp-2 mb-2">
					{content.title}
				</h3>
				{content.description && (
					<p className="text-xs text-main/60 leading-snug line-clamp-3 mb-3">
						{content.description}
					</p>
				)}
				{technologies.length > 0 && (
					<div className="flex flex-wrap gap-1 mb-3">
						{technologies.slice(0, 4).map((tech) => (
							<span
								key={tech}
								className="text-xs px-2 py-0.5 bg-accent/10 text-accent/70 rounded-full"
							>
								{tech}
							</span>
						))}
					</div>
				)}
				{effectiveDate && (
					<div className="flex items-center gap-1 text-[10px] text-main/30 pt-2 border-t border-white/5">
						<Calendar className="w-3 h-3" />
						<span>{formatDate(effectiveDate)}</span>
					</div>
				)}
			</a>
		</div>
	);
}

function LinkCard({ card, opacity }: { card: UnifiedCard; opacity: number }) {
	const link = card.data as {
		title: string;
		url: string;
		description?: string;
		favicon?: string;
	};
	return (
		<div
			className="absolute"
			style={{ left: `${card.x}px`, top: `${card.displayY}px`, opacity }}
		>
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				className="pointer-events-auto block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 max-w-[220px] backdrop-blur-sm"
			>
				<div className="flex items-center gap-2 mb-1">
					{link.favicon && (
						<img
							src={link.favicon}
							alt=""
							className="w-4 h-4 rounded flex-shrink-0"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>
					)}
					<h3 className="text-xs font-semibold text-main/90 leading-tight line-clamp-1">
						{link.title}
					</h3>
					{link.description && (
						<span className="text-[10px] text-main/50 ml-2">
							· {link.description}
						</span>
					)}
				</div>
				<div className="text-[9px] text-main/30 truncate">
					{link.url.replace(/^https?:\/\//, "")}
				</div>
			</a>
		</div>
	);
}
