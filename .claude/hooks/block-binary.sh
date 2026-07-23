#!/usr/bin/env bash
# PreToolUse hook: deny Claude Code edits to binary content DBs and lockfiles.
# Triggered on Edit|Write. Exits 2 to block the tool call.

set -u
path="$CLAUDE_FILE_PATH"

case "$path" in
  *data/contents/*.db|*data\\contents\\*.db)
    echo "Refusing to edit content SQLite DB: $path" >&2
    echo "Edit via the admin API at /api/admin/content or content-service.ts instead." >&2
    exit 2
    ;;
  *bun.lock|*bun.lockb|*package-lock.json|*yarn.lock|*pnpm-lock.yaml)
    echo "Refusing to edit lockfile: $path" >&2
    echo "Use the package manager CLI (bun install / add) instead." >&2
    exit 2
    ;;
esac

exit 0
