# 05_requirement — 非機能要件ショートリスト

- パフォーマンス: LCP < 2.5s (4G相当), CLS < 0.1, TTFB < 800ms。画像は `next/image` / CDN 任意。
- アクセシビリティ: WCAG 2.1 AA 相当、キーボード操作可、コントラスト遵守。
- セキュリティ: CSP はリバースプロキシで付与、HTMLは `dompurify` サニタイズ、reCAPTCHA/Rate-limit (Contact/API) を有効化可能。
- 可用性: `/api/health` 監視、PM2 常駐、ビルド成果物のみで完結（外部DBなし）。
- 国際化: 主に ja-JP。必要な場合は `locale` フィールドを追加で拡張。
- 障害対応: ロールバックは `deployment-standalone.tar.gz` 差し替え + `pm2 restart`。
