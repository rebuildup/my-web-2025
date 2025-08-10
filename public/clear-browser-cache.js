// Browser Cache Clear Script
// このスクリプトをブラウザのコンソールで実行してください

(function () {
  console.log("🧹 ブラウザキャッシュをクリアしています...");

  // Service Worker の登録解除
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
        console.log("✅ Service Worker unregistered");
      }
    });
  }

  // Local Storage クリア
  if (typeof Storage !== "undefined") {
    localStorage.clear();
    console.log("✅ Local Storage cleared");

    sessionStorage.clear();
    console.log("✅ Session Storage cleared");
  }

  // IndexedDB クリア
  if ("indexedDB" in window) {
    indexedDB.databases().then((databases) => {
      databases.forEach((db) => {
        indexedDB.deleteDatabase(db.name);
        console.log("✅ IndexedDB cleared:", db.name);
      });
    });
  }

  // Cache API クリア
  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
        console.log("✅ Cache cleared:", name);
      });
    });
  }

  console.log("🎉 ブラウザキャッシュのクリアが完了しました！");
  console.log(
    "💡 ページを強制リロード（Ctrl+Shift+R / Cmd+Shift+R）してください",
  );

  // 自動リロード（オプション）
  setTimeout(() => {
    if (confirm("ページをリロードしますか？")) {
      window.location.reload(true);
    }
  }, 2000);
})();
