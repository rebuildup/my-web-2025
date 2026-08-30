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

// Singleton id so every request pins to the same Container instance. Combined
// with `max_instances = 1` in wrangler.toml this is structurally a singleton.
const CMS_API_INSTANCE = "singleton";

import { Container, getContainer as getContainerStub } from "@cloudflare/containers";

// wrangler 4 requires the Container to be exported as a class so it can be
// bound via `[[durable_objects.bindings]]` and built into the Worker bundle.
// The Rust CMS API listens on port 3001 inside the container (see
// `apps/cms-api/Dockerfile` + `apps/cms-api/src/main.rs`); `sleepAfter` keeps
// the instance warm between the 5-minute cron triggers in `wrangler.toml`.
//
// `Workers Secrets` (R2_*) are NOT auto-injected into the Container runtime;
// the SDK requires explicit `envVars` to be set in the constructor so the
// Rust binary's `env::var("R2_ACCESS_KEY_ID")` lookup succeeds. Without this,
// `build_r2_client` returns Err → `main()` panics with exit code 101 on first
// request. See docs/superpowers/specs/2026-08-26-cloudflare-deploy-design.md
// §6 (Environment Variables).
export class CMSApiContainer extends Container {
	override defaultPort = 3001;
	override sleepAfter = "10m";

	constructor(
		ctx: ConstructorParameters<typeof Container>[0],
		env: Env,
	) {
		super(ctx, env);
		this.envVars = {
			R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
			R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
			R2_BUCKET: env.R2_BUCKET,
			R2_ENDPOINT: env.R2_ENDPOINT,
		};
	}
}

export interface Env {
	STATIC_ASSETS: Fetcher;
	CMS_DATA: R2Bucket;
	// Container runtime env (set via Workers Secrets for the R2 credentials,
	// via `[[vars]]` in wrangler.toml for the non-secret values).
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
	R2_BUCKET: string;
	R2_ENDPOINT: string;
	// The Container is exposed via a Durable Object binding. The DO class
	// (`CMSApiContainer`, defined above) extends the SDK `Container` base
	// which wires `defaultPort` / `sleepAfter` / image build context.
	// `DurableObjectNamespace<Container>` is the brand-compatible instance
	// type that satisfies `getContainer<T extends Container>`.
	CMS_API: DurableObjectNamespace<Container>;
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
			getContainerStub(env.CMS_API, CMS_API_INSTANCE)
				.fetch("https://placeholder/health")
				.catch(() => null),
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
	const container = getContainerStub(env.CMS_API, CMS_API_INSTANCE);
	const resp = await container.fetch(req);
	if (resp.status === 200 && req.method === "GET") {
		const clone = resp.clone();
		clone.headers.set("Cache-Control", "s-maxage=60");
		ctx.waitUntil(cache.put(req, clone));
	}
	return resp;
}