# リリース・展開準備ガイド

## 概要

このドキュメントでは、拡張されたポートフォリオコンテンツデータ管理システムの段階的リリース計画、ロールバック手順、ユーザー通知・トレーニング計画、サポート体制の整備、および成功指標の設定について説明します。

## 目次

1. [段階的リリース計画の策定](#段階的リリース計画の策定)
2. [ロールバック手順の準備](#ロールバック手順の準備)
3. [ユーザー通知・トレーニング計画](#ユーザー通知トレーニング計画)
4. [サポート体制の整備](#サポート体制の整備)
5. [成功指標の設定・測定準備](#成功指標の設定測定準備)
6. [リリース実行チェックリスト](#リリース実行チェックリスト)

---

## 段階的リリース計画の策定

### リリース戦略概要

**段階的リリースアプローチ**:

- **Phase 1**: 内部テスト環境での検証
- **Phase 2**: ステージング環境での統合テスト
- **Phase 3**: 限定ユーザーでのベータテスト
- **Phase 4**: 段階的本番リリース
- **Phase 5**: 全面展開

### Phase 1: 内部テスト環境での検証

**期間**: 1週間
**参加者**: 開発チーム、QAチーム
**目的**: 基本機能の動作確認とバグ修正

**実施内容**:

```markdown
## Phase 1 チェックリスト

### 環境準備

- [ ] テスト環境の構築完了
- [ ] テストデータの準備完了
- [ ] 監視システムの設定完了

### 機能テスト

- [ ] データマネージャーの基本機能テスト
- [ ] 複数カテゴリー選択機能テスト
- [ ] タグ管理システムテスト
- [ ] 日付管理システムテスト
- [ ] ファイルアップロード機能テスト
- [ ] マークダウンエディターテスト
- [ ] ギャラリー表示テスト
- [ ] video&designページ表示テスト

### パフォーマンステスト

- [ ] ページロード時間測定
- [ ] API応答時間測定
- [ ] データベースクエリ性能測定
- [ ] ファイルアップロード性能測定

### セキュリティテスト

- [ ] XSS攻撃防御テスト
- [ ] SQLインジェクション防御テスト
- [ ] ファイルアップロードセキュリティテスト
- [ ] 認証・認可機能テスト

### 完了条件

- [ ] 全ての機能テストが成功
- [ ] パフォーマンス基準を満たす
- [ ] セキュリティテストが成功
- [ ] 重大なバグが0件
```

### Phase 2: ステージング環境での統合テスト

**期間**: 1週間
**参加者**: 開発チーム、QAチーム、システム管理者
**目的**: 本番環境に近い条件での動作確認

**実施内容**:

```markdown
## Phase 2 チェックリスト

### 環境設定

- [ ] ステージング環境が本番環境と同等の設定
- [ ] SSL証明書の設定完了
- [ ] 監視システムの動作確認
- [ ] バックアップシステムの動作確認

### 統合テスト

- [ ] 全機能の統合テスト実行
- [ ] データ移行テストの実行
- [ ] 負荷テストの実行
- [ ] 障害復旧テストの実行

### 運用テスト

- [ ] デプロイ手順の確認
- [ ] ロールバック手順の確認
- [ ] 監視アラートの動作確認
- [ ] ログ収集・分析の動作確認

### 完了条件

- [ ] 全ての統合テストが成功
- [ ] 負荷テストが基準を満たす
- [ ] 運用手順が正常に動作
- [ ] ドキュメントが完備
```

### Phase 3: 限定ユーザーでのベータテスト

**期間**: 2週間
**参加者**: 選定されたベータユーザー（5-10名）
**目的**: 実際の使用環境での動作確認とユーザビリティ検証

**ベータユーザー選定基準**:

- システムに精通している
- フィードバックを積極的に提供できる
- 多様な使用パターンを持つ
- 技術的な問題を理解できる

**実施内容**:

```markdown
## Phase 3 チェックリスト

### ベータテスト準備

- [ ] ベータユーザーの選定・招待完了
- [ ] ベータ環境の準備完了
- [ ] フィードバック収集システムの準備
- [ ] サポート体制の準備

### ベータテスト実行

- [ ] ユーザーオンボーディングの実施
- [ ] 日常的な使用パターンでのテスト
- [ ] 新機能の使用感テスト
- [ ] パフォーマンスの体感テスト

### フィードバック収集

- [ ] 機能に関するフィードバック収集
- [ ] ユーザビリティに関するフィードバック収集
- [ ] バグレポートの収集
- [ ] 改善提案の収集

### 完了条件

- [ ] 重大なバグが0件
- [ ] ユーザビリティスコアが基準を満たす
- [ ] パフォーマンスが許容範囲内
- [ ] ユーザー満足度が80%以上
```

### Phase 4: 段階的本番リリース

**期間**: 1週間
**参加者**: 全ユーザー（段階的に拡大）
**目的**: 本番環境での安定稼働の確認

**リリース段階**:

1. **Day 1**: 管理者のみ（1名）
2. **Day 2-3**: コアユーザー（20%）
3. **Day 4-5**: 一般ユーザー（50%）
4. **Day 6-7**: 全ユーザー（100%）

**実施内容**:

```markdown
## Phase 4 チェックリスト

### リリース準備

- [ ] 本番環境の最終確認
- [ ] 監視システムの強化
- [ ] サポート体制の強化
- [ ] 緊急時対応手順の確認

### 段階的リリース実行

- [ ] Day 1: 管理者リリース完了
- [ ] Day 2-3: コアユーザーリリース完了
- [ ] Day 4-5: 一般ユーザーリリース完了
- [ ] Day 6-7: 全ユーザーリリース完了

### 監視・対応

- [ ] システム監視の継続実施
- [ ] ユーザーサポートの提供
- [ ] 問題の迅速な対応
- [ ] フィードバックの収集・対応

### 完了条件

- [ ] 各段階で重大な問題が発生しない
- [ ] システムパフォーマンスが安定
- [ ] ユーザーからの重大な苦情がない
- [ ] 監視指標が正常範囲内
```

### Phase 5: 全面展開

**期間**: 継続
**参加者**: 全ユーザー
**目的**: 安定運用と継続的改善

**実施内容**:

```markdown
## Phase 5 チェックリスト

### 運用体制確立

- [ ] 24/7監視体制の確立
- [ ] サポート体制の本格運用
- [ ] 定期メンテナンス体制の確立
- [ ] 継続的改善プロセスの確立

### 成功指標の監視

- [ ] KPIの継続的監視
- [ ] ユーザー満足度の定期調査
- [ ] システムパフォーマンスの監視
- [ ] ビジネス指標の監視

### 継続的改善

- [ ] ユーザーフィードバックの分析
- [ ] システム改善の計画・実施
- [ ] 新機能の検討・開発
- [ ] セキュリティ更新の継続実施
```

---

## ロールバック手順の準備

### ロールバック戦略

**ロールバックトリガー条件**:

- システムダウン時間が5分を超える
- エラー率が5%を超える
- データ整合性に問題が発生
- セキュリティ脆弱性が発見される
- ユーザーからの重大な苦情が多数発生

### 緊急ロールバック手順

**`deployment/emergency-rollback.sh`**:

```bash
#!/bin/bash

# 緊急ロールバックスクリプト

set -e

# 設定
APP_DIR="/var/www/portfolio"
BACKUP_DIR="/var/backups/portfolio"
SERVICE_NAME="portfolio-app"
NGINX_SERVICE="nginx"

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "Timestamp: $(date)"

# 1. 即座にメンテナンスモードに切り替え
echo "🔧 Enabling maintenance mode..."
sudo cp /etc/nginx/sites-available/maintenance.conf /etc/nginx/sites-enabled/portfolio.conf
sudo systemctl reload nginx

# 2. アプリケーション停止
echo "⏹️ Stopping application..."
sudo systemctl stop $SERVICE_NAME
pm2 stop all || true

# 3. 最新のバックアップを特定
echo "🔍 Finding latest backup..."
LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -1)
if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    exit 1
fi

echo "📦 Using backup: $LATEST_BACKUP"

# 4. データベースロールバック
echo "🗄️ Rolling back database..."
DB_BACKUP="$BACKUP_DIR/$LATEST_BACKUP/database"
if [ -f "$DB_BACKUP/portfolio_db.sql.gz" ]; then
    # データベース復元
    dropdb portfolio_db || true
    createdb portfolio_db
    gunzip -c "$DB_BACKUP/portfolio_db.sql.gz" | psql portfolio_db
    echo "✅ Database rollback completed"
else
    echo "⚠️ Database backup not found, skipping database rollback"
fi

# 5. アプリケーションファイルロールバック
echo "📁 Rolling back application files..."
if [ -d "$BACKUP_DIR/$LATEST_BACKUP/app" ]; then
    rm -rf $APP_DIR.rollback || true
    mv $APP_DIR $APP_DIR.rollback
    cp -r "$BACKUP_DIR/$LATEST_BACKUP/app" $APP_DIR
    chown -R portfolio:portfolio $APP_DIR
    echo "✅ Application files rollback completed"
else
    echo "❌ Application backup not found!"
    exit 1
fi

# 6. 設定ファイルロールバック
echo "⚙️ Rolling back configuration..."
if [ -d "$BACKUP_DIR/$LATEST_BACKUP/config" ]; then
    cp -r "$BACKUP_DIR/$LATEST_BACKUP/config/"* /etc/nginx/sites-available/
    echo "✅ Configuration rollback completed"
fi

# 7. サービス再開
echo "▶️ Starting services..."
cd $APP_DIR
npm install --production || true
sudo systemctl start $SERVICE_NAME
sudo systemctl reload $NGINX_SERVICE

# 8. ヘルスチェック
echo "🏥 Performing health check..."
sleep 10

HEALTH_URL="http://localhost:3000/api/health"
if curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "✅ Rollback successful - system is healthy"

    # メンテナンスモード解除
    sudo cp /etc/nginx/sites-available/portfolio.conf /etc/nginx/sites-enabled/
    sudo systemctl reload nginx

    # 通知送信
    echo "System rolled back successfully at $(date)" | \
    mail -s "EMERGENCY ROLLBACK COMPLETED" admin@example.com

else
    echo "❌ Rollback failed - system still unhealthy"
    echo "Manual intervention required!"

    # 緊急通知
    echo "CRITICAL: Rollback failed, manual intervention required" | \
    mail -s "ROLLBACK FAILED - URGENT" admin@example.com

    exit 1
fi

echo "🎯 Emergency rollback completed successfully"
```

### 段階的ロールバック手順

**`deployment/staged-rollback.sh`**:

```bash
#!/bin/bash

# 段階的ロールバックスクリプト

set -e

ROLLBACK_STAGE=${1:-"all"}

echo "🔄 Starting staged rollback - Stage: $ROLLBACK_STAGE"

case $ROLLBACK_STAGE in
    "frontend")
        echo "🎨 Rolling back frontend only..."
        # フロントエンドのみロールバック
        pm2 stop portfolio-app
        git checkout HEAD~1 -- pages/ components/ styles/
        npm run build
        pm2 start portfolio-app
        ;;

    "backend")
        echo "🔧 Rolling back backend only..."
        # バックエンドのみロールバック
        pm2 stop portfolio-app
        git checkout HEAD~1 -- pages/api/ lib/ database/
        npm run build
        pm2 start portfolio-app
        ;;

    "database")
        echo "🗄️ Rolling back database only..."
        # データベースのみロールバック
        node database/rollback-migration.js
        ;;

    "config")
        echo "⚙️ Rolling back configuration only..."
        # 設定のみロールバック
        git checkout HEAD~1 -- next.config.js .env.production
        sudo systemctl reload nginx
        ;;

    "all")
        echo "🔄 Rolling back everything..."
        # 全体ロールバック
        ./deployment/emergency-rollback.sh
        ;;

    *)
        echo "❌ Invalid rollback stage: $ROLLBACK_STAGE"
        echo "Valid stages: frontend, backend, database, config, all"
        exit 1
        ;;
esac

echo "✅ Staged rollback completed: $ROLLBACK_STAGE"
```

### ロールバック判定システム

**`monitoring/rollback-decision.js`**:

```javascript
const MetricsCollector = require("../lib/monitoring/metrics");

class RollbackDecisionSystem {
  constructor() {
    this.thresholds = {
      errorRate: 0.05, // 5%
      responseTime: 5000, // 5秒
      downtime: 300000, // 5分
      memoryUsage: 0.9, // 90%
      cpuUsage: 0.95, // 95%
    };

    this.checkInterval = 30000; // 30秒
    this.consecutiveFailures = 0;
    this.maxConsecutiveFailures = 3;
  }

  async startMonitoring() {
    console.log("🔍 Starting rollback decision monitoring...");

    setInterval(async () => {
      await this.checkSystemHealth();
    }, this.checkInterval);
  }

  async checkSystemHealth() {
    try {
      const metrics = await this.collectMetrics();
      const decision = this.evaluateRollbackNeed(metrics);

      if (decision.shouldRollback) {
        await this.initiateRollback(decision);
      } else {
        this.consecutiveFailures = 0;
      }
    } catch (error) {
      console.error("Health check failed:", error);
      this.consecutiveFailures++;

      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        await this.initiateRollback({
          reason: "monitoring_failure",
          severity: "critical",
          details: "Health check system failure",
        });
      }
    }
  }

  async collectMetrics() {
    // システムメトリクスの収集
    const response = await fetch("http://localhost:3000/api/metrics");
    const metricsText = await response.text();

    // メトリクスの解析
    const metrics = this.parsePrometheusMetrics(metricsText);

    return {
      errorRate: this.calculateErrorRate(metrics),
      avgResponseTime: this.calculateAvgResponseTime(metrics),
      memoryUsage: this.getMemoryUsage(metrics),
      cpuUsage: this.getCpuUsage(metrics),
      uptime: this.getUptime(metrics),
    };
  }

  evaluateRollbackNeed(metrics) {
    const issues = [];

    // エラー率チェック
    if (metrics.errorRate > this.thresholds.errorRate) {
      issues.push({
        type: "error_rate",
        value: metrics.errorRate,
        threshold: this.thresholds.errorRate,
        severity: "high",
      });
    }

    // レスポンス時間チェック
    if (metrics.avgResponseTime > this.thresholds.responseTime) {
      issues.push({
        type: "response_time",
        value: metrics.avgResponseTime,
        threshold: this.thresholds.responseTime,
        severity: "medium",
      });
    }

    // メモリ使用量チェック
    if (metrics.memoryUsage > this.thresholds.memoryUsage) {
      issues.push({
        type: "memory_usage",
        value: metrics.memoryUsage,
        threshold: this.thresholds.memoryUsage,
        severity: "high",
      });
    }

    // CPU使用量チェック
    if (metrics.cpuUsage > this.thresholds.cpuUsage) {
      issues.push({
        type: "cpu_usage",
        value: metrics.cpuUsage,
        threshold: this.thresholds.cpuUsage,
        severity: "critical",
      });
    }

    // ロールバック判定
    const criticalIssues = issues.filter(
      (issue) => issue.severity === "critical",
    );
    const highIssues = issues.filter((issue) => issue.severity === "high");

    const shouldRollback = criticalIssues.length > 0 || highIssues.length >= 2;

    return {
      shouldRollback,
      issues,
      severity: this.determineSeverity(issues),
      reason: this.determineReason(issues),
    };
  }

  async initiateRollback(decision) {
    console.log("🚨 INITIATING AUTOMATIC ROLLBACK");
    console.log("Reason:", decision.reason);
    console.log("Severity:", decision.severity);

    // 緊急通知送信
    await this.sendEmergencyNotification(decision);

    // ロールバック実行
    const { spawn } = require("child_process");

    const rollbackType = decision.severity === "critical" ? "all" : "staged";
    const rollbackScript =
      rollbackType === "all"
        ? "./deployment/emergency-rollback.sh"
        : `./deployment/staged-rollback.sh ${this.determineRollbackStage(decision)}`;

    const rollback = spawn("bash", [rollbackScript], {
      stdio: "inherit",
    });

    rollback.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Automatic rollback completed successfully");
      } else {
        console.error("❌ Automatic rollback failed");
        this.sendFailureNotification(decision, code);
      }
    });
  }

  determineRollbackStage(decision) {
    // 問題の種類に応じてロールバック範囲を決定
    const issues = decision.issues.map((issue) => issue.type);

    if (issues.includes("error_rate") || issues.includes("response_time")) {
      return "backend";
    } else if (
      issues.includes("memory_usage") ||
      issues.includes("cpu_usage")
    ) {
      return "all";
    } else {
      return "frontend";
    }
  }

  async sendEmergencyNotification(decision) {
    const message = `
AUTOMATIC ROLLBACK INITIATED

Reason: ${decision.reason}
Severity: ${decision.severity}
Time: ${new Date().toISOString()}

Issues detected:
${decision.issues
  .map(
    (issue) =>
      `- ${issue.type}: ${issue.value} (threshold: ${issue.threshold})`,
  )
  .join("\n")}

Rollback process has been started automatically.
    `;

    // メール通知
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: "alerts@example.com",
      to: "admin@example.com",
      subject: "🚨 AUTOMATIC ROLLBACK INITIATED",
      text: message,
    });

    // Slack通知（設定されている場合）
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "🚨 AUTOMATIC ROLLBACK INITIATED",
          attachments: [
            {
              color: "danger",
              text: message,
            },
          ],
        }),
      });
    }
  }

  // メトリクス解析ヘルパーメソッド
  parsePrometheusMetrics(metricsText) {
    // Prometheusメトリクスの解析実装
    const lines = metricsText.split("\n");
    const metrics = {};

    lines.forEach((line) => {
      if (line.startsWith("#") || !line.trim()) return;

      const [nameAndLabels, value] = line.split(" ");
      const [name] = nameAndLabels.split("{");

      if (!metrics[name]) metrics[name] = [];
      metrics[name].push(parseFloat(value));
    });

    return metrics;
  }

  calculateErrorRate(metrics) {
    const totalRequests = metrics.http_requests_total || [0];
    const errorRequests = metrics.http_requests_total_5xx || [0];

    const total = totalRequests.reduce((sum, val) => sum + val, 0);
    const errors = errorRequests.reduce((sum, val) => sum + val, 0);

    return total > 0 ? errors / total : 0;
  }

  calculateAvgResponseTime(metrics) {
    const responseTimes = metrics.http_request_duration_seconds || [0];
    return (
      responseTimes.reduce((sum, val) => sum + val, 0) / responseTimes.length
    );
  }

  getMemoryUsage(metrics) {
    const memoryUsed = metrics.process_resident_memory_bytes || [0];
    const memoryTotal = 1024 * 1024 * 1024; // 1GB仮定

    return memoryUsed[0] / memoryTotal;
  }

  getCpuUsage(metrics) {
    const cpuUsage = metrics.process_cpu_usage_percent || [0];
    return cpuUsage[0] / 100;
  }

  getUptime(metrics) {
    const uptime = metrics.process_start_time_seconds || [Date.now() / 1000];
    return Date.now() / 1000 - uptime[0];
  }

  determineSeverity(issues) {
    if (issues.some((issue) => issue.severity === "critical"))
      return "critical";
    if (issues.some((issue) => issue.severity === "high")) return "high";
    if (issues.some((issue) => issue.severity === "medium")) return "medium";
    return "low";
  }

  determineReason(issues) {
    const reasons = issues.map((issue) => issue.type);
    return reasons.join(", ");
  }
}

// 自動監視開始
if (require.main === module) {
  const rollbackSystem = new RollbackDecisionSystem();
  rollbackSystem.startMonitoring();
}

module.exports = RollbackDecisionSystem;
```

---

## ユーザー通知・トレーニング計画

### 通知戦略

**通知チャネル**:

1. **システム内通知**: アプリケーション内でのバナー表示
2. **メール通知**: 重要な変更の事前通知
3. **ドキュメント**: 詳細な変更内容と使用方法
4. **トレーニングセッション**: 対面またはオンラインでの説明会

### 段階的通知計画

**`notifications/notification-schedule.md`**:

```markdown
# ユーザー通知スケジュール

## Phase 1: 事前通知（リリース4週間前）

### 対象: 全ユーザー

### 内容: システム拡張の概要通知

**メール件名**: 「ポートフォリオシステム大幅機能拡張のお知らせ」

**メール内容**:
```

件名: ポートフォリオシステム大幅機能拡張のお知らせ

いつもポートフォリオシステムをご利用いただき、ありがとうございます。

この度、システムの大幅な機能拡張を実施いたします。

## 主な新機能

- 複数カテゴリーの同時設定
- 改善されたタグ管理システム
- 日付の手動設定機能
- 拡張されたファイルアップロード機能
- マークダウンエディター
- video&designページの表示改善

## スケジュール

- ベータテスト開始: [日付]
- 本番リリース: [日付]
- トレーニングセッション: [日付]

詳細は添付の資料をご確認ください。

ご質問がございましたら、サポートチームまでお気軽にお問い合わせください。

ポートフォリオシステム開発チーム

````

## Phase 2: 詳細通知（リリース2週間前）

### 対象: 全ユーザー
### 内容: 具体的な変更内容と影響

**メール件名**: 「システム拡張の詳細と準備事項について」

**システム内バナー**:
```html
<div class="notification-banner info">
  <h3>🚀 システム拡張まであと2週間</h3>
  <p>新機能の詳細とトレーニング資料をご確認ください。</p>
  <a href="/training-materials" class="btn btn-primary">詳細を見る</a>
</div>
````

## Phase 3: 最終通知（リリース1週間前）

### 対象: 全ユーザー

### 内容: リリース日時と注意事項

**メール件名**: 「システム拡張実施日時の最終確認」

**システム内バナー**:

```html
<div class="notification-banner warning">
  <h3>⚠️ システム拡張まであと1週間</h3>
  <p>リリース日: [日付] [時間]</p>
  <p>メンテナンス時間: 約30分</p>
  <a href="/release-notes" class="btn btn-warning">リリースノートを確認</a>
</div>
```

## Phase 4: リリース当日通知

### 対象: 全ユーザー

### 内容: メンテナンス開始・完了通知

**メンテナンス開始通知**:

```html
<div class="notification-banner maintenance">
  <h3>🔧 システムメンテナンス中</h3>
  <p>新機能追加のためのメンテナンスを実施中です。</p>
  <p>完了予定時刻: [時間]</p>
</div>
```

**メンテナンス完了通知**:

```html
<div class="notification-banner success">
  <h3>✅ システム拡張完了</h3>
  <p>新機能が利用可能になりました！</p>
  <a href="/whats-new" class="btn btn-success">新機能を確認</a>
</div>
```

## Phase 5: フォローアップ通知（リリース1週間後）

### 対象: 全ユーザー

### 内容: 使用状況確認とサポート案内

**メール件名**: 「新機能はいかがですか？サポートのご案内」

````

### トレーニング計画

**`training/training-plan.md`**:
```markdown
# ユーザートレーニング計画

## トレーニング概要

### 目的
- 新機能の効果的な使用方法の習得
- 既存ワークフローへの統合方法の理解
- 問題発生時の対処方法の習得

### 対象者別トレーニング

#### 管理者向けトレーニング（2時間）
**参加者**: システム管理者、コンテンツ管理者
**内容**:
1. システム概要と変更点（30分）
2. データマネージャーの新機能（45分）
3. 運用・保守の変更点（30分）
4. トラブルシューティング（15分）

#### 一般ユーザー向けトレーニング（1時間）
**参加者**: 一般ユーザー
**内容**:
1. 新機能の概要（15分）
2. 複数カテゴリー機能の使い方（15分）
3. 改善されたタグ管理（15分）
4. その他の新機能（10分）
5. Q&A（5分）

### トレーニング資料

#### 1. 動画チュートリアル
- **基本操作編**（10分）: 新しいデータマネージャーの基本操作
- **複数カテゴリー編**（5分）: 複数カテゴリーの設定方法
- **タグ管理編**（5分）: 新しいタグ管理システムの使い方
- **ファイルアップロード編**（5分）: 拡張されたファイルアップロード機能
- **マークダウン編**（5分）: マークダウンエディターの使い方

#### 2. 操作マニュアル
- **クイックスタートガイド**（2ページ）: 最低限知っておくべき操作
- **詳細操作マニュアル**（20ページ）: 全機能の詳細な使用方法
- **FAQ集**（5ページ）: よくある質問と回答

#### 3. インタラクティブガイド
- **システム内ガイド**: 初回ログイン時の操作ガイド
- **ツールチップ**: 新機能の説明ポップアップ
- **プログレッシブ開示**: 段階的な機能紹介

### トレーニング実施方法

#### オンライントレーニング
**ツール**: Zoom、Teams
**録画**: 後日視聴可能
**資料**: 画面共有とスライド

#### 対面トレーニング
**場所**: 会議室
**資料**: プロジェクター、配布資料
**実習**: 実際のシステムを使用

#### セルフトレーニング
**プラットフォーム**: 学習管理システム
**進捗管理**: 完了状況の追跡
**認定**: 理解度テスト

### トレーニング効果測定

#### 理解度テスト
**実施時期**: トレーニング直後
**内容**: 新機能に関する選択式問題（10問）
**合格基準**: 80%以上の正答率

#### 実践評価
**実施時期**: トレーニング1週間後
**内容**: 実際のシステム操作タスク
**評価基準**: タスク完了時間と正確性

#### フィードバック収集
**実施時期**: トレーニング直後と1週間後
**内容**:
- トレーニング内容の満足度
- 理解度の自己評価
- 追加サポートの必要性
- 改善提案
````

### 通知システムの実装

**`lib/notifications/notification-system.js`**:

```javascript
class NotificationSystem {
  constructor() {
    this.channels = {
      email: require("./email-notifier"),
      inApp: require("./in-app-notifier"),
      slack: require("./slack-notifier"),
    };
  }

  async sendReleaseNotification(phase, users, content) {
    const notifications = [];

    // フェーズに応じた通知チャネルの選択
    const channels = this.getChannelsForPhase(phase);

    for (const channel of channels) {
      for (const user of users) {
        try {
          await this.channels[channel].send(user, content);
          notifications.push({
            user: user.id,
            channel,
            status: "sent",
            timestamp: new Date(),
          });
        } catch (error) {
          notifications.push({
            user: user.id,
            channel,
            status: "failed",
            error: error.message,
            timestamp: new Date(),
          });
        }
      }
    }

    return notifications;
  }

  getChannelsForPhase(phase) {
    const channelMap = {
      "pre-announcement": ["email"],
      "detailed-notice": ["email", "inApp"],
      "final-notice": ["email", "inApp", "slack"],
      maintenance: ["inApp", "slack"],
      completion: ["email", "inApp"],
      "follow-up": ["email"],
    };

    return channelMap[phase] || ["email"];
  }

  async scheduleNotifications(releaseDate) {
    const schedule = [
      {
        date: new Date(releaseDate.getTime() - 28 * 24 * 60 * 60 * 1000), // 4週間前
        phase: "pre-announcement",
        template: "pre-announcement",
      },
      {
        date: new Date(releaseDate.getTime() - 14 * 24 * 60 * 60 * 1000), // 2週間前
        phase: "detailed-notice",
        template: "detailed-notice",
      },
      {
        date: new Date(releaseDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1週間前
        phase: "final-notice",
        template: "final-notice",
      },
      {
        date: releaseDate, // リリース当日
        phase: "maintenance",
        template: "maintenance-start",
      },
    ];

    // スケジュールされた通知をデータベースに保存
    for (const notification of schedule) {
      await this.saveScheduledNotification(notification);
    }

    return schedule;
  }

  async saveScheduledNotification(notification) {
    // データベースに通知スケジュールを保存
    const db = require("../database/connection");

    await db.query(
      `
      INSERT INTO scheduled_notifications (
        scheduled_date, phase, template, status, created_at
      ) VALUES ($1, $2, $3, 'pending', NOW())
    `,
      [notification.date, notification.phase, notification.template],
    );
  }
}

module.exports = new NotificationSystem();
```

## このリリース・展開準備により、システムの安全で効果的なリリースが可能になります。次のセクションでは、サポート体制の整備について詳しく説明します。

## サポート体制の整備

### サポート体制概要

**サポートレベル**:

- **L1サポート**: 基本的な質問・操作支援
- **L2サポート**: 技術的な問題・バグ対応
- **L3サポート**: 複雑な技術問題・システム障害対応

### サポートチーム構成

**`support/support-team-structure.md`**:

```markdown
# サポートチーム構成

## チーム構成

### L1サポート（フロントライン）

**人数**: 2名
**勤務時間**: 平日 9:00-18:00
**対応内容**:

- 基本的な操作方法の説明
- よくある質問への回答
- 初期トラブルシューティング
- L2への適切なエスカレーション

**必要スキル**:

- システムの基本操作に精通
- 優れたコミュニケーション能力
- 問題の分類・優先度付け能力

### L2サポート（技術サポート）

**人数**: 2名
**勤務時間**: 平日 8:00-20:00（交代制）
**対応内容**:

- 技術的な問題の調査・解決
- バグの特定・回避策の提供
- システム設定の支援
- L3への技術的エスカレーション

**必要スキル**:

- システム開発・運用経験
- データベース・ネットワークの知識
- ログ解析・デバッグ能力
- 問題解決能力

### L3サポート（エキスパート）

**人数**: 1名（開発チームリーダー）
**勤務時間**: オンコール対応
**対応内容**:

- 複雑な技術問題の解決
- システム障害の対応
- 緊急時の意思決定
- 開発チームとの連携

**必要スキル**:

- システム全体の深い理解
- 高度な技術的問題解決能力
- 緊急時対応経験
- チームリーダーシップ

## エスカレーション基準

### L1 → L2 エスカレーション

- 操作方法の説明で解決しない技術的問題
- システムエラーメッセージが表示される問題
- データの不整合が疑われる問題
- 30分以内に解決できない問題

### L2 → L3 エスカレーション

- システム全体に影響する問題
- データ損失の可能性がある問題
- セキュリティに関わる問題
- 2時間以内に解決できない問題
- 複数ユーザーに影響する問題

## 対応時間目標（SLA）

### 初回応答時間

- **L1問題**: 1時間以内
- **L2問題**: 2時間以内
- **L3問題**: 30分以内（緊急時は即座）

### 解決時間目標

- **L1問題**: 4時間以内
- **L2問題**: 1営業日以内
- **L3問題**: 4時間以内（緊急時）
```

### サポートツールとシステム

**`support/support-tools-setup.md`**:

````markdown
# サポートツール設定

## ヘルプデスクシステム

### チケット管理システム

**ツール**: Zendesk / Freshdesk
**機能**:

- チケットの自動分類
- 優先度の自動設定
- SLA監視
- エスカレーション自動化
- ナレッジベース統合

**設定例**:

```json
{
  "ticket_fields": [
    {
      "name": "issue_category",
      "type": "dropdown",
      "options": [
        "login_issues",
        "data_manager",
        "file_upload",
        "gallery_display",
        "performance",
        "bug_report",
        "feature_request"
      ]
    },
    {
      "name": "severity",
      "type": "dropdown",
      "options": ["low", "medium", "high", "critical"]
    },
    {
      "name": "affected_users",
      "type": "number"
    }
  ],
  "automation_rules": [
    {
      "trigger": "ticket_created",
      "conditions": {
        "issue_category": "login_issues"
      },
      "actions": {
        "assign_to": "l1_support",
        "priority": "high",
        "send_auto_reply": true
      }
    }
  ]
}
```
````

## リモートサポートツール

### 画面共有・リモート操作

**ツール**: TeamViewer / Chrome Remote Desktop
**用途**:

- ユーザーの画面を直接確認
- 操作方法のデモンストレーション
- 問題の再現確認

### ビデオ通話

**ツール**: Zoom / Google Meet
**用途**:

- 複雑な問題の説明
- トレーニングセッション
- 緊急時の迅速な対応

## 監視・分析ツール

### システム監視ダッシュボード

**ツール**: Grafana
**監視項目**:

- システム稼働状況
- エラー発生状況
- パフォーマンス指標
- ユーザー活動状況

### ログ分析システム

**ツール**: ELK Stack
**機能**:

- エラーログの検索・分析
- ユーザー行動の追跡
- 問題の根本原因分析

````

### ナレッジベース構築

**`support/knowledge-base-structure.md`**:
```markdown
# ナレッジベース構造

## カテゴリー構成

### 1. よくある質問（FAQ）
#### ログイン・認証
- パスワードを忘れた場合の対処法
- ログインできない場合のトラブルシューティング
- セッションタイムアウトについて

#### データマネージャー
- 新しいポートフォリオアイテムの作成方法
- 複数カテゴリーの設定方法
- タグの追加・管理方法
- 日付の手動設定方法

#### ファイルアップロード
- サポートされているファイル形式
- ファイルサイズの制限
- アップロードエラーの対処法
- 変換なしアップロードの使い方

#### ギャラリー表示
- カテゴリー別表示の仕組み
- フィルター機能の使い方
- 検索機能の使い方

### 2. トラブルシューティングガイド
#### エラーメッセージ別対処法
```javascript
const errorSolutions = {
  "UPLOAD_FILE_TOO_LARGE": {
    title: "ファイルサイズが大きすぎます",
    solution: [
      "ファイルサイズを50MB以下に縮小してください",
      "画像の場合は解像度を下げることを検討してください",
      "変換なしオプションを使用する場合は、特に注意が必要です"
    ],
    prevention: "アップロード前にファイルサイズを確認してください"
  },
  "INVALID_FILE_TYPE": {
    title: "サポートされていないファイル形式です",
    solution: [
      "JPEG、PNG、GIF、WebP、Markdownファイルのみサポートされています",
      "ファイル拡張子が正しいか確認してください",
      "ファイルが破損していないか確認してください"
    ],
    prevention: "アップロード前にファイル形式を確認してください"
  },
  "DATABASE_CONNECTION_ERROR": {
    title: "データベース接続エラー",
    solution: [
      "ページを再読み込みしてください",
      "しばらく時間をおいてから再試行してください",
      "問題が続く場合はサポートにお問い合わせください"
    ],
    escalation: "L2サポートに即座にエスカレーション"
  }
};
````

#### パフォーマンス問題

- ページの読み込みが遅い場合
- ファイルアップロードが失敗する場合
- 検索結果が表示されない場合

### 3. 操作ガイド

#### 基本操作

- システムへのログイン方法
- ダッシュボードの見方
- 基本的なナビゲーション

#### 高度な操作

- 一括データ操作
- カスタムフィルターの作成
- データのエクスポート・インポート

### 4. 技術情報

#### システム要件

- 対応ブラウザ
- 推奨システム仕様
- ネットワーク要件

#### API情報

- 利用可能なAPI一覧
- 認証方法
- レート制限

## 記事テンプレート

### FAQ記事テンプレート

```markdown
# [質問タイトル]

## 問題

[ユーザーが直面している問題の説明]

## 解決方法

[ステップバイステップの解決手順]

1. [手順1]
2. [手順2]
3. [手順3]

## 関連情報

- [関連記事へのリンク]
- [参考資料]

## この記事は役に立ちましたか？

[フィードバック収集フォーム]
```

### トラブルシューティング記事テンプレート

```markdown
# [エラー名/問題名]

## 症状

[問題の症状の詳細な説明]

## 原因

[問題が発生する原因]

## 解決方法

### 方法1: [簡単な解決方法]

[手順の説明]

### 方法2: [代替解決方法]

[手順の説明]

## 予防方法

[同じ問題を避けるための方法]

## 関連エラー

[類似の問題へのリンク]

## エスカレーション基準

[L2/L3サポートへのエスカレーションが必要な条件]
```

````

### サポート品質管理

**`support/quality-management.js`**:
```javascript
class SupportQualityManager {
  constructor() {
    this.metrics = {
      responseTime: [],
      resolutionTime: [],
      customerSatisfaction: [],
      firstCallResolution: []
    };
  }

  // サポート品質メトリクスの収集
  async collectMetrics() {
    const db = require('../database/connection');

    // 応答時間の分析
    const responseTimeData = await db.query(`
      SELECT
        AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/60) as avg_response_minutes,
        support_level,
        DATE(created_at) as date
      FROM support_tickets
      WHERE created_at >= NOW() - INTERVAL '30 days'
      AND first_response_at IS NOT NULL
      GROUP BY support_level, DATE(created_at)
      ORDER BY date DESC
    `);

    // 解決時間の分析
    const resolutionTimeData = await db.query(`
      SELECT
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours,
        priority,
        support_level
      FROM support_tickets
      WHERE resolved_at IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY priority, support_level
    `);

    // 顧客満足度の分析
    const satisfactionData = await db.query(`
      SELECT
        AVG(rating) as avg_satisfaction,
        COUNT(*) as total_responses,
        support_agent_id
      FROM support_feedback
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY support_agent_id
    `);

    return {
      responseTime: responseTimeData.rows,
      resolutionTime: resolutionTimeData.rows,
      satisfaction: satisfactionData.rows
    };
  }

  // SLA遵守状況の監視
  async monitorSLA() {
    const slaTargets = {
      l1_response: 60,      // 1時間
      l2_response: 120,     // 2時間
      l3_response: 30,      // 30分
      l1_resolution: 240,   // 4時間
      l2_resolution: 1440,  // 24時間
      l3_resolution: 240    // 4時間
    };

    const db = require('../database/connection');

    // SLA違反チケットの特定
    const slaViolations = await db.query(`
      SELECT
        ticket_id,
        support_level,
        priority,
        created_at,
        first_response_at,
        resolved_at,
        CASE
          WHEN support_level = 'L1' AND EXTRACT(EPOCH FROM (first_response_at - created_at))/60 > 60 THEN 'response_sla_violation'
          WHEN support_level = 'L2' AND EXTRACT(EPOCH FROM (first_response_at - created_at))/60 > 120 THEN 'response_sla_violation'
          WHEN support_level = 'L3' AND EXTRACT(EPOCH FROM (first_response_at - created_at))/60 > 30 THEN 'response_sla_violation'
          WHEN support_level = 'L1' AND EXTRACT(EPOCH FROM (resolved_at - created_at))/60 > 240 THEN 'resolution_sla_violation'
          WHEN support_level = 'L2' AND EXTRACT(EPOCH FROM (resolved_at - created_at))/60 > 1440 THEN 'resolution_sla_violation'
          WHEN support_level = 'L3' AND EXTRACT(EPOCH FROM (resolved_at - created_at))/60 > 240 THEN 'resolution_sla_violation'
        END as violation_type
      FROM support_tickets
      WHERE created_at >= NOW() - INTERVAL '7 days'
      AND (
        (support_level = 'L1' AND (EXTRACT(EPOCH FROM (first_response_at - created_at))/60 > 60 OR EXTRACT(EPOCH FROM (resolved_at - created_at))/60 > 240)) OR
        (support_level = 'L2' AND (EXTRACT(EPOCH FROM (first_response_at - created_at))/60 > 120 OR EXTRACT(EPOCH FROM (resolved_at - created_at))/60 > 1440)) OR
        (support_level = 'L3' AND (EXTRACT(EPOCH FROM (first_response_at - created_at))/60 > 30 OR EXTRACT(EPOCH FROM (resolved_at - created_at))/60 > 240))
      )
    `);

    // SLA違反の通知
    if (slaViolations.rows.length > 0) {
      await this.notifySLAViolations(slaViolations.rows);
    }

    return slaViolations.rows;
  }

  // サポート品質レポートの生成
  async generateQualityReport() {
    const metrics = await this.collectMetrics();
    const slaViolations = await this.monitorSLA();

    const report = {
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      summary: {
        totalTickets: await this.getTotalTickets(),
        avgResponseTime: this.calculateAverage(metrics.responseTime, 'avg_response_minutes'),
        avgResolutionTime: this.calculateAverage(metrics.resolutionTime, 'avg_resolution_hours'),
        avgSatisfaction: this.calculateAverage(metrics.satisfaction, 'avg_satisfaction'),
        slaViolations: slaViolations.length
      },
      trends: {
        responseTime: this.analyzeTrend(metrics.responseTime),
        satisfaction: this.analyzeTrend(metrics.satisfaction)
      },
      recommendations: this.generateRecommendations(metrics, slaViolations)
    };

    return report;
  }

  // 改善提案の生成
  generateRecommendations(metrics, slaViolations) {
    const recommendations = [];

    // 応答時間の改善提案
    const avgResponseTime = this.calculateAverage(metrics.responseTime, 'avg_response_minutes');
    if (avgResponseTime > 60) {
      recommendations.push({
        category: 'response_time',
        priority: 'high',
        suggestion: 'L1サポートの人員増強を検討してください',
        impact: '応答時間の短縮により顧客満足度向上が期待できます'
      });
    }

    // 満足度の改善提案
    const avgSatisfaction = this.calculateAverage(metrics.satisfaction, 'avg_satisfaction');
    if (avgSatisfaction < 4.0) {
      recommendations.push({
        category: 'satisfaction',
        priority: 'medium',
        suggestion: 'サポート担当者のトレーニング強化を実施してください',
        impact: '問題解決能力の向上により満足度向上が期待できます'
      });
    }

    // SLA違反の改善提案
    if (slaViolations.length > 10) {
      recommendations.push({
        category: 'sla_compliance',
        priority: 'critical',
        suggestion: 'サポートプロセスの見直しとリソース配分の最適化が必要です',
        impact: 'SLA遵守率の向上により信頼性が向上します'
      });
    }

    return recommendations;
  }

  // ヘルパーメソッド
  calculateAverage(data, field) {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + parseFloat(item[field] || 0), 0);
    return sum / data.length;
  }

  analyzeTrend(data) {
    // 簡単なトレンド分析（上昇・下降・安定）
    if (!data || data.length < 2) return 'insufficient_data';

    const recent = data.slice(-7); // 直近7日
    const previous = data.slice(-14, -7); // その前の7日

    const recentAvg = this.calculateAverage(recent, Object.keys(recent[0])[0]);
    const previousAvg = this.calculateAverage(previous, Object.keys(previous[0])[0]);

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  async getTotalTickets() {
    const db = require('../database/connection');
    const result = await db.query(`
      SELECT COUNT(*) as total
      FROM support_tickets
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    return parseInt(result.rows[0].total);
  }

  async notifySLAViolations(violations) {
    const message = `
SLA Violations Detected

Total violations: ${violations.length}

Recent violations:
${violations.slice(0, 5).map(v =>
  `- Ticket ${v.ticket_id}: ${v.violation_type} (${v.support_level})`
).join('\n')}

Please review support processes and resource allocation.
    `;

    // 管理者への通知
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: 'support-alerts@example.com',
      to: 'support-manager@example.com',
      subject: '🚨 SLA Violations Detected',
      text: message
    });
  }
}

module.exports = new SupportQualityManager();
````

---

## 成功指標の設定・測定準備

### KPI定義と目標設定

**`metrics/success-metrics.md`**:

```markdown
# 成功指標（KPI）定義

## 1. システム稼働指標

### 可用性（Availability）

- **目標**: 99.9%以上
- **測定方法**: アップタイム監視
- **測定頻度**: リアルタイム
- **責任者**: インフラチーム

### パフォーマンス

- **ページロード時間**: 3秒以内（95%ile）
- **API応答時間**: 1秒以内（95%ile）
- **データベースクエリ時間**: 500ms以内（平均）
- **測定方法**: APM（Application Performance Monitoring）
- **測定頻度**: リアルタイム

### エラー率

- **目標**: 0.1%以下
- **測定方法**: エラーログ分析
- **測定頻度**: リアルタイム
- **アラート閾値**: 0.5%

## 2. ユーザー体験指標

### ユーザー満足度

- **目標**: 4.5/5.0以上
- **測定方法**: 定期アンケート調査
- **測定頻度**: 月次
- **サンプルサイズ**: 最低50名

### 機能利用率

- **複数カテゴリー機能**: 60%以上のユーザーが利用
- **新タグ管理機能**: 80%以上のユーザーが利用
- **マークダウンエディター**: 40%以上のユーザーが利用
- **測定方法**: ユーザー行動分析
- **測定頻度**: 週次

### タスク完了率

- **ポートフォリオアイテム作成**: 95%以上
- **ファイルアップロード**: 98%以上
- **カテゴリー設定**: 90%以上
- **測定方法**: ユーザージャーニー分析
- **測定頻度**: 日次

## 3. ビジネス指標

### 生産性向上

- **コンテンツ作成時間**: 30%短縮
- **管理作業時間**: 40%短縮
- **測定方法**: 作業時間ログ分析
- **測定頻度**: 月次

### データ品質

- **データ整合性エラー**: 0件
- **重複データ**: 1%以下
- **測定方法**: データ品質チェック
- **測定頻度**: 日次

### コスト効率

- **運用コスト**: 前年比10%削減
- **サポートコスト**: 前年比20%削減
- **測定方法**: コスト分析
- **測定頻度**: 月次

## 4. サポート指標

### 応答時間

- **L1サポート**: 1時間以内（90%）
- **L2サポート**: 2時間以内（90%）
- **L3サポート**: 30分以内（95%）

### 解決時間

- **L1問題**: 4時間以内（85%）
- **L2問題**: 24時間以内（90%）
- **L3問題**: 4時間以内（95%）

### 顧客満足度

- **サポート満足度**: 4.0/5.0以上
- **初回解決率**: 70%以上

## 5. 採用・学習指標

### 機能採用率

- **新機能の認知率**: 90%以上（リリース1ヶ月後）
- **新機能の利用率**: 60%以上（リリース3ヶ月後）
- **継続利用率**: 80%以上（リリース6ヶ月後）

### 学習効果

- **トレーニング完了率**: 95%以上
- **理解度テスト合格率**: 90%以上
- **実践評価合格率**: 85%以上
```

### 測定システムの実装

**`metrics/metrics-collection-system.js`**:

```javascript
const prometheus = require("prom-client");

class MetricsCollectionSystem {
  constructor() {
    // Prometheusメトリクスの定義
    this.metrics = {
      // システム稼働指標
      uptime: new prometheus.Gauge({
        name: "system_uptime_seconds",
        help: "System uptime in seconds",
      }),

      responseTime: new prometheus.Histogram({
        name: "http_request_duration_seconds",
        help: "HTTP request duration in seconds",
        labelNames: ["method", "route", "status_code"],
        buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      }),

      errorRate: new prometheus.Counter({
        name: "http_errors_total",
        help: "Total number of HTTP errors",
        labelNames: ["method", "route", "status_code"],
      }),

      // ユーザー体験指標
      featureUsage: new prometheus.Counter({
        name: "feature_usage_total",
        help: "Total feature usage count",
        labelNames: ["feature_name", "user_id"],
      }),

      taskCompletion: new prometheus.Counter({
        name: "task_completion_total",
        help: "Total task completions",
        labelNames: ["task_type", "status"],
      }),

      userSatisfaction: new prometheus.Gauge({
        name: "user_satisfaction_score",
        help: "User satisfaction score",
        labelNames: ["survey_id", "user_segment"],
      }),

      // ビジネス指標
      contentCreationTime: new prometheus.Histogram({
        name: "content_creation_duration_seconds",
        help: "Content creation duration in seconds",
        labelNames: ["content_type"],
        buckets: [60, 300, 600, 1200, 1800, 3600],
      }),

      dataQuality: new prometheus.Gauge({
        name: "data_quality_score",
        help: "Data quality score",
        labelNames: ["data_type"],
      }),

      // サポート指標
      supportResponseTime: new prometheus.Histogram({
        name: "support_response_duration_seconds",
        help: "Support response duration in seconds",
        labelNames: ["support_level", "priority"],
        buckets: [300, 600, 1800, 3600, 7200, 14400, 28800],
      }),

      supportResolutionTime: new prometheus.Histogram({
        name: "support_resolution_duration_seconds",
        help: "Support resolution duration in seconds",
        labelNames: ["support_level", "priority"],
        buckets: [1800, 3600, 7200, 14400, 28800, 86400, 172800],
      }),
    };

    // カスタムメトリクス収集の設定
    this.customMetricsInterval = 60000; // 1分間隔
    this.startCustomMetricsCollection();
  }

  // HTTPリクエストメトリクスの記録
  recordHttpRequest(method, route, statusCode, duration) {
    this.metrics.responseTime
      .labels(method, route, statusCode)
      .observe(duration);

    if (statusCode >= 400) {
      this.metrics.errorRate.labels(method, route, statusCode).inc();
    }
  }

  // 機能利用メトリクスの記録
  recordFeatureUsage(featureName, userId) {
    this.metrics.featureUsage.labels(featureName, userId).inc();
  }

  // タスク完了メトリクスの記録
  recordTaskCompletion(taskType, status) {
    this.metrics.taskCompletion.labels(taskType, status).inc();
  }

  // ユーザー満足度の記録
  recordUserSatisfaction(surveyId, userSegment, score) {
    this.metrics.userSatisfaction.labels(surveyId, userSegment).set(score);
  }

  // コンテンツ作成時間の記録
  recordContentCreationTime(contentType, duration) {
    this.metrics.contentCreationTime.labels(contentType).observe(duration);
  }

  // サポートメトリクスの記録
  recordSupportMetrics(type, level, priority, duration) {
    if (type === "response") {
      this.metrics.supportResponseTime
        .labels(level, priority)
        .observe(duration);
    } else if (type === "resolution") {
      this.metrics.supportResolutionTime
        .labels(level, priority)
        .observe(duration);
    }
  }

  // カスタムメトリクスの定期収集
  startCustomMetricsCollection() {
    setInterval(async () => {
      try {
        await this.collectSystemMetrics();
        await this.collectBusinessMetrics();
        await this.collectUserMetrics();
      } catch (error) {
        console.error("Custom metrics collection failed:", error);
      }
    }, this.customMetricsInterval);
  }

  // システムメトリクスの収集
  async collectSystemMetrics() {
    // アップタイムの記録
    this.metrics.uptime.set(process.uptime());

    // データ品質スコアの計算・記録
    const dataQualityScore = await this.calculateDataQualityScore();
    this.metrics.dataQuality.labels("portfolio_items").set(dataQualityScore);
  }

  // ビジネスメトリクスの収集
  async collectBusinessMetrics() {
    const db = require("../database/connection");

    // 機能利用率の計算
    const featureUsageStats = await db.query(`
      SELECT 
        feature_name,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_usage
      FROM feature_usage_log 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY feature_name
    `);

    // 各機能の利用率を記録
    for (const stat of featureUsageStats.rows) {
      // 利用率の計算ロジック
      const usageRate = await this.calculateFeatureUsageRate(stat.feature_name);
      // メトリクスとして記録（カスタムゲージを使用）
    }
  }

  // ユーザーメトリクスの収集
  async collectUserMetrics() {
    const db = require("../database/connection");

    // タスク完了率の計算
    const taskCompletionStats = await db.query(`
      SELECT 
        task_type,
        status,
        COUNT(*) as count
      FROM user_tasks 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY task_type, status
    `);

    // 完了率の計算と記録
    const completionRates = this.calculateCompletionRates(
      taskCompletionStats.rows,
    );
    // メトリクスとして記録
  }

  // データ品質スコアの計算
  async calculateDataQualityScore() {
    const db = require("../database/connection");

    // データ整合性チェック
    const integrityCheck = await db.query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN categories = '{}' THEN 1 END) as empty_categories,
        COUNT(CASE WHEN title IS NULL OR title = '' THEN 1 END) as empty_titles,
        COUNT(CASE WHEN effective_date IS NULL THEN 1 END) as null_dates
      FROM portfolio_items
    `);

    const stats = integrityCheck.rows[0];
    const totalItems = parseInt(stats.total_items);

    if (totalItems === 0) return 1.0;

    const issues =
      parseInt(stats.empty_categories) +
      parseInt(stats.empty_titles) +
      parseInt(stats.null_dates);

    return Math.max(0, 1 - issues / totalItems);
  }

  // 機能利用率の計算
  async calculateFeatureUsageRate(featureName) {
    const db = require("../database/connection");

    // 総ユーザー数
    const totalUsers = await db.query(`
      SELECT COUNT(DISTINCT user_id) as total 
      FROM user_sessions 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    // 機能利用ユーザー数
    const featureUsers = await db.query(
      `
      SELECT COUNT(DISTINCT user_id) as users 
      FROM feature_usage_log 
      WHERE feature_name = $1 
      AND created_at >= NOW() - INTERVAL '30 days'
    `,
      [featureName],
    );

    const total = parseInt(totalUsers.rows[0].total);
    const users = parseInt(featureUsers.rows[0].users);

    return total > 0 ? users / total : 0;
  }

  // タスク完了率の計算
  calculateCompletionRates(taskStats) {
    const rates = {};

    // タスクタイプ別にグループ化
    const groupedStats = taskStats.reduce((acc, stat) => {
      if (!acc[stat.task_type]) {
        acc[stat.task_type] = { completed: 0, total: 0 };
      }

      acc[stat.task_type].total += parseInt(stat.count);
      if (stat.status === "completed") {
        acc[stat.task_type].completed += parseInt(stat.count);
      }

      return acc;
    }, {});

    // 完了率の計算
    Object.keys(groupedStats).forEach((taskType) => {
      const stats = groupedStats[taskType];
      rates[taskType] = stats.total > 0 ? stats.completed / stats.total : 0;
    });

    return rates;
  }

  // メトリクスエクスポート用エンドポイント
  getMetricsRegistry() {
    return prometheus.register;
  }

  // ダッシュボード用データの生成
  async generateDashboardData() {
    const metrics = await prometheus.register.metrics();

    return {
      timestamp: new Date().toISOString(),
      metrics: this.parseMetricsForDashboard(metrics),
      summary: await this.generateMetricsSummary(),
    };
  }

  // メトリクスサマリーの生成
  async generateMetricsSummary() {
    const db = require("../database/connection");

    // 過去24時間のサマリー
    const summary = await db.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests,
        AVG(response_time) as avg_response_time,
        COUNT(DISTINCT user_id) as active_users
      FROM request_log 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);

    const stats = summary.rows[0];

    return {
      availability: this.calculateAvailability(),
      errorRate:
        stats.total_requests > 0
          ? (parseInt(stats.error_requests) / parseInt(stats.total_requests)) *
            100
          : 0,
      avgResponseTime: parseFloat(stats.avg_response_time) || 0,
      activeUsers: parseInt(stats.active_users) || 0,
      systemHealth: await this.calculateSystemHealth(),
    };
  }

  // 可用性の計算
  calculateAvailability() {
    // システムアップタイムから可用性を計算
    const uptime = process.uptime();
    const totalTime = 24 * 60 * 60; // 24時間

    return Math.min(100, (uptime / totalTime) * 100);
  }

  // システムヘルス総合スコアの計算
  async calculateSystemHealth() {
    const availability = this.calculateAvailability();
    const dataQuality = await this.calculateDataQualityScore();
    const errorRate = await this.getErrorRate();

    // 重み付き平均でヘルススコアを計算
    const healthScore =
      availability * 0.4 + dataQuality * 100 * 0.3 + (100 - errorRate) * 0.3;

    return Math.max(0, Math.min(100, healthScore));
  }

  async getErrorRate() {
    const db = require("../database/connection");

    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors
      FROM request_log 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
    `);

    const stats = result.rows[0];
    const total = parseInt(stats.total);
    const errors = parseInt(stats.errors);

    return total > 0 ? (errors / total) * 100 : 0;
  }
}

module.exports = new MetricsCollectionSystem();
```

### 成功指標ダッシュボード

**`dashboard/success-metrics-dashboard.html`**:

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio System - Success Metrics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .metric-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .metric-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
      }
      .metric-value {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .metric-target {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }
      .metric-trend {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
      }
      .trend-up {
        background-color: #d4edda;
        color: #155724;
      }
      .trend-down {
        background-color: #f8d7da;
        color: #721c24;
      }
      .trend-stable {
        background-color: #fff3cd;
        color: #856404;
      }
      .chart-container {
        position: relative;
        height: 200px;
        margin-top: 15px;
      }
      .status-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }
      .status-good {
        background-color: #28a745;
      }
      .status-warning {
        background-color: #ffc107;
      }
      .status-critical {
        background-color: #dc3545;
      }
    </style>
  </head>
  <body>
    <h1>Portfolio System - Success Metrics Dashboard</h1>

    <div class="dashboard">
      <!-- システム稼働指標 -->
      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-good"></span>
          システム可用性
        </div>
        <div class="metric-value" id="availability">99.95%</div>
        <div class="metric-target">目標: 99.9%以上</div>
        <div class="metric-trend trend-up">↗ 先月比 +0.05%</div>
        <div class="chart-container">
          <canvas id="availabilityChart"></canvas>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-good"></span>
          平均応答時間
        </div>
        <div class="metric-value" id="responseTime">1.2s</div>
        <div class="metric-target">目標: 3秒以内</div>
        <div class="metric-trend trend-stable">→ 先月比 変化なし</div>
        <div class="chart-container">
          <canvas id="responseTimeChart"></canvas>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-good"></span>
          エラー率
        </div>
        <div class="metric-value" id="errorRate">0.05%</div>
        <div class="metric-target">目標: 0.1%以下</div>
        <div class="metric-trend trend-down">↘ 先月比 -0.02%</div>
        <div class="chart-container">
          <canvas id="errorRateChart"></canvas>
        </div>
      </div>

      <!-- ユーザー体験指標 -->
      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-good"></span>
          ユーザー満足度
        </div>
        <div class="metric-value" id="satisfaction">4.6/5.0</div>
        <div class="metric-target">目標: 4.5/5.0以上</div>
        <div class="metric-trend trend-up">↗ 先月比 +0.2</div>
        <div class="chart-container">
          <canvas id="satisfactionChart"></canvas>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-good"></span>
          複数カテゴリー利用率
        </div>
        <div class="metric-value" id="multiCategoryUsage">68%</div>
        <div class="metric-target">目標: 60%以上</div>
        <div class="metric-trend trend-up">↗ 先月比 +8%</div>
        <div class="chart-container">
          <canvas id="featureUsageChart"></canvas>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-good"></span>
          タスク完了率
        </div>
        <div class="metric-value" id="taskCompletion">96%</div>
        <div class="metric-target">目標: 95%以上</div>
        <div class="metric-trend trend-stable">→ 先月比 +1%</div>
        <div class="chart-container">
          <canvas id="taskCompletionChart"></canvas>
        </div>
      </div>

      <!-- ビジネス指標 -->
      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-good"></span>
          コンテンツ作成時間短縮
        </div>
        <div class="metric-value" id="timeReduction">35%</div>
        <div class="metric-target">目標: 30%短縮</div>
        <div class="metric-trend trend-up">↗ 先月比 +5%</div>
        <div class="chart-container">
          <canvas id="productivityChart"></canvas>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-good"></span>
          データ品質スコア
        </div>
        <div class="metric-value" id="dataQuality">98.5%</div>
        <div class="metric-target">目標: 95%以上</div>
        <div class="metric-trend trend-stable">→ 先月比 変化なし</div>
        <div class="chart-container">
          <canvas id="dataQualityChart"></canvas>
        </div>
      </div>

      <!-- サポート指標 -->
      <div class="metric-card">
        <div class="metric-title">
          <span class="status-indicator status-warning"></span>
          平均応答時間（サポート）
        </div>
        <div class="metric-value" id="supportResponse">1.5h</div>
        <div class="metric-target">目標: 1時間以内</div>
        <div class="metric-trend trend-down">↘ 先月比 +0.2h</div>
        <div class="chart-container">
          <canvas id="supportResponseChart"></canvas>
        </div>
      </div>
    </div>

    <script>
      // ダッシュボードの初期化
      class SuccessMetricsDashboard {
        constructor() {
          this.charts = {};
          this.initializeCharts();
          this.startRealTimeUpdates();
        }

        initializeCharts() {
          // 可用性チャート
          this.charts.availability = new Chart(
            document.getElementById("availabilityChart"),
            {
              type: "line",
              data: {
                labels: this.getLast7Days(),
                datasets: [
                  {
                    label: "可用性 (%)",
                    data: [99.9, 99.95, 99.92, 99.98, 99.96, 99.94, 99.95],
                    borderColor: "#28a745",
                    backgroundColor: "rgba(40, 167, 69, 0.1)",
                    tension: 0.4,
                  },
                ],
              },
              options: this.getChartOptions("可用性 (%)", 99, 100),
            },
          );

          // 応答時間チャート
          this.charts.responseTime = new Chart(
            document.getElementById("responseTimeChart"),
            {
              type: "line",
              data: {
                labels: this.getLast7Days(),
                datasets: [
                  {
                    label: "応答時間 (秒)",
                    data: [1.1, 1.3, 1.0, 1.2, 1.4, 1.1, 1.2],
                    borderColor: "#007bff",
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                    tension: 0.4,
                  },
                ],
              },
              options: this.getChartOptions("応答時間 (秒)", 0, 3),
            },
          );

          // その他のチャートも同様に初期化...
        }

        getLast7Days() {
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(
              date.toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
              }),
            );
          }
          return days;
        }

        getChartOptions(label, min, max) {
          return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: false,
                min: min,
                max: max,
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          };
        }

        async updateMetrics() {
          try {
            const response = await fetch("/api/metrics/dashboard");
            const data = await response.json();

            // メトリクス値の更新
            this.updateMetricValue("availability", data.availability + "%");
            this.updateMetricValue("responseTime", data.avgResponseTime + "s");
            this.updateMetricValue("errorRate", data.errorRate + "%");
            this.updateMetricValue("satisfaction", data.satisfaction + "/5.0");

            // チャートデータの更新
            this.updateChartData(data);
          } catch (error) {
            console.error("Failed to update metrics:", error);
          }
        }

        updateMetricValue(elementId, value) {
          const element = document.getElementById(elementId);
          if (element) {
            element.textContent = value;
          }
        }

        updateChartData(data) {
          // 各チャートのデータを更新
          Object.keys(this.charts).forEach((chartKey) => {
            if (data[chartKey] && this.charts[chartKey]) {
              const chart = this.charts[chartKey];
              chart.data.datasets[0].data = data[chartKey];
              chart.update();
            }
          });
        }

        startRealTimeUpdates() {
          // 5分間隔でメトリクスを更新
          setInterval(
            () => {
              this.updateMetrics();
            },
            5 * 60 * 1000,
          );

          // 初回更新
          this.updateMetrics();
        }
      }

      // ダッシュボードの開始
      document.addEventListener("DOMContentLoaded", () => {
        new SuccessMetricsDashboard();
      });
    </script>
  </body>
</html>
```

---

## リリース実行チェックリスト

### 最終リリース前チェックリスト

**`deployment/final-release-checklist.md`**:

```markdown
# 最終リリース前チェックリスト

## 技術的準備

### システム準備

- [ ] 本番環境の最終動作確認完了
- [ ] データベース移行スクリプトのテスト完了
- [ ] バックアップシステムの動作確認完了
- [ ] 監視システムの設定完了
- [ ] アラート設定の動作確認完了
- [ ] SSL証明書の有効性確認完了
- [ ] CDN設定の確認完了
- [ ] ファイアウォール設定の確認完了

### パフォーマンス確認

- [ ] 負荷テストの実行・合格
- [ ] レスポンス時間の基準クリア
- [ ] メモリ使用量の確認
- [ ] CPU使用率の確認
- [ ] データベース性能の確認
- [ ] キャッシュシステムの動作確認

### セキュリティ確認

- [ ] 脆弱性スキャンの実行・合格
- [ ] セキュリティヘッダーの設定確認
- [ ] 認証・認可機能の確認
- [ ] ファイルアップロードセキュリティの確認
- [ ] XSS・SQLインジェクション対策の確認

## 運用準備

### サポート体制

- [ ] サポートチームの準備完了
- [ ] エスカレーション手順の確認
- [ ] ナレッジベースの更新完了
- [ ] サポートツールの動作確認
- [ ] 緊急連絡体制の確認

### 監視・アラート

- [ ] 監視ダッシュボードの設定完了
- [ ] アラート通知の設定完了
- [ ] ログ収集システムの動作確認
- [ ] メトリクス収集の動作確認
- [ ] 異常検知システムの動作確認

### バックアップ・復旧

- [ ] 自動バックアップの動作確認
- [ ] 手動バックアップ手順の確認
- [ ] 復旧手順のテスト完了
- [ ] ロールバック手順のテスト完了
- [ ] データ整合性チェックの確認

## ユーザー準備

### 通知・コミュニケーション

- [ ] 事前通知メールの送信完了
- [ ] システム内通知の設定完了
- [ ] ドキュメントの更新完了
- [ ] FAQ の更新完了
- [ ] リリースノートの準備完了

### トレーニング・サポート

- [ ] ユーザートレーニングの実施完了
- [ ] 操作マニュアルの配布完了
- [ ] 動画チュートリアルの公開完了
- [ ] サポート窓口の準備完了
- [ ] よくある質問の準備完了

## ビジネス準備

### 承認・確認

- [ ] ステークホルダーの最終承認取得
- [ ] リリース責任者の確認完了
- [ ] 緊急時連絡先の確認完了
- [ ] 意思決定権限の確認完了
- [ ] リスク評価の最終確認完了

### 成功指標

- [ ] KPI測定システムの準備完了
- [ ] ベースライン値の記録完了
- [ ] 目標値の最終確認完了
- [ ] 測定方法の確認完了
- [ ] レポート体制の準備完了

## リリース当日準備

### 実行体制

- [ ] リリース実行チームの招集完了
- [ ] 各担当者の役割確認完了
- [ ] 緊急時対応チームの待機確認
- [ ] コミュニケーションチャネルの確認
- [ ] 実行スケジュールの最終確認

### 実行環境

- [ ] 実行環境の最終確認
- [ ] 必要なツール・アクセス権の確認
- [ ] ネットワーク環境の確認
- [ ] 作業場所・設備の確認
- [ ] 緊急時連絡手段の確認

## 最終確認

### Go/No-Go判定

- [ ] 技術的準備の完了確認
- [ ] 運用準備の完了確認
- [ ] ユーザー準備の完了確認
- [ ] ビジネス準備の完了確認
- [ ] リスク評価の最終確認

### 最終承認

- [ ] プロジェクトマネージャーの承認
- [ ] 技術責任者の承認
- [ ] 運用責任者の承認
- [ ] ビジネス責任者の承認
- [ ] 最終意思決定者の承認

## リリース実行

### 実行手順

1. [ ] メンテナンス通知の表示
2. [ ] システムの停止
3. [ ] データベース移行の実行
4. [ ] アプリケーションのデプロイ
5. [ ] 設定ファイルの更新
6. [ ] システムの起動
7. [ ] 動作確認の実行
8. [ ] メンテナンス通知の解除

### 確認項目

- [ ] システムの正常起動確認
- [ ] 基本機能の動作確認
- [ ] 新機能の動作確認
- [ ] パフォーマンスの確認
- [ ] エラーログの確認

## リリース後対応

### 即座の対応

- [ ] システム監視の強化
- [ ] ユーザーサポートの準備
- [ ] 問題報告の受付開始
- [ ] メトリクス収集の開始
- [ ] フィードバック収集の開始

### 継続的対応

- [ ] 日次レポートの作成
- [ ] 週次レビューの実施
- [ ] 月次評価の実施
- [ ] 改善計画の策定
- [ ] 次期リリースの計画開始

---

このチェックリストを完了することで、安全で成功率の高いリリースが実現できます。
```

<function_calls>
<invoke name="strReplace">
<parameter name="oldStr">- [-] 12.3 リリース・展開準備
