import { expect, test } from "bun:test";
import { openSqliteDb } from "../sqlite";

test("sqlite adapter supports @named bindings", () => {
	const db = openSqliteDb(":memory:");

	try {
		db.exec(`
      CREATE TABLE example (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL
      )
    `);

		db.prepare("INSERT INTO example (id, title) VALUES (@id, @title)").run({
			id: "entry-1",
			title: "Hello",
		});

		const row = db
			.prepare<{ id: string; title: string }>(
				"SELECT id, title FROM example WHERE id = @id",
			)
			.get({ id: "entry-1" });

		expect(row).toEqual({
			id: "entry-1",
			title: "Hello",
		});
	} finally {
		db.close();
	}
});
