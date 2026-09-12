# Lighthouse Audit Script for Windows (Fixed)
# Run Lighthouse audits on all public pages

$ErrorActionPreference = "Continue"

$BASE_URL = "https://yusuke-kim.com"
$OUT_DIR = Join-Path $PSScriptRoot "..\lighthouse-results"
$LIGHTHOUSE_CMD = Join-Path $PSScriptRoot "..\node_modules\.bin\lighthouse.cmd"

# Create output directory
New-Item -ItemType Directory -Force -Path $OUT_DIR | Out-Null

# Pages to audit
$PAGES = @(
    # Main
    "/",
    "/about",
    "/portfolio",
    "/search",
    "/offline",
    "/privacy-policy",

    # Portfolio
    "/portfolio/gallery/all",
    "/portfolio/gallery/develop",
    "/portfolio/gallery/video",
    "/portfolio/gallery/video&design",

    # About profiles
    "/about/profile/real",
    "/about/profile/handle",
    "/about/profile/AI",

    # About cards
    "/about/card/real",
    "/about/card/handle",

    # Commission
    "/about/commission/develop",
    "/about/commission/video",
    "/about/commission/estimate",

    # About
    "/about/links",

    # Tools
    "/tools",
    "/tools/ProtoType",
    "/tools/ae-expression",
    "/tools/business-mail-block",
    "/tools/code-type-p5",
    "/tools/color-palette",
    "/tools/fillgen",
    "/tools/history-quiz",
    "/tools/pi-game",
    "/tools/pomodoro",
    "/tools/qr-generator",
    "/tools/sequential-png-preview",
    "/tools/svg2tsx",
    "/tools/text-counter",

    # Workshop
    "/workshop",
    "/workshop/downloads",
    "/workshop/plugins"
)

Write-Host "Starting Lighthouse audits..." -ForegroundColor Cyan
Write-Host "Output directory: $OUT_DIR" -ForegroundColor Cyan
Write-Host ""

$RESULTS = @()
$FAILED_PAGES = 0
$SUCCESS_COUNT = 0
$ERROR_COUNT = 0

