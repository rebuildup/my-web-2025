# Security Audit Script for samuido-website
# Comprehensive security vulnerability scanning and penetration testing

param(
    [switch]$Full = $false,
    [switch]$Dependencies = $true,
    [switch]$Code = $true,
    [switch]$Configuration = $true,
    [switch]$Network = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=== samuido Website - Security Audit ===" -ForegroundColor Cyan
Write-Host "Execution Time: $(Get-Date)" -ForegroundColor Gray

$auditResults = @{
    passed = 0
    failed = 0
    warnings = 0
    issues = @()
}

function Write-Step {
    param($message)
    Write-Host "→ $message" -ForegroundColor Yellow
}

function Write-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
    $script:auditResults.passed++
}

function Write-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
    $script:auditResults.failed++
    $script:auditResults.issues += $message
}

function Write-Warning {
    param($message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
    $script:auditResults.warnings++
    $script:auditResults.issues += "WARNING: $message"
}

function Write-Info {
    param($message)
    Write-Host "ℹ $message" -ForegroundColor Blue
}

# Dependency Security Audit
if ($Dependencies) {
    Write-Step "Dependency Security Audit"
    
    try {
        Write-Info "Running npm audit..."
        $auditOutput = npm audit --json 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "No known vulnerabilities in dependencies"
        } else {
            $auditData = $auditOutput | ConvertFrom-Json
            
            if ($auditData.vulnerabilities) {
                $criticalCount = 0
                $highCount = 0
                $moderateCount = 0
                $lowCount = 0
                
                foreach ($vuln in $auditData.vulnerabilities.PSObject.Properties) {
                    switch ($vuln.Value.severity) {
                        "critical" { $criticalCount++ }
                        "high" { $highCount++ }
                        "moderate" { $moderateCount++ }
                        "low" { $lowCount++ }
                    }
                }
                
                if ($criticalCount -gt 0) {
                    Write-Error "$criticalCount critical vulnerabilities found"
                }
                if ($highCount -gt 0) {
                    Write-Error "$highCount high severity vulnerabilities found"
                }
                if ($moderateCount -gt 0) {
                    Write-Warning "$moderateCount moderate severity vulnerabilities found"
                }
                if ($lowCount -gt 0) {
                    Write-Info "$lowCount low severity vulnerabilities found"
                }
            }
        }
        
        # Check for outdated packages
        Write-Info "Checking for outdated packages..."
        $outdatedOutput = npm outdated --json 2>$null
        
        if ($outdatedOutput) {
            $outdatedData = $outdatedOutput | ConvertFrom-Json
            $outdatedCount = ($outdatedData.PSObject.Properties | Measure-Object).Count
            
            if ($outdatedCount -gt 0) {
                Write-Warning "$outdatedCount packages are outdated"
                if ($Verbose) {
                    foreach ($package in $outdatedData.PSObject.Properties) {
                        Write-Info "  $($package.Name): $($package.Value.current) → $($package.Value.latest)"
                    }
                }
            } else {
                Write-Success "All packages are up to date"
            }
        } else {
            Write-Success "All packages are up to date"
        }
        
    } catch {
        Write-Error "Dependency audit failed: $_"
    }
}

