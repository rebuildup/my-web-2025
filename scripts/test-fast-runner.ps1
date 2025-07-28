# Test script to verify the fast test runner works
Write-Host "Testing fast test runner..." -ForegroundColor Cyan

# Test with skip slow tests
Write-Host "`nTesting with -SkipSlowTests flag..." -ForegroundColor Yellow
& "scripts/run-all-tests-fast.ps1" -SkipSlowTests -Verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Fast test runner works!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Fast test runner failed!" -ForegroundColor Red
    exit 1
}