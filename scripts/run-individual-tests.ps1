param(
    [switch]$Verbose = $false
)

Write-Host "=== Jest Tests - Individual File Execution ===" -ForegroundColor Green
Write-Host "Running each test file individually to prevent memory issues" -ForegroundColor Gray
Write-Host ""

$ErrorActionPreference = "Continue"
$env:NODE_ENV = "test"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:CI = "true"

# Find all test files
$testFiles = @()
$testFiles += Get-ChildItem -Path "src" -Recurse -Filter "*.test.ts" | ForEach-Object { $_.FullName }
$testFiles += Get-ChildItem -Path "src" -Recurse -Filter "*.test.tsx" | ForEach-Object { $_.FullName }
$testFiles += Get-ChildItem -Path "__tests__" -Recurse -Filter "*.test.ts" -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
$testFiles += Get-ChildItem -Path "__tests__" -Recurse -Filter "*.test.tsx" -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }

# Convert to relative paths
$testFiles = $testFiles | ForEach-Object { 
    $relativePath = $_ -replace [regex]::Escape((Get-Location).Path + "\"), ""
    $relativePath -replace "\\", "/"
}

Write-Host "Found $($testFiles.Count) test files" -ForegroundColor Gray
Write-Host ""

$allPassed = $true
$testResults = @()
$currentTest = 0

foreach ($testFile in $testFiles) {
    $currentTest++
    Write-Host "[$currentTest/$($testFiles.Count)] Running: $testFile" -ForegroundColor Yellow
    
    try {
        # Clear any existing Jest cache before each test
        if (Test-Path ".test-cache") {
            Remove-Item -Recurse -Force ".test-cache" -ErrorAction SilentlyContinue
        }
        
        # Run individual test file with maximum memory optimization
        $env:NODE_OPTIONS = "--max-old-space-size=1024 --gc-interval=25 --gc-global"
        $jestOutput = npm run test -- "$testFile" --runInBand --no-cache --forceExit --silent --maxConcurrency=1 2>&1 | Out-String
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ PASS" -ForegroundColor Green
            $testResults += "${testFile}: PASS"
        } else {
            Write-Host "  ✗ FAIL" -ForegroundColor Red
            if ($Verbose) {
                Write-Host "Error Details:" -ForegroundColor Red
                Write-Host $jestOutput -ForegroundColor Red
            }
            $testResults += "${testFile}: FAIL"
            $allPassed = $false
        }
        
        # Force garbage collection between tests
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        [System.GC]::Collect()
        
        # Small delay to allow memory cleanup
        Start-Sleep -Seconds 1
        
    } catch {
        Write-Host "  ✗ ERROR" -ForegroundColor Red
        if ($Verbose) {
            Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
        }
        $testResults += "${testFile}: ERROR"
        $allPassed = $false
    }
}

# Clean up any remaining cache
if (Test-Path ".test-cache") {
    Remove-Item -Recurse -Force ".test-cache" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "=== Test Results Summary ===" -ForegroundColor Green
$passCount = ($testResults | Where-Object { $_ -like "*PASS*" }).Count
$failCount = ($testResults | Where-Object { $_ -like "*FAIL*" }).Count
$errorCount = ($testResults | Where-Object { $_ -like "*ERROR*" }).Count

Write-Host "Total Tests: $($testFiles.Count)" -ForegroundColor Gray
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Errors: $errorCount" -ForegroundColor Yellow

if ($Verbose) {
    Write-Host ""
    Write-Host "Detailed Results:" -ForegroundColor Gray
    foreach ($result in $testResults) {
        if ($result -like "*PASS*") {
            Write-Host $result -ForegroundColor Green
        } elseif ($result -like "*FAIL*") {
            Write-Host $result -ForegroundColor Red
        } else {
            Write-Host $result -ForegroundColor Yellow
        }
    }
}

Write-Host ""

if ($allPassed) {
    Write-Host "All tests completed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed. Run with -Verbose for details." -ForegroundColor Red
    exit 1
}