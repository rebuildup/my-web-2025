# ADR-0011: Rust LSP として rust-analyzer を project-local に導入

## ステータス
Accepted (2026-08 init)

## コンテキスト
`apps/cms-api/` (Rust CMS API, axum + sqlx + tokio) は canonical な secondary surface だが、language server 設定が一切ない. 開発者の IDE / エディタで補完・型検査・lint を効かせるには `rust-analyzer` が必要で、project-local な再現性のために toolchain と LSP 設定を固定しておきたい. 一方で CI / `verify-and-commit` skill の Rust gate は `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test --all-targets` の 3 段で既に成立しており、LSP は「editor experience を上げる」だけの追加要素.

## 検討した選択肢
- A: **`apps/cms-api/rust-toolchain.toml` + `apps/cms-api/.rust-analyzer.json` を追加**. CI gate は変更しない.
- B: LSP 設定なし. 各開発者が自分のエディタで rust-analyzer を入れる.
- C: `IDE 固有設定` (`.vscode/settings.json` ないし `.idea/`) を project に置く.

## 決定
**A を採用.** 根拠:
- `rust-toolchain.toml` は Rust 公式の project-local 設定. `rustup` が自動で stable + `rustfmt` + `clippy` + `rust-analyzer` を解決する. CI (`dtolnay/rust-toolchain@v1` + `stable`) と channel が一致するため, fresh checkout から同じ toolchain が一発で揃う.
- `.rust-analyzer.json` の `check.command = "clippy"` を指定することで, エディタ側の rust-analyzer が「`cargo build` ではなく `cargo clippy` で background check」する. これは `verify-and-commit` skill の `cargo clippy --all-targets -- -D warnings` と同じ surface を IDE 上に持ち込むだけで, gate 自体は CI / skill 側に残る.
- `unresolved-proc-macro` を diagnostics から除外: `utoipa` / `utoipa-axum` 由来の擬陽性 (rust-analyzer が proc-macro を完全展開できない既知問題) を防ぐ. 代替案として `disableBuildScripts` もあるが, そちらは依存 crate のビルドスクリプト全体を止めて `cargo build` に副作用が出るので除外.
- `files.excludeDirs` に `target` / `.git` を明示: rust-analyzer のデフォルトで除外されるが, 設定ファイル側で宣言することで「意図した除外」を明示する. `apps/cms-api/target/` は既に gitignore 済み.
- C 案 (`.vscode/settings.json`) は editor vendor lock-in. メタ §3 (project-local reproducibility) に反するため不採用.
- 既存の `next.config.ts: typescript.ignoreBuildErrors` (AGENTS.md §14 known debt) とは別物. Rust 側の build error は LSP 側で握りつぶさず, `cargo clippy` の `-D warnings` で fail させる方針.

## 影響
- プラス: `apps/cms-api/` で開発する contributor の editor experience が均質化. fresh clone から `cargo` を叩くだけで rust-analyzer も解決される.
- プラス: 検証 gate (CI / skill) には変更なし. 既存 gate との surface 重複は「同じ clippy を LSP 側にも流す」だけ.
- マイナス: toolchain.toml の channel 変更 (e.g. `stable` -> `nightly`) は CI と足元で乖離するリスク. 変更時は CI YAML と同時更新する.
- マイナス: `utoipa` 系の proc-macro 補完が貧弱になる (`unresolved-proc-macro` 除外のため). `cargo expand` で補完する運用.
- トレードオフ: `disableBuildScripts = true` にすると proc-macro 由来の false positive は消えるが, `build.rs` を持つ依存 (sqlx 等) が壊れる. 採用しない.

## 再評価条件
- rust-analyzer 公式が「utoipa 系の proc-macro を full expansion できる」レベルに達した場合: `unresolved-proc-macro` 除外を撤廃.
- `cargo clippy` の wall time が CI 15 min budget を逼迫し始めた場合: `check.command` を `check` (clippy より軽い) に切替. その場合 clippy の warning は `verify-and-commit` skill 側に集約.
- `stable` channel に breaking change (e.g. edition bump) が入った場合: ADR を revise.

## 後続 ADR
- 0005: Rust CMS API (この ADR を前提に editor experience を project-local で固定).
- 0007: AI エージェント環境を project-local で運用 (Rust 側にも project-local 設定が必要な旨を追記する).
- 0008: Bun test canonical (Bun / Rust 両方のテスト runner の責務分離).
