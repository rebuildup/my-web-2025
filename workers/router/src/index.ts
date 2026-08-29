// Subdomain rewrite map (mirrors nginx `map $host $subdomain_redirect`)
// Keep this aligned with `docs/06_deploy.md` §7 / the deployment plan.
const SUBDOMAIN_REDIRECT: Record<string, string> = {
	"links.yusuke-kim.com": "/about/links/",
	"portfolio.yusuke-kim.com": "/portfolio/",
	"www.yusuke-kim.com": "/",
	"pomodoro.yusuke-kim.com": "/tools/pomodoro/",
	"prototype.yusuke-kim.com": "/tools/prototype/",
	"samuido.yusuke-kim.com": "/about/profile/handle/",
	"361do.yusuke-kim.com": "/about/profile/handle/",
};

// Static paths that share their path with a Rust CMS API endpoint (e.g. /search
// is both the in-site search page and the CMS search endpoint). The static page
// must win, so check the file system first and only proxy to the API when no
// static asset is present. Matches the nginx `location ~ ^/(entries|...)` rule.
const STATIC_API_PATHS = /^\/(entries|markdown|media|tags|search|preview|health)/;

export interface Env {
	STATIC_ASSETS: Fetcher;
	CMS_DATA: R2Bucket;
	// The Container binding exposes a Durable Object that proxies to the
	// actual Container instance. We pin to a stable id so we always hit the
	// same single instance (matches `max_instances = 1`).
	CMS_API: DurableObjectNamespace;
}

export default {
	async fetch(
		req: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(req.url);
		const host = url.host;

		// 1. Subdomain rewrite (308 preserves method + body)
		const redirect = SUBDOMAIN_REDIRECT[host];
		if (redirect && url.pathname === "/") {
			return Response.redirect(new URL(redirect, url).toString(), 308);
		}

		// 2. /api/* → Container
		if (url.pathname.startsWith("/api/")) {
			return cachedProxy(req, env, ctx);
		}

		// 3. Static-API collision → static first, Container fallback
		if (STATIC_API_PATHS.test(url.pathname)) {
			const assetResp = await env.STATIC_ASSETS.fetch(req);
			if (assetResp.status !== 404) return assetResp;
			return cachedProxy(req, env, ctx);
		}

		// 4. Default: static asset
		return env.STATIC_ASSETS.fetch(req);
	},

	async scheduled(
		_event: ScheduledController,
		env: Env,
		ctx: ExecutionContext,
	): Promise<void> {
		// Cron warm: keep Container alive (every 5 min, before sleep threshold).
		ctx.waitUntil(
			getContainer(env).fetch("https://internal/health").catch(() => null),
		);
	},
};

async function cachedProxy(
	req: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const cache = caches.default;
	if (req.method === "GET") {
		const cached = await cache.match(req);
		if (cached) return cached;
	}
	const container = getContainer(env);
	const resp = await container.fetch(req);
	if (resp.status === 200 && req.method === "GET") {
		const clone = resp.clone();
		clone.headers.set("Cache-Control", "s-maxage=60");
		ctx.waitUntil(cache.put(req, clone));
	}
	return resp;
}

function getContainer(env: Env): Fetcher {
	const id = env.CMS_API.idFromName("singleton");
	const stub = env.CMS_API.get(id);
	return stub;
}