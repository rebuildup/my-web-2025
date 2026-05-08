# Production Stability and Security Hardening Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent the production Next.js app from failing after days of runtime by closing public write endpoints, bounding file and memory growth, fixing middleware coverage, and restoring type-check/build safety.

**Architecture:** Treat public read APIs and private mutation/admin APIs as separate trust zones. Add route-local authorization for all server-side mutations because middleware is not sufficient protection by itself. Replace unbounded in-memory/file-backed tracking with bounded, validated, rate-limited storage that cannot grow indefinitely under bot traffic.

**Tech Stack:** Next.js App Router, Bun runtime, TypeScript, Bun SQLite (`bun:sqlite`), Jest/Bun tests, file-backed JSON/JSONL telemetry.

---

## Root-Cause Summary

The production crash risk is not a single bug. The highest-probability failure path is:

1. Public mutation endpoints allow unauthenticated writes/deletes to CMS SQLite databases.
2. Public upload/statistics/monitoring endpoints accept unbounded or weakly bounded data.
3. In-memory rate limit maps never evict expired clients.
4. File-backed JSON and JSONL logs can grow indefinitely and require whole-file reads/writes.
5. TypeScript errors are ignored during build, so broken code can ship.

The implementation must fix root causes, not only symptoms.

## Parallelization Map

The following tasks can be run in parallel after Task 1 creates shared helpers:

- Task 2: Protect CMS content mutation routes.
- Task 3: Protect CMS media mutation routes.
- Task 4: Fix middleware matcher coverage.
- Task 5: Bound monitoring and rate limit memory.
- Task 6: Bound search/statistics writes.
- Task 7: Restore type-check/build safety.

Task 8 should run after Tasks 2-7 are merged.

## Success Criteria

- Unauthenticated production requests cannot create, update, delete, or upload CMS/admin data.
- Public read endpoints remain available.
- Large upload payloads are rejected before being persisted.
- Rate limit memory does not grow forever after unique client/IP traffic.
- File-backed telemetry/statistics have explicit size/cardinality limits.
- `bun run type-check` passes or `next.config.ts` no longer ignores type errors only after all included TypeScript errors are resolved.
- Tests cover authorization failures and accepted authenticated mutation flows.

---

### Task 1: Shared Server-Side Admin Authorization Helpers

**Files:**

- Create: `src/lib/server/admin-auth.ts`
- Create: `src/lib/server/__tests__/admin-auth.test.ts`
- Modify if needed: `jest.config.js`

**Purpose:** Provide one route-local guard for admin-only server mutations. Do not rely on middleware alone.

**Required behavior:**

- In development, allow localhost requests without a token to preserve local admin tooling.
- In production, require `Authorization: Bearer <ADMIN_API_TOKEN>`.
- Reject production mutation requests when `ADMIN_API_TOKEN` is missing.
- Use constant-time token comparison when possible.
- Return structured JSON errors with status `401` or `403`.

**Implementation guidance:**

Create a helper with this API:

```ts
import { NextResponse, type NextRequest } from "next/server";

export type AdminGuardResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

export function requireAdminRequest(request: Request | NextRequest): AdminGuardResult;
export function isLocalDevelopmentRequest(request: Request | NextRequest): boolean;
```

Expected checks:

```ts
const isDevelopment = process.env.NODE_ENV === "development";
const token = process.env.ADMIN_API_TOKEN;
const authHeader = request.headers.get("authorization") ?? "";
const bearer = authHeader.match(/^Bearer\s+(.+)$/i)?.[1] ?? "";
```

Use `new URL(request.url).hostname` to detect localhost:

```ts
hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
```

In production:

- If `ADMIN_API_TOKEN` is empty, return `403` with `Admin API is not configured`.
- If the bearer token does not match, return `401` with `Unauthorized`.

**Tests:**

Write tests for:

- production missing `ADMIN_API_TOKEN` rejects.
- production missing bearer rejects.
- production wrong bearer rejects.
- production correct bearer allows.
- development localhost allows.
- development non-localhost without token rejects.

**Commands:**

```bash
bun run type-check
bun test src/lib/server/__tests__/admin-auth.test.ts
```

Expected:

- Auth helper tests pass.
- Type-check may still fail because unrelated existing TypeScript errors are fixed in Task 7.

---

### Task 2: Protect CMS Content Mutation Routes

**Files:**

