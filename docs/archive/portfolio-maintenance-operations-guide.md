# Portfolio System Maintenance & Operations Guide

## 概要

このドキュメントは、ポートフォリオシステムの保守・運用に関する包括的なガイドです.
パフォーマンス監視、トラブルシューティング、定期メンテナンス、システム更新について詳述します.

## 目次

1. [システム監視](#システム監視)
2. [パフォーマンス監視](#パフォーマンス監視)
3. [エラー監視・対応](#エラー監視対応)
4. [定期メンテナンス](#定期メンテナンス)
5. [バックアップ・復旧](#バックアップ復旧)
6. [セキュリティ対応](#セキュリティ対応)
7. [トラブルシューティング](#トラブルシューティング)
8. [システム更新](#システム更新)

## システム監視

### 監視対象項目

#### 1. アプリケーション監視

- **ページ応答時間**: 全ページの読み込み時間
- **API応答時間**: データ取得APIの応答時間
- **エラー率**: 4xx/5xxエラーの発生率
- **可用性**: システムの稼働率

#### 2. インフラ監視

- **サーバーリソース**: CPU、メモリ、ディスク使用率
- **ネットワーク**: 帯域幅、レイテンシ
- **CDN**: キャッシュヒット率、配信速度

#### 3. ユーザー体験監視

- **Core Web Vitals**: LCP、FID、CLS
- **ユーザーセッション**: セッション時間、離脱率
- **デバイス別パフォーマンス**: モバイル/デスクトップ

### 監視ツール設定

#### Google Analytics 4

```javascript
// GA4 設定
gtag("config", "GA_MEASUREMENT_ID", {
  page_title: document.title,
  page_location: window.location.href,
  custom_map: {
    custom_parameter_1: "portfolio_section",
  },
});

// カスタムイベント
gtag("event", "portfolio_view", {
  event_category: "engagement",
  event_label: "portfolio_item_id",
  value: 1,
});
```

#### Lighthouse CI

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/portfolio',
        'http://localhost:3000/portfolio/gallery/all',
        'http://localhost:3000/portfolio/playground/design',
        'http://localhost:3000/portfolio/playground/WebGL'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.9}]
      }
    }
  }
};
```

## パフォーマンス監視

### Core Web Vitals 監視

#### 1. LCP (Largest Contentful Paint) 監視

```typescript
// LCP測定
const observeLCP = () => {
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];

    // LCPが2.5秒を超える場合はアラート
    if (lastEntry.startTime > 2500) {
      console.warn("LCP threshold exceeded:", lastEntry.startTime);
      reportPerformanceIssue("LCP", lastEntry.startTime);
    }
  }).observe({ entryTypes: ["largest-contentful-paint"] });
};
```

#### 2. FID (First Input Delay) 監視

```typescript
// FID測定
const observeFID = () => {
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      // FIDが100msを超える場合はアラート
      if (entry.processingStart - entry.startTime > 100) {
        console.warn(
          "FID threshold exceeded:",
          entry.processingStart - entry.startTime,
        );
        reportPerformanceIssue("FID", entry.processingStart - entry.startTime);
      }
    });
  }).observe({ entryTypes: ["first-input"] });
};
```

#### 3. CLS (Cumulative Layout Shift) 監視

```typescript
// CLS測定
const observeCLS = () => {
  let clsValue = 0;

  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }

    // CLSが0.1を超える場合はアラート
    if (clsValue > 0.1) {
      console.warn("CLS threshold exceeded:", clsValue);
      reportPerformanceIssue("CLS", clsValue);
    }
  }).observe({ entryTypes: ["layout-shift"] });
};
```

### WebGL パフォーマンス監視

#### WebGL専用監視システム

```typescript
class WebGLPerformanceMonitor {
  private metrics: WebGLMetrics = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    textureMemory: 0,
    geometryMemory: 0,
  };

  monitor(renderer: THREE.WebGLRenderer): void {
    const info = renderer.info;

    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;

    // パフォーマンス閾値チェック
    if (this.metrics.fps < 30) {
      this.reportLowFPS();
    }

    if (this.metrics.drawCalls > 1000) {
      this.reportHighDrawCalls();
    }
  }

  private reportLowFPS(): void {
    console.warn("WebGL FPS below threshold:", this.metrics.fps);
    // アラート送信
  }

  private reportHighDrawCalls(): void {
    console.warn("WebGL draw calls too high:", this.metrics.drawCalls);
    // 最適化提案
  }
}
```

### パフォーマンス自動最適化

#### 動的品質調整

```typescript
class AdaptiveQualityManager {
  private currentQuality: QualityLevel = "medium";
  private performanceHistory: number[] = [];

