import React, { useState, useLayoutEffect } from "react";

import Game from "./components/004_Game.tsx";
import PlayRecord from "./components/008_PlayRecord.tsx";
import Ranking from "./components/005_Ranking.tsx";
import Setting from "./components/007_Setting.tsx";
import WebGLPopup from "./components/009_WebGLPopup.tsx";
import Header from "./components/002_Header.tsx";
import Tab from "./components/001_Tab.tsx";

import Footer from "./components/003_footer.tsx";

import { initializeFrameEffect } from "./gamesets/024_FrameEffect.ts";
import { initializeSquareEffect } from "./gamesets/025_SquareEffect.ts";

import "./index.css";

import { loadFromCache, updateSetting } from "./SiteInterface.ts";
import { themes } from "./components/010_ColorPalette.tsx";
import BGAnim from "./components/015_BGAnim.tsx";

import { fonts } from "./components/011_FontSelector.tsx";

const App: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
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
        return <div>タブが見つかりません。</div>;
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
      {showPopup && <WebGLPopup onClose={handleClosePopup} />}
      <Footer />
    </div>
  );
};

export default App;
