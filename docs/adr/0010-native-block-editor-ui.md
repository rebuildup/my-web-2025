# ADR-0010: CMS ブロックエディタ UI を MUI から native HTML へ段階移行する

## ステータス
Accepted (2026-08)

## コンテキスト
`/admin/content/page-editor` のブロックエディタが 2026-08-12 の時点で物理的に操作不能になっている. 3 つの独立した欠陥が重なっている:

1. `src/app/admin/layout.tsx:13` の `fixed inset-0 z-[9999]` ラッパーが stacking context を作り, MUI Menu/Popover の portal 子要素 (z-index 1300) が admin パネルの**背面**に押し込まれる. メニューが描画されても click が通らない.
2. `src/components/admin/page-editor/editor/BlockEditorItem.tsx:174` の `+` ボタンが `left: -64` に absolute 配置されているが, `EditorLayout.tsx` のスクロール領域は左ガター約 42px しか持たず, `overflowY: "auto"` が CSS 仕様上 `overflow-x` を `auto` に格上げするため, 負オフセット分の hit-area が完全にクリップされる. ボタンは描画されるが押せない.
3. `EditorLayout.tsx:26` の `height: "calc(100dvh - 64px)"` が実際の chrome 96px を下回り, 二重スクロールバーで右パネル下部がビューポート外.

加えて, リポジトリ内に `ThemeProvider` が一切存在しないため, MUI 既定のライトテーマで描画され, `e936aeae` で global CSS を剥がした現在の house style (白背景 + `#1f2328` テキスト) と完全に噛み合っていない. `docs/02_style.md` は MUI を「表・複合コンポーネントで限定使用」と定義しているが, page-editor subtree 全体 (39 ファイル) が MUI に依存しており, 方針と実装が乖離している.

直近のコミット `05e7b0d0` (admin/layout を native 化) と `1a33eb9d` (SimpleSelect 導入) で native 移行は既に始まっている. 本 ADR はそれを page-editor にまで拡張する.

## 検討した選択肢
- A: **`ThemeProvider` を再導入し MUI を維持する.** 既存の 39 ファイルに対して最小限の変更で色を統一できる. しかし (1) `z-[9999]` 罠を構造的に解決しないためメニュー問題が再発する, (2) ThemeProvider のために emotion + theme 全体の初期化コストを再び払う, (3) `docs/02_style.md` の方針違反を固定化する, の 3 点で却下.
- B: **`@floating-ui` / `react-popper` を導入して Menu のポジショニングを置き換える.** Menu を維持したまま portal 問題を解決できる. しかし (1) メニューは BlockEditorMenus.tsx の 2 箇所のみで新規 dep のコストが見合わない, (2) z-index 罠は portal 自体に依存するため結局別 fix が要る, (3) `0001-bun-package-manager` の「必要最小限の dep」方針に反する, で却下.
- C: **portal を使わず native `position: fixed` で `ContextMenu` を実装し, `useClickAway` で閉じる.** 採用. 既存 `CaretMenu` (`src/app/tools/fillgen/components/CaretMenu.tsx:11-20`) が同パターンで稼働しており, 新規 abstraction ではなく house style の延長.
- D: (参考) ブロックエディタ機能自体を Notion 等の外部 SaaS に置換する. スコープ外.

## 決定
**C を採用し, 6 フェーズの段階コミットで page-editor subtree を MUI から native へ移行する.** フェーズ 1 で操作不能状態を解消し, フェーズ 2-6 で widget / パネル / shell / 兄弟 CMS ファイルを順次剥がす. 各フェーズは 1 コミットで, canonical gate (`AGENTS.md` §3) を green に保つ.

主要決定事項:
- **新規 dep なし.** アイコンは既存 `lucide-react ^1.28.0` を使う (Phase 3 以降).
- **floating-ui / popper 不使用.** ポジショニングは純 JS の `computeMenuRect`.
- **ThemeProvider は当面導入しない.** `src/components/admin/ui/tokens.ts` に color 定数を集約し, 各ファイルが import して使う.
- **dark テーマは scope 外.** `docs/02_style.md` の light token に揃える.

### 参照 ADR
- `0001-bun-package-manager` — 新規 dep を必要最小限にする方針.
- `0008-bun-test-canonical` — `bun test` を canonical とし, `*.bun.test.ts` を coverage から除外する運用.

## 影響
- プラス: 3 つの操作不能原因が構造的に解消される. bundle 縮小 (MUI 6 → 0). house style が page-editor にも統一される. `docs/02_style.md` 方針と実装が揃う.
- プラス: アクセシビリティ plumbing を自前で書くため WAI-ARIA 仕様への理解が深まる.
- マイナス: widget ごとにアクセシビリティを再実装する作業 (TextField の label 関連, Switch の track/thumb, Tab の roving tabindex 等).
- マイナス: 中間フェーズで Knip の「未使用 export」警告が増える. `AGENTS.md` §14 の緩和ルール内で吸収.
- トレードオフ: ドラッグ&ドロップの視覚回帰がユーザー苦情になる可能性. Phase 1 完了時点で目視確認.

## 再評価条件
- page-editor 内に 3 サイト目以降の in-editor menu が出現し `useClickAway` の濫用が始まったら, `src/components/admin/ui/useClickAway.ts` を再評価する.
- ドラッグ&ドロップの視覚回帰が 1 リリース内で 2 件以上のユーザー苦情になったら, drag レイヤのみ MUI 残す選択肢を再検討.
- Knip 警告が `files` / `exports` の緩和では吸収できない量に増えたら, Phase 6 完了 (= `@mui/material` の `package.json` 削除) を前倒し.
- WAI-ARIA の Menu / MenuItem パターン (role, aria-disabled, roving tabindex) について WCAG 監査で Critical が出た場合, 該当箇所のみ MUI 再導入を検討.

## 後続 ADR
- 0009: context-mode プラグインを project-local に pin しない (本 ADR とは独立).
- 0008: Bun test canonical (本 ADR のテスト方針はこの ADR で分岐).

## フェーズ計画 (概要)
- **Phase 1** (本コミット): z-index 修正 / 左ガター / 高さ計算 / 負オフセット → 左カラム / `BlockEditorMenus` → `ContextMenu` 置換. 新規 `ContextMenu`, `useClickAway`, `tokens.ts`. テスト 1 ファイル追加.
- **Phase 2-3**: リーフブロック 12 ファイルと widget 含む 13 ファイルを順次 native 化.
- **Phase 4**: パネル 4 ファイル (BlockLibrary / ContentSelector / ArticleList / MediaManager).
- **Phase 5**: エディタ shell 7 ファイル (EditableText / BlockToolbar / BlockEditorItem / BlockEditor / EditorLayout / Sidebar / UnknownBlock).
- **Phase 6**: 兄弟 CMS ファイル 5 ファイル + `package.json` から `@mui/material` / `@mui/icons-material` / `@emotion/*` 削除.
