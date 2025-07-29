# 通常のNext.js本番環境用スタートアップスクリプト
Write-Host "=== Next.js 本番サーバー起動 ===" -ForegroundColor Green

# 環境変数を設定
$env:NODE_ENV = "production"
$env:NEXT_PUBLIC_BASE_URL = "http://localhost:3000"

Write-Host "環境変数設定:" -ForegroundColor Yellow
Write-Host "  NODE_ENV: $env:NODE_ENV" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_BASE_URL: $env:NEXT_PUBLIC_BASE_URL" -ForegroundColor Cyan

Write-Host "`n通常のNext.js本番サーバーを起動中..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:3000" -ForegroundColor Green
Write-Host "停止するには Ctrl+C を押してください`n" -ForegroundColor Yellow

# 通常のNext.js本番サーバー起動
next start