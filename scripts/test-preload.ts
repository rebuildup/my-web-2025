/**
 * Bun test preload. Runs before any test module is loaded so we can
 * redirect `CONTENT_DATA_DIR` to a sandbox directory. The CMS modules
 * (notably `src/cms/lib/content-db-manager.ts`) resolve the data dir
 * once at module load time via `resolveDataDirectory()`, so this MUST
 * run before those modules are imported.
 */

import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEST_ROOT = mkdtempSync(join(tmpdir(), "cms-test-data-"));
process.env.CONTENT_DATA_DIR = TEST_ROOT;

process.on("exit", () => {
	try {
		if (existsSync(TEST_ROOT)) {
			rmSync(TEST_ROOT, { recursive: true, force: true });
		}
	} catch {
		// best-effort cleanup
	}
});
