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

### 開発環境 (.env.local)

```bash
# 基本設定
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=samuido
NODE_ENV=development

# Google Analytics
NEXT_PUBLIC_GA_ID=G-RHP8NQ10X2

# Adobe Fonts
NEXT_PUBLIC_ADOBE_FONTS_KIT_ID=blm5pmr

# メール送信設定 (Resend使用)
RESEND_API_KEY=your-resend-api-key
CONTACT_EMAIL_TO=rebuild.up.up@gmail.com
DESIGN_EMAIL_TO=361do.sleep@gmail.com

# reCAPTCHA (Contact Form)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdZ3XgrAAAAAJhdhTA25XgqZBebMW_reZiIPreG
RECAPTCHA_SECRET_KEY=6LdZ3XgrAAAAAPXuBvy0XUwmALmDA5clWyRfsd5h

# Admin機能
NEXT_PUBLIC_ADMIN_ENABLED=true
ADMIN_SECRET=your-admin-secret
```

### 本番環境

```bash
# 基本設定
NEXT_PUBLIC_SITE_URL=https://yusuke-kim.com
NEXT_PUBLIC_SITE_NAME=samuido
NODE_ENV=production

# Google Analytics
NEXT_PUBLIC_GA_ID=G-RHP8NQ10X2

# Adobe Fonts
NEXT_PUBLIC_ADOBE_FONTS_KIT_ID=blm5pmr

# メール送信設定 (Resend使用)
RESEND_API_KEY=your-resend-api-key
CONTACT_EMAIL_TO=rebuild.up.up@gmail.com
DESIGN_EMAIL_TO=361do.sleep@gmail.com

# reCAPTCHA (Contact Form)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdZ3XgrAAAAAJhdhTA25XgqZBebMW_reZiIPreG
RECAPTCHA_SECRET_KEY=6LdZ3XgrAAAAAPXuBvy0XUwmALmDA5clWyRfsd5h

# Admin機能 (本番では無効化)
NEXT_PUBLIC_ADMIN_ENABLED=false
```

### GitHub Secrets

```bash
# デプロイ関連
GCP_SSH_KEY=your-private-key
GCP_HOST=your-server-ip
GCP_USER=your-username

# セキュリティ関連
ADMIN_SECRET=your-admin-secret
RECAPTCHA_SECRET_KEY=your-secret-key
SMTP_PASSWORD=your-app-password
```

## 5. バックアップ

- デプロイ前に `/var/www/html` を `/var/www/backups/html-YYYYMMDD-HHMMSS` にコピー
- `gsutil rsync -r /var/www/backups gs://yusuke-kim-backup` で週次クラウドバックアップ

---

> ロールバック手順：GitHub Actions の最後にある `Rollback on failure` ステップ、または GCP VM で最新バックアップを手動リストア。

## 6. 監視 & ログ

### 6.1 ヘルスチェック

```typescript
// src/app/api/health/route.ts
export async function GET(): Promise<Response> {
  try {
    const healthChecks = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      checks: {
        database: await checkDatabase(),
        fileSystem: await checkFileSystem(),
        externalServices: await checkExternalServices(),
        memory: await checkMemoryUsage(),
        disk: await checkDiskSpace(),
      },
    };

    const isHealthy = Object.values(healthChecks.checks).every(
      (check) => check.status === "healthy"
    );

    return Response.json(healthChecks, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error) {
    return Response.json(
      {
        timestamp: new Date().toISOString(),
        status: "unhealthy",
        error: error.message,
      },
      { status: 503 }
    );
  }
}

async function checkDatabase(): Promise<{ status: string; details?: any }> {
  try {
    // 静的JSONファイルの読み込みテスト
    const fs = require("fs").promises;
    await fs.readFile("public/data/content/portfolio.json");
    return { status: "healthy" };
  } catch (error) {
    return { status: "unhealthy", details: error.message };
  }
}

async function checkFileSystem(): Promise<{ status: string; details?: any }> {
  try {
    const fs = require("fs").promises;
    await fs.access("/var/www/html");
    return { status: "healthy" };
  } catch (error) {
    return { status: "unhealthy", details: error.message };
  }
}

async function checkExternalServices(): Promise<{
  status: string;
  details?: any;
}> {
  const services = {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_ID
      ? "configured"
      : "not-configured",
    resend: process.env.RESEND_API_KEY ? "configured" : "not-configured",
    recaptcha: process.env.RECAPTCHA_SECRET_KEY
      ? "configured"
      : "not-configured",
  };

  return {
    status: "healthy",
    details: services,
  };
}

async function checkMemoryUsage(): Promise<{ status: string; details?: any }> {
  const os = require("os");
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

  return {
    status: memoryUsage < 90 ? "healthy" : "warning",
    details: { usage: `${memoryUsage.toFixed(2)}%` },
  };
}

async function checkDiskSpace(): Promise<{ status: string; details?: any }> {
  const fs = require("fs");
  const path = require("path");

  try {
    const stats = fs.statSync("/var/www/html");
    const freeSpace = stats.blocks * 512; // 概算
    const totalSpace = 1000000000; // 1GB 想定
    const diskUsage = ((totalSpace - freeSpace) / totalSpace) * 100;

    return {
      status: diskUsage < 90 ? "healthy" : "warning",
      details: { usage: `${diskUsage.toFixed(2)}%` },
    };
  } catch (error) {
    return { status: "unhealthy", details: error.message };
  }
}
```

