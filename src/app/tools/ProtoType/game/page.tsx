"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import * as PIXI from "pixi.js";
import { gsap, PixiPlugin, CustomEase } from "../lib/gsap-loader";

import { settings } from "../SiteInterface";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";

console.log("[GamePage] Module loaded");

export default function GamePage() {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const appRef = React.useRef<PIXI.Application | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("[GamePage] Component mounted, initializing...");
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initializePixi = async () => {
      console.log("[GamePage] initializePixi started");

      // Register GSAP plugins
      if (typeof window !== "undefined") {
        (window as any).PIXI = PIXI;
      }

      console.log("[GamePage] Registering GSAP plugins...");
      try {
        gsap.registerPlugin(PixiPlugin, CustomEase);
        PixiPlugin.registerPIXI(PIXI);
        console.log("[GamePage] GSAP plugins registered");
      } catch (e) {
        console.error("[GamePage] Failed to register GSAP plugins:", e);
      }

      if (!containerRef.current) {
        console.error("[GamePage] containerRef.current is null");
        return;
      }

      console.log("[GamePage] Removing existing canvas...");
      containerRef.current.querySelector("canvas")?.remove();

      let resolution = 1;
      if (window.devicePixelRatio) {
        resolution = window.devicePixelRatio;
      }

      console.log("[GamePage] Creating PIXI Application...");
      app = new PIXI.Application();

      try {
        await app.init({
          width: 720 * 2,
          height: 600 * 2,
          backgroundColor: replaceHash(settings.colorTheme.colors.MainBG),
          resolution,
          autoDensity: true,
        });

        console.log("[GamePage] PIXI Application initialized");

        if (!isMounted || !containerRef.current) {
          console.error("[GamePage] Component unmounted or ref null during init");
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
        console.log("[GamePage] Ticker started:", app.ticker.started);

        console.log("[GamePage] Calling initializeGame...");
        initializeGame(app);
        setIsInitialized(true);
      } catch (error) {
        console.error("[GamePage] PixiJS initialization failed:", error);
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
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
        {!isInitialized && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "24px"
          }}>
            Loading game...
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
          cursor: "pointer"
        }}
      >
        Close
      </button>
    </div>
  );
}
