"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import * as PIXI from "pixi.js";
import { gsap, PixiPlugin, CustomEase } from "../lib/gsap-loader";

import { settings } from "../SiteInterface";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";

export default function GamePage() {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const appRef = React.useRef<PIXI.Application | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("Starting...");

  useEffect(() => {
    const updateDebug = (msg: string) => {
      setDebugInfo((prev) => prev + "\n" + msg);
    };

    updateDebug("1. Component mounted");
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initializePixi = async () => {
      updateDebug("2. initializePixi started");

      // Register GSAP plugins
      if (typeof window !== "undefined") {
        (window as any).PIXI = PIXI;
        updateDebug("3. PIXI assigned to window");
      }

      updateDebug("4. Registering GSAP plugins...");
      try {
        gsap.registerPlugin(PixiPlugin, CustomEase);
        PixiPlugin.registerPIXI(PIXI);
        updateDebug("5. GSAP plugins registered SUCCESS");
      } catch (e: any) {
        updateDebug("5. GSAP plugins FAILED: " + e.message);
        return;
      }

      if (!containerRef.current) {
        updateDebug("6. ERROR: containerRef is null");
        return;
      }

      updateDebug("6. Removing existing canvas...");
      containerRef.current.querySelector("canvas")?.remove();

      let resolution = 1;
      if (window.devicePixelRatio) {
        resolution = window.devicePixelRatio;
      }
      updateDebug("7. Resolution: " + resolution);

      updateDebug("8. Creating PIXI Application...");
      app = new PIXI.Application();

      try {
        updateDebug("9. Starting app.init...");
        await app.init({
          width: 720 * 2,
          height: 600 * 2,
          backgroundColor: replaceHash(settings.colorTheme.colors.MainBG),
          resolution,
          autoDensity: true,
        });

        updateDebug("10. PIXI Application initialized SUCCESS");

        if (!isMounted || !containerRef.current) {
          updateDebug("11. ERROR: Component unmounted or ref null");
          return;
        }

        app.stage.position.set(0, 0);
        appRef.current = app;

        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        containerRef.current.appendChild(canvas);

        app.ticker.start();
        updateDebug("11. Ticker started: " + app.ticker.started);

        updateDebug("12. Calling initializeGame...");
        initializeGame(app);
        updateDebug("13. Game initialized - HIDING DEBUG");
        setTimeout(() => setDebugInfo(""), 2000);
      } catch (error: any) {
        updateDebug("ERROR: " + error.message);
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

  const handleBack = () => {
    router.push("/tools/ProtoType");
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, background: "#000" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
        {debugInfo && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#0f0",
            fontSize: "14px",
            fontFamily: "monospace",
            whiteSpace: "pre-line",
            textAlign: "left",
            background: "rgba(0,0,0,0.8)",
            padding: "20px",
            maxWidth: "80vw",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            {debugInfo}
          </div>
        )}
      </div>
      <button
        onClick={handleBack}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 10000,
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          background: "#fff",
          border: "2px solid #000"
        }}
      >
        Close
      </button>
    </div>
  );
}