  adjustQuality(currentMetrics: PerformanceMetrics): QualityLevel {
    this.performanceHistory.push(currentMetrics.fps);

    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift();
    }

    const averageFPS =
      this.performanceHistory.reduce((a, b) => a + b, 0) /
      this.performanceHistory.length;

    if (averageFPS < 20) {
      this.currentQuality = "low";
      this.applyLowQualitySettings();
    } else if (averageFPS < 45) {
      this.currentQuality = "medium";
      this.applyMediumQualitySettings();
    } else if (averageFPS > 55) {
      this.currentQuality = "high";
      this.applyHighQualitySettings();
    }

    return this.currentQuality;
  }

  private applyLowQualitySettings(): void {
    // 解像度を下げる
    // シャドウを無効化
    // パーティクル数を減らす
  }
}
```

## エラー監視・対応

### エラー分類と対応

#### 1. JavaScript エラー

```typescript
// グローバルエラーハンドラー
window.addEventListener("error", (event) => {
  const errorInfo = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // エラーレポート送信
  reportError("javascript_error", errorInfo);
});

// Promise rejection エラー
window.addEventListener("unhandledrejection", (event) => {
  const errorInfo = {
    reason: event.reason,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  reportError("promise_rejection", errorInfo);
});
```

#### 2. WebGL エラー

```typescript
const handleWebGLError = (error: Error, context: string) => {
  const errorInfo = {
    message: error.message,
    context,
    timestamp: new Date().toISOString(),
    webglSupport: !!document.createElement("canvas").getContext("webgl"),
    userAgent: navigator.userAgent,
  };

  // WebGL固有のエラー分類
  if (error.message.includes("context lost")) {
    errorInfo.type = "context_lost";
    handleContextLoss();
  } else if (error.message.includes("out of memory")) {
    errorInfo.type = "out_of_memory";
    handleOutOfMemory();
  } else {
    errorInfo.type = "general_webgl_error";
  }

  reportError("webgl_error", errorInfo);
};
```

#### 3. API エラー

```typescript
const handleAPIError = async (response: Response, endpoint: string) => {
  const errorInfo = {
    status: response.status,
    statusText: response.statusText,
    endpoint,
    timestamp: new Date().toISOString(),
    responseHeaders: Object.fromEntries(response.headers.entries()),
  };

  try {
    const errorBody = await response.text();
    errorInfo.body = errorBody;
  } catch (e) {
    errorInfo.body = "Unable to read response body";
  }

  reportError("api_error", errorInfo);
};
```

### エラー復旧戦略

#### 自動復旧システム

```typescript
class ErrorRecoveryManager {
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;

  async attemptRecovery(
    errorType: string,
    recoveryFunction: () => Promise<void>,
  ): Promise<boolean> {
    const attempts = this.retryAttempts.get(errorType) || 0;

    if (attempts >= this.maxRetries) {
      console.error(`Max retry attempts reached for ${errorType}`);
      return false;
    }

    try {
      await recoveryFunction();
      this.retryAttempts.delete(errorType);
      return true;
    } catch (error) {
      this.retryAttempts.set(errorType, attempts + 1);

      // 指数バックオフで再試行
      const delay = Math.pow(2, attempts) * 1000;
      setTimeout(
        () => this.attemptRecovery(errorType, recoveryFunction),
        delay,
      );

      return false;
    }
  }
}
```

## 定期メンテナンス

### 日次メンテナンス

#### 1. ログ確認・分析

```bash
#!/bin/bash
# daily-log-analysis.sh

# エラーログの確認
echo "=== Error Log Analysis ==="
grep -i "error" /var/log/application.log | tail -50

# パフォーマンスログの確認
echo "=== Performance Log Analysis ==="
grep -i "performance" /var/log/application.log | tail -20

# WebGLエラーの確認
echo "=== WebGL Error Analysis ==="
grep -i "webgl" /var/log/application.log | tail -20
```

#### 2. パフォーマンス指標確認

```typescript
// daily-performance-check.ts
const performDailyCheck = async () => {
  const metrics = await collectPerformanceMetrics();

  const report = {
    date: new Date().toISOString().split("T")[0],
    averageLCP: metrics.lcp.average,
    averageFID: metrics.fid.average,
    averageCLS: metrics.cls.average,
    errorRate: metrics.errors.rate,
    webglPerformance: metrics.webgl,
  };

  // 閾値チェック
  const issues = [];
  if (report.averageLCP > 2500) issues.push("LCP threshold exceeded");
  if (report.averageFID > 100) issues.push("FID threshold exceeded");
  if (report.averageCLS > 0.1) issues.push("CLS threshold exceeded");
  if (report.errorRate > 0.01) issues.push("Error rate too high");

  if (issues.length > 0) {
    await sendAlert("Daily Performance Issues", issues);
  }

  await savePerformanceReport(report);
};
```

### 週次メンテナンス

#### 1. データベース最適化

```typescript
// weekly-database-optimization.ts
const performWeeklyOptimization = async () => {
  // 古いログの削除
  await cleanupOldLogs();

  // キャッシュの最適化
  await optimizeCache();

  // インデックスの再構築
  await rebuildSearchIndex();

  // パフォーマンス統計の更新
  await updatePerformanceStats();
};
```

#### 2. セキュリティスキャン

```bash
#!/bin/bash
# weekly-security-scan.sh

# 依存関係の脆弱性チェック
npm audit

# セキュリティヘッダーの確認
curl -I https://yusuke-kim.com/portfolio | grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options)"

# SSL証明書の確認
openssl s_client -connect yusuke-kim.com:443 -servername yusuke-kim.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

### 月次メンテナンス

#### 1. 包括的パフォーマンス分析

```typescript
// monthly-performance-analysis.ts
const performMonthlyAnalysis = async () => {
  const monthlyData = await getMonthlyPerformanceData();

  const analysis = {
    performanceTrends: analyzePerformanceTrends(monthlyData),
    userExperienceMetrics: analyzeUserExperience(monthlyData),
    webglPerformance: analyzeWebGLPerformance(monthlyData),
    recommendations: generateRecommendations(monthlyData),
  };

  await generateMonthlyReport(analysis);
};
```

#### 2. 容量・リソース計画

```typescript
// monthly-capacity-planning.ts
const performCapacityPlanning = async () => {
  const usage = await getResourceUsage();
  const growth = calculateGrowthRate(usage);

  const projections = {
    storage: projectStorageNeeds(usage.storage, growth),
    bandwidth: projectBandwidthNeeds(usage.bandwidth, growth),
    compute: projectComputeNeeds(usage.compute, growth),
  };

  if (projections.storage.warningLevel > 0.8) {
    await sendAlert("Storage Capacity Warning", projections.storage);
  }

  await saveCapacityReport(projections);
};
```

## バックアップ・復旧

### バックアップ戦略

#### 1. データバックアップ

```bash
#!/bin/bash
# backup-data.sh

BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# ポートフォリオデータのバックアップ
cp -r public/data/content $BACKUP_DIR/

# 設定ファイルのバックアップ
cp next.config.ts $BACKUP_DIR/
cp package.json $BACKUP_DIR/
cp tailwind.config.ts $BACKUP_DIR/

# 圧縮
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# 古いバックアップの削除（30日以上）
find /backups -name "*.tar.gz" -mtime +30 -delete
```

#### 2. コードバックアップ

```bash
#!/bin/bash
# backup-code.sh

# Gitリポジトリの状態確認
git status --porcelain

# 未コミットの変更がある場合は警告
if [ -n "$(git status --porcelain)" ]; then
    echo "Warning: Uncommitted changes detected"
    git status
fi

# リモートリポジトリへのプッシュ
git push origin main

# タグの作成（月次）
if [ "$(date +%d)" = "01" ]; then
    TAG="backup-$(date +%Y%m)"
    git tag $TAG
    git push origin $TAG
fi
```

### 復旧手順

#### 1. データ復旧

```bash
#!/bin/bash
# restore-data.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# バックアップファイルの展開
tar -xzf $BACKUP_FILE

# データの復旧
BACKUP_DIR=$(basename $BACKUP_FILE .tar.gz)
cp -r $BACKUP_DIR/content public/data/

# 設定ファイルの復旧
cp $BACKUP_DIR/next.config.ts .
cp $BACKUP_DIR/package.json .
cp $BACKUP_DIR/tailwind.config.ts .

# 依存関係の再インストール
npm install

# アプリケーションの再起動
npm run build
pm2 restart portfolio-app
```

#### 2. 緊急時復旧プロセス

```typescript
// emergency-recovery.ts
const emergencyRecovery = async () => {
  console.log("Starting emergency recovery process...");

  try {
    // 1. システム状態の確認
    const systemStatus = await checkSystemStatus();

    // 2. 最新バックアップの特定
    const latestBackup = await findLatestBackup();

    // 3. データ復旧
    await restoreFromBackup(latestBackup);

    // 4. サービス再起動
    await restartServices();

    // 5. 動作確認
    const healthCheck = await performHealthCheck();

    if (healthCheck.success) {
      console.log("Emergency recovery completed successfully");
      await notifyRecoverySuccess();
    } else {
      throw new Error("Health check failed after recovery");
    }
  } catch (error) {
    console.error("Emergency recovery failed:", error);
    await notifyRecoveryFailure(error);
  }
};
```

## セキュリティ対応

### セキュリティ監視

#### 1. 不正アクセス検知

```typescript
// security-monitor.ts
class SecurityMonitor {
  private suspiciousIPs: Set<string> = new Set();
  private requestCounts: Map<string, number> = new Map();

  monitorRequest(ip: string, userAgent: string, path: string): void {
    // レート制限チェック
    const count = this.requestCounts.get(ip) || 0;
    this.requestCounts.set(ip, count + 1);

    if (count > 100) {
      // 1分間に100リクエスト以上
      this.flagSuspiciousIP(ip);
    }

    // 不審なUser-Agentの検知
    if (this.isSuspiciousUserAgent(userAgent)) {
      this.flagSuspiciousIP(ip);
    }

    // 不審なパスアクセスの検知
    if (this.isSuspiciousPath(path)) {
      this.flagSuspiciousIP(ip);
    }
  }

  private flagSuspiciousIP(ip: string): void {
    this.suspiciousIPs.add(ip);
    this.reportSecurityIncident("suspicious_ip", { ip });
  }
}
```

#### 2. CSP違反監視

```typescript
// csp-monitor.ts
const monitorCSPViolations = () => {
  document.addEventListener("securitypolicyviolation", (event) => {
    const violation = {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      timestamp: new Date().toISOString(),
    };

    // CSP違反をレポート
    reportSecurityIncident("csp_violation", violation);
  });
};
```

### セキュリティ更新

#### 1. 依存関係の更新

```bash
#!/bin/bash
# security-update.sh

# セキュリティ監査
npm audit

# 高・中リスクの脆弱性を自動修正
npm audit fix

# 手動確認が必要な脆弱性の報告
npm audit --audit-level moderate

# 更新後のテスト実行
npm run test:all
```

#### 2. セキュリティヘッダーの確認

```typescript
// security-headers-check.ts
const checkSecurityHeaders = async (url: string) => {
  const response = await fetch(url);
  const headers = response.headers;

  const securityHeaders = {
    "content-security-policy": headers.get("content-security-policy"),
    "x-frame-options": headers.get("x-frame-options"),
    "x-content-type-options": headers.get("x-content-type-options"),
    "referrer-policy": headers.get("referrer-policy"),
    "permissions-policy": headers.get("permissions-policy"),
  };

  const missing = Object.entries(securityHeaders)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn("Missing security headers:", missing);
    await reportSecurityIssue("missing_headers", missing);
  }

  return securityHeaders;
};
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. パフォーマンス低下

```typescript
// performance-troubleshooting.ts
const diagnosePerformanceIssue = async () => {
  const diagnostics = {
    // Core Web Vitals の確認
    coreWebVitals: await measureCoreWebVitals(),

    // リソース読み込み時間
    resourceTiming: performance.getEntriesByType("resource"),

    // JavaScript実行時間
    longTasks: await measureLongTasks(),

    // メモリ使用量
    memoryUsage: (performance as any).memory,

    // WebGL パフォーマンス
    webglMetrics: await getWebGLMetrics(),
  };

  const issues = analyzePerformanceIssues(diagnostics);
  const recommendations = generatePerformanceRecommendations(issues);

  return { diagnostics, issues, recommendations };
};
```

#### 2. WebGL関連問題

```typescript
// webgl-troubleshooting.ts
const diagnoseWebGLIssue = () => {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) {
    return {
      issue: "WebGL not supported",
      solution: "Display fallback content",
      userAgent: navigator.userAgent,
    };
  }

  const diagnostics = {
    version: gl.getParameter(gl.VERSION),
    vendor: gl.getParameter(gl.VENDOR),
    renderer: gl.getParameter(gl.RENDERER),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexTextures: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    extensions: gl.getSupportedExtensions(),
  };

  // 一般的な問題の診断
  const issues = [];

  if (diagnostics.maxTextureSize < 2048) {
    issues.push({
      issue: "Low texture size limit",
      solution: "Reduce texture quality",
    });
  }

  if (!diagnostics.extensions?.includes("OES_texture_float")) {
    issues.push({
      issue: "Float textures not supported",
      solution: "Use alternative data storage",
    });
  }

  return { diagnostics, issues };
};
```

#### 3. メモリリーク

```typescript
// memory-leak-detection.ts
class MemoryLeakDetector {
  private initialMemory: number = 0;
  private measurements: number[] = [];

  startMonitoring(): void {
    if ("memory" in performance) {
      this.initialMemory = (performance as any).memory.usedJSHeapSize;

      setInterval(() => {
        const currentMemory = (performance as any).memory.usedJSHeapSize;
        this.measurements.push(currentMemory);

        // 過去10回の測定値を保持
        if (this.measurements.length > 10) {
          this.measurements.shift();
        }

        this.checkForMemoryLeak();
      }, 30000); // 30秒間隔
    }
  }

  private checkForMemoryLeak(): void {
    if (this.measurements.length < 5) return;

    const trend = this.calculateTrend();
    const currentMemory = this.measurements[this.measurements.length - 1];
    const memoryIncrease = currentMemory - this.initialMemory;

    // メモリ使用量が50MB以上増加し、増加傾向にある場合
    if (memoryIncrease > 50 * 1024 * 1024 && trend > 0.1) {
      console.warn("Potential memory leak detected");
      this.reportMemoryLeak(currentMemory, memoryIncrease, trend);
    }
  }

  private calculateTrend(): number {
    // 線形回帰で傾向を計算
    const n = this.measurements.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = this.measurements;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }
}
```

### 緊急時対応手順

#### システム障害時の対応

```typescript
// emergency-response.ts
const emergencyResponse = async (incidentType: string) => {
  console.log(`Emergency response initiated for: ${incidentType}`);

  // 1. インシデントの記録
  const incident = await createIncident(incidentType);

  // 2. 関係者への通知
  await notifyStakeholders(incident);

  // 3. 応急処置の実行
  switch (incidentType) {
    case "high_error_rate":
      await enableMaintenanceMode();
      break;
    case "performance_degradation":
      await enablePerformanceMode();
      break;
    case "security_breach":
      await enableSecurityMode();
      break;
  }

  // 4. 詳細調査の開始
  const investigation = await startInvestigation(incident);

  // 5. 復旧作業の実行
  const recovery = await executeRecovery(investigation);

  // 6. 事後報告
  await generateIncidentReport(incident, investigation, recovery);
};
```

## システム更新

### 更新プロセス

#### 1. 段階的デプロイメント

```bash
#!/bin/bash
# staged-deployment.sh

