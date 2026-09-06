# `_disabled/` workflows

GitHub Actions が走査しない `.github/workflows/_disabled/` 配下に退避した workflow を置く場所です。 git 履歴に保持しつつ、誤って trigger されないようにします。

## `sync-submodules.yml` — 2026-09-06 退避

### 退避理由

- **bot PR の pile-up**: 2025-08 から 2026-09 までの約 1 年間で `chore/sync-submodules-YYYYMMDDTHHMMSSZ` branch が 259 本、`app/github-actions` による PR が 259 件 OPEN のまま堆積した (全件が `merge/cloudflare-phase-b` 等の主要 PR を review する上で noise)
- **`bun.lock` 更新の意図的 skip** (`.github/workflows/sync-submodules.yml` lines 119-125 旧版): workflow は gitlink だけ bump し、 `bun.lock` は refresh しない ため、生成される bot PR は **merge-safe ではない**。人が `bun install --frozen-lockfile` を再走してから merge する必要があった
- **PR review 文化の破壊**: 1日 20-30 件の同タイトル PR が来ると、人間 reviewer の認知が破綻する。0 件 merge / 0 件 close という最悪状態

### 再開手順 (次の minor sprint で再設計する)

1. `git log --all --oneline -- .github/workflows/_disabled/sync-submodules.yml` で退避 commit を確認
2. **再開前に必ず再設計する** — 現行の「branch + PR を作る」設計は使わない
   - 案 A: gitlink 更新を **直接 `git push origin main`** に切り替える (CI は main push で trigger、PR レビューは人間の判断に委ねる)
   - 案 B: weekly cron (`0 0 * * 0`) に変更し、 PR 1本 / week を上限にする
   - 案 C: dispatch loop を廃止し、 submodule 側で `repository_dispatch` を送る pull モデルへ移行 (各 submodule に `PARENT_REPO_TOKEN` が必要)
3. `_disabled/sync-submodules.yml` を `.github/workflows/sync-submodules.yml` に戻す
4. 戻す前に **`concurrency` / `permissions` / `bun.lock` skip の是非** を再 audit
5. 退避 PR / Issue への参照を残し、 retro で「なぜ pile-up したか」を記録

### 退避前の状況

- 退避 commit: <PR-link> (sprint 2.2.0 housekeeping)
- pile-up PR 群: すべて closed with comment 2026-09-06
- branch 群: すべて `git push origin --delete` で削除
- retro Issue: <issue-link>
