'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Download, Palette, Check, RefreshCw, Save } from 'lucide-react';

// Color conversion and manipulation utilities
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// Color palette interfaces

interface SavedPalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: string;
}

type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'monochromatic'
  | 'split-complementary';

// Color conversion utilities
const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (rgb: RGB): string => {
  return '#' + ((1 << 24) | (rgb.r << 16) | (rgb.g << 8) | rgb.b).toString(16).slice(1);
};

const rgbToHsl = (rgb: RGB): HSL => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
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
};

const hslToRgb = (hsl: HSL): RGB => {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Color harmony generation
const generateHarmony = (baseColor: string, type: HarmonyType): string[] => {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);
  const colors: HSL[] = [];

  switch (type) {
    case 'complementary':
      colors.push(hsl);
      colors.push({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l });
      break;
    case 'analogous':
      colors.push({ h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l });
      colors.push(hsl);
      colors.push({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l });
      break;
    case 'triadic':
      colors.push(hsl);
      colors.push({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l });
      colors.push({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l });
      break;
    case 'tetradic':
      colors.push(hsl);
      colors.push({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l });
      colors.push({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l });
      colors.push({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l });
      break;
    case 'monochromatic':
      colors.push({ ...hsl, l: Math.max(hsl.l - 30, 10) });
      colors.push({ ...hsl, l: Math.max(hsl.l - 15, 20) });
      colors.push(hsl);
      colors.push({ ...hsl, l: Math.min(hsl.l + 15, 80) });
      colors.push({ ...hsl, l: Math.min(hsl.l + 30, 90) });
      break;
    case 'split-complementary':
      colors.push(hsl);
      colors.push({ h: (hsl.h + 150) % 360, s: hsl.s, l: hsl.l });
      colors.push({ h: (hsl.h + 210) % 360, s: hsl.s, l: hsl.l });
      break;
  }

  return colors.map(hslColor => rgbToHex(hslToRgb(hslColor)));
};

