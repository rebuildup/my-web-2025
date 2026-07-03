# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A comprehensive portfolio and CMS platform built with Next.js 16 (App Router), featuring an integrated admin dashboard, 3D graphics (Three.js/R3F), and a local-first SQLite-based content management system.

**Key Architecture Decision**: Content is stored in per-item SQLite databases (one `.db` file per content item) located in `data/contents/`, not in a single monolithic database. Each content item gets its own isolated database with full-text search, tags, media, and markdown tables.

## Commands

```bash
# Development (with Turbopack, port 3010)
bun dev

# Production build
bun run build

# Type checking
bun run type-check

# Testing
bun run test

# Linting (Biome)
bun run lint

# Formatting
bun run format
```

**Environment**: Requires `NEXT_PUBLIC_GA_ID` to be set in `.env.local` before building.

### WSLc (Container Development)

```bash
# Build image
wslc build -t my-web-2025 .

# Run dev server (port 3010)
wslc run -d --name my-web-2025-dev -p 3010:3010 my-web-2025

# Check logs
wslc logs my-web-2025-dev

# Stop / remove
wslc stop my-web-2025-dev
wslc remove my-web-2025-dev
```

Access at `http://localhost:3010`. The container uses `bun --bun next dev -p 3010` internally.

## Architecture

### Content Management System (CMS)

The CMS uses a **distributed SQLite architecture**:

- **Per-content databases**: Each content item has its own SQLite database at `data/contents/content-{id}.db`
- **No JSON files**: Content is not stored as JSON; all queries go through SQLite
- **Key files**:
  - `src/cms/lib/content-db-manager.ts`: Database connection, schema initialization, index aggregation
  - `src/cms/lib/content-mapper.ts`: Maps between database rows and `Content` type
  - `src/cms/server/content-service.ts`: Server-side CRUD operations
  - `src/cms/types/content.ts`: Core `Content` interface

**Content schema includes**: FTS5 full-text search, tags (many-to-many), assets, links, relations, markdown pages, manual dates, and media BLOB storage.

### Data Flow

1. **Admin writes content** → API route at `/api/admin/content` → `content-db-manager.ts` opens/writes to per-item DB
2. **Public reads content** → API route at `/api/cms/contents` or `/api/content/{type}` → `content-service.ts` aggregates across all DB files
3. **Search** → Uses FTS5 virtual tables in each database, aggregated at query time

### API Routes Structure

- `/api/admin/*`: Admin-only operations (auth required)
  - `/api/admin/content`: CRUD for content items
  - `/api/admin/markdown`: Markdown page management
  - `/api/admin/tags`: Tag management
  - `/api/admin/files`: Media upload/management
  - `/api/admin/upload`: File upload with progress tracking
- `/api/cms/*`: Public read operations
  - `/api/cms/contents`: List/load content
  - `/api/cms/markdown`: Render markdown content
  - `/api/cms/media`: Serve media assets
- `/api/content/*`: Public content by type (portfolio, blog, download, etc.)
- `/api/search/*`: Search and suggestions

### Tools and Features

Located in `src/app/tools/`:

- **ProtoType**: Complex game built with embedded TypeScript modules (gamesets 001-028)
- **code-type-p5**: P5.js animation editor with video export
- **pi-game**: Memory game with state management
- **pomodoro**: Timer with YouTube integration
- **svg2tsx**: SVG to React component converter
- **sequential-png-preview**: PNG sequence animation player
- **qr-generator**: QR code generation
- **text-counter**: Character/word counting tool
- **color-palette**: Color palette generator
- **business-mail-block**: Business mail formatting tool
- **ae-expression**: After Effects expression generator

### Performance Optimizations

- **Webpack chunk splitting**: Configured for `three`, `pixi`, `ui`, `react`, `utils`, `tools`, `admin`
- **Standalone builds**: `output: "standalone"` for production (disabled on Windows due to symlink issues)
- **React Compiler**: Enabled via `reactCompiler: true`
- **Package optimization**: `optimizePackageImports` for lucide-react, framer-motion, three, pixi.js, fuse.js, marked, recharts

### Linting and Formatting

- **Biome** (not ESLint/Prettier): Configured in `biome.json`
- **Ignored paths**: Admin/API routes excluded from some checks via `!!` prefix
- **Overrides**: Special rules for scripts and specific components

### External Project Sync (Git Subtree)

Some tools under `src/app/tools/` are synced from external repositories via **git subtree**:

- **ProtoType**: `https://github.com/rebuildup/ProtoType` → `src/app/tools/ProtoType/`

These external projects have their own `src/` directory inside the tools path. Bridge files (`page.tsx`, `layout.tsx`) at the tool root are managed by my-web-2025 and protected from subtree pulls via `.gitattributes` (`merge=ours`).

**To sync an external project:**
```bash
# Update existing subtree
./scripts/sync-subtree.sh <name> <repo-url> [branch] [prefix]

# Example: update ProtoType
./scripts/sync-subtree.sh ProtoType https://github.com/rebuildup/ProtoType main src/app/tools/ProtoType
```

**To add a new external project:**
1. `./scripts/sync-subtree.sh <name> <repo-url> <branch> <prefix>` — adds the subtree
2. Create bridge files at `<prefix>/page.tsx` and `<prefix>/layout.tsx`:
   - `page.tsx`: `"use client"; import dynamic from "next/dynamic"; const App = dynamic(() => import("./src/App"), { ssr: false });`
   - `layout.tsx`: CSS imports + Next.js `Metadata` export
3. Add bridge files to `.gitattributes` with `merge=ours`
4. Run `node scripts/merge-deps.mjs <prefix>/package.json` to check and merge dependencies
5. Add tool to `src/app/tools/page.tsx` tools list

**Scripts:**
- `scripts/sync-subtree.sh`: Add/pull git subtrees from external repos
- `scripts/merge-deps.mjs`: Merge dependencies from external `package.json` into root (with `--dry-run` flag)

## Important Constraints

- **TypeScript build errors are ignored**: `typescript.ignoreBuildErrors = true` in `next.config.ts`
- **Three.js version pinned**: `^0.180.0` due to peer dependency rules
- **Platform-specific**: Standalone output disabled on Windows (symlink issues with `.next/standalone`)
- **Data directory resolution**: Complex fallback logic in `content-db-manager.ts` checks multiple paths for `data/` folder

## CMS Types (src/cms/types/)

- `content.ts`: Core `Content` interface with extensive metadata
- `database.ts`: SQLite row types
- `blocks.ts`: Page editor block system
- `markdown.ts`: Markdown-specific types
- `seo.ts`: SEO metadata structures
