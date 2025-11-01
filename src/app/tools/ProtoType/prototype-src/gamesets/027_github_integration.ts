// GitHub Integration for ProtoType updates
export interface GitHubRelease {
	tag_name: string;
	name: string;
	body: string;
	published_at: string;
	html_url: string;
	assets: Array<{
		name: string;
		download_count: number;
		browser_download_url: string;
	}>;
}

export interface UpdateInfo {
	hasUpdate: boolean;
	currentVersion: string;
	latestVersion: string;
	releaseNotes: string;
	downloadUrl: string;
}

const GITHUB_API_BASE = "https://api.github.com/repos/rebuildup/ProtoType";
const CURRENT_VERSION = "1.0.0"; // This should be updated with each release

export class GitHubIntegration {
	private static instance: GitHubIntegration;
	private cache: Map<string, { data: any; timestamp: number }> = new Map();
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

	static getInstance(): GitHubIntegration {
		if (!GitHubIntegration.instance) {
			GitHubIntegration.instance = new GitHubIntegration();
		}
		return GitHubIntegration.instance;
	}

	private async fetchWithCache<T>(url: string): Promise<T> {
		const cached = this.cache.get(url);
		if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
			return cached.data;
		}

		try {
			const response = await fetch(url, {
				headers: {
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "ProtoType-Game",
				},
			});

			if (!response.ok) {
				throw new Error(`GitHub API error: ${response.status}`);
			}

			const data = await response.json();
			this.cache.set(url, { data, timestamp: Date.now() });
			return data;
		} catch (error) {
			console.error("GitHub API fetch error:", error);
			throw error;
		}
	}

	async getLatestRelease(): Promise<GitHubRelease | null> {
		try {
			const release = await this.fetchWithCache<GitHubRelease>(
				`${GITHUB_API_BASE}/releases/latest`,
			);
			return release;
		} catch (error) {
			console.error("Failed to fetch latest release:", error);
			return null;
		}
	}

	async getAllReleases(limit: number = 10): Promise<GitHubRelease[]> {
		try {
			const releases = await this.fetchWithCache<GitHubRelease[]>(
				`${GITHUB_API_BASE}/releases?per_page=${limit}`,
			);
			return releases;
		} catch (error) {
			console.error("Failed to fetch releases:", error);
			return [];
		}
	}

	async checkForUpdates(): Promise<UpdateInfo> {
		try {
			const latestRelease = await this.getLatestRelease();

			if (!latestRelease) {
				return {
					hasUpdate: false,
					currentVersion: CURRENT_VERSION,
					latestVersion: CURRENT_VERSION,
					releaseNotes: "",
					downloadUrl: "",
				};
			}

			const latestVersion = latestRelease.tag_name.replace(/^v/, "");
			const hasUpdate =
				this.compareVersions(CURRENT_VERSION, latestVersion) < 0;

			return {
				hasUpdate,
				currentVersion: CURRENT_VERSION,
				latestVersion,
				releaseNotes: latestRelease.body,
				downloadUrl: latestRelease.html_url,
			};
		} catch (error) {
			console.error("Failed to check for updates:", error);
			return {
				hasUpdate: false,
				currentVersion: CURRENT_VERSION,
				latestVersion: CURRENT_VERSION,
				releaseNotes: "",
				downloadUrl: "",
			};
		}
	}

	private compareVersions(version1: string, version2: string): number {
		const v1Parts = version1.split(".").map(Number);
		const v2Parts = version2.split(".").map(Number);

		const maxLength = Math.max(v1Parts.length, v2Parts.length);

		for (let i = 0; i < maxLength; i++) {
			const v1Part = v1Parts[i] || 0;
			const v2Part = v2Parts[i] || 0;

			if (v1Part < v2Part) return -1;
			if (v1Part > v2Part) return 1;
		}

		return 0;
	}

	async getRepositoryStats(): Promise<{
		stars: number;
		forks: number;
		issues: number;
		lastUpdated: string;
	} | null> {
		try {
			const repo = await this.fetchWithCache<any>(`${GITHUB_API_BASE}`);
			return {
				stars: repo.stargazers_count,
				forks: repo.forks_count,
				issues: repo.open_issues_count,
				lastUpdated: repo.updated_at,
			};
		} catch (error) {
			console.error("Failed to fetch repository stats:", error);
			return null;
		}
	}

	async getContributors(): Promise<
		Array<{
			login: string;
			avatar_url: string;
			contributions: number;
			html_url: string;
		}>
	> {
		try {
			const contributors = await this.fetchWithCache<any[]>(
				`${GITHUB_API_BASE}/contributors`,
			);
			return contributors.map((contributor) => ({
				login: contributor.login,
				avatar_url: contributor.avatar_url,
				contributions: contributor.contributions,
				html_url: contributor.html_url,
			}));
		} catch (error) {
			console.error("Failed to fetch contributors:", error);
			return [];
		}
	}

	formatReleaseNotes(body: string): string {
		// Convert markdown to plain text for display
		return body
			.replace(/#{1,6}\s/g, "") // Remove headers
			.replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
			.replace(/\*(.*?)\*/g, "$1") // Remove italic
			.replace(/`(.*?)`/g, "$1") // Remove code blocks
			.replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links but keep text
			.trim();
	}

	openRepository(): void {
		window.open("https://github.com/rebuildup/ProtoType", "_blank");
	}

	openLatestRelease(): void {
		this.getLatestRelease().then((release) => {
			if (release) {
				window.open(release.html_url, "_blank");
			}
		});
	}
}

// Export singleton instance
export const githubIntegration = GitHubIntegration.getInstance();

// Auto-check for updates on load (with error handling)
export const initializeGitHubIntegration = async (): Promise<void> => {
	try {
		const updateInfo = await githubIntegration.checkForUpdates();
		if (updateInfo.hasUpdate) {
			console.log(`ProtoType update available: ${updateInfo.latestVersion}`);
			// Store update info in localStorage for UI to display
			localStorage.setItem("prototypeUpdateInfo", JSON.stringify(updateInfo));
		}
	} catch (_error) {
		console.log("GitHub integration initialized with limited functionality");
	}
};
