import { describe, expect, test } from "bun:test";
import type { MarkdownPage } from "@/cms/types/markdown";
import {
	getContentItemCanonicalSlug,
	getMarkdownPageCanonicalHref,
	getMarkdownPageCanonicalSlug,
} from "../markdown-slug";

function makePage(
	overrides: Partial<MarkdownPage> & { frontmatter?: Record<string, unknown> },
): MarkdownPage {
	return {
		id: "md-test",
		slug: "",
		body: "",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		frontmatter: {},
		...overrides,
	} as MarkdownPage;
}

describe("getMarkdownPageCanonicalSlug", () => {
	test("returns null when no slug source is set", () => {
		const page = makePage({ frontmatter: {} });
		expect(getMarkdownPageCanonicalSlug(page)).toBeNull();
	});

	test("prefers frontmatter permalink over DB slug", () => {
		const page = makePage({
			slug: "MyArticle",
			frontmatter: { permalink: "/workshop/blog/my-article" },
		});
		expect(getMarkdownPageCanonicalSlug(page)).toBe("my-article");
	});

	test("prefers frontmatter url over frontmatter slug", () => {
		const page = makePage({
			slug: "MyArticle",
			frontmatter: {
				url: "https://example.com/external",
				slug: "from-frontmatter",
			},
		});
		// url is external and should not yield a local slug
		expect(getMarkdownPageCanonicalSlug(page)).toBe("from-frontmatter");
	});

	test("falls back to frontmatter slug when no permalink/url", () => {
		const page = makePage({
			slug: "MyArticle",
			frontmatter: { slug: "from-frontmatter" },
		});
		expect(getMarkdownPageCanonicalSlug(page)).toBe("from-frontmatter");
	});

	test("falls back to DB page.slug when frontmatter has no slug fields", () => {
		const page = makePage({ slug: "MyArticle" });
		expect(getMarkdownPageCanonicalSlug(page)).toBe("MyArticle");
	});

	test("falls back to contentId when nothing else is available", () => {
		const page = makePage({ slug: "", contentId: "fallback-id" });
		expect(getMarkdownPageCanonicalSlug(page)).toBe("fallback-id");
	});

	test("reduces absolute path permalinks to their last segment", () => {
		const page = makePage({
			slug: "MyArticle",
			frontmatter: { permalink: "/workshop/blog/MyArticle" },
		});
		expect(getMarkdownPageCanonicalSlug(page)).toBe("MyArticle");
	});

	test("ignores whitespace-only frontmatter slug and uses DB slug", () => {
		const page = makePage({
			slug: "RealSlug",
			frontmatter: { slug: "   " },
		});
		expect(getMarkdownPageCanonicalSlug(page)).toBe("RealSlug");
	});

	test("returns null when only an external permalink is available", () => {
		const page = makePage({
			slug: "",
			frontmatter: { permalink: "https://example.com/elsewhere" },
		});
		expect(getMarkdownPageCanonicalSlug(page)).toBeNull();
	});
});

describe("getMarkdownPageCanonicalHref", () => {
	test("returns external permalink as-is", () => {
		const page = makePage({
			slug: "ignored",
			frontmatter: { permalink: "https://example.com/article" },
		});
		expect(getMarkdownPageCanonicalHref(page)).toBe(
			"https://example.com/article",
		);
	});

	test("returns absolute path permalink as-is", () => {
		const page = makePage({
			slug: "ignored",
			frontmatter: { permalink: "/custom/path" },
		});
		expect(getMarkdownPageCanonicalHref(page)).toBe("/custom/path");
	});

	test("wraps bare canonical slug with /workshop/blog/", () => {
		const page = makePage({ slug: "MyArticle" });
		expect(getMarkdownPageCanonicalHref(page)).toBe("/workshop/blog/MyArticle");
	});

	test("uses frontmatter slug when DB slug is empty", () => {
		const page = makePage({
			slug: "",
			frontmatter: { slug: "my-article" },
		});
		expect(getMarkdownPageCanonicalHref(page)).toBe(
			"/workshop/blog/my-article",
		);
	});

	test("returns '#' when no slug can be derived", () => {
		const page = makePage({ slug: "" });
		expect(getMarkdownPageCanonicalHref(page)).toBe("#");
	});

	test("resolves absolute-path permalink instead of bare slug", () => {
		const page = makePage({
			slug: "ignored",
			frontmatter: { permalink: "/custom/blog/MyArticle" },
		});
		expect(getMarkdownPageCanonicalHref(page)).toBe("/custom/blog/MyArticle");
	});
});

describe("getContentItemCanonicalSlug", () => {
	test("returns id when no slug is set", () => {
		expect(getContentItemCanonicalSlug({ id: "portfolio-1" })).toBe(
			"portfolio-1",
		);
	});

	test("returns bare slug when set", () => {
		expect(
			getContentItemCanonicalSlug({ id: "portfolio-1", slug: "my-portfolio" }),
		).toBe("my-portfolio");
	});

	test("reduces absolute path slug to last segment", () => {
		expect(
			getContentItemCanonicalSlug({
				id: "portfolio-1",
				slug: "/portfolio/detail/my-portfolio",
			}),
		).toBe("my-portfolio");
	});

	test("returns id when slug is external URL", () => {
		expect(
			getContentItemCanonicalSlug({
				id: "portfolio-1",
				slug: "https://example.com/elsewhere",
			}),
		).toBe("portfolio-1");
	});
});
