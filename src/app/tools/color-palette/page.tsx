"use client";

import { Metadata } from "next";
import { ArrowLeft, Palette, Download, Copy, RefreshCw, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";

export const metadata: Metadata = {
  title: "カラーパレットジェネレーター - samuido Tools",
  description: "HSL、RGB、HEX値で美しい調和のとれたカラーパレットを生成。デザイン作業に最適な配色ツール。",
  keywords: ["カラーパレット", "色彩", "デザイン", "HSL", "RGB", "HEX", "ジェネレーター"],
  robots: "index, follow",
  openGraph: {
    title: "カラーパレットジェネレーター - samuido Tools",
    description: "HSL、RGB、HEX値で美しい調和のとれたカラーパレットを生成。デザイン作業に最適な配色ツール。",
    type: "website",
    url: "/tools/color-palette",
    images: [
      {
        url: "/tools/color-palette-og.jpg",
        width: 1200,
        height: 630,
        alt: "カラーパレットジェネレーター",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "カラーパレットジェネレーター - samuido Tools",
    description: "HSL、RGB、HEX値で美しい調和のとれたカラーパレットを生成。デザイン作業に最適な配色ツール。",
    images: ["/tools/color-palette-twitter.jpg"],
    creator: "@361do_sleep",
  },
};

// Color harmony algorithms
type ColorHarmony = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'splitComplementary';

interface Color {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
  hex: string;
  rgb: { r: number; g: number; b: number };
  locked: boolean;
}

const colorHarmonies = [
  { id: 'monochromatic', name: 'モノクロマティック', description: '同一色相の明度違い' },
  { id: 'analogous', name: '類似色', description: '近い色相の組み合わせ' },
  { id: 'complementary', name: '補色', description: '正反対の色相' },
  { id: 'triadic', name: 'トライアド', description: '120度間隔の3色' },
  { id: 'tetradic', name: 'テトラド', description: '90度間隔の4色' },
  { id: 'splitComplementary', name: 'スプリット補色', description: '補色の両隣り' },
];

// Helper functions
const hslToHex = (h: number, s: number, l: number): string => {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  if (saturation === 0) {
    r = g = b = lightness;
  } else {
    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    r = hue2rgb(p, q, hue + 1/3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1/3);
  }
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hslToRgb = (h: number, s: number, l: number) => {
  const hex = hslToHex(h, s, l);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const generateHarmonyColors = (baseHue: number, baseSat: number, baseLightness: number, harmony: ColorHarmony): Color[] => {
  const colors: Color[] = [];
  
  switch (harmony) {
    case 'monochromatic':
      [20, 40, 60, 80, 100].forEach((l, index) => {
        const lightness = Math.max(10, Math.min(90, l));
        const color: Color = {
          h: baseHue,
          s: baseSat,
          l: lightness,
          hex: hslToHex(baseHue, baseSat, lightness),
          rgb: hslToRgb(baseHue, baseSat, lightness),
          locked: false,
        };
        colors.push(color);
      });
      break;
      
    case 'analogous':
      [-30, -15, 0, 15, 30].forEach((offset) => {
        const hue = (baseHue + offset + 360) % 360;
        const color: Color = {
          h: hue,
          s: baseSat,
          l: baseLightness,
          hex: hslToHex(hue, baseSat, baseLightness),
          rgb: hslToRgb(hue, baseSat, baseLightness),
          locked: false,
        };
        colors.push(color);
      });
      break;
      
    case 'complementary':
      [0, 60, 120, 180, 240].forEach((offset) => {
        const hue = (baseHue + offset) % 360;
        const color: Color = {
          h: hue,
          s: baseSat,
          l: baseLightness,
          hex: hslToHex(hue, baseSat, baseLightness),
          rgb: hslToRgb(hue, baseSat, baseLightness),
          locked: false,
        };
        colors.push(color);
      });
      break;
      
    case 'triadic':
      [0, 120, 240].forEach((offset, index) => {
        const hue = (baseHue + offset) % 360;
        const variations = index === 0 ? [0] : [-30, 0, 30];
        variations.forEach((variation) => {
          if (colors.length < 5) {
            const finalHue = (hue + variation + 360) % 360;
            const color: Color = {
              h: finalHue,
              s: baseSat,
              l: baseLightness,
              hex: hslToHex(finalHue, baseSat, baseLightness),
              rgb: hslToRgb(finalHue, baseSat, baseLightness),
              locked: false,
            };
            colors.push(color);
          }
        });
      });
      break;
      
    default:
      // Fallback to analogous
      [-30, -15, 0, 15, 30].forEach((offset) => {
        const hue = (baseHue + offset + 360) % 360;
        const color: Color = {
          h: hue,
          s: baseSat,
          l: baseLightness,
          hex: hslToHex(hue, baseSat, baseLightness),
          rgb: hslToRgb(hue, baseSat, baseLightness),
          locked: false,
        };
        colors.push(color);
      });
  }
  
  return colors.slice(0, 5);
};

const ColorSwatch = ({ color, index, onLock, onCopy }: { 
  color: Color; 
  index: number; 
  onLock: () => void; 
  onCopy: () => void;
}) => {
  const [showValues, setShowValues] = useState(false);
  
  return (
    <div className="bg-[#333] rounded-sm overflow-hidden">
      {/* Color Display */}
      <div 
        className="h-32 cursor-pointer relative group"
        style={{ backgroundColor: color.hex }}
        onClick={onCopy}
      >
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <Copy className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Lock Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLock();
          }}
          className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded hover:bg-opacity-70 transition-all"
        >
          {color.locked ? (
            <Lock className="w-4 h-4 text-yellow-400" />
          ) : (
            <Unlock className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
      
      {/* Color Values */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium text-sm">色 {index + 1}</span>
          <button
            onClick={() => setShowValues(!showValues)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        
        {showValues && (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">HEX:</span>
              <span className="text-white font-mono">{color.hex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">RGB:</span>
              <span className="text-white font-mono">
                {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">HSL:</span>
              <span className="text-white font-mono">
                {Math.round(color.h)}, {Math.round(color.s)}%, {Math.round(color.l)}%
              </span>
            </div>
          </div>
        )}
        
        <button
          onClick={onCopy}
          className="w-full mt-2 bg-[#222] hover:bg-[#2a2a2a] text-white text-xs py-1 rounded transition-colors"
        >
          HEXをコピー
        </button>
      </div>
    </div>
  );
};

export default function ColorPalettePage() {
  const [colors, setColors] = useState<Color[]>([
    { h: 210, s: 100, l: 50, hex: '#0080ff', rgb: { r: 0, g: 128, b: 255 }, locked: false },
    { h: 180, s: 100, l: 50, hex: '#00ffff', rgb: { r: 0, g: 255, b: 255 }, locked: false },
    { h: 150, s: 100, l: 50, hex: '#00ff80', rgb: { r: 0, g: 255, b: 128 }, locked: false },
    { h: 120, s: 100, l: 50, hex: '#00ff00', rgb: { r: 0, g: 255, b: 0 }, locked: false },
    { h: 90, s: 100, l: 50, hex: '#80ff00', rgb: { r: 128, g: 255, b: 0 }, locked: false },
  ]);
  
  const [selectedHarmony, setSelectedHarmony] = useState<ColorHarmony>('analogous');
  const [baseColor, setBaseColor] = useState({ h: 210, s: 100, l: 50 });

  const generateNewPalette = useCallback(() => {
    const newColors = generateHarmonyColors(baseColor.h, baseColor.s, baseColor.l, selectedHarmony);
    
    // Preserve locked colors
    const updatedColors = newColors.map((newColor, index) => {
      if (colors[index] && colors[index].locked) {
        return colors[index];
      }
      return newColor;
    });
    
    setColors(updatedColors);
  }, [baseColor, selectedHarmony, colors]);

  const toggleLock = (index: number) => {
    setColors(prevColors => 
      prevColors.map((color, i) => 
        i === index ? { ...color, locked: !color.locked } : color
      )
    );
  };

  const copyColor = (color: Color) => {
    navigator.clipboard.writeText(color.hex);
    // You could add a toast notification here
    console.log(`Copied ${color.hex} to clipboard`);
  };

  const exportPalette = (format: 'css' | 'json' | 'ase') => {
    let content = '';
    
    switch (format) {
      case 'css':
        content = `:root {\n${colors.map((color, index) => 
          `  --color-${index + 1}: ${color.hex};`
        ).join('\n')}\n}`;
        break;
      case 'json':
        content = JSON.stringify({
          colors: colors.map((color, index) => ({
            name: `color-${index + 1}`,
            hex: color.hex,
            rgb: color.rgb,
            hsl: { h: color.h, s: color.s, l: color.l }
          }))
        }, null, 2);
        break;
      case 'ase':
        // ASE format would require a proper library
        content = 'ASE format export would be implemented with a proper library';
        break;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palette.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#222] text-white">
      {/* Header */}
      <header className="bg-[#333] border-b border-[#444]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-4">
            <Link href="/tools" className="text-[#0000ff] hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="neue-haas-grotesk-display text-xl text-white">カラーパレットジェネレーター</h1>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tool Description */}
        <section className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0000ff] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h2 className="neue-haas-grotesk-display text-2xl mb-3">調和のとれたカラーパレット生成</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            色彩理論に基づいた美しいカラーパレットを生成。HSL、RGB、HEX値で色情報を確認できます。
          </p>
        </section>

        {/* Controls */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Base Color */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">ベースカラー</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">色相 (H): {Math.round(baseColor.h)}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={baseColor.h}
                    onChange={(e) => setBaseColor(prev => ({ ...prev, h: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">彩度 (S): {Math.round(baseColor.s)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={baseColor.s}
                    onChange={(e) => setBaseColor(prev => ({ ...prev, s: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">明度 (L): {Math.round(baseColor.l)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={baseColor.l}
                    onChange={(e) => setBaseColor(prev => ({ ...prev, l: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div 
                  className="w-full h-16 rounded border border-[#444]"
                  style={{ backgroundColor: hslToHex(baseColor.h, baseColor.s, baseColor.l) }}
                />
              </div>
            </div>

            {/* Harmony Type */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">ハーモニータイプ</h3>
              <div className="space-y-2">
                {colorHarmonies.map((harmony) => (
                  <label key={harmony.id} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="harmony"
                      value={harmony.id}
                      checked={selectedHarmony === harmony.id}
                      onChange={(e) => setSelectedHarmony(e.target.value as ColorHarmony)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-white font-medium">{harmony.name}</div>
                      <div className="text-sm text-gray-400">{harmony.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#333] p-6 rounded-sm">
              <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">アクション</h3>
              <div className="space-y-3">
                <button
                  onClick={generateNewPalette}
                  className="w-full flex items-center justify-center gap-2 bg-[#0000ff] hover:bg-[#0066ff] px-4 py-3 rounded-sm text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  新しいパレットを生成
                </button>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => exportPalette('css')}
                    className="flex items-center justify-center gap-1 bg-[#222] hover:bg-[#2a2a2a] px-3 py-2 rounded-sm text-white text-sm transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    CSS
                  </button>
                  <button
                    onClick={() => exportPalette('json')}
                    className="flex items-center justify-center gap-1 bg-[#222] hover:bg-[#2a2a2a] px-3 py-2 rounded-sm text-white text-sm transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    JSON
                  </button>
                  <button
                    onClick={() => exportPalette('ase')}
                    className="flex items-center justify-center gap-1 bg-[#222] hover:bg-[#2a2a2a] px-3 py-2 rounded-sm text-white text-sm transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    ASE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-8">
          <h3 className="neue-haas-grotesk-display text-xl mb-6 text-center">生成されたパレット</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {colors.map((color, index) => (
              <ColorSwatch
                key={index}
                color={color}
                index={index}
                onLock={() => toggleLock(index)}
                onCopy={() => copyColor(color)}
              />
            ))}
          </div>
        </section>

        {/* Usage Tips */}
        <section className="bg-[#333] p-6 rounded-sm">
          <h3 className="neue-haas-grotesk-display text-lg mb-4 text-[#0000ff]">使い方のコツ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="text-white font-medium mb-2">ハーモニータイプの選び方</h4>
              <ul className="space-y-1">
                <li>• <strong>モノクロマティック</strong>: 統一感のあるデザインに</li>
                <li>• <strong>類似色</strong>: 自然で調和のとれた配色</li>
                <li>• <strong>補色</strong>: コントラストが強くインパクトのある配色</li>
                <li>• <strong>トライアド</strong>: バランスのとれた鮮やかな配色</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">活用テクニック</h4>
              <ul className="space-y-1">
                <li>• ロック機能で気に入った色を固定</li>
                <li>• ベースカラーを微調整して再生成</li>
                <li>• CSSエクスポートでコードに直接利用</li>
                <li>• 色情報表示で正確な値を確認</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}