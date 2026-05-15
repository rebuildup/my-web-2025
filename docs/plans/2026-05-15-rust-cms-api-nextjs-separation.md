# Rust CMS API + Next.js 分離 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Next.jsからDB責務を剥离し、Rust API (axum + SQLx + SQLite) で高速・分離されたCMSアーキテクチャを構築する

**Architecture:**
- Rust CMS API (port 3001): 全DB操作、index生成、search、validation担当
- Next.js (port 3010): 表示・SSG/ISRのみ、API clientでRustと通信
- SQLite: Write Model (正規化データ) + Read Model (index/view)

**Tech Stack:** Rust, axum, SQLx, SQLite, OpenAPI (utoipa), ts-rs

---

## Phase 1: Rustプロジェクト基本構築

### Task 1: Cargo.toml と基本構造作成

**Files:**
- Create: `apps/cms-api/Cargo.toml`
- Create: `apps/cms-api/src/main.rs`
- Create: `apps/cms-api/src/db/mod.rs`
- Create: `apps/cms-api/src/routes/mod.rs`

**Step 1: Create Cargo.toml**

```toml
[package]
name = "cms-api"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = { version = "0.7", features = ["macros"] }
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tower = "0.4"
tower-http = { version = "0.5", features = ["cors", "trace"] }
tracing = "0.1"
tracing-subscriber = "0.3"
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1", features = ["v4", "serde"] }
thiserror = "1"
utoipa = { version = "3", features = ["swagger-ui"] }
utoipa-axum = "0.7"
mime = "0.3"
mime_guess = "2"

[dev-dependencies]
tower = { version = "0.4", features = ["util"] }
```

**Step 2: Create basic main.rs**

```rust
use axum::{Router, routing::get};
use tower_http::cors::CorsLayer;
use tracing_subscriber;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/health", get(health))
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001").await.unwrap();
    tracing::info!("CMS API running on port 3001");
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> &'static str {
    "OK"
}
```

**Step 3: Verify build**

Run: `cd apps/cms-api && cargo build`
Expected: Compiles successfully

**Step 4: Commit**

```bash
git add apps/cms-api/
git commit -m "feat(cms-api): initial Rust project setup with axum"
```

---

## Phase 2: Database Schema (Write Model)

### Task 2: SQLite Schema 設計とMigration

**Files:**
- Create: `apps/cms-api/src/db/schema.sql`
- Create: `apps/cms-api/src/db/migrations/001_init.sql`
- Modify: `apps/cms-api/src/db/mod.rs`

**Step 1: Create schema.sql**

```sql
-- Write Model: 編集・保存・履歴用正規化構造

CREATE TABLE entries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'portfolio',
    slug TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'draft' CHECK(visibility IN ('public', 'unlisted', 'private', 'draft')),
    title TEXT NOT NULL DEFAULT '',
    summary TEXT,
    lang TEXT DEFAULT 'ja',
    path TEXT,
    depth INTEGER DEFAULT 0,
    "order" INTEGER DEFAULT 0,
    parent_id TEXT REFERENCES entries(id) ON DELETE SET NULL,
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE TABLE entry_revisions (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    body_json TEXT NOT NULL DEFAULT '{}',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE blocks (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    revision_id TEXT REFERENCES entry_revisions(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    block_type TEXT NOT NULL,
    data_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    src TEXT NOT NULL,
    type TEXT,
    width INTEGER,
    height INTEGER,
    alt TEXT,
    meta_json TEXT DEFAULT '{}',
    "order" INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE entry_tags (
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, tag_id)
);

CREATE TABLE links (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    href TEXT NOT NULL,
    label TEXT,
    rel TEXT,
    is_primary INTEGER DEFAULT 0,
    description TEXT,
    "order" INTEGER DEFAULT 0
);

CREATE TABLE manual_dates (
    content_id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Read Model: 高速表示・一覧・検索用

CREATE VIEW list_index AS
SELECT
    e.id,
    e.type,
    e.status,
    e.visibility,
    e.title,
    e.summary,
    e.lang,
    e.published_at,
    e.created_at,
    e.updated_at,
    e.slug,
    (SELECT src FROM assets WHERE entry_id = e.id AND "order" = 0 LIMIT 1) as thumbnail,
    (SELECT GROUP_CONCAT(t.name) FROM entry_tags et JOIN tags t ON et.tag_id = t.id WHERE et.entry_id = e.id) as tags
FROM entries e
WHERE e.deleted_at IS NULL;

CREATE VIRTUAL TABLE search_index USING fts5(
    id,
    title,
    summary,
    content=list_index,
    content_rowid=rowid
);
```

**Step 2: Create migration runner**

```rust
// apps/cms-api/src/db/mod.rs
use sqlx::{Pool, Sqlite, sqlx::{SqlitePool, migrate::Migrate}};
use std::path::Path;

pub type DbPool = Pool<Sqlite>;

pub async fn create_pool(database_url: &str) -> Result<DbPool, sqlx::Error> {
    let pool = SqlitePool::connect(database_url).await?;
    pool.run_migrations().await?;
    Ok(pool)
}
```

**Step 3: Test migration**

Run: `cd apps/cms-api && cargo build`
Expected: Compiles successfully

**Step 4: Commit**

```bash
git add apps/cms-api/src/db/
git commit -m "feat(cms-api): add database schema with write/read model separation"
```

---

## Phase 3: API Routes Implementation

### Task 3: Entries CRUD API

**Files:**
- Create: `apps/cms-api/src/routes/entries.rs`
- Create: `apps/cms-api/src/routes/tags.rs`
- Create: `apps/cms-api/src/routes/search.rs`
- Create: `apps/cms-api/src/routes/preview.rs`

