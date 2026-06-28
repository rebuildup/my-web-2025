import { spawn } from "node:child_process";

const host = process.env.CMS_API_HOST || "127.0.0.1";
const port = process.env.CMS_API_PORT || "3001";
const dataDir = process.env.CMS_API_DATA_DIR || "./data/db";
const command = "docker";
const args = ["compose", "-f", "docker-compose.cms-api.yml", "up"];

const child = spawn(command, args, {
	cwd: ".",
	stdio: "inherit",
	env: {
		...process.env,
		CMS_API_HOST: host,
		CMS_API_PORT: port,
		CMS_API_DATA_DIR: dataDir,
	},
});

child.on("error", (error) => {
	console.error(
		"[dev-cms-api] Failed to start Rust CMS API with Docker. Install Docker Desktop or Docker Engine and try again.",
	);
	console.error(error);
	process.exit(1);
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 0);
});
