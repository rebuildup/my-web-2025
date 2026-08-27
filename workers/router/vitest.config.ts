import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Pure-JS unit tests for routing rules. Cloudflare runtime tests are
		// out of scope here — integration is verified by Playwright against
		// the deployed staging URL (Task 23 of the Cloudflare deploy plan).
		environment: "node",
		include: ["src/**/*.test.ts"],
	},
});