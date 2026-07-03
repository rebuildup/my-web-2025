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
			alert("キャッシュクリアに失敗しました.コンソールを確認してください.");
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
		<div className=" dark: rounded-lg  p-6 max-w-4xl mx-auto">
			<div className="mb-6">
				<h2 className="text-2xl font-bold  dark: mb-2">
					🧹 キャッシュクリア管理パネル
				</h2>
				<p className=" dark:">
					ブラウザキャッシュの問題を完全に解決するための管理ツール
				</p>
			</div>

			{/* ブラウザ情報 */}
			<div className="mb-6 p-4  dark: rounded-lg">
				<h3 className="font-semibold  dark: mb-2">
					🌐 ブラウザ情報: {browserInfo?.browser || "Unknown"}
				</h3>
				{browserInfo && browserInfo.issues.length > 0 && (
					<div className="mb-2">
						<p className="text-sm  dark: font-medium">
							既知の問題:
						</p>
						<ul className="text-sm  dark: ml-4">
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
						<p className="text-sm  dark: font-medium">
							推奨解決策:
						</p>
						<ul className="text-sm  dark: ml-4">
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
			<div className="mb-6 p-4  dark: rounded-lg">
				<h3 className="font-semibold  dark: mb-3">
					📊 現在のキャッシュ状態
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
					<div className=" dark: p-3 rounded">
						<p className="font-medium  dark:">
							Service Workers
						</p>
						<p className="text-2xl font-bold  dark:">
							{cacheState?.serviceWorkers || 0}
						</p>
					</div>
					<div className=" dark: p-3 rounded">
						<p className="font-medium  dark:">
							Local Storage
						</p>
						<p className="text-2xl font-bold  dark:">
							{cacheState?.localStorage || 0}
						</p>
					</div>
					<div className=" dark: p-3 rounded">
						<p className="font-medium  dark:">
							Session Storage
						</p>
						<p className="text-2xl font-bold  dark:">
							{cacheState?.sessionStorage || 0}
						</p>
					</div>
					<div className=" dark: p-3 rounded">
						<p className="font-medium  dark:">
							Cache API
						</p>
						<p className="text-2xl font-bold  dark:">
							{cacheState?.caches.length || 0}
						</p>
					</div>
					<div className=" dark: p-3 rounded">
						<p className="font-medium  dark:">
							IndexedDB
						</p>
						<p className="text-2xl font-bold  dark:">
							{cacheState?.indexedDBs.length || 0}
						</p>
					</div>
					<div className=" dark: p-3 rounded">
						<p className="font-medium  dark:">合計</p>
						<p className="text-2xl font-bold  dark:">
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
						className="px-6 py-3     font-semibold rounded-lg transition-colors flex items-center gap-2"
					>
						{isClearing ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4   border-t-transparent"></div>
								クリア中...
							</>
						) : (
							<>🧹 すべてのキャッシュをクリア</>
						)}
					</button>

					<button
						type="button"
						onClick={handleDiagnose}
						className="px-6 py-3    font-semibold rounded-lg transition-colors"
					>
						🔍 キャッシュ診断
					</button>

					<button
						type="button"
						onClick={handleForceReload}
						className="px-6 py-3    font-semibold rounded-lg transition-colors"
					>
						🔄 強制リロード
					</button>

					<button
						type="button"
						onClick={loadCacheState}
						className="px-6 py-3    font-semibold rounded-lg transition-colors"
					>
						📊 状態更新
					</button>
				</div>

				{lastCleared && (
					<div className="p-3  dark: rounded-lg">
						<p className=" dark: text-sm">
							✅ 最後のキャッシュクリア: {lastCleared}
						</p>
					</div>
				)}
			</div>

			{/* 詳細情報 */}
			{cacheState &&
				(cacheState.caches.length > 0 || cacheState.indexedDBs.length > 0) && (
					<div className="mt-6 p-4  dark: rounded-lg">
						<h4 className="font-semibold  dark: mb-2">
							📋 詳細情報
						</h4>
						{cacheState.caches.length > 0 && (
							<div className="mb-2">
								<p className="text-sm font-medium  dark:">
									Cache API エントリ:
								</p>
								<ul className="text-sm  dark: ml-4">
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
								<p className="text-sm font-medium  dark:">
									IndexedDB データベース:
								</p>
								<ul className="text-sm  dark: ml-4">
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
			<div className="mt-6 p-4  dark: rounded-lg">
				<h4 className="font-semibold  dark: mb-2">
					💡 使用方法
				</h4>
				<ol className="text-sm  dark: space-y-1">
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
