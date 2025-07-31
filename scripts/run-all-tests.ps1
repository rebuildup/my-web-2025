# 全テスト実行スクリプト (PowerShell) - 最適化版
# samuido website - 包括的品質チェック
# 
# 実行順序の最適化:
# 1. Prettier (コード整形) → 2. Lint-Staged (Husky同等) → 3. TypeScript (型チェック)
# 4. ESLint (リント) → 5. Build (ビルド) → 6. Jest (単体テスト) 
# 7. Playwright (E2E) → 8. Lighthouse (パフォーマンス)

Write-Host "=== samuido Website - All Tests Start ===" -ForegroundColor Green
Write-Host "Execution Time: $(Get-Date)" -ForegroundColor Gray
Write-Host "Test execution with full error reporting and early termination on excessive errors" -ForegroundColor Gray
Write-Host ""

$ErrorActionPreference = "Continue"
$testResults = @()
$errorCount = 0
$warningCount = 0
$maxErrors = 50

# テスト実行時の環境変数設定
$env:NODE_ENV = "test"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:CI = "true"

# エラーカウント関数
function Count-Errors {
    param([string]$output)
    $errors = ($output | Select-String -Pattern "error|Error|ERROR" -AllMatches).Matches.Count
    $warnings = ($output | Select-String -Pattern "warning|Warning|WARNING" -AllMatches).Matches.Count
    return @{ Errors = $errors; Warnings = $warnings }
}

# エラー数チェック関数
function Check-ErrorLimit {
    param([int]$currentErrors)
    if ($currentErrors -gt $script:maxErrors) {
        Write-Host "" -ForegroundColor Red
        Write-Host "=== ERROR LIMIT EXCEEDED ===" -ForegroundColor Red
        Write-Host "Found $currentErrors errors (limit: $script:maxErrors)" -ForegroundColor Red
        Write-Host "Terminating test execution early to prevent excessive output" -ForegroundColor Red
        Write-Host "" -ForegroundColor Red
        exit 1
    }
}

# 1. Prettier Format Check & Auto-Fix (最初に実行してコードを整形)
Write-Host "1. Prettier Format Check & Auto-Fix Running..." -ForegroundColor Yellow
try {
    $formatCheckOutput = npm run format:check 2>&1 | Out-String
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Formatting issues detected. Attempting to auto-fix..." -ForegroundColor Yellow
        $formatOutput = npm run format 2>&1 | Out-String
        
        Write-Host "Verifying format after auto-fix..." -ForegroundColor Gray
        $formatRecheckOutput = npm run format:check 2>&1 | Out-String
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Prettier Error Details:" -ForegroundColor Red
            Write-Host $formatRecheckOutput -ForegroundColor Red
            $counts = Count-Errors $formatRecheckOutput
            $script:errorCount += $counts.Errors
            $script:warningCount += $counts.Warnings
            Check-ErrorLimit $script:errorCount
            $testResults += "Prettier: FAIL"
            Write-Host "Prettier: FAIL" -ForegroundColor Red
            exit 1
        }
        
        $testResults += "Prettier: PASS (auto-fixed)"
        Write-Host "Prettier: PASS (auto-fixed)" -ForegroundColor Green
    } else {
        $testResults += "Prettier: PASS"
        Write-Host "Prettier: PASS" -ForegroundColor Green
    }
} catch {
    $testResults += "Prettier: FAIL"
    Write-Host "Prettier: FAIL" -ForegroundColor Red
    Write-Host "Prettier Error Details:" -ForegroundColor Red
    Write-Host ($_.Exception.Message | Out-String) -ForegroundColor Red
    $script:errorCount += 1
    Check-ErrorLimit $script:errorCount
    exit 1
}
Write-Host ""

# 2. Lint-Staged Check (Huskyと同じ処理を実行)
Write-Host "2. Lint-Staged Check Running..." -ForegroundColor Yellow
try {
    $lintStagedOutput = npx lint-staged --allow-empty 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Lint-Staged Error Details:" -ForegroundColor Red
        Write-Host $lintStagedOutput -ForegroundColor Red
        $counts = Count-Errors $lintStagedOutput
        $script:errorCount += $counts.Errors
        $script:warningCount += $counts.Warnings
        Check-ErrorLimit $script:errorCount
        $testResults += "Lint-Staged: FAIL"
        Write-Host "Lint-Staged: FAIL" -ForegroundColor Red
        exit 1
    }
    
    # 警告がある場合は表示
    $counts = Count-Errors $lintStagedOutput
    if ($counts.Warnings -gt 0) {
        Write-Host "Lint-Staged Warnings:" -ForegroundColor Yellow
        Write-Host $lintStagedOutput -ForegroundColor Yellow
        $script:warningCount += $counts.Warnings
    }
    
    $testResults += "Lint-Staged: PASS"
    Write-Host "Lint-Staged: PASS" -ForegroundColor Green
} catch {
    $testResults += "Lint-Staged: FAIL"
    Write-Host "Lint-Staged: FAIL" -ForegroundColor Red
    Write-Host "Lint-Staged Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $script:errorCount += 1
    Check-ErrorLimit $script:errorCount
    exit 1
}
Write-Host ""

