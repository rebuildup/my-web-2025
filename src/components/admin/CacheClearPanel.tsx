"use client";

import { useCallback, useEffect, useState } from "react";
import { AdvancedBrowserCacheManager } from "@/lib/advanced-cache-utils";
import {
	type BrowserCacheInfo,
	clearAllCaches,
	diagnoseCacheIssues,
} from "@/lib/cache-utils";

interface CacheState {
	serviceWorkers: number;
	localStorage: number;
	sessionStorage: number;
	caches: string[];
	indexedDBs: string[];
}

interface ExtendedCacheState extends CacheState {
	cookies: number;
	performance: boolean;
}

export default function CacheClearPanel() {
	const [isClearing, setIsClearing] = useState(false);
	const [cacheState, setCacheState] = useState<ExtendedCacheState | null>(null);
	const [lastCleared, setLastCleared] = useState<string | null>(null);
	const [browserInfo, setBrowserInfo] = useState<BrowserCacheInfo | null>(null);
	const [, setBrowserInfoLoaded] = useState(false);
	// const [clearResult, setClearResult] = useState<CacheClearResult | null>(null);

	const manager = AdvancedBrowserCacheManager.getInstance();

	const loadCacheState = useCallback(async () => {
		try {
			const state = await manager.diagnoseCacheState();
			setCacheState({
				serviceWorkers: state.cacheState.serviceWorkers as number,
				localStorage: state.cacheState.localStorage as number,
				sessionStorage: state.cacheState.sessionStorage as number,
				caches: state.cacheState.caches as string[],
				indexedDBs: state.cacheState.indexedDBs as string[],
				cookies: state.cacheState.cookies as number,
				performance: state.cacheState.performance as boolean,
			});
		} catch (error) {
			console.error("Failed to load cache state:", error);
		}
	}, [manager]);

	useEffect(() => {
		const loadBrowserInfo = async () => {
			try {
				const info = await manager.detectBrowserInfo();
				setBrowserInfo(info);
			} catch (error) {
				console.error("Failed to load browser info:", error);
			}
			setBrowserInfoLoaded(true);
		};

		loadCacheState();
		loadBrowserInfo();
	}, [loadCacheState, manager]);

	const handleClearCache = async () => {
		setIsClearing(true);
		let completed = false;
		try {
			await clearAllCaches();
			await loadCacheState();
			setLastCleared(new Date().toLocaleString("ja-JP"));
			completed = true;
		} catch (error) {
			console.error("Cache clear failed:", error);
			alert("キャッシュクリアに失敗しました。コンソールを確認してください。");
			completed = true;
		}

		if (completed) {
			setIsClearing(false);
		}
	};

	const handleDiagnose = async () => {
		await diagnoseCacheIssues();
		await loadCacheState();
	};

	const handleForceReload = () => {
		if (confirm("ページを強制リロードしますか？")) {
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
			cacheState.indexedDBs.length
		);
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					🧹 キャッシュクリア管理パネル
				</h2>
				<p className="text-gray-600 dark:text-gray-300">
					ブラウザキャッシュの問題を完全に解決するための管理ツール
				</p>
			</div>

			{/* ブラウザ情報 */}
			<div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
				<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
					🌐 ブラウザ情報: {browserInfo?.browser || "Unknown"}
				</h3>
				{browserInfo && browserInfo.issues.length > 0 && (
					<div className="mb-2">
						<p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
							既知の問題:
						</p>
						<ul className="text-sm text-blue-700 dark:text-blue-300 ml-4">
							{browserInfo.issues.map((issue) => (
								<li key={`issue-${issue}`} className="list-disc">
									{issue}
								</li>
							))}
						</ul>
					</div>
				)}
				{browserInfo && browserInfo.solutions.length > 0 && (
					<div>
						<p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
							推奨解決策:
						</p>
						<ul className="text-sm text-blue-700 dark:text-blue-300 ml-4">
							{browserInfo.solutions.map((solution) => (
								<li key={`solution-${solution}`} className="list-disc">
									{solution}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* キャッシュ状態 */}
			<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<h3 className="font-semibold text-gray-900 dark:text-white mb-3">
					📊 現在のキャッシュ状態
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
					<div className="bg-white dark:bg-gray-600 p-3 rounded">
						<p className="font-medium text-gray-900 dark:text-white">
							Service Workers
						</p>
						<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							{cacheState?.serviceWorkers || 0}
						</p>
					</div>
					<div className="bg-white dark:bg-gray-600 p-3 rounded">
						<p className="font-medium text-gray-900 dark:text-white">
							Local Storage
						</p>
						<p className="text-2xl font-bold text-green-600 dark:text-green-400">
							{cacheState?.localStorage || 0}
						</p>
					</div>
					<div className="bg-white dark:bg-gray-600 p-3 rounded">
						<p className="font-medium text-gray-900 dark:text-white">
							Session Storage
						</p>
						<p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
							{cacheState?.sessionStorage || 0}
						</p>
					</div>
					<div className="bg-white dark:bg-gray-600 p-3 rounded">
						<p className="font-medium text-gray-900 dark:text-white">
							Cache API
						</p>
						<p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
							{cacheState?.caches.length || 0}
						</p>
					</div>
					<div className="bg-white dark:bg-gray-600 p-3 rounded">
						<p className="font-medium text-gray-900 dark:text-white">
							IndexedDB
						</p>
						<p className="text-2xl font-bold text-red-600 dark:text-red-400">
							{cacheState?.indexedDBs.length || 0}
						</p>
					</div>
					<div className="bg-white dark:bg-gray-600 p-3 rounded">
						<p className="font-medium text-gray-900 dark:text-white">合計</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white">
							{getTotalCacheItems()}
						</p>
					</div>
				</div>
			</div>

			{/* アクションボタン */}
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={handleClearCache}
						disabled={isClearing}
						className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
					>
						{isClearing ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
								クリア中...
							</>
						) : (
							<>🧹 すべてのキャッシュをクリア</>
						)}
					</button>

					<button
						type="button"
						onClick={handleDiagnose}
						className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
					>
						🔍 キャッシュ診断
					</button>

					<button
						type="button"
						onClick={handleForceReload}
						className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
					>
						🔄 強制リロード
					</button>

					<button
						type="button"
						onClick={loadCacheState}
						className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
					>
						📊 状態更新
					</button>
				</div>

				{lastCleared && (
					<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
						<p className="text-green-800 dark:text-green-200 text-sm">
							✅ 最後のキャッシュクリア: {lastCleared}
						</p>
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
									Cache API エントリ:
								</p>
								<ul className="text-sm text-yellow-700 dark:text-yellow-300 ml-4">
									{cacheState.caches.map((cache) => (
										<li key={`cache-${cache}`} className="list-disc">
											{cache}
										</li>
									))}
								</ul>
							</div>
						)}
						{cacheState.indexedDBs.length > 0 && (
							<div>
								<p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
									IndexedDB データベース:
								</p>
								<ul className="text-sm text-yellow-700 dark:text-yellow-300 ml-4">
									{cacheState.indexedDBs.map((db) => (
										<li key={`indexeddb-${db}`} className="list-disc">
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
					<li>1. 「キャッシュ診断」でキャッシュ状態を確認</li>
					<li>2. 「すべてのキャッシュをクリア」でブラウザキャッシュを削除</li>
					<li>3. 「強制リロード」でページを完全に再読み込み</li>
					<li>
						4. 問題が続く場合は、ブラウザの設定から手動でキャッシュをクリア
					</li>
				</ol>
			</div>
		</div>
	);
}
