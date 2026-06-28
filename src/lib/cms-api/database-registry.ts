import { promises as fs } from "node:fs";
import path from "node:path";

type DatabaseMeta = {
	name?: string;
	description?: string;
};

type RegistryFile = {
	entries?: Record<string, DatabaseMeta>;
};

export type CmsDatabaseInfo = {
	id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	size: number;
	isActive: boolean;
};

function getDataDir(): string {
	return process.env.CMS_API_DATA_DIR
		? path.resolve(process.env.CMS_API_DATA_DIR)
		: path.resolve(process.cwd(), "data/db");
}

function getRegistryPath(): string {
	return path.join(getDataDir(), "database-registry.json");
}

function getActiveDatabaseFilename(): string {
	const databaseUrl = process.env.CMS_API_DATABASE_URL;
	if (!databaseUrl) return "cms-api-dev.db";
	const matched = databaseUrl.match(/sqlite:(.+?)(?:\?|$)/);
	if (!matched?.[1]) return "cms-api-dev.db";
	return path.basename(matched[1]);
}

async function ensureDataDir(): Promise<void> {
	await fs.mkdir(getDataDir(), { recursive: true });
}

async function readRegistry(): Promise<RegistryFile> {
	try {
		const raw = await fs.readFile(getRegistryPath(), "utf8");
		return JSON.parse(raw) as RegistryFile;
	} catch {
		return {};
	}
}

async function writeRegistry(registry: RegistryFile): Promise<void> {
	await ensureDataDir();
	await fs.writeFile(
		getRegistryPath(),
		JSON.stringify(registry, null, 2),
		"utf8",
	);
}

export async function listCmsDatabases(): Promise<CmsDatabaseInfo[]> {
	await ensureDataDir();
	const registry = await readRegistry();
	const entries = await fs.readdir(getDataDir(), { withFileTypes: true });
	const dbFiles = entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".db"))
		.map((entry) => entry.name)
		.sort();

	const activeFile = getActiveDatabaseFilename();
	const allFiles = dbFiles.includes(activeFile)
		? dbFiles
		: [...dbFiles, activeFile];

	const results = await Promise.all(
		allFiles.map(async (file) => {
			const filePath = path.join(getDataDir(), file);
			let stat: Awaited<ReturnType<typeof fs.stat>> | null = null;
			try {
				stat = await fs.stat(filePath);
			} catch {
				stat = null;
			}

			const meta = registry.entries?.[file];
			return {
				id: file,
				name: meta?.name || file.replace(/\.db$/i, ""),
				description:
					meta?.description ||
					(file === activeFile
						? "現在 Rust CMS API が使用しているアクティブデータベースです."
						: "検出された SQLite データベースファイルです."),
				createdAt: stat?.birthtime.toISOString() ?? new Date(0).toISOString(),
				updatedAt: stat?.mtime.toISOString() ?? new Date(0).toISOString(),
				size: stat?.size ?? 0,
				isActive: file === activeFile,
			} satisfies CmsDatabaseInfo;
		}),
	);

	return results.sort((a, b) => Number(b.isActive) - Number(a.isActive));
}

export async function updateCmsDatabaseMeta(
	id: string,
	patch: DatabaseMeta,
): Promise<CmsDatabaseInfo | null> {
	const list = await listCmsDatabases();
	const current = list.find((item) => item.id === id);
	if (!current) return null;

	const registry = await readRegistry();
	registry.entries = registry.entries || {};
	registry.entries[id] = {
		name: patch.name ?? current.name,
		description: patch.description ?? current.description,
	};
	await writeRegistry(registry);

	const refreshed = await listCmsDatabases();
	return refreshed.find((item) => item.id === id) ?? null;
}
