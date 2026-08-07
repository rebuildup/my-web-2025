/**
 * Effect hook that boots Twitter widget scripts inside a rendered
 * markdown container, once the parsed HTML is in the DOM.
 *
 * The Twitter widgets.js script is loaded on-demand (only when a tweet
 * is actually present in the container) and is shared across all
 * MarkdownRenderer instances via a module-level singleton.
 */

import type { RefObject } from "react";
import { useEffect } from "react";

declare global {
	interface Window {
		twttr?: {
			ready?: (cb: () => void) => void;
			widgets?: { load?: (el?: HTMLElement) => void };
		};
	}
}

type Twttr = Window["twttr"];
let scriptPromise: Promise<Twttr | null> | null = null;

function loadTwitterWidgetsScript(): Promise<Twttr | null> {
	if (typeof window === "undefined") return Promise.resolve(null);
	if ((window as Window).twttr)
		return Promise.resolve((window as Window).twttr);
	if (scriptPromise) return scriptPromise;

	scriptPromise = new Promise<Twttr | null>((resolve) => {
		const existing = document.querySelector<HTMLScriptElement>(
			'script[data-twitter-widgets="true"]',
		);
		const onReady = () => resolve((window as Window).twttr ?? null);

		const timeout = window.setTimeout(() => {
			resolve((window as Window).twttr ?? null);
		}, 10000);

		if (existing) {
			existing.addEventListener("load", onReady, { once: true });
			existing.addEventListener(
				"error",
				() => {
					window.clearTimeout(timeout);
					resolve(null);
				},
				{ once: true },
			);
			return;
		}

		const script = document.createElement("script");
		script.src = "https://platform.twitter.com/widgets.js";
		script.async = true;
		script.charset = "utf-8";
		script.dataset.twitterWidgets = "true";
		script.addEventListener("load", () => {
			window.clearTimeout(timeout);
			onReady();
		});
		script.addEventListener(
			"error",
			() => {
				window.clearTimeout(timeout);
				scriptPromise = null;
				resolve(null);
			},
			{ once: true },
		);
		document.head.appendChild(script);
	});

	return scriptPromise;
}

export const useTwitterEmbeds = (
	containerRef: RefObject<HTMLDivElement | null>,
	parsedContent: string,
): void => {
	useEffect(() => {
		if (!containerRef.current || !parsedContent) return;

		const hasTwitterEmbeds = containerRef.current.querySelector(
			"blockquote.twitter-tweet",
		);
		if (!hasTwitterEmbeds) return;

		let cancelled = false;
		let pollInterval: number | null = null;

		const tryLoad = () => {
			if (cancelled) return;
			const twttr = (window as Window).twttr;
			if (!twttr?.widgets?.load) return;
			if (twttr.ready) {
				twttr.ready(() => {
					if (!cancelled && containerRef.current) {
						twttr.widgets?.load?.(containerRef.current);
					}
				});
			} else if (containerRef.current) {
				twttr.widgets.load(containerRef.current);
			}
			if (pollInterval !== null) {
				window.clearInterval(pollInterval);
				pollInterval = null;
			}
		};

		void loadTwitterWidgetsScript().then(() => {
			if (cancelled) return;
			tryLoad();
			if (!(window as Window).twttr?.widgets?.load) {
				pollInterval = window.setInterval(tryLoad, 200);
			}
		});

		return () => {
			cancelled = true;
			if (pollInterval !== null) {
				window.clearInterval(pollInterval);
			}
		};
	}, [containerRef, parsedContent]);
};