### 6.2 ログ設定

```apache
# /etc/apache2/sites-available/yusuke-kim.conf
<VirtualHost *:443>
  ServerName yusuke-kim.com
  DocumentRoot /var/www/html

  # ログ設定
  ErrorLog ${APACHE_LOG_DIR}/yusuke-kim_error.log
  CustomLog ${APACHE_LOG_DIR}/yusuke-kim_access.log combined

  # ログローテーション
  LogLevel warn

  # セキュリティヘッダー
  Header always set X-Content-Type-Options nosniff
  Header always set X-Frame-Options DENY
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"

  # CSP設定
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com; frame-src https://www.google.com;"

  # HSTS設定
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</VirtualHost>
```

### 6.3 ログ監視スクリプト

```bash
#!/bin/bash
# /usr/local/bin/monitor-logs.sh

LOG_DIR="/var/log/apache2"
ERROR_LOG="$LOG_DIR/yusuke-kim_error.log"
ACCESS_LOG="$LOG_DIR/yusuke-kim_access.log"
ALERT_EMAIL="rebuild.up.up@gmail.com"

# エラーレート監視
check_error_rate() {
    local error_count=$(tail -n 1000 "$ACCESS_LOG" | grep -c " 5[0-9][0-9] ")
    local total_count=$(tail -n 1000 "$ACCESS_LOG" | wc -l)
    local error_rate=$(echo "scale=2; $error_count * 100 / $total_count" | bc)

    if (( $(echo "$error_rate > 5" | bc -l) )); then
        echo "High error rate detected: ${error_rate}%" | mail -s "Website Alert: High Error Rate" "$ALERT_EMAIL"
    fi
}

# レスポンス時間監視
check_response_time() {
    local slow_requests=$(tail -n 1000 "$ACCESS_LOG" | awk '$NF > 3 {print $0}' | wc -l)

    if [ "$slow_requests" -gt 10 ]; then
        echo "Slow response times detected: $slow_requests requests > 3s" | mail -s "Website Alert: Slow Response Times" "$ALERT_EMAIL"
    fi
}

# ディスク容量監視
check_disk_space() {
    local disk_usage=$(df /var/www/html | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$disk_usage" -gt 90 ]; then
        echo "Disk space critical: ${disk_usage}%" | mail -s "Website Alert: Disk Space Critical" "$ALERT_EMAIL"
    fi
}

# メイン実行
check_error_rate
check_response_time
check_disk_space
```

### 6.4 パフォーマンス監視

```typescript
// lib/monitoring/performance.ts
export interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  timestamp: string;
}

export const performanceMonitor = {
  // Core Web Vitals測定
  measureWebVitals: (): Promise<PerformanceMetrics> => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const metrics: Partial<PerformanceMetrics> = {};

        entries.forEach((entry: any) => {
          switch (entry.name) {
            case "LCP":
              metrics.lcp = entry.startTime;
              break;
            case "FID":
              metrics.fid = entry.processingStart - entry.startTime;
              break;
            case "CLS":
              metrics.cls = entry.value;
              break;
            case "TTFB":
              metrics.ttfb = entry.responseStart - entry.requestStart;
              break;
            case "FCP":
              metrics.fcp = entry.startTime;
              break;
          }
        });

        if (Object.keys(metrics).length >= 3) {
          resolve({
            ...metrics,
            timestamp: new Date().toISOString(),
          } as PerformanceMetrics);
        }
      });

      observer.observe({
        entryTypes: [
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
          "navigation",
        ],
      });
    });
  },

  // カスタムメトリクス測定
  measureCustomMetrics: () => {
    const metrics = {
      contentLoadTime: performance.now(),
      toolInitTime: 0,
      searchResponseTime: 0,
    };

    // カスタムメトリクスの測定
    performance.mark("content-loaded");
    performance.measure(
      "content-load-time",
      "navigationStart",
      "content-loaded"
    );

    return metrics;
  },

  // メトリクス送信
  sendMetrics: async (metrics: PerformanceMetrics) => {
    try {
      await fetch("/api/metrics/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metrics),
      });
    } catch (error) {
      console.error("Failed to send performance metrics:", error);
    }
  },
};
```

