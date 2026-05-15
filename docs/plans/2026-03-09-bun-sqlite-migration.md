# Bun SQLite Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `better-sqlite3` and `pnpm` usage with Bun-native SQLite and Bun package/runtime support, then verify existing content databases still load and save correctly.

**Architecture:** Add a thin SQLite adapter around `bun:sqlite` that preserves the small `better-sqlite3` surface the CMS currently uses. Migrate call sites to the adapter instead of rewriting every SQL call. Split test execution so Bun-specific SQLite tests run under `bun test` while existing DOM tests stay on Jest.

**Tech Stack:** Next.js 16, Bun 1.3, `bun:sqlite`, Jest, Bun test

---

### Task 1: Add adapter and Bun-focused tests

**Files:**
- Create: `src/cms/lib/sqlite.ts`
- Create: `src/cms/lib/__tests__/sqlite.bun.test.ts`
- Create: `src/cms/lib/__tests__/content-mapper.media-cascade.bun.test.ts`
- Modify: `jest.config.js`

**Step 1:** Add an adapter that exposes `prepare`, `run`, `exec`, `pragma`, and `close` on top of `bun:sqlite`.

**Step 2:** Add a Bun test proving named `@field` bindings work through the adapter.

**Step 3:** Port the media cascade regression test to Bun so the CMS write path is exercised against the new adapter/runtime.

### Task 2: Move CMS and scripts to the adapter

**Files:**
- Modify: `src/cms/lib/content-db-manager.ts`
- Modify: `src/cms/lib/content-mapper.ts`
- Modify: `src/cms/lib/markdown-mapper.ts`
- Modify: `src/cms/lib/media-manager.ts`
- Modify: `src/cms/server/markdown-service.ts`
- Modify: `src/app/api/cms/markdown/route.ts`
- Modify: `scripts/migrate-index-metadata.ts`
- Modify: `scripts/migrate-markdown-to-content.ts`
- Modify: `scripts/repair-cms-thumbnails.ts`

**Step 1:** Replace `better-sqlite3` types/imports with the adapter types.

**Step 2:** Keep SQL unchanged where possible and adapt only the handful of named-parameter and open-mode calls.

**Step 3:** Ensure read-only migration scripts and media/blob reads still work.

### Task 3: Update package/runtime/deploy config

**Files:**
- Modify: `package.json`
- Delete: `scripts/install-hooks.js`
- Modify: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Modify: `documents/06_deploy.md`

**Step 1:** Switch package manager and scripts to Bun.

**Step 2:** Remove `better-sqlite3`-specific install hooks and build prerequisites.

**Step 3:** Make CI and deployment build/install/run through Bun.

### Task 4: Verify existing content data

**Files:**
- Create: `scripts/migrate-bun-sqlite.ts`

**Step 1:** Walk every `data/contents/*.db` file with the adapter.

**Step 2:** Run integrity checks and round-trip content/markdown rows through the migrated code path.

**Step 3:** Record the outcome through command output and keep the migrated `.db` files if they are rewritten as part of verification.
