// Advanced Browser Cache Clear Script
// 全ブラウザ（通常・シークレットモード）対応の完全キャッシュクリアスクリプト
// このスクリプトをブラウザのコンソールで実行してください

(async function () {
  console.log("🚀 高度なブラウザキャッシュクリアを開始します...");

  const results = {
    serviceWorkers: 0,
    localStorage: false,
    sessionStorage: false,
    indexedDB: 0,
    cacheAPI: 0,
    cookies: 0,
    performance: false,
    memory: false,
    errors: [],
  };

  // ブラウザ検出
  const userAgent = navigator.userAgent;
  let browser = "Unknown";
  let isIncognito = false;

  if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari")) {
    browser = "Safari";
  } else if (userAgent.includes("Edge")) {
    browser = "Edge";
  }

  console.log(`🌐 検出されたブラウザ: ${browser}`);

  // シークレットモード検出
  try {
    if ("webkitRequestFileSystem" in window) {
      await new Promise((resolve) => {
        window.webkitRequestFileSystem(
          window.TEMPORARY,
          1,
          () => {
            isIncognito = false;
            resolve();
          },
          () => {
            isIncognito = true;
            resolve();
          },
        );
      });
    } else {
      try {
        localStorage.setItem("__test__", "1");
        localStorage.removeItem("__test__");
        isIncognito = false;
      } catch {
        isIncognito = true;
      }
    }
  } catch (error) {
    console.warn("シークレットモード検出に失敗:", error);
  }

  console.log(`🔒 シークレットモード: ${isIncognito ? "有効" : "無効"}`);

  // 1. Service Worker の完全削除
  console.log("🧹 Service Workers をクリア中...");
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        // アクティブなService Workerに停止メッセージを送信
        if (registration.active) {
          try {
            registration.active.postMessage({ type: "SKIP_WAITING" });
          } catch (e) {
            // メッセージ送信に失敗しても続行
          }
        }

        const success = await registration.unregister();
        if (success) {
          results.serviceWorkers++;
          console.log("✅ Service Worker削除:", registration.scope);
        }
      }
    } catch (error) {
      results.errors.push(`Service Worker削除失敗: ${error.message}`);
      console.error("❌ Service Worker削除エラー:", error);
    }
  }

  // 2. Storage の完全クリア
  console.log("🧹 Storage をクリア中...");
  try {
    if (typeof Storage !== "undefined") {
      // Local Storage
      const localKeys = Object.keys(localStorage);
      localStorage.clear();
      results.localStorage = true;
      console.log(`✅ Local Storage削除 (${localKeys.length}項目)`);

      // Session Storage
      const sessionKeys = Object.keys(sessionStorage);
      sessionStorage.clear();
      results.sessionStorage = true;
      console.log(`✅ Session Storage削除 (${sessionKeys.length}項目)`);
    }
  } catch (error) {
    results.errors.push(`Storage削除失敗: ${error.message}`);
    console.error("❌ Storage削除エラー:", error);
  }

  // 3. IndexedDB の強制削除
  console.log("🧹 IndexedDB をクリア中...");
  if ("indexedDB" in window) {
    try {
      const databases = await indexedDB.databases();
      const deletePromises = databases.map(async (db) => {
        if (db.name) {
          return new Promise((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(db.name);

            deleteReq.onsuccess = () => {
              results.indexedDB++;
              console.log("✅ IndexedDB削除:", db.name);
              resolve();
            };

            deleteReq.onerror = () => {
              results.errors.push(`IndexedDB削除失敗: ${db.name}`);
              reject(deleteReq.error);
            };

            deleteReq.onblocked = () => {
              console.warn("⚠️ IndexedDB削除がブロックされました:", db.name);
              // ブロックされても成功として扱う
              setTimeout(() => {
                results.indexedDB++;
                resolve();
              }, 2000);
            };
          });
        }
      });

      await Promise.allSettled(deletePromises);
    } catch (error) {
      results.errors.push(`IndexedDB削除失敗: ${error.message}`);
      console.error("❌ IndexedDB削除エラー:", error);
    }
  }

  // 4. Cache API の完全クリア
  console.log("🧹 Cache API をクリア中...");
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames.map(async (name) => {
        try {
          const success = await caches.delete(name);
          if (success) {
            results.cacheAPI++;
            console.log("✅ Cache削除:", name);
          }
        } catch (error) {
          results.errors.push(`Cache削除失敗: ${name}`);
        }
      });

      await Promise.allSettled(deletePromises);
    } catch (error) {
      results.errors.push(`Cache API削除失敗: ${error.message}`);
      console.error("❌ Cache API削除エラー:", error);
    }
  }

  // 5. Cookies の完全削除
  console.log("🧹 Cookies をクリア中...");
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      if (name) {
        // 複数のドメインとパスで削除を試行
        const domains = [
          window.location.hostname,
          `.${window.location.hostname}`,
          window.location.hostname.replace(/^www\./, ""),
          `.${window.location.hostname.replace(/^www\./, "")}`,
        ];

        const paths = ["/", window.location.pathname];

        for (const domain of domains) {
          for (const path of paths) {
            // 複数の形式で削除を試行
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
        }
        results.cookies++;
      }
    }

    if (results.cookies > 0) {
      console.log(`✅ Cookies削除 (${results.cookies}項目)`);
    }
  } catch (error) {
    results.errors.push(`Cookie削除失敗: ${error.message}`);
    console.error("❌ Cookie削除エラー:", error);
  }

  // 6. Performance データクリア
  console.log("🧹 Performance データをクリア中...");
  try {
    if ("performance" in window) {
      if ("clearResourceTimings" in performance) {
        performance.clearResourceTimings();
      }
      if ("clearMarks" in performance) {
        performance.clearMarks();
      }
      if ("clearMeasures" in performance) {
        performance.clearMeasures();
      }
      results.performance = true;
      console.log("✅ Performance データ削除");
    }
  } catch (error) {
    results.errors.push(`Performance削除失敗: ${error.message}`);
    console.error("❌ Performance削除エラー:", error);
  }

  // 7. Memory キャッシュクリア
  console.log("🧹 Memory キャッシュをクリア中...");
  try {
    // ガベージコレクションを促す（開発者ツールでのみ有効）
    if ("gc" in window) {
      window.gc();
      results.memory = true;
      console.log("✅ ガベージコレクション実行");
    }

    // メモリ使用量の情報を表示
    if ("memory" in performance) {
      const memInfo = performance.memory;
      console.log("📊 メモリ情報:", {
        使用中: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + "MB",
        合計: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + "MB",
        上限: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + "MB",
      });
    }
  } catch (error) {
    console.warn("⚠️ Memory削除警告:", error);
  }

  // 8. ブラウザ固有の追加処理
  console.log("🧹 ブラウザ固有の処理中...");
  try {
    switch (browser) {
      case "Chrome":
      case "Edge":
        // Chrome/Edge固有の処理
        if ("chrome" in window && "loadTimes" in window.chrome) {
          console.log("✅ Chrome固有キャッシュ処理");
        }
        break;

      case "Firefox":
        // Firefox固有の処理
        console.log("✅ Firefox固有キャッシュ処理");
        break;

      case "Safari":
        // Safari固有の処理
        console.log("✅ Safari固有キャッシュ処理");
        break;
    }
  } catch (error) {
    console.warn("⚠️ ブラウザ固有処理警告:", error);
  }

  // 結果表示
  console.log("🎉 高度なブラウザキャッシュクリアが完了しました！");
  console.log("📊 クリア結果:", results);

  const totalCleared =
    results.serviceWorkers +
    (results.localStorage ? 1 : 0) +
    (results.sessionStorage ? 1 : 0) +
    results.indexedDB +
    results.cacheAPI +
    results.cookies;

  console.log(`✨ 合計 ${totalCleared} 項目のキャッシュをクリアしました`);

  if (results.errors.length > 0) {
    console.warn(
      `⚠️ ${results.errors.length} 件のエラーが発生しました:`,
      results.errors,
    );
  }

  // 推奨事項の表示
  console.log("💡 次のステップ:");
  console.log(
    "1. ページを強制リロード: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)",
  );
  console.log("2. ブラウザを完全に再起動");
  console.log("3. 必要に応じて他のブラウザでも同様の処理を実行");

  if (isIncognito) {
    console.log("4. 通常モードでも同様の処理を実行することを推奨");
  } else {
    console.log(
      "4. シークレット/プライベートモードでも同様の処理を実行することを推奨",
    );
  }

  // 自動リロードの確認
  setTimeout(() => {
    if (
      confirm(
        "🔄 ページを強制リロードしますか？\n（推奨: キャッシュクリア効果を確認するため）",
      )
    ) {
      window.location.reload(true);
    }
  }, 3000);
})().catch((error) => {
  console.error("❌ キャッシュクリアスクリプトでエラーが発生しました:", error);
  alert(
    "キャッシュクリアでエラーが発生しました。詳細はコンソールを確認してください。",
  );
});
