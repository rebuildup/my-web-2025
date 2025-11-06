import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{ params }: { params: { slug?: string } },
) {
	try {
		let slug = params?.slug;
		if (!slug) {
			const url = new URL(req.url);
			const m = url.pathname.match(/\/md\/(.+)$/);
			if (m) slug = m[1];
		}
		if (!slug) return new NextResponse("Bad Request", { status: 400 });

		const dbModule = await import("@/cms/lib/db");
		const db = dbModule.default;
		const row = db
			.prepare(
				`SELECT frontmatter, body FROM markdown_pages WHERE slug = @slug LIMIT 1`,
			)
			.get({ slug }) as { frontmatter?: string; body?: string } | undefined;
		if (!row) return new NextResponse("Not Found", { status: 404 });

		const body = typeof row.body === "string" ? row.body : "";
		return new NextResponse(body, {
			status: 200,
			headers: {
				"Content-Type": "text/markdown; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	} catch (e) {
		console.error("GET /md/[slug] error", e);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
