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

// Accept all three dev-host path shapes:
//   * canonical `/api/cms/media…`
//   * worker-routed `/api/media…`
//   * legacy `/media?…` (newer CMS uploads via
//     `useContentFormMedia.ts`'s `${getCmsApiBaseUrl()}/media?…` builder)
//
// All three should rewrite to the build-time host so dev URLs don't leak
// into the static export. The legacy and worker-routed forms gain the
// `/api/cms` prefix here (the regex captures the bare path; the function
// caller in this module is responsible for stripping the dev host and
// prepending the production host, leaving the path untouched).
const DEV_HOST_PATTERN =
	/^https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?((?:\/api(?:\/cms)?)?\/media[^\s"'<>]*)$/;

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
		const path = match[1];
		if (!path) return storedUrl;
		// Strip any pre-existing `/api/cms` or `/api` prefix so we don't
		// produce `/api/cms/api/media?...`. All three shapes map to the
		// single canonical `/api/cms/media?…` form the build-time host
		// expects.
		const canonicalPath = `/api/cms/media${path
			.replace(/^\/api\/cms\/media/, "")
			.replace(/^\/api\/media/, "")
			.replace(/^\/media/, "")}`;
		return `${getCmsApiBaseUrl()}${canonicalPath}`;
	}

	return storedUrl;
}
