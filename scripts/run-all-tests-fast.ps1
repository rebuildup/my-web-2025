# 高速テスト実行スクリプト (PowerShell) - 並列実行最適化版
# samuido website - 高速品質チェック
# 
# 最適化された実行順序:
# 1. TypeScript (型チェック) → 2. ESLint (リント) → 3. Build (ビルド)
# 4. Jest (単体テスト) → 5. Playwright (E2E - 並列実行)

Write-Host "=== samuido Website - Fast Tests Start ===" -ForegroundColor Green
Write-Host "Execution Time: $(Get-Date)" -ForegroundColor Gray
Write-Host "Optimized for speed with parallel execution" -ForegroundColor Gray
Write-Host ""

$ErrorActionPreference = "Continue"
$testResults = @()

# テスト実行時の環境変数設定
$env:NODE_ENV = "test"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:CI = "true"

# 1. TypeScript Type Check (最も重要なチェック)
Write-Host "1. TypeScript Type Check Running..." -ForegroundColor Yellow
try {
    $typeCheckOutput = npm run type-check --silent 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "TypeScript Error Details:" -ForegroundColor Red
        Write-Host $typeCheckOutput -ForegroundColor Red
        throw "TypeScript type check failed"
    }
    $testResults += "TypeScript: PASS"
    Write-Host "TypeScript: PASS" -ForegroundColor Green
} catch {
    $testResults += "TypeScript: FAIL"
    Write-Host "TypeScript: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. ESLint Check (コード品質チェック)
Write-Host "2. ESLint Check Running..." -ForegroundColor Yellow
try {
    $eslintOutput = npm run lint --silent 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ESLint Error Details:" -ForegroundColor Red
        Write-Host $eslintOutput -ForegroundColor Red
        throw "ESLint check failed"
    }
    $testResults += "ESLint: PASS"
    Write-Host "ESLint: PASS" -ForegroundColor Green
} catch {
    $testResults += "ESLint: FAIL"
    Write-Host "ESLint: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Build Test (ビルドテスト)
Write-Host "3. Build Test Running..." -ForegroundColor Yellow
try {
    npm run build --silent | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build Error Details:" -ForegroundColor Red
        npm run build
        throw "Build failed"
    }
    $testResults += "Build: PASS"
    Write-Host "Build: PASS" -ForegroundColor Green
} catch {
    $testResults += "Build: FAIL"
    Write-Host "Build: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Jest Unit Tests (単体テスト)
Write-Host "4. Jest Unit Tests Running..." -ForegroundColor Yellow
try {
    $jestOutput = npm run test --silent 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Jest Error Details:" -ForegroundColor Red
        Write-Host $jestOutput -ForegroundColor Red
        throw "Jest tests failed"
    }
    $testResults += "Jest Tests: PASS"
    Write-Host "Jest Tests: PASS" -ForegroundColor Green
} catch {
    $testResults += "Jest Tests: FAIL"
    Write-Host "Jest Tests: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Playwright E2E Tests (高速並列実行)
Write-Host "5. Playwright E2E Tests Running (Fast Mode)..." -ForegroundColor Yellow
Write-Host "   Using maximum parallel workers for fastest execution..." -ForegroundColor Gray
try {
    # 最大並列実行で高速化
    $playwrightOutput = npm run test:e2e:parallel --silent 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Playwright Error Details:" -ForegroundColor Red
        Write-Host $playwrightOutput -ForegroundColor Red
        throw "Playwright E2E tests failed"
    }
    $testResults += "Playwright E2E (Fast): PASS"
    Write-Host "Playwright E2E (Fast): PASS" -ForegroundColor Green
} catch {
    $testResults += "Playwright E2E (Fast): FAIL"
    Write-Host "Playwright E2E (Fast): FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Results Summary
Write-Host "=== Fast Test Results Summary ===" -ForegroundColor Green
foreach ($result in $testResults) {
    Write-Host $result
}
Write-Host ""
Write-Host "All fast tests completed successfully!" -ForegroundColor Green
Write-Host "Completion Time: $(Get-Date)" -ForegroundColor Gray
Write-Host "=== samuido Website - Fast Tests Completed ===" -ForegroundColor Green