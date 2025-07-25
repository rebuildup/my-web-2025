#!/bin/bash
# All Tests Execution Script (Bash)
# samuido website - Comprehensive Quality Check

echo "=== samuido Website - All Tests Start ==="
echo "Execution Time: $(date)"
echo ""

set -e  # Stop on error

test_results=()

# 1. ESLint Check
echo "1. ESLint Check Running..."
if npm run lint; then
    test_results+=("✓ ESLint: PASS")
    echo "✓ ESLint: PASS"
else
    test_results+=("ESLint: FAIL")
    echo "ESLint: FAIL"
    exit 1
fi
echo ""

# 2. TypeScript Type Check
echo "2. TypeScript Type Check Running..."
if npm run type-check; then
    test_results+=("✓ TypeScript: PASS")
    echo "✓ TypeScript: PASS"
else
    test_results+=("TypeScript: FAIL")
    echo "TypeScript: FAIL"
    exit 1
fi
echo ""

# 3. Build Test
echo "3. Build Test Running..."
# Run build command
if npm run build; then
    test_results+=("✓ Build: PASS")
    echo "✓ Build: PASS"
else
    test_results+=("Build: FAIL")
    echo "Build: FAIL"
    echo "Build process failed"
    exit 1
fi
echo ""

# 4. Jest Unit Tests
echo "4. Jest Unit Tests Running..."
if npm run test; then
    test_results+=("✓ Jest Tests: PASS")
    echo "✓ Jest Tests: PASS"
else
    test_results+=("Jest Tests: FAIL")
    echo "Jest Tests: FAIL"
    exit 1
fi
echo ""

# 5. Playwright E2E Tests
echo "5. Playwright E2E Tests Running..."
if npx playwright test; then
    test_results+=("✓ Playwright E2E: PASS")
    echo "✓ Playwright E2E: PASS"
else
    test_results+=("Playwright E2E: FAIL")
    echo "Playwright E2E: FAIL"
    exit 1
fi
echo ""

# 6. Prettier Format Check
echo "6. Prettier Format Check Running..."
if npx prettier --check src/app/workshop/; then
    test_results+=("✓ Prettier (Workshop): PASS")
    echo "✓ Prettier (Workshop): PASS"
else
    echo "Warning: Fixing Prettier format issues..."
    npx prettier --write src/app/workshop/
    if npx prettier --check src/app/workshop/; then
        test_results+=("✓ Prettier (Workshop): PASS (auto-fixed)")
        echo "✓ Prettier (Workshop): PASS (auto-fixed)"
    else
        test_results+=("Prettier (Workshop): FAIL")
        echo "Prettier (Workshop): FAIL"
        echo "Prettier format check failed even after auto-fix"
        exit 1
    fi
fi
echo ""

# Results Summary
echo "=== Test Results Summary ==="
for result in "${test_results[@]}"; do
    echo "$result"
done
echo ""
echo "✓ All tests completed successfully!"
echo "Completion Time: $(date)"
echo "=== samuido Website - All Tests Completed ==="