"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import * as PIXI from "pixi.js";
import { gsap, PixiPlugin, CustomEase } from "../lib/gsap-loader";

import { settings } from "../SiteInterface";
import { initializeGame, replaceHash } from "../gamesets/001_game_master";

export default function GamePage() {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const appRef = React.useRef<PIXI.Application | null>(null);

  useEffect(() => {
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initializePixi = async () => {
      // Register GSAP plugins
      if (typeof window !== "undefined") {
        (window as any).PIXI = PIXI;
      }

      try {
        gsap.registerPlugin(PixiPlugin, CustomEase);
        PixiPlugin.registerPIXI(PIXI);
      } catch (e: any) {
        console.error("GSAP plugins registration failed:", e);
        return;
      }

      if (!containerRef.current) {
        return;
      }

      containerRef.current.querySelector("canvas")?.remove();

      const resolution = window.devicePixelRatio || 1;
      app = new PIXI.Application();

      try {
        await app.init({
          width: 720 * 2,
          height: 600 * 2,
          backgroundColor: replaceHash(settings.colorTheme.colors.MainBG),
          resolution,
          autoDensity: true,
          autoStart: true,
        });

        if (!isMounted || !containerRef.current) {
          return;
        }

        app.stage.x = 0;
        app.stage.y = 0;
        appRef.current = app;

        const canvas = app.canvas as HTMLCanvasElement;
        if (!canvas) {
          return;
        }

        canvas.width = app.screen.width;
        canvas.height = app.screen.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';

        containerRef.current.appendChild(canvas);

        // Explicitly start the ticker for PIXI v8
        if (app.ticker && !app.ticker.started) {
          app.ticker.start();
        }

        // Run game initialization asynchronously without blocking
        initializeGame(app).catch((error) => {
          console.error("Game initialization error:", error);
        });
      } catch (error: any) {
        console.error("PIXI initialization error:", error);
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
    <>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, background: "#000" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
        </div>
      </div>
      <button
        onClick={handleBack}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 100000,
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          background: "#fff",
          border: "2px solid #000"
        }}
      >
        Close
      </button>
    </>
  );
}