# 3. TypeScript Type Check (早期にタイプエラーを検出)
Write-Host "3. TypeScript Type Check Running..." -ForegroundColor Yellow
try {
    $typeCheckOutput = npm run type-check --silent 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "TypeScript Error Details:" -ForegroundColor Red
        Write-Host $typeCheckOutput -ForegroundColor Red
        throw "TypeScript type check failed with exit code $LASTEXITCODE"
    }
    $testResults += "TypeScript: PASS"
    Write-Host "TypeScript: PASS" -ForegroundColor Green
} catch {
    $testResults += "TypeScript: FAIL"
    Write-Host "TypeScript: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. ESLint Check (TypeScriptチェック後にリントを実行)
Write-Host "4. ESLint Check Running..." -ForegroundColor Yellow
try {
    $eslintOutput = npm run lint --silent 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ESLint Error Details:" -ForegroundColor Red
        Write-Host $eslintOutput -ForegroundColor Red
        throw "ESLint check failed with exit code $LASTEXITCODE"
    }
    $testResults += "ESLint: PASS"
    Write-Host "ESLint: PASS" -ForegroundColor Green
} catch {
    $testResults += "ESLint: FAIL"
    Write-Host "ESLint: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Build Test (コード品質チェック後にビルドテスト)
Write-Host "5. Build Test Running..." -ForegroundColor Yellow
try {
    # 一時的にエラーアクションを変更
    $originalErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    
    npm run build --silent | Out-Null
    $buildResult = $LASTEXITCODE
    
    $ErrorActionPreference = $originalErrorAction
    
    if ($buildResult -eq 0) {
        $testResults += "Build: PASS"
        Write-Host "Build: PASS" -ForegroundColor Green
    } else {
        $testResults += "Build: FAIL"
        Write-Host "Build: FAIL" -ForegroundColor Red
        Write-Host "Build Error Details:" -ForegroundColor Red
        # エラーの場合のみ詳細を表示
        npm run build
        exit 1
    }
} catch {
    $testResults += "Build: FAIL"
    Write-Host "Build: FAIL" -ForegroundColor Red
    Write-Host "Build Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Jest Unit Tests (ビルド成功後に単体テスト)
Write-Host "6. Jest Unit Tests Running..." -ForegroundColor Yellow
try {
    $jestOutput = npm run test --silent 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Jest Error Details:" -ForegroundColor Red
        Write-Host $jestOutput -ForegroundColor Red
        throw "Jest tests failed with exit code $LASTEXITCODE"
    }
    $testResults += "Jest Tests: PASS"
    Write-Host "Jest Tests: PASS" -ForegroundColor Green
} catch {
    $testResults += "Jest Tests: FAIL"
    Write-Host "Jest Tests: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. Playwright E2E Tests (最後に統合テスト)
Write-Host "7. Playwright E2E Tests Running..." -ForegroundColor Yellow
try {
    $playwrightOutput = npx playwright test --quiet 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Playwright Error Details:" -ForegroundColor Red
        Write-Host $playwrightOutput -ForegroundColor Red
        throw "Playwright E2E tests failed with exit code $LASTEXITCODE"
    }
    $testResults += "Playwright E2E: PASS"
    Write-Host "Playwright E2E: PASS" -ForegroundColor Green
} catch {
    $testResults += "Playwright E2E: FAIL"
    Write-Host "Playwright E2E: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 8. Lighthouse Performance Test (最終的なパフォーマンステスト)
Write-Host "8. Lighthouse Performance Test Running..." -ForegroundColor Yellow
try {
    $lighthouseOutput = npm run lighthouse --silent 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Lighthouse Error Details:" -ForegroundColor Red
        Write-Host $lighthouseOutput -ForegroundColor Red
        throw "Lighthouse test failed with exit code $LASTEXITCODE"
    }
    $testResults += "Lighthouse: PASS"
    Write-Host "Lighthouse: PASS" -ForegroundColor Green
} catch {
    $testResults += "Lighthouse: FAIL"
    Write-Host "Lighthouse: FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Results Summary
Write-Host "=== Test Results Summary ===" -ForegroundColor Green
foreach ($result in $testResults) {
    Write-Host $result
}
Write-Host ""
Write-Host "All tests completed successfully!" -ForegroundColor Green
Write-Host "Completion Time: $(Get-Date)" -ForegroundColor Gray
Write-Host "=== samuido Website - All Tests Completed ===" -ForegroundColor Green