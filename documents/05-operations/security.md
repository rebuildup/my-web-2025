# セキュリティ設計

## 概要

このドキュメントでは、個人 Web サイトのセキュリティ設計について詳述します。

## 基本方針

```typescript
// lib/security/index.ts
export const securityConfig = {
  // セキュリティヘッダー
  headers: {
    // HTTPS強制
    strictTransportSecurity: {
      maxAge: 31536000, // 1年間
      includeSubDomains: true, // サブドメイン含む
      preload: true, // HSTS preload list
    },

    // フレーム埋め込み防止
    xFrameOptions: "DENY",

    // コンテンツタイプ嗅探防止
    xContentTypeOptions: "nosniff",

    // XSS防護
    xXSSProtection: "1; mode=block",

    // Referrerポリシー
    referrerPolicy: "strict-origin-when-cross-origin",

    // Permissions Policy
    permissionsPolicy: {
      camera: "none",
      microphone: "none",
      geolocation: "none",
      payment: "none",
    },
  },
};
```

## Content Security Policy (CSP)

```typescript
const contentSecurityPolicy = {
  // 基本設定
  default: "'self'",

  // スクリプト
  script: [
    "'self'",
    "'unsafe-inline'", // Tailwind CSS inline styles
    "https://www.googletagmanager.com", // Google Analytics
    "https://www.google-analytics.com",
  ],

  // スタイル
  style: [
    "'self'",
    "'unsafe-inline'", // Tailwind CSS
    "https://fonts.googleapis.com", // Google Fonts
  ],

  // フォント
  font: [
    "'self'",
    "https://fonts.gstatic.com", // Google Fonts
  ],

  // 画像
  img: [
    "'self'",
    "data:", // Base64画像
    "https:", // 外部画像（ポートフォリオ用）
  ],

  // 接続
  connect: [
    "'self'",
    "https://www.google-analytics.com", // Google Analytics
  ],

  // フレーム
  frame: "'none'",

  // 制御用ヘッダー
  header: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://www.google-analytics.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `,
};
```

## データ保護

### 入力値検証

```typescript
const inputValidation = {
  // お問い合わせフォーム
  contactForm: {
    name: {
      required: true,
      maxLength: 100,
      pattern: /^[^\x00-\x1f\x7f<>]*$/, // 制御文字・HTML防止
    },
    email: {
      required: true,
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 基本的なメール形式
    },
    message: {
      required: true,
      maxLength: 5000,
      sanitize: true, // HTMLタグ除去
    },
  },

  // ツール入力
  toolInputs: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["text/plain", "text/csv", "image/svg+xml"],
    scanForMalware: false, // 将来的に実装
  },
};
```

### データ暗号化

```typescript
const dataEncryption = {
  // 転送中の暗号化
  tls: {
    version: "1.2+", // TLS 1.2以上
    ciphers:
      "ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS",
    hsts: true,
  },

  // 保存時の暗号化
  storage: {
    sensitive: true, // 機密データの暗号化
    algorithm: "AES-256-GCM",
    keyRotation: 90, // 90日ごとにキーローテーション
  },

  // バックアップ暗号化
  backup: {
    encryption: true,
    compression: true,
    passwordProtected: true,
  },
};
```

## アクセス制御

### Rate Limiting

```typescript
const rateLimiting = {
  // 一般アクセス
  general: {
    windowMs: 15 * 60 * 1000, // 15分
    max: 1000, // 最大1000リクエスト
    message: "Too many requests from this IP",
  },

  // API呼び出し
  api: {
    windowMs: 1 * 60 * 1000, // 1分
    max: 60, // 最大60リクエスト
    skipSuccessfulRequests: false,
  },

  // フォーム送信
  forms: {
    windowMs: 1 * 60 * 1000, // 1分
    max: 5, // 最大5回送信
    skipFailedRequests: false,
  },

  // ツール使用
  tools: {
    windowMs: 1 * 60 * 1000, // 1分
    max: 30, // 最大30回使用
    keyGenerator: (req: any) => req.ip,
  },
};
```

### 管理画面保護

```typescript
const adminSecurity = {
  // アクセス制限
  access: {
    ipWhitelist: [], // 開発時のみIP制限
    authRequired: true,
    sessionTimeout: 30 * 60 * 1000, // 30分
  },

  // 認証
  authentication: {
    method: "session", // セッション認証
    strengthRequirement: "high",
    mfaRequired: false, // 将来的に実装
  },

  // 監査ログ
  auditLog: {
    enabled: true,
    events: ["login", "logout", "data_modification", "file_access"],
    retention: 90, // 90日保持
  },
};
```

## ファイルアップロード安全性

```typescript
const fileUploadSecurity = {
  // ファイル制限
  restrictions: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      "text/plain",
      "text/csv",
      "image/svg+xml",
      "image/jpeg",
      "image/png",
    ],
    blockedExtensions: [
      ".exe",
      ".bat",
      ".cmd",
      ".com",
      ".pif",
      ".scr",
      ".vbs",
      ".js",
      ".jar",
      ".php",
      ".asp",
      ".jsp",
    ],
  },

  // ファイル検証
  validation: {
    mimeTypeCheck: true, // MIMEタイプ検証
    magicNumberCheck: true, // マジックナンバー検証
    filenameValidation: true, // ファイル名検証
    virusScan: false, // 将来的にウイルススキャン
  },

  // ストレージ
  storage: {
    sandboxed: true, // サンドボックス化
    directAccess: false, // 直接アクセス不可
    temporaryStorage: true, // 一時ストレージ使用
    autoCleanup: 24 * 60 * 60 * 1000, // 24時間後自動削除
  },
};
```

## ログ・監視

```typescript
const securityMonitoring = {
  // セキュリティイベント
  events: [
    "failed_authentication",
    "suspicious_requests",
    "rate_limit_violations",
    "unusual_access_patterns",
    "file_upload_attempts",
    "sql_injection_attempts",
    "xss_attempts",
  ],

  // アラート条件
  alerts: {
    failedLoginThreshold: 5, // 5回失敗でアラート
    suspiciousIPThreshold: 100, // 100リクエスト/分でアラート
    errorRateThreshold: 10, // エラー率10%でアラート
  },

  // インシデント対応
  incidentResponse: {
    autoBlock: {
      enabled: true,
      duration: 24 * 60 * 60 * 1000, // 24時間ブロック
      conditions: ["brute_force", "malware_detected"],
    },
    notification: {
      channels: ["log", "email"], // 将来的にSlack等
      severity: ["critical", "high"],
    },
  },
};
```

## HTTPS・SSL/TLS 設定

```apache
# Apache SSL設定例
<VirtualHost *:443>
    ServerName yusuke-kim.com
    DocumentRoot /var/www/html

    # SSL有効化
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yusuke-kim.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yusuke-kim.com/privkey.pem

    # セキュリティヘッダー
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # CSP設定
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com; frame-src 'none'; object-src 'none'"
</VirtualHost>
```
