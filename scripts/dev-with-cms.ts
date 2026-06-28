import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

type ProcSpec = {
	name: string;
	command: string;
	args: string[];
	env?: Record<string, string>;
};

const processes: Array<ReturnType<typeof spawn>> = [];
let shuttingDown = false;

async function isPortAvailable(port: number): Promise<boolean> {
	return await new Promise((resolve) => {
		const server = createServer();

		server.once("error", () => resolve(false));
		server.once("listening", () => {
			server.close(() => resolve(true));
		});

		server.listen(port);
	});
}

async function findAvailablePort(startPort: number): Promise<number> {
	for (let port = startPort; port < startPort + 20; port += 1) {
		if (await isPortAvailable(port)) {
			return port;
		}
	}

	throw new Error(
		`No available port found from ${startPort} to ${startPort + 19}`,
	);
}

function startProcess(spec: ProcSpec) {
	const child = spawn(spec.command, spec.args, {
		cwd: process.cwd(),
		stdio: "inherit",
		env: {
			...process.env,
			...spec.env,
		},
	});

	child.on("error", (error) => {
		console.error(`[dev-with-cms] Failed to start ${spec.name}`);
		console.error(error);
		shutdown(1);
	});

	child.on("exit", (code) => {
		if (shuttingDown) {
			return;
		}
		console.error(`[dev-with-cms] ${spec.name} exited with code ${code ?? 0}`);
		shutdown(code ?? 1);
	});

	processes.push(child);
	return child;
}

function shutdown(code: number) {
	if (shuttingDown) {
		return;
	}
	shuttingDown = true;

	for (const child of processes) {
		if (!child.killed) {
			child.kill("SIGTERM");
		}
	}

	setTimeout(() => process.exit(code), 150);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startProcess({
	name: "Rust CMS API",
	command: process.execPath,
	args: ["./scripts/dev-cms-api.ts"],
	env: {
		CMS_API_HOST: process.env.CMS_API_HOST || "127.0.0.1",
		CMS_API_PORT: process.env.CMS_API_PORT || "3001",
		CMS_API_DATA_DIR: process.env.CMS_API_DATA_DIR || "./data/db",
	},
});

const cmsApiBaseUrl =
	process.env.CMS_API_BASE_URL ||
	`http://${process.env.CMS_API_HOST || "127.0.0.1"}:${process.env.CMS_API_PORT || "3001"}`;

async function waitForCmsApi() {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		try {
			const response = await fetch(`${cmsApiBaseUrl}/health`);
			if (response.ok) {
				return;
			}
		} catch {
			// Retry until ready.
		}
		await delay(1000);
	}
	throw new Error(
		`Timed out waiting for Rust CMS API at ${cmsApiBaseUrl}/health`,
	);
}

waitForCmsApi()
	.then(async () => {
		const nextPort = await findAvailablePort(
			Number(process.env.PORT || process.env.NEXT_DEV_PORT || "3010"),
		);

		startProcess({
			name: "Next.js dev server",
			command: "bun",
			args: ["--bun", "next", "dev", "-p", String(nextPort)],
			env: {
				CMS_USE_RUST_API: process.env.CMS_USE_RUST_API || "1",
				CMS_API_BASE_URL: cmsApiBaseUrl,
				PORT: String(nextPort),
				NEXT_PUBLIC_SITE_URL:
					process.env.NEXT_PUBLIC_SITE_URL || `http://127.0.0.1:${nextPort}`,
			},
		});
	})
	.catch((error) => {
		console.error(`[dev-with-cms] ${String(error)}`);
		shutdown(1);
	});
