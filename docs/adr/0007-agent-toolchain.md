# ADR-0007: AI エージェント環境を project-local で運用

## ステータス
Accepted (2026-08 初期化)

## コンテキスト
AI コーディングエージェント (Claude Code, Codex, 他) が複数混在する環境下で、各 agent のグローバル設定に依存すると再現性が壊れる. プロジェクト固有の不変条件 (CMS 分散 SQLite, バイナリ DB 保護, 検証ゲート) は agent 横断で同じであるべき.

## 検討した選択肢
- A: **`.claude/` を canonical とし、`.codex/` (MCP 設定) と `.agents/` (skill ミラー) を同期運用.**
- B: 各 agent ごとに同等のファイルを手動コピー.
- C: agent グローバル設定に依存.

## 決定
**A を採用.** 根拠:
- `.claude/skills/`, `.claude/agents/`, `.claude/hooks/`, `.claude/settings.json` が canonical. `.claude/hooks/block-binary.sh` で `data/contents/*.db` と `bun.lock` の直接編集を拒否.
- `.codex/config.toml` で context7 + playwright MCP を登録 (Codex 環境向け).
- `.agents/skills/*` は Claude Code 側 canonical の mirror. Codex が `.claude/` を直接読まないケースの互換.
- canonical 指示 (プロジェクト ID / 検証ゲート / ディレクトリ責務 / Skill 一覧) は `AGENTS.md` に集約し、全 agent が `@AGENTS.md` で参照.
- Claude Code 固有の薄い注記 (harness / MCP / memory) のみ `CLAUDE.md` に残す.

## 影響
- プラス: fresh clone から同じ agent 環境が再現される. agent バージョン差分に左右されにくい.
- マイナス: `.claude/`, `.agents/`, `.codex/` の 3 箇所を編集時に同期する責任. Skill 更新時は両方を更新.
- トレードオフ: 現在は人手同期. 自動化する場合は `.claude/` → `.agents/skills/` への sync script (`scripts/sync-agent-skills.sh`) を後付けで追加可能.

## 再評価条件
- agent 仕様が canonical ファイルを自動 discovery する仕組みを取り入れた場合.
- 同期漏れが 3 回以上発生し、自動化がROI を持つ場合.
- agent toolchain の大幅な変更 (例: Claude Code Skills 仕様が他 agent と完全統合される) があった場合.

## 後続 ADR
- 0001〜0006 の各技術決定と並列. agent 横断で参照される.
