# Monitoring and Alerting System Setup
# Implements comprehensive monitoring for the samuido website

param(
    [switch]$Install = $false,
    [switch]$Configure = $false,
    [switch]$Test = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=== samuido Website - Monitoring System Setup ===" -ForegroundColor Cyan
Write-Host "Execution Time: $(Get-Date)" -ForegroundColor Gray

function Write-Step {
    param($message)
    Write-Host "→ $message" -ForegroundColor Yellow
}

function Write-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Info {
    param($message)
    Write-Host "ℹ $message" -ForegroundColor Blue
}

# Health Check Endpoint Configuration
Write-Step "Setting up health check endpoints"

$healthCheckConfig = @{
    endpoints = @{
        "/api/health" = @{
            checks = @("database", "external-apis", "file-system", "memory")
            timeout = 5000
            retries = 3
        }
        "/api/health/detailed" = @{
            checks = @("all")
            timeout = 10000
            retries = 1
            auth = $true
        }
    }
    alerts = @{
        email = @{
            enabled = $true
            recipients = @("rebuild.up.up@gmail.com")
            threshold = 3
        }
        webhook = @{
            enabled = $false
            url = ""
        }
    }
}

$healthCheckJson = $healthCheckConfig | ConvertTo-Json -Depth 10
$healthCheckJson | Out-File -FilePath "config/health-check.json" -Encoding UTF8
Write-Success "Health check configuration created"

# Performance Monitoring Configuration
Write-Step "Configuring performance monitoring"

$performanceConfig = @{
    metrics = @{
        "core-web-vitals" = @{
            lcp = @{ threshold = 2500; alert = $true }
            fid = @{ threshold = 100; alert = $true }
            cls = @{ threshold = 0.1; alert = $true }
        }
        "api-response-time" = @{
            threshold = 1000
            alert = $true
        }
        "memory-usage" = @{
            threshold = 80
            alert = $true
        }
        "error-rate" = @{
            threshold = 1
            alert = $true
        }
    }
    collection = @{
        interval = 60000
        retention = "30d"
        aggregation = "5m"
    }
    alerts = @{
        channels = @("email", "console")
        cooldown = 300000
    }
}

$performanceJson = $performanceConfig | ConvertTo-Json -Depth 10
$performanceJson | Out-File -FilePath "config/performance-monitoring.json" -Encoding UTF8
Write-Success "Performance monitoring configuration created"

# Error Tracking Configuration
Write-Step "Setting up error tracking"

$errorTrackingConfig = @{
    capture = @{
        "javascript-errors" = $true
        "api-errors" = $true
        "network-errors" = $true
        "performance-issues" = $true
    }
    filtering = @{
        "ignore-patterns" = @(
            "Script error",
            "Non-Error promise rejection captured",
            "ResizeObserver loop limit exceeded"
        )
        "rate-limit" = 100
    }
    reporting = @{
        "immediate" = @("critical", "error")
        "batched" = @("warning", "info")
        "batch-size" = 50
        "batch-interval" = 300000
    }
}

$errorTrackingJson = $errorTrackingConfig | ConvertTo-Json -Depth 10
$errorTrackingJson | Out-File -FilePath "config/error-tracking.json" -Encoding UTF8
Write-Success "Error tracking configuration created"

# Uptime Monitoring Script
Write-Step "Creating uptime monitoring script"

$uptimeScript = @'
# Uptime Monitoring Script
# Monitors website availability and performance

param(
    [string]$Url = "https://yusuke-kim.com",
    [int]$Interval = 60,
    [int]$Timeout = 30,
    [string]$LogFile = "logs/uptime.log"
)

function Test-WebsiteHealth {
    param($Url, $Timeout)
    
    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing
        $end = Get-Date
        $responseTime = ($end - $start).TotalMilliseconds
        
        return @{
            Status = "UP"
            StatusCode = $response.StatusCode
            ResponseTime = $responseTime
            Timestamp = $start
            Error = $null
        }
    } catch {
        return @{
            Status = "DOWN"
            StatusCode = $null
            ResponseTime = $null
            Timestamp = Get-Date
            Error = $_.Exception.Message
        }
    }
}

