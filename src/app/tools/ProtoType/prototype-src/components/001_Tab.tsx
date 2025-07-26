import React from "react";
import "../styles/001_tab.css";
interface TabProps {
  onTabChange: (tab: string) => void;
}

const Tab: React.FC<TabProps> = ({ onTabChange }) => {
  return (
    <div className="tab" style={{ zIndex: 2 }}>
      <button
        className="tab-Btn"
        style={{ zIndex: 1 }}
        onClick={() => onTabChange("Game")}
      >
        ゲーム
      </button>
      {/*
      <br />
      <button onClick={() => onTabChange("PlayRecord")}>プレイ記録</button>*/}
      <br />
      <button
        className="tab-Btn"
        style={{ zIndex: 1 }}
        onClick={() => onTabChange("Ranking")}
      >
        ランキング
      </button>
      <br />
      <button
        className="tab-Btn"
        style={{ zIndex: 1 }}
        onClick={() => onTabChange("Setting")}
      >
        サイト設定
      </button>
    </div>
  );
};

export default Tab;
