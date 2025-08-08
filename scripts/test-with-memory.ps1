# PowerShell script to run tests with increased memory limit
$env:NODE_OPTIONS = "--max-old-space-size=24576"
$env:NODE_ENV = "test"

Write-Host "Running tests with 24GB memory limit..." -ForegroundColor Green
Write-Host "NODE_OPTIONS: $env:NODE_OPTIONS" -ForegroundColor Yellow

# Run the test command
npm run test:single