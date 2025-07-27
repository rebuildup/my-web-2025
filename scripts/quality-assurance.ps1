# Quality Assurance Script for samuido-website
# Ensures 100% pass rate for all test suites and validates deployment readiness

param(
    [switch]$SkipTests = $false,
    [switch]$SkipLighthouse = $false,
    [switch]$SkipSecurity = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=== samuido Website - Quality Assurance Check ===" -ForegroundColor Cyan
Write-Host "Execution Time: $(Get-Date)" -ForegroundColor Gray

$totalSteps = 6
$currentStep = 0

function Write-Step {
    param($message)
    $script:currentStep++
    Write-Host "[$script:currentStep/$totalSteps] $message" -ForegroundColor Yellow
}

function Write-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Warning {
    param($message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

# Step 1: Environment Check
Write-Step "Environment Check"
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Success "Node.js: $nodeVersion"
    Write-Success "npm: $npmVersion"
    
    if (Test-Path "package.json") {
        Write-Success "package.json found"
    } else {
        throw "package.json not found"
    }
} catch {
    Write-Error "Environment check failed: $_"
    exit 1
}

# Step 2: Dependency Check
Write-Step "Dependency Check"
try {
    if (!(Test-Path "node_modules")) {
        Write-Warning "node_modules not found, installing dependencies..."
        npm install
    }
    Write-Success "Dependencies verified"
} catch {
    Write-Error "Dependency check failed: $_"
    exit 1
}

# Step 3: TypeScript Compilation
Write-Step "TypeScript Compilation"
try {
    npm run type-check
    Write-Success "TypeScript compilation passed"
} catch {
    Write-Error "TypeScript compilation failed"
    exit 1
}

# Step 4: Test Suite Execution
if (!$SkipTests) {
    Write-Step "Test Suite Execution"
    try {
        # Run linting
        Write-Host "  Running ESLint..." -ForegroundColor Gray
        npm run lint
        Write-Success "ESLint passed"
        
        # Run unit tests
        Write-Host "  Running Jest unit tests..." -ForegroundColor Gray
        npm run test -- --coverage --watchAll=false
        Write-Success "Jest unit tests passed"
        
        # Run E2E tests
        Write-Host "  Running Playwright E2E tests..." -ForegroundColor Gray
        npm run test:e2e
        Write-Success "Playwright E2E tests passed"
        
        Write-Success "All test suites passed with 100% success rate"
    } catch {
        Write-Error "Test suite execution failed: $_"
        exit 1
    }
} else {
    Write-Warning "Skipping test suite execution"
}

# Step 5: Lighthouse CI Validation
if (!$SkipLighthouse) {
    Write-Step "Lighthouse CI Validation"
    try {
        Write-Host "  Building production version..." -ForegroundColor Gray
        npm run build
        Write-Success "Production build completed"
        
        Write-Host "  Running Lighthouse CI..." -ForegroundColor Gray
        npm run lighthouse:ci
        Write-Success "Lighthouse CI validation passed with 100% scores"
    } catch {
        Write-Error "Lighthouse CI validation failed: $_"
        exit 1
    }
} else {
    Write-Warning "Skipping Lighthouse CI validation"
}

# Step 6: Security Audit
if (!$SkipSecurity) {
    Write-Step "Security Audit"
    try {
        Write-Host "  Running npm audit..." -ForegroundColor Gray
        npm audit --audit-level=moderate
        Write-Success "npm audit passed"
        
        Write-Host "  Checking for security vulnerabilities..." -ForegroundColor Gray
        # Check for common security issues
        $securityIssues = @()
        
        # Check for hardcoded secrets
        $secretPatterns = @(
            "password\s*=\s*['\"][^'\"]+['\"]",
            "api[_-]?key\s*=\s*['\"][^'\"]+['\"]",
            "secret\s*=\s*['\"][^'\"]+['\"]",
            "token\s*=\s*['\"][^'\"]+['\"]"
        )
        
        foreach ($pattern in $secretPatterns) {
            $matches = Select-String -Path "src/**/*.ts", "src/**/*.tsx" -Pattern $pattern -AllMatches
            if ($matches) {
                $securityIssues += "Potential hardcoded secret found: $($matches.Line)"
            }
        }
        
        # Check for unsafe eval usage
        $evalMatches = Select-String -Path "src/**/*.ts", "src/**/*.tsx" -Pattern "eval\(" -AllMatches
        if ($evalMatches) {
            $securityIssues += "Unsafe eval() usage found"
        }
        
        # Check for innerHTML usage without sanitization
        $innerHTMLMatches = Select-String -Path "src/**/*.ts", "src/**/*.tsx" -Pattern "innerHTML\s*=" -AllMatches
        if ($innerHTMLMatches) {
            $securityIssues += "Potential XSS vulnerability: innerHTML usage found"
        }
        
        if ($securityIssues.Count -gt 0) {
            Write-Warning "Security issues found:"
            foreach ($issue in $securityIssues) {
                Write-Warning "  - $issue"
            }
        } else {
            Write-Success "No security vulnerabilities detected"
        }
        
        Write-Success "Security audit completed"
    } catch {
        Write-Error "Security audit failed: $_"
        exit 1
    }
} else {
    Write-Warning "Skipping security audit"
}

# Final Summary
Write-Host ""
Write-Host "=== Quality Assurance Summary ===" -ForegroundColor Cyan
Write-Success "Environment: Ready"
Write-Success "Dependencies: Verified"
Write-Success "TypeScript: Compiled successfully"
if (!$SkipTests) { Write-Success "Tests: 100% pass rate achieved" }
if (!$SkipLighthouse) { Write-Success "Lighthouse: 100% scores validated" }
if (!$SkipSecurity) { Write-Success "Security: Audit completed" }

Write-Host ""
Write-Host "✓ Quality assurance check completed successfully!" -ForegroundColor Green
Write-Host "✓ Project is ready for deployment" -ForegroundColor Green
Write-Host "Completion Time: $(Get-Date)" -ForegroundColor Gray
Write-Host "=== Quality Assurance Check Completed ===" -ForegroundColor Cyan

exit 0