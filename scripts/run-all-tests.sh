#!/bin/bash
# All Tests Execution Script (Bash) - 最適化版
# samuido website - Comprehensive Quality Check
# 
# 実行順序の最適化:
# 1. Prettier (コード整形) → 2. Lint-Staged (Husky同等) → 3. TypeScript (型チェック)
# 4. ESLint (リント) → 5. Build (ビルド) → 6. Jest (単体テスト) 
# 7. Playwright (E2E) → 8. Lighthouse (パフォーマンス)

echo "=== samuido Website - All Tests Start ==="
echo "Execution Time: $(date)"
echo "Test execution optimized for minimal output and maximum efficiency"
echo ""

set -e  # Stop on error

test_results=()

# テスト実行時の環境変数設定（ログ出力を抑制）
export NODE_ENV=test
export NEXT_TELEMETRY_DISABLED=1
export CI=true

# 1. Prettier Format Check & Auto-Fix (最初に実行してコードを整形)
echo "1. Prettier Format Check & Auto-Fix Running..."
if npm run format:check >/dev/null 2>&1; then
    test_results+=("Prettier: PASS")
    echo "Prettier: PASS"
else
    echo "Warning: Formatting issues detected. Attempting to auto-fix..."
    npm run format --silent >/dev/null 2>&1
    
    echo "Verifying format after auto-fix..."
    if npm run format:check >/dev/null 2>&1; then
        test_results+=("Prettier: PASS (auto-fixed)")
        echo "Prettier: PASS (auto-fixed)"
    else
        test_results+=("Prettier: FAIL")
        echo "Prettier: FAIL"
        echo "Prettier format check failed even after auto-fix"
        exit 1
    fi
fi
echo ""

# 2. Lint-Staged Check (Huskyと同じ処理を実行)
echo "2. Lint-Staged Check Running..."
if npx lint-staged --allow-empty --quiet >/dev/null 2>&1; then
    test_results+=("Lint-Staged: PASS")
    echo "Lint-Staged: PASS"
else
    test_results+=("Lint-Staged: FAIL")
    echo "Lint-Staged: FAIL"
    exit 1
fi
echo ""

# 3. TypeScript Type Check (早期にタイプエラーを検出)
echo "3. TypeScript Type Check Running..."
if npm run type-check; then
    test_results+=("TypeScript: PASS")
    echo "TypeScript: PASS"
else
    test_results+=("TypeScript: FAIL")
    echo "TypeScript: FAIL"
    exit 1
fi
echo ""

# 4. ESLint Check (TypeScriptチェック後にリントを実行)
echo "4. ESLint Check Running..."
if npm run lint; then
    test_results+=("ESLint: PASS")
    echo "ESLint: PASS"
else
    test_results+=("ESLint: FAIL")
    echo "ESLint: FAIL"
    exit 1
fi
echo ""

# 5. Build Test (コード品質チェック後にビルドテスト)
echo "5. Build Test Running..."
if npm run build; then
    test_results+=("Build: PASS")
    echo "Build: PASS"
else
    test_results+=("Build: FAIL")
    echo "Build: FAIL"
    exit 1
fi
echo ""

# 6. Jest Unit Tests (ビルド成功後に単体テスト)
echo "6. Jest Unit Tests Running..."
if npm run test --silent >/dev/null 2>&1; then
    test_results+=("Jest Tests: PASS")
    echo "Jest Tests: PASS"
else
    test_results+=("Jest Tests: FAIL")
    echo "Jest Tests: FAIL"
    # エラーの場合のみ詳細を表示
    npm run test
    exit 1
fi
echo ""

# 7. Playwright E2E Tests (最後に統合テスト)
echo "7. Playwright E2E Tests Running..."
if npx playwright test --quiet >/dev/null 2>&1; then
    test_results+=("Playwright E2E: PASS")
    echo "Playwright E2E: PASS"
else
    test_results+=("Playwright E2E: FAIL")
    echo "Playwright E2E: FAIL"
    # エラーの場合のみ詳細を表示
    npx playwright test
    exit 1
fi
echo ""

# 8. Lighthouse Performance Test (最終的なパフォーマンステスト)
echo "8. Lighthouse Performance Test Running..."
if npm run lighthouse --silent >/dev/null 2>&1; then
    test_results+=("Lighthouse: PASS")
    echo "Lighthouse: PASS"
else
    test_results+=("Lighthouse: FAIL")
    echo "Lighthouse: FAIL"
    # エラーの場合のみ詳細を表示
    npm run lighthouse
    exit 1
fi
echo ""

# Results Summary
echo "=== Test Results Summary ==="
for result in "${test_results[@]}"; do
    echo "$result"
done
echo ""
echo "All tests completed successfully!"
echo "Completion Time: $(date)"
echo "=== samuido Website - All Tests Completed ==="