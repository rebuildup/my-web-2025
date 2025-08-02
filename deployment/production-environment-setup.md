# 本番環境対応ガイド

## 概要

このドキュメントでは、拡張されたポートフォリオコンテンツデータ管理システムを本番環境にデプロイするための設定と手順について説明します。

## 目次

1. [環境変数・設定の調整](#環境変数設定の調整)
2. [データベース移行スクリプトの準備](#データベース移行スクリプトの準備)
3. [ファイルシステム構造の調整](#ファイルシステム構造の調整)
4. [キャッシュ設定の最適化](#キャッシュ設定の最適化)
5. [モニタリング設定の調整](#モニタリング設定の調整)
6. [セキュリティ設定](#セキュリティ設定)
7. [パフォーマンス最適化](#パフォーマンス最適化)

---

## 環境変数・設定の調整

### 本番環境用環境変数

**`.env.production`**:

```bash
# 基本設定
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# データベース設定
DATABASE_URL=postgresql://portfolio_user:${DB_PASSWORD}@${DB_HOST}:5432/portfolio_production
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
DATABASE_TIMEOUT=30000

# Redis設定（キャッシュ用）
REDIS_URL=redis://${REDIS_HOST}:6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# ファイルストレージ設定
UPLOAD_DIR=/var/www/portfolio/uploads
MARKDOWN_DIR=/var/www/portfolio/data/markdown
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,text/markdown

# セキュリティ設定
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
BCRYPT_ROUNDS=12

# 外部サービス設定
CDN_URL=https://cdn.example.com
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}

# 監視・ログ設定
LOG_LEVEL=info
LOG_FILE=/var/log/portfolio/app.log
ERROR_REPORTING_URL=${ERROR_REPORTING_URL}

# パフォーマンス設定
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
CACHE_TTL=3600
STATIC_CACHE_TTL=86400

# セキュリティヘッダー
ENABLE_HELMET=true
ENABLE_CORS=false
CORS_ORIGIN=https://portfolio.example.com

# 機能フラグ
ENABLE_ANALYTICS=true
ENABLE_ERROR_TRACKING=true
ENABLE_PERFORMANCE_MONITORING=true
```

### Next.js 設定の調整

**`next.config.js`**:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 本番環境最適化
  reactStrictMode: true,
  swcMinify: true,

  // 画像最適化
  images: {
    domains: ["cdn.example.com", "localhost"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400, // 24時間
    dangerouslyAllowSVG: false,
  },

  // 圧縮設定
  compress: true,

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // リダイレクト設定
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ];
  },

  // 実験的機能
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
    optimizeCss: true,
  },

  // Webpack設定
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドでのNode.jsモジュール除外
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    // バンドルサイズ最適化
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    };

    return config;
  },

  // 出力設定
  output: "standalone",

  // 環境変数の公開
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // TypeScript設定
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint設定
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
```

### データベース設定

**`database/production-config.js`**:

```javascript
const { Pool } = require("pg");

const productionConfig = {
  // 接続設定
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },

  // プール設定
  min: parseInt(process.env.DATABASE_POOL_MIN) || 2,
  max: parseInt(process.env.DATABASE_POOL_MAX) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: parseInt(process.env.DATABASE_TIMEOUT) || 30000,

  // パフォーマンス設定
  statement_timeout: 30000,
  query_timeout: 30000,

  // ログ設定
  log: (msg) => {
    if (process.env.LOG_LEVEL === "debug") {
      console.log("DB:", msg);
    }
  },
};

// 接続プールの作成
const pool = new Pool(productionConfig);

// 接続エラーハンドリング
pool.on("error", (err) => {
  console.error("Database pool error:", err);
  process.exit(-1);
});

// ヘルスチェック
pool.on("connect", () => {
  console.log("Database connected successfully");
});

module.exports = pool;
```

---

## データベース移行スクリプトの準備

### 移行スクリプト管理

**`database/migrations/001_enhanced_content_structure.sql`**:

```sql
-- 拡張コンテンツ構造への移行
-- 実行前にバックアップを作成すること

BEGIN;

-- 1. 新しいカテゴリー型の追加
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enhanced_category_type') THEN
        CREATE TYPE enhanced_category_type AS ENUM (
            'develop', 'video', 'design', 'video&design', 'other'
        );
    END IF;
END $$;

-- 2. 既存テーブルのバックアップ
CREATE TABLE IF NOT EXISTS portfolio_items_backup AS
SELECT * FROM portfolio_items;

-- 3. 新しいカラムの追加
ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS categories enhanced_category_type[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_other_category BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manual_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS use_manual_date BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS processed_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS markdown_path TEXT,
ADD COLUMN IF NOT EXISTS markdown_content TEXT,
ADD COLUMN IF NOT EXISTS effective_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS migration_version INTEGER DEFAULT 1;

-- 4. 既存データの移行
UPDATE portfolio_items
SET
    categories = ARRAY[category::enhanced_category_type],
    is_other_category = (category = 'other'),
    manual_date = created_at,
    use_manual_date = FALSE,
    processed_images = COALESCE(images, '{}'),
    original_images = '{}',
    effective_date = created_at,
    migration_version = 2
WHERE categories = '{}' OR categories IS NULL;

-- 5. マークダウンファイルの作成（外部スクリプトで実行）
-- この部分は別途Node.jsスクリプトで実行

-- 6. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_portfolio_items_categories
ON portfolio_items USING GIN(categories);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_effective_date
ON portfolio_items(effective_date DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_is_other
ON portfolio_items(is_other_category);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_status_categories
ON portfolio_items(status, categories);

-- 7. タグ管理テーブルの作成
CREATE TABLE IF NOT EXISTS tag_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 既存タグの移行
INSERT INTO tag_info (name, count, created_at, last_used)
SELECT
    DISTINCT unnest(tags) as tag_name,
    COUNT(*) as usage_count,
    MIN(created_at) as first_used,
    MAX(updated_at) as last_used
FROM portfolio_items
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
GROUP BY unnest(tags)
ON CONFLICT (name) DO UPDATE SET
    count = EXCLUDED.count,
    last_used = EXCLUDED.last_used;

-- 9. 制約の追加
ALTER TABLE portfolio_items
ADD CONSTRAINT chk_categories_not_empty
CHECK (array_length(categories, 1) > 0);

ALTER TABLE portfolio_items
ADD CONSTRAINT chk_manual_date_logic
CHECK (
    (use_manual_date = TRUE AND manual_date IS NOT NULL) OR
    (use_manual_date = FALSE)
);

-- 10. トリガーの作成（effective_date自動更新）
CREATE OR REPLACE FUNCTION update_effective_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.effective_date = CASE
        WHEN NEW.use_manual_date = TRUE AND NEW.manual_date IS NOT NULL
        THEN NEW.manual_date
        ELSE NEW.updated_at
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_effective_date ON portfolio_items;
CREATE TRIGGER trigger_update_effective_date
    BEFORE INSERT OR UPDATE ON portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION update_effective_date();

-- 11. 統計情報の更新
ANALYZE portfolio_items;
ANALYZE tag_info;

COMMIT;
```

### 移行実行スクリプト

**`database/migrate-production.js`**:

```javascript
#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { Pool } = require("pg");

class ProductionMigrator {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    this.migrationDir = path.join(__dirname, "migrations");
    this.backupDir = path.join(__dirname, "backups");
  }

  async migrate() {
    console.log("🚀 Starting production database migration...");

    try {
      // 1. 前提条件チェック
      await this.checkPrerequisites();

      // 2. バックアップ作成
      await this.createBackup();

      // 3. 移行実行
      await this.executeMigrations();

      // 4. マークダウンファイル移行
      await this.migrateMarkdownFiles();

      // 5. データ整合性チェック
      await this.verifyMigration();

      console.log("✅ Migration completed successfully");
    } catch (error) {
      console.error("❌ Migration failed:", error);
      await this.rollback();
      process.exit(1);
    } finally {
      await this.pool.end();
    }
  }

  async checkPrerequisites() {
    console.log("🔍 Checking prerequisites...");

    // データベース接続確認
    const client = await this.pool.connect();
    try {
      await client.query("SELECT 1");
      console.log("✅ Database connection OK");
    } finally {
      client.release();
    }

    // 必要なディレクトリの作成
    await fs.mkdir(this.backupDir, { recursive: true });
    await fs.mkdir(process.env.MARKDOWN_DIR, { recursive: true });

    // 権限確認
    await fs.access(process.env.UPLOAD_DIR, fs.constants.W_OK);
    await fs.access(process.env.MARKDOWN_DIR, fs.constants.W_OK);

    console.log("✅ Prerequisites check passed");
  }

  async createBackup() {
    console.log("💾 Creating database backup...");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);

    const { spawn } = require("child_process");

    return new Promise((resolve, reject) => {
      const pg_dump = spawn("pg_dump", [process.env.DATABASE_URL], {
        stdio: ["ignore", "pipe", "pipe"],
      });

      const writeStream = require("fs").createWriteStream(backupFile);
      pg_dump.stdout.pipe(writeStream);

      pg_dump.on("close", (code) => {
        if (code === 0) {
          console.log(`✅ Backup created: ${backupFile}`);
          resolve(backupFile);
        } else {
          reject(new Error(`pg_dump failed with code ${code}`));
        }
      });

      pg_dump.on("error", reject);
    });
  }

  async executeMigrations() {
    console.log("🔄 Executing migrations...");

    const migrationFiles = await fs.readdir(this.migrationDir);
    const sqlFiles = migrationFiles
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of sqlFiles) {
      console.log(`  📄 Executing ${file}...`);

      const filePath = path.join(this.migrationDir, file);
      const sql = await fs.readFile(filePath, "utf8");

      const client = await this.pool.connect();
      try {
        await client.query(sql);
        console.log(`  ✅ ${file} completed`);
      } catch (error) {
        console.error(`  ❌ ${file} failed:`, error);
        throw error;
      } finally {
        client.release();
      }
    }
  }

  async migrateMarkdownFiles() {
    console.log("📝 Migrating markdown content to files...");

    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT id, content 
        FROM portfolio_items 
        WHERE content IS NOT NULL 
        AND content != '' 
        AND markdown_path IS NULL
      `);

      for (const row of result.rows) {
        const fileName = `${row.id}.md`;
        const filePath = path.join(process.env.MARKDOWN_DIR, fileName);

        // マークダウンファイルの作成
        await fs.writeFile(filePath, row.content, "utf8");

        // データベースの更新
        await client.query(
          `
          UPDATE portfolio_items 
          SET markdown_path = $1, markdown_content = $2
          WHERE id = $3
        `,
          [filePath, row.content, row.id],
        );

        console.log(`  ✅ Created ${fileName}`);
      }

      console.log(`✅ Migrated ${result.rows.length} markdown files`);
    } finally {
      client.release();
    }
  }

  async verifyMigration() {
    console.log("🔍 Verifying migration...");

    const client = await this.pool.connect();
    try {
      // データ整合性チェック
      const checks = [
        {
          name: "Categories migration",
          query: `SELECT COUNT(*) as count FROM portfolio_items WHERE categories = '{}'`,
          expected: 0,
        },
        {
          name: "Effective date calculation",
          query: `SELECT COUNT(*) as count FROM portfolio_items WHERE effective_date IS NULL`,
          expected: 0,
        },
        {
          name: "Tag info population",
          query: `SELECT COUNT(*) as count FROM tag_info`,
          expected: "> 0",
        },
      ];

      for (const check of checks) {
        const result = await client.query(check.query);
        const count = parseInt(result.rows[0].count);

        if (check.expected === "> 0" ? count > 0 : count === check.expected) {
          console.log(`  ✅ ${check.name}: OK`);
        } else {
          throw new Error(
            `${check.name} failed: expected ${check.expected}, got ${count}`,
          );
        }
      }

      console.log("✅ Migration verification passed");
    } finally {
      client.release();
    }
  }

  async rollback() {
    console.log("🔄 Rolling back migration...");

    // 最新のバックアップファイルを探す
    const backupFiles = await fs.readdir(this.backupDir);
    const latestBackup = backupFiles
      .filter((file) => file.startsWith("backup-") && file.endsWith(".sql"))
      .sort()
      .pop();

    if (!latestBackup) {
      console.error("❌ No backup file found for rollback");
      return;
    }

    const backupPath = path.join(this.backupDir, latestBackup);
    console.log(`📄 Restoring from ${latestBackup}...`);

    // データベース復元（実装は環境に応じて調整）
    console.log("⚠️ Manual database restore required from:", backupPath);
  }
}

// スクリプト実行
if (require.main === module) {
  const migrator = new ProductionMigrator();
  migrator.migrate();
}

module.exports = ProductionMigrator;
```

---

## ファイルシステム構造の調整

### 本番環境ディレクトリ構造

```
/var/www/portfolio/
├── app/                          # Next.js アプリケーション
├── public/
│   ├── data/
│   │   └── markdown/            # マークダウンファイル
│   ├── uploads/                 # アップロードファイル
│   │   ├── images/
│   │   │   ├── original/        # 変換なし画像
│   │   │   ├── processed/       # 処理済み画像
│   │   │   └── thumbnails/      # サムネイル
│   │   └── temp/               # 一時ファイル
│   └── static/                 # 静的ファイル
├── logs/                       # ログファイル
│   ├── app.log
│   ├── error.log
│   └── access.log
├── backups/                    # バックアップ
│   ├── database/
│   └── files/
└── config/                     # 設定ファイル
    ├── nginx/
    └── ssl/
```

### ファイルシステム設定スクリプト

**`deployment/setup-filesystem.sh`**:

```bash
#!/bin/bash

# 本番環境ファイルシステム設定スクリプト

set -e

# 設定
APP_DIR="/var/www/portfolio"
APP_USER="portfolio"
WEB_USER="www-data"

echo "🚀 Setting up production filesystem..."

# 1. ディレクトリ作成
echo "📁 Creating directories..."
sudo mkdir -p $APP_DIR/{public/{data/markdown,uploads/{images/{original,processed,thumbnails},temp},static},logs,backups/{database,files},config/{nginx,ssl}}

# 2. 権限設定
echo "🔐 Setting permissions..."

# アプリケーションディレクトリ
sudo chown -R $APP_USER:$APP_USER $APP_DIR
sudo chmod -R 755 $APP_DIR

# アップロードディレクトリ（書き込み権限）
sudo chown -R $WEB_USER:$WEB_USER $APP_DIR/public/uploads
sudo chmod -R 775 $APP_DIR/public/uploads

# マークダウンディレクトリ（書き込み権限）
sudo chown -R $WEB_USER:$WEB_USER $APP_DIR/public/data
sudo chmod -R 775 $APP_DIR/public/data

# ログディレクトリ（書き込み権限）
sudo chown -R $WEB_USER:$WEB_USER $APP_DIR/logs
sudo chmod -R 775 $APP_DIR/logs

# バックアップディレクトリ
sudo chown -R $APP_USER:$APP_USER $APP_DIR/backups
sudo chmod -R 750 $APP_DIR/backups

# 設定ディレクトリ（読み取り専用）
sudo chown -R root:$APP_USER $APP_DIR/config
sudo chmod -R 640 $APP_DIR/config

# 3. セキュリティ設定
echo "🔒 Applying security settings..."

# 実行権限の除去（必要なファイル以外）
find $APP_DIR/public/uploads -type f -exec chmod 644 {} \;
find $APP_DIR/public/data -type f -exec chmod 644 {} \;

# 隠しファイルの保護
find $APP_DIR -name ".*" -type f -exec chmod 600 {} \;

# 4. ログローテーション設定
echo "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/portfolio > /dev/null <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $WEB_USER $WEB_USER
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
        systemctl reload portfolio-app > /dev/null 2>&1 || true
    endscript
}
EOF

# 5. 一時ファイルクリーンアップのcron設定
echo "🧹 Setting up cleanup cron..."
sudo tee /etc/cron.d/portfolio-cleanup > /dev/null <<EOF
# Portfolio temporary files cleanup
0 2 * * * $WEB_USER find $APP_DIR/public/uploads/temp -type f -mtime +1 -delete
30 2 * * * $WEB_USER find $APP_DIR/logs -name "*.log.*" -mtime +30 -delete
EOF

# 6. ディスク使用量監視
echo "📊 Setting up disk monitoring..."
sudo tee /etc/cron.d/portfolio-disk-monitor > /dev/null <<EOF
# Portfolio disk usage monitoring
0 */6 * * * root df -h $APP_DIR | awk 'NR==2 {if(substr(\$5,1,length(\$5)-1) > 80) print "WARNING: Portfolio disk usage is " \$5}' | mail -s "Disk Usage Alert" admin@example.com
EOF

# 7. ファイルシステムの整合性チェック
echo "🔍 Setting up integrity checks..."
sudo tee /usr/local/bin/portfolio-integrity-check > /dev/null <<'EOF'
#!/bin/bash

# Portfolio filesystem integrity check
APP_DIR="/var/www/portfolio"
LOG_FILE="$APP_DIR/logs/integrity-check.log"

echo "$(date): Starting integrity check" >> $LOG_FILE

# Check critical directories
CRITICAL_DIRS=("$APP_DIR/public/uploads" "$APP_DIR/public/data" "$APP_DIR/logs")

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "$(date): ERROR - Missing directory: $dir" >> $LOG_FILE
        echo "CRITICAL: Missing directory $dir" | mail -s "Portfolio Integrity Alert" admin@example.com
    fi
done

# Check permissions
if [ ! -w "$APP_DIR/public/uploads" ]; then
    echo "$(date): ERROR - Upload directory not writable" >> $LOG_FILE
    echo "CRITICAL: Upload directory permission issue" | mail -s "Portfolio Permission Alert" admin@example.com
fi

# Check disk space
DISK_USAGE=$(df $APP_DIR | awk 'NR==2 {print substr($5,1,length($5)-1)}')
if [ $DISK_USAGE -gt 90 ]; then
    echo "$(date): WARNING - Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
    echo "WARNING: Disk usage is ${DISK_USAGE}%" | mail -s "Portfolio Disk Alert" admin@example.com
fi

echo "$(date): Integrity check completed" >> $LOG_FILE
EOF

sudo chmod +x /usr/local/bin/portfolio-integrity-check

# 整合性チェックのcron設定
sudo tee -a /etc/cron.d/portfolio-cleanup > /dev/null <<EOF
# Portfolio integrity check
0 4 * * * root /usr/local/bin/portfolio-integrity-check
EOF

echo "✅ Filesystem setup completed"
echo "📋 Summary:"
echo "  - Application directory: $APP_DIR"
echo "  - Upload directory: $APP_DIR/public/uploads"
echo "  - Markdown directory: $APP_DIR/public/data/markdown"
echo "  - Log directory: $APP_DIR/logs"
echo "  - Backup directory: $APP_DIR/backups"
echo "  - Log rotation: Configured"
echo "  - Cleanup cron: Configured"
echo "  - Integrity check: Configured"
```

---

## キャッシュ設定の最適化

### Redis キャッシュ設定

**`config/redis-production.conf`**:

```conf
# Redis 本番環境設定

# 基本設定
port 6379
bind 127.0.0.1
protected-mode yes
requirepass ${REDIS_PASSWORD}

# メモリ設定
maxmemory 1gb
maxmemory-policy allkeys-lru

# 永続化設定
save 900 1
save 300 10
save 60 10000

# ログ設定
loglevel notice
logfile /var/log/redis/redis-server.log

# セキュリティ設定
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG "CONFIG_b835c3f8a5d2e7f1"

# パフォーマンス設定
tcp-keepalive 300
timeout 0
tcp-backlog 511

# クライアント設定
maxclients 10000

# スローログ設定
slowlog-log-slower-than 10000
slowlog-max-len 128
```

### アプリケーションキャッシュ設定

**`lib/cache/production-cache.js`**:

```javascript
const Redis = require("redis");

class ProductionCache {
  constructor() {
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
      retry_strategy: (options) => {
        if (options.error && options.error.code === "ECONNREFUSED") {
          return new Error("Redis server connection refused");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error("Redis retry time exhausted");
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      },
    });

    this.redis.on("error", (err) => {
      console.error("Redis error:", err);
    });

    this.redis.on("connect", () => {
      console.log("Redis connected");
    });
  }

  // キャッシュ戦略設定
  getCacheConfig() {
    return {
      // ページキャッシュ
      pages: {
        gallery: { ttl: 300 }, // 5分
        portfolioItem: { ttl: 600 }, // 10分
        admin: { ttl: 0 }, // キャッシュしない
      },

      // APIキャッシュ
      api: {
        content: { ttl: 300 }, // 5分
        tags: { ttl: 1800 }, // 30分
        search: { ttl: 600 }, // 10分
      },

      // 静的リソースキャッシュ
      static: {
        images: { ttl: 86400 }, // 24時間
        css: { ttl: 86400 }, // 24時間
        js: { ttl: 86400 }, // 24時間
      },
    };
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  async flush() {
    try {
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error);
      return false;
    }
  }

  // キャッシュ無効化戦略
  async invalidatePattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Cache invalidation error:", error);
      return false;
    }
  }

  // ヘルスチェック
  async healthCheck() {
    try {
      await this.redis.ping();
      return { status: "healthy", timestamp: new Date() };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}

module.exports = new ProductionCache();
```

### Nginx キャッシュ設定

**`config/nginx/portfolio.conf`**:

```nginx
# Portfolio Nginx 設定

# キャッシュパス設定
proxy_cache_path /var/cache/nginx/portfolio levels=1:2 keys_zone=portfolio:10m max_size=1g inactive=60m use_temp_path=off;

# アップストリーム設定
upstream portfolio_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name portfolio.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portfolio.example.com;

    # SSL設定
    ssl_certificate /etc/ssl/certs/portfolio.crt;
    ssl_certificate_key /etc/ssl/private/portfolio.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # セキュリティヘッダー
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ログ設定
    access_log /var/log/nginx/portfolio_access.log;
    error_log /var/log/nginx/portfolio_error.log;

    # 静的ファイル配信
    location /static/ {
        alias /var/www/portfolio/public/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # 画像ファイル配信
    location /uploads/ {
        alias /var/www/portfolio/public/uploads/;
        expires 30d;
        add_header Cache-Control "public";

        # 画像最適化
        location ~* \.(jpg|jpeg|png|gif|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API エンドポイント（キャッシュなし）
    location /api/ {
        proxy_pass http://portfolio_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # タイムアウト設定
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # ページキャッシュ
    location / {
        proxy_pass http://portfolio_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # キャッシュ設定
        proxy_cache portfolio;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout invalid_header updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;

        # キャッシュキー
        proxy_cache_key "$scheme$request_method$host$request_uri";

        # キャッシュバイパス条件
        proxy_cache_bypass $cookie_nocache $arg_nocache $arg_comment;
        proxy_no_cache $cookie_nocache $arg_nocache $arg_comment;

        # 管理画面はキャッシュしない
        location /admin {
            proxy_pass http://portfolio_app;
            proxy_cache off;
        }
    }

    # 圧縮設定
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # レート制限
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;

    location /api/admin/upload {
        limit_req zone=upload burst=5 nodelay;
        proxy_pass http://portfolio_app;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://portfolio_app;
    }
}
```

このガイドにより、本番環境での安定した運用が可能になります。次のセクションでは、モニタリング設定について詳しく説明します。

---

## モニタリング設定の調整

### システム監視設定

**`config/monitoring/prometheus.yml`**:

```yaml
# Prometheus 設定
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "portfolio_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

scrape_configs:
  # Portfolio アプリケーション
  - job_name: "portfolio-app"
    static_configs:
      - targets: ["localhost:3000"]
    metrics_path: "/api/metrics"
    scrape_interval: 30s

  # Node Exporter（システムメトリクス）
  - job_name: "node-exporter"
    static_configs:
      - targets: ["localhost:9100"]

  # PostgreSQL
  - job_name: "postgres-exporter"
    static_configs:
      - targets: ["localhost:9187"]

  # Redis
  - job_name: "redis-exporter"
    static_configs:
      - targets: ["localhost:9121"]

  # Nginx
  - job_name: "nginx-exporter"
    static_configs:
      - targets: ["localhost:9113"]
```

**`config/monitoring/portfolio_rules.yml`**:

```yaml
# Portfolio アラートルール
groups:
  - name: portfolio.rules
    rules:
      # アプリケーション可用性
      - alert: PortfolioAppDown
        expr: up{job="portfolio-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Portfolio application is down"
          description: "Portfolio application has been down for more than 1 minute"

      # 高いエラー率
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      # 応答時間の悪化
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "95th percentile response time is {{ $value }}s"

      # データベース接続問題
      - alert: DatabaseConnectionIssue
        expr: up{job="postgres-exporter"} == 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "Database connection issue"
          description: "Cannot connect to PostgreSQL database"

      # Redis接続問題
      - alert: RedisConnectionIssue
        expr: up{job="redis-exporter"} == 0
        for: 30s
        labels:
          severity: warning
        annotations:
          summary: "Redis connection issue"
          description: "Cannot connect to Redis cache"

      # ディスク使用量
      - alert: HighDiskUsage
        expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage"
          description: "Disk usage is {{ $value | humanizePercentage }}"

      # メモリ使用量
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

### アプリケーションメトリクス

**`lib/monitoring/metrics.js`**:

```javascript
const client = require("prom-client");

// デフォルトメトリクスの収集
client.collectDefaultMetrics({ timeout: 5000 });

// カスタムメトリクス定義
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const portfolioItemsTotal = new client.Gauge({
  name: "portfolio_items_total",
  help: "Total number of portfolio items",
  labelNames: ["status", "category"],
});

const fileUploadsTotal = new client.Counter({
  name: "file_uploads_total",
  help: "Total number of file uploads",
  labelNames: ["type", "status"],
});

const cacheHitRate = new client.Gauge({
  name: "cache_hit_rate",
  help: "Cache hit rate",
  labelNames: ["cache_type"],
});

const databaseConnectionPool = new client.Gauge({
  name: "database_connection_pool_size",
  help: "Database connection pool size",
  labelNames: ["state"],
});

// メトリクス更新関数
class MetricsCollector {
  static recordHttpRequest(method, route, status, duration) {
    httpRequestsTotal.inc({ method, route, status });
    httpRequestDuration.observe({ method, route, status }, duration);
  }

  static updatePortfolioItemsCount(status, category, count) {
    portfolioItemsTotal.set({ status, category }, count);
  }

  static recordFileUpload(type, status) {
    fileUploadsTotal.inc({ type, status });
  }

  static updateCacheHitRate(cacheType, rate) {
    cacheHitRate.set({ cache_type: cacheType }, rate);
  }

  static updateDatabasePool(active, idle, waiting) {
    databaseConnectionPool.set({ state: "active" }, active);
    databaseConnectionPool.set({ state: "idle" }, idle);
    databaseConnectionPool.set({ state: "waiting" }, waiting);
  }

  static async collectCustomMetrics() {
    try {
      // データベースからメトリクスを収集
      const db = require("../database/connection");

      // ポートフォリオアイテム数
      const itemCounts = await db.query(`
        SELECT status, unnest(categories) as category, COUNT(*) as count
        FROM portfolio_items 
        GROUP BY status, category
      `);

      itemCounts.rows.forEach((row) => {
        this.updatePortfolioItemsCount(
          row.status,
          row.category,
          parseInt(row.count),
        );
      });

      // データベース接続プール状態
      const poolStats = db.pool.totalCount;
      const activeConnections = db.pool.activeCount;
      const idleConnections = db.pool.idleCount;
      const waitingCount = db.pool.waitingCount;

      this.updateDatabasePool(activeConnections, idleConnections, waitingCount);
    } catch (error) {
      console.error("Failed to collect custom metrics:", error);
    }
  }

  static getRegistry() {
    return client.register;
  }
}

// 定期的なメトリクス収集
setInterval(() => {
  MetricsCollector.collectCustomMetrics();
}, 30000); // 30秒間隔

module.exports = MetricsCollector;
```

### ログ集約設定

**`config/logging/logstash-production.conf`**:

```ruby
# Logstash 本番環境設定

input {
  # アプリケーションログ
  file {
    path => "/var/www/portfolio/logs/app.log"
    start_position => "beginning"
    codec => json
    type => "application"
    tags => ["portfolio", "application"]
  }

  # Nginxアクセスログ
  file {
    path => "/var/log/nginx/portfolio_access.log"
    start_position => "beginning"
    type => "nginx_access"
    tags => ["portfolio", "nginx", "access"]
  }

  # Nginxエラーログ
  file {
    path => "/var/log/nginx/portfolio_error.log"
    start_position => "beginning"
    type => "nginx_error"
    tags => ["portfolio", "nginx", "error"]
  }

  # システムログ
  syslog {
    port => 5514
    type => "syslog"
    tags => ["portfolio", "system"]
  }
}

filter {
  # アプリケーションログの処理
  if [type] == "application" {
    # タイムスタンプの解析
    date {
      match => [ "timestamp", "ISO8601" ]
    }

    # エラーレベルの分類
    if [level] == "ERROR" {
      mutate {
        add_tag => ["error"]
      }
    }

    # パフォーマンス関連ログの識別
    if [message] =~ /response_time|duration/ {
      mutate {
        add_tag => ["performance"]
      }
    }

    # セキュリティ関連ログの識別
    if [message] =~ /authentication|authorization|security/ {
      mutate {
        add_tag => ["security"]
      }
    }
  }

  # Nginxアクセスログの処理
  if [type] == "nginx_access" {
    grok {
      match => {
        "message" => "%{NGINXACCESS}"
      }
    }

    # レスポンス時間の数値化
    mutate {
      convert => { "response_time" => "float" }
      convert => { "status" => "integer" }
    }

    # エラーステータスの識別
    if [status] >= 400 {
      mutate {
        add_tag => ["error"]
      }
    }

    # スローリクエストの識別
    if [response_time] > 2.0 {
      mutate {
        add_tag => ["slow_request"]
      }
    }
  }

  # 地理的位置情報の追加
  if [clientip] {
    geoip {
      source => "clientip"
      target => "geoip"
    }
  }

  # ユーザーエージェントの解析
  if [agent] {
    useragent {
      source => "agent"
      target => "useragent"
    }
  }
}

output {
  # Elasticsearch への出力
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "portfolio-logs-%{+YYYY.MM.dd}"
    template_name => "portfolio"
    template_pattern => "portfolio-*"
    template => "/etc/logstash/templates/portfolio-template.json"
  }

  # エラーログの即座通知
  if "error" in [tags] {
    email {
      to => "admin@example.com"
      subject => "Portfolio Error Alert"
      body => "Error detected in portfolio system: %{message}"
      from => "alerts@example.com"
    }
  }

  # 重要なセキュリティイベントの通知
  if "security" in [tags] and [level] == "ERROR" {
    http {
      url => "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
      http_method => "post"
      content_type => "application/json"
      format => "json"
      mapping => {
        "text" => "Security alert: %{message}"
        "channel" => "#security-alerts"
      }
    }
  }

  # デバッグ用（開発時のみ）
  if [type] == "application" and [level] == "DEBUG" {
    stdout {
      codec => rubydebug
    }
  }
}
```

### ダッシュボード設定

**`config/monitoring/grafana-dashboard.json`**:

```json
{
  "dashboard": {
    "id": null,
    "title": "Portfolio System Dashboard",
    "tags": ["portfolio", "production"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Application Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"portfolio-app\"}",
            "legendFormat": "App Status"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                { "color": "red", "value": 0 },
                { "color": "green", "value": 1 }
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "id": 3,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "id": 4,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          },
          {
            "expr": "rate(http_requests_total{status=~\"4..\"}[5m])",
            "legendFormat": "4xx errors"
          }
        ]
      },
      {
        "id": 5,
        "title": "System Resources",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage %"
          },
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory Usage %"
          }
        ]
      },
      {
        "id": 6,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "database_connection_pool_size{state=\"active\"}",
            "legendFormat": "Active"
          },
          {
            "expr": "database_connection_pool_size{state=\"idle\"}",
            "legendFormat": "Idle"
          }
        ]
      },
      {
        "id": 7,
        "title": "Cache Hit Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "cache_hit_rate",
            "legendFormat": "{{cache_type}}"
          }
        ]
      },
      {
        "id": 8,
        "title": "File Uploads",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(file_uploads_total[5m])",
            "legendFormat": "{{type}} - {{status}}"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

---

## セキュリティ設定

### SSL/TLS 設定

**`deployment/setup-ssl.sh`**:

```bash
#!/bin/bash

# SSL証明書設定スクリプト

set -e

DOMAIN="portfolio.example.com"
SSL_DIR="/etc/ssl/portfolio"
CERT_EMAIL="admin@example.com"

echo "🔒 Setting up SSL certificates..."

# 1. Let's Encrypt証明書の取得
if command -v certbot >/dev/null 2>&1; then
    echo "📜 Obtaining Let's Encrypt certificate..."

    # Certbot でSSL証明書取得
    sudo certbot certonly \
        --nginx \
        --email $CERT_EMAIL \
        --agree-tos \
        --no-eff-email \
        --domains $DOMAIN

    # 証明書の自動更新設定
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

else
    echo "⚠️ Certbot not found. Setting up self-signed certificate for testing..."

    # 自己署名証明書の作成（テスト用）
    sudo mkdir -p $SSL_DIR

    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout $SSL_DIR/portfolio.key \
        -out $SSL_DIR/portfolio.crt \
        -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Portfolio/CN=$DOMAIN"

    sudo chmod 600 $SSL_DIR/portfolio.key
    sudo chmod 644 $SSL_DIR/portfolio.crt
fi

# 2. SSL設定の強化
echo "🔧 Configuring SSL security..."

# DH パラメータの生成
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# SSL設定ファイルの作成
sudo tee /etc/nginx/snippets/ssl-portfolio.conf > /dev/null <<EOF
# SSL Configuration for Portfolio
ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

# SSL Security
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

# SSL Session
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_stapling on;
ssl_stapling_verify on;

# DH Parameters
ssl_dhparam /etc/ssl/certs/dhparam.pem;

# HSTS
add_header Strict-Transport-Security "max-age=63072000" always;
EOF

echo "✅ SSL setup completed"
```

### セキュリティヘッダー設定

**`middleware/security-headers.js`**:

```javascript
const helmet = require("helmet");

const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Next.js requires this
        "'unsafe-eval'", // Development only
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.example.com"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },

  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false,

  // Cross Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },

  // Cross Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Expect Certificate Transparency
  expectCt: {
    maxAge: 86400,
    enforce: true,
  },

  // Feature Policy / Permissions Policy
  permittedCrossDomainPolicies: false,

  // Hide Powered By
  hidePoweredBy: true,

  // HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // X-Frame-Options
  frameguard: { action: "deny" },

  // XSS Filter
  xssFilter: true,
});

// カスタムセキュリティミドルウェア
const customSecurity = (req, res, next) => {
  // API キーの検証
  if (req.path.startsWith("/api/admin/")) {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  // レート制限情報の追加
  res.setHeader("X-RateLimit-Limit", "100");
  res.setHeader("X-RateLimit-Remaining", "99");
  res.setHeader("X-RateLimit-Reset", Date.now() + 3600000);

  // セキュリティ情報の隠蔽
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");

  next();
};

module.exports = { securityHeaders, customSecurity };
```

### ファイアウォール設定

**`deployment/setup-firewall.sh`**:

```bash
#!/bin/bash

# ファイアウォール設定スクリプト

set -e

echo "🔥 Setting up firewall..."

# UFW の有効化
sudo ufw --force enable

# デフォルトポリシー
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH アクセス（管理用）
sudo ufw allow ssh
sudo ufw allow 22/tcp

# HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# アプリケーションポート（内部のみ）
sudo ufw allow from 127.0.0.1 to any port 3000

# データベース（内部のみ）
sudo ufw allow from 127.0.0.1 to any port 5432

# Redis（内部のみ）
sudo ufw allow from 127.0.0.1 to any port 6379

# 監視システム（内部のみ）
sudo ufw allow from 127.0.0.1 to any port 9090  # Prometheus
sudo ufw allow from 127.0.0.1 to any port 3001  # Grafana

# 特定IPからの管理アクセス（必要に応じて設定）
# sudo ufw allow from YOUR_ADMIN_IP to any port 22

# ログ設定
sudo ufw logging on

# 設定確認
sudo ufw status verbose

echo "✅ Firewall setup completed"
```

---

## パフォーマンス最適化

### Node.js アプリケーション最適化

**`config/performance/pm2.config.js`**:

```javascript
module.exports = {
  apps: [
    {
      name: "portfolio-app",
      script: "server.js",
      instances: "max", // CPU コア数に応じて自動調整
      exec_mode: "cluster",

      // 環境設定
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // メモリ管理
      max_memory_restart: "1G",

      // ログ設定
      log_file: "/var/www/portfolio/logs/pm2.log",
      out_file: "/var/www/portfolio/logs/pm2-out.log",
      error_file: "/var/www/portfolio/logs/pm2-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // 自動再起動設定
      watch: false,
      ignore_watch: ["node_modules", "logs", "public/uploads"],

      // クラスター設定
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // ヘルスチェック
      health_check_grace_period: 3000,

      // 環境変数
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        NODE_OPTIONS: "--max-old-space-size=1024",
      },
    },
  ],

  // デプロイ設定
  deploy: {
    production: {
      user: "portfolio",
      host: "your-server.com",
      ref: "origin/main",
      repo: "git@github.com:your-repo/portfolio.git",
      path: "/var/www/portfolio",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
    },
  },
};
```

### データベース最適化

**`database/performance-tuning.sql`**:

```sql
-- PostgreSQL パフォーマンス最適化

-- 1. インデックスの最適化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_items_status_created
ON portfolio_items(status, created_at DESC)
WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_items_categories_gin
ON portfolio_items USING GIN(categories);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_items_tags_gin
ON portfolio_items USING GIN(tags);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_items_effective_date_desc
ON portfolio_items(effective_date DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tag_info_name_lower
ON tag_info(LOWER(name));

-- 2. 部分インデックス（条件付きインデックス）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_items_published
ON portfolio_items(created_at DESC)
WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_items_draft
ON portfolio_items(updated_at DESC)
WHERE status = 'draft';

-- 3. 複合インデックス
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_items_status_categories_date
ON portfolio_items(status, categories, effective_date DESC);

-- 4. 統計情報の更新
ANALYZE portfolio_items;
ANALYZE tag_info;

-- 5. バキューム設定
-- 自動バキューム設定の調整
ALTER TABLE portfolio_items SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- 6. パフォーマンス設定の確認用ビュー
CREATE OR REPLACE VIEW performance_stats AS
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
AND tablename IN ('portfolio_items', 'tag_info');

-- 7. スロークエリの監視
-- postgresql.conf で設定:
-- log_min_duration_statement = 1000  # 1秒以上のクエリをログ
-- log_statement = 'all'              # 全てのステートメントをログ
```

### キャッシュ戦略の実装

**`lib/cache/cache-strategy.js`**:

```javascript
const Redis = require("redis");
const LRU = require("lru-cache");

class CacheStrategy {
  constructor() {
    // Redis（分散キャッシュ）
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL,
      retry_strategy: (times) => Math.min(times * 50, 2000),
    });

    // LRU（メモリキャッシュ）
    this.memoryCache = new LRU({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5分
    });

    // キャッシュ階層の定義
    this.cacheHierarchy = {
      // L1: メモリキャッシュ（最速）
      memory: {
        ttl: 300, // 5分
        maxSize: 1000,
      },
      // L2: Redis（高速）
      redis: {
        ttl: 1800, // 30分
        maxSize: 10000,
      },
      // L3: データベース（最終的なデータソース）
      database: {
        ttl: 0, // キャッシュしない
      },
    };
  }

  async get(key, options = {}) {
    const { useMemory = true, useRedis = true } = options;

    try {
      // L1: メモリキャッシュから取得
      if (useMemory) {
        const memoryResult = this.memoryCache.get(key);
        if (memoryResult !== undefined) {
          this.recordCacheHit("memory");
          return memoryResult;
        }
      }

      // L2: Redisから取得
      if (useRedis) {
        const redisResult = await this.redis.get(key);
        if (redisResult) {
          const parsed = JSON.parse(redisResult);

          // メモリキャッシュにも保存
          if (useMemory) {
            this.memoryCache.set(key, parsed);
          }

          this.recordCacheHit("redis");
          return parsed;
        }
      }

      this.recordCacheMiss();
      return null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key, value, options = {}) {
    const { ttl = 3600, useMemory = true, useRedis = true } = options;

    try {
      // メモリキャッシュに保存
      if (useMemory) {
        this.memoryCache.set(key, value);
      }

      // Redisに保存
      if (useRedis) {
        const serialized = JSON.stringify(value);
        if (ttl > 0) {
          await this.redis.setex(key, ttl, serialized);
        } else {
          await this.redis.set(key, serialized);
        }
      }

      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async invalidate(pattern) {
    try {
      // メモリキャッシュの無効化
      if (pattern.includes("*")) {
        // パターンマッチング
        const keys = Array.from(this.memoryCache.keys());
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        keys.forEach((key) => {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
          }
        });
      } else {
        this.memoryCache.delete(pattern);
      }

      // Redisの無効化
      const redisKeys = await this.redis.keys(pattern);
      if (redisKeys.length > 0) {
        await this.redis.del(...redisKeys);
      }

      return true;
    } catch (error) {
      console.error("Cache invalidation error:", error);
      return false;
    }
  }

  // キャッシュ戦略の実装
  async getWithFallback(key, fetchFunction, options = {}) {
    // キャッシュから取得を試行
    let result = await this.get(key, options);

    if (result === null) {
      // キャッシュミスの場合、データを取得
      try {
        result = await fetchFunction();

        if (result !== null && result !== undefined) {
          // 取得したデータをキャッシュに保存
          await this.set(key, result, options);
        }
      } catch (error) {
        console.error("Fallback function error:", error);
        throw error;
      }
    }

    return result;
  }

  // キャッシュ統計の記録
  recordCacheHit(type) {
    // メトリクス記録（Prometheusなど）
    if (global.metrics) {
      global.metrics.cacheHits.inc({ type });
    }
  }

  recordCacheMiss() {
    if (global.metrics) {
      global.metrics.cacheMisses.inc();
    }
  }

  // ヘルスチェック
  async healthCheck() {
    try {
      // メモリキャッシュの状態
      const memoryStats = {
        size: this.memoryCache.size,
        max: this.memoryCache.max,
      };

      // Redisの状態
      await this.redis.ping();
      const redisInfo = await this.redis.info("memory");

      return {
        status: "healthy",
        memory: memoryStats,
        redis: { connected: true, info: redisInfo },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }
}

module.exports = new CacheStrategy();
```

### 本番環境デプロイスクリプト

**`deployment/deploy-production.sh`**:

```bash
#!/bin/bash

# 本番環境デプロイスクリプト

set -e

# 設定
APP_DIR="/var/www/portfolio"
BACKUP_DIR="/var/backups/portfolio"
SERVICE_NAME="portfolio-app"
NGINX_SERVICE="nginx"

echo "🚀 Starting production deployment..."

# 1. 前提条件チェック
echo "🔍 Checking prerequisites..."
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found"
    exit 1
fi

if [ ! -d "$APP_DIR" ]; then
    echo "❌ Application directory not found: $APP_DIR"
    exit 1
fi

# 2. バックアップ作成
echo "💾 Creating backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

mkdir -p $BACKUP_PATH
cp -r $APP_DIR $BACKUP_PATH/
echo "✅ Backup created: $BACKUP_PATH"

# 3. アプリケーション停止
echo "⏹️ Stopping application..."
sudo systemctl stop $SERVICE_NAME || true
sudo pm2 stop all || true

# 4. コードデプロイ
echo "📦 Deploying code..."
cd $APP_DIR

# Git pull（本番環境の場合）
if [ -d ".git" ]; then
    git fetch origin
    git reset --hard origin/main
fi

# 依存関係のインストール
npm ci --production

# ビルド実行
npm run build

# 5. データベース移行
echo "🗄️ Running database migrations..."
node database/migrate-production.js

# 6. ファイルシステム設定
echo "📁 Setting up filesystem..."
./deployment/setup-filesystem.sh

# 7. SSL設定
echo "🔒 Setting up SSL..."
./deployment/setup-ssl.sh

# 8. 設定ファイル更新
echo "⚙️ Updating configuration..."
cp .env.production .env
sudo cp config/nginx/portfolio.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/portfolio.conf /etc/nginx/sites-enabled/
sudo nginx -t

# 9. サービス開始
echo "▶️ Starting services..."
sudo systemctl start $SERVICE_NAME
sudo systemctl reload $NGINX_SERVICE

# PM2での起動（クラスター環境の場合）
pm2 start config/performance/pm2.config.js --env production

# 10. ヘルスチェック
echo "🏥 Performing health check..."
sleep 10

HEALTH_CHECK_URL="https://portfolio.example.com/api/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)

if [ $HTTP_STATUS -eq 200 ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed (HTTP $HTTP_STATUS)"
    echo "🔄 Rolling back..."

    # ロールバック処理
    sudo systemctl stop $SERVICE_NAME
    pm2 stop all

    # 最新のバックアップから復元
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -1)
    cp -r $BACKUP_DIR/$LATEST_BACKUP/* $APP_DIR/

    sudo systemctl start $SERVICE_NAME
    sudo systemctl reload $NGINX_SERVICE

    exit 1
fi

# 11. 監視システム設定
echo "📊 Setting up monitoring..."
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

# 12. 最終確認
echo "🔍 Final verification..."
curl -f $HEALTH_CHECK_URL > /dev/null
echo "✅ Deployment completed successfully"

# 13. 通知送信
echo "📧 Sending deployment notification..."
echo "Portfolio system deployed successfully at $(date)" | \
mail -s "Deployment Success" admin@example.com

echo "🎉 Production deployment completed!"
echo "📋 Summary:"
echo "  - Application URL: https://portfolio.example.com"
echo "  - Backup location: $BACKUP_PATH"
echo "  - Monitoring: https://portfolio.example.com:3001"
echo "  - Logs: $APP_DIR/logs/"
```

この包括的な本番環境対応ガイドにより、システムの安定した本番運用が可能になります。
