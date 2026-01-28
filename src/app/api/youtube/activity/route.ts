import { NextResponse } from "next/server";

const YOUTUBE_USER = "361do_sleep";
const CACHE_DURATION = 600; // 10 minutes

interface YouTubeVideo {
	id: string;
	title: string;
	published: string;
	updated: string;
	thumbnail: string;
	description: string;
	url: string;
}

interface CachedData {
	videos: YouTubeVideo[];
	channelTitle: string;
	timestamp: number;
}

const cache = new Map<string, CachedData>();

async function fetchYouTubeRSS(): Promise<CachedData> {
	// Check cache
	const cached = cache.get("default");
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 1000) {
		return cached;
	}

	// Try multiple RSS feed URLs
	const rssUrls = [
		`https://www.youtube.com/feeds/videos.xml?user=${YOUTUBE_USER}`,
		`https://www.youtube.com/feeds/videos.xml?channel_id=UC${YOUTUBE_USER}`,
	];

	let videos: YouTubeVideo[] = [];
	let channelTitle = "YouTube";
	let lastError: Error | null = null;

	for (const rssUrl of rssUrls) {
		try {
			const response = await fetch(rssUrl, {
				next: { revalidate: CACHE_DURATION },
			});

			if (!response.ok) {
				continue;
			}

			const text = await response.text();
			const parsed = parseYouTubeRSS(text);
			videos = parsed.videos;
			channelTitle = parsed.channelTitle;
			break;
		} catch (error) {
			lastError = error as Error;
			continue;
		}
	}

	if (videos.length === 0 && lastError) {
		throw lastError;
	}

	const data: CachedData = {
		videos,
		channelTitle,
		timestamp: Date.now(),
	};

	cache.set("default", data);
	return data;
}

function parseYouTubeRSS(xmlText: string): {
	videos: YouTubeVideo[];
	channelTitle: string;
} {
	// Parse XML using DOMParser
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlText, "text/xml");

	// Check for parsing errors
	const parseError = xmlDoc.querySelector("parsererror");
	if (parseError) {
		throw new Error(`Failed to parse RSS: ${parseError.textContent}`);
	}

	// Get channel title
	const channelTitle =
		xmlDoc.querySelector("channel > title")?.textContent?.trim() ||
		"YouTube";

	// Get videos
	const videoEntries = xmlDoc.querySelectorAll("entry");
	const videos: YouTubeVideo[] = [];

	videoEntries.forEach((entry) => {
		const id = entry.querySelector("yt:videoId")?.textContent;
		const title = entry.querySelector("title")?.textContent?.trim();
		const published = entry.querySelector("published")?.textContent?.trim();
		const updated = entry.querySelector("updated")?.textContent?.trim();
		const description = entry
			.querySelector("media:description")?.textContent?.trim() ||
			entry.querySelector("content")?.textContent?.trim() ||
			"";
		const thumbnail =
			entry.querySelector("media:thumbnail")?.getAttribute("url") || "";

		if (id && title) {
			videos.push({
				id,
				title,
				published: published || "",
				updated: updated || "",
				thumbnail,
				description,
				url: `https://www.youtube.com/watch?v=${id}`,
			});
		}
	});

	return { videos, channelTitle };
}

export async function GET() {
	try {
		const data = await fetchYouTubeRSS();

		return NextResponse.json({
			channelTitle: data.channelTitle,
			videos: data.videos.slice(0, 5), // Latest 5 videos
		});
	} catch (error) {
		console.error("YouTube RSS error:", error);
		return NextResponse.json(
			{ channelTitle: "YouTube", videos: [] },
			{ status: 200 },
		);
	}
}
