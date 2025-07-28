param(
    [switch]$SkipSlowTests = $false,
    [switch]$Verbose = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$CACHE_DIR = ".test-cache"

if (!(Test-Path $CACHE_DIR)) {
    New-Item -ItemType Directory -Path $CACHE_DIR -Force | Out-Null
}

function Test-FilesChanged {
    param([string]$Pattern, [string]$TestName)
    
    $cacheFile = Join-Path $CACHE_DIR "$($TestName -replace '[^a-zA-Z0-9]', '_').hash"
    $patterns = $Pattern.Split(',')
    $files = @()
    
    foreach ($pat in $patterns) {
        $found = Get-ChildItem -Recurse -Include $pat -File -ErrorAction SilentlyContinue | Where-Object { 
            $_.FullName -notmatch "node_modules" -and 
            $_.FullName -notmatch "\.next" -and 
            $_.FullName -notmatch "\.git" -and 
            $_.FullName -notmatch [regex]::Escape($CACHE_DIR)
        }
        $files += $found
    }
    
    if ($files.Count -eq 0) { return $true }
    
    $currentHash = ($files | ForEach-Object { $_.LastWriteTime.ToString() + $_.Length } | 
                   Sort-Object | Out-String).GetHashCode()
    
    if (Test-Path $cacheFile) {
        $cachedHash = Get-Content $cacheFile -Raw
        if ($currentHash -eq $cachedHash) { return $false }
    }
    
    $currentHash | Out-File $cacheFile -Encoding UTF8
    return $true
}

function Invoke-CachedTest {
    param([string]$TestName, [string]$Command, [string]$FilePattern, [bool]$ForceRun = $false)
    
    if (!$ForceRun -and !$Force -and !(Test-FilesChanged -Pattern $FilePattern -TestName $TestName)) {
        if ($Verbose) {
            Write-Host "-> $TestName (cached)" -ForegroundColor Yellow
        } else {
            Write-Host "-" -NoNewline -ForegroundColor Yellow
        }
        return $true
    }
    
    $logFile = Join-Path $env:TEMP "test_$($TestName -replace '[^a-zA-Z0-9]', '_').log"
    
    try {
        $output = cmd /c "$Command 2>&1"
        $exitCode = $LASTEXITCODE
        $output | Out-File $logFile -Encoding UTF8
        
        if ($exitCode -eq 0) {
            Write-Host "+" -NoNewline -ForegroundColor Green
            return $true
        } else {
            Write-Host ""
            Write-Host "X $TestName failed (exit code: $exitCode):" -ForegroundColor Red
            $output | Where-Object { $_ -match "(error|Error|ERROR|fail|Fail|FAIL)" } | 
                Select-Object -First 10 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
            return $false
        }
    } catch {
        Write-Host ""
        Write-Host "X $TestName failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

$startTime = Get-Date
Write-Host "=== Lightning Test Run ===" -ForegroundColor Cyan
Write-Host "Tests: " -NoNewline

if (!(Invoke-CachedTest -TestName "ESLint" -Command "npm run lint --silent" -FilePattern "*.ts,*.tsx,*.js,*.jsx")) {
    exit 1
}

if (!(Invoke-CachedTest -TestName "TypeScript" -Command "npm run type-check --silent" -FilePattern "*.ts,*.tsx")) {
    exit 1
}

if (!(Invoke-CachedTest -TestName "Jest" -Command "npm run test --silent -- --bail --passWithNoTests" -FilePattern "*.test.ts,*.test.tsx,*.spec.ts")) {
    exit 1
}

if (!(Invoke-CachedTest -TestName "Prettier" -Command "npm run format:check --silent" -FilePattern "*.ts,*.tsx,*.js,*.jsx,*.json,*.md")) {
    exit 1
}

Write-Host " Build" -NoNewline
if (!(Invoke-CachedTest -TestName "Build" -Command "npm run build --silent" -FilePattern "*.ts,*.tsx,*.js,*.jsx,next.config.*,package.json,tailwind.config.*" -ForceRun $true)) {
    exit 1
}

if (!$SkipSlowTests) {
    Write-Host " E2E" -NoNewline
    if (!(Invoke-CachedTest -TestName "Playwright" -Command "npx playwright test --quiet --reporter=dot --workers=2" -FilePattern "*.ts,*.tsx,e2e/*.spec.ts")) {
        exit 1
    }
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds
$durationText = "{0:F2}s" -f $duration

Write-Host ""
Write-Host "All tests passed ($durationText)" -ForegroundColor Green

if ($Verbose) {
    Write-Host "Note: - indicates cached/skipped tests" -ForegroundColor Yellow
}

Write-Host "=== Lightning Test Completed ===" -ForegroundColor Cyan