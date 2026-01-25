"use client";

import React, { useState, useLayoutEffect, useEffect } from "react";

import Game from "./components/004_Game";
import PlayRecord from "./components/008_PlayRecord";
import Ranking from "./components/005_Ranking";
import Setting from "./components/007_Setting";

// Direct import - more reliable than dynamic import in Next.js 16 + Turbopack
import WebGLPopup from "./components/009_WebGLPopup";

import Header from "./components/002_Header";
import Tab from "./components/001_Tab";

import Footer from "./components/003_footer";

import { initializeFrameEffect } from "./gamesets/024_FrameEffect";
import { initializeSquareEffect } from "./gamesets/025_SquareEffect";

import { loadFromCache, updateSetting } from "./SiteInterface";
import { themes } from "./components/010_ColorPalette";
import BGAnim from "./components/015_BGAnim";

import { fonts } from "./components/011_FontSelector";

const App: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only render client-side components after mount
  useEffect(() => {
    console.log("[App] Component mounted on client");
    setIsMounted(true);
  }, []);

  const handleOpenPopup = () => {
    console.log("[App] Opening popup, showPopup:", true);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    console.log("[App] Closing popup");
    setShowPopup(false);
  };
  const [currentTab, setCurrentTab] = useState<string>("Game");

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

  const renderCurrentComponent = () => {
    switch (currentTab) {
      case "Game":
        return <Game onOpenPopup={handleOpenPopup} />;
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
      {isMounted && showPopup && (
        <>
          {console.log("[App] Rendering WebGLPopup, showPopup:", showPopup)}
          <WebGLPopup onClose={handleClosePopup} />
        </>
      )}
      <Footer />
    </div>
  );
};

export default App;
