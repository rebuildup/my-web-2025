import React, { useState } from "react";
import { updateSetting, settings } from "../SiteInterface";
import "../styles/014_animation-setting.css";

const AnimationSettings: React.FC = () => {
  const [animEnabled, setAnimEnabled] = useState(
    settings.animationSettings.enabled
  );
  const [reducedMotion, setReducedMotion] = useState(
    settings.animationSettings.reducedMotion
  );

  // Update settings when toggles change
  const handleAnimationToggle = () => {
    const newValue = !animEnabled;
    setAnimEnabled(newValue);
    updateSetting("animationSettings", {
      ...settings.animationSettings,
      enabled: newValue,
    });
  };

  const handleReducedMotionToggle = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    updateSetting("animationSettings", {
      ...settings.animationSettings,
      reducedMotion: newValue,
    });
  };

  return (
    <div className="animation-settings" style={{ zIndex: 1 }}>
      <h1>アニメーション設定</h1>

      <div className="toggle-container">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={animEnabled}
            onChange={handleAnimationToggle}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="toggle-label">背景アニメーションを表示</span>
      </div>

      {animEnabled && (
        <div className="toggle-container">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={handleReducedMotionToggle}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">
            パフォーマンスモード (アニメーション簡略化)
          </span>
        </div>
      )}

      <p className="settings-info">
        背景アニメーションを無効にするとパフォーマンスが向上します。
        パフォーマンスモードでは、一部のアニメーションのみを表示します。
      </p>
    </div>
  );
};

export default AnimationSettings;

