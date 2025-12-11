# デプロイ手順書

> **目的**: GitHub Actionsで自動デプロイするための完全な手順書  
> **対象**: GCP/Linux VM (Ubuntu 22.04以上) に Next.js アプリケーションをデプロイ

---

## 📋 目次

1. [アーキテクチャ概要](#1-アーキテクチャ概要)
2. [初回セットアップ（VM構築時のみ）](#2-初回セットアップvm構築時のみ)
3. [GitHub Secrets設定](#3-github-secrets設定)
4. [デプロイ実行](#4-デプロイ実行)
5. [nginx設定（必須）](#5-nginx設定必須)
6. [HTTPS化（Let's Encrypt）](#6-https化lets-encrypt)
7. [動作確認](#7-動作確認)
8. [トラブルシューティング](#8-トラブルシューティング)

---

## 1. アーキテクチャ概要

### 構成要素
- **アプリケーション**: Next.js 16 (standalone mode)
- **ランタイム**: Node.js 20
- **パッケージマネージャー**: pnpm 10
- **プロセス管理**: PM2 (systemd自動起動)
- **リバースプロキシ**: nginx
- **データベース**: SQLite (better-sqlite3)

### デプロイフロー
1. GitHub Actionsでビルド・テスト
2. `deployment-standalone.tar.gz`を生成
3. SSH経由でVMに転送
4. PM2でアプリケーション起動
5. nginxでリバースプロキシ設定

---

## 2. 初回セットアップ（VM構築時のみ）

### 2.1 システム更新と基本ツール

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install build-essential python3 git curl unzip ca-certificates fail2ban ufw
```

**期待される出力:**
```
Reading package lists... Done
Building dependency tree... Done
...
Setting up build-essential (12.9ubuntu3) ...
Setting up python3 (3.10.12-1~22.04) ...
...
```

### 2.2 デプロイユーザー作成

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

**期待される出力:**
```
Adding user `deploy' ...
Adding new user `deploy' (1001) with group `deploy' ...
...
```

### 2.3 SSH鍵登録

```bash
sudo -iu deploy
mkdir -p ~/.ssh && chmod 700 ~/.ssh
# ここでローカルの公開鍵（gcp_deploy.pub）の内容を貼り付け
cat >> ~/.ssh/authorized_keys
# Ctrl+Dで終了
chmod 600 ~/.ssh/authorized_keys
```

**確認コマンド:**
```bash
cat ~/.ssh/authorized_keys
```

**期待される出力:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... deploy@my-web-2025
```

### 2.4 ファイアウォール設定

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

**期待される出力:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
80/tcp (v6)                ALLOW       Anywhere (v6)
443/tcp (v6)               ALLOW       Anywhere (v6)
```

### 2.5 Node.js / pnpm / PM2 インストール

```bash
# deployユーザーで実行
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20
nvm alias default 20
```

**期待される出力:**
```
Downloading and installing node v20.x.x...
...
Now using node v20.x.x (npm v10.x.x)
```

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
pnpm setup
```

**期待される出力:**
```
✔ pnpm was installed successfully to ~/.local/share/pnpm/pnpm
...
```

```bash
pnpm add -g pm2
```

**期待される出力:**
```
Packages: +1
...
Done in 2.3s
```

**動作確認:**
```bash
node --version
pnpm --version
pm2 --version
```

**期待される出力:**
```
v20.x.x
10.x.x
5.x.x
```

### 2.6 ディレクトリ準備

```bash
sudo mkdir -p /var/www/yusuke-kim
sudo chown deploy:deploy /var/www/yusuke-kim
```

**確認:**
```bash
ls -ld /var/www/yusuke-kim
```

**期待される出力:**
```
drwxr-xr-x 2 deploy deploy 4096 Dec 11 00:00 /var/www/yusuke-kim
```

---

## 3. GitHub Secrets設定

### 3.1 SSH鍵の生成（ローカルPC）

**PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.ssh | Out-Null
ssh-keygen -t ed25519 -C "deploy@my-web-2025" -f $env:USERPROFILE\.ssh\gcp_deploy -N "" -q
```

**期待される出力:**
```
（出力なし - 正常に完了）
```

**確認:**
```powershell
Get-Content $env:USERPROFILE\.ssh\gcp_deploy.pub
```

**期待される出力:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... deploy@my-web-2025
```

### 3.2 GitHub Secrets登録

GitHubリポジトリの Settings → Secrets and variables → Actions で以下を登録:

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `GCP_SSH_KEY` | `~/.ssh/gcp_deploy` の**全文**（秘密鍵） | SSH接続用 |
| `GCP_HOST` | `34.146.209.224` | VMのIPアドレス |
| `GCP_USER` | `deploy` | SSH接続ユーザー名 |
| `RESEND_API_KEY` | （APIキー） | メール送信用（任意） |
| `RECAPTCHA_SECRET_KEY` | （シークレットキー） | reCAPTCHA用（任意） |
| `NEXT_PUBLIC_SITE_URL` | `https://yusuke-kim.com` | サイトURL（必須） |

**重要**: `GCP_SSH_KEY`は秘密鍵の**全文**（`-----BEGIN OPENSSH PRIVATE KEY-----`から`-----END OPENSSH PRIVATE KEY-----`まで）をコピーしてください。

---

## 4. デプロイ実行

### 4.1 自動デプロイ（推奨）

1. GitHubリポジトリの Actions タブを開く
2. 「Safe Build and Deploy」ワークフローを選択
3. 「Run workflow」をクリック
4. ブランチを選択（通常は `master`）
5. 「Run workflow」ボタンをクリック

**成功時の表示:**
- ✅ すべてのジョブが緑色のチェックマーク
- 「Deploy standalone application」ステップで「✅ Application is running」が表示される

### 4.2 デプロイ確認

**SSH経由で確認:**
```bash
ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "pm2 status"
```

**期待される出力:**
```
┌─────┬──────────────┬─────────┬─────────┬──────────┬─────────┐
│ id  │ name         │ mode    │ ↺       │ status   │ cpu     │
├─────┼──────────────┼─────────┼─────────┼──────────┼─────────┤
│ 0   │ yusuke-kim   │ cluster │ 0       │ online   │ 0%      │
└─────┴──────────────┴─────────┴─────────┴──────────┴─────────┘
```

**ローカルでの動作確認:**
```bash
ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "curl -s http://localhost:3000/api/health | jq ."
```

**期待される出力:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T00:00:00.000Z",
  "version": "2.1.1",
  "environment": "production"
}
```

---

## 5. nginx設定（必須）

**重要**: この手順はデプロイ後、外部からアクセスできるようにするために**必須**です。

### 5.1 nginxインストール

```bash
sudo apt update
sudo apt install -y nginx
```

**期待される出力:**
```
Reading package lists... Done
...
Setting up nginx (1.18.0-6ubuntu14.4) ...
...
```

**起動確認:**
```bash
sudo systemctl status nginx
```

**期待される出力:**
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

### 5.2 nginx設定ファイル作成

```bash
sudo tee /etc/nginx/sites-available/yusuke-kim > /dev/null << 'EOF'
server {
    listen 80;
    server_name yusuke-kim.com _;
    
    access_log /var/log/nginx/yusuke-kim-access.log;
    error_log /var/log/nginx/yusuke-kim-error.log;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /api/health {
        proxy_pass http://127.0.0.1:3000/api/health;
        access_log off;
    }
}
EOF
```

**期待される出力:**
```
（出力なし - 正常に完了）
```

### 5.3 設定を有効化

```bash
sudo ln -sf /etc/nginx/sites-available/yusuke-kim /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

**確認:**
```bash
ls -la /etc/nginx/sites-enabled/
```

**期待される出力:**
```
lrwxrwxrwx 1 root root 40 Dec 11 00:00 yusuke-kim -> /etc/nginx/sites-available/yusuke-kim
```

### 5.4 設定テストとリロード

```bash
sudo nginx -t
```

**期待される出力:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

```bash
sudo systemctl reload nginx
```

**期待される出力:**
```
（出力なし - 正常に完了）
```

### 5.5 動作確認

**ローカル確認:**
```bash
curl -I http://localhost/
```

**期待される出力:**
```
HTTP/1.1 200 OK
Server: nginx/1.18.0
Date: ...
Content-Type: text/html; charset=utf-8
...
```

**外部確認（IPアドレスでアクセス）:**
```bash
curl -I http://34.146.209.224/
```

**期待される出力:**
```
HTTP/1.1 200 OK
Server: nginx/1.18.0
...
```

---

## 6. HTTPS化（Let's Encrypt）

### 6.1 前提条件

- ドメイン名が設定されていること（IPアドレスのみでは不可）
- DNSのAレコードがサーバーのIPアドレスを指していること
- ポート80と443が外部からアクセス可能であること

### 6.2 certbotインストール

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

**期待される出力:**
```
Setting up certbot (0.40.0-1ubuntu0.1) ...
Setting up python3-certbot-nginx (0.40.0-1ubuntu0.1) ...
```

### 6.3 証明書取得

```bash
sudo certbot --nginx -d yusuke-kim.com
```

**対話的な入力:**
```
Enter email address (used for urgent renewal and security notices) (Enter 'c' to cancel): your-email@example.com
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.3-September-21-2022.pdf. You must
agree in order to register with the ACME server at
https://acme-v02.api.letsencrypt.org/directory
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(A)gree/(C)ancel: A

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing, once your first certificate is successfully issued, to
share your email address with the Electronic Frontier Foundation, a founding
partner of the Let's Encrypt project, is the United States? (Y/N): N

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you like to redirect HTTP traffic to HTTPS? (Y/n): Y
```

**成功時の出力:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yusuke-kim.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/yusuke-kim.com/privkey.pem
This certificate expires on 2026-03-11.
These files will be updated automatically in the background.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Redirecting all traffic on port 80 to port 443 in /etc/nginx/sites-enabled/yusuke-kim

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations! You have successfully enabled https://yusuke-kim.com
```

### 6.4 自動更新確認

```bash
sudo certbot renew --dry-run
```

**期待される出力:**
```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
The dry run was successful.
```

---

## 7. 動作確認

### 7.1 アプリケーション状態確認

```bash
ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "pm2 status"
```

**期待される出力:**
```
┌─────┬──────────────┬─────────┬─────────┬──────────┬─────────┐
│ id  │ name         │ mode    │ ↺       │ status   │ cpu     │
├─────┼──────────────┼─────────┼─────────┼──────────┼─────────┤
│ 0   │ yusuke-kim   │ cluster │ 0       │ online   │ 0%      │
└─────┴──────────────┴─────────┴─────────┴──────────┴─────────┘
```

### 7.2 ヘルスチェック

**ローカル:**
```bash
ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "curl -s http://localhost:3000/api/health"
```

**期待される出力:**
```json
{"status":"ok","timestamp":"2025-12-11T00:00:00.000Z","version":"2.1.1","environment":"production"}
```

**外部（HTTP）:**
```bash
curl -I http://yusuke-kim.com/
```

**期待される出力:**
```
HTTP/1.1 301 Moved Permanently
Server: nginx/1.18.0
Location: https://yusuke-kim.com/
```

**外部（HTTPS）:**
```bash
curl -I https://yusuke-kim.com/
```

**期待される出力:**
```
HTTP/1.1 200 OK
Server: nginx/1.18.0
...
```

### 7.3 ブラウザでの確認

ブラウザで `https://yusuke-kim.com` にアクセスして、サイトが正常に表示されることを確認してください。

---

## 8. トラブルシューティング

### 8.1 外部からアクセスできない

**確認手順:**

1. **PM2の状態確認**
   ```bash
   ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "pm2 status"
   ```
   - `status` が `online` であることを確認

2. **ローカルでの動作確認**
   ```bash
   ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "curl -I http://localhost:3000/"
   ```
   - HTTP 200が返ることを確認

3. **nginxの状態確認**
   ```bash
   ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "sudo systemctl status nginx"
   ```
   - `Active: active (running)` であることを確認

4. **nginx設定確認**
   ```bash
   ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "sudo nginx -t"
   ```
   - `syntax is ok` と `test is successful` が表示されることを確認

5. **ファイアウォール確認**
   ```bash
   ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "sudo ufw status"
   ```
   - ポート80と443が `ALLOW` になっていることを確認

6. **GCPファイアウォール確認**
   - GCP Console → VPC network → Firewall rules
   - `default-allow-http` (ポート80) と `default-allow-https` (ポート443) が存在することを確認

### 8.2 PM2が起動しない

**ログ確認:**
```bash
ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "pm2 logs yusuke-kim --lines 50"
```

**再起動:**
```bash
ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "cd /var/www/yusuke-kim && pm2 restart yusuke-kim"
```

### 8.3 nginxエラー

**エラーログ確認:**
```bash
ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "sudo tail -f /var/log/nginx/yusuke-kim-error.log"
```

**設定ファイル確認:**
```bash
ssh -i ~/.ssh/gcp_deploy deploy@34.146.209.224 "sudo cat /etc/nginx/sites-available/yusuke-kim"
```

### 8.4 証明書取得失敗

**DNS確認:**
```bash
nslookup yusuke-kim.com
```

**期待される出力:**
```
Name:   yusuke-kim.com
Address: 34.146.209.224
```

**手動で証明書取得を再試行:**
```bash
sudo certbot --nginx -d yusuke-kim.com --force-renewal
```

### 8.5 よくあるエラーと解決方法

| エラー | 原因 | 解決方法 |
|--------|------|----------|
| `502 Bad Gateway` | PM2が起動していない | `pm2 restart yusuke-kim` |
| `Connection refused` | ポートが開いていない | ファイアウォール設定を確認 |
| `nginx: command not found` | nginxがインストールされていない | セクション5.1を実行 |
| `certbot: command not found` | certbotがインストールされていない | セクション6.2を実行 |

---

## 📝 チェックリスト

### 初回セットアップ
- [ ] システム更新と基本ツールインストール
- [ ] デプロイユーザー作成
- [ ] SSH鍵登録
- [ ] ファイアウォール設定
- [ ] Node.js / pnpm / PM2 インストール
- [ ] ディレクトリ準備

### GitHub設定
- [ ] SSH鍵生成
- [ ] GitHub Secrets登録（GCP_SSH_KEY, GCP_HOST, GCP_USER, NEXT_PUBLIC_SITE_URL）

### デプロイ後
- [ ] nginxインストール
- [ ] nginx設定ファイル作成
- [ ] nginx設定有効化
- [ ] nginx動作確認
- [ ] 外部アクセステスト

### HTTPS化（任意）
- [ ] DNS設定確認
- [ ] certbotインストール
- [ ] 証明書取得
- [ ] 自動更新確認

---

## 🔄 更新履歴

- 2025-12-11: 初版作成。nginx設定を必須手順として追加。各コマンドの期待される出力を追記。