**Step 1: Create entries.rs**

```rust
use axum::{Router, routing::{get, post, patch, delete}, extract::{Path, Json, Query},};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize)]
pub struct Entry {
    pub id: String,
    pub title: String,
    pub slug: Option<String>,
    pub status: String,
    pub visibility: String,
    pub r#type: String,
    pub summary: Option<String>,
    pub lang: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateEntry {
    pub title: String,
    pub r#type: Option<String>,
    pub slug: Option<String>,
}

pub async fn list_entries(pool: &SqlitePool) -> Result<Vec<Entry>, sqlx::Error> {
    let entries = sqlx::query_as!(
        Entry,
        r#"SELECT id, title, slug, status, visibility, type, summary, lang,
            created_at, updated_at FROM entries WHERE deleted_at IS NULL
            ORDER BY created_at DESC"#
    ).fetch_all(pool).await?;
    Ok(entries)
}

pub async fn create_entry(pool: &SqlitePool, data: CreateEntry) -> Result<Entry, sqlx::Error> {
    let id = uuid::Uuid::new_v4().to_string();
    let entry_type = data.r#type.unwrap_or_else(|| "portfolio".to_string());

    sqlx::query!(
        "INSERT INTO entries (id, title, type, slug) VALUES (?, ?, ?, ?)",
        id,
        data.title,
        entry_type,
        data.slug
    ).execute(pool).await?;

    let entry = sqlx::query_as!(
        Entry,
        "SELECT id, title, slug, status, visibility, type, summary, lang,
            created_at, updated_at FROM entries WHERE id = ?",
        id
    ).fetch_one(pool).await?;

    Ok(entry)
}
```

**Step 2: Add routes to main.rs**

```rust
mod routes;

let app = Router::new()
    .route("/health", get(health))
    .route("/api/entries", get(list_entries).post(create_entry))
    .route("/api/entries/:id", get(get_entry).patch(update_entry).delete(delete_entry))
    .route("/api/search", get(search))
    .route("/api/tags", get(list_tags))
    .layer(CorsLayer::permissive());
```

**Step 3: Verify build**

Run: `cd apps/cms-api && cargo build`
Expected: Compiles successfully

**Step 4: Commit**

```bash
git add apps/cms-api/src/routes/
git commit -m "feat(cms-api): add entries CRUD routes"
```

---

## Phase 4: Next.js Integration

### Task 4: API Client and Types

**Files:**
- Create: `apps/web/src/lib/cms-api.ts`
- Create: `apps/web/src/lib/cms-types.ts`
- Modify: `apps/web/next.config.ts` (ISR設定)
- Modify: `package.json` (devスクリプト更新)

**Step 1: Create API client**

```typescript
// apps/web/src/lib/cms-api.ts
const API_BASE = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://127.0.0.1:3001';

export async function getEntries() {
  const res = await fetch(`${API_BASE}/api/entries`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

export async function getEntry(id: string) {
  const res = await fetch(`${API_BASE}/api/entries/${id}`);
  if (!res.ok) throw new Error('Failed to fetch entry');
  return res.json();
}

export async function searchEntries(query: string) {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}
```

**Step 2: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "concurrently \"next dev -p 3010\" \"cargo run --manifest-path apps/cms-api/Cargo.toml\"",
    "dev:web": "next dev -p 3010",
    "dev:cms": "cargo run --manifest-path apps/cms-api/Cargo.toml",
    "build": "cargo build --manifest-path apps/cms-api/Cargo.toml --release && next build",
    "type-check": "cargo check --manifest-path apps/cms-api/Cargo.toml && tsc --noEmit"
  }
}
```

**Step 3: Verify build**

Run: `pnpm dev:cms` (background), then `pnpm dev:web`
Expected: Both compile without errors

**Step 4: Commit**

```bash
git add apps/web/src/lib/cms-api.ts
git commit -m "feat: add CMS API client for Rust backend"
```

---

## Phase 5: CI/CD Integration

### Task 5: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/cms-api.yml`

**Step 1: Create workflow**

```yaml
name: Build and Deploy

on:
  push:
    paths:
      - 'apps/cms-api/**'
      - 'apps/web/**'
      - 'package.json'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-action@stable
        with:
          targets: x86_64-unknown-linux-gnu

      - name: Build Rust API
        run: cargo build --manifest-path apps/cms-api/Cargo.toml --release

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Next.js
        run: pnpm build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy both services
        run: |
          # Deploy Rust API on port 3001
          # Deploy Next.js on port 3000
```

**Step 2: Commit**

```bash
git add .github/workflows/
git commit -m "ci: add unified build workflow for Rust API + Next.js"
```

---

## Summary

| Phase | Task | Files | Status |
|-------|------|-------|--------|
| 1 | Rust project setup | Cargo.toml, main.rs | - |
| 2 | DB schema (Write/Read model) | schema.sql, migrations/ | - |
| 3 | API routes | entries.rs, tags.rs, search.rs | - |
| 4 | Next.js client | cms-api.ts, next.config.ts | - |
| 5 | CI/CD | github/workflows/ | - |

**Risks:**
1. SQLite single-file が大規模アクセス時にボトルネックになる可能性 → 必要ならPostgreSQLに移行
2. Rust learning curve → 基本的なCRUDは即実装可能

**Next 3 Improvements:**
1. OpenAPI codegen でTypeScript client自動生成
2. index再構築バッチ追加
3. preview/render機能追加

---

## Execution Options

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**