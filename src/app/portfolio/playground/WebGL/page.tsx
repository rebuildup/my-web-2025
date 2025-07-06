"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Monitor, Eye, Code, Zap } from "lucide-react";

export default function WebGLPlaygroundPage() {
  const [selectedExperiment, setSelectedExperiment] = useState("particle-system");
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    technology: "all",
    year: "all",
  });

  interface WebGLExperiment {
    id: string;
    title: string;
    description: string;
    category: "3d" | "shader" | "particle" | "effect";
    technology: "three.js" | "babylon.js" | "webgl" | "glsl";
    year: number;
    tags: string[];
    interactive: boolean;
    webglType: "vertex" | "fragment" | "compute" | "geometry";
    complexity: "beginner" | "intermediate" | "advanced";
    performance: "low" | "medium" | "high";
  }

  const experiments: WebGLExperiment[] = [
    {
      id: "particle-system",
      title: "パーティクルシステム",
      description: "GPU を活用した高速パーティクルシステム。数万個のパーティクルをリアルタイムで描画。",
      category: "particle",
      technology: "three.js",
      year: 2024,
      tags: ["particles", "gpu", "performance", "interactive"],
      interactive: true,
      webglType: "compute",
      complexity: "advanced",
      performance: "high",
    },
    {
      id: "noise-terrain",
      title: "ノイズ地形生成",
      description: "Perlin ノイズを使用したリアルタイム地形生成。動的なハイトマップとテクスチャリング。",
      category: "3d",
      technology: "three.js",
      year: 2024,
      tags: ["terrain", "noise", "procedural", "3d"],
      interactive: true,
      webglType: "vertex",
      complexity: "intermediate",
      performance: "medium",
    },
    {
      id: "raymarching-demo",
      title: "レイマーチング実験",
      description: "フラグメントシェーダーによるレイマーチング技法。複雑な3D形状をリアルタイム描画。",
      category: "shader",
      technology: "glsl",
      year: 2024,
      tags: ["raymarching", "sdf", "shader", "math"],
      interactive: true,
      webglType: "fragment",
      complexity: "advanced",
      performance: "high",
    },
    {
      id: "fluid-simulation",
      title: "流体シミュレーション",
      description: "GPU 流体力学シミュレーション。リアルタイムでの煙と炎のエフェクト。",
      category: "effect",
      technology: "webgl",
      year: 2023,
      tags: ["fluid", "physics", "simulation", "fire"],
      interactive: true,
      webglType: "compute",
      complexity: "advanced",
      performance: "high",
    },
    {
      id: "morphing-geometry",
      title: "モーフィング・ジオメトリ",
      description: "頂点シェーダーによる動的ジオメトリ変形。スムーズなモーフィングアニメーション。",
      category: "3d",
      technology: "three.js",
      year: 2023,
      tags: ["morphing", "animation", "geometry", "vertex"],
      interactive: true,
      webglType: "vertex",
      complexity: "intermediate",
      performance: "medium",
    },
    {
      id: "post-processing",
      title: "ポストプロセシング・チェーン",
      description: "複数のポストプロセシング効果を組み合わせたレンダリングパイプライン。",
      category: "effect",
      technology: "three.js",
      year: 2023,
      tags: ["postprocessing", "effects", "pipeline", "bloom"],
      interactive: true,
      webglType: "fragment",
      complexity: "intermediate",
      performance: "medium",
    },
  ];

  const filteredExperiments = experiments.filter(exp => {
    if (filters.category !== "all" && exp.category !== filters.category) return false;
    if (filters.technology !== "all" && exp.technology !== filters.technology) return false;
    if (filters.year !== "all" && exp.year.toString() !== filters.year) return false;
    return true;
  });

  const categories = [
    { id: "all", label: "すべて" },
    { id: "3d", label: "3Dグラフィックス" },
    { id: "shader", label: "シェーダー" },
    { id: "particle", label: "パーティクル" },
    { id: "effect", label: "エフェクト" },
  ];

  const technologies = [
    { id: "all", label: "すべて" },
    { id: "three.js", label: "Three.js" },
    { id: "babylon.js", label: "Babylon.js" },
    { id: "webgl", label: "WebGL" },
    { id: "glsl", label: "GLSL" },
  ];

  const years = [
    { id: "all", label: "すべて" },
    { id: "2024", label: "2024" },
    { id: "2023", label: "2023" },
  ];

  useEffect(() => {
    // Simple WebGL canvas setup for demo
    const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      if (!isPlaying) return;
      
      time += 0.016;
      
      // Simple animated background color
      const r = Math.sin(time) * 0.5 + 0.5;
      const g = Math.sin(time + 2) * 0.5 + 0.5;
      const b = Math.sin(time + 4) * 0.5 + 0.5;
      
      gl.clearColor(r * 0.1, g * 0.1, b * 0.3, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, selectedExperiment]);

  const selectedExp = experiments.find(exp => exp.id === selectedExperiment);

  return (
    <div className="min-h-screen bg-gray">
      {/* Navigation */}
      <nav className="border-b border-foreground/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/portfolio" 
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="neue-haas-grotesk-display text-xl">Portfolio</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/portfolio/playground/design" 
              className="noto-sans-jp text-sm text-foreground/70 hover:text-primary transition-colors"
            >
              Design Playground
            </Link>
            <Link 
              href="/portfolio/gallery/all" 
              className="noto-sans-jp text-sm text-foreground/70 hover:text-primary transition-colors"
            >
              全作品
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="text-center py-12 px-4">
        <h1 className="neue-haas-grotesk-display text-5xl md:text-7xl text-primary mb-4">
          WebGL Playground
        </h1>
        <p className="noto-sans-jp text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto mb-6">
          WebGLを使った3Dグラフィックスやシェーダーの実験を自由に展示し、<br />
          WebGLの可能性を探るプレイグラウンド
        </p>
        <div className="h-1 w-24 bg-primary mx-auto"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                フィルター
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                    カテゴリー
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm rounded"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                    技術
                  </label>
                  <select
                    value={filters.technology}
                    onChange={(e) => setFilters({...filters, technology: e.target.value})}
                    className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm rounded"
                  >
                    {technologies.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                    年
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                    className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm rounded"
                  >
                    {years.map(year => (
                      <option key={year.id} value={year.id}>{year.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Experiment List */}
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                実験一覧 ({filteredExperiments.length})
              </h3>
              
              <div className="space-y-2">
                {filteredExperiments.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExperiment(exp.id)}
                    className={`w-full p-3 text-left border transition-colors ${
                      selectedExperiment === exp.id
                        ? 'border-primary bg-primary/10'
                        : 'border-foreground/20 hover:border-foreground/40'
                    }`}
                  >
                    <h4 className="noto-sans-jp text-sm text-foreground mb-1">
                      {exp.title}
                    </h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                        {exp.category}
                      </span>
                      <span className="px-2 py-1 bg-foreground/10 text-foreground/70 text-xs rounded">
                        {exp.technology}
                      </span>
                    </div>
                    <p className="noto-sans-jp text-xs text-foreground/60 line-clamp-2">
                      {exp.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Viewer */}
          <div className="lg:col-span-3 space-y-6">
            {/* WebGL Canvas */}
            <div className="relative border border-foreground/20 bg-black/50">
              <canvas
                id="webgl-canvas"
                width="800"
                height="450"
                className="w-full h-auto max-h-96"
              />
              
              {/* Canvas Controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-black/50 border border-foreground/20 text-white hover:bg-black/70 transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setTimeout(() => setIsPlaying(true), 100);
                  }}
                  className="p-2 bg-black/50 border border-foreground/20 text-white hover:bg-black/70 transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="p-2 bg-black/50 border border-foreground/20 text-white hover:bg-black/70 transition-colors"
                >
                  <Settings size={16} />
                </button>
              </div>

              {/* Canvas Overlay */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-black/50 border border-foreground/20 p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Monitor size={16} className="text-primary" />
                    <span className="noto-sans-jp text-sm text-white">
                      {selectedExp?.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-white/70">
                    <span>{selectedExp?.technology}</span>
                    <span>{selectedExp?.webglType}</span>
                    <span className={`px-2 py-1 rounded ${
                      selectedExp?.performance === 'high' ? 'bg-red-500/20 text-red-400' :
                      selectedExp?.performance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {selectedExp?.performance} GPU
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            {showControls && (
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                  制御パネル
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                      速度
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                      複雑さ
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      defaultValue="5"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                      色相
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      defaultValue="180"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                      サイズ
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Experiment Details */}
            {selectedExp && (
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-2">
                      {selectedExp.title}
                    </h2>
                    <p className="noto-sans-jp text-foreground/80 leading-relaxed mb-4">
                      {selectedExp.description}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 border border-primary text-primary hover:bg-primary hover:text-foreground transition-colors">
                      <Code size={16} />
                    </button>
                    <button className="p-2 border border-primary text-primary hover:bg-primary hover:text-foreground transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 border border-foreground/20">
                    <div className="text-primary text-lg font-bold mb-1">
                      {selectedExp.year}
                    </div>
                    <div className="noto-sans-jp text-xs text-foreground/60">
                      制作年
                    </div>
                  </div>
                  
                  <div className="text-center p-3 border border-foreground/20">
                    <div className="text-primary text-lg font-bold mb-1 capitalize">
                      {selectedExp.complexity}
                    </div>
                    <div className="noto-sans-jp text-xs text-foreground/60">
                      複雑さ
                    </div>
                  </div>
                  
                  <div className="text-center p-3 border border-foreground/20">
                    <div className="text-primary text-lg font-bold mb-1">
                      {selectedExp.interactive ? 'Yes' : 'No'}
                    </div>
                    <div className="noto-sans-jp text-xs text-foreground/60">
                      インタラクティブ
                    </div>
                  </div>
                  
                  <div className="text-center p-3 border border-foreground/20">
                    <div className="text-primary text-lg font-bold mb-1 capitalize">
                      {selectedExp.webglType}
                    </div>
                    <div className="noto-sans-jp text-xs text-foreground/60">
                      シェーダータイプ
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="noto-sans-jp text-sm text-foreground/70 mb-2">技術スタック</h4>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded">
                        {selectedExp.technology}
                      </span>
                      <span className="px-3 py-1 bg-foreground/10 text-foreground/70 text-sm rounded">
                        {selectedExp.webglType} shader
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="noto-sans-jp text-sm text-foreground/70 mb-2">タグ</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExp.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-foreground/10 text-foreground/70 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Info */}
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center space-x-2">
                <Zap size={20} />
                <span>パフォーマンス情報</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-foreground/20">
                  <div className="text-green-400 text-2xl font-bold mb-1">60</div>
                  <div className="noto-sans-jp text-xs text-foreground/60">FPS</div>
                </div>
                
                <div className="text-center p-4 border border-foreground/20">
                  <div className="text-yellow-400 text-2xl font-bold mb-1">45%</div>
                  <div className="noto-sans-jp text-xs text-foreground/60">GPU 使用率</div>
                </div>
                
                <div className="text-center p-4 border border-foreground/20">
                  <div className="text-blue-400 text-2xl font-bold mb-1">12MB</div>
                  <div className="noto-sans-jp text-xs text-foreground/60">VRAM 使用量</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/20 py-8 text-center">
        <p className="noto-sans-jp text-foreground/60 text-sm mb-4">
          © 2025 samuido (木村友亮). All rights reserved.
        </p>
        <div className="flex justify-center space-x-6">
          <Link href="/portfolio" className="text-foreground/60 hover:text-primary text-sm">
            Portfolio
          </Link>
          <Link href="/portfolio/playground/design" className="text-foreground/60 hover:text-primary text-sm">
            Design Playground
          </Link>
          <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}