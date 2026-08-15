import { describe, expect, test } from "bun:test";
import { normalizeMarkdownUrls } from "./url-normalizer";

describe("normalizeMarkdownUrls", () => {
	test("rewrites 127.0.0.1 legacy /media? to relative /api/cms/media?", () => {
		const input =
			'<Image src="http://127.0.0.1:3001/media?contentId=icon-tegaki-anime&id=media_x&raw=1" alt="x"></Image>';
		const out = normalizeMarkdownUrls(input);
		expect(out).toBe(
			'<Image src="/api/cms/media?contentId=icon-tegaki-anime&id=media_x&raw=1" alt="x"></Image>',
		);
	});

	test("keeps /api/cms/media path when host is dev (drops host only)", () => {
		const input =
			'<Image src="http://localhost:3010/api/cms/media?contentId=LiteGlow&id=media_x&raw=1" alt="x"></Image>';
		const out = normalizeMarkdownUrls(input);
		expect(out).toBe(
			'<Image src="/api/cms/media?contentId=LiteGlow&id=media_x&raw=1" alt="x"></Image>',
		);
	});

	test("handles 0.0.0.0 with arbitrary port", () => {
		const input =
			'<img src="http://0.0.0.0:4000/media?contentId=foo&id=m&raw=1" />';
		const out = normalizeMarkdownUrls(input);
		expect(out).toBe('<img src="/api/cms/media?contentId=foo&id=m&raw=1" />');
	});

	test("handles dev host with no port", () => {
		const input = "http://127.0.0.1/media?contentId=foo&id=m&raw=1";
		const out = normalizeMarkdownUrls(input);
		expect(out).toBe("/api/cms/media?contentId=foo&id=m&raw=1");
	});

	test("rewrites multiple URLs in the same body", () => {
		const input = [
			'<Image src="http://127.0.0.1:3001/media?contentId=a&id=m1&raw=1"></Image>',
			'<Image src="https://localhost:3010/api/cms/media?contentId=a&id=m2&raw=1"></Image>',
			'<Image src="http://0.0.0.0:3001/media?contentId=a&id=m3&raw=1"></Image>',
		].join("\n");
		const out = normalizeMarkdownUrls(input);
		expect(out).toContain("/api/cms/media?contentId=a&id=m1&raw=1");
		expect(out).toContain("/api/cms/media?contentId=a&id=m2&raw=1");
		expect(out).toContain("/api/cms/media?contentId=a&id=m3&raw=1");
		expect(out).not.toContain("127.0.0.1");
		expect(out).not.toContain("localhost");
		expect(out).not.toContain("0.0.0.0");
	});

	test("leaves non-dev absolute URLs untouched", () => {
		const input =
			'<Image src="https://pbs.twimg.com/media/HFYzILhaIAAkC_Z?format=jpg&name=small" alt=""></Image>';
		const out = normalizeMarkdownUrls(input);
		expect(out).toBe(input);
	});

	test("passes through empty / nullish content", () => {
		expect(normalizeMarkdownUrls("")).toBe("");
	});

	test("handles https scheme", () => {
		const input =
			'<Image src="https://127.0.0.1:3001/media?contentId=x&id=m&raw=1"></Image>';
		const out = normalizeMarkdownUrls(input);
		expect(out).toBe(
			'<Image src="/api/cms/media?contentId=x&id=m&raw=1"></Image>',
		);
	});

	test("does not match non-media paths", () => {
		const input = '<a href="http://127.0.0.1:3001/api/cms/foo?bar=1">x</a>';
		const out = normalizeMarkdownUrls(input);
		expect(out).toBe(input);
	});
});