// Generate random color
const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Get text color (black or white) based on background color for contrast
const getTextColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// Main component
const ColorPalette: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>('#3498db');
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [palette, setPalette] = useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [paletteName, setPaletteName] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeColorFormat, setActiveColorFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  // Generate color palette based on base color and harmony type
  const generatePalette = useCallback((color: string, type: HarmonyType) => {
    const newPalette = generateHarmony(color, type);
    setPalette(newPalette);
  }, []);

  // Load saved palettes from localStorage on component mount
  React.useEffect(() => {
    const savedPalettesFromStorage = localStorage.getItem('savedPalettes');
    if (savedPalettesFromStorage) {
      try {
        setSavedPalettes(JSON.parse(savedPalettesFromStorage));
      } catch (e) {
        console.error('Failed to parse saved palettes:', e);
      }
    }

    // Generate initial palette
    generatePalette(baseColor, harmonyType);
  }, [baseColor, harmonyType, generatePalette]);

  // Update palette when base color or harmony type changes
  React.useEffect(() => {
    generatePalette(baseColor, harmonyType);
  }, [baseColor, harmonyType, generatePalette]);

  // Generate a random base color
  const generateRandomPalette = useCallback(() => {
    const newBaseColor = generateRandomColor();
    setBaseColor(newBaseColor);
  }, []);

  // Format color based on active format
  const formatColor = useCallback(
    (color: string): string => {
      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb);

      switch (activeColorFormat) {
        case 'hex':
          return color.toUpperCase();
        case 'rgb':
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl':
          return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        default:
          return color;
      }
    },
    [activeColorFormat]
  );

  // Copy color to clipboard
  const copyToClipboard = useCallback(async (content: string, label: string = 'Color') => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(`${label} copied!`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopySuccess('Copy failed');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  }, []);

  // Save current palette
  const savePalette = useCallback(() => {
    if (!paletteName.trim()) {
      setCopySuccess('Please enter a palette name');
      setTimeout(() => setCopySuccess(null), 2000);
      return;
    }

    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      name: paletteName,
      colors: palette,
      createdAt: new Date().toISOString(),
    };

    const updatedPalettes = [...savedPalettes, newPalette];
    setSavedPalettes(updatedPalettes);
    localStorage.setItem('savedPalettes', JSON.stringify(updatedPalettes));

    setPaletteName('');
    setCopySuccess('Palette saved!');
    setTimeout(() => setCopySuccess(null), 2000);
  }, [palette, paletteName, savedPalettes]);

  // Delete saved palette
  const deletePalette = useCallback(
    (id: string) => {
      const updatedPalettes = savedPalettes.filter(p => p.id !== id);
      setSavedPalettes(updatedPalettes);
      localStorage.setItem('savedPalettes', JSON.stringify(updatedPalettes));

      setCopySuccess('Palette deleted');
      setTimeout(() => setCopySuccess(null), 2000);
    },
    [savedPalettes]
  );

  // Load saved palette
  const loadPalette = useCallback((paletteToLoad: SavedPalette) => {
    setPalette(paletteToLoad.colors);
    setBaseColor(paletteToLoad.colors[0]);

    setCopySuccess('Palette loaded');
    setTimeout(() => setCopySuccess(null), 2000);
  }, []);

  // Export palette
  const exportPalette = useCallback(
    (format: 'json' | 'css' | 'scss') => {
      let content = '';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      switch (format) {
        case 'json':
          content = JSON.stringify(
            {
              name: paletteName || 'Color Palette',
              colors: palette.map(color => ({
                hex: color,
                rgb: hexToRgb(color),
                hsl: rgbToHsl(hexToRgb(color)),
              })),
              timestamp: new Date().toISOString(),
            },
            null,
            2
          );
          break;
        case 'css':
          content = `:root {\n${palette
            .map((color, index) => `  --color-${index + 1}: ${color};`)
            .join('\n')}\n}`;
          break;
        case 'scss':
          content = palette.map((color, index) => `$color-${index + 1}: ${color};`).join('\n');
          break;
      }

      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `color-palette-${timestamp}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setCopySuccess(`Palette exported as ${format.toUpperCase()}`);
      setTimeout(() => setCopySuccess(null), 2000);
    },
    [palette, paletteName]
  );

  return (
    <div className="space-y-6">
      {/* Color Input */}
      <div className="border-foreground/20 border p-6">
        <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
          <Palette className="mr-2 inline" size={24} />
          Color Palette Generator
        </h2>
        <div className="space-y-4">
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Base Color
            </label>
            <div className="flex flex-wrap gap-3">
              <input
                type="color"
                value={baseColor}
                onChange={e => setBaseColor(e.target.value)}
                className="h-10 w-16 cursor-pointer"
              />
              <input
                type="text"
                value={baseColor}
                onChange={e => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setBaseColor(value);
                  }
                }}
                className="border-foreground/20 bg-gray text-foreground w-32 border px-3 py-2 focus:outline-none"
              />
              <button
                onClick={generateRandomPalette}
                className="border-foreground/20 text-foreground/70 hover:border-primary/50 flex items-center space-x-1 border px-4 py-2 text-sm transition-colors"
              >
                <RefreshCw size={14} />
                <span>Random</span>
              </button>
            </div>
          </div>
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Harmony Type
            </label>
            <select
              value={harmonyType}
              onChange={e => setHarmonyType(e.target.value as HarmonyType)}
              className="border-foreground/20 bg-gray text-foreground w-full border px-3 py-2 focus:outline-none"
            >
              <option value="complementary">Complementary</option>
              <option value="analogous">Analogous</option>
              <option value="triadic">Triadic</option>
              <option value="tetradic">Tetradic</option>
              <option value="monochromatic">Monochromatic</option>
              <option value="split-complementary">Split Complementary</option>
            </select>
          </div>
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Color Format
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveColorFormat('hex')}
                className={`px-3 py-1 text-sm ${
                  activeColorFormat === 'hex'
                    ? 'bg-primary text-white'
                    : 'border-foreground/20 text-foreground/70 border'
                }`}
              >
                HEX
              </button>
              <button
                onClick={() => setActiveColorFormat('rgb')}
                className={`px-3 py-1 text-sm ${
                  activeColorFormat === 'rgb'
                    ? 'bg-primary text-white'
                    : 'border-foreground/20 text-foreground/70 border'
                }`}
              >
                RGB
              </button>
              <button
                onClick={() => setActiveColorFormat('hsl')}
                className={`px-3 py-1 text-sm ${
                  activeColorFormat === 'hsl'
                    ? 'bg-primary text-white'
                    : 'border-foreground/20 text-foreground/70 border'
                }`}
              >
                HSL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="border-foreground/20 border p-6">
        <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
          Generated Palette
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {palette.map((color, index) => (
            <div key={index} className="overflow-hidden rounded border">
              <div className="h-32 w-full" style={{ backgroundColor: color }}></div>
              <div className="border-t p-3">
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-sm"
                    style={{ color: getTextColor(color) === '#000000' ? '#333' : '#eee' }}
                  >
                    {formatColor(color)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(formatColor(color))}
                    className="text-foreground/50 hover:text-primary"
                    title="Copy color"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Palette */}
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div className="flex-grow">
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Palette Name
            </label>
            <input
              type="text"
              value={paletteName}
              onChange={e => setPaletteName(e.target.value)}
              placeholder="My awesome palette"
              className="border-foreground/20 bg-gray text-foreground w-full border px-3 py-2 focus:outline-none"
            />
          </div>
          <button
            onClick={savePalette}
            className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-1 border px-4 py-2 text-sm transition-colors"
          >
            <Save size={14} />
            <span>Save Palette</span>
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="border-foreground/20 border p-6">
        <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">Export Palette</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportPalette('json')}
            className="bg-primary hover:bg-primary/80 flex items-center space-x-2 px-4 py-2 text-white transition-colors"
          >
            <Download size={16} />
            <span>JSON</span>
          </button>
          <button
            onClick={() => exportPalette('css')}
            className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-2 border px-4 py-2 transition-colors"
          >
            <Download size={16} />
            <span>CSS Variables</span>
          </button>
          <button
            onClick={() => exportPalette('scss')}
            className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-2 border px-4 py-2 transition-colors"
          >
            <Download size={16} />
            <span>SCSS Variables</span>
          </button>
        </div>

        {/* Copy notification */}
        {copySuccess && (
          <div className="bg-primary/10 text-primary mt-4 flex items-center gap-2 rounded-md p-2 text-sm">
            <Check size={16} />
            <span>{copySuccess}</span>
          </div>
        )}
      </div>

      {/* Saved Palettes */}
      {savedPalettes.length > 0 && (
        <div className="border-foreground/20 border p-6">
          <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">Saved Palettes</h3>
          <div className="space-y-4">
            {savedPalettes.map(savedPalette => (
              <div key={savedPalette.id} className="border-foreground/10 border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-foreground font-medium">{savedPalette.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadPalette(savedPalette)}
                      className="text-foreground/50 hover:text-primary text-xs"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deletePalette(savedPalette.id)}
                      className="text-foreground/50 text-xs hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex h-8 w-full overflow-hidden rounded">
                  {savedPalette.colors.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                      title={color}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
