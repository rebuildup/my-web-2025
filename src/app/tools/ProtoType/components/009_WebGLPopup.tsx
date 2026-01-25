"use client";
import React, { useEffect, useRef } from "react";

// Module-level log to verify the component is loaded
console.log("[WebGLPopup] Module loaded");

import * as PIXI from "pixi.js";
// Import GSAP through our custom loader to prevent tree-shaking
import { gsap, PixiPlugin, CustomEase } from "../lib/gsap-loader";

import { settings } from "../SiteInterface";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";

const WebGLPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  console.log("[WebGLPopup] Component rendered");
  const popupRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    console.log("[WebGLPopup] useEffect running");
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initializePixi = async () => {
      console.log("[WebGLPopup] initializePixi started");

      // Register GSAP plugins and set up PIXI
      if (typeof window !== "undefined") {
        (window as any).PIXI = PIXI;
      }

      // Register GSAP plugins - must happen after gsap is imported
      console.log("[WebGLPopup] Registering GSAP plugins...");
      try {
        gsap.registerPlugin(PixiPlugin, CustomEase);
        PixiPlugin.registerPIXI(PIXI);
        console.log("[WebGLPopup] GSAP plugins registered");
      } catch (e) {
        console.error("[WebGLPopup] Failed to register GSAP plugins:", e);
      }

      if (!popupRef.current) {
        console.error("[WebGLPopup] popupRef.current is null");
        return;
      }

      console.log("[WebGLPopup] Removing existing canvas...");
      popupRef.current.querySelector("canvas")?.remove();

      // Calculate resolution outside try/catch block
      let resolution = 1;
      if (window.devicePixelRatio) {
        resolution = window.devicePixelRatio;
      }

      console.log("[WebGLPopup] Creating PIXI Application...");
      app = new PIXI.Application();

      try {
        console.log("[WebGLPopup] Initializing app with config:", {
          width: 720 * 2,
          height: 600 * 2,
          backgroundColor: replaceHash(settings.colorTheme.colors.MainBG),
          resolution,
          autoDensity: true,
        });

        await app.init({
          width: 720 * 2,
          height: 600 * 2,
          backgroundColor: replaceHash(settings.colorTheme.colors.MainBG),
          resolution,
          autoDensity: true,
          //antialias: true,
        });

        console.log("[WebGLPopup] PIXI Application initialized successfully");

        if (!isMounted) {
          console.error("[WebGLPopup] Component unmounted during init");
          return;
        }
        if (!popupRef.current) {
          console.error("[WebGLPopup] popupRef.current became null during init");
          return;
        }

        console.log("[WebGLPopup] Setting up stage and canvas...");
        app.stage.position.set(0, 0); // Reset stage position
        appRef.current = app;

        const canvas = app.canvas as HTMLCanvasElement;
        console.log("[WebGLPopup] Canvas element:", canvas);

        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        // Ensure z-index is correct relative to other elements in popup
        popupRef.current.appendChild(canvas);

        console.log("[WebGLPopup] Canvas appended to DOM, ticker started:", app.ticker.started);

        // Explicitly start the ticker to ensure animations run
        app.ticker.start();
        console.log("[WebGLPopup] Ticker started:", app.ticker.started);

        console.log("PixiJS initialized", app.screen.width, app.screen.height, "ticker started:", app.ticker.started);

        console.log("[WebGLPopup] Calling initializeGame...");
        initializeGame(app);
      } catch (error) {
        console.error("[WebGLPopup] PixiJS initialization failed:", error);
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