foreach ($PAGE in $PAGES) {
    $URL = "$BASE_URL$PAGE"
    $SAFE_NAME = $PAGE -replace '[^a-z0-9-]', '-' -replace '-+', '-' -replace '^-*|-*$', ''
    $OUTPUT_FILE = Join-Path $OUT_DIR "$SAFE_NAME.report.json"

    Write-Host "[$($PAGES.IndexOf($PAGE) + 1)/$($PAGES.Count)] Auditing: $URL" -ForegroundColor Yellow

    try {
        # Run Lighthouse using Node directly
        $process = Start-Process -FilePath "node" -ArgumentList "`"$LIGHTHOUSE_CMD`"", "`"$URL`"", "--output=json", "--chrome-flags=`"--headless --disable-gpu --no-sandbox --disable-dev-shm-usage`"", "--quiet" -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$OUTPUT_FILE.tmp" -RedirectStandardError (Join-Path $OUT_DIR "$SAFE_NAME.error.log")

        # Check if output was created
        if (Test-Path "$OUTPUT_FILE.tmp") {
            # Try to parse the output
            try {
                $CONTENT = Get-Content "$OUTPUT_FILE.tmp" -Raw -Encoding UTF8

                # Check if it's valid JSON
                if ($CONTENT -match '^{') {
                    $CONTENT | Out-File -FilePath $OUTPUT_FILE -Encoding UTF8
                    Remove-Item "$OUTPUT_FILE.tmp" -ErrorAction SilentlyContinue

                    # Parse JSON
                    $REPORT = $CONTENT | ConvertFrom-Json

                    if ($REPORT.categories) {
                        $PERF = [math]::Round($REPORT.categories.performance.score * 100)
                        $A11Y = [math]::Round($REPORT.categories.accessibility.score * 100)
                        $BP = [math]::Round($REPORT.categories."best-practices".score * 100)
                        $SEO = [math]::Round($REPORT.categories.seo.score * 100)

                        $BELOW_95 = @()
                        if ($PERF -lt 95) { $BELOW_95 += "Performance: $PERF" }
                        if ($A11Y -lt 95) { $BELOW_95 += "Accessibility: $A11Y" }
                        if ($BP -lt 95) { $BELOW_95 += "Best Practices: $BP" }
                        if ($SEO -lt 95) { $BELOW_95 += "SEO: $SEO" }

                        $RESULTS += [PSCustomObject]@{
                            Path      = $PAGE
                            Performance = $PERF
                            Accessibility = $A11Y
                            BestPractices = $BP
                            SEO       = $SEO
                            Below95   = $BELOW_95
                        }

                        if ($BELOW_95.Count -gt 0) {
                            $FAILED_PAGES++
                            Write-Host "  ❌ Scores: P:$PERF A:$A11Y BP:$BP S:$SEO" -ForegroundColor Red
                        } else {
                            $SUCCESS_COUNT++
                            Write-Host "  ✅ All scores ≥ 95% (P:$PERF A:$A11Y BP:$BP S:$SEO)" -ForegroundColor Green
                        }
                    } else {
                        Write-Host "  ⚠️  Invalid report structure" -ForegroundColor Yellow
                        $ERROR_COUNT++
                    }
                } else {
                    Write-Host "  ⚠️  Invalid JSON output" -ForegroundColor Yellow
                    $ERROR_COUNT++
                }
            } catch {
                Write-Host "  ⚠️  Parse error: $_" -ForegroundColor Yellow
                $ERROR_COUNT++
            }
        } else {
            Write-Host "  ⚠️  No output generated" -ForegroundColor Yellow
            $ERROR_COUNT++
        }
    } catch {
        Write-Host "  ⚠️  Error: $_" -ForegroundColor Yellow
        $ERROR_COUNT++
    }

    # Clean up temp files
    Remove-Item "$OUTPUT_FILE.tmp" -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $OUT_DIR "$SAFE_NAME.error.log") -ErrorAction SilentlyContinue

    Write-Host ""

    # Small delay between audits
    Start-Sleep -Milliseconds 1000
}

# Generate summary
$SUMMARY = @{
    Timestamp  = (Get-Date).ToString("o")
    BaseUrl    = $BASE_URL
    TotalPages = $PAGES.Count
    SuccessPages = $SUCCESS_COUNT
    ErrorPages = $ERROR_COUNT
    PagesBelow95 = $FAILED_PAGES
    Results    = $RESULTS | Sort-Object { $_.Below95.Count } -Descending
}

$SUMMARY_JSON = $SUMMARY | ConvertTo-Json -Depth 10
$SUMMARY_JSON | Out-File -FilePath (Join-Path $OUT_DIR "summary.json") -Encoding UTF8

# Console output
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "LIGHTHOUSE AUDIT SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Total pages audited: $($PAGES.Count)" -ForegroundColor White
Write-Host "Successfully audited: $SUCCESS_COUNT" -ForegroundColor Green
Write-Host "Errors: $ERROR_COUNT" -ForegroundColor Yellow
Write-Host "Pages below 95%: $FAILED_PAGES" -ForegroundColor Red
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

if ($FAILED_PAGES -gt 0) {
    Write-Host "PAGES NEEDING IMPROVEMENT:" -ForegroundColor Red
    Write-Host ""

    $RESULTS | Where-Object { $_.Below95.Count -gt 0 } | ForEach-Object {
        Write-Host "🔴 $($_.Path)" -ForegroundColor Red
        Write-Host "   Performance: $($_.Performance) | Accessibility: $($_.Accessibility) | Best Practices: $($_.BestPractices) | SEO: $($_.SEO)" -ForegroundColor Yellow
        Write-Host ""
    }
}

if ($SUCCESS_COUNT -gt 0 -and $FAILED_PAGES -eq 0) {
    Write-Host "🎉 All audited pages scored 95% or higher!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Detailed reports saved to: lighthouse-results/" -ForegroundColor Cyan
