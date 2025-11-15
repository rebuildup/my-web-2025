import * as PIXI from "pixi.js";
import type React from "react";
import { useEffect, useRef } from "react";

import "../styles/009_webglPopup.css";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";
import { settings } from "../SiteInterface";

//import { setProp } from "../gamesets/gameConfig";

const WebGLPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const popupRef = useRef<HTMLDivElement>(null);
	const appRef = useRef<PIXI.Application | null>(null);

	useEffect(() => {
		let isMounted = true;
		let app: PIXI.Application | null = null;

		(async () => {
			if (!popupRef.current) return;

			popupRef.current.querySelector("canvas")?.remove();

			app = new PIXI.Application();
			try {
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

				// WebGLコンテキストが正しく初期化されているか確認
				const renderer = app.renderer;
				if (!renderer) {
					throw new Error("Renderer not initialized");
				}

				// 背景色を明示的に設定
				if (renderer.background) {
					renderer.background.color = bgColor || 0x000000;
				}
				renderer.clear();

				appRef.current = app;
				popupRef.current.appendChild(app.canvas);
				
				// initializeGameは非同期関数なのでawaitする必要がある
				try {
					await initializeGame(app);
				} catch (gameError) {
					console.error("Game initialization failed:", gameError);
					// ゲーム初期化エラーが発生しても、アプリケーションは破棄しない
					// ユーザーにエラーメッセージを表示するか、リトライできるようにする
				}
			} catch (error) {
				console.error("PixiJS initialization failed:", error);
				app?.destroy(true);
			}
		})();

		return () => {
			isMounted = false;
			if (appRef.current) {
				appRef.current.destroy(true);
				appRef.current = null;
			}
		};
	}, []);

	return (
		<div className="webgl-popup" ref={popupRef} style={{ zIndex: 3 }}>
			<div className="webGL-BG" onClick={onClose} />
			<button type="button" onClick={onClose}>
				Close
			</button>
		</div>
	);
};

export default WebGLPopup;
