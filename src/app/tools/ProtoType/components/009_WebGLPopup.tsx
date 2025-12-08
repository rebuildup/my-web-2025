"use client";
import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import gsap from "gsap";
// Do not import PixiPlugin/CustomEase statically to avoid SSR issues with some bundlers if they assume browser env
// We will register them inside useEffect to be safe
// import { PixiPlugin } from "gsap/PixiPlugin"; 
// import { CustomEase } from "gsap/all";

import { settings } from "../SiteInterface";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";
//import { setProp } from "../gamesets/gameConfig";

// Helper function to load GSAP plugins dynamically
async function loadGSAPPlugins() {
  const pixiPluginModule = await import("gsap/PixiPlugin");
  const customEaseModule = await import("gsap/all");
  return {
    PixiPlugin: pixiPluginModule.PixiPlugin,
    CustomEase: customEaseModule.CustomEase,
  };
}

const WebGLPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initializePixi = async () => {
      // Dynamic import to avoid SSR issues
      const { PixiPlugin, CustomEase } = await loadGSAPPlugins();
      
      if (typeof window !== "undefined") {
          (window as any).PIXI = PIXI;
      }
      gsap.registerPlugin(PixiPlugin, CustomEase);
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
