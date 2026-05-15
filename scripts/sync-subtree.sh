#!/bin/bash
# Sync external projects via git subtree
#
# Usage:
#   Add:    ./scripts/sync-subtree.sh <name> <repo-url> [branch] [prefix]
#   Update: ./scripts/sync-subtree.sh <name> <repo-url> [branch] [prefix]
#
# Examples:
#   ./scripts/sync-subtree.sh ProtoType https://github.com/rebuildup/ProtoType main src/app/tools/ProtoType
#   ./scripts/sync-subtree.sh pi-game https://github.com/rebuildup/pi-game main src/app/tools/pi-game

set -e

NAME="$1"
REPO="$2"
BRANCH="${3:-main}"
PREFIX="${4:-src/app/tools/$NAME}"

if [ -z "$NAME" ] || [ -z "$REPO" ]; then
  echo "Usage: $0 <name> <repo-url> [branch] [prefix]"
  echo ""
  echo "Arguments:"
  echo "  name     - Project name (used for display and default prefix)"
  echo "  repo-url - Git repository URL"
  echo "  branch   - Branch to track (default: main)"
  echo "  prefix   - Target directory (default: src/app/tools/<name>)"
  exit 1
fi

# Check if subtree already exists
if git log --oneline --all --grep="git-subtree-dir: $PREFIX" | grep -q .; then
  echo "==> Updating $NAME from $REPO ($BRANCH) -> $PREFIX"
  git subtree pull --prefix="$PREFIX" "$REPO" "$BRANCH" --squash
else
  echo "==> Adding $NAME from $REPO ($BRANCH) -> $PREFIX"
  git subtree add --prefix="$PREFIX" "$REPO" "$BRANCH" --squash
fi

echo ""
echo "==> Done! $NAME synced to $PREFIX"
echo ""
echo "Next steps:"
echo "  1. Create/update bridge files (page.tsx, layout.tsx) at $PREFIX/"
echo "  2. Add bridge files to .gitattributes with merge=ours"
echo "  3. Run: bun scripts/merge-deps.mjs $PREFIX/package.json"
echo "  4. Commit the changes"
