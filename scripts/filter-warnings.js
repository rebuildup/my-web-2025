#!/usr/bin/env node
/**
 * Filter out baseline-browser-mapping warnings from command output
 */

const { spawn } = require("node:child_process");

const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

const child = spawn(command, commandArgs, {
	stdio: ["inherit", "inherit", "pipe"],
	shell: true,
});

let stderrBuffer = "";

child.stderr.on("data", (data) => {
	const chunk = data.toString();
	stderrBuffer += chunk;

	// Filter out baseline-browser-mapping warnings
	const lines = stderrBuffer.split("\n");
	stderrBuffer = lines.pop() || ""; // Keep incomplete line in buffer

	for (const line of lines) {
		if (!line.includes("baseline-browser-mapping")) {
			process.stderr.write(`${line}\n`);
		}
	}
});

child.stderr.on("end", () => {
	// Process remaining buffer
	if (stderrBuffer && !stderrBuffer.includes("baseline-browser-mapping")) {
		process.stderr.write(stderrBuffer);
	}
});

child.on("exit", (code) => {
	process.exit(code || 0);
});