# Code Security Analysis
if ($Code) {
    Write-Step "Code Security Analysis"
    
    # Check for hardcoded secrets
    Write-Info "Scanning for hardcoded secrets..."
    $secretPatterns = @(
        @{ pattern = "password\s*[:=]\s*['\"][^'\"]{8,}['\"]"; description = "Hardcoded password" },
        @{ pattern = "api[_-]?key\s*[:=]\s*['\"][^'\"]{20,}['\"]"; description = "Hardcoded API key" },
        @{ pattern = "secret\s*[:=]\s*['\"][^'\"]{16,}['\"]"; description = "Hardcoded secret" },
        @{ pattern = "token\s*[:=]\s*['\"][^'\"]{20,}['\"]"; description = "Hardcoded token" },
        @{ pattern = "private[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]"; description = "Hardcoded private key" },
        @{ pattern = "-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----"; description = "Private key in code" }
    )
    
    $secretsFound = $false
    foreach ($pattern in $secretPatterns) {
        $matches = Select-String -Path "src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx" -Pattern $pattern.pattern -AllMatches 2>$null
        if ($matches) {
            Write-Error "$($pattern.description) found in code"
            $secretsFound = $true
            if ($Verbose) {
                foreach ($match in $matches) {
                    Write-Info "  $($match.Filename):$($match.LineNumber)"
                }
            }
        }
    }
    
    if (!$secretsFound) {
        Write-Success "No hardcoded secrets found"
    }
    
    # Check for unsafe code patterns
    Write-Info "Scanning for unsafe code patterns..."
    $unsafePatterns = @(
        @{ pattern = "eval\s*\("; description = "Unsafe eval() usage" },
        @{ pattern = "innerHTML\s*=\s*[^;]+\+"; description = "Potential XSS via innerHTML concatenation" },
        @{ pattern = "document\.write\s*\("; description = "Unsafe document.write() usage" },
        @{ pattern = "dangerouslySetInnerHTML"; description = "React dangerouslySetInnerHTML usage" },
        @{ pattern = "window\[.*\]\s*\("; description = "Dynamic window property access" },
        @{ pattern = "new\s+Function\s*\("; description = "Dynamic function creation" }
    )
    
    $unsafeFound = $false
    foreach ($pattern in $unsafePatterns) {
        $matches = Select-String -Path "src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx" -Pattern $pattern.pattern -AllMatches 2>$null
        if ($matches) {
            Write-Warning "$($pattern.description) found"
            $unsafeFound = $true
            if ($Verbose) {
                foreach ($match in $matches) {
                    Write-Info "  $($match.Filename):$($match.LineNumber): $($match.Line.Trim())"
                }
            }
        }
    }
    
    if (!$unsafeFound) {
        Write-Success "No unsafe code patterns found"
    }
    
    # Check for proper input validation
    Write-Info "Checking input validation patterns..."
    $validationFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | Where-Object { $_.Name -like "*validation*" -or $_.Name -like "*sanitiz*" }
    
    if ($validationFiles.Count -gt 0) {
        Write-Success "Input validation files found: $($validationFiles.Count)"
    } else {
        Write-Warning "No dedicated input validation files found"
    }
    
    # Check for CSRF protection
    $csrfFiles = Select-String -Path "src/**/*.ts", "src/**/*.tsx" -Pattern "csrf|CSRF" -AllMatches 2>$null
    if ($csrfFiles) {
        Write-Success "CSRF protection implementation found"
    } else {
        Write-Warning "No CSRF protection implementation found"
    }
}

# Configuration Security Check
if ($Configuration) {
    Write-Step "Configuration Security Check"
    
    # Check Next.js configuration
    if (Test-Path "next.config.ts") {
        Write-Info "Checking Next.js configuration..."
        $nextConfig = Get-Content "next.config.ts" -Raw
        
        # Check for security headers
        if ($nextConfig -match "X-Frame-Options|X-Content-Type-Options|X-XSS-Protection") {
            Write-Success "Security headers configured in Next.js"
        } else {
            Write-Warning "Security headers not found in Next.js config"
        }
        
        # Check for CSP
        if ($nextConfig -match "Content-Security-Policy|contentSecurityPolicy") {
            Write-Success "Content Security Policy configured"
        } else {
            Write-Warning "Content Security Policy not configured"
        }
        
        # Check for HTTPS redirect
        if ($nextConfig -match "https|ssl|secure") {
            Write-Success "HTTPS configuration found"
        } else {
            Write-Warning "HTTPS configuration not explicitly found"
        }
    } else {
        Write-Warning "next.config.ts not found"
    }
    
    # Check environment variables
    Write-Info "Checking environment variable security..."
    if (Test-Path ".env.example") {
        $envExample = Get-Content ".env.example"
        $sensitiveVars = $envExample | Where-Object { $_ -match "SECRET|KEY|PASSWORD|TOKEN" }
        
        if ($sensitiveVars) {
            Write-Success "Sensitive environment variables properly documented"
        }
    }
    
    # Check for .env files in version control
    if (Test-Path ".gitignore") {
        $gitignore = Get-Content ".gitignore"
        if ($gitignore -contains ".env" -or $gitignore -contains ".env.*") {
            Write-Success "Environment files properly ignored in git"
        } else {
            Write-Error "Environment files not properly ignored in git"
        }
    }
    
    # Check package.json scripts for security
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        # Check for audit script
        if ($packageJson.scripts.audit -or $packageJson.scripts."security:audit") {
            Write-Success "Security audit script configured"
        } else {
            Write-Warning "No security audit script found in package.json"
        }
        
        # Check for HTTPS in scripts
        $unsecureScripts = $packageJson.scripts.PSObject.Properties | Where-Object { $_.Value -match "http://" -and $_.Value -notmatch "localhost|127\.0\.0\.1" }
        if ($unsecureScripts) {
            Write-Warning "Insecure HTTP URLs found in package.json scripts"
        } else {
            Write-Success "No insecure URLs found in package.json scripts"
        }
    }
}

