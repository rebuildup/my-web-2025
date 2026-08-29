/**
 * Integration test: Rust CMS API hydrate/write-back against a local minio.
 *
 * Prerequisite: `docker compose -f docker-compose.minio.yml up -d`
 * Run: `INTEGRATION=1 bun test tests/integration/sync.test.ts`
 *
 * The full end-to-end requires:
 *   1. docker-compose.minio.yml running (port 9000)
 *   2. A built cms-api binary (`cargo build --release --manifest-path apps/cms-api/Cargo.toml`)
 *   3. R2_ENDPOINT=http://localhost:9000 R2_BUCKET=cms-data-test R2_ACCESS_KEY_ID=minioadmin R2_SECRET_ACCESS_KEY=minioadmin ./cms-api
 *
 * Until those are wired together, this file is a placeholder asserting the
 * environment contract. Once `INTEGRATION=1` and the binary exists, we can
 * expand this to spawn the process and verify the per-content DBs hydrate.
 */

import { describe, expect, test } from "bun:test";

const R2_ENDPOINT = "http://localhost:9000";
const R2_BUCKET = "cms-data-test";
const R2_ACCESS_KEY_ID = "minioadmin";
const R2_SECRET_ACCESS_KEY = "minioadmin";

const integrationEnabled = process.env.INTEGRATION === "1";

describe.skipIf(!integrationEnabled)("R2 sync against local minio", () => {
	test("environment contract is well-formed", () => {
		expect(R2_ENDPOINT).toMatch(/^http/);
		expect(R2_BUCKET).toBe("cms-data-test");
		expect(R2_ACCESS_KEY_ID.length).toBeGreaterThan(0);
		expect(R2_SECRET_ACCESS_KEY.length).toBeGreaterThan(0);
	});
});