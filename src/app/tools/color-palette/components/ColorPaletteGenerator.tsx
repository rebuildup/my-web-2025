"use client";

import { useState, useEffect, useCallback } from "react";
import ToolWrapper from "../../components/ToolWrapper";
import AccessibleButton from "../../components/AccessibleButton";
import OfflineSettingsManager from "../../components/OfflineSettingsManager";
import useOfflinePerformance from "@/hooks/useOfflinePerformance";

// Color utility functions
interface HSVColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

interface ColorInfo {
  hex: string;
  rgb: RGBColor;
  hsv: HSVColor;
  hsl: { h: number; s: number; l: number };
  name?: string;
}

// HSV to RGB conversion
function hsvToRgb(h: number, s: number, v: number): RGBColor {
  const c = (v / 100) * (s / 100);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v / 100 - c;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// RGB to HSL conversion
function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// RGB to HEX conversion
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Generate random number in range
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Color accessibility checking
function getContrastRatio(color1: RGBColor, color2: RGBColor): number {
  const getLuminance = (rgb: RGBColor) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Predefined color ranges
const colorRangePresets = {
  warm: { hMin: 0, hMax: 60, sMin: 50, sMax: 100, vMin: 40, vMax: 80 },
  cool: { hMin: 180, hMax: 240, sMin: 50, sMax: 100, vMin: 40, vMax: 80 },
  pastel: { hMin: 0, hMax: 360, sMin: 20, sMax: 60, vMin: 70, vMax: 90 },
  monochrome: { hMin: 0, hMax: 0, sMin: 0, sMax: 0, vMin: 10, vMax: 90 },
  vibrant: { hMin: 0, hMax: 360, sMin: 70, sMax: 100, vMin: 70, vMax: 100 },
  earth: { hMin: 20, hMax: 60, sMin: 30, sMax: 80, vMin: 30, vMax: 70 },
};

// Settings interface for offline persistence
interface ColorPaletteSettings extends Record<string, unknown> {
  colorCount: number;
  hueRange: { min: number; max: number };
  saturationRange: { min: number; max: number };
  valueRange: { min: number; max: number };
  exportFormat: "css" | "tailwind" | "json";
  showAccessibility: boolean;
}

export default function ColorPaletteGenerator() {
  // Default settings
  const defaultSettings: ColorPaletteSettings = {
    colorCount: 5,
    hueRange: { min: 0, max: 360 },
    saturationRange: { min: 50, max: 100 },
    valueRange: { min: 50, max: 90 },
    exportFormat: "css",
    showAccessibility: false,
  };

  // State management with settings
  const [settings, setSettings] =
    useState<ColorPaletteSettings>(defaultSettings);
  const [generatedColors, setGeneratedColors] = useState<ColorInfo[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorInfo[][]>([]);

  // Destructure settings for easier access
  const {
    colorCount,
    hueRange,
    saturationRange,
    valueRange,
    exportFormat,
    showAccessibility,
  } = settings;

  // Performance optimization hook
  const { processInChunks, measureTime } = useOfflinePerformance({
    toolName: "color-palette",
    enablePerformanceMonitoring: true,
    enableOfflineNotifications: true,
  });

  // Keyboard shortcuts
  const keyboardShortcuts = [
    { key: "G", description: "新しいパレット生成" },
    { key: "S", description: "パレット保存" },
    { key: "E", description: "エクスポート" },
    { key: "R", description: "リセット" },
    { key: "A", description: "アクセシビリティ表示切替" },
  ];

  // Generate random colors with performance optimization
  const generateColors = useCallback(async () => {
    const timedGeneration = measureTime(() => {
      const colors: ColorInfo[] = [];
      const usedColors = new Set<string>();

      while (colors.length < colorCount) {
        const h = randomInRange(hueRange.min, hueRange.max);
        const s = randomInRange(saturationRange.min, saturationRange.max);
        const v = randomInRange(valueRange.min, valueRange.max);

        const rgb = hsvToRgb(h, s, v);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

        // Avoid duplicate colors
        if (!usedColors.has(hex)) {
          usedColors.add(hex);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

          colors.push({
            hex,
            rgb,
            hsv: { h, s, v },
            hsl,
          });
        }
      }

      return colors;
    });

    // For large color counts, use chunked processing
    if (colorCount > 50) {
      const colorIndices = Array.from({ length: colorCount }, (_, i) => i);
      const colors = await processInChunks(
        colorIndices,
        () => {
          const h = randomInRange(hueRange.min, hueRange.max);
          const s = randomInRange(saturationRange.min, saturationRange.max);
          const v = randomInRange(valueRange.min, valueRange.max);

          const rgb = hsvToRgb(h, s, v);
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

          return { hex, rgb, hsv: { h, s, v }, hsl };
        },
        { chunkSize: 10 }, // Process 10 colors at a time
      );

      // Remove duplicates
      const uniqueColors = colors
        .filter(
          (color, index, arr) =>
            arr.findIndex((c) => c.hex === color.hex) === index,
        )
        .slice(0, colorCount);

      setGeneratedColors(uniqueColors);
    } else {
      setGeneratedColors(timedGeneration.result);
    }
  }, [
    colorCount,
    hueRange,
    saturationRange,
    valueRange,
    processInChunks,
    measureTime,
  ]);

  // Apply preset color range
  const applyPreset = (preset: keyof typeof colorRangePresets) => {
    const range = colorRangePresets[preset];
    setSettings((prev) => ({
      ...prev,
      hueRange: { min: range.hMin, max: range.hMax },
      saturationRange: { min: range.sMin, max: range.sMax },
      valueRange: { min: range.vMin, max: range.vMax },
    }));
  };

  // Save current palette
  const savePalette = useCallback(() => {
    if (generatedColors.length > 0) {
      setSavedPalettes((prev) => [...prev, generatedColors]);
    }
  }, [generatedColors]);

  // Load saved palette
  const loadPalette = (palette: ColorInfo[]) => {
    setGeneratedColors(palette);
  };

  // Delete saved palette
  const deletePalette = (index: number) => {
    setSavedPalettes((prev) => prev.filter((_, i) => i !== index));
  };

  // Export functions
  const exportAsCSS = useCallback(() => {
    const cssVars = generatedColors
      .map((color, index) => `  --color-${index + 1}: ${color.hex};`)
      .join("\n");
    return `:root {\n${cssVars}\n}`;
  }, [generatedColors]);

  const exportAsTailwind = useCallback(() => {
    const colors = generatedColors.reduce(
      (acc, color, index) => {
        acc[`color-${index + 1}`] = color.hex;
        return acc;
      },
      {} as Record<string, string>,
    );

    return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 8)}
    }
  }
}`;
  }, [generatedColors]);

  const exportAsJSON = useCallback(() => {
    return JSON.stringify(generatedColors, null, 2);
  }, [generatedColors]);

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  // Copy individual color
  const copyColor = async (color: ColorInfo, format: "hex" | "rgb" | "hsl") => {
    let text = "";
    switch (format) {
      case "hex":
        text = color.hex;
        break;
      case "rgb":
        text = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
        break;
      case "hsl":
        text = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
        break;
    }
    await copyToClipboard(text);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleToolShortcut = (event: CustomEvent) => {
      switch (event.detail.key.toLowerCase()) {
        case "g":
          generateColors();
          break;
        case "s":
          savePalette();
          break;
        case "e":
          const exportText =
            exportFormat === "css"
              ? exportAsCSS()
              : exportFormat === "tailwind"
                ? exportAsTailwind()
                : exportAsJSON();
          copyToClipboard(exportText);
          break;
        case "r":
          setGeneratedColors([]);
          break;
        case "a":
          setSettings((prev) => ({
            ...prev,
            showAccessibility: !prev.showAccessibility,
          }));
          break;
      }
    };

    document.addEventListener(
      "toolShortcut",
      handleToolShortcut as EventListener,
    );
    return () =>
      document.removeEventListener(
        "toolShortcut",
        handleToolShortcut as EventListener,
      );
  }, [
    generateColors,
    exportFormat,
    showAccessibility,
    exportAsCSS,
    exportAsJSON,
    exportAsTailwind,
    savePalette,
  ]);

  // Load saved palettes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("color-palettes");
    if (saved) {
      try {
        setSavedPalettes(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load saved palettes:", err);
      }
    }
  }, []);

  // Save palettes to localStorage
  useEffect(() => {
    localStorage.setItem("color-palettes", JSON.stringify(savedPalettes));
  }, [savedPalettes]);

  // Design system classes
  const CardStyle = "bg-base border border-foreground p-4 space-y-4";
  const Section_title = "neue-haas-grotesk-display text-xl text-primary mb-4";
  const Input_style =
    "bg-background border border-foreground p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent";
  const Button_style =
    "bg-accent text-background px-4 py-2 border border-accent hover:bg-background hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background";

  return (
    <ToolWrapper
      toolName="Color Palette Generator"
      description="HSV色域を指定してランダムなカラーパレットを生成。CSS・Tailwind・JSON形式でエクスポート可能。デザイナー・開発者向けの色彩ツール。"
      category="design"
      keyboardShortcuts={keyboardShortcuts}
      showPerformanceInfo={true}
      enableOptimizations={true}
    >
      <OfflineSettingsManager
        toolName="color-palette"
        defaultSettings={defaultSettings}
        settings={settings}
        onSettingsChange={setSettings}
        showControls={true}
      >
        {() => (
          <div className="space-y-8">
            {/* Color Range Settings */}
            <section className={CardStyle}>
              <h3 className={Section_title}>Color Range Settings</h3>

              {/* Preset Buttons */}
              <div className="space-y-4">
                <h4 className="neue-haas-grotesk-display text-lg text-primary">
                  Presets
                </h4>
                <div className="grid-system grid-2 xs:grid-3 sm:grid-6 gap-2">
                  {Object.keys(colorRangePresets).map((preset) => (
                    <button
                      key={preset}
                      onClick={() =>
                        applyPreset(preset as keyof typeof colorRangePresets)
                      }
                      className="bg-background border border-foreground px-3 py-2 text-sm hover:bg-base transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Range Controls */}
              <div className="grid-system grid-1 sm:grid-3 gap-6">
                {/* Hue Range */}
                <div className="space-y-2">
                  <label className="neue-haas-grotesk-display text-sm text-primary">
                    Hue Range (色相): {hueRange.min}° - {hueRange.max}°
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hueRange.min}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hueRange: {
                            ...prev.hueRange,
                            min: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full"
                      aria-label="Minimum hue value"
                      data-testid="hue-min"
                    />
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hueRange.max}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hueRange: {
                            ...prev.hueRange,
                            max: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full"
                      aria-label="Maximum hue value"
                      data-testid="hue-max"
                    />
                  </div>
                </div>

                {/* Saturation Range */}
                <div className="space-y-2">
                  <label className="neue-haas-grotesk-display text-sm text-primary">
                    Saturation Range (彩度): {saturationRange.min}% -{" "}
                    {saturationRange.max}%
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={saturationRange.min}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          saturationRange: {
                            ...prev.saturationRange,
                            min: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full"
                      aria-label="Minimum saturation value"
                      data-testid="saturation-min"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={saturationRange.max}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          saturationRange: {
                            ...prev.saturationRange,
                            max: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full"
                      aria-label="Maximum saturation value"
                      data-testid="saturation-max"
                    />
                  </div>
                </div>

                {/* Value Range */}
                <div className="space-y-2">
                  <label className="neue-haas-grotesk-display text-sm text-primary">
                    Value Range (明度): {valueRange.min}% - {valueRange.max}%
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={valueRange.min}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          valueRange: {
                            ...prev.valueRange,
                            min: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full"
                      aria-label="Minimum value/brightness"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={valueRange.max}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          valueRange: {
                            ...prev.valueRange,
                            max: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full"
                      aria-label="Maximum value/brightness"
                    />
                  </div>
                </div>
              </div>

              {/* Color Count */}
              <div className="space-y-2">
                <label className="neue-haas-grotesk-display text-sm text-primary">
                  Number of Colors: {colorCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={colorCount}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      colorCount: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                  aria-label="Number of colors to generate"
                />
              </div>
            </section>

            {/* Generation Controls */}
            <section className={CardStyle}>
              <div className="flex flex-wrap gap-4">
                <AccessibleButton
                  onClick={generateColors}
                  variant="primary"
                  shortcut="G"
                  announceOnClick="新しいカラーパレットを生成しました"
                  aria-label="Generate new color palette"
                  data-testid="generate-colors"
                >
                  Generate Colors
                </AccessibleButton>
                <AccessibleButton
                  onClick={savePalette}
                  disabled={generatedColors.length === 0}
                  variant="secondary"
                  shortcut="S"
                  announceOnClick="パレットを保存しました"
                  aria-label="Save current palette"
                >
                  Save Palette
                </AccessibleButton>
                <AccessibleButton
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      showAccessibility: !prev.showAccessibility,
                    }))
                  }
                  variant="ghost"
                  shortcut="A"
                  announceOnClick={
                    showAccessibility
                      ? "アクセシビリティ情報を非表示にしました"
                      : "アクセシビリティ情報を表示しました"
                  }
                  aria-label="Toggle accessibility information"
                >
                  Accessibility
                </AccessibleButton>
              </div>
            </section>

            {/* Generated Colors Display */}
            {generatedColors.length > 0 && (
              <section className={CardStyle}>
                <h3 className={Section_title}>Generated Palette</h3>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-5 gap-4">
                  {generatedColors.map((color, index) => (
                    <div
                      key={index}
                      className="space-y-2"
                      role="button"
                      tabIndex={0}
                      aria-label={`Color ${index + 1}: ${color.hex}`}
                      data-testid="color-item"
                    >
                      <div
                        className="w-full h-20 border border-foreground cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color, "hex")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            copyColor(color, "hex");
                          }
                        }}
                        title={`Click to copy ${color.hex}`}
                      />
                      <div className="text-xs space-y-1">
                        <button
                          onClick={() => copyColor(color, "hex")}
                          className="block w-full text-left hover:text-accent focus:outline-none focus:text-accent"
                          title="Click to copy HEX value"
                          data-testid="copy-hex"
                        >
                          HEX: {color.hex}
                        </button>
                        <button
                          onClick={() => copyColor(color, "rgb")}
                          className="block w-full text-left hover:text-accent focus:outline-none focus:text-accent"
                          title="Click to copy RGB value"
                        >
                          RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                        </button>
                        <button
                          onClick={() => copyColor(color, "hsl")}
                          className="block w-full text-left hover:text-accent focus:outline-none focus:text-accent"
                          title="Click to copy HSL value"
                        >
                          HSL: {color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%
                        </button>

                        {/* Accessibility Information */}
                        {showAccessibility && (
                          <div className="pt-2 border-t border-foreground">
                            <div className="text-xs">
                              <div>
                                vs White:{" "}
                                {getContrastRatio(color.rgb, {
                                  r: 255,
                                  g: 255,
                                  b: 255,
                                }).toFixed(2)}
                              </div>
                              <div>
                                vs Black:{" "}
                                {getContrastRatio(color.rgb, {
                                  r: 0,
                                  g: 0,
                                  b: 0,
                                }).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Export Section */}
            {generatedColors.length > 0 && (
              <section className={CardStyle}>
                <h3 className={Section_title}>Export Palette</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <select
                      value={exportFormat}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          exportFormat: e.target.value as
                            | "css"
                            | "tailwind"
                            | "json",
                        }))
                      }
                      className={Input_style}
                      aria-label="Select export format"
                    >
                      <option value="css">CSS Variables</option>
                      <option value="tailwind">Tailwind Config</option>
                      <option value="json">JSON</option>
                    </select>
                    <button
                      onClick={() => {
                        const exportText =
                          exportFormat === "css"
                            ? exportAsCSS()
                            : exportFormat === "tailwind"
                              ? exportAsTailwind()
                              : exportAsJSON();
                        copyToClipboard(exportText);
                      }}
                      className={Button_style}
                      aria-label="Copy export code to clipboard"
                      data-testid="export-css"
                    >
                      Copy Export (E)
                    </button>
                  </div>

                  <div className="bg-background border border-foreground p-4 overflow-x-auto">
                    <pre className="text-xs whitespace-pre-wrap">
                      {exportFormat === "css"
                        ? exportAsCSS()
                        : exportFormat === "tailwind"
                          ? exportAsTailwind()
                          : exportAsJSON()}
                    </pre>
                  </div>
                </div>
              </section>
            )}

            {/* Saved Palettes */}
            {savedPalettes.length > 0 && (
              <section className={CardStyle}>
                <h3 className={Section_title}>
                  Saved Palettes ({savedPalettes.length})
                </h3>
                <div className="space-y-4">
                  {savedPalettes.map((palette, paletteIndex) => (
                    <div
                      key={paletteIndex}
                      className="bg-background border border-foreground p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">
                          Palette {paletteIndex + 1}
                        </span>
                        <div className="space-x-2">
                          <button
                            onClick={() => loadPalette(palette)}
                            className="text-xs bg-accent text-background px-2 py-1 hover:bg-background hover:text-accent border border-accent transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deletePalette(paletteIndex)}
                            className="text-xs bg-background border border-foreground px-2 py-1 hover:bg-base transition-colors focus:outline-none focus:ring-1 focus:ring-foreground"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {palette.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-8 h-8 border border-foreground cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => copyColor(color, "hex")}
                            title={color.hex}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </OfflineSettingsManager>
    </ToolWrapper>
  );
}
