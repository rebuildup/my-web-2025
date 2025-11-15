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

	private async fetchWithCache<T>(
		url: string,
		allow404: boolean = false,
	): Promise<T | null> {
		const cached = this.cache.get(url);
		if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
			return cached.data;
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

		try {
			const response = await fetch(url, {
				headers: {
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "ProtoType-Game",
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				// 404エラーの場合は静かに処理（リポジトリが存在しない可能性）
				if (response.status === 404) {
					// 404エラーもキャッシュに保存して、短時間の再試行を防ぐ
					this.cache.set(url, { data: null, timestamp: Date.now() });
					return null;
				}
				// その他のエラーはキャッシュしない
				return null;
			}

			const data = await response.json();
			this.cache.set(url, { data, timestamp: Date.now() });
			return data;
		} catch (error) {
			clearTimeout(timeoutId);

			// AbortError（タイムアウト）の場合は静かに処理
			if (error instanceof Error && error.name === "AbortError") {
				return null;
			}

			// 404エラーの場合は静かに処理
			if (
				error instanceof Error &&
				error.message.includes("404")
			) {
				this.cache.set(url, { data: null, timestamp: Date.now() });
				return null;
			}

			// その他のエラーはログに記録するが、開発環境でのみ表示
			if (process.env.NODE_ENV === "development") {
				console.warn("GitHub API fetch error:", error);
			}
			return null;
		}
	}

	async getLatestRelease(): Promise<GitHubRelease | null> {
		try {
			const release = await this.fetchWithCache<GitHubRelease>(
				`${GITHUB_API_BASE}/releases/latest`,
				true,
			);
			return release;
		} catch (error) {
			// エラーは既にfetchWithCacheで処理されているため、ここではnullを返す
			return null;
		}
	}

	async getAllReleases(limit: number = 10): Promise<GitHubRelease[]> {
		try {
			const releases = await this.fetchWithCache<GitHubRelease[]>(
				`${GITHUB_API_BASE}/releases?per_page=${limit}`,
				true,
			);
			return releases || [];
		} catch (error) {
			// エラーは既にfetchWithCacheで処理されているため、ここでは空配列を返す
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
			const repo = await this.fetchWithCache<any>(
				`${GITHUB_API_BASE}`,
				true,
			);
			if (!repo) {
				return null;
			}
			return {
				stars: repo.stargazers_count,
				forks: repo.forks_count,
				issues: repo.open_issues_count,
				lastUpdated: repo.updated_at,
			};
		} catch (error) {
			// エラーは既にfetchWithCacheで処理されているため、ここではnullを返す
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
				true,
			);
			if (!contributors) {
				return [];
			}
			return contributors.map((contributor) => ({
				login: contributor.login,
				avatar_url: contributor.avatar_url,
				contributions: contributor.contributions,
				html_url: contributor.html_url,
			}));
		} catch (error) {
			// エラーは既にfetchWithCacheで処理されているため、ここでは空配列を返す
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
		// エラーは既に内部で処理されているため、ここでは何もしない
		// GitHubリポジトリが存在しない場合でも、アプリケーションは正常に動作する
	}
};
