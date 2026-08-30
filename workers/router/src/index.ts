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
//
// We also override `containerFetch` so the port-ready timeout can be extended
// past the SDK default of 20 s. Lite instances (256 MB RAM, 0.0625 vCPU) need
// significantly longer to bootstrap the Rust binary + R2 hydrate on cold
// start, and the default 20 s window reports "Container is not listening in
// the TCP address 10.0.0.1:3001" before the binary has finished binding.
// 180 s is comfortably above the worst observed cold start in dev.
export class CMSApiContainer extends Container {
	override defaultPort = 3001;
	override sleepAfter = "10m";

	constructor(
		ctx: ConstructorParameters<typeof Container>[0],
		env: Env,
	) {
		super(ctx, env);
		// Cloudflare Containers run the binary inside a Firecracker microVM whose
		// network interface is `10.0.0.1`. The Worker SDK's `waitForPort` does a
		// TCP connect to `10.0.0.1:<defaultPort>` (not `127.0.0.1`) — so a binary
		// bound to loopback-only is invisible to the port probe and reports
		// "The container is not listening in the TCP address 10.0.0.1:3001"
		// until the 180 s timeout fires. Force `0.0.0.0` here so axum binds on
		// every interface; the container's network mode is `private`, so this
		// does not expose the port beyond the Worker runtime.
		this.envVars = {
			CMS_API_HOST: "0.0.0.0",
			R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
			R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
			R2_BUCKET: env.R2_BUCKET,
			R2_ENDPOINT: env.R2_ENDPOINT,
		};
	}

	override async containerFetch(
		requestOrUrl: Request | string | URL,
		portOrInit?: number | RequestInit,
		portParam?: number,
	): Promise<Response> {
		// Use a 180 s port-ready window for the lite instance. Warm starts hit
		// the early-return below and skip this entirely; cold starts benefit.
		await this.startAndWaitForPorts({
			cancellationOptions: {
				portReadyTimeoutMS: 180_000,
				instanceGetTimeoutMS: 60_000,
			},
		});
		// After start (or immediately if already running), fall through to the
		// base class proxy that does the actual TCP-fetch to the container.
		return super.containerFetch(requestOrUrl, portOrInit, portParam);
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
		// `Response.headers` is immutable in the Workers runtime; `.clone()`
		// duplicates the body stream but the headers stay frozen. To rewrite
		// `Cache-Control` we have to build a fresh Response from the cloned
		// body and lift the original headers into a mutable Headers object.
		const body = resp.clone().body;
		const mutableHeaders = new Headers(resp.headers);
		mutableHeaders.set("Cache-Control", "s-maxage=60");
		const cached = new Response(body, {
			status: resp.status,
			statusText: resp.statusText,
			headers: mutableHeaders,
		});
		ctx.waitUntil(cache.put(req, cached));
	}
	return resp;
}