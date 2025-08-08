#!/usr/bin/env node

const { spawn } = require("child_process");
const { execSync } = require("child_process");

console.log("Setting up test environment...");

// Run test setup first
try {
  execSync("node scripts/setup-test-env.js", { stdio: "inherit" });
  console.log("✅ Test environment setup completed");
} catch (error) {
  console.error("❌ Test environment setup failed:", error.message);
  process.exit(1);
}

console.log("Running Jest tests in batched mode...");

// Set environment variables
process.env.NODE_OPTIONS = "--max-old-space-size=24576";
process.env.NODE_ENV = "test";

// Run Jest with optimized settings
const jestArgs = [
  "--runInBand",
  "--no-cache",
  "--forceExit",
  "--maxConcurrency=1",
];

const jest = spawn("npx", ["jest", ...jestArgs], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

jest.on("close", (code) => {
  console.log(`Jest process exited with code ${code}`);
  process.exit(code);
});

jest.on("error", (error) => {
  console.error("Failed to start Jest process:", error);
  process.exit(1);
});
