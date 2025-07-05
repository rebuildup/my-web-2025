# 性能・品質要件 (Requirements)

> Lighthouse 目標値やアクセシビリティ基準などの非機能要件まとめ

## 1. パフォーマンス

| 指標               | 目標    |
| ------------------ | ------- |
| Lighthouse Overall | 90+     |
| LCP                | ≤ 2.5s  |
| FID (INP)          | ≤ 100ms |
| CLS                | ≤ 0.1   |
| 初期 JS バンドル   | ≤ 1 MB  |

### 最適化策

- 画像 `next/image` + WebP + 遅延読み込み
- 動的インポート (`dynamic()`) で分割
- `Cache-Control` ヘッダー設定 (`static` 1y, `dynamic` 1h)

## 2. アクセシビリティ

- WCAG 2.1 AA 準拠
- 自動テスト: axe-core, Lighthouse, WAVE
- キーボードナビ & フォーカスリング必須

## 3. セキュリティ

- CSP: default-src 'self'; 外部は whitelisting
- HSTS: max-age 31536000; includeSubDomains
- Rate Limit: API 60 req/min, Contact 3 req/15min
- CSRF トークン: フォーム & API
- XSS: DOMPurify sanitize

## 4. 信頼性 (DR/Backup)

| 目標       | 値    |
| ---------- | ----- |
| RTO        | 24h   |
| RPO        | 24h   |
| 年間可用性 | 99.5% |

日次バックアップ: データ & `/var/www/html`

## 5. テスト指標

- Unit test カバレッジ: 80%+
- E2E シナリオ: 5 主要ユーザーフロー
- ビジュアルリグレッション差分: < 0.1

## 6. API要件

### レスポンス時間

| エンドポイント        | 目標時間 | 備考                 |
| --------------------- | -------- | -------------------- |
| `/api/content/*`      | < 500ms  | コンテンツデータ取得 |
| `/api/content/search` | < 1s     | 検索機能             |
| `/api/stats/*`        | < 200ms  | 統計更新             |
| `/api/contact`        | < 2s     | メール送信           |
| `/api/admin/*`        | < 3s     | Admin機能            |

### データ形式

- **JSON**: 全APIでJSON形式を使用
- **文字コード**: UTF-8
- **日付形式**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **エラーレスポンス**: 統一されたエラー形式

### キャッシュ戦略

- **コンテンツデータ**: 1時間キャッシュ
- **検索インデックス**: 12時間キャッシュ
- **統計データ**: リアルタイム更新
- **静的ファイル**: 1年キャッシュ

## 7. 環境別要件

### 開発環境

- **Admin機能**: 有効
- **ホットリロード**: 有効
- **ソースマップ**: 有効
- **デバッグログ**: 有効

### 本番環境

- **Admin機能**: 無効
- **ログレベル**: ERROR以上
- **圧縮**: 有効
- **セキュリティヘッダー**: 有効

---

> **レビューサイクル**: 月次で KPI を Google Analytics & Lighthouse CI から取得し `docs/metrics/YYYY-MM.md` に記録する。