### 6.5 アラート設定

```typescript
// lib/monitoring/alerts.ts
export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  severity: "warning" | "critical";
  notification: {
    email: string;
    slack?: string;
  };
}

export const alertRules: AlertRule[] = [
  {
    name: "High Error Rate",
    condition: "error_rate > 5%",
    threshold: 5,
    severity: "critical",
    notification: {
      email: "rebuild.up.up@gmail.com",
    },
  },
  {
    name: "Slow Response Time",
    condition: "response_time > 3s",
    threshold: 3000,
    severity: "warning",
    notification: {
      email: "rebuild.up.up@gmail.com",
    },
  },
  {
    name: "High Memory Usage",
    condition: "memory_usage > 90%",
    threshold: 90,
    severity: "critical",
    notification: {
      email: "rebuild.up.up@gmail.com",
    },
  },
  {
    name: "Disk Space Critical",
    condition: "disk_usage > 95%",
    threshold: 95,
    severity: "critical",
    notification: {
      email: "rebuild.up.up@gmail.com",
    },
  },
];

export const alertManager = {
  checkAlerts: async (metrics: any) => {
    const triggeredAlerts = [];

    for (const rule of alertRules) {
      const isTriggered = evaluateCondition(rule.condition, metrics);

      if (isTriggered) {
        triggeredAlerts.push(rule);
        await sendAlert(rule, metrics);
      }
    }

    return triggeredAlerts;
  },

  sendAlert: async (rule: AlertRule, metrics: any) => {
    const message = `Alert: ${rule.name}\nCondition: ${rule.condition}\nSeverity: ${rule.severity}\nMetrics: ${JSON.stringify(metrics)}`;

    // メール送信
    if (rule.notification.email) {
      await sendEmailAlert(rule.notification.email, message);
    }

    // Slack通知（設定されている場合）
    if (rule.notification.slack) {
      await sendSlackAlert(rule.notification.slack, message);
    }
  },
};

function evaluateCondition(condition: string, metrics: any): boolean {
  // 簡易的な条件評価
  if (condition.includes("error_rate")) {
    const rate = parseFloat(condition.match(/\d+/)?.[0] || "0");
    return metrics.errorRate > rate;
  }

  if (condition.includes("response_time")) {
    const time = parseFloat(condition.match(/\d+/)?.[0] || "0");
    return metrics.responseTime > time;
  }

  return false;
}
```

| 項目           | 設定                                                                |
| -------------- | ------------------------------------------------------------------- |
| ヘルスチェック | `/health` (60s)・`/api/health` (5m)                                 |
| パフォーマンス | Core Web Vitals, custom metrics (`contentLoadTime`, `toolInitTime`) |
| ログ           | `app.log` ローテ 10MB ×7、アクセスログ combined                     |
| アラート       | error_rate>5% (critical), response_time>3s (warning)                |

### monitoringConfig (抜粋)

```typescript
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

## 10. 障害対応手順

### 10.1 障害レベル定義

| レベル | 定義               | 対応時間   | 通知先     |
| ------ | ------------------ | ---------- | ---------- |
| P0     | サイト完全停止     | 1時間以内  | 緊急連絡先 |
| P1     | 主要機能停止       | 4時間以内  | 開発チーム |
| P2     | 部分機能停止       | 24時間以内 | 開発チーム |
| P3     | パフォーマンス低下 | 72時間以内 | 開発チーム |

### 10.2 障害対応フロー

```bash
#!/bin/bash
# /usr/local/bin/incident-response.sh

INCIDENT_LEVEL=$1
INCIDENT_DESCRIPTION=$2
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

