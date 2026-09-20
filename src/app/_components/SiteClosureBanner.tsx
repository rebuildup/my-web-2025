/**
 * Site Closure Banner
 *
 * ホームページ訪問者に rebuildup.dev への移管を告知する画面上部固定の 1 行バナー。
 * Sprint 2.3.0 (`release-2-3-0`) で導入。`/about` 等の他ルートには波及しない。
 *
 * - localStorage に dismiss 時刻を保存 (TTL 90 日)。
 *   key は release-versioned: 新リリースで上書きすると新規ユーザーが再表示される。
 * - page.tsx で `h-dvh overflow-hidden` のラッパーの **外** に置かれ、`fixed top-0` で
 *   画面上部に固定される。ヒーローカードは `items-center` で dvh の中央に配置されて
 *   おり、ドキュメント済みのビューポート (300x600, 1024x768) ではバナーと重ならない。
 * - `role="region"` + `aria-label` のみ。`aria-live` は付与しない (静的告知のため)。
 */

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "site-closure-banner:2.3.0:dismissed-at";
const TTL_DAYS = 90;

/**
 * TTL 内の未失効 dismiss かどうかを返す。
 * SSR 中 (`window === undefined`) や localStorage アクセス失敗時は false (=未 dismiss) を返し、
 * バナーを表示する方向に倒す。CookieConsent.tsx:28 と同パターン。
 */
function isDismissed(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return false;
		const ts = new Date(raw).getTime();
		if (!Number.isFinite(ts)) return false;
		const elapsedDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
		return elapsedDays < TTL_DAYS;
	} catch {
		return false;
	}
}

/**
 * dismiss 時刻 (ISO 8601) を localStorage に保存する。
 * Safari private / 埋め込み WebView 等で localStorage が無効な場合は握り潰す。
 */
function persistDismiss(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
	} catch {
		// Safari private / embedded WebView 等で localStorage が無効な場合は握り潰す。
		// CookieConsent.tsx と同パターン。
	}
}

/**
 * ホームページ上部に固定表示する移管告知バナー。
 * 初回マウント時に localStorage を確認し、未 dismiss の場合のみ表示する。
 * 閉じるボタンを押すと `persistDismiss()` で TTL 90 日の dismiss 状態を保存する。
 */
export default function SiteClosureBanner() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (
			process.env.NODE_ENV === "test" ||
			process.env.PLAYWRIGHT_TEST === "true"
		) {
			return;
		}
		setVisible(!isDismissed());
	}, []);

	if (!visible) return null;

	return (
		<div
			role="region"
			aria-label="サイトの移管のお知らせ"
			className="fixed top-0 inset-x-0 z-50 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2 border-b border-neutral-200 bg-white text-neutral-800 noto-sans-jp-light text-xs sm:text-sm motion-reduce:animate-none animate-fade-in"
		>
			<p className="flex-1 min-w-0 leading-snug">
				このサイトは 2026 年に新サイトへ移りました。{" "}
				<a
					href="https://rebuildup.dev"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="新サイト rebuildup.dev へ移動 (新しいタブで開きます)"
					className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm transition-colors"
				>
					新サイト (rebuildup.dev) を見る
				</a>{" "}
				<span aria-hidden="true" className="text-neutral-400 mx-1">
					·
				</span>{" "}
				<a
					href="https://github.com/rebuildup/my-web-2026"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="ソースコード my-web-2026 を GitHub で開く (新しいタブで開きます)"
					className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm transition-colors"
				>
					ソースコード (GitHub) を見る
				</a>
			</p>
			<button
				type="button"
				onClick={() => {
					persistDismiss();
					setVisible(false);
				}}
				aria-label="このお知らせを閉じる"
				className="shrink-0 inline-flex items-center justify-center rounded-sm p-1 text-neutral-500 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
	);
}
