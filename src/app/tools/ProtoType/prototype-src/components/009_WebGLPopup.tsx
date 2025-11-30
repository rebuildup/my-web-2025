import * as PIXI from "pixi.js";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import "../styles/009_webglPopup.css";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";
import { settings } from "../SiteInterface";

const WebGLPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const popupRef = useRef<HTMLDivElement>(null);
	const appRef = useRef<PIXI.Application | null>(null);
	const [status, setStatus] = useState<"loading" | "ready" | "error">(
		"loading",
	);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		let isMounted = true;
		let app: PIXI.Application | null = null;

		(async () => {
			if (!popupRef.current) return;

			popupRef.current.querySelector("canvas")?.remove();

			app = new PIXI.Application();
			try {
				// safety timeout so UI never stays stuck on loading
				timeoutRef.current = setTimeout(() => {
					if (isMounted) {
						setStatus((s) => (s === "loading" ? "error" : s));
					}
				}, 15000);

				const bgColor = replaceHash(settings.colorTheme.colors.MainBG);
				await app.init({
					width: 720 * 2,
					height: 600 * 2,
					backgroundColor: bgColor || 0x000000,
					resolution: window.devicePixelRatio || 1,
					autoDensity: true,
					//antialias: true,
				});

				if (!isMounted || !popupRef.current) {
					app?.destroy(true);
					return;
				}

				const renderer = app.renderer;
				if (!renderer) {
					throw new Error("Renderer not initialized");
				}

				if (renderer.background) {
					renderer.background.color = bgColor || 0x000000;
				}
				renderer.clear();

				appRef.current = app;
				popupRef.current.appendChild(app.canvas);

				try {
					await initializeGame(app);
					if (isMounted) setStatus("ready");
				} catch (gameError) {
					console.error("Game initialization failed:", gameError);
					if (isMounted) setStatus("error");
				} finally {
					if (timeoutRef.current) {
						clearTimeout(timeoutRef.current);
						timeoutRef.current = null;
					}
				}
			} catch (error) {
				console.error("PixiJS initialization failed:", error);
				if (isMounted) setStatus("error");
				app?.destroy(true);
			} finally {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = null;
				}
			}
		})();

		return () => {
			isMounted = false;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			if (appRef.current) {
				appRef.current.destroy(true);
				appRef.current = null;
			}
		};
	}, []);

	return (
		<>
			<div className="webGL-BG" onClick={onClose} />
			<div
				className="webgl-popup"
				ref={popupRef}
				style={{ zIndex: 3, position: "fixed" }}
			>
				{status !== "ready" && (
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white bg-black/60 pointer-events-none">
						{status === "loading" ? "Loading..." : "Failed to start"}
					</div>
				)}
				<button type="button" onClick={onClose}>
					Close
				</button>
			</div>
		</>
	);
};

export default WebGLPopup;
