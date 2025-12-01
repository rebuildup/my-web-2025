import React, { useEffect, useState, useRef } from "react";
import OuterStarSvg from "../svg_conponent/001_Outer_star";
import OuterCircleSvg from "../svg_conponent/002_Outer_circ";
import OuterSpearSvg from "../svg_conponent/003_Outer_Spear";
import OuterLineRepeatSvg from "../svg_conponent/004_Outer_Line_repeat";
import InnerStarsSvg from "../svg_conponent/005_Inner_stars";
import InnerSpearSvg from "../svg_conponent/006_Inner_Spear";
import InnerLineSplitSvg from "../svg_conponent/007_Inner_Line_split";
import InnerLineRepeatSvg from "../svg_conponent/008_Inner_Line_repeat";
import CenterStarsSvg from "../svg_conponent/009_Center_Stars";
import CenterLineSplitSvg from "../svg_conponent/010_Center_Line_Split";
import CenterCrownSvg from "../svg_conponent/011_Center_Crown";
import { settings } from "../SiteInterface";

export const SVG_RATIOS = {
  OuterStar: 3705.55 / 4320, // 0.8578
  OuterCircle: 4320 / 4320, // 1.0000 (基準値)
  OuterSpear: 3155.5 / 4320, // 0.7305
  OuterLineRepeat: 3601 / 4320, // 0.8336
  InnerStars: 1251.52 / 4320, // 0.2897
  InnerSpear: 2176.16 / 4320, // 0.5037
  InnerLineSplit: 1357 / 4320, // 0.3141
  InnerLineRepeat: 1800.28 / 4320, // 0.4168
  CenterStars: 779.65 / 4320, // 0.1805
  CenterLineSplit: 1004 / 4320, // 0.2324
  CenterCrown: 615 / 4320, // 0.1424
};

const SVG_ROTATION_CLASSES = {
  OuterStar: "rotate-speed-120 rotate-clockwise",
  OuterCircle: "rotate-speed-100 rotate-counterclockwise",
  OuterSpear: "rotate-speed-80 rotate-clockwise",
  OuterLineRepeat: "rotate-speed-90 rotate-counterclockwise",
  InnerStars: "rotate-speed-70 rotate-clockwise",
  InnerSpear: "rotate-speed-60 rotate-counterclockwise",
  InnerLineSplit: "rotate-speed-50 rotate-clockwise",
  InnerLineRepeat: "rotate-speed-40 rotate-counterclockwise",
  CenterStars: "rotate-speed-30 rotate-clockwise",
  CenterLineSplit: "rotate-speed-20 rotate-counterclockwise",
  CenterCrown: "rotate-speed-25 rotate-clockwise",
};

// Reduced set of SVGs for performance mode
const REDUCED_SVGS = ["OuterCircle", "OuterStar", "InnerStars", "CenterCrown"];

const general_svg_size = 2200;

const BGAnim: React.FC = () => {
  const [accentColor, setAccentColor] = useState<string>("");
  const [animSettings, setAnimSettings] = useState(settings.animationSettings);
  const isVisibleRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Observe animation settings changes
  useEffect(() => {
    // Function to check for changes in animation settings
    const checkAnimSettings = () => {
      const currentSettings = settings.animationSettings;
      if (
        currentSettings.enabled !== animSettings.enabled ||
        currentSettings.reducedMotion !== animSettings.reducedMotion
      ) {
        setAnimSettings({ ...currentSettings });
      }
    };

    // Check settings initially
    checkAnimSettings();

    // Set up periodic check for settings changes
    const intervalId = setInterval(checkAnimSettings, 1000);

    return () => clearInterval(intervalId);
  }, [animSettings]);

  // CSS変数を監視して色の変更を検知する
  useEffect(() => {
    // 初期ロード時に色を設定
    updateAccentColor();

    // MutationObserverを使用してルート要素のstyle属性の変更を監視
    const observer = new MutationObserver(updateAccentColor);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Implement visibility-based performance optimization
  useEffect(() => {
    // Use Intersection Observer to detect if component is visible
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;

          // Pause animations when not visible
          if (containerRef.current) {
            if (!entry.isIntersecting) {
              containerRef.current.style.animationPlayState = "paused";
            } else {
              containerRef.current.style.animationPlayState = "running";
            }
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // MainAccent色を取得する関数
  const updateAccentColor = () => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--MainAccent")
      .trim();
    setAccentColor(color);
  };

  // If animations are disabled, return null
  if (!animSettings.enabled) {
    return null;
  }

  // Helper to determine if an SVG should be rendered in reduced motion mode
  const shouldRenderSvg = (svgName: string) => {
    if (!animSettings.reducedMotion) return true;
    return REDUCED_SVGS.includes(svgName);
  };

  return (
    <div
      className="BG-anim"
      ref={containerRef}
      style={{
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    >
      <div
        className="svg-container"
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      >
        {shouldRenderSvg("OuterStar") && (
          <OuterStarSvg
            size={general_svg_size * SVG_RATIOS.OuterStar}
            className={`BG-svg ${SVG_ROTATION_CLASSES.OuterStar}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("OuterCircle") && (
          <OuterCircleSvg
            size={general_svg_size * SVG_RATIOS.OuterCircle}
            className={`BG-svg ${SVG_ROTATION_CLASSES.OuterCircle}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("OuterSpear") && (
          <OuterSpearSvg
            size={general_svg_size * SVG_RATIOS.OuterSpear}
            className={`BG-svg ${SVG_ROTATION_CLASSES.OuterSpear}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("OuterLineRepeat") && (
          <OuterLineRepeatSvg
            size={general_svg_size * SVG_RATIOS.OuterLineRepeat}
            className={`BG-svg ${SVG_ROTATION_CLASSES.OuterLineRepeat}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("InnerStars") && (
          <InnerStarsSvg
            size={general_svg_size * SVG_RATIOS.InnerStars}
            className={`BG-svg ${SVG_ROTATION_CLASSES.InnerStars}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("InnerSpear") && (
          <InnerSpearSvg
            size={general_svg_size * SVG_RATIOS.InnerSpear}
            className={`BG-svg ${SVG_ROTATION_CLASSES.InnerSpear}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("InnerLineSplit") && (
          <InnerLineSplitSvg
            size={general_svg_size * SVG_RATIOS.InnerLineSplit}
            className={`BG-svg ${SVG_ROTATION_CLASSES.InnerLineSplit}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("InnerLineRepeat") && (
          <InnerLineRepeatSvg
            size={general_svg_size * SVG_RATIOS.InnerLineRepeat}
            className={`BG-svg ${SVG_ROTATION_CLASSES.InnerLineRepeat}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("CenterStars") && (
          <CenterStarsSvg
            size={general_svg_size * SVG_RATIOS.CenterStars}
            className={`BG-svg ${SVG_ROTATION_CLASSES.CenterStars}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("CenterLineSplit") && (
          <CenterLineSplitSvg
            size={general_svg_size * SVG_RATIOS.CenterLineSplit}
            className={`BG-svg ${SVG_ROTATION_CLASSES.CenterLineSplit}`}
            color={accentColor}
          />
        )}

        {shouldRenderSvg("CenterCrown") && (
          <CenterCrownSvg
            size={general_svg_size * SVG_RATIOS.CenterCrown}
            className={`BG-svg ${SVG_ROTATION_CLASSES.CenterCrown}`}
            color={accentColor}
          />
        )}
      </div>
    </div>
  );
};

export default BGAnim;
