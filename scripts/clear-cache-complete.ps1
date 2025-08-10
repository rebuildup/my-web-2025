# Complete Cache Clear PowerShell Script
# ブラウザキャッシュの問題を完全に解決するためのPowerShellスクリプト

param(
    [switch]$Verbose,
    [switch]$SkipBrowserCache,
    [switch]$RestartDev
)

Write-Host "🚀 Complete Cache Clear Script Starting..." -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray

# 関数定義
function Write-Status {
    param($Message, $Type = "Info")
    
    $color = switch ($Type) {
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        "Info" { "Cyan" }
        default { "White" }
    }
    
    $icon = switch ($Type) {
        "Success" { "✅" }
        "Warning" { "⚠️" }
        "Error" { "❌" }
        "Info" { "ℹ️" }
        default { "📝" }
    }
    
    Write-Host "$icon $Message" -ForegroundColor $color
}

function Remove-DirectorySafe {
    param($Path, $Description)
    
    if (Test-Path $Path) {
        try {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            Write-Status "$Description cleared: $Path" "Success"
            return $true
        }
        catch {
            Write-Status "Failed to clear $Description`: $($_.Exception.Message)" "Error"
            return $false
        }
    }
    else {
        Write-Status "$Description not found: $Path" "Info"
        return $false
    }
}

function Remove-FileSafe {
    param($Path, $Description)
    
    if (Test-Path $Path) {
        try {
            Remove-Item -Path $Path -Force -ErrorAction Stop
            Write-Status "$Description cleared: $Path" "Success"
            return $true
        }
        catch {
            Write-Status "Failed to clear $Description`: $($_.Exception.Message)" "Error"
            return $false
        }
    }
    else {
        Write-Status "$Description not found: $Path" "Info"
        return $false
    }
}

