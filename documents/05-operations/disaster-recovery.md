# 災害復旧・事業継続計画

## 概要

このドキュメントでは、個人 Web サイトの災害復旧と事業継続に関する計画をまとめています。

## バックアップ戦略

### データバックアップ

#### 基本設定

- **頻度**: 日次バックアップ
- **保持期間**: 30 日間
- **自動化**: 毎日 2 時実行（`0 2 * * *`）

#### バックアップ対象

```bash
# 主要バックアップディレクトリ
BACKUP_TARGETS=(
  "/var/www/html"      # Webサイトファイル
  "/var/www/data"      # データベース・JSONファイル
  "/etc/apache2"       # Apache設定
  "/etc/letsencrypt"   # SSL証明書
  "/var/log"           # ログファイル
)
```

#### 保存場所

1. **ローカルバックアップ**: `/backup/local/`
2. **クラウドストレージ**: Google Cloud Storage
3. **外部ドライブ**: 週次で物理メディアに保存

### コードバックアップ

#### Git リポジトリ管理

- **メインリポジトリ**: GitHub
- **ミラーリポジトリ**:
  - GitLab（セカンダリ）
  - Bitbucket（バックアップ）
  - ローカル Git サーバー

#### 自動同期

```typescript
// GitHub Actions での自動同期設定
const syncConfig = {
  trigger: "on-push", // プッシュ時自動同期
  verification: true, // 同期検証
  conflictResolution: "manual", // 競合は手動解決
  destinations: ["gitlab", "bitbucket", "local"],
};
```

## 復旧手順

### 緊急復旧（RTO: 1 時間以内）

#### 手順

1. **被害状況の確認**

   - サイトアクセス可否の確認
   - サーバー状況の診断
   - 影響範囲の特定

2. **静的サイトの緊急公開**

   ```bash
   # GitHub Pagesでの緊急サイト公開
   git push origin gh-pages
   # DNS切り替え（緊急時）
   # yusuke-kim.com → rebuildup.github.io/my-web-2025
   ```

3. **DNS の切り替え**

   - 緊急用 URL へのリダイレクト
   - ユーザーへの影響最小化

4. **基本機能の復旧確認**

   - ページ表示確認
   - 基本情報の掲載確認

5. **ユーザーへの状況報告**
   - X での状況告知
   - サイト上での告知表示

#### 緊急用静的サイト

```typescript
// 緊急時フォールバック設定
const emergencyConfig = {
  platform: "GitHub Pages",
  url: "https://rebuildup.github.io/my-web-2025",
  content: "基本的なポートフォリオ情報",
  automation: "GitHub Actions による自動更新",
  features: [
    "プロフィール情報",
    "主要作品リスト",
    "連絡先情報",
    "復旧状況の告知",
  ],
};
```

### 完全復旧（RPO: 24 時間以内）

#### 手順

1. **新しいサーバーの準備**

   - GCP インスタンスの作成
   - 基本的なセキュリティ設定

2. **OS とミドルウェアのインストール**

   ```bash
   # 必要なソフトウェアのインストール
   sudo apt update && sudo apt upgrade -y
   sudo apt install apache2 nodejs npm certbot -y
   ```

3. **バックアップからのデータ復元**

   ```bash
   # データ復元スクリプト
   ./scripts/restore-from-backup.sh --date=latest
   ```

4. **Apache・SSL 設定の復元**

   - 設定ファイルの復元
   - SSL 証明書の再設定
   - バーチャルホストの設定

5. **DNS 設定の更新**

   - 新サーバー IP アドレスへの切り替え
   - TTL 調整による高速切り替え

6. **全機能のテスト**

   - 全ページの動作確認
   - フォーム機能のテスト
   - ツール類の動作確認

7. **本格運用の再開**
   - 監視システムの再開
   - バックアップスケジュールの再設定

#### 復旧時間目標

```typescript
const recoveryTargets = {
  rto: "24 hours", // 復旧時間目標
  rpo: "24 hours", // 復旧ポイント目標
  availability: "99.5%", // 年間可用性目標
};
```

## 障害対応

### 障害レベル定義

#### Critical（重大）

- **内容**: サイト全体が利用不可
- **対応時間**: 15 分以内
- **エスカレーション**: 即座

#### High（高）

- **内容**: 主要機能に影響
- **対応時間**: 1 時間以内
- **エスカレーション**: 2 時間後

#### Medium（中）

- **内容**: 一部機能に影響
- **対応時間**: 4 時間以内
- **エスカレーション**: 8 時間後

#### Low（低）

- **内容**: 軽微な問題
- **対応時間**: 24 時間以内
- **エスカレーション**: 72 時間後

### 対応手順

1. **障害の検知・報告**
2. **初期調査・影響範囲の確認**
3. **応急処置の実施**
4. **利害関係者への報告**
5. **根本原因の調査**
6. **恒久対策の実施**
7. **事後レビュー・改善**

## 通信計画

### 内部連絡

- **メイン**: メール
- **サブ**: SMS
- **緊急**: 電話

### 外部連絡

#### ユーザー向け

- Web サイト上でのお知らせ
- X（Twitter）での状況報告
- 必要に応じてメールでの個別連絡

#### パートナー向け

- GCP サポート
- ドメイン管理会社
- SSL 証明書提供者

### 通知テンプレート

#### 障害発生通知

```
現在、技術的な問題により一部サービスがご利用いただけません。
復旧作業を行っており、詳細は追ってお知らせいたします。
ご不便をおかけして申し訳ございません。
```

#### 復旧完了通知

```
サービスが正常に復旧いたしました。
ご不便をおかけして申し訳ございませんでした。
```

#### 定期メンテナンス

```
定期メンテナンスのため、下記時間帯はサービスを停止いたします。
[日時]
[予定作業内容]
```

## 監視とアラート

### ヘルスチェック

```typescript
const healthChecks = [
  {
    name: "Website Availability",
    url: "https://yusuke-kim.com/health",
    interval: 60, // 1分間隔
    timeout: 10, // 10秒タイムアウト
    retries: 3, // 3回リトライ
  },
  {
    name: "API Endpoints",
    url: "https://yusuke-kim.com/api/health",
    interval: 300, // 5分間隔
    timeout: 30, // 30秒タイムアウト
    retries: 2, // 2回リトライ
  },
];
```

### 自動復旧

#### Apache 再起動

```bash
# 条件: HTTP 5xx エラーが10回以上
# アクション: Apache再起動
# クールダウン: 5分間

if [ "$ERROR_5XX_COUNT" -gt 10 ]; then
  sudo systemctl restart apache2
  sleep 300  # 5分間のクールダウン
fi
```

#### SSL 証明書更新

```bash
# 条件: SSL証明書の有効期限が30日以内
# アクション: 証明書の自動更新
# スケジュール: 週次実行

if [ "$SSL_DAYS_REMAINING" -lt 30 ]; then
  sudo certbot renew
fi
```

---

**最終更新**: 2025-01-01  
**関連ドキュメント**:

- [監視システム](./monitoring.md)
- [セキュリティ設計](./security.md)
