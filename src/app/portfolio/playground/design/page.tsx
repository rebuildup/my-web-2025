"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Palette, Mouse, Zap, Eye, Code } from "lucide-react";

export default function DesignPlaygroundPage() {
  const [selectedExperiment, setSelectedExperiment] = useState("css-morphing");
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    technology: "all",
    year: "all",
  });

  interface DesignExperiment {
    id: string;
    title: string;
    description: string;
    category: "animation" | "interaction" | "experiment";
    technology: "css" | "javascript" | "webgl" | "canvas";
    year: number;
    tags: string[];
    interactive: boolean;
    experimentType: "visual" | "functional" | "artistic" | "technical";
    complexity: "beginner" | "intermediate" | "advanced";
  }

  const experiments: DesignExperiment[] = [
    {
      id: "css-morphing",
      title: "CSS モーフィング",
      description: "CSS の transform と transition を組み合わせた滑らかなモーフィングアニメーション。",
      category: "animation",
      technology: "css",
      year: 2024,
      tags: ["morphing", "css", "animation", "smooth"],
      interactive: true,
      experimentType: "visual",
      complexity: "intermediate",
    },
    {
      id: "interactive-particles",
      title: "インタラクティブ・パーティクル",
      description: "マウスの動きに反応するパーティクルシステム。Canvas と JavaScript を使用。",
      category: "interaction",
      technology: "canvas",
      year: 2024,
      tags: ["particles", "mouse", "interaction", "canvas"],
      interactive: true,
      experimentType: "technical",
      complexity: "advanced",
    },
    {
      id: "fluid-layout",
      title: "フルイド・レイアウト",
      description: "画面サイズに応じて動的に変化する流体的なレイアウトシステム。",
      category: "experiment",
      technology: "css",
      year: 2024,
      tags: ["layout", "responsive", "fluid", "grid"],
      interactive: true,
      experimentType: "functional",
      complexity: "intermediate",
    },
    {
      id: "generative-art",
      title: "ジェネラティブ・アート",
      description: "アルゴリズムによって生成される抽象的なアート作品。リアルタイム生成。",
      category: "experiment",
      technology: "canvas",
      year: 2023,
      tags: ["generative", "art", "algorithm", "abstract"],
      interactive: true,
      experimentType: "artistic",
      complexity: "advanced",
    },
    {
      id: "kinetic-typography",
      title: "キネティック・タイポグラフィ",
      description: "文字が動的に変化するタイポグラフィ実験。リズミカルなアニメーション。",
      category: "animation",
      technology: "css",
      year: 2023,
      tags: ["typography", "kinetic", "text", "rhythm"],
      interactive: true,
      experimentType: "visual",
      complexity: "intermediate",
    },
    {
      id: "gesture-ui",
      title: "ジェスチャー UI",
      description: "タッチジェスチャーで操作する新しいユーザーインターフェース実験。",
      category: "interaction",
      technology: "javascript",
      year: 2023,
      tags: ["gesture", "touch", "ui", "interface"],
      interactive: true,
      experimentType: "functional",
      complexity: "advanced",
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
    { id: "animation", label: "アニメーション" },
    { id: "interaction", label: "インタラクション" },
    { id: "experiment", label: "実験" },
  ];

  const technologies = [
    { id: "all", label: "すべて" },
    { id: "css", label: "CSS" },
    { id: "javascript", label: "JavaScript" },
    { id: "webgl", label: "WebGL" },
    { id: "canvas", label: "Canvas" },
  ];

  const years = [
    { id: "all", label: "すべて" },
    { id: "2024", label: "2024" },
    { id: "2023", label: "2023" },
  ];

  // Animation states
  const [morphing, setMorphing] = useState(false);
  const [particleMousePos, setParticleMousePos] = useState({ x: 0, y: 0 });
  const [gridIntensity, setGridIntensity] = useState(1);

  useEffect(() => {
    let animationId: number;
    
    if (isPlaying) {
      const animate = () => {
        // Morphing animation
        if (selectedExperiment === "css-morphing") {
          setMorphing(prev => !prev);
        }
        
        // Grid animation
        if (selectedExperiment === "fluid-layout") {
          setGridIntensity(Math.sin(Date.now() * 0.001) * 0.5 + 0.5);
        }
        
        animationId = requestAnimationFrame(animate);
      };
      
      // Start animation loop for certain experiments
      if (["css-morphing", "fluid-layout"].includes(selectedExperiment)) {
        animationId = requestAnimationFrame(animate);
      }
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, selectedExperiment]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setParticleMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const selectedExp = experiments.find(exp => exp.id === selectedExperiment);

  const renderExperiment = () => {
    switch (selectedExperiment) {
      case "css-morphing":
        return (
          <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <div
              className={`w-32 h-32 bg-primary transition-all duration-1000 ease-in-out ${
                morphing 
                  ? 'rounded-full scale-150 rotate-180' 
                  : 'rounded-none scale-100 rotate-0'
              }`}
            />
          </div>
        );
      
      case "interactive-particles":
        return (
          <div 
            className="relative h-96 bg-black overflow-hidden cursor-crosshair"
            onMouseMove={handleMouseMove}
          >
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full opacity-60"
                style={{
                  left: `${particleMousePos.x * 100 + Math.sin(i + Date.now() * 0.001) * 10}%`,
                  top: `${particleMousePos.y * 100 + Math.cos(i + Date.now() * 0.001) * 10}%`,
                  transform: `translate(-50%, -50%) scale(${1 + Math.sin(i + Date.now() * 0.002)})`,
                  transition: 'all 0.1s ease-out',
                }}
              />
            ))}
            <div className="absolute bottom-4 left-4 text-white/50 text-sm">
              マウスを動かしてください
            </div>
          </div>
        );
      
      case "fluid-layout":
        return (
          <div className="h-96 p-4 bg-gradient-to-br from-gray/50 to-gray">
            <div 
              className="grid h-full gap-2 transition-all duration-500"
              style={{
                gridTemplateColumns: `repeat(${Math.floor(gridIntensity * 4 + 2)}, 1fr)`,
                gridTemplateRows: `repeat(${Math.floor(gridIntensity * 3 + 2)}, 1fr)`,
              }}
            >
              {[...Array(Math.floor((gridIntensity * 4 + 2) * (gridIntensity * 3 + 2)))].map((_, i) => (
                <div
                  key={i}
                  className="bg-primary/20 border border-primary/30 transition-all duration-300"
                  style={{
                    opacity: Math.sin(i + Date.now() * 0.001) * 0.3 + 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        );
      
      case "generative-art":
        return (
          <div className="relative h-96 bg-black overflow-hidden">
            <canvas
              width="800"
              height="400"
              className="w-full h-full"
              ref={(canvas) => {
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const animate = () => {
                  if (!isPlaying) return;
                  
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                  ctx.fillRect(0, 0, 800, 400);
                  
                  const time = Date.now() * 0.001;
                  for (let i = 0; i < 5; i++) {
                    const x = 400 + Math.sin(time + i) * 200;
                    const y = 200 + Math.cos(time + i * 0.5) * 100;
                    
                    ctx.fillStyle = `hsl(${(time * 50 + i * 60) % 360}, 70%, 60%)`;
                    ctx.beginPath();
                    ctx.arc(x, y, Math.sin(time + i) * 20 + 30, 0, Math.PI * 2);
                    ctx.fill();
                  }
                  
                  requestAnimationFrame(animate);
                };
                
                animate();
              }}
            />
          </div>
        );
      
      case "kinetic-typography":
        return (
          <div className="flex items-center justify-center h-96 bg-gradient-to-br from-primary/10 to-purple-500/10">
            <div className="text-center">
              {['D', 'E', 'S', 'I', 'G', 'N'].map((letter, i) => (
                <span
                  key={i}
                  className="inline-block neue-haas-grotesk-display text-6xl text-primary mx-1 transition-all duration-300"
                  style={{
                    transform: `translateY(${Math.sin(Date.now() * 0.003 + i) * 20}px) rotate(${Math.sin(Date.now() * 0.002 + i) * 10}deg)`,
                    opacity: Math.sin(Date.now() * 0.004 + i) * 0.3 + 0.7,
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        );
      
      case "gesture-ui":
        return (
          <div className="relative h-96 bg-gradient-to-br from-gray/30 to-gray/10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 border-4 border-primary/30 rounded-full mb-4 mx-auto flex items-center justify-center">
                <Mouse size={48} className="text-primary" />
              </div>
              <p className="noto-sans-jp text-foreground/70">
                クリック、ドラッグ、タッチジェスチャーで操作
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-96 bg-gradient-to-br from-primary/10 to-purple-500/10">
            <div className="text-center">
              <Palette size={64} className="text-primary mx-auto mb-4" />
              <p className="noto-sans-jp text-foreground/70">
                実験を選択してください
              </p>
            </div>
          </div>
        );
    }
  };

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
              href="/portfolio/playground/WebGL" 
              className="noto-sans-jp text-sm text-foreground/70 hover:text-primary transition-colors"
            >
              WebGL Playground
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
          Design Playground
        </h1>
        <p className="noto-sans-jp text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto mb-6">
          デザインの実験や試作品を自由に展示し、<br />
          デザインの可能性を探るプレイグラウンド
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
            {/* Design Canvas */}
            <div className="relative border border-foreground/20 bg-gray/30">
              {renderExperiment()}
              
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
                    <Palette size={16} className="text-primary" />
                    <span className="noto-sans-jp text-sm text-white">
                      {selectedExp?.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-white/70">
                    <span>{selectedExp?.technology}</span>
                    <span>{selectedExp?.experimentType}</span>
                    <span className={`px-2 py-1 rounded ${
                      selectedExp?.complexity === 'advanced' ? 'bg-red-500/20 text-red-400' :
                      selectedExp?.complexity === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {selectedExp?.complexity}
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
                      アニメーション速度
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                      インタラクティブ強度
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                      色相シフト
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      defaultValue="0"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="noto-sans-jp text-sm text-foreground/70 mb-2 block">
                      サイズスケール
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
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
                      {selectedExp.experimentType}
                    </div>
                    <div className="noto-sans-jp text-xs text-foreground/60">
                      実験タイプ
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
                        {selectedExp.experimentType}
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

            {/* Technical Info */}
            <div className="p-6 border border-foreground/20 bg-gray/50">
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center space-x-2">
                <Zap size={20} />
                <span>技術情報</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-foreground/20">
                  <div className="text-green-400 text-2xl font-bold mb-1">CSS3</div>
                  <div className="noto-sans-jp text-xs text-foreground/60">主要技術</div>
                </div>
                
                <div className="text-center p-4 border border-foreground/20">
                  <div className="text-yellow-400 text-2xl font-bold mb-1">ES6+</div>
                  <div className="noto-sans-jp text-xs text-foreground/60">JavaScript</div>
                </div>
                
                <div className="text-center p-4 border border-foreground/20">
                  <div className="text-blue-400 text-2xl font-bold mb-1">HTML5</div>
                  <div className="noto-sans-jp text-xs text-foreground/60">マークアップ</div>
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
          <Link href="/portfolio/playground/WebGL" className="text-foreground/60 hover:text-primary text-sm">
            WebGL Playground
          </Link>
          <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}