# 1. 開発環境でのテスト
echo "Running tests in development..."
npm run test:all

if [ $? -ne 0 ]; then
    echo "Tests failed in development"
    exit 1
fi

# 2. ステージング環境へのデプロイ
echo "Deploying to staging..."
vercel --prod --scope staging

# 3. ステージング環境でのテスト
echo "Running tests in staging..."
npm run test:e2e:staging

if [ $? -ne 0 ]; then
    echo "Tests failed in staging"
    exit 1
fi

# 4. 本番環境へのデプロイ
echo "Deploying to production..."
vercel --prod

# 5. 本番環境での動作確認
echo "Running health checks in production..."
npm run health-check:production
```

#### 2. ロールバック手順

```bash
#!/bin/bash
# rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "Usage: $0 <previous_version>"
    exit 1
fi

echo "Rolling back to version: $PREVIOUS_VERSION"

# 1. 以前のバージョンにロールバック
vercel rollback $PREVIOUS_VERSION

# 2. 動作確認
npm run health-check:production

if [ $? -eq 0 ]; then
    echo "Rollback successful"
    # 関係者に通知
    curl -X POST $SLACK_WEBHOOK -d "{\"text\":\"Portfolio system rolled back to $PREVIOUS_VERSION\"}"
else
    echo "Rollback failed"
    exit 1
