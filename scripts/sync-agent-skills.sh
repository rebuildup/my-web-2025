#!/usr/bin/env bash
# Mirror .claude/ agent configuration to .agents/ and .codex/.
set -euo pipefail

CHECK_ONLY=0
if [ "${1:-}" = "--check" ]; then
  CHECK_ONLY=1
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "error: must be run from inside a git working tree" >&2
  exit 2
fi

cd "$REPO_ROOT"

CLAUDE_SKILLS_DIR=".claude/skills"
AGENTS_SKILLS_DIR=".agents/skills"
CLAUDE_HOOKS_DIR=".claude/hooks"
CODEX_HOOKS_DIR=".codex/hooks"
DRIFT=0

mirror_file() {
  local src="$1"
  local dest="$2"

  if [ ! -f "$src" ]; then
    echo "skip: $src (missing)" >&2
    return 0
  fi

  if [ "$CHECK_ONLY" -eq 1 ]; then
    if [ ! -f "$dest" ] || ! cmp -s "$src" "$dest"; then
      echo "drift: $dest differs from $src" >&2
      DRIFT=1
    fi
    return 0
  fi

  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  echo "wrote: $dest"
}

if [ -d "$CLAUDE_SKILLS_DIR" ]; then
  while IFS= read -r -d '' skill_md; do
    skill_dir="$(dirname "$skill_md")"
    skill_name="$(basename "$skill_dir")"
    mirror_file "$skill_md" "$AGENTS_SKILLS_DIR/$skill_name/SKILL.md"
  done < <(find "$CLAUDE_SKILLS_DIR" -mindepth 2 -maxdepth 2 -type f -name SKILL.md -print0)
else
  echo "skip: $CLAUDE_SKILLS_DIR (missing)" >&2
fi

mirror_file "$CLAUDE_HOOKS_DIR/block-binary.sh" "$CODEX_HOOKS_DIR/block-binary.sh"

if [ "$CHECK_ONLY" -eq 1 ] && [ "$DRIFT" -ne 0 ]; then
  echo "agent skill/hook mirror has drift; run ./scripts/sync-agent-skills.sh" >&2
  exit 1
fi

if [ "$CHECK_ONLY" -eq 0 ]; then
  echo "mirror complete: $CLAUDE_SKILLS_DIR -> $AGENTS_SKILLS_DIR, $CLAUDE_HOOKS_DIR -> $CODEX_HOOKS_DIR"
fi
