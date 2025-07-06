'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Palette, 
  Download, 
  RefreshCw, 
  Copy, 
  Settings, 
  Save,
  Trash2,
  ArrowLeft,
  Shuffle
} from "lucide-react";

interface HSV {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  v: number; // Value: 0-100
}

interface ColorItem {
  id: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsv: HSV;
  hsl: { h: number; s: number; l: number };
  name?: string;
}

interface ColorSettings {
  hueMin: number;
  hueMax: number;
  saturationMin: number;
  saturationMax: number;
  valueMin: number;
  valueMax: number;
  colorCount: number;
}

const defaultSettings: ColorSettings = {
  hueMin: 0,
  hueMax: 360,
  saturationMin: 50,
  saturationMax: 100,
  valueMin: 40,
  valueMax: 80,
  colorCount: 5
};

const colorPresets = [
  { name: '暖色系', settings: { ...defaultSettings, hueMin: 0, hueMax: 60 } },
  { name: '寒色系', settings: { ...defaultSettings, hueMin: 180, hueMax: 240 } },
  { name: 'パステル系', settings: { ...defaultSettings, saturationMin: 20, saturationMax: 60, valueMin: 70, valueMax: 90 } },
  { name: 'モノクロ系', settings: { ...defaultSettings, saturationMin: 0, saturationMax: 0, valueMin: 10, valueMax: 90 } },
  { name: 'ビビッド', settings: { ...defaultSettings, saturationMin: 80, saturationMax: 100, valueMin: 60, valueMax: 90 } },
];

