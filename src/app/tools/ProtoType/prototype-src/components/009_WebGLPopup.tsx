import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

import "../styles/009_webglPopup.css";
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

        appRef.current = app;
        popupRef.current.appendChild(app.canvas);
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
