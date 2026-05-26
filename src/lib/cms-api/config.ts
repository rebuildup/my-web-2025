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