export default function ColorPalettePage() {
  const [settings, setSettings] = useState<ColorSettings>(defaultSettings);
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorItem[][]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  useEffect(() => {
    generateColors();
    loadSavedPalettes();
  }, []);

  const loadSavedPalettes = () => {
    try {
      const saved = localStorage.getItem('color-palettes');
      if (saved) {
        setSavedPalettes(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved palettes:', error);
    }
  };

  const savePalette = () => {
    if (colors.length === 0) return;
    
    const newPalettes = [...savedPalettes, colors];
    setSavedPalettes(newPalettes);
    
    try {
      localStorage.setItem('color-palettes', JSON.stringify(newPalettes));
    } catch (error) {
      console.error('Failed to save palette:', error);
    }
  };

  const deletePalette = (index: number) => {
    const newPalettes = savedPalettes.filter((_, i) => i !== index);
    setSavedPalettes(newPalettes);
    
    try {
      localStorage.setItem('color-palettes', JSON.stringify(newPalettes));
    } catch (error) {
      console.error('Failed to delete palette:', error);
    }
  };

  const hsvToRgb = (h: number, s: number, v: number): { r: number; g: number; b: number } => {
    s /= 100;
    v /= 100;
    
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255; g /= 255; b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const l = (max + min) / 2;
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
    
    return {
      h,
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const generateRandomColor = (): ColorItem => {
    const h = Math.random() * (settings.hueMax - settings.hueMin) + settings.hueMin;
    const s = Math.random() * (settings.saturationMax - settings.saturationMin) + settings.saturationMin;
    const v = Math.random() * (settings.valueMax - settings.valueMin) + settings.valueMin;
    
    const rgb = hsvToRgb(h, s, v);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      hex,
      rgb,
      hsv: { h, s, v },
      hsl
    };
  };

  const generateColors = () => {
    const newColors: ColorItem[] = [];
    for (let i = 0; i < settings.colorCount; i++) {
      newColors.push(generateRandomColor());
    }
    setColors(newColors);
  };

  const copyToClipboard = async (text: string, colorId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedColor(colorId);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const exportAsCSS = () => {
    const cssVars = colors.map((color, index) => 
      `  --color-${index + 1}: ${color.hex};`
    ).join('\n');
    
    const cssText = `:root {\n${cssVars}\n}`;
    
    const blob = new Blob([cssText], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const jsonData = {
      palette: colors,
      settings,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Color Palette Generator",
    "description": "色域を指定してランダムにカラーパレットを生成",
    "url": "https://yusuke-kim.com/tools/color-palette",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web Browser",
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              href="/tools" 
              className="neue-haas-grotesk-display text-xl text-primary hover:text-primary/80 flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Tools</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Settings size={16} />
                <span className="noto-sans-jp text-sm">設定</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-12 px-4">
          <div className="flex justify-center mb-4">
            <Palette size={64} className="text-primary" />
          </div>
          <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
            Color Palette Generator
          </h1>
          <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
            色域を指定してランダムにカラーパレットを生成。<br />
            デザインに活用できる美しい色の組み合わせを作成。
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {/* Settings Panel */}
          {showSettings && (
            <section className="mb-8 border border-foreground/20 bg-gray/50 p-6">
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">色域設定</h3>
              
              {/* Presets */}
              <div className="mb-6">
                <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">プリセット</label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSettings(preset.settings)}
                      className="px-3 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors noto-sans-jp text-sm"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hue Range */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    色相範囲 ({settings.hueMin}° - {settings.hueMax}°)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={settings.hueMin}
                      onChange={(e) => setSettings({...settings, hueMin: Number(e.target.value)})}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={settings.hueMax}
                      onChange={(e) => setSettings({...settings, hueMax: Number(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Saturation Range */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    彩度範囲 ({settings.saturationMin}% - {settings.saturationMax}%)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.saturationMin}
                      onChange={(e) => setSettings({...settings, saturationMin: Number(e.target.value)})}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.saturationMax}
                      onChange={(e) => setSettings({...settings, saturationMax: Number(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Value/Brightness Range */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    明度範囲 ({settings.valueMin}% - {settings.valueMax}%)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.valueMin}
                      onChange={(e) => setSettings({...settings, valueMin: Number(e.target.value)})}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.valueMax}
                      onChange={(e) => setSettings({...settings, valueMax: Number(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Color Count */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    色数 ({settings.colorCount}色)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={settings.colorCount}
                    onChange={(e) => setSettings({...settings, colorCount: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={generateColors}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-gray hover:bg-primary/90 transition-colors"
              >
                <Shuffle size={20} />
                <span className="noto-sans-jp font-medium">新しいパレットを生成</span>
              </button>
              
              <button
                onClick={savePalette}
                disabled={colors.length === 0}
                className="flex items-center space-x-2 px-6 py-3 border border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                <span className="noto-sans-jp font-medium">パレットを保存</span>
              </button>
            </div>
          </section>

          {/* Current Palette */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6 text-center">
              現在のパレット
            </h2>
            
            {colors.length === 0 ? (
              <div className="text-center py-12">
                <Palette size={64} className="text-foreground/30 mx-auto mb-4" />
                <p className="noto-sans-jp text-foreground/60">「新しいパレットを生成」ボタンをクリックして開始</p>
              </div>
            ) : (
              <>
                {/* Color Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
                  {colors.map((color) => (
                    <div key={color.id} className="border border-foreground/20 bg-gray/50 overflow-hidden">
                      <div 
                        className="h-32 w-full cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyToClipboard(color.hex, color.id)}
                        title="クリックでHEXコードをコピー"
                      />
                      
                      <div className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="noto-sans-jp text-xs text-foreground/60">HEX</span>
                            <button
                              onClick={() => copyToClipboard(color.hex, color.id)}
                              className="flex items-center space-x-1 text-xs text-foreground hover:text-primary transition-colors"
                            >
                              <span className="font-mono">{color.hex.toUpperCase()}</span>
                              {copiedColor === color.id ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="noto-sans-jp text-xs text-foreground/60">RGB</span>
                            <button
                              onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, color.id)}
                              className="text-xs text-foreground hover:text-primary transition-colors font-mono"
                            >
                              {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="noto-sans-jp text-xs text-foreground/60">HSL</span>
                            <button
                              onClick={() => copyToClipboard(`hsl(${Math.round(color.hsl.h)}, ${color.hsl.s}%, ${color.hsl.l}%)`, color.id)}
                              className="text-xs text-foreground hover:text-primary transition-colors font-mono"
                            >
                              {Math.round(color.hsl.h)}°, {color.hsl.s}%, {color.hsl.l}%
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Export Options */}
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={exportAsCSS}
                    className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Download size={16} />
                    <span className="noto-sans-jp text-sm">CSS変数で出力</span>
                  </button>
                  
                  <button
                    onClick={exportAsJSON}
                    className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Download size={16} />
                    <span className="noto-sans-jp text-sm">JSON形式で出力</span>
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Saved Palettes */}
          {savedPalettes.length > 0 && (
            <section>
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-6">保存済みパレット</h3>
              
              <div className="space-y-4">
                {savedPalettes.map((palette, index) => (
                  <div key={index} className="border border-foreground/20 bg-gray/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="noto-sans-jp text-sm text-foreground/70">
                        パレット #{index + 1} ({palette.length}色)
                      </span>
                      <button
                        onClick={() => deletePalette(index)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {palette.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => copyToClipboard(color.hex, color.id)}
                          className="w-12 h-12 border border-foreground/20 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}