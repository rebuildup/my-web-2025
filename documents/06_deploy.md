# デプロイ & インフラ手順 (2025 リフレッシュ版)

> 目的: VM 再構築時に、クリーン環境で本番を安全に立ち上げ直すための決定版手順。  
> 前提: GitHub Actions でビルド、GCP/Linux VM (Ubuntu 22.04 以上) に pm2 + Node で常駐。Apache は不使用。Nginx は任意のリバースプロキシ。

---

## 1. アーキテクチャ概要
- アプリ: Next.js 16 (output: standalone), Node 20 ランタイム、pnpm 10。  
- プロセス管理: pm2 (systemd による自動起動)。  
- ビルド成果物: `.next/standalone` + `.next/static` + `public/` + `data/`.  
- データ: `data/contents/*.db` をビルド後に `scripts/copy-content-data.js` で `.next/standalone/data` へ複製。DB サーバーは不要。  
- CD: `.github/workflows/deploy.yml` の `deploy` ジョブが `deployment-standalone.tar.gz` を生成し、SSH 経由で VM へ配布。  
- 監視: `/api/health`（アプリ内）、pm2 ステータス、クラウドメトリクス。

---

## 2. クリーン VM セットアップ (from zero)

### 2.0 マシンスペック（最安・必要十分）
- **最小で動かすなら**: 2 vCPU / 2 GB RAM / 20 GB SSD  
  - pnpm install + better-sqlite3 ビルドでメモリが逼迫するため、**2GB なら swap 2GB 以上を必ず有効化**。  
  - ディスク目安: `node_modules` 約 1.3 GB、`.next` ビルド後 ~1.5 GB、`data/` 数百 MB、ログ少量 → 20 GB で足りるが、余裕を見るなら 30 GB。  
- **推奨（安定）**: 2 vCPU / 4 GB RAM / 30 GB SSD。swap なしでもビルドが安定する。

#### swap 付与例（2GB RAM 構成向け）
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo swapon -a
```

1) **OS 更新 & 基本ツール**
```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install build-essential python3 git curl unzip ca-certificates fail2ban ufw
```

2) **デプロイ用ユーザー作成**
```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
# 公開鍵を /home/deploy/.ssh/authorized_keys に登録
```

3) **SSH/Firewall ハードニング**
```bash
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl reload ssh
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 3000/tcp  # 3000 は内部確認用。公開不要なら省略
sudo ufw --force enable
```

> 以降の作業は **deploy ユーザーに切り替えて実行** する  
> `sudo -iu deploy`

4) **Node / pnpm / pm2**
```bash
# deploy ユーザーで
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20
nvm alias default 20

# pnpm 本体
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
pnpm setup          # PNPM_HOME を自動設定

# プロセスマネージャ
pnpm add -g pm2
```
トラブルシュート: `pnpm: command not found` の場合は `source ~/.bashrc` を挟んでから再実行。pm2/pnpm のパス確認は `which pnpm && which pm2` で行う。

5) **ディレクトリ準備**
```bash
sudo mkdir -p /var/www/yusuke-kim
sudo chown deploy:deploy /var/www/yusuke-kim
```

---

## 3. 環境変数・Secrets（最小セット）

| 変数 | 必須 | 用途 / 依存コード |
| ---- | ---- | ----------------- |
| `NEXT_PUBLIC_SITE_URL` | ◎ | サイト基本 URL。`lib/init/production.ts` で必須チェック。 |
| `NEXT_PUBLIC_GA_ID` | △ | GA 有効化。未設定で GA 無効。 |
| `NEXT_PUBLIC_ADOBE_FONTS_KIT_ID` | △ | Typekit (public/scripts/adobe-fonts.js)。未設定でも致命的でない。 |
| `SENTRY_DSN` | △ | エラートラッキング。有効化は optional。 |
| `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_IMAGES_CDN` | △ | 画像/CDN を使う場合のみ。 |
| `CACHE_TTL_STATIC`, `CACHE_TTL_CONTENT`, `CACHE_TTL_API` | △ | TTL 調整。デフォルトあり。 |

> ⚠️ 以前のドキュメントにあった `CONTACT_EMAIL_TO` / `DESIGN_EMAIL_TO` / `SMTP_*` は現行コードで使用していません。不要。

### GitHub Secrets (Actions 用・ダミー例付き)
| Name | 例 (ダミー) | 用途 |
| ---- | ----------- | ---- |
| `GCP_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----FAKE...` | デプロイ先へ ssh 接続する秘密鍵 |
| `GCP_HOST` | `203.0.113.10` | デプロイ先の公開IPまたはFQDN |
| `GCP_USER` | `deploy` | 接続ユーザー名 |
| `ANTHROPIC_API_KEY` | `sk-ant-api-xxxxxxxx` | `.github/workflows/claude.yml` 用 |
| `SENTRY_DSN` | `https://abc123.ingest.sentry.io/999999` | （任意）Sentry を使う場合 |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXX` | （任意）GA を使う場合 |
| `NEXT_PUBLIC_ADOBE_FONTS_KIT_ID` | `blm5pmr` | （任意）Typekit を使う場合 |
| `NEXT_PUBLIC_CDN_URL` | `https://cdn.example.com` | （任意）静的配信用 CDN |
| `NEXT_PUBLIC_IMAGES_CDN` | `https://img.example.com` | （任意）画像CDN |

