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
    // Read and execute the migration SQL
    let migration_sql = include_str!("migrations/001_init.sql");

    // Split by semicolons and execute each statement after removing SQL comments.
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

    Ok(())
}

/// Initialize database at a specific path
pub async fn create_pool_at(path: &std::path::Path) -> Result<DbPool, sqlx::Error> {
    let database_url = format!("sqlite:{}?mode=rwc", path.display());
    create_pool(&database_url).await
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
}