function Send-Alert {
    param($Status, $Error, $Url)
    
    $subject = "Website Alert: $Url is $Status"
    $body = @"
Website Status Alert

URL: $Url
Status: $Status
Time: $(Get-Date)
Error: $Error

Please check the website immediately.
"@
    
    Write-Host "ALERT: $subject" -ForegroundColor Red
    Write-Host $body -ForegroundColor Yellow
    
    # In production, send actual email alert
    # Send-MailMessage -To "admin@example.com" -Subject $subject -Body $body
}

Write-Host "Starting uptime monitoring for $Url" -ForegroundColor Green
Write-Host "Checking every $Interval seconds" -ForegroundColor Gray

$consecutiveFailures = 0
$lastStatus = "UP"

while ($true) {
    $result = Test-WebsiteHealth -Url $Url -Timeout $Timeout
    
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | $($result.Status) | $($result.StatusCode) | $($result.ResponseTime)ms | $($result.Error)"
    
    # Log to file
    if (!(Test-Path (Split-Path $LogFile))) {
        New-Item -ItemType Directory -Path (Split-Path $LogFile) -Force | Out-Null
    }
    Add-Content -Path $LogFile -Value $logEntry
    
    # Console output
    if ($result.Status -eq "UP") {
        Write-Host "✓ $($result.StatusCode) - $($result.ResponseTime)ms" -ForegroundColor Green
        $consecutiveFailures = 0
        
        if ($lastStatus -eq "DOWN") {
            Send-Alert -Status "RECOVERED" -Error "Website is back online" -Url $Url
        }
    } else {
        Write-Host "✗ DOWN - $($result.Error)" -ForegroundColor Red
        $consecutiveFailures++
        
        if ($consecutiveFailures -ge 3 -and $lastStatus -eq "UP") {
            Send-Alert -Status "DOWN" -Error $result.Error -Url $Url
        }
    }
    
    $lastStatus = $result.Status
    Start-Sleep -Seconds $Interval
}
'@

$uptimeScript | Out-File -FilePath "scripts/uptime-monitor.ps1" -Encoding UTF8
Write-Success "Uptime monitoring script created"

# Log Rotation Script
Write-Step "Creating log rotation script"

$logRotationScript = @'
# Log Rotation Script
# Manages log file sizes and retention

param(
    [string]$LogDirectory = "logs",
    [int]$MaxSizeMB = 100,
    [int]$RetentionDays = 30
)

function Rotate-LogFile {
    param($FilePath, $MaxSizeMB)
    
    if (Test-Path $FilePath) {
        $file = Get-Item $FilePath
        $sizeMB = $file.Length / 1MB
        
        if ($sizeMB -gt $MaxSizeMB) {
            $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            $rotatedName = "$($file.BaseName)-$timestamp$($file.Extension)"
            $rotatedPath = Join-Path $file.Directory $rotatedName
            
            Move-Item $FilePath $rotatedPath
            Write-Host "Rotated: $($file.Name) -> $rotatedName" -ForegroundColor Yellow
            
            # Compress rotated log
            if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
                $compressedPath = "$rotatedPath.zip"
                Compress-Archive -Path $rotatedPath -DestinationPath $compressedPath
                Remove-Item $rotatedPath
                Write-Host "Compressed: $rotatedName.zip" -ForegroundColor Green
            }
        }
    }
}

function Remove-OldLogs {
    param($Directory, $RetentionDays)
    
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $oldFiles = Get-ChildItem $Directory -File | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    
    foreach ($file in $oldFiles) {
        Remove-Item $file.FullName -Force
        Write-Host "Removed old log: $($file.Name)" -ForegroundColor Red
    }
}

if (Test-Path $LogDirectory) {
    Write-Host "Starting log rotation for $LogDirectory" -ForegroundColor Green
    
    # Rotate large log files
    $logFiles = Get-ChildItem $LogDirectory -Filter "*.log" -File
    foreach ($logFile in $logFiles) {
        Rotate-LogFile -FilePath $logFile.FullName -MaxSizeMB $MaxSizeMB
    }
    
    # Remove old logs
    Remove-OldLogs -Directory $LogDirectory -RetentionDays $RetentionDays
    
    Write-Host "Log rotation completed" -ForegroundColor Green
} else {
    Write-Host "Log directory not found: $LogDirectory" -ForegroundColor Yellow
}
'@

