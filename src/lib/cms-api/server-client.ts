import "server-only";

import { getCmsApiBaseUrl } from "./config";

export class CmsApiProxyError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "CmsApiProxyError";
		this.status = status;
	}
}

export async function cmsApiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${getCmsApiBaseUrl()}${path}`, {
		cache: "no-store",
		...init,
		headers: {
			Accept: "application/json",
			...(init?.headers ?? {}),
		},
	});

	if (!response.ok) {
		throw new CmsApiProxyError(
			`CMS API request failed for ${path} with status ${response.status}`,
			response.status,
		);
	}

	return (await response.json()) as T;
}
