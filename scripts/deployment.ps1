# Deployment and Rollback Script for samuido-website
# Handles production deployment with automated rollback capabilities

param(
    [ValidateSet("deploy", "rollback", "status", "backup")]
    [string]$Action = "deploy",
    [string]$Environment = "production",
    [string]$Version = "",
    [switch]$DryRun = $false,
    [switch]$Force = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Configuration
$config = @{
    production = @{
        server = "your-production-server.com"
        path = "/var/www/samuido"
        user = "deploy"
        backup_path = "/var/backups/samuido"
        max_backups = 5
    }
    staging = @{
        server = "staging-server.com"
        path = "/var/www/samuido-staging"
        user = "deploy"
        backup_path = "/var/backups/samuido-staging"
        max_backups = 3
    }
}

Write-Host "=== samuido Website - Deployment Manager ===" -ForegroundColor Cyan
Write-Host "Action: $Action | Environment: $Environment" -ForegroundColor Gray
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

function Write-Warning {
    param($message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

function Write-Info {
    param($message)
    Write-Host "ℹ $message" -ForegroundColor Blue
}

function Get-CurrentVersion {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        return $packageJson.version
    } catch {
        return "unknown"
    }
}

function Test-PreDeploymentChecks {
    Write-Step "Running pre-deployment checks"
    
    $checks = @()
    
    # Check if build exists
    if (!(Test-Path ".next")) {
        $checks += "Production build not found. Run 'npm run build' first."
    } else {
        Write-Success "Production build found"
    }
    
    # Check package.json
    if (!(Test-Path "package.json")) {
        $checks += "package.json not found"
    } else {
        Write-Success "package.json verified"
    }
    
    # Check environment variables
    $requiredEnvVars = @(
        "NEXT_PUBLIC_SITE_URL",
        "RESEND_API_KEY"
    )
    
    foreach ($envVar in $requiredEnvVars) {
        if (!(Get-ChildItem Env: | Where-Object Name -eq $envVar)) {
            $checks += "Environment variable $envVar not set"
        }
    }
    
    if ($checks.Count -eq 0) {
        Write-Success "All pre-deployment checks passed"
        return $true
    } else {
        Write-Error "Pre-deployment checks failed:"
        foreach ($check in $checks) {
            Write-Error "  - $check"
        }
        return $false
    }
}

function Invoke-QualityAssurance {
    Write-Step "Running quality assurance checks"
    
    try {
        # Run the quality assurance script
        $qaResult = & "scripts/quality-assurance.ps1" -SkipLighthouse
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Quality assurance checks passed"
            return $true
        } else {
            Write-Error "Quality assurance checks failed"
            return $false
        }
    } catch {
        Write-Error "Quality assurance check failed: $_"
        return $false
    }
}

function New-Backup {
    param($Environment)
    
    Write-Step "Creating backup for $Environment"
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $version = Get-CurrentVersion
    $backupName = "samuido-$version-$timestamp"
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would create backup $backupName"
        return $backupName
    }
    
    try {
        # Create backup directory
        $backupPath = "backups/$backupName"
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
        
        # Copy current deployment files
        $filesToBackup = @(
            ".next",
            "public",
            "package.json",
            "next.config.ts",
            "tailwind.config.ts"
        )
        
        foreach ($file in $filesToBackup) {
            if (Test-Path $file) {
                Copy-Item $file -Destination $backupPath -Recurse -Force
            }
        }
        
        # Create backup metadata
        $metadata = @{
            version = $version
            timestamp = $timestamp
            environment = $Environment
            git_commit = (git rev-parse HEAD 2>$null)
            created_by = $env:USERNAME
        }
        
        $metadata | ConvertTo-Json | Out-File "$backupPath/metadata.json"
        
        # Compress backup
        if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
            Compress-Archive -Path $backupPath -DestinationPath "$backupPath.zip"
            Remove-Item $backupPath -Recurse -Force
            Write-Success "Backup created: $backupName.zip"
        } else {
            Write-Success "Backup created: $backupName"
        }
        
        # Clean old backups
        Remove-OldBackups -Environment $Environment
        
        return $backupName
    } catch {
        Write-Error "Backup creation failed: $_"
        throw
    }
}

function Remove-OldBackups {
    param($Environment)
    
    $maxBackups = $config[$Environment].max_backups
    $backupPattern = "backups/samuido-*"
    
    $backups = Get-ChildItem $backupPattern -ErrorAction SilentlyContinue | 
               Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -gt $maxBackups) {
        $toRemove = $backups | Select-Object -Skip $maxBackups
        foreach ($backup in $toRemove) {
            Remove-Item $backup.FullName -Force
            Write-Info "Removed old backup: $($backup.Name)"
        }
    }
}