case $INCIDENT_LEVEL in
  "P0")
    # 緊急対応
    echo "[$TIMESTAMP] P0 Incident: $INCIDENT_DESCRIPTION" >> /var/log/incidents.log

    # 緊急連絡先に通知
    echo "URGENT: P0 Incident detected at $TIMESTAMP - $INCIDENT_DESCRIPTION" | \
      mail -s "URGENT: Website Down" rebuild.up.up@gmail.com

    # 自動復旧試行
    systemctl restart apache2
    systemctl restart nginx 2>/dev/null || true

    # ヘルスチェック
    curl -f http://localhost/health || {
      echo "Automatic recovery failed, manual intervention required"
      exit 1
    }
    ;;

  "P1")
    # 重要対応
    echo "[$TIMESTAMP] P1 Incident: $INCIDENT_DESCRIPTION" >> /var/log/incidents.log

    # 開発チームに通知
    echo "P1 Incident detected at $TIMESTAMP - $INCIDENT_DESCRIPTION" | \
      mail -s "P1 Incident Alert" rebuild.up.up@gmail.com

    # ログ分析
    tail -n 1000 /var/log/apache2/yusuke-kim_error.log | \
      mail -s "Error Log Analysis" rebuild.up.up@gmail.com
    ;;

  "P2")
    # 通常対応
    echo "[$TIMESTAMP] P2 Incident: $INCIDENT_DESCRIPTION" >> /var/log/incidents.log

    # 開発チームに通知
    echo "P2 Incident detected at $TIMESTAMP - $INCIDENT_DESCRIPTION" | \
      mail -s "P2 Incident Alert" rebuild.up.up@gmail.com
    ;;

  "P3")
    # 軽微対応
    echo "[$TIMESTAMP] P3 Incident: $INCIDENT_DESCRIPTION" >> /var/log/incidents.log

    # ログ記録のみ
    ;;

  *)
    echo "Invalid incident level: $INCIDENT_LEVEL"
    exit 1
    ;;
esac
```

### 10.3 自動復旧スクリプト

```bash
#!/bin/bash
# /usr/local/bin/auto-recovery.sh

# ヘルスチェック
check_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
    [ "$response" = "200" ]
}

# Apache再起動
restart_apache() {
    systemctl restart apache2
    sleep 10
    check_health
}

# SSL証明書更新
renew_ssl() {
    certbot renew --dry-run
    if [ $? -eq 0 ]; then
        certbot renew
        systemctl reload apache2
    fi
}

# ディスク容量クリーンアップ
cleanup_disk() {
    # 古いログファイル削除
    find /var/log -name "*.log.*" -mtime +7 -delete

    # 古いバックアップ削除
    find /var/www/backups -name "html-*" -mtime +30 -delete

    # 一時ファイル削除
    rm -rf /tmp/website-deploy-*
}

# メイン処理
main() {
    # ヘルスチェック失敗時の復旧
    if ! check_health; then
        echo "$(date): Health check failed, attempting recovery..." >> /var/log/recovery.log

        # Apache再起動
        if restart_apache; then
            echo "$(date): Recovery successful via Apache restart" >> /var/log/recovery.log
        else
            # SSL証明書問題の可能性
            renew_ssl
            restart_apache

            if check_health; then
                echo "$(date): Recovery successful via SSL renewal" >> /var/log/recovery.log
            else
                echo "$(date): Recovery failed, manual intervention required" >> /var/log/recovery.log
                # 緊急通知
                echo "Auto-recovery failed at $(date)" | \
                  mail -s "URGENT: Auto-recovery Failed" rebuild.up.up@gmail.com
            fi
        fi
    fi

    # 定期的なメンテナンス
    cleanup_disk
}

# 実行
main
```

### 10.4 監視ダッシュボード

```typescript
// src/app/admin/monitoring/page.tsx (開発環境のみ)
export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/health');
      const data = await response.json();
      setMetrics(data);
    };

    const fetchAlerts = async () => {
      const response = await fetch('/api/admin/alerts');
      const data = await response.json();
      setAlerts(data.alerts);
    };

    fetchMetrics();
    fetchAlerts();

    const interval = setInterval(() => {
      fetchMetrics();
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return <div>Access denied in production</div>;
  }

  return (
    <div className="monitoring-dashboard">
      <h1>Monitoring Dashboard</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>System Health</h3>
          <div className="status-indicator">
            {metrics?.status === 'healthy' ? '🟢' : '🔴'} {metrics?.status}
          </div>
        </div>

        <div className="metric-card">
          <h3>Performance</h3>
          <div>LCP: {metrics?.checks?.performance?.lcp || 'N/A'}ms</div>
          <div>FID: {metrics?.checks?.performance?.fid || 'N/A'}ms</div>
        </div>

        <div className="metric-card">
          <h3>Active Alerts</h3>
          <div>{alerts.length} active alerts</div>
        </div>
      </div>

      <div className="alerts-list">
        <h3>Recent Alerts</h3>
        {alerts.map((alert, index) => (
          <div key={index} className={`alert-item ${alert.severity}`}>
            <span className="alert-time">{alert.timestamp}</span>
            <span className="alert-message">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

> **重要**: 監視・ログ・アラートの設定により、障害の早期発見と迅速な対応が可能になります。
