# デプロイ & インフラ (Deploy)

> GitHub Actions × GCP VM (Apache) による CI/CD パイプライン概要

## 0. 開発プロセス

1. ブランチ戦略：`main` = production、 `feat/*` = 1 PR / 1 機能、`hotfix/*` = 緊急修正。
2. コードレビュー：1 Approve + CI Green でマージ可。
3. CI：Push 時に Unit/Integration、PR 時に Lighthouse & Security Scan を実行。
4. リリース：`main` にマージで Git Tag → GitHub Actions `build-and-deploy`。
5. 監視：デプロイ後 `/health` & Sentry で自動チェック。

## 1. フロー

```
Git push → GitHub Actions → build & test → rsync to GCP VM → Apache reload
```

## 2. GitHub Actions ワークフロー

- test ジョブ：Lint / Type-check / Jest / Build
- lighthouse ジョブ：PR 時に LHCI でパフォーマンス計測
- build-and-deploy ジョブ (main ブランチ)：
  1. Next.js `npm run build`
  2. 画像最適化 & favicon 生成
  3. `rsync` で `/tmp/website-deploy` へ転送
  4. `/var/www/html` に上書き & 権限設定
  5. Apache `systemctl reload`
  6. `certbot renew --dry-run`
  7. `/health` エンドポイントでヘルスチェック
- security-scan ジョブ：本番に対してヘッダー & SSL チェック

## 3. GCP VM 設定

| 項目   | 値                      |
| ------ | ----------------------- |
| OS     | Ubuntu 22.04 LTS        |
| Web    | Apache 2.4 + mod_ssl    |
| Domain | yusuke-kim.com          |
| SSL    | Let's Encrypt (Certbot) |

### Apache バーチャルホスト (抜粋)

```
<VirtualHost *:443>
  ServerName yusuke-kim.com
  DocumentRoot /var/www/html
  SSLEngine on
  SSLCertificateFile /etc/letsencrypt/live/yusuke-kim.com/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/yusuke-kim.com/privkey.pem

  # SPA ルーティング
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [L]
</VirtualHost>
```

## 4. 環境変数

- `.env.example` をコピーして `.env.local` を編集
- GitHub Secrets (`GCP_SSH_KEY`, `GCP_HOST`, `GCP_USER`, etc.)

## 5. バックアップ

- デプロイ前に `/var/www/html` を `/var/www/backups/html-YYYYMMDD-HHMMSS` にコピー
- `gsutil rsync -r /var/www/backups gs://yusuke-kim-backup` で週次クラウドバックアップ

---

> ロールバック手順：GitHub Actions の最後にある `Rollback on failure` ステップ、または GCP VM で最新バックアップを手動リストア。

## 6. 監視 & ログ

| 項目           | 設定                                                                |
| -------------- | ------------------------------------------------------------------- |
| ヘルスチェック | `/health` (60s)・`/api/health` (5m)                                 |
| パフォーマンス | Core Web Vitals, custom metrics (`contentLoadTime`, `toolInitTime`) |
| ログ           | `app.log` ローテ 10MB ×7、アクセスログ combined                     |
| アラート       | error_rate>5% (critical), response_time>3s (warning)                |

### monitoringConfig (抜粋)

```ts
export const monitoringConfig = {
  performance: { webVitals: true },
  errorTracking: { frontend: { capture: true }, backend: { capture: true } },
  healthCheck: { endpoints: [{ path: "/health", interval: 30000 }] },
  alerts: {
    rules: [{ name: "High Error Rate", condition: "error_rate > 5%" }],
  },
};
```

## 7. セキュリティ

- CSP：`default-src 'self'`; `img-src` `data:` `blob:` `https:`
- HSTS：`max-age=31536000; includeSubDomains`
- Rate Limit：API 60/m, Contact 3/15m, Download 10/h
- XSS 対策：`DOMPurify.sanitize()` + `sanitizeInput()` util
- File Upload：画像 10MB, 動画 100MB, mime-type whitelist, ClamAV スキャン

## 8. Apache 設定 (完全版)

`/etc/apache2/sites-available/yusuke-kim.conf` の追加設定:

```apache
<Directory "/var/www/html">
  Options -Indexes
  AllowOverride All
  Require all granted

  # 静的キャッシュ
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|svg|webp)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # Gzip / Brotli
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</Directory>
```

## 9. 災害復旧 & バックアップ

### バックアップ戦略

- データ: 日次 (`cron 2:00`) → local + cloud + external
- コード: GitHub (primary) + GitLab (mirror) + local-git
- 保持期間: 30 日 (data) / 無期限 (git)

### 復旧手順 (RTO 24h / RPO 24h)

1. 新 VM 構築 & Apache + SSL セットアップ
2. `gsutil cp` で最新バックアップ取得
3. `tar -xvf backup.tar.gz -C /var/www/html`
4. DNS 切替 & ヘルスチェック

---
