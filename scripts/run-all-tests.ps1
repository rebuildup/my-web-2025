# 全テスト実行スクリプト (PowerShell)
# samuido website - 包括的品質チェック

Write-Host "=== samuido Website - All Tests Start ===" -ForegroundColor Green
Write-Host "Execution Time: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

$ErrorActionPreference = "Stop"
$testResults = @()

# 1. ESLint Check
Write-Host "1. ESLint Check Running..." -ForegroundColor Yellow
try {
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        throw "ESLint check failed with exit code $LASTEXITCODE"
    }
    $testResults += "✅ ESLint: PASS"
    Write-Host "✅ ESLint: PASS" -ForegroundColor Green
} catch {
    $testResults += "❌ ESLint: FAIL"
    Write-Host "❌ ESLint: FAIL" -ForegroundColor Red
    Write-Host "ESLint Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. TypeScript Type Check
Write-Host "2. TypeScript Type Check Running..." -ForegroundColor Yellow
try {
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        throw "TypeScript type check failed with exit code $LASTEXITCODE"
    }
    $testResults += "✅ TypeScript: PASS"
    Write-Host "✅ TypeScript: PASS" -ForegroundColor Green
} catch {
    $testResults += "❌ TypeScript: FAIL"
    Write-Host "❌ TypeScript: FAIL" -ForegroundColor Red
    Write-Host "TypeScript Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Build Test
Write-Host "3. Build Test Running..." -ForegroundColor Yellow
try {
    # Run build command
    npm run build
    $buildExitCode = $LASTEXITCODE
    
    # Check if build completed successfully (exit code 0 means success)
    if ($buildExitCode -eq 0) {
        $testResults += "✅ Build: PASS"
        Write-Host "✅ Build: PASS" -ForegroundColor Green
    } else {
        throw "Build process failed with exit code $buildExitCode"
    }
} catch {
    $testResults += "❌ Build: FAIL"
    Write-Host "❌ Build: FAIL" -ForegroundColor Red
    Write-Host "Build Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Jest Unit Tests
Write-Host "4. Jest Unit Tests Running..." -ForegroundColor Yellow
try {
    npm run test
    if ($LASTEXITCODE -ne 0) {
        throw "Jest tests failed with exit code $LASTEXITCODE"
    }
    $testResults += "✅ Jest Tests: PASS"
    Write-Host "✅ Jest Tests: PASS" -ForegroundColor Green
} catch {
    $testResults += "❌ Jest Tests: FAIL"
    Write-Host "❌ Jest Tests: FAIL" -ForegroundColor Red
    Write-Host "Jest Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Playwright E2E Tests
Write-Host "5. Playwright E2E Tests Running..." -ForegroundColor Yellow
try {
    npx playwright test
    if ($LASTEXITCODE -ne 0) {
        throw "Playwright E2E tests failed with exit code $LASTEXITCODE"
    }
    $testResults += "✅ Playwright E2E: PASS"
    Write-Host "✅ Playwright E2E: PASS" -ForegroundColor Green
} catch {
    $testResults += "❌ Playwright E2E: FAIL"
    Write-Host "❌ Playwright E2E: FAIL" -ForegroundColor Red
    Write-Host "Playwright Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Prettier Format Check
Write-Host "6. Prettier Format Check Running..." -ForegroundColor Yellow
try {
    npx prettier --check src/app/workshop/
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Fixing Prettier format issues..." -ForegroundColor Yellow
        npx prettier --write src/app/workshop/
        npx prettier --check src/app/workshop/
        if ($LASTEXITCODE -ne 0) {
            throw "Prettier format check failed even after auto-fix"
        }
        $testResults += "✅ Prettier (Workshop): PASS (auto-fixed)"
        Write-Host "✅ Prettier (Workshop): PASS (auto-fixed)" -ForegroundColor Green
    } else {
        $testResults += "✅ Prettier (Workshop): PASS"
        Write-Host "✅ Prettier (Workshop): PASS" -ForegroundColor Green
    }
} catch {
    $testResults += "❌ Prettier (Workshop): FAIL"
    Write-Host "❌ Prettier (Workshop): FAIL" -ForegroundColor Red
    Write-Host "Prettier Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# Results Summary
Write-Host "=== Test Results Summary ===" -ForegroundColor Green
foreach ($result in $testResults) {
    Write-Host $result
}
Write-Host ""
Write-Host "🎉 All tests completed successfully!" -ForegroundColor Green
Write-Host "Completion Time: $(Get-Date)" -ForegroundColor Gray
Write-Host "=== samuido Website - All Tests Completed ===" -ForegroundColor Green