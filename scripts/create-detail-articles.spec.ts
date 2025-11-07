import { APIRequestContext, expect, request, test } from "@playwright/test";

const BASE_URL =
	process.env.BASE_URL ||
	process.env.NEXT_PUBLIC_EDITOR_HOME_URL ||
	"http://localhost:3010";

type ContentLink = {
	href: string;
	label?: string;
	rel?: string;
	description?: string;
	primary?: boolean;
};

type AssetRef = {
	src: string;
	type?: string;
	width?: number;
	height?: number;
	alt?: string;
};

type ContentFull = {
	id: string;
	title: string;
	summary?: string;
	links?: ContentLink[];
	assets?: AssetRef[];
};

type MediaItem = {
	id: string;
	filename: string;
	mimeType: string;
	alt?: string;
	size?: number;
};

async function api(
	_ctx: APIRequestContext,
	path: string,
	params?: Record<string, string | number | boolean | undefined>,
) {
	const url = new URL(path, BASE_URL);
	if (params) {
		Object.entries(params).forEach(([k, v]) => {
			if (v === undefined) return;
			url.searchParams.set(k, String(v));
		});
	}
	return url.toString();
}

function mdEscape(text: string): string {
	return text.replace(/[<>]/g, (m) => (m === "<" ? "&lt;" : "&gt;"));
}

function buildMediaUrl(contentId: string, id: string): string {
	const u = new URL("/api/cms/media", BASE_URL);
	u.searchParams.set("contentId", contentId);
	u.searchParams.set("id", id);
	u.searchParams.set("raw", "1");
	return u.toString();
}

function buildBody(c: ContentFull, media: MediaItem[]): string {
	const lines: string[] = [];
	lines.push(`# ${mdEscape(c.title)}`);
	if (c.summary) {
		lines.push("", c.summary.trim());
	}
	if (c.links && c.links.length > 0) {
		lines.push("", "## Links");
		for (const l of c.links) {
			const label = l.label || l.href;
			const desc = l.description ? ` - ${l.description}` : "";
			lines.push(`- [${label}](${l.href})${desc}`);
		}
	}
	if (c.assets && c.assets.length > 0) {
		lines.push("", "## Assets");
		for (const a of c.assets) {
			if ((a.type || "").startsWith("image/")) {
				lines.push(`![](${a.src})`);
			} else {
				lines.push(`- ${a.alt || a.src} (${a.type || "asset"})`);
			}
		}
	}
	if (media.length > 0) {
		lines.push("", "## Media");
		for (const m of media) {
			const url = buildMediaUrl(c.id, m.id);
			if (m.mimeType.startsWith("image/")) {
				lines.push(`![](${url})`);
			} else if (m.mimeType.startsWith("audio/")) {
				lines.push(`<audio controls src=\"${url}\"></audio>`);
			} else if (m.mimeType.startsWith("video/")) {
				lines.push(
					`<video controls style=\"max-width:100%\" src=\"${url}\"></video>`,
				);
			} else {
				lines.push(`- [${m.filename}](${url}) (${m.mimeType})`);
			}
		}
	}
	lines.push("", "\n");
	return lines.join("\n");
}

test("generate detail markdown pages for all contents", async () => {
	const ctx = await request.newContext({ baseURL: BASE_URL });

	const listRes = await ctx.get("/api/cms/contents");
	expect(listRes.ok()).toBeTruthy();
	const indexList: Array<{ id: string; title: string; summary?: string }> =
		await listRes.json();

	for (const idx of indexList) {
		const contentUrl = await api(ctx, "/api/cms/contents", { id: idx.id });
		const cRes = await ctx.get(contentUrl);
		if (!cRes.ok()) continue;
		const full: ContentFull = await cRes.json();

		const mediaUrl = await api(ctx, "/api/cms/media", { contentId: idx.id });
		const mRes = await ctx.get(mediaUrl);
		const media: MediaItem[] = mRes.ok() ? await mRes.json() : [];

		const mdListUrl = await api(ctx, "/api/cms/markdown", {
			contentId: idx.id,
		});
		const mdListRes = await ctx.get(mdListUrl);
		const mdList: Array<{ id: string; slug: string }> = mdListRes.ok()
			? await mdListRes.json()
			: [];
		const exists = mdList.some((p) => p.slug === idx.id);

		const now = new Date().toISOString();
		const payload = {
			contentId: full.id,
			slug: full.id,
			frontmatter: {
				title: full.title,
				slug: full.id,
				updated: now,
				draft: false,
			},
			body: buildBody(full, media),
			createdAt: now,
			updatedAt: now,
		};

		if (exists) {
			const putRes = await ctx.put("/api/cms/markdown", { data: payload });
			expect(putRes.ok()).toBeTruthy();
		} else {
			const postRes = await ctx.post("/api/cms/markdown", { data: payload });
			expect(postRes.ok()).toBeTruthy();
		}
	}
});
