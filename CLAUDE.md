# Claude Code adapter

Canonical project policy is in `AGENTS.md`. Read only the relevant project-local docs and Skills it points to.

- `.claude/settings.json` hooks protect CMS databases and format edited files. Do not disable them.
- `.claude/skills/<name>/SKILL.md` is the canonical Claude adapter; `.agents/skills/` is its mirror.
- Read-only review agents are used for CMS content and tool bridge changes. Reviewers do not commit.
- `.codex/config.toml` contains optional Context7 and Playwright adapters. Use them when available, never as hidden project state.
- Conversation memory is not canonical. Recovery starts from the Issue, PR, Git refs, and `docs/agent/recovery.md`.
