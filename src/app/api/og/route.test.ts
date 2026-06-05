import { expect, test } from "bun:test";
import { NextRequest } from "next/server";

test("OG image route generates a PNG for Japanese CMS content", async () => {
	const params = new URLSearchParams({
		title: "OGP生成テスト",
		category: "develop",
		tags: "develop,cms",
		summary: "CMS内容に応じて生成されるOGP画像の検証",
		slug: "ogp-test",
	});

	const { GET } = await import("./route");
	const response = await GET(
		new NextRequest(`http://localhost:3000/api/og?${params.toString()}`),
	);
	const image = Buffer.from(await response.arrayBuffer());

	expect(response.status).toBe(200);
	expect(response.headers.get("content-type")).toContain("image/png");
	expect(image.length).toBeGreaterThan(10_000);
	expect(image.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
});