> Note: `GITHUB_TOKEN` は GitHub が自動で注入するため登録不要。

#### ローカルでの SSH 鍵作成と VM 登録手順
1. **開発PCで鍵を作成**  
   - PowerShell:  
     ```powershell
     New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.ssh | Out-Null
     ssh-keygen -t ed25519 -C "deploy@my-web-2025" -f $env:USERPROFILE\.ssh\gcp_deploy
     ```
   - できるもの:  
     - 秘密鍵 `~/.ssh/gcp_deploy`（Secrets の `GCP_SSH_KEY` に貼る）  
     - 公開鍵 `~/.ssh/gcp_deploy.pub`

2. **公開鍵を VM の deploy ユーザーへ登録**（VM に一度入れる状態で）  
   ```bash
   sudo -iu deploy
   mkdir -p ~/.ssh && chmod 700 ~/.ssh
   cat >> ~/.ssh/authorized_keys   # ここでローカルの gcp_deploy.pub の1行を貼り付け、Ctrl+Dで終了
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **動作確認（ローカルから）**  
   ```bash
   ssh -i ~/.ssh/gcp_deploy deploy@<GCP_HOST>
   ```

4. **GitHub Secrets へ登録**  
   - `GCP_SSH_KEY`: `~/.ssh/gcp_deploy` の全文  
   - `GCP_HOST`: VMの外向きIP/FQDN  
   - `GCP_USER`: `deploy`

Secrets は今回のインシデントを受け**全再発行**し、古いキーは破棄してください。

---

## 4. デプロイ手順

### 4.1 CI/CD (推奨フロー)
GitHub Actions `.github/workflows/deploy.yml` が実施:
1. `pnpm install --frozen-lockfile`
2. Lint / Type-check / Jest
3. `pnpm run build`  
   - `scripts/filter-warnings.js` 経由で警告フィルタ  
   - `scripts/copy-content-data.js` で `data/` を `.next/standalone/data` へ複製
4. `.next/static` を standalone へコピー
5. `deployment-standalone.tar.gz` を生成し SSH で VM `/tmp/` へ転送
6. VM 内で展開 → pm2 再起動 → `/api/health` 等をチェック

### 4.2 手動デプロイ (緊急時)
```bash
sudo -iu deploy bash
cd /var/www/yusuke-kim
git clone https://github.com/<org>/<repo>.git .
pnpm install --frozen-lockfile
pnpm run build   # .next/standalone/server.js 生成を確認
PORT=3000 NODE_ENV=production pm2 start .next/standalone/server.js --name yusuke-kim
pm2 save
pm2 startup systemd -u deploy --hp /home/deploy   # 初回のみ、表示された sudo コマンドを実行
```

### 4.3 リバースプロキシ (任意, nginx)
```nginx
server {
  listen 80;
  server_name yusuke-kim.com;
  location / { proxy_pass http://127.0.0.1:3000; }
}
```
HTTPS は `certbot --nginx -d yusuke-kim.com` で取得。

---

## 5. ランタイム構成チェックリスト
- `.next/standalone/server.js` が存在すること  
- `.next/standalone/.next/static` に静的ファイルがコピーされていること  
- `.next/standalone/data/contents/*.db` が配置されていること  
- `pm2 status` で `yusuke-kim` が `online`  
- `curl -f http://localhost:3000/api/health` が 200

---

## 6. バックアップ & ロールバック

- **データ**: `/var/www/yusuke-kim/data` を最低日次バックアップ。  
  - 例: `tar -czf /var/backups/yusuke-kim-data-$(date +%Y%m%d).tar.gz /var/www/yusuke-kim/data`
- **リリースパッケージ**: `deployment-standalone.tar.gz` を 3 世代保持。  
- **ロールバック**:  
  1. `pm2 stop yusuke-kim`  
  2. 直近の tarball を `/var/www/yusuke-kim` に展開  
  3. `pm2 start yusuke-kim && pm2 save`

---

## 7. セキュリティ運用
- SSH 鍵のみ許可、パスワード/ルートログイン禁止。  
- UFW + fail2ban (sshd) 有効化。  
- Secrets は最低半年ごとにローテーション。今回の再発行後は Next ローテ日を記録。  
- pm2 / application ログの送信先をクラウド監視に接続する場合は、`pm2 logs --json` を syslog へフォワード。  
- サプライチェーン: `pnpm install --frozen-lockfile` を徹底し、`pnpm audit` を月次実行。

---

## 8. 運用コマンドクイックリファレンス
- プロセス確認: `pm2 status`  
- ログ閲覧: `pm2 logs yusuke-kim --lines 200`  
- リスタート: `pm2 restart yusuke-kim`  
- 再起動後に永続化: `pm2 save`  
- ビルド再実行: `pnpm run build`  
- ヘルスチェック: `curl -I http://localhost:3000/api/health`

---

## 9. 変更履歴
- 2025-12-05: インシデント対応のため全面改訂。Apache 記述を削除し、pm2/standalone 構成へ統一。未使用の環境変数とメール先設定を整理。 Secrets 全再発行を前提に手順更新。