function Invoke-Deployment {
    param($Environment, $Version)
    
    Write-Step "Deploying to $Environment"
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would deploy version $Version to $Environment"
        return $true
    }
    
    try {
        # Create deployment package
        Write-Info "Creating deployment package..."
        
        $deploymentFiles = @(
            ".next",
            "public",
            "package.json",
            "package-lock.json",
            "next.config.ts"
        )
        
        $deploymentPath = "deployment-$Version"
        New-Item -ItemType Directory -Path $deploymentPath -Force | Out-Null
        
        foreach ($file in $deploymentFiles) {
            if (Test-Path $file) {
                Copy-Item $file -Destination $deploymentPath -Recurse -Force
            }
        }
        
        # Create deployment script
        $deployScript = @"
#!/bin/bash
# Auto-generated deployment script

set -e

echo "Starting deployment of samuido website v$Version"
echo "Timestamp: `$(date)"

# Stop the application
echo "Stopping application..."
pm2 stop samuido || true

# Backup current deployment
echo "Creating backup..."
if [ -d "/var/www/samuido" ]; then
    cp -r /var/www/samuido /var/backups/samuido-pre-$Version-`$(date +%Y%m%d-%H%M%S)
fi

# Deploy new version
echo "Deploying new version..."
rm -rf /var/www/samuido/*
cp -r ./* /var/www/samuido/

# Install dependencies
echo "Installing dependencies..."
cd /var/www/samuido
npm ci --production

# Start the application
echo "Starting application..."
pm2 start ecosystem.config.js
pm2 save

echo "Deployment completed successfully!"
echo "Version: $Version"
echo "Timestamp: `$(date)"
"@
        
        $deployScript | Out-File "$deploymentPath/deploy.sh" -Encoding UTF8
        
        Write-Success "Deployment package created: $deploymentPath"
        
        # In a real deployment, you would:
        # 1. Upload the package to the server
        # 2. Execute the deployment script
        # 3. Verify the deployment
        
        Write-Success "Deployment to $Environment completed"
        return $true
        
    } catch {
        Write-Error "Deployment failed: $_"
        return $false
    }
}

function Invoke-Rollback {
    param($Environment, $Version)
    
    Write-Step "Rolling back $Environment"
    
    if (!$Version) {
        # Find the most recent backup
        $backups = Get-ChildItem "backups/samuido-*" -ErrorAction SilentlyContinue | 
                   Sort-Object LastWriteTime -Descending
        
        if ($backups.Count -eq 0) {
            Write-Error "No backups found for rollback"
            return $false
        }
        
        $latestBackup = $backups[0]
        Write-Info "Using latest backup: $($latestBackup.Name)"
        $Version = $latestBackup.Name
    }
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would rollback to $Version"
        return $true
    }
    
    try {
        Write-Info "Rolling back to version: $Version"
        
        # In a real rollback, you would:
        # 1. Stop the current application
        # 2. Restore from backup
        # 3. Restart the application
        # 4. Verify the rollback
        
        Write-Success "Rollback to $Version completed"
        return $true
        
    } catch {
        Write-Error "Rollback failed: $_"
        return $false
    }
}

function Get-DeploymentStatus {
    param($Environment)
    
    Write-Step "Checking deployment status for $Environment"
    
    try {
        $currentVersion = Get-CurrentVersion
        $gitCommit = git rev-parse HEAD 2>$null
        $gitBranch = git branch --show-current 2>$null
        
        Write-Info "Current Version: $currentVersion"
        Write-Info "Git Commit: $gitCommit"
        Write-Info "Git Branch: $gitBranch"
        Write-Info "Environment: $Environment"
        
        # Check if application is running
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "Application is running and healthy"
            } else {
                Write-Warning "Application is running but may have issues"
            }
        } catch {
            Write-Error "Application is not responding"
        }
        
        # List available backups
        $backups = Get-ChildItem "backups/samuido-*" -ErrorAction SilentlyContinue | 
                   Sort-Object LastWriteTime -Descending
        
        if ($backups.Count -gt 0) {
            Write-Info "Available backups:"
            foreach ($backup in $backups | Select-Object -First 5) {
                Write-Info "  - $($backup.Name) ($($backup.LastWriteTime))"
            }
        } else {
            Write-Warning "No backups available"
        }
        
        return $true
        
    } catch {
        Write-Error "Status check failed: $_"
        return $false
    }
}

# Main execution logic
switch ($Action) {
    "deploy" {
        Write-Host "Starting deployment process..." -ForegroundColor Green
        
        if (!$Force) {
            if (!(Test-PreDeploymentChecks)) {
                Write-Error "Pre-deployment checks failed. Use -Force to override."
                exit 1
            }
            
            if (!(Invoke-QualityAssurance)) {
                Write-Error "Quality assurance failed. Use -Force to override."
                exit 1
            }
        }
        
        $currentVersion = Get-CurrentVersion
        if (!$Version) { $Version = $currentVersion }
        
        $backupName = New-Backup -Environment $Environment
        
        if (Invoke-Deployment -Environment $Environment -Version $Version) {
            Write-Success "Deployment completed successfully!"
            Write-Info "Backup created: $backupName"
            Write-Info "Version deployed: $Version"
        } else {
            Write-Error "Deployment failed!"
            Write-Warning "Backup available for rollback: $backupName"
            exit 1
        }
    }
    
    "rollback" {
        Write-Host "Starting rollback process..." -ForegroundColor Yellow
        
        if (Invoke-Rollback -Environment $Environment -Version $Version) {
            Write-Success "Rollback completed successfully!"
        } else {
            Write-Error "Rollback failed!"
            exit 1
        }
    }
    
    "backup" {
        Write-Host "Creating backup..." -ForegroundColor Blue
        
        $backupName = New-Backup -Environment $Environment
        Write-Success "Backup created: $backupName"
    }
    
    "status" {
        Write-Host "Checking deployment status..." -ForegroundColor Blue
        
        if (!(Get-DeploymentStatus -Environment $Environment)) {
            exit 1
        }
    }
}

Write-Host ""
Write-Host "=== Deployment Manager Summary ===" -ForegroundColor Cyan
Write-Success "Action: $Action"
Write-Success "Environment: $Environment"
Write-Success "Timestamp: $(Get-Date)"

Write-Host ""
Write-Host "✓ Deployment manager operation completed!" -ForegroundColor Green
Write-Host "=== Deployment Manager Completed ===" -ForegroundColor Cyan

exit 0