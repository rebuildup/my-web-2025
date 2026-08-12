import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = join(process.cwd(), "out");
const PORT = Number(process.env.PORT ?? 3010);

const MIME: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".ico": "image/x-icon",
	".txt": "text/plain; charset=utf-8",
	".map": "application/json; charset=utf-8",
	".woff": "font/woff",
	".woff2": "font/woff2",
};

const server = Bun.serve({
	port: PORT,
	hostname: "0.0.0.0",
	async fetch(req) {
		const url = new URL(req.url);
		let pathname = decodeURIComponent(url.pathname);
		if (pathname.endsWith("/")) pathname += "index.html";

		const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
		const filePath = join(ROOT, safePath);

		if (!filePath.startsWith(ROOT)) {
			return new Response("Forbidden", { status: 403 });
		}

		try {
			const s = await stat(filePath);
			if (s.isDirectory()) {
				const indexPath = join(filePath, "index.html");
				return new Response(createReadStream(indexPath));
			}
			const ct =
				MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
			return new Response(createReadStream(filePath), {
				headers: { "Content-Type": ct },
			});
		} catch {
			const fallback = join(ROOT, "404.html");
			try {
				await readFile(fallback);
				return new Response(createReadStream(fallback), {
					status: 404,
					headers: { "Content-Type": "text/html; charset=utf-8" },
				});
			} catch {
				return new Response("Not Found", { status: 404 });
			}
		}
	},
});

console.log(
	`[serve-static] Serving ${ROOT} on http://localhost:${server.port}`,
);
