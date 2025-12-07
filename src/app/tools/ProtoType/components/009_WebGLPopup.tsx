"use client";
import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

import { settings } from "../SiteInterface";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";
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
        await app.init({
          width: 720 * 2,
          height: 600 * 2,
          backgroundColor: replaceHash(settings.colorTheme.colors.MainBG),
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          //antialias: true,
        });

        if (!isMounted || !popupRef.current) return;

        app.stage.position.set(0, 0); // Reset stage position
        appRef.current = app;
        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        // Ensure z-index is correct relative to other elements in popup
        popupRef.current.appendChild(canvas);
        
        console.log("PixiJS initialized", app.screen.width, app.screen.height);
        initializeGame(app);
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
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default WebGLPopup;