- Modify: `src/app/api/cms/contents/route.ts`
- Test: `src/app/api/cms/contents/route.test.ts` or nearest existing API route test pattern

**Purpose:** Keep public CMS reads available while requiring admin authorization for create/update/delete.

**Required behavior:**

- `GET /api/cms/contents` remains public.
- `OPTIONS` must not advertise unsafe public cross-origin mutation.
- `POST`, `PUT`, and `DELETE` must call `requireAdminRequest(req)` before parsing JSON or touching SQLite.
- Unauthorized requests must return the guard response immediately.
- Authenticated requests keep current behavior.

**Implementation steps:**

1. Import `requireAdminRequest` from `@/lib/server/admin-auth`.
2. At the top of `POST`, `PUT`, and `DELETE`, add:

```ts
const guard = requireAdminRequest(req);
if (!guard.ok) return guard.response;
```

1. Change CORS headers:
  - For public `GET`, only allow `GET, OPTIONS`.
  - Do not use `Access-Control-Allow-Origin: *` with mutation methods.
  - If admin browser tooling needs CORS in development, restrict origin to localhost.
2. Add tests that mock `ADMIN_API_TOKEN` and verify:
  - unauthenticated `POST` returns `401` or `403`;
  - unauthenticated `PUT` returns `401` or `403`;
  - unauthenticated `DELETE` returns `401` or `403`;
  - authenticated `POST` reaches the existing validation path.

**Commands:**

```bash
bun test src/app/api/cms/contents/route.test.ts
```

If Jest is the established route-test runner in this repo, use:

```bash
bun x jest src/app/api/cms/contents/route.test.ts
```

---

### Task 3: Protect and Bound CMS Media Uploads

**Files:**

- Modify: `src/app/api/cms/media/route.ts`
- Modify if useful: `src/cms/lib/media-manager.ts`
- Test: `src/app/api/cms/media/route.test.ts`

**Purpose:** Prevent unauthenticated and oversized media writes to SQLite BLOB storage.

**Required behavior:**

- `GET` remains public for media reads.
- `POST` and `DELETE` require `requireAdminRequest(req)`.
- `POST` rejects payloads above a configured maximum before calling `saveMedia`.
- Default max decoded media size: `5 MiB`.
- Allow override with `CMS_MAX_MEDIA_BYTES`.
- Reject invalid Base64.
- Reject unknown MIME types. Allow only:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
  - `image/svg+xml`

**Implementation guidance:**

Add constants near the top of the route:

```ts
const DEFAULT_MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
```

Validate decoded size:

```ts
const buffer = Buffer.from(data.base64Data, "base64");
if (buffer.length > maxBytes) {
  return Response.json({ error: "Media file too large" }, { status: 413 });
}
```

Base64 validation must catch malformed data. At minimum, compare normalized re-encoding or use a strict regex plus decode check.

**Tests:**

- unauthenticated `POST` rejects.
- authenticated `POST` with unsupported MIME rejects.
- authenticated `POST` with invalid Base64 rejects.
- authenticated `POST` over max size rejects with `413`.
- unauthenticated `DELETE` rejects.

**Commands:**

```bash
bun test src/app/api/cms/media/route.test.ts
```

---

### Task 4: Fix Middleware API Matcher Coverage

**Files:**

- Modify: `middleware.ts`
- Test if available: `middleware.test.ts`

**Purpose:** Make middleware admin API checks actually run while keeping static assets and public APIs unaffected.

**Current issue:** `middleware.ts` contains `/api/admin` protection, but the matcher excludes every path beginning with `api`, so that code never runs for admin APIs.

**Required behavior:**

- Middleware must run for `/api/admin/:path`*.
- Middleware may continue to run for non-API page paths.
- Middleware must not run unnecessarily for `_next/static`, `_next/image`, or favicon.
- Route-local guards from Task 1 remain mandatory.

**Implementation guidance:**

Update `config.matcher` to include a dedicated admin API matcher:

```ts
export const config = {
  matcher: [
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

Review admin API CORS behavior. The current origin is hard-coded to `http://localhost:3000`, while the app dev script uses port `3010`. If kept, include `http://localhost:3010` or derive from the request origin in development only.

**Tests:**

If no middleware tests exist, add a minimal unit test around exported `middleware()` using `NextRequest` or a lightweight request object.

Verify:

