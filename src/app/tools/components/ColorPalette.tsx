'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Download, RefreshCw, Eye, EyeOff, Palette } from 'lucide-react';

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ColorData {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  name: string;
}

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic' | 'monochromatic';

const ColorPalette: React.FC = () => {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [colors, setColors] = useState<ColorData[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [accessibilityCheck, setAccessibilityCheck] = useState(false);

  // Color theory calculations
  const hexToHsl = useCallback((hex: string): HSL => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }, []);

  const hslToHex = useCallback((h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);

  const hexToRgb = useCallback((hex: string): RGB => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }, []);

  const getColorName = useCallback((hex: string): string => {
    const colorNames: Record<string, string> = {
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ff00ff': 'Magenta',
      '#00ffff': 'Cyan',
      '#ffffff': 'White',
      '#000000': 'Black',
    };
    
    // Simple hue-based naming
    const hsl = hexToHsl(hex);
    const h = hsl.h;
    
    if (hsl.l > 90) return 'Very Light';
    if (hsl.l < 10) return 'Very Dark';
    if (hsl.s < 10) return 'Gray';
    
    if (h >= 0 && h < 30) return 'Red';
    if (h >= 30 && h < 60) return 'Orange';
    if (h >= 60 && h < 90) return 'Yellow';
    if (h >= 90 && h < 150) return 'Green';
    if (h >= 150 && h < 210) return 'Cyan';
    if (h >= 210 && h < 270) return 'Blue';
    if (h >= 270 && h < 330) return 'Purple';
    return 'Red';
  }, [hexToHsl]);

  const generateHarmony = useCallback((baseHex: string, type: HarmonyType): ColorData[] => {
    const baseHsl = hexToHsl(baseHex);
    const results: ColorData[] = [];

    // Always include the base color
    const baseColor: ColorData = {
      hex: baseHex,
      rgb: hexToRgb(baseHex),
      hsl: baseHsl,
      name: getColorName(baseHex)
    };
    results.push(baseColor);

    switch (type) {
      case 'complementary':
        const compHue = (baseHsl.h + 180) % 360;
        const compHex = hslToHex(compHue, baseHsl.s, baseHsl.l);
        results.push({
          hex: compHex,
          rgb: hexToRgb(compHex),
          hsl: { h: compHue, s: baseHsl.s, l: baseHsl.l },
          name: getColorName(compHex)
        });
        break;

      case 'analogous':
        [-30, 30].forEach(offset => {
          const hue = (baseHsl.h + offset + 360) % 360;
          const hex = hslToHex(hue, baseHsl.s, baseHsl.l);
          results.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { h: hue, s: baseHsl.s, l: baseHsl.l },
            name: getColorName(hex)
          });
        });
        break;

      case 'triadic':
        [120, 240].forEach(offset => {
          const hue = (baseHsl.h + offset) % 360;
          const hex = hslToHex(hue, baseHsl.s, baseHsl.l);
          results.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { h: hue, s: baseHsl.s, l: baseHsl.l },
            name: getColorName(hex)
          });
        });
        break;

      case 'split-complementary':
        [150, 210].forEach(offset => {
          const hue = (baseHsl.h + offset) % 360;
          const hex = hslToHex(hue, baseHsl.s, baseHsl.l);
          results.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { h: hue, s: baseHsl.s, l: baseHsl.l },
            name: getColorName(hex)
          });
        });
        break;

      case 'tetradic':
        [90, 180, 270].forEach(offset => {
          const hue = (baseHsl.h + offset) % 360;
          const hex = hslToHex(hue, baseHsl.s, baseHsl.l);
          results.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { h: hue, s: baseHsl.s, l: baseHsl.l },
            name: getColorName(hex)
          });
        });
        break;

      case 'monochromatic':
        [20, 40, 60, 80].forEach(lightnessOffset => {
          const lightness = Math.max(10, Math.min(90, baseHsl.l + lightnessOffset - 40));
          const hex = hslToHex(baseHsl.h, baseHsl.s, lightness);
          results.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { h: baseHsl.h, s: baseHsl.s, l: lightness },
            name: getColorName(hex)
          });
        });
        break;
    }

    return results;
  }, [hexToHsl, hslToHex, hexToRgb, getColorName]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const exportPalette = useCallback((format: 'css' | 'json' | 'ase') => {
    let content = '';
    
    switch (format) {
      case 'css':
        content = ':root {\n' + colors.map((color, index) => 
          `  --color-${index + 1}: ${color.hex};`
        ).join('\n') + '\n}';
        break;
      case 'json':
        content = JSON.stringify(colors, null, 2);
        break;
      case 'ase':
        // Simplified ASE format (would need proper implementation)
        content = colors.map(color => `${color.name}: ${color.hex}`).join('\n');
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [colors]);

  const getContrastRatio = useCallback((color1: RGB, color2: RGB): number => {
    const luminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = luminance(color1.r, color1.g, color1.b);
    const lum2 = luminance(color2.r, color2.g, color2.b);
    
    return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
  }, []);

  // Generate colors when base color or harmony type changes
  useEffect(() => {
    const newColors = generateHarmony(baseColor, harmonyType);
    setColors(newColors);
  }, [baseColor, harmonyType, generateHarmony]);

  const harmonyOptions = [
    { value: 'complementary', label: 'Complementary' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'split-complementary', label: 'Split Complementary' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'monochromatic', label: 'Monochromatic' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="border-foreground/20 border p-6">
        <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
          <Palette className="mr-2 inline" size={24} />
          Color Palette Generator
        </h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Base Color Picker */}
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Base Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="border-foreground/20 h-12 w-16 border"
              />
              <input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="border-foreground/20 bg-gray text-foreground noto-sans-jp flex-1 border px-3 py-2 focus:outline-none"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Harmony Type */}
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Harmony Type
            </label>
            <select
              value={harmonyType}
              onChange={(e) => setHarmonyType(e.target.value as HarmonyType)}
              className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full border px-3 py-2 focus:outline-none"
            >
              {harmonyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="text-primary focus:ring-primary"
                />
                <span className="noto-sans-jp text-foreground text-sm">Show Details</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={accessibilityCheck}
                  onChange={(e) => setAccessibilityCheck(e.target.checked)}
                  className="text-primary focus:ring-primary"
                />
                <span className="noto-sans-jp text-foreground text-sm">Accessibility Check</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setBaseColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'))}
            className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-2 border px-4 py-2 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Random</span>
          </button>
          
          <button
            onClick={() => exportPalette('css')}
            className="bg-primary hover:bg-primary/80 text-white flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            <Download size={16} />
            <span>CSS</span>
          </button>
          
          <button
            onClick={() => exportPalette('json')}
            className="bg-primary hover:bg-primary/80 text-white flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            <Download size={16} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="border-foreground/20 border p-6">
        <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
          Generated Palette
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {colors.map((color, index) => (
            <div key={index} className="border-foreground/20 group border">
              {/* Color Swatch */}
              <div 
                className="h-24 w-full cursor-pointer transition-transform group-hover:scale-105"
                style={{ backgroundColor: color.hex }}
                onClick={() => copyToClipboard(color.hex)}
              />
              
              {/* Color Info */}
              <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="noto-sans-jp text-foreground text-sm font-medium">
                    {color.name}
                  </span>
                  <button
                    onClick={() => copyToClipboard(color.hex)}
                    className="text-foreground/60 hover:text-primary opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="text-foreground/80 font-mono">
                    {color.hex.toUpperCase()}
                  </div>
                  
                  {showDetails && (
                    <>
                      <div className="text-foreground/60">
                        RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                      </div>
                      <div className="text-foreground/60">
                        HSL({Math.round(color.hsl.h)}°, {Math.round(color.hsl.s)}%, {Math.round(color.hsl.l)}%)
                      </div>
                    </>
                  )}
                  
                  {accessibilityCheck && index === 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-foreground/60 text-xs font-medium">Contrast Ratios:</div>
                      {colors.slice(1).map((otherColor, otherIndex) => {
                        const ratio = getContrastRatio(color.rgb, otherColor.rgb);
                        const isGood = ratio >= 4.5;
                        return (
                          <div key={otherIndex} className={`text-xs ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                            vs Color {otherIndex + 2}: {ratio.toFixed(2)}:1
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="border-foreground/20 border p-6">
        <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
          Preview
        </h3>
        
        <div className="space-y-4">
          {/* Text on Background Examples */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {colors.slice(0, 2).map((bgColor, bgIndex) => (
              <div key={bgIndex} style={{ backgroundColor: bgColor.hex }} className="p-4">
                {colors.slice(0, 2).map((textColor, textIndex) => {
                  if (bgIndex === textIndex) return null;
                  const contrast = getContrastRatio(bgColor.rgb, textColor.rgb);
                  return (
                    <div key={textIndex} style={{ color: textColor.hex }} className="mb-2">
                      <div className="font-medium">Sample Text</div>
                      <div className="text-sm">Contrast: {contrast.toFixed(2)}:1</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