$logRotationScript | Out-File -FilePath "scripts/log-rotation.ps1" -Encoding UTF8
Write-Success "Log rotation script created"

# Monitoring Dashboard Configuration
Write-Step "Setting up monitoring dashboard"

if ($Configure) {
    Write-Info "Configuring monitoring dashboard endpoints..."
    
    # Create monitoring API endpoints configuration
    $monitoringEndpoints = @{
        "/api/monitoring/status" = @{
            description = "Overall system status"
            method = "GET"
            auth = $false
        }
        "/api/monitoring/metrics" = @{
            description = "Performance metrics"
            method = "GET"
            auth = $true
        }
        "/api/monitoring/alerts" = @{
            description = "Active alerts"
            method = "GET"
            auth = $true
        }
        "/api/monitoring/logs" = @{
            description = "Recent logs"
            method = "GET"
            auth = $true
        }
    }
    
    $endpointsJson = $monitoringEndpoints | ConvertTo-Json -Depth 10
    $endpointsJson | Out-File -FilePath "config/monitoring-endpoints.json" -Encoding UTF8
    Write-Success "Monitoring endpoints configured"
}

# Test Monitoring System
if ($Test) {
    Write-Step "Testing monitoring system"
    
    try {
        # Test health check endpoint
        Write-Info "Testing health check endpoint..."
        $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($healthResponse.StatusCode -eq 200) {
            Write-Success "Health check endpoint responding"
        } else {
            Write-Error "Health check endpoint not responding"
        }
        
        # Test monitoring endpoints
        $monitoringEndpoints = @(
            "/api/monitoring/performance",
            "/api/monitoring/errors",
            "/api/monitoring/alerts"
        )
        
        foreach ($endpoint in $monitoringEndpoints) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000$endpoint" -UseBasicParsing -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-Success "Endpoint $endpoint responding"
                } else {
                    Write-Error "Endpoint $endpoint not responding properly"
                }
            } catch {
                Write-Error "Endpoint $endpoint failed: $($_.Exception.Message)"
            }
        }
        
        Write-Success "Monitoring system test completed"
    } catch {
        Write-Error "Monitoring system test failed: $_"
    }
}

# Create monitoring service configuration
Write-Step "Creating monitoring service configuration"

$serviceConfig = @{
    name = "samuido-monitoring"
    description = "Monitoring service for samuido website"
    startup = @{
        command = "powershell"
        args = @("-ExecutionPolicy", "Bypass", "-File", "scripts/uptime-monitor.ps1")
        workingDirectory = (Get-Location).Path
    }
    monitoring = @{
        healthCheck = @{
            enabled = $true
            interval = 60
            timeout = 30
        }
        logging = @{
            enabled = $true
            level = "info"
            rotation = $true
        }
        alerts = @{
            enabled = $true
            channels = @("email", "console")
        }
    }
}

$serviceJson = $serviceConfig | ConvertTo-Json -Depth 10
$serviceJson | Out-File -FilePath "config/monitoring-service.json" -Encoding UTF8
Write-Success "Monitoring service configuration created"

Write-Host ""
Write-Host "=== Monitoring System Setup Summary ===" -ForegroundColor Cyan
Write-Success "Health check configuration: config/health-check.json"
Write-Success "Performance monitoring: config/performance-monitoring.json"
Write-Success "Error tracking: config/error-tracking.json"
Write-Success "Uptime monitor: scripts/uptime-monitor.ps1"
Write-Success "Log rotation: scripts/log-rotation.ps1"
Write-Success "Service configuration: config/monitoring-service.json"

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: scripts/uptime-monitor.ps1 (for continuous monitoring)" -ForegroundColor Gray
Write-Host "2. Schedule: scripts/log-rotation.ps1 (daily via Task Scheduler)" -ForegroundColor Gray
Write-Host "3. Configure: Email alerts in production environment" -ForegroundColor Gray
Write-Host "4. Deploy: Monitoring dashboard to production" -ForegroundColor Gray

Write-Host ""
Write-Host "✓ Monitoring and alerting system setup completed!" -ForegroundColor Green
Write-Host "Completion Time: $(Get-Date)" -ForegroundColor Gray
Write-Host "=== Monitoring System Setup Completed ===" -ForegroundColor Cyan

exit 0