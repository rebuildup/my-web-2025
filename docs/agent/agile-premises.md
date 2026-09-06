# アジャイル駆動の前提 (solo agile)

> ドラフト — 2026-09-06 起案。
>
> `release-workflow.md` が GitHub 上の手続きを記述しているのに対し、この doc はその背後にある **前提 / 仮説 / 運用判断** を明文化する。AGENTS.md から「スプリント/バックログ/レトロはどう回すのか」と参照されたらここ。

---

## 1. 前提 (Premises)

### 1.1 チーム前提ではなく個人前提

- 一人で PO / SM / Dev / Ops / SRE を兼ねる。ペアプロのレビューは **PR 上でのセルフレビュー + Claude レビュー** で代替する。
- 「顧客」は (a) yusuke-kim.com の訪問者 と (b) 自分自身の創作欲求 / 学習欲求 の二重構造。前者を **outside-in 価値**、後者を **inside-out 動機** と呼ぶ。
- 意思決定は **1 人で、ただし evidence-based**。Issue コメント・ADR・CI gate を evidence として残し、後から自分の判断を検証できるようにする。

### 1.2 期間 / cadence 前提

- 1 sprint = 1 week (日曜 start / 土曜 end) を default とする。仕事/体調/外部要因で前後したら sprint 期間自体をずらす (sprint 番号は連番維持)。
- 緊急度は sprint 内ではなく **Issue の Priority** で扱う。sprint を伸ばして吸収しない。
- "リリース" = `release-x-y-z` branch を main にマージし、Cloudflare Pages の prod deploy が succeeded になるまで。

### 1.3 価値前提

- 計測可能な外部価値: 訪問者数 / 直帰率 / 検索流入 / SNS mention (`public/data/stats/`)。
- 計測可能な内部価値: 完了 Issue 数 / cycle time / WIP / CI 緑率 / Knip debt。
- **計測不能だが重要なもの**: 自分の納得感 / 学び。これは retro でテキスト化を試みるが、定量化はしない。

---

## 2. 運用モデル

### 2.1 Backlog = GitHub Project

| 列 | 通過条件 |
|---|---|
| Backlog | 起案されただけの Issue。`Priority` / `Size` 未設定で OK |
| Ready | `Acceptance Criteria` あり / `Priority` 設定済 / `Target Version` 設定済 / ブロッカー解消済 |
| In Progress | ticket branch 作成済 |
| In Review | Draft PR が open / セルフレビューコメント付与済 |
| Done | release branch に merge / CI green / preview deploy OK |

WIP 制限: **In Progress 列は常に 1 件以下**。ソロ開発では 1 個に集中する方が cycle time が短い (retro で観測済の前提)。

### 2.2 Sprint lifecycle

1. **Sprint planning (日曜)** — Backlog → Ready への昇格、容量決定 (前 sprint の velocity を cap)
2. **Daily (任意)** — Project board を見て "今日やる 1 個" を確認。儀式化しない
3. **Sprint review (土曜)** — release PR を draft → ready、必要なら demo を preview URL で記録
4. **Sprint retro (土曜)** — velocity / cycle time / WIP / Knip debt / 学習 を振り返り、次 sprint の改善を 1-2 個に絞って Backlog へ

### 2.3 Definition of Done

Issue (ticket) が Done になる条件:

- [ ] ticket branch から release branch への Draft PR が open
- [ ] CI green: type-check / lint / Knip / test / Next.js build / Rust fmt+clippy+test
- [ ] Cloudflare Pages preview deploy が succeeded
- [ ] セルフレビューコメント + Claude review コメントの **未解決指摘がゼロ**
- [ ] release branch に squash merge されている
- [ ] Project board の Status が Done へ移動済

Release が Done になる条件:

- [ ] 全 ticket が Done
- [ ] release PR の description に goal / breaking changes / migration / validation が日本語で記載
- [ ] release PR が main に merge
- [ ] Cloudflare Pages の prod deploy が succeeded
- [ ] `tag` 打ち (任意)、`GitHub release` 作成 (任意)

---

## 3. 計測 / 観察

### 3.1 毎週の sprint で見る数字

- `velocity` = 当 sprint で Done 化した Issue 数
- `cycle_time` = ticket branch 作成日 → release branch merge 日 (median)
- `wip_avg` = その週の In Progress 列 平均件数
- `ci_green_rate` = main への push に対する CI 緑率
- `knip_debt` = `bun x knip` の warnings / errors 数

これらは毎 sprint retro の入力。グラフ化はしない (オーバーヘッド) 、数値だけ記録する。

### 3.2 月次で見る数字

- `public/data/stats/{search,view}-stats.json` の訪問者 / 直帰率の傾向
- `bun.lock` の diff (依存 drift)
- ADRs の数 (=意思決定の記録量)

---

## 4. アンチパターン

| アンチパターン | 何故ダメか | 代わりに |
|---|---|---|
| Done = PR merge | release まで到達してないので Done ではない | "release branch に merge" を Done 条件にする |
| WIP を 2-3 並列にする | context switch で cycle time が伸びる | 1 個に集中。複数抱えたら 1 個を一旦 pause へ |
| Issue 起案なしでコードを書く | 後で「なぜこれが必要か」が残らない | 1 commit = 1 Issue 起点 |
| main への直接 push | released state を保つ前提が崩れる | release branch 経由のみ |
| `feat:` で書かない conventional commit | 後から changelog が組めない | conventional commits (English message) を厳守 |
| `.env` 値を commit | secret leak | `wrangler secret put` + `docs/agent/env-management.md` |
| retro をスキップ | 学習が蓄積しない | 1-2 個の改善だけでも retro を開く |

---

## 5. Claude との協働前提

- Claude は **draft PR まで** を担当する。merge / release は人が判断する。
- Claude が出した判断は **必ず evidence (Issue / PR / ADR / CI log) と共に残す**。memory は補助、canonical は repo。
- 1 つのセッションが長く続かない前提で動く。各セッション開始時に「Project board の Ready / In Progress / In Review を読んで、今日触る ticket を 1 個宣言する」を必ずやる。
- 不確実な領域 (新ライブラリ導入 / deploy 構成変更) は **Plan モード → ユーザー承認 → 実装** の 3 段を守る。

---

## 6. 関連 doc

- `release-workflow.md` — GitHub 上の branch / PR / Project の手続き
- `recovery.md` — セッション中断 / compaction からの復帰
- `parallel-orchestration.md` — Claude subagent を使う時のルール
- `quality-security.md` — CI gate と secret 管理のルール
- `env-management.md` — `.env*` と secret store の扱い
