import Database from "better-sqlite3";
import { saveFullContent } from "../content-mapper";

function createSchema(db: Database.Database) {
	db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE contents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      public_url TEXT,
      summary TEXT,
      lang TEXT,
      parent_id TEXT,
      ancestor_ids TEXT,
      path TEXT,
      depth INTEGER,
      "order" INTEGER,
      child_count INTEGER,
      visibility TEXT,
      status TEXT,
      published_at TEXT,
      unpublished_at TEXT,
      search_full_text TEXT,
      search_tokens TEXT,
      version INTEGER,
      version_latest_id TEXT,
      version_previous_id TEXT,
      version_history_ref TEXT,
      permissions_readers TEXT,
      permissions_editors TEXT,
      permissions_owner TEXT,
      thumbnails TEXT,
      searchable TEXT,
      i18n TEXT,
      seo TEXT,
      cache TEXT,
      private_data TEXT,
      ext TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_accessed_at TEXT
    );

    CREATE TABLE media (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      filename TEXT,
      mime_type TEXT,
      size INTEGER,
      width INTEGER,
      height INTEGER,
      alt TEXT,
      description TEXT,
      tags TEXT,
      data BLOB,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
    );
  `);
}

describe("saveFullContent", () => {
	test("does not delete media rows via FK cascade on update", () => {
		const db = new Database(":memory:");
		try {
			createSchema(db);

			const contentId = "example";
			const now = new Date().toISOString();

			saveFullContent(db, {
				id: contentId,
				title: "Example",
				status: "draft",
				visibility: "draft",
				createdAt: now,
				updatedAt: now,
			});

			db.prepare(
				"INSERT INTO media (id, content_id, filename, mime_type, size, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			).run(
				"media_1",
				contentId,
				"example.png",
				"image/png",
				3,
				Buffer.from([1, 2, 3]),
				now,
				now,
			);

			// Update content (previously `INSERT OR REPLACE` would delete the row first and cascade-delete media)
			saveFullContent(db, {
				id: contentId,
				title: "Example Updated",
				status: "draft",
				visibility: "draft",
				createdAt: now,
				updatedAt: new Date(Date.now() + 1000).toISOString(),
			});

			const mediaCount = db
				.prepare("SELECT COUNT(*) as c FROM media WHERE content_id = ?")
				.get(contentId).c as number;
			expect(mediaCount).toBe(1);
		} finally {
			db.close();
		}
	});
});

