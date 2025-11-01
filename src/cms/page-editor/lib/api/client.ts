import type { RequestInit } from "next/dist/server/web/spec-extension/request";

const DEFAULT_BASE_URL =
	typeof window !== "undefined"
		? window.location.origin
		: process.env.NEXT_PUBLIC_BASE_URL ||
			process.env.NEXT_PUBLIC_SITE_URL ||
			"http://localhost:3000";

export const EDITOR_HOME_URL =
	process.env.NEXT_PUBLIC_EDITOR_HOME_URL || DEFAULT_BASE_URL;

interface ApiRequestOptions extends RequestInit {
	query?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
	status: number;

	details?: unknown;

	constructor(message: string, status: number, details?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
	}
}

export function buildUrl(path: string, query?: ApiRequestOptions["query"]) {
	const base =
		typeof window !== "undefined"
			? window.location.origin
			: EDITOR_HOME_URL || DEFAULT_BASE_URL;
	const url = new URL(path, base);
	if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value === undefined || value === null) continue;
			url.searchParams.set(key, String(value));
		}
	}
	return url.toString();
}

export async function apiRequest<T>(
	path: string,
	{ query, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
	const url = buildUrl(path, query);

	console.log(`[API] Making request to: ${url}`);

	const response = await fetch(url, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(headers ?? {}),
		},
	});

	console.log(`[API] Response status: ${response.status}`);

	if (!response.ok) {
		let details: unknown;
		try {
			details = await response.json();
		} catch {
			details = await response.text();
		}
		console.error(`[API] Request failed:`, {
			url,
			status: response.status,
			details,
		});
		throw new ApiError(
			`Request to ${url} failed with status ${response.status}`,
			response.status,
			details,
		);
	}

	try {
		const result = (await response.json()) as T;
		console.log(`[API] Request successful:`, result);
		return result;
	} catch (error) {
		console.error(`[API] JSON parse error:`, error);
		throw new ApiError(
			`Failed to parse JSON response from ${url}`,
			response.status,
			error,
		);
	}
}
