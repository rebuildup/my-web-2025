import type { Content } from "@/cms/types/content";

export const _TAG_SUGGESTIONS = [
	"develop",
	"design",
	"video",
	"plugin",
	"blog",
	"tool",
	"web",
	"motion",
];

export function _slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "")
		.slice(0, 60);
}

export const _stringifyJson = (value: unknown) => {
	if (!value) return "";
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return "";
	}
};

export const parseJsonSafely = (value: string) => {
	if (!value.trim()) return undefined;
	return JSON.parse(value);
};

export function toYouTubeEmbed(url: string): string | null {
	if (!url) return null;
	try {
		const u = new URL(
			url,
			typeof window !== "undefined"
				? window.location.origin
				: "https://youtube.com",
		);
		let id = "";
		if (u.hostname.includes("youtu.be")) {
			id = u.pathname.replace(/^\//, "");
		} else if (u.searchParams.get("v")) {
			id = u.searchParams.get("v") || "";
		} else if (u.pathname.includes("/shorts/")) {
			id = u.pathname.split("/shorts/")[1]?.split("/")[0] || "";
		} else if (u.pathname.includes("/embed/")) {
			id = u.pathname.split("/embed/")[1]?.split("/")[0] || "";
		}
		id = id.replace(/[^a-zA-Z0-9_-]/g, "");
		if (!id) return null;
		return `https://www.youtube-nocookie.com/embed/${id}`;
	} catch {
		return null;
	}
}

function deriveYouTubePreview(base: Partial<Content>) {
	let hasThumbYouTube = false;
	if (base.ext) {
		const extAny = base.ext as any;
		if (extAny.thumbnail?.youtube) hasThumbYouTube = true;
	}
	if (hasThumbYouTube) return;
	if (!Array.isArray(base.assets)) return;
	let ytSrc: string | null = null;
	for (const asset of base.assets as any[]) {
		if (asset?.type === "video/youtube" && asset.src) {
			ytSrc = asset.src;
			break;
		}
		if (
			asset?.src &&
			typeof asset.src === "string" &&
			asset.src.includes("youtube.")
		) {
			ytSrc = asset.src;
			break;
		}
	}
	if (ytSrc) {
		const currentExt = base.ext as any;
		const currentThumbnail = currentExt?.thumbnail || {};
		base.ext = {
			...(currentExt || {}),
			thumbnail: { ...currentThumbnail, youtube: ytSrc },
		} as any;
	}
}

export function createContentFormData(
	initialData: Partial<Content>,
): Partial<Content> {
	const nowIso = new Date().toISOString();
	const slug = initialData.id || "";
	const base: Partial<Content> = {
		id: initialData.id || "",
		title: initialData.title || "",
		summary: initialData.summary || "",
		status: initialData.status || "draft",
		visibility: initialData.visibility || "draft",
		tags: initialData.tags || [],
		lang: initialData.lang || "ja",
		parentId: initialData.parentId || "",
		path: initialData.path || "",
		depth: initialData.depth || 0,
		order: initialData.order || 0,
		thumbnails: initialData.thumbnails || undefined,
		assets: initialData.assets || undefined,
		links: initialData.links || undefined,
		relations: initialData.relations || undefined,
		searchable: initialData.searchable || undefined,
		seo: deriveSeoDefaults(initialData, slug),
		i18n: initialData.i18n || undefined,
		permissions: initialData.permissions || undefined,
		ext: initialData.ext || undefined,
		createdAt: initialData.createdAt || nowIso,
		updatedAt: initialData.updatedAt || nowIso,
		publishedAt: initialData.publishedAt ?? undefined,
		unpublishedAt: initialData.unpublishedAt ?? undefined,
	};
	try {
		deriveYouTubePreview(base);
	} catch {}
	return base;
}

const PORTFOLIO_BASE_URL = "https://yusuke-kim.com";
const DEFAULT_ROBOTS = "index,follow";

function deriveSeoDefaults(
	initialData: Partial<Content>,
	slug: string,
): Partial<Content>["seo"] {
	const existing = (initialData.seo ?? {}) as NonNullable<Content["seo"]>;
	const meta = (existing.meta ?? {}) as NonNullable<
		NonNullable<Content["seo"]>["meta"]
	>;
	const openGraph = (existing.openGraph ?? {}) as NonNullable<
		NonNullable<Content["seo"]>["openGraph"]
	>;
	const existingKeywords = meta.keywords ?? [];
	const title = initialData.title?.trim() ?? "";
	const summary = initialData.summary?.trim() ?? "";
	const tags = initialData.tags ?? [];
	const canonicalDefault = slug
		? `${PORTFOLIO_BASE_URL}/portfolio/${slug}`
		: "";
	return {
		...existing,
		meta: {
			...meta,
			title: meta.title?.trim() || title,
			description: meta.description?.trim() || summary,
			robots: meta.robots?.trim() || DEFAULT_ROBOTS,
			canonical: meta.canonical?.trim() || canonicalDefault,
			keywords:
				existingKeywords && existingKeywords.length > 0
					? existingKeywords
					: tags,
		},
		openGraph: {
			...openGraph,
			title: openGraph.title?.trim() || title,
			description: openGraph.description?.trim() || summary,
		},
	};
}

export function findYouTubeUrl(formData: Partial<Content>): string {
	if (Array.isArray(formData.assets)) {
		for (const item of formData.assets as any[]) {
			if (item?.type === "video/youtube" && item.src) return item.src;
			if (
				item?.src &&
				typeof item.src === "string" &&
				item.src.includes("youtube.")
			)
				return item.src;
		}
	}
	if (Array.isArray(formData.links)) {
		for (const item of formData.links as any[]) {
			if (
				item?.href &&
				typeof item.href === "string" &&
				item.href.includes("youtube.")
			)
				return item.href;
		}
	}
	return "";
}

export function resolveOgImageUrl(formData: Partial<Content>): string | null {
	const id = (formData.id ?? "").trim();
	if (!id) return null;
	const base =
		(typeof process !== "undefined" &&
			(process.env.NEXT_PUBLIC_CMS_API_BASE_URL ||
				process.env.CMS_API_BASE_URL)) ||
		"http://127.0.0.1:3001";
	return `${base.replace(/\/+$/, "")}/api/cms/og/${encodeURIComponent(id)}`;
}

function normalize(value: any): any {
	if (Array.isArray(value)) return value.map(normalize);
	if (value && typeof value === "object") {
		const out: Record<string, any> = {};
		Object.keys(value)
			.sort()
			.forEach((key) => {
				if (value[key] !== undefined) out[key] = normalize(value[key]);
			});
		return out;
	}
	return value;
}

export function isContentFormDirty(
	initialData: Partial<Content>,
	formData: Partial<Content>,
): boolean {
	try {
		return (
			JSON.stringify(normalize(initialData)) !==
			JSON.stringify(normalize(formData))
		);
	} catch {
		return true;
	}
}
