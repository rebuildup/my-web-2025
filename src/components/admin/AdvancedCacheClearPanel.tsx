"use client";

import {
  AdvancedBrowserCacheManager,
  clearAllBrowserCaches,
  diagnoseBrowserCache,
  type BrowserCacheInfo,
  type CacheClearResult,
} from "@/lib/advanced-cache-utils";
import { useCallback, useEffect, useState } from "react";

interface ExtendedCacheState {
  serviceWorkers: number;
  localStorage: number;
  sessionStorage: number;
  caches: string[];
  indexedDBs: string[];
  cookies: number;
  performance: boolean;
}

export default function AdvancedCacheClearPanel() {
  const [isClearing, setIsClearing] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [cacheState, setCacheState] = useState<ExtendedCacheState | null>(null);
  const [browserInfo, setBrowserInfo] = useState<BrowserCacheInfo | null>(null);
  const [clearResult, setClearResult] = useState<CacheClearResult | null>(null);
  const [lastCleared, setLastCleared] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const manager = AdvancedBrowserCacheManager.getInstance();

  const loadCacheState = useCallback(async () => {
    try {
      const diagnosis = await manager.diagnoseCacheState();
      setCacheState({
        serviceWorkers: diagnosis.cacheState.serviceWorkers as number,
        localStorage: diagnosis.cacheState.localStorage as number,
        sessionStorage: diagnosis.cacheState.sessionStorage as number,
        caches: diagnosis.cacheState.caches as string[],
        indexedDBs: diagnosis.cacheState.indexedDBs as string[],
        cookies: diagnosis.cacheState.cookies as number,
        performance: diagnosis.cacheState.performance as boolean,
      });
      setRecommendations(diagnosis.recommendations);
    } catch (error) {
      console.error("Failed to load cache state:", error);
    }
  }, [manager]);

  const loadBrowserInfo = useCallback(async () => {
    try {
      const info = await manager.detectBrowserInfo();
      setBrowserInfo(info);
    } catch (error) {
      console.error("Failed to load browser info:", error);
    }
  }, [manager]);

  const loadInitialData = useCallback(async () => {
    await loadBrowserInfo();
    await loadCacheState();
  }, [loadBrowserInfo, loadCacheState]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const result = await clearAllBrowserCaches();
      setClearResult(result);
      await loadCacheState();
      setLastCleared(new Date().toLocaleString("ja-JP"));

      if (result.errors.length > 0) {
        console.warn(
          "キャッシュクリア中にエラーが発生しました:",
          result.errors,
        );
        alert(
          `キャッシュクリアは完了しましたが、${result.errors.length}件のエラーがありました。詳細はコンソールを確認してください。`,
        );
      }
    } catch (error) {
      console.error("Cache clear failed:", error);
      alert("キャッシュクリアに失敗しました。コンソールを確認してください。");
    } finally {
      setIsClearing(false);
    }
  };

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    try {
      await diagnoseBrowserCache();
      await loadCacheState();
    } catch (error) {
      console.error("Diagnosis failed:", error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleForceReload = () => {
    if (confirm("ページを強制リロードしますか？未保存の変更は失われます。")) {
      window.location.reload();
    }
  };

  const getTotalCacheItems = () => {
    if (!cacheState) return 0;
    return (
      cacheState.serviceWorkers +
      cacheState.localStorage +
      cacheState.sessionStorage +
      cacheState.caches.length +
      cacheState.indexedDBs.length +
      cacheState.cookies
    );
  };

  const getCacheHealthStatus = () => {
    const total = getTotalCacheItems();
    if (total === 0)
      return { status: "excellent", color: "green", message: "完全にクリーン" };
    if (total < 5) return { status: "good", color: "blue", message: "良好" };
    if (total < 20)
      return { status: "warning", color: "yellow", message: "注意が必要" };
    return { status: "critical", color: "red", message: "要クリア" };
  };

  const health = getCacheHealthStatus();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🧹 高度なキャッシュクリア管理パネル
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          全ブラウザ（通常・シークレットモード）対応の完全キャッシュクリア機能
        </p>
      </div>

      {/* キャッシュ健康状態 */}
      <div
        className={`mb-6 p-4 rounded-lg border-2 border-${health.color}-200 bg-${health.color}-50 dark:bg-${health.color}-900/20`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`font-semibold text-${health.color}-900 dark:text-${health.color}-100 text-lg`}
            >
              📊 キャッシュ健康状態: {health.message}
            </h3>
            <p
              className={`text-${health.color}-700 dark:text-${health.color}-300`}
            >
              合計キャッシュアイテム: {getTotalCacheItems()}
            </p>
          </div>
          <div
            className={`text-4xl font-bold text-${health.color}-600 dark:text-${health.color}-400`}
          >
            {health.status === "excellent" && "🟢"}
            {health.status === "good" && "🔵"}
            {health.status === "warning" && "🟡"}
            {health.status === "critical" && "🔴"}
          </div>
        </div>
      </div>

      {/* ブラウザ情報 */}
      {browserInfo && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🌐 ブラウザ情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>ブラウザ:</strong> {browserInfo.browser}{" "}
                {browserInfo.version}
              </p>
              <p>
                <strong>プラットフォーム:</strong> {browserInfo.platform}
              </p>
              <p>
                <strong>シークレットモード:</strong>{" "}
                {browserInfo.isIncognito ? "有効" : "無効"}
              </p>
            </div>
            <div>
              {browserInfo.issues.length > 0 && (
                <div className="mb-2">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    既知の問題:
                  </p>
                  <ul className="text-blue-700 dark:text-blue-300 ml-4 text-xs">
                    {browserInfo.issues.slice(0, 3).map((issue, index) => (
                      <li key={index} className="list-disc">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {browserInfo.solutions.length > 0 && (
            <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/30 rounded">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                推奨解決策:
              </p>
              <ul className="text-blue-700 dark:text-blue-300 ml-4 text-xs">
                {browserInfo.solutions.slice(0, 4).map((solution, index) => (
                  <li key={index} className="list-disc">
                    {solution}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* キャッシュ状態詳細 */}
      {cacheState && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            📊 詳細キャッシュ状態
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-600 p-3 rounded shadow">
              <p className="font-medium text-gray-900 dark:text-white">
                Service Workers
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {cacheState.serviceWorkers}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-600 p-3 rounded shadow">
              <p className="font-medium text-gray-900 dark:text-white">
                Local Storage
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {cacheState.localStorage}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-600 p-3 rounded shadow">
              <p className="font-medium text-gray-900 dark:text-white">
                Session Storage
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {cacheState.sessionStorage}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-600 p-3 rounded shadow">
              <p className="font-medium text-gray-900 dark:text-white">
                Cache API
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {cacheState.caches.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-600 p-3 rounded shadow">
              <p className="font-medium text-gray-900 dark:text-white">
                IndexedDB
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {cacheState.indexedDBs.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-600 p-3 rounded shadow">
              <p className="font-medium text-gray-900 dark:text-white">
                Cookies
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {cacheState.cookies}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-600 p-3 rounded shadow">
              <p className="font-medium text-gray-900 dark:text-white">
                Performance
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {cacheState.performance ? "✓" : "✗"}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-600 p-3 rounded shadow">
              <p className="font-medium text-gray-900 dark:text-white">合計</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTotalCacheItems()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 推奨事項 */}
      {recommendations.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            💡 推奨事項
          </h4>
          <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* アクションボタン */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
          >
            {isClearing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                完全クリア中...
              </>
            ) : (
              <>🧹 完全キャッシュクリア</>
            )}
          </button>

          <button
            onClick={handleDiagnose}
            disabled={isDiagnosing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
          >
            {isDiagnosing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                診断中...
              </>
            ) : (
              <>🔍 詳細診断</>
            )}
          </button>

          <button
            onClick={handleForceReload}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            🔄 強制リロード
          </button>

          <button
            onClick={loadCacheState}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            📊 状態更新
          </button>
        </div>

        {/* 結果表示 */}
        {lastCleared && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              ✅ 最後のキャッシュクリア: {lastCleared}
            </p>
          </div>
        )}

        {clearResult && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 クリア結果詳細
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>Service Workers: {clearResult.serviceWorkers}</div>
              <div>Local Storage: {clearResult.localStorage ? "✓" : "✗"}</div>
              <div>
                Session Storage: {clearResult.sessionStorage ? "✓" : "✗"}
              </div>
              <div>IndexedDB: {clearResult.indexedDB}</div>
              <div>Cache API: {clearResult.cacheAPI}</div>
              <div>Cookies: {clearResult.cookies}</div>
              <div>Performance: {clearResult.performance ? "✓" : "✗"}</div>
              <div>Memory: {clearResult.memory ? "✓" : "✗"}</div>
            </div>
            {clearResult.errors.length > 0 && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                <p className="text-red-800 dark:text-red-200 font-medium">
                  エラー:
                </p>
                <ul className="text-red-700 dark:text-red-300 text-xs ml-4">
                  {clearResult.errors.map((error, index) => (
                    <li key={index} className="list-disc">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 詳細情報 */}
      {cacheState &&
        (cacheState.caches.length > 0 || cacheState.indexedDBs.length > 0) && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              📋 詳細情報
            </h4>
            {cacheState.caches.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Cache API エントリ ({cacheState.caches.length}):
                </p>
                <div className="max-h-32 overflow-y-auto">
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 ml-4">
                    {cacheState.caches.map((cache, index) => (
                      <li key={index} className="list-disc text-xs">
                        {cache}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {cacheState.indexedDBs.length > 0 && (
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  IndexedDB データベース ({cacheState.indexedDBs.length}):
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 ml-4">
                  {cacheState.indexedDBs.map((db, index) => (
                    <li key={index} className="list-disc text-xs">
                      {db}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      {/* 使用方法 */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          💡 使用方法
        </h4>
        <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>1. 「詳細診断」でキャッシュ状態とブラウザ情報を確認</li>
          <li>2. 「完全キャッシュクリア」で全てのブラウザキャッシュを削除</li>
          <li>3. 「強制リロード」でページを完全に再読み込み</li>
          <li>
            4. 問題が続く場合は、ブラウザの設定から手動でキャッシュをクリア
          </li>
          <li>5. シークレットモードでも同様の手順を実行</li>
        </ol>
      </div>

      {/* コマンドライン情報 */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          ⚡ コマンドライン版
        </h4>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <p>より強力なキャッシュクリアが必要な場合:</p>
          <code className="block bg-gray-200 dark:bg-gray-600 p-2 rounded text-xs">
            npm run clear-cache-complete
          </code>
          <code className="block bg-gray-200 dark:bg-gray-600 p-2 rounded text-xs">
            npm run clear-cache-complete:ps # PowerShell版（Windows）
          </code>
        </div>
      </div>
    </div>
  );
}
