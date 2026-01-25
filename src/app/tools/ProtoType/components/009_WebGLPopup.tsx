"use client";
import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
// Import GSAP with explicit pattern to prevent tree-shaking
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { CustomEase } from "gsap/all";

// Force GSAP to be included in bundle by using it at module level
// This prevents tree-shaking from removing it
if (typeof window !== "undefined") {
  (window as any).gsap = gsap;
}

import { settings } from "../SiteInterface";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";

const WebGLPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initializePixi = async () => {
      // Register GSAP plugins (static import)
      if (typeof window !== "undefined") {
        (window as any).PIXI = PIXI;
      }
      // Ensure gsap is available before registering plugins
      if (typeof gsap !== "undefined" && gsap.registerPlugin) {
        gsap.registerPlugin(PixiPlugin, CustomEase);
      }
      PixiPlugin.registerPIXI(PIXI);

      if (!popupRef.current) return;

      popupRef.current.querySelector("canvas")?.remove();

      // Calculate resolution outside try/catch block
      let resolution = 1;
      if (window.devicePixelRatio) {
        resolution = window.devicePixelRatio;
      }

      app = new PIXI.Application();
      try {
        await app.init({
          width: 720 * 2,
          height: 600 * 2,
          backgroundColor: replaceHash(settings.colorTheme.colors.MainBG),
          resolution,
          autoDensity: true,
          //antialias: true,
        });

        if (!isMounted) return;
        if (!popupRef.current) return;

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
        if (app) {
          app.destroy(true);
        }
      }
    };

    initializePixi();

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
