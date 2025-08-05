# Production Deployment Script
# Comprehensive production deployment with security and monitoring setup

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$DryRun,
    [string]$Environment = "production"
)

Write-Host "🚀 Starting Production Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Check if required environment variables are set
function Test-EnvironmentVariables {
    Write-Host "🔍 Checking environment variables..." -ForegroundColor Blue
    
    $requiredVars = @(
        "NEXT_PUBLIC_SITE_URL",
        "NEXT_PUBLIC_GA_ID"
    )
    
    $optionalVars = @(
        "SENTRY_DSN",
        "SENTRY_ORG",
        "SENTRY_PROJECT",
        "LIGHTHOUSE_CI_TOKEN"
    )
    
    $missing = @()
    $warnings = @()
    
    foreach ($var in $requiredVars) {
        if (-not (Get-Item "Env:$var" -ErrorAction SilentlyContinue)) {
            $missing += $var
        }
    }
    
    foreach ($var in $optionalVars) {
        if (-not (Get-Item "Env:$var" -ErrorAction SilentlyContinue)) {
            $warnings += $var
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
        $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        exit 1
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  Optional environment variables not set:" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    }
    
    Write-Host "✅ Environment variables check passed" -ForegroundColor Green
}

# Run security audit
function Invoke-SecurityAudit {
    Write-Host "🔒 Running security audit..." -ForegroundColor Blue
    
    try {
        & powershell -ExecutionPolicy Bypass -File "scripts/security-audit.ps1"
        if ($LASTEXITCODE -ne 0) {
            throw "Security audit failed"
        }
        Write-Host "✅ Security audit passed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Security audit failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Run comprehensive tests
function Invoke-ComprehensiveTests {
    if ($SkipTests) {
        Write-Host "⏭️  Skipping tests (--SkipTests flag)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🧪 Running comprehensive tests..." -ForegroundColor Blue
    
    try {
        # Run all tests
        & powershell -ExecutionPolicy Bypass -File "scripts/run-all-tests.ps1"
        if ($LASTEXITCODE -ne 0) {
            throw "Tests failed"
        }
        
        # Run performance tests
        Write-Host "📊 Running performance tests..." -ForegroundColor Blue
        & node "scripts/run-performance-tests.js"
        if ($LASTEXITCODE -ne 0) {
            throw "Performance tests failed"
        }
        
        Write-Host "✅ All tests passed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Tests failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Build for production
function Invoke-ProductionBuild {
    if ($SkipBuild) {
        Write-Host "⏭️  Skipping build (--SkipBuild flag)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🏗️  Building for production..." -ForegroundColor Blue
    
    try {
        # Set production environment
        $env:NODE_ENV = "production"
        $env:NEXT_BUILD_TIME = "true"
        
        # Clear cache
        & node "scripts/clear-cache.js"
        
        # Build
        & npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed"
        }
        
        Write-Host "✅ Production build completed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Build failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Validate build output
function Test-BuildOutput {
    Write-Host "🔍 Validating build output..." -ForegroundColor Blue
    
    $buildDir = ".next"
    $standaloneDir = ".next/standalone"
    
    if (-not (Test-Path $buildDir)) {
        Write-Host "❌ Build directory not found" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path $standaloneDir)) {
        Write-Host "❌ Standalone build not found" -ForegroundColor Red
        exit 1
    }
    
    # Check for critical files
    $criticalFiles = @(
        ".next/standalone/server.js",
        ".next/standalone/package.json",
        ".next/static"
    )
    
    foreach ($file in $criticalFiles) {
        if (-not (Test-Path $file)) {
            Write-Host "❌ Critical file missing: $file" -ForegroundColor Red
            exit 1
        }
    }
    
    # Check bundle sizes
    Write-Host "📦 Checking bundle sizes..." -ForegroundColor Blue
    
    $staticDir = ".next/static/chunks"
    if (Test-Path $staticDir) {
        $chunks = Get-ChildItem $staticDir -Filter "*.js" | Sort-Object Length -Descending
        $largeChunks = $chunks | Where-Object { $_.Length -gt 1MB }
        
        if ($largeChunks.Count -gt 0) {
            Write-Host "⚠️  Large chunks detected:" -ForegroundColor Yellow
            $largeChunks | ForEach-Object { 
                $sizeMB = [math]::Round($_.Length / 1MB, 2)
                Write-Host "  - $($_.Name): ${sizeMB}MB" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "✅ Build output validation passed" -ForegroundColor Green
}

# Run Lighthouse CI
function Invoke-LighthouseCi {
    if (-not $env:LIGHTHOUSE_CI_TOKEN) {
        Write-Host "⏭️  Skipping Lighthouse CI (no token)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔍 Running Lighthouse CI..." -ForegroundColor Blue
    
    try {
        & npm run lighthouse
        if ($LASTEXITCODE -ne 0) {
            throw "Lighthouse CI failed"
        }
        Write-Host "✅ Lighthouse CI passed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Lighthouse CI failed: $_" -ForegroundColor Red
        # Don't exit on Lighthouse failure in production deploy
        Write-Host "⚠️  Continuing deployment despite Lighthouse issues" -ForegroundColor Yellow
    }
}

# Setup monitoring
function Initialize-Monitoring {
    Write-Host "📊 Setting up monitoring..." -ForegroundColor Blue
    
    # Create logs directory
    $logsDir = "logs"
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
        New-Item -ItemType Directory -Path "$logsDir/errors" -Force | Out-Null
        New-Item -ItemType Directory -Path "$logsDir/performance" -Force | Out-Null
        New-Item -ItemType Directory -Path "$logsDir/webgl" -Force | Out-Null
    }
    
    # Setup log rotation
    $logRotationScript = @"
# Log rotation script
Get-ChildItem logs -Recurse -File | Where-Object { 
    $_.LastWriteTime -lt (Get-Date).AddDays(-30) 
} | Remove-Item -Force
"@
    
    $logRotationScript | Out-File -FilePath "scripts/rotate-logs.ps1" -Encoding UTF8
    
    Write-Host "✅ Monitoring setup completed" -ForegroundColor Green
}

# Deploy to production
function Invoke-ProductionDeploy {
    if ($DryRun) {
        Write-Host "🔍 Dry run mode - would deploy to production" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🚀 Deploying to production..." -ForegroundColor Blue
    
    try {
        # This would typically deploy to your hosting platform
        # For Vercel:
        # & vercel --prod
        
        # For now, just start the production server locally
        Write-Host "Starting production server..." -ForegroundColor Blue
        & powershell -ExecutionPolicy Bypass -File "scripts/start-production.ps1"
        
        Write-Host "✅ Deployment completed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Generate deployment report
function New-DeploymentReport {
    Write-Host "📋 Generating deployment report..." -ForegroundColor Blue
    
    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        environment = $Environment
        version = (Get-Content "package.json" | ConvertFrom-Json).version
        nodeVersion = & node --version
        npmVersion = & npm --version
        buildSize = if (Test-Path ".next") { 
            [math]::Round((Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2) 
        } else { 0 }
        environmentVariables = @{
            NODE_ENV = $env:NODE_ENV
            NEXT_PUBLIC_SITE_URL = $env:NEXT_PUBLIC_SITE_URL
            NEXT_PUBLIC_GA_ID = if ($env:NEXT_PUBLIC_GA_ID) { "Set" } else { "Not set" }
            SENTRY_DSN = if ($env:SENTRY_DSN) { "Set" } else { "Not set" }
        }
    }
    
    $reportJson = $report | ConvertTo-Json -Depth 3
    $reportJson | Out-File -FilePath "deployment-report.json" -Encoding UTF8
    
    Write-Host "📋 Deployment Report:" -ForegroundColor Green
    Write-Host "  Timestamp: $($report.timestamp)" -ForegroundColor White
    Write-Host "  Environment: $($report.environment)" -ForegroundColor White
    Write-Host "  Version: $($report.version)" -ForegroundColor White
    Write-Host "  Build Size: $($report.buildSize)MB" -ForegroundColor White
    
    Write-Host "✅ Deployment report generated" -ForegroundColor Green
}

# Main deployment flow
try {
    Write-Host "Starting deployment process..." -ForegroundColor Blue
    
    # Pre-deployment checks
    Test-EnvironmentVariables
    Invoke-SecurityAudit
    
    # Testing phase
    Invoke-ComprehensiveTests
    
    # Build phase
    Invoke-ProductionBuild
    Test-BuildOutput
    
    # Quality assurance
    Invoke-LighthouseCi
    
    # Setup
    Initialize-Monitoring
    
    # Deployment
    Invoke-ProductionDeploy
    
    # Post-deployment
    New-DeploymentReport
    
    Write-Host "🎉 Production deployment completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "💥 Deployment failed: $_" -ForegroundColor Red
    exit 1
}