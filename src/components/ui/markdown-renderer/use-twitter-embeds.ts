/**
 * Effect hook that boots Twitter widget scripts inside a rendered
 * markdown container, once the parsed HTML is in the DOM.
 *
 * Polls for the `twttr` global, hands the container to `widgets.load`,
 * and gives up after 10 seconds.
 */

import type { RefObject } from "react";
import { useEffect } from "react";

export const useTwitterEmbeds = (
	containerRef: RefObject<HTMLDivElement | null>,
	parsedContent: string,
): void => {
	useEffect(() => {
		if (!containerRef.current || !parsedContent) return;

		// Check if there are any Twitter embeds
		const hasTwitterEmbeds = containerRef.current.querySelector(
			"blockquote.twitter-tweet",
		);
		if (!hasTwitterEmbeds) return;

		// Load Twitter widgets if available
		const loadTwitterWidgets = () => {
			if (typeof window !== "undefined" && (window as any).twttr) {
				const twttr = (window as any).twttr;
				if (twttr.ready) {
					twttr.ready(() => {
						if (twttr.widgets && twttr.widgets.load && containerRef.current) {
							twttr.widgets.load(containerRef.current);
						}
					});
				} else if (
					twttr.widgets &&
					twttr.widgets.load &&
					containerRef.current
				) {
					twttr.widgets.load(containerRef.current);
				}
			}
		};

		// Wait for Twitter script to load
		const checkTwitter = setInterval(() => {
			if (typeof window !== "undefined" && (window as any).twttr) {
				clearInterval(checkTwitter);
				loadTwitterWidgets();
			}
		}, 100);

		// Cleanup interval after 10 seconds
		const timeout = setTimeout(() => {
			clearInterval(checkTwitter);
		}, 10000);

		return () => {
			clearInterval(checkTwitter);
			clearTimeout(timeout);
		};
	}, [containerRef, parsedContent]);
};