- production `/api/admin/status` returns `403`;
- development localhost `/api/admin/status` passes through;
- public `/api/content/all` is not affected by admin middleware.

---

### Task 5: Bound Monitoring and Rate Limit State

**Files:**

- Modify: `src/app/api/monitoring/webgl/route.ts`
- Modify: `src/app/api/monitoring/alerts/route.ts`
- Create: `src/lib/server/rate-limit.ts`
- Create: `src/lib/server/__tests__/rate-limit.test.ts`

**Purpose:** Prevent long-running memory and disk growth from monitoring endpoints.

**Required behavior:**

- In-memory rate limit state must evict expired entries.
- The limiter must cap total tracked keys.
- Monitoring request bodies must have size/field limits.
- JSONL metric files must be bounded by line count or byte size.

**Implementation guidance:**

Create a reusable limiter:

```ts
export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  maxKeys: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): boolean;
export function cleanupRateLimitStore(now?: number): void;
export function getRateLimitStoreSize(): number;
```

Eviction rules:

- Delete expired entries on each `checkRateLimit`.
- If `maxKeys` is exceeded, delete oldest reset times first.
- Normalize IP keys from `x-forwarded-for` by taking the first IP and trimming whitespace.

For `webgl` JSONL:

- Keep existing daily file naming.
- Before append, if file exceeds `WEBGL_METRICS_MAX_BYTES` defaulting to `5 MiB`, skip persistence and still return success.
- Do not allow user-controlled fields above:
  - `url`: 2048 chars after sanitization
  - `userAgent`: 500 chars

For `alerts` JSON:

- Keep `MAX_ALERTS_PER_FILE = 500`.
- Reject `context` if serialized size exceeds `8 KiB`.
- Truncate `url` to 2048 chars.

**Tests:**

- expired rate limit keys are removed.
- store size never exceeds `maxKeys`.
- repeated requests over limit return false.
- webgl oversized log file does not append.
- alerts oversized context rejects with `400`.

**Commands:**

```bash
bun test src/lib/server/__tests__/rate-limit.test.ts
```

---

### Task 6: Bound Search and Statistics Writes

**Files:**

- Modify: `src/app/api/search/analytics/route.ts`
- Modify: `src/app/api/stats/view/route.ts`
- Modify: `src/app/api/stats/download/route.ts`
- Modify if needed: `src/lib/stats/index.ts`
- Test: add route or library tests near existing stats tests

**Purpose:** Prevent bot traffic from creating unbounded JSON files and expensive whole-file rewrites.

**Required behavior for search analytics:**

- Max query length: `128` chars.
- Normalize whitespace.
- Reject control characters.
- Track at most `1000` unique queries.
- If the query is new and the cap is reached, either drop it or aggregate under `__other__`.
- Add per-IP rate limiting with bounded store from Task 5.

**Required behavior for view/download stats:**

- Max content ID length: `128` chars.
- Allowed content ID characters: `a-z`, `A-Z`, `0-9`, `_`, `-`.
- Add bounded per-IP rate limiting.
- Ensure stats files are created only inside `public/data/stats`.

**Tests:**

- search query longer than max rejects.
- search unique key cap is enforced.
- invalid content ID rejects.
- valid content ID still increments.
- rate-limited IP receives `429`.

**Commands:**

```bash
bun test
```

If full tests are too broad during implementation, run the new focused tests first, then full tests after Task 8.

---

### Task 7: Restore Type-Check and Build Safety

**Files:**

- Modify: `next.config.ts`
- Modify: `tsconfig.json` or `src/app/tools/ProtoType/tsconfig.json` only if that is the minimal correct fix.
- Modify: `src/app/tools/ProtoType/src/App.tsx`
- Modify: `src/app/tools/ProtoType/src/main.tsx`
- Modify: `src/app/tools/ProtoType/src/components/002_Header.tsx`
- Modify: `src/app/tools/ProtoType/src/components/010_ColorPalette.tsx`
- Modify: `src/app/tools/ProtoType/src/components/012_KeyLayout.tsx`
- Modify: `src/app/tools/ProtoType/src/gamesets/010_APIget.ts`
- Modify: `src/app/tools/ProtoType/src/gamesets/012_soundplay.ts`
- Modify: `src/app/tools/ProtoType/vite.config.ts`
- Modify: `src/app/workshop/page.tsx`

**Purpose:** Stop shipping code with TypeScript errors.

