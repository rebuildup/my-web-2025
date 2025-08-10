#!/usr/bin/env node

/**
 * Complete Cache Clear Script
 * ブラウザキャッシュの問題を完全に解決するための包括的なキャッシュクリアスクリプト
 *
 * 機能:
 * - Next.js関連のすべてのキャッシュをクリア
 * - ブラウザキャッシュバスティング用のビルドIDを更新
 * - 開発・本番環境両方に対応
 * - キャッシュクリア後の検証機能
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

class CompleteCacheCleaner {
  constructor() {
    this.rootDir = process.cwd();
    this.timestamp = Date.now();
    this.buildId = crypto.randomBytes(16).toString("hex");
  }

  async log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      start: "🚀",
      clean: "🧹",
    };

    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  async removeDirectory(dirPath, description) {
    const fullPath = path.join(this.rootDir, dirPath);
    try {
      if (fsSync.existsSync(fullPath)) {
        await fs.rm(fullPath, { recursive: true, force: true });
        await this.log(`${description} cleared: ${dirPath}`, "success");
        return true;
      } else {
        await this.log(`${description} not found: ${dirPath}`, "info");
        return false;
      }
    } catch (error) {
      await this.log(
        `Failed to clear ${description}: ${error.message}`,
        "error",
      );
      return false;
    }
  }

  async removeFile(filePath, description) {
    const fullPath = path.join(this.rootDir, filePath);
    try {
      if (fsSync.existsSync(fullPath)) {
        await fs.unlink(fullPath);
        await this.log(`${description} cleared: ${filePath}`, "success");
        return true;
      } else {
        await this.log(`${description} not found: ${filePath}`, "info");
        return false;
      }
    } catch (error) {
      await this.log(
        `Failed to clear ${description}: ${error.message}`,
        "error",
      );
      return false;
    }
  }

  async clearNextJsCache() {
    await this.log("Clearing Next.js caches...", "clean");

    const caches = [
      { path: ".next", desc: "Next.js build cache" },
      { path: ".next/cache", desc: "Next.js runtime cache" },
      { path: ".next/static", desc: "Next.js static assets" },
      { path: ".next/server", desc: "Next.js server cache" },
      { path: ".swc", desc: "SWC compiler cache" },
      { path: ".turbo", desc: "Turbopack cache" },
    ];

    for (const cache of caches) {
      await this.removeDirectory(cache.path, cache.desc);
    }
  }

  async clearNodeModulesCache() {
    await this.log("Clearing Node.js module caches...", "clean");

    const caches = [
      { path: "node_modules/.cache", desc: "Node modules cache" },
      { path: "node_modules/.cache/jest", desc: "Jest cache" },
      { path: "node_modules/.cache/@swc", desc: "SWC cache" },
      { path: "node_modules/.cache/webpack", desc: "Webpack cache" },
      {
        path: "node_modules/.cache/terser-webpack-plugin",
        desc: "Terser cache",
      },
      { path: "node_modules/.cache/babel-loader", desc: "Babel loader cache" },
    ];

    for (const cache of caches) {
      await this.removeDirectory(cache.path, cache.desc);
    }
  }

  async clearCompilerCache() {
    await this.log("Clearing compiler caches...", "clean");

    const caches = [
      { path: "tsconfig.tsbuildinfo", desc: "TypeScript build info" },
      { path: ".tsbuildinfo", desc: "TypeScript build info (alt)" },
      { path: ".eslintcache", desc: "ESLint cache" },
      { path: ".prettiercache", desc: "Prettier cache" },
      { path: "type-coverage.json", desc: "Type coverage cache" },
    ];

    for (const cache of caches) {
      await this.removeFile(cache.path, cache.desc);
    }
  }

  async clearTestCache() {
    await this.log("Clearing test caches...", "clean");

    const caches = [
      { path: "coverage", desc: "Jest coverage reports" },
      { path: "test-results", desc: "Playwright test results" },
      { path: "playwright-report", desc: "Playwright HTML reports" },
      { path: "logs", desc: "Application logs" },
    ];

    for (const cache of caches) {
      await this.removeDirectory(cache.path, cache.desc);
    }
  }

  async updateBuildId() {
    await this.log("Updating build ID for cache busting...", "clean");

    try {
      // Create a build ID file to force cache invalidation
      const buildIdPath = path.join(this.rootDir, ".next-build-id");
      await fs.writeFile(buildIdPath, this.buildId);
      await this.log(`New build ID generated: ${this.buildId}`, "success");

      // Update package.json version for additional cache busting
      const packageJsonPath = path.join(this.rootDir, "package.json");
      if (fsSync.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf8"),
        );
        const versionParts = packageJson.version.split(".");
        const patchVersion = parseInt(versionParts[2] || "0") + 1;
        packageJson.version = `${versionParts[0]}.${versionParts[1]}.${patchVersion}`;

        await fs.writeFile(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2),
        );
        await this.log(
          `Package version updated to: ${packageJson.version}`,
          "success",
        );
      }
    } catch (error) {
      await this.log(`Failed to update build ID: ${error.message}`, "error");
    }
  }

  async generateCacheBustingHeaders() {
    await this.log("Generating cache busting configuration...", "clean");

    const cacheBustConfig = {
      timestamp: this.timestamp,
      buildId: this.buildId,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        ETag: `"${this.buildId}"`,
        "Last-Modified": new Date().toUTCString(),
      },
      meta: {
        viewport: "width=device-width, initial-scale=1",
        "cache-control": "no-cache, no-store, must-revalidate",
      },
    };

    const configPath = path.join(this.rootDir, "cache-bust-config.json");
    await fs.writeFile(configPath, JSON.stringify(cacheBustConfig, null, 2));
    await this.log("Cache busting configuration generated", "success");
  }

  async createBrowserCacheScript() {
    await this.log("Creating browser cache clear script...", "clean");

    const browserScript = `
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
`;

    const scriptPath = path.join(
      this.rootDir,
      "public",
      "clear-browser-cache.js",
    );

    // public ディレクトリが存在しない場合は作成
    const publicDir = path.join(this.rootDir, "public");
    if (!fsSync.existsSync(publicDir)) {
      await fs.mkdir(publicDir, { recursive: true });
    }

    await fs.writeFile(scriptPath, browserScript);
    await this.log(
      "Browser cache clear script created at: public/clear-browser-cache.js",
      "success",
    );
  }

  async verifyCleanup() {
    await this.log("Verifying cache cleanup...", "clean");

    const checkPaths = [
      ".next",
      "node_modules/.cache",
      ".eslintcache",
      ".prettiercache",
      "tsconfig.tsbuildinfo",
    ];

    let allCleared = true;
    for (const checkPath of checkPaths) {
      const fullPath = path.join(this.rootDir, checkPath);
      if (fsSync.existsSync(fullPath)) {
        await this.log(`Still exists: ${checkPath}`, "warning");
        allCleared = false;
      }
    }

    if (allCleared) {
      await this.log("All caches successfully cleared!", "success");
    } else {
      await this.log("Some caches may still exist", "warning");
    }
  }

  async run() {
    await this.log("Starting complete cache clear process...", "start");

    try {
      await this.clearNextJsCache();
      await this.clearNodeModulesCache();
      await this.clearCompilerCache();
      await this.clearTestCache();
      await this.updateBuildId();
      await this.generateCacheBustingHeaders();
      await this.createBrowserCacheScript();
      await this.verifyCleanup();

      await this.log(
        "🎉 Complete cache clear finished successfully!",
        "success",
      );
      await this.log("", "info");
      await this.log("次のステップ:", "info");
      await this.log("1. 開発サーバーを再起動: npm run dev", "info");
      await this.log(
        "2. ブラウザで強制リロード: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)",
        "info",
      );
      await this.log(
        "3. 必要に応じてブラウザのキャッシュクリアスクリプトを実行",
        "info",
      );
      await this.log(
        "   → ブラウザコンソールで public/clear-browser-cache.js の内容を実行",
        "info",
      );
    } catch (error) {
      await this.log(`Cache clear process failed: ${error.message}`, "error");
      process.exit(1);
    }
  }
}

// スクリプト実行
const cleaner = new CompleteCacheCleaner();
cleaner.run();
