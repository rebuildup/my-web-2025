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
	const base: Partial<Content> = {
		id: initialData.id || "",
		title: initialData.title || "",
		summary: initialData.summary || "",
		status: initialData.status || "draft",
		visibility: initialData.visibility || "draft",
		tags: initialData.tags || [],
		publicUrl: initialData.publicUrl || "",
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
		seo: initialData.seo || undefined,
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

export function buildGeneratedOgImageUrl(formData: Partial<Content>): string {
	const params = new URLSearchParams({
		title: formData.seo?.openGraph?.title || formData.title || "Untitled",
		category: formData.tags?.[0] || "Portfolio",
		tags: (formData.tags || []).join(","),
		thumbnail:
			formData.thumbnails?.image?.src ||
			formData.thumbnails?.webm?.poster ||
			"",
		slug: formData.id || "",
		summary: formData.seo?.openGraph?.description || formData.summary || "",
	});
	return `/api/og?${params.toString()}`;
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
