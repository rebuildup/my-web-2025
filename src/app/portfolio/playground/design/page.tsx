"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Download, Play, Pause } from "lucide-react";

// カラーパレット生成関数
const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 50) + 50; // 50-100%
  const lightness = Math.floor(Math.random() * 40) + 30; // 30-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// タイポグラフィアニメーション用のテキスト
const animatedTexts = [
  "Creative Design",
  "Interactive Experience",
  "Visual Expression",
  "Digital Art",
  "Motion Graphics",
];

export default function DesignPlaygroundPage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  // カラーパレット実験
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // 初期カラーパレット生成
  useEffect(() => {
    generateNewPalette();
  }, []);

  // タイポグラフィアニメーション
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const generateNewPalette = () => {
    const newPalette = Array.from({ length: 5 }, () => generateRandomColor());
    setColorPalette(newPalette);
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const downloadPalette = () => {
    const paletteData = {
      colors: colorPalette,
      timestamp: new Date().toISOString(),
      format: "HSL",
    };

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-palette.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex items-center py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* Header */}
            <header className="space-y-12">
              <nav className="mb-6">
                <Link
                  href="/portfolio"
                  className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  ← Portfolio に戻る
                </Link>
              </nav>
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                Design Playground
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                デザイン実験とインタラクティブデモの実験場です.
                <br />
                色彩、タイポグラフィ、レイアウト、アニメーションなどを自由に試行錯誤しています.
              </p>
            </header>

            {/* Typography Animation Experiment */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Typography Animation
              </h2>
              <div className="bg-base border border-foreground p-4 space-y-4">
                <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative overflow-hidden">
                  <div
                    className={`neue-haas-grotesk-display text-4xl text-primary transition-all duration-1000 ${
                      isAnimating ? "transform scale-110 rotate-2" : ""
                    }`}
                    style={{
                      background: isAnimating
                        ? `linear-gradient(45deg, ${colorPalette[0] || "#0000ff"}, ${colorPalette[1] || "#ff0000"})`
                        : "transparent",
                      WebkitBackgroundClip: isAnimating ? "text" : "initial",
                      WebkitTextFillColor: isAnimating
                        ? "transparent"
                        : "inherit",
                      backgroundClip: isAnimating ? "text" : "initial",
                    }}
                  >
                    {animatedTexts[currentTextIndex]}
                  </div>

                  {isAnimating && (
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 rounded-full animate-pulse"
                          style={{
                            backgroundColor:
                              colorPalette[i % colorPalette.length] ||
                              "#0000ff",
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={toggleAnimation}
                    className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    {isAnimating ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    <span className="noto-sans-jp-light text-sm">
                      {isAnimating ? "Stop Animation" : "Start Animation"}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Color Palette Generator */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Color Palette Generator
              </h2>
              <div className="bg-base border border-foreground p-4 space-y-4">
                <div className="grid-system grid-1 xs:grid-5 sm:grid-5 gap-4">
                  {colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="aspect-square border border-foreground flex flex-col items-center justify-center p-2 cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => navigator.clipboard.writeText(color)}
                      title={`Click to copy: ${color}`}
                    >
                      <div className="bg-background bg-opacity-90 px-2 py-1 text-center">
                        <span className="noto-sans-jp-light text-xs text-foreground">
                          {color}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={generateNewPalette}
                    className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <span className="noto-sans-jp-light text-sm">
                      Generate New
                    </span>
                  </button>

                  <button
                    onClick={downloadPalette}
                    className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="noto-sans-jp-light text-sm">
                      Download JSON
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Layout Experiments */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Layout Experiments
              </h2>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-6">
                {/* Grid Layout */}
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary">
                    Grid System
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square border border-foreground flex items-center justify-center hover:bg-accent hover:text-background transition-colors cursor-pointer"
                        style={{
                          backgroundColor:
                            i % 2 === 0 ? colorPalette[0] : "transparent",
                          opacity: 0.7,
                        }}
                      >
                        <span className="noto-sans-jp-light text-xs">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flexbox Layout */}
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary">
                    Flexbox Layout
                  </h3>
                  <div className="flex flex-col gap-2 h-32">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border border-foreground flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                        style={{
                          backgroundColor: colorPalette[i + 1] || "#f0f0f0",
                          opacity: 0.8,
                        }}
                      >
                        <span className="noto-sans-jp-light text-xs text-background">
                          Flex {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Masonry-like Layout */}
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary">
                    Masonry Style
                  </h3>
                  <div className="space-y-2">
                    {[60, 40, 80, 50].map((height, i) => (
                      <div
                        key={i}
                        className="border border-foreground flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                        style={{
                          height: `${height}px`,
                          backgroundColor: colorPalette[i] || "#f0f0f0",
                          opacity: 0.9,
                        }}
                      >
                        <span className="noto-sans-jp-light text-xs text-background">
                          {height}px
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Elements */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Interactive Elements
              </h2>
              <div className="bg-base border border-foreground p-4 space-y-6">
                <div className="grid-system grid-1 xs:grid-2 sm:grid-4 md:grid-4 gap-4">
                  {colorPalette.map((color, index) => (
                    <button
                      key={index}
                      className="group relative overflow-hidden border border-foreground p-4 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                      style={{
                        background: `linear-gradient(135deg, ${color}, ${colorPalette[(index + 1) % colorPalette.length] || color})`,
                      }}
                    >
                      <div className="relative z-10">
                        <Sparkles className="w-6 h-6 text-background mx-auto mb-2" />
                        <span className="noto-sans-jp-light text-sm text-background">
                          Element {index + 1}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    インタラクティブ要素にホバーしてエフェクトを確認してください
                  </p>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <nav aria-label="Design playground navigation">
              <h3 className="sr-only">Design Playground機能</h3>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <Link
                  href="/portfolio/playground/WebGL"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>WebGL Playground</span>
                </Link>

                <Link
                  href="/portfolio"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Portfolio Home</span>
                </Link>

                <Link
                  href="/tools"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Tools</span>
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - Design Playground
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
