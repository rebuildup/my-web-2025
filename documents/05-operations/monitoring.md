# 監視・ログ設計

## 概要

このドキュメントでは、個人 Web サイトの監視とログ設計について詳述します。

## ログレベル設定

```typescript
// lib/monitoring/index.ts
export const monitoringConfig = {
  // ログレベル設定
  logging: {
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
    },

    // 環境別設定
    environments: {
      production: "warn",
      staging: "info",
      development: "debug",
    },

    // ログ出力先
    outputs: {
      console: true,
      file: "/var/log/yusuke-kim/app.log",
      syslog: false,
      remote: false, // 将来的にログ収集サービス連携
    },

    // ログローテーション
    rotation: {
      enabled: true,
      maxSize: "10MB",
      maxFiles: 7,
      compress: true,
    },
  },
};
```

## パフォーマンス監視

### Core Web Vitals

```typescript
// パフォーマンス監視設定
const performanceConfig = {
  webVitals: {
    lcp: { good: 2500, poor: 4000 }, // LCP (ms)
    fid: { good: 100, poor: 300 }, // FID (ms)
    cls: { good: 0.1, poor: 0.25 }, // CLS
    fcp: { good: 1800, poor: 3000 }, // FCP (ms)
    ttfb: { good: 600, poor: 1500 }, // TTFB (ms)
  },

  // カスタムメトリクス
  custom: {
    contentLoadTime: true, // コンテンツ読み込み時間
    toolInitTime: true, // ツール初期化時間
    searchResponseTime: true, // 検索レスポンス時間
    imageLoadTime: true, // 画像読み込み時間
  },

  // 収集間隔
  collection: {
    interval: 30000, // 30秒間隔
    batchSize: 50, // 50件ずつバッチ送信
    maxRetries: 3, // 最大3回リトライ
  },
};
```

## エラー監視

### フロントエンド・バックエンドエラー

```typescript
const errorTracking = {
  // JavaScript エラー
  frontend: {
    capture: true,
    sourceMap: true, // ソースマップ使用
    filterNoise: true, // ノイズフィルタリング
    userContext: true, // ユーザーコンテキスト収集
  },

  // API エラー
  backend: {
    capture: true,
    stackTrace: true, // スタックトレース収集
    requestContext: true, // リクエストコンテキスト
    sensitiveDataFilter: true, // 機密データフィルタリング
  },

  // 通知設定
  notifications: {
    critical: true, // 重大エラーの即座通知
    threshold: 10, // 10件/時間で通知
    channels: ["log", "console"], // 通知チャンネル
  },
};
```

## ヘルスチェック

### システム監視

```typescript
const healthCheck = {
  endpoints: [
    { path: "/health", interval: 30000 },
    { path: "/api/health", interval: 60000 },
  ],

  checks: [
    "database", // データベース接続
    "filesystem", // ファイルシステム
    "memory", // メモリ使用量
    "disk", // ディスク使用量
    "network", // ネットワーク接続
  ],

  thresholds: {
    memory: 85, // メモリ使用率85%でアラート
    disk: 90, // ディスク使用率90%でアラート
    responseTime: 5000, // レスポンス時間5秒でアラート
  },
};
```

## アラート設定

### 監視ルール

```typescript
const alerts = {
  channels: ["log", "console"], // 将来的にSlack, Email等

  rules: [
    {
      name: "High Error Rate",
      condition: "error_rate > 5%",
      duration: "5m",
      severity: "critical",
    },
    {
      name: "Slow Response",
      condition: "response_time > 3s",
      duration: "2m",
      severity: "warning",
    },
    {
      name: "High Memory Usage",
      condition: "memory_usage > 85%",
      duration: "5m",
      severity: "warning",
    },
  ],
};
```

## ログ出力関数

```typescript
// ログ出力関数
export const logger = {
  error: (message: string, context?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, context);
  },

  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, context);
  },

  info: (message: string, context?: any) => {
    console.info(`[INFO] ${new Date().toISOString()} ${message}`, context);
  },

  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`, context);
    }
  },
};
```