# Network Security Check (if enabled)
if ($Network) {
    Write-Step "Network Security Check"
    
    Write-Info "Testing SSL/TLS configuration..."
    try {
        # Test HTTPS redirect
        $httpResponse = Invoke-WebRequest -Uri "http://localhost:3000" -MaximumRedirection 0 -ErrorAction SilentlyContinue
        if ($httpResponse.StatusCode -eq 301 -or $httpResponse.StatusCode -eq 302) {
            $location = $httpResponse.Headers.Location
            if ($location -and $location.StartsWith("https://")) {
                Write-Success "HTTP to HTTPS redirect configured"
            } else {
                Write-Warning "HTTP redirect not properly configured"
            }
        }
    } catch {
        Write-Info "HTTP redirect test skipped (server not running)"
    }
    
    # Check for security headers
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
        
        $securityHeaders = @(
            "X-Frame-Options",
            "X-Content-Type-Options",
            "X-XSS-Protection",
            "Strict-Transport-Security",
            "Content-Security-Policy",
            "Referrer-Policy"
        )
        
        foreach ($header in $securityHeaders) {
            if ($response.Headers[$header]) {
                Write-Success "Security header present: $header"
            } else {
                Write-Warning "Security header missing: $header"
            }
        }
    } catch {
        Write-Info "Security headers test skipped (server not running)"
    }
}

# Generate Security Report
Write-Step "Generating Security Report"

$reportPath = "security-audit-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$report = @"
=== samuido Website Security Audit Report ===
Generated: $(Get-Date)
Audit Type: $(if ($Full) { "Full" } else { "Standard" })

SUMMARY:
- Passed: $($auditResults.passed)
- Failed: $($auditResults.failed)
- Warnings: $($auditResults.warnings)
- Total Issues: $($auditResults.issues.Count)

ISSUES FOUND:
$($auditResults.issues | ForEach-Object { "- $_" } | Out-String)

RECOMMENDATIONS:
1. Fix all critical and high severity vulnerabilities immediately
2. Update outdated packages regularly
3. Implement proper input validation and sanitization
4. Configure comprehensive security headers
5. Enable HTTPS in production
6. Implement Content Security Policy
7. Regular security audits and penetration testing
8. Monitor for new vulnerabilities continuously

NEXT STEPS:
1. Address all failed checks immediately
2. Review and fix warnings
3. Implement missing security measures
4. Schedule regular security audits
5. Set up automated vulnerability monitoring

=== End of Report ===
"@

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Success "Security report generated: $reportPath"

# Final Summary
Write-Host ""
Write-Host "=== Security Audit Summary ===" -ForegroundColor Cyan

if ($auditResults.failed -eq 0) {
    Write-Host "✓ Security audit completed successfully!" -ForegroundColor Green
    Write-Host "✓ No critical security issues found" -ForegroundColor Green
} else {
    Write-Host "⚠ Security audit completed with issues" -ForegroundColor Yellow
    Write-Host "✗ $($auditResults.failed) critical issues found" -ForegroundColor Red
}

Write-Host "📊 Results: $($auditResults.passed) passed, $($auditResults.failed) failed, $($auditResults.warnings) warnings" -ForegroundColor Gray
Write-Host "📄 Report: $reportPath" -ForegroundColor Gray
Write-Host "Completion Time: $(Get-Date)" -ForegroundColor Gray
Write-Host "=== Security Audit Completed ===" -ForegroundColor Cyan

if ($auditResults.failed -gt 0) {
    exit 1
} else {
    exit 0
}