fi
```

### 更新後の確認項目

#### 1. 機能確認チェックリスト

```typescript
// post-deployment-check.ts
const postDeploymentCheck = async () => {
  const checks = [
    // 基本機能
    { name: "Portfolio top page", test: () => checkPage("/portfolio") },
    { name: "Gallery pages", test: () => checkGalleryPages() },
    { name: "Detail pages", test: () => checkDetailPages() },
    { name: "Playground pages", test: () => checkPlaygroundPages() },

    // API機能
    { name: "Portfolio API", test: () => checkAPI("/api/content/portfolio") },
    { name: "Analytics API", test: () => checkAPI("/api/analytics") },

    // パフォーマンス
    { name: "Core Web Vitals", test: () => checkCoreWebVitals() },
    { name: "WebGL performance", test: () => checkWebGLPerformance() },

    // セキュリティ
    { name: "Security headers", test: () => checkSecurityHeaders() },
    { name: "CSP compliance", test: () => checkCSPCompliance() },
  ];

  const results = [];

  for (const check of checks) {
    try {
      const result = await check.test();
      results.push({ name: check.name, status: "pass", result });
    } catch (error) {
      results.push({ name: check.name, status: "fail", error: error.message });
    }
  }

  const failedChecks = results.filter((r) => r.status === "fail");

  if (failedChecks.length > 0) {
    console.error("Post-deployment checks failed:", failedChecks);
    await notifyDeploymentIssues(failedChecks);
  } else {
    console.log("All post-deployment checks passed");
    await notifyDeploymentSuccess();
  }

  return results;
};
```

## まとめ

このガイドでは、ポートフォリオシステムの包括的な保守・運用方法を説明しました.
定期的な監視とメンテナンスを行うことで、システムの安定性とパフォーマンスを維持できます.

### 重要なポイント

1. **継続的監視**: パフォーマンス指標とエラー率の常時監視
2. **予防的メンテナンス**: 問題が発生する前の対策
3. **迅速な対応**: インシデント発生時の素早い復旧
4. **文書化**: 全ての手順と結果の記録
5. **改善**: 監視結果に基づく継続的な改善

これらの実践により、高品質なポートフォリオシステムを維持できます.
