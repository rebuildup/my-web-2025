"use client";

import { useCallback, useEffect, useState } from "react";

export function useFullscreen() {
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const onFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", onFullscreenChange);
		return () =>
			document.removeEventListener("fullscreenchange", onFullscreenChange);
	}, []);

	const toggleFullscreen = useCallback(() => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {});
		} else {
			document.exitFullscreen().catch(() => {});
		}
	}, []);

	return { isFullscreen, toggleFullscreen };
}
