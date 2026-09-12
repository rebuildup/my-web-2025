use sqlx::SqlitePool;

// Re-export types
pub use sqlx::SqlitePool as DbPool;

/// Create a SQLite database pool and run migrations
pub async fn create_pool(database_url: &str) -> Result<DbPool, sqlx::Error> {
    // Create the database pool
    let pool = SqlitePool::connect(database_url).await?;

    // Run migrations using the embedded SQL
    run_migrations(&pool).await?;

    Ok(pool)
}

/// Run database migrations
async fn run_migrations(pool: &DbPool) -> Result<(), sqlx::Error> {
    // Migrations are applied in numeric order. Each file is split on `;`
    // and statement comments (`-- …`) are stripped before execution. New
    // migration files must be added here in order — there is no automatic
    // discovery because the Container image build is deterministic and we
    // want the migration set pinned at compile time.
    const MIGRATION_FILES: &[&str] = &[
        include_str!("migrations/001_init.sql"),
        include_str!("migrations/002_list_index_public_only.sql"),
    ];

    for migration_sql in MIGRATION_FILES {
        for statement in migration_sql.split(';') {
            let cleaned = statement
                .lines()
                .map(str::trim)
                .filter(|line| !line.is_empty() && !line.starts_with("--"))
                .collect::<Vec<_>>()
                .join("\n");

            if !cleaned.is_empty() {
                sqlx::query(&cleaned).execute(pool).await?;
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_in_memory_pool() {
        let pool = create_pool("sqlite::memory:").await.unwrap();
        let result: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM entries")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(result, (0,));
    }

    /// Migration 002 must restrict `list_index` to published + public/unlisted
    /// entries and add `list_index_admin` for the unfiltered rowset. Anonymous
    /// `/api/entries` calls go through `list_index`; admin tooling goes through
    /// `list_index_admin`. Without this, drafts/private entries leak.
    #[tokio::test]
    async fn test_list_index_filters_status_and_visibility() {
        let pool = create_pool("sqlite::memory:").await.unwrap();

        // Seed: one published-public, one draft, one archived-private.
        sqlx::query("INSERT INTO entries (id, status, visibility, title) VALUES (?,?,?,?)")
            .bind("e-pub")
            .bind("published")
            .bind("public")
            .bind("Public one")
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("INSERT INTO entries (id, status, visibility, title) VALUES (?,?,?,?)")
            .bind("e-draft")
            .bind("draft")
            .bind("private")
            .bind("Draft one")
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("INSERT INTO entries (id, status, visibility, title) VALUES (?,?,?,?)")
            .bind("e-archived")
            .bind("archived")
            .bind("private")
            .bind("Archived one")
            .execute(&pool)
            .await
            .unwrap();
        // Also: published-private should be hidden too.
        sqlx::query("INSERT INTO entries (id, status, visibility, title) VALUES (?,?,?,?)")
            .bind("e-pub-private")
            .bind("published")
            .bind("private")
            .bind("Published but private")
            .execute(&pool)
            .await
            .unwrap();

        let public_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM list_index")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(
            public_count.0, 1,
            "list_index must show only published+public"
        );

        let admin_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM list_index_admin")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(admin_count.0, 4, "list_index_admin shows all non-deleted");
    }
}
