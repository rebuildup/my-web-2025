# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. canonical な指示

このリポジトリの canonical な不変条件 (プロジェクト ID / ツールチェーン / 検証ゲート / アーキテクチャ / Skill 発見 / ブランチ / コミット規約 / 並列化方針) は **`AGENTS.md`** に集約されています. 必ず最初に全文を読み、参照してください.

## 2. Claude Code 固有の薄い注記

- **Harness 設定**: `.claude/settings.json` に `PreToolUse` (バイナリ DB / lockfile 編集をブロックする `block-binary.sh`) と `PostToolUse` (Biome 自動 format) の hook が登録されています. これらの hook は canonical な safety net なので、無効化しないでください.
- **Skills**: `.claude/skills/<name>/SKILL.md` の `description` が activation trigger を担います. 該当しそうなタスクでは `Skill` ツールで呼び出してください. canonical 一覧は `AGENTS.md` 6 節.
- **Agents**: 読み取り専用 review agent (`cms-content-reviewer`, `tool-bridge-auditor`) は Agent ツールの `subagent_type` に指定して呼び出します. 検証用途なので commit は行いません.
- **MCP**: `.codex/config.toml` で context7 と playwright が登録されています. Claude Code 側でも `mcp__context7__*` / `mcp__playwright__*` が利用可能なときは公式ドキュメント参照と実描画確認に使用してください.
- **memory**: `~/.claude/projects/C--Users-rebui-Desktop-my-web-2025/memory/` に project-local な永続 memory を保持できます. ユーザー / feedback / project / reference の 4 種で運用してください. コードから読み取れる事実は memory に書かない.

## 3. 典型的な Claude Code 作業の流れ

1. `AGENTS.md` を読む.
2. 関連 Skill があれば activation キーワードで発火させる.
3. 関連 docs (`docs/01_global.md`〜`07_rules.md`, `docs/app/<route>/page.md`, `docs/adr/`) を読む.
4. 実装. 検証は `bun run type-check && bun run lint && bun run test && bun x knip && bun run build` を green にするまで続ける.
5. UI 変更は `mcp__playwright__*` で実描画を確認.
6. `git status` で無関係な変更を確認してから commit / push.

## 4. やってはいけないこと (再掲)

- バイナリ `data/contents/*.db` と `bun.lock` の直接編集 (hook が拒否します).
- npx / npm / pnpm / yarn の常用 (Bun 運用が canonical).
- Python script の新規追加.
- `master` 以外への branch / worktree 自動作成.
- 検証エラー / 警告を skip / ignore / suppress しての green 偽装.
- `.env*` の実値コミット.

詳細は `AGENTS.md` を参照してください.