# メイン処理開始
try {
    Write-Status "Clearing Next.js caches..." "Info"
    
    # Next.js関連キャッシュ
    $nextCaches = @(
        @{Path = ".next"; Desc = "Next.js build cache"},
        @{Path = ".next\cache"; Desc = "Next.js runtime cache"},
        @{Path = ".next\static"; Desc = "Next.js static assets"},
        @{Path = ".next\server"; Desc = "Next.js server cache"},
        @{Path = ".swc"; Desc = "SWC compiler cache"},
        @{Path = ".turbo"; Desc = "Turbopack cache"}
    )
    
    foreach ($cache in $nextCaches) {
        Remove-DirectorySafe -Path $cache.Path -Description $cache.Desc
    }
    
    Write-Status "Clearing Node.js module caches..." "Info"
    
    # Node.js関連キャッシュ
    $nodeCaches = @(
        @{Path = "node_modules\.cache"; Desc = "Node modules cache"},
        @{Path = "node_modules\.cache\jest"; Desc = "Jest cache"},
        @{Path = "node_modules\.cache\@swc"; Desc = "SWC cache"},
        @{Path = "node_modules\.cache\webpack"; Desc = "Webpack cache"},
        @{Path = "node_modules\.cache\terser-webpack-plugin"; Desc = "Terser cache"},
        @{Path = "node_modules\.cache\babel-loader"; Desc = "Babel loader cache"}
    )
    
    foreach ($cache in $nodeCaches) {
        Remove-DirectorySafe -Path $cache.Path -Description $cache.Desc
    }
    
    Write-Status "Clearing compiler caches..." "Info"
    
    # コンパイラ関連キャッシュ
    $compilerCaches = @(
        @{Path = "tsconfig.tsbuildinfo"; Desc = "TypeScript build info"},
        @{Path = ".tsbuildinfo"; Desc = "TypeScript build info (alt)"},
        @{Path = ".eslintcache"; Desc = "ESLint cache"},
        @{Path = ".prettiercache"; Desc = "Prettier cache"},
        @{Path = "type-coverage.json"; Desc = "Type coverage cache"}
    )
    
    foreach ($cache in $compilerCaches) {
        Remove-FileSafe -Path $cache.Path -Description $cache.Desc
    }
    
    Write-Status "Clearing test caches..." "Info"
    
    # テスト関連キャッシュ
    $testCaches = @(
        @{Path = "coverage"; Desc = "Jest coverage reports"},
        @{Path = "test-results"; Desc = "Playwright test results"},
        @{Path = "playwright-report"; Desc = "Playwright HTML reports"},
        @{Path = "logs"; Desc = "Application logs"}
    )
    
    foreach ($cache in $testCaches) {
        Remove-DirectorySafe -Path $cache.Path -Description $cache.Desc
    }
    
    # ビルドID更新
    Write-Status "Updating build ID for cache busting..." "Info"
    
    $buildId = [System.Guid]::NewGuid().ToString("N").Substring(0, 16)
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    
    # ビルドIDファイル作成
    $buildId | Out-File -FilePath ".next-build-id" -Encoding UTF8
    Write-Status "New build ID generated: $buildId" "Success"
    
    # package.json バージョン更新
    if (Test-Path "package.json") {
        try {
            $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
            $versionParts = $packageJson.version -split '\.'
            $patchVersion = [int]$versionParts[2] + 1
            $packageJson.version = "$($versionParts[0]).$($versionParts[1]).$patchVersion"
            
            $packageJson | ConvertTo-Json -Depth 100 | Out-File -FilePath "package.json" -Encoding UTF8
            Write-Status "Package version updated to: $($packageJson.version)" "Success"
        }
        catch {
            Write-Status "Failed to update package version: $($_.Exception.Message)" "Warning"
        }
    }
    
    # キャッシュバスティング設定生成
    Write-Status "Generating cache busting configuration..." "Info"
    
    $cacheBustConfig = @{
        timestamp = $timestamp
        buildId = $buildId
        headers = @{
            "Cache-Control" = "no-cache, no-store, must-revalidate"
            "Pragma" = "no-cache"
            "Expires" = "0"
            "ETag" = "`"$buildId`""
            "Last-Modified" = (Get-Date).ToUniversalTime().ToString("R")
        }
        meta = @{
            viewport = "width=device-width, initial-scale=1"
            "cache-control" = "no-cache, no-store, must-revalidate"
        }
    }
    
    $cacheBustConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "cache-bust-config.json" -Encoding UTF8
    Write-Status "Cache busting configuration generated" "Success"
    
    # ブラウザキャッシュクリアスクリプト作成
    Write-Status "Creating browser cache clear script..." "Info"
    
    $browserScript = @"
// Browser Cache Clear Script
// このスクリプトをブラウザのコンソールで実行してください

(function() {
  console.log('🧹 ブラウザキャッシュをクリアしています...');
  
  // Service Worker の登録解除
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        console.log('✅ Service Worker unregistered');
      }
    });
  }
  
  // Local Storage クリア
  if (typeof(Storage) !== "undefined") {
    localStorage.clear();
    console.log('✅ Local Storage cleared');
    
    sessionStorage.clear();
    console.log('✅ Session Storage cleared');
  }
  
  // IndexedDB クリア
  if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        indexedDB.deleteDatabase(db.name);
        console.log('✅ IndexedDB cleared:', db.name);
      });
    });
  }
  
  // Cache API クリア
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('✅ Cache cleared:', name);
      });
    });
  }
  
  console.log('🎉 ブラウザキャッシュのクリアが完了しました！');
  console.log('💡 ページを強制リロード（Ctrl+Shift+R / Cmd+Shift+R）してください');
  
  // 自動リロード（オプション）
  setTimeout(() => {
    if (confirm('ページをリロードしますか？')) {
      window.location.reload(true);
    }
  }, 2000);
})();
"@
    
    # publicディレクトリが存在しない場合は作成
    if (-not (Test-Path "public")) {
        New-Item -ItemType Directory -Path "public" -Force | Out-Null
    }
    
    $browserScript | Out-File -FilePath "public\clear-browser-cache.js" -Encoding UTF8
    Write-Status "Browser cache clear script created at: public\clear-browser-cache.js" "Success"
    
    # ブラウザキャッシュクリア（強化版）
    if (-not $SkipBrowserCache) {
        Write-Status "Clearing all browser caches (enhanced)..." "Info"
        
        # Chrome キャッシュクリア（全プロファイル対応）
        $chromeUserData = "$env:LOCALAPPDATA\Google\Chrome\User Data"
        if (Test-Path $chromeUserData) {
            Write-Status "Clearing Chrome caches..." "Info"
            
            # 全プロファイルのキャッシュをクリア
            Get-ChildItem $chromeUserData -Directory | Where-Object { $_.Name -match "^(Default|Profile \d+)$" } | ForEach-Object {
                $profilePath = $_.FullName
                $profileName = $_.Name
                
                # 各種キャッシュディレクトリ
                $cacheDirs = @(
                    "Cache",
                    "Code Cache",
                    "GPUCache", 
                    "Service Worker",
                    "IndexedDB",
                    "Local Storage",
                    "Session Storage",
                    "WebStorage",
                    "databases",
                    "Application Cache"
                )
                
                foreach ($cacheDir in $cacheDirs) {
                    $fullCachePath = Join-Path $profilePath $cacheDir
                    Remove-DirectorySafe -Path $fullCachePath -Description "Chrome $profileName $cacheDir"
                }
            }
        }
        
        # Edge キャッシュクリア（全プロファイル対応）
        $edgeUserData = "$env:LOCALAPPDATA\Microsoft\Edge\User Data"
        if (Test-Path $edgeUserData) {
            Write-Status "Clearing Edge caches..." "Info"
            
            Get-ChildItem $edgeUserData -Directory | Where-Object { $_.Name -match "^(Default|Profile \d+)$" } | ForEach-Object {
                $profilePath = $_.FullName
                $profileName = $_.Name
                
                $cacheDirs = @(
                    "Cache",
                    "Code Cache",
                    "GPUCache",
                    "Service Worker",
                    "IndexedDB",
                    "Local Storage",
                    "Session Storage",
                    "WebStorage",
                    "databases"
                )
                
                foreach ($cacheDir in $cacheDirs) {
                    $fullCachePath = Join-Path $profilePath $cacheDir
                    Remove-DirectorySafe -Path $fullCachePath -Description "Edge $profileName $cacheDir"
                }
            }
        }
        
        # Firefox キャッシュクリア（強化版）
        $firefoxProfiles = "$env:APPDATA\Mozilla\Firefox\Profiles"
        if (Test-Path $firefoxProfiles) {
            Write-Status "Clearing Firefox caches..." "Info"
            
            Get-ChildItem $firefoxProfiles -Directory | ForEach-Object {
                $profilePath = $_.FullName
                $profileName = $_.Name
                
                $cacheDirs = @(
                    "cache2",
                    "startupCache",
                    "OfflineCache",
                    "storage",
                    "indexedDB",
                    "webappsstore.sqlite",
                    "chromeappsstore.sqlite"
                )
                
                foreach ($cacheDir in $cacheDirs) {
                    $fullCachePath = Join-Path $profilePath $cacheDir
                    if (Test-Path $fullCachePath) {
                        if ((Get-Item $fullCachePath).PSIsContainer) {
                            Remove-DirectorySafe -Path $fullCachePath -Description "Firefox $profileName $cacheDir"
                        } else {
                            Remove-FileSafe -Path $fullCachePath -Description "Firefox $profileName $cacheDir"
                        }
                    }
                }
            }
        }
        
        # Internet Explorer キャッシュクリア
        $ieCache = "$env:LOCALAPPDATA\Microsoft\Windows\INetCache"
        if (Test-Path $ieCache) {
            Remove-DirectorySafe -Path $ieCache -Description "Internet Explorer cache"
        }
        
        # Safari キャッシュクリア（Windows版）
        $safariCache = "$env:LOCALAPPDATA\Apple Computer\Safari"
        if (Test-Path $safariCache) {
            Remove-DirectorySafe -Path $safariCache -Description "Safari cache"
        }
        
        # Opera キャッシュクリア
        $operaCache = "$env:APPDATA\Opera Software\Opera Stable\Cache"
        if (Test-Path $operaCache) {
            Remove-DirectorySafe -Path $operaCache -Description "Opera cache"
        }
        
        # Brave キャッシュクリア
        $braveUserData = "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data"
        if (Test-Path $braveUserData) {
            Write-Status "Clearing Brave caches..." "Info"
            
            Get-ChildItem $braveUserData -Directory | Where-Object { $_.Name -match "^(Default|Profile \d+)$" } | ForEach-Object {
                $profilePath = $_.FullName
                $profileName = $_.Name
                
                $cacheDirs = @("Cache", "Code Cache", "GPUCache", "Service Worker")
                
                foreach ($cacheDir in $cacheDirs) {
                    $fullCachePath = Join-Path $profilePath $cacheDir
                    Remove-DirectorySafe -Path $fullCachePath -Description "Brave $profileName $cacheDir"
                }
            }
        }
        
        # システム全体のDNSキャッシュクリア
        try {
            Write-Status "Clearing DNS cache..." "Info"
            & ipconfig /flushdns | Out-Null
            Write-Status "DNS cache cleared" "Success"
        } catch {
            Write-Status "Failed to clear DNS cache: $($_.Exception.Message)" "Warning"
        }
        
        # Windows Store アプリキャッシュクリア
        try {
            Write-Status "Clearing Windows Store cache..." "Info"
            & wsreset.exe /noui
            Write-Status "Windows Store cache cleared" "Success"
        } catch {
            Write-Status "Failed to clear Windows Store cache: $($_.Exception.Message)" "Warning"
        }
    }
    
    # 検証
    Write-Status "Verifying cache cleanup..." "Info"
    
    $checkPaths = @(".next", "node_modules\.cache", ".eslintcache", ".prettiercache", "tsconfig.tsbuildinfo")
    $allCleared = $true
    
    foreach ($path in $checkPaths) {
        if (Test-Path $path) {
            Write-Status "Still exists: $path" "Warning"
            $allCleared = $false
        }
    }
    
    if ($allCleared) {
        Write-Status "All caches successfully cleared!" "Success"
    } else {
        Write-Status "Some caches may still exist" "Warning"
    }
    
    # 完了メッセージ
    Write-Status "🎉 Complete cache clear finished successfully!" "Success"
    Write-Host ""
    Write-Status "次のステップ:" "Info"
    Write-Status "1. 開発サーバーを再起動: npm run dev" "Info"
    Write-Status "2. ブラウザで強制リロード: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)" "Info"
    Write-Status "3. 必要に応じてブラウザのキャッシュクリアスクリプトを実行" "Info"
    Write-Status "   → ブラウザコンソールで public/clear-browser-cache.js の内容を実行" "Info"
    
    # 開発サーバー自動再起動
    if ($RestartDev) {
        Write-Status "Restarting development server..." "Info"
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow
    }
    
}
catch {
    Write-Status "Cache clear process failed: $($_.Exception.Message)" "Error"
    exit 1
}

Write-Host ""
Write-Status "Script completed at $(Get-Date)" "Info"