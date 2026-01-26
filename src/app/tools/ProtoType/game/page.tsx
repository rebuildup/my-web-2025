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

  // Create window-level debug function
  if (typeof window !== "undefined") {
    (window as any).gameDebug = (msg: string) => {
      const el = document.getElementById("game-debug");
      if (el) {
        el.textContent = el.textContent + "\n" + msg;
      }
      // Also log to console for debugging
      console.log("[GameDebug]", msg);
    };
  }

  useEffect(() => {
    if ((window as any).gameDebug) {
      (window as any).gameDebug("1. Component mounted");
    }
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initializePixi = async () => {
      if ((window as any).gameDebug) {
        (window as any).gameDebug("2. initializePixi started");
      }

      // Register GSAP plugins
      if (typeof window !== "undefined") {
        (window as any).PIXI = PIXI;
        if ((window as any).gameDebug) {
          (window as any).gameDebug("3. PIXI assigned to window");
        }
      }

      if ((window as any).gameDebug) {
        (window as any).gameDebug("4. Registering GSAP plugins...");
      }
      try {
        gsap.registerPlugin(PixiPlugin, CustomEase);
        PixiPlugin.registerPIXI(PIXI);
        if ((window as any).gameDebug) {
          (window as any).gameDebug("5. GSAP plugins registered SUCCESS");
        }
      } catch (e: any) {
        if ((window as any).gameDebug) {
          (window as any).gameDebug("5. GSAP plugins FAILED: " + e.message);
        }
        return;
      }

      if (!containerRef.current) {
        if ((window as any).gameDebug) {
          (window as any).gameDebug("6. ERROR: containerRef is null");
        }
        return;
      }

      if ((window as any).gameDebug) {
        (window as any).gameDebug("6. Removing existing canvas...");
      }
      containerRef.current.querySelector("canvas")?.remove();

      let resolution = 1;
      if (window.devicePixelRatio) {
        resolution = window.devicePixelRatio;
      }
      if ((window as any).gameDebug) {
        (window as any).gameDebug("7. Resolution: " + resolution);
      }

      if ((window as any).gameDebug) {
        (window as any).gameDebug("8. Creating PIXI Application...");
      }
      app = new PIXI.Application();

      try {
        if ((window as any).gameDebug) {
          (window as any).gameDebug("9. Starting app.init with autoStart...");
        }
        await app.init({
          width: 720 * 2,
          height: 600 * 2,
          backgroundColor: replaceHash(settings.colorTheme.colors.MainBG),
          resolution,
          autoDensity: true,
          autoStart: true,
        });

        if ((window as any).gameDebug) {
          (window as any).gameDebug("10. PIXI Application initialized SUCCESS");
        }

        if (!isMounted || !containerRef.current) {
          if ((window as any).gameDebug) {
            (window as any).gameDebug("11. ERROR: Component unmounted or ref null");
          }
          return;
        }

        app.stage.x = 0;
        app.stage.y = 0;
        appRef.current = app;

        // PIXI v8 uses view property instead of canvas
        const view = app.view as HTMLCanvasElement;
        if (!view) {
          if ((window as any).gameDebug) {
            (window as any).gameDebug("ERROR: app.view is null");
          }
          return;
        }

        // Set actual canvas size attributes
        view.width = app.screen.width;
        view.height = app.screen.height;

        // Set CSS to fill container
        view.style.position = 'absolute';
        view.style.top = '0';
        view.style.left = '0';
        view.style.width = '100%';
        view.style.height = '100%';
        view.style.display = 'block';

        containerRef.current.appendChild(view);

        if ((window as any).gameDebug) {
          (window as any).gameDebug("11. View added, auto-rendering enabled");
          (window as any).gameDebug("View dimensions: " + view.width + "x" + view.height);
          (window as any).gameDebug("View style size: " + view.style.width + "x" + view.style.height);
          (window as any).gameDebug("Screen size: " + app.screen.width + "x" + app.screen.height);
          (window as any).gameDebug("Stage children: " + app.stage.children.length);
          (window as any).gameDebug("Renderer: " + (app.renderer as any)?.type);
          (window as any).gameDebug("Ticker started: " + app.ticker.started);
        }

        if ((window as any).gameDebug) {
          (window as any).gameDebug("12. Calling initializeGame...");
        }
        // Run game initialization asynchronously without blocking
        initializeGame(app).catch((error) => {
          if ((window as any).gameDebug) {
            (window as any).gameDebug("ERROR: initializeGame failed: " + error.message);
          }
          console.error("Game initialization error:", error);
        });
        if ((window as any).gameDebug) {
          (window as any).gameDebug("13. Game initialization started - HIDING DEBUG");
        }
        setTimeout(() => {
          const el = document.getElementById("game-debug");
          if (el) {
            el.style.display = 'none';
          }
        }, 5000); // Extended to 5 seconds for debugging
      } catch (error: any) {
        if ((window as any).gameDebug) {
          (window as any).gameDebug("ERROR: " + error.message);
        }
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
      <div id="game-debug" style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 99999,
        color: "#0f0",
        fontSize: "14px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        textAlign: "left",
        background: "rgba(0,0,0,0.8)",
        padding: "20px",
        maxWidth: "80vw",
        maxHeight: "80vh",
        overflow: "auto",
        pointerEvents: "auto"
      }}>
        Starting...
      </div>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, background: "#fff" }}>
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
