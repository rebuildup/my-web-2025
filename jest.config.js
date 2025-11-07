const nextJest = require("next/jest");

const createJestConfig = nextJest({
	dir: "./",
});

/** @type {import('jest').Config} */
module.exports = createJestConfig({
	testEnvironment: "jsdom",
	modulePathIgnorePatterns: [".next/"],
	testPathIgnorePatterns: [
		"/node_modules/",
		"/.next/",
		"/scripts/.*\\.spec\\.ts$", // Playwright spec files
	],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	setupFilesAfterEnv: ["<rootDir>/scripts/setup-test-env.js"],
});
