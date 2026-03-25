import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type BindingValue =
	| string
	| number
	| bigint
	| boolean
	| null
	| Uint8Array
	| Buffer;

type BindingRecord = Record<string, BindingValue>;
type BindingInput = BindingRecord | BindingValue;

interface BunStatement<Row = unknown> {
	all(...params: unknown[]): Row[];
	get(...params: unknown[]): Row | null;
	run(...params: unknown[]): { changes: number; lastInsertRowid: number };
	values(...params: unknown[]): unknown[][];
}

interface BunDatabase {
	prepare<Row = unknown>(sql: string): BunStatement<Row>;
	run(
		sql: string,
		params?: BindingInput,
	): { changes: number; lastInsertRowid: number };
	exec(
		sql: string,
		params?: BindingInput,
	): { changes: number; lastInsertRowid: number };
	close(throwOnError?: boolean): void;
}

type BunDatabaseCtor = new (
	filename: string,
	options?: {
		readonly?: boolean;
		create?: boolean;
		readwrite?: boolean;
		safeIntegers?: boolean;
		strict?: boolean;
	},
) => BunDatabase;

let _bunSqlite: { Database: BunDatabaseCtor } | null = null;

function getBunSqlite(): { Database: BunDatabaseCtor } {
	if (_bunSqlite) return _bunSqlite;

	if (typeof Bun === "undefined") {
		throw new Error(
			"bun:sqlite is only available in Bun runtime. This code must be run with Bun.",
		);
	}

	_bunSqlite = require("bun:sqlite") as { Database: BunDatabaseCtor };
	return _bunSqlite;
}

function normalizeBindingObject(record: BindingRecord): BindingRecord {
	const normalized: BindingRecord = {};
	for (const [key, value] of Object.entries(record)) {
		normalized[key] = value;
		if (!key.startsWith("$") && !key.startsWith(":") && !key.startsWith("@")) {
			normalized[`$${key}`] = value;
			normalized[`:${key}`] = value;
			normalized[`@${key}`] = value;
		}
	}
	return normalized;
}

function normalizeArgs(args: unknown[]): unknown[] {
	if (args.length === 1 && args[0] && typeof args[0] === "object") {
		if (
			!ArrayBuffer.isView(args[0]) &&
			!Buffer.isBuffer(args[0]) &&
			!Array.isArray(args[0])
		) {
			return [normalizeBindingObject(args[0] as BindingRecord)];
		}
	}
	return args;
}

export interface SqliteRunResult {
	changes: number;
	lastInsertRowid: number;
}

export interface SqliteStatement<Row = unknown> {
	all(...params: unknown[]): Row[];
	get(...params: unknown[]): Row | undefined;
	run(...params: unknown[]): SqliteRunResult;
	values(...params: unknown[]): unknown[][];
}

export interface SqliteDatabase {
	prepare<Row = unknown>(sql: string): SqliteStatement<Row>;
	exec(sql: string): SqliteRunResult;
	pragma(sql: string): void;
	close(): void;
}

class BunSqliteStatement<Row = unknown> implements SqliteStatement<Row> {
	constructor(private readonly statement: BunStatement<Row>) {}

	all(...params: unknown[]): Row[] {
		return this.statement.all(...normalizeArgs(params));
	}

	get(...params: unknown[]): Row | undefined {
		return this.statement.get(...normalizeArgs(params)) ?? undefined;
	}

	run(...params: unknown[]): SqliteRunResult {
		return this.statement.run(...normalizeArgs(params));
	}

	values(...params: unknown[]): unknown[][] {
		return this.statement.values(...normalizeArgs(params));
	}
}

class BunSqliteDatabase implements SqliteDatabase {
	private readonly db: BunDatabase;

	constructor(filename: string, readonly = false) {
		const { Database } = getBunSqlite();
		this.db = new Database(filename, {
			create: !readonly,
			readonly,
			readwrite: !readonly,
		});
	}

	prepare<Row = unknown>(sql: string): SqliteStatement<Row> {
		return new BunSqliteStatement(this.db.prepare<Row>(sql));
	}

	exec(sql: string): SqliteRunResult {
		return this.db.exec(sql);
	}

	pragma(sql: string): void {
		this.db.exec(`PRAGMA ${sql};`);
	}

	close(): void {
		this.db.close();
	}
}

export function openSqliteDb(
	filename: string,
	options?: { readonly?: boolean },
): SqliteDatabase {
	return new BunSqliteDatabase(filename, options?.readonly ?? false);
}
