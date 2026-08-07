const DEFAULT_CMS_API_BASE_URL = "http://127.0.0.1:3001";

export function getCmsApiBaseUrl(): string {
	return (
		process.env.CMS_API_BASE_URL ||
		process.env.NEXT_PUBLIC_CMS_API_BASE_URL ||
		DEFAULT_CMS_API_BASE_URL
	).replace(/\/+$/, "");
}

export function shouldUseRustCmsApi(): boolean {
	return process.env.CMS_USE_RUST_API === "1";
}

const DEV_HOST_PATTERN =
	/^https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?(\/api\/cms\/media[^\s"'<>]*)$/;

export function resolveMediaUrl(
	storedUrl: string | null | undefined,
): string | undefined {
	if (!storedUrl) {
		return storedUrl ?? undefined;
	}

	// Rewrite dev-fallback absolute URLs to the build-time host so the static
	// export works in both dev (NEXT_PUBLIC_CMS_API_BASE_URL=127.0.0.1:3001)
	// and production (NEXT_PUBLIC_CMS_API_BASE_URL=https://yusuke-kim.com).
	const match = storedUrl.match(DEV_HOST_PATTERN);
	if (match) {
		return `${getCmsApiBaseUrl()}${match[1]}`;
	}

	return storedUrl;
}