**Current known failures from `bun run type-check`:**

- `TS5097`: imports ending in `.tsx` or `.ts` without `allowImportingTsExtensions`.
- `TS2339`: `import.meta.env` type missing in ProtoType code.
- `TS2307`: Vite and `@vitejs/plugin-react` modules missing for nested ProtoType config.
- `TS2307`: `.wav` imports missing declarations.
- `TS2339`: `summary` and `description` accessed on `{}` in `src/app/workshop/page.tsx`.

**Required behavior:**

- `bun run type-check` must pass.
- `next.config.ts` must not set `typescript.ignoreBuildErrors: true` after errors are fixed.
- Do not add broad `any` unless a local external type boundary genuinely needs it.
- Prefer excluding nested Vite-only project files from the root Next type-check if they are not part of the Next app runtime.

**Implementation guidance:**

Preferred approach:

1. Determine whether `src/app/tools/ProtoType/src/`** is compiled as part of the Next app or only by the nested Vite project.
2. If Vite-only, exclude nested Vite config/source from root `tsconfig.json` and keep a separate nested `tsconfig` for that tool.
3. If it is used by Next, remove `.ts`/`.tsx` extensions from imports and add declarations for `.wav`.
4. Fix `src/app/workshop/page.tsx` by giving the relevant value a real interface instead of `{}`.
5. Change `next.config.ts`:

```ts
typescript: {
  ignoreBuildErrors: false,
},
```

or remove the `typescript` block entirely.

**Commands:**

```bash
bun run type-check
bun run build
```

Expected:

- Type-check exits `0`.
- Build exits `0`.

---

### Task 8: End-to-End Verification and Abuse Checks

**Files:**

- Create: `docs/plans/2026-05-08-production-stability-security-hardening-verification.md` if additional findings are discovered.
- No production code changes unless verification reveals a missed issue.

**Purpose:** Verify that the combined changes prevent the observed long-running and attack-driven failure modes.

**Manual verification commands:**

Run without an admin token in production mode:

```bash
$env:NODE_ENV="production"
Remove-Item Env:ADMIN_API_TOKEN -ErrorAction SilentlyContinue
bun run type-check
```

Start the app in a production-like environment and test:

```bash
$env:NODE_ENV="production"
$env:ADMIN_API_TOKEN="test-secret"
bun run build
bun run start
```

Using another terminal:

```bash
curl -i -X POST http://localhost:3010/api/cms/contents -H "Content-Type: application/json" -d "{\"id\":\"attack\",\"title\":\"Attack\"}"
```

Expected:

- `401 Unauthorized` or `403 Forbidden`.

Authenticated request:

```bash
curl -i -X POST http://localhost:3010/api/cms/contents -H "Authorization: Bearer test-secret" -H "Content-Type: application/json" -d "{\"id\":\"auth-test\",\"title\":\"Auth Test\"}"
```

Expected:

- Existing route behavior succeeds or reaches normal validation/storage behavior.

Oversized media:

```bash
curl -i -X POST http://localhost:3010/api/cms/media -H "Authorization: Bearer test-secret" -H "Content-Type: application/json" --data-binary "@large-media-payload.json"
```

Expected:

- `413 Payload Too Large` when decoded payload exceeds configured limit.

Rate limit/eviction:

- Simulate many unique IPs by unit test, not by real network traffic.
- Confirm `getRateLimitStoreSize()` never exceeds configured `maxKeys`.

Final verification:

```bash
bun run type-check
bun test
bun run build
```

Expected:

- All commands pass.

---

## Commit Plan

Use small commits so regressions are easy to isolate:

1. `security: add server admin request guard`
2. `security: protect cms content mutations`
3. `security: protect cms media mutations`
4. `security: fix admin api middleware matching`
5. `fix: bound monitoring rate limits and logs`
6. `fix: bound analytics and stats writes`
7. `fix: restore typecheck build safety`
8. `test: add production hardening verification coverage`

## Notes for Implementing Agents

- Do not remove public read access unless explicitly required by a task.
- Do not depend only on middleware for security. Every mutation route must guard itself.
- Do not add speculative authentication frameworks. Use the simple shared bearer-token guard unless the project owner requests a different auth system.
- Keep changes surgical. Avoid unrelated formatting and UI changes.
- If a task discovers a stronger root cause, document it in the verification notes before changing scope.

