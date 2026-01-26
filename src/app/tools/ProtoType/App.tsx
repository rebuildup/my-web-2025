"use client";

import React, { useState, useLayoutEffect, useRef, useEffect } from "react";

import * as PIXI from "pixi.js";
import { gsap, PixiPlugin, CustomEase } from "./lib/gsap-loader";

import Game from "./components/004_Game";
import PlayRecord from "./components/008_PlayRecord";
import Ranking from "./components/005_Ranking";
import Setting from "./components/007_Setting";

import Header from "./components/002_Header";
import Tab from "./components/001_Tab";

import Footer from "./components/003_footer";

import { initializeFrameEffect } from "./gamesets/024_FrameEffect";
import { initializeSquareEffect } from "./gamesets/025_SquareEffect";

import { loadFromCache, updateSetting } from "./SiteInterface";
import { themes } from "./components/010_ColorPalette";
import BGAnim from "./components/015_BGAnim";

import { fonts } from "./components/011_FontSelector";
import { settings } from "./SiteInterface";
import { initializeGame, replaceHash } from "./gamesets/001_game_master";

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("Game");
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useLayoutEffect(() => {
    const cachedTheme = loadFromCache<(typeof themes)[0]>("colorTheme", themes[0]);
    let colorIndex = 0;
    for (let i = 0; i < themes.length; i++) {
      if (themes[i].name == cachedTheme.name) colorIndex = i;
    }
    Object.entries(themes[colorIndex].colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    updateSetting("colorTheme", {
      name: cachedTheme.name,
      colors: {
        MainBG: themes[colorIndex].colors["--MainBG"],
        MainColor: themes[colorIndex].colors["--MainColor"],
        MainAccent: themes[colorIndex].colors["--MainAccent"],
        SecondAccent: themes[colorIndex].colors["--SecondAccent"],
      },
    });

    const cachedFont = loadFromCache<{ fontFamily: string }>("fontTheme", {
      fontFamily: fonts[0].value,
    });
    document.documentElement.style.setProperty("--First-font", cachedFont.fontFamily);
    updateSetting("fontTheme", {
      fontFamily: cachedFont.fontFamily,
      fontSize: 16,
    });
    const cachedLayout = loadFromCache<string>("keyLayout", "QWERTY");
    updateSetting("keyLayout", cachedLayout);
    initializeFrameEffect();
    initializeSquareEffect();
  }, []);

  // Game initialization when isGameRunning becomes true
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

      if (!gameContainerRef.current || !isGameRunning) {
        return;
      }

      gameContainerRef.current.querySelector("canvas")?.remove();

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

        if (!isMounted || !gameContainerRef.current) {
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

        gameContainerRef.current.appendChild(canvas);

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

    if (isGameRunning) {
      initializePixi();
    }

    return () => {
      isMounted = false;
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [isGameRunning]);

  const handleGameStart = () => {
    setIsGameRunning(true);
  };

  const handleGameClose = () => {
    setIsGameRunning(false);
    if (appRef.current) {
      appRef.current.destroy(true);
      appRef.current = null;
    }
  };

  const renderCurrentComponent = () => {
    switch (currentTab) {
      case "Game":
        return <Game onGameStart={handleGameStart} />;
      case "PlayRecord":
        return <PlayRecord />;
      case "Ranking":
        return <Ranking />;
      case "Setting":
        return <Setting />;
      default:
        return <div>タブが見つかりません.</div>;
    }
  };

  return (
    <div>
      <BGAnim />
      <Header />
      <Tab onTabChange={setCurrentTab} />
      <div className="Components" style={{ zIndex: 1 }}>
        {renderCurrentComponent()}
      </div>
      <Footer />

      {/* Game Overlay */}
      {isGameRunning && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, background: "#000" }}>
          <div ref={gameContainerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
          </div>
          <button
            onClick={handleGameClose}
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
        </div>
      )}
    </div>
  );
};

export default App;
