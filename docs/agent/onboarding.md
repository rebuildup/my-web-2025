# エージェント・オンボーディング

## 最初に確認するもの

1. `AGENTS.md` で境界、SoT、言語、検証入口を確認する。
2. 対象routeの `docs/app/**/page.md`、横断設計、関連ADRを読む。
3. `git status --short --branch` で既存変更を確認し、他者の変更を上書きしない。
4. `package.json`、`bun.lock`、`.github/workflows/` と対象moduleの実装を確認する。

## 実行

```bash
git submodule update --init --recursive
bun install --frozen-lockfile
bun --bun scripts/install-tools.ts
bun run dev
```

CMS APIが必要な場合は別runtimeで `bun run dev:cms-api` を起動する。worker間でDB、cache、queue、port、生成物を共有しない。共有が必要な入力はsnapshotとして固定する。

## 完了の定義

変更surfaceに合う unit / smoke / integration / contract / E2E を選び、`docs/agent/quality-security.md` のticketまたはrelease gateを満たす。UI変更は実描画を確認し、結果とsnapshot SHAをPRに残す。
