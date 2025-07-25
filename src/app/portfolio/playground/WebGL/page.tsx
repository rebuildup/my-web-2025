"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Play, Pause, RotateCcw, Settings, Zap } from "lucide-react";

// シンプルなWebGLシミュレーション（実際のThree.jsの代替）
const useWebGLSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  const [particleCount, setParticleCount] = useState(50);
  const [speed, setSpeed] = useState(1);

  const particles = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
    }>
  >([]);

  const initParticles = useCallback(() => {
    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 400,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 4 + 1,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      life: 1,
    }));
  }, [particleCount, speed]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "rgba(34, 34, 34, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
      if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;

      // Update life
      particle.life -= 0.005;
      if (particle.life <= 0) {
        // Respawn particle
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
        particle.vx = (Math.random() - 0.5) * speed;
        particle.vy = (Math.random() - 0.5) * speed;
        particle.life = 1;
        particle.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
      }

      // Draw particle
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw connections
      particles.current.forEach((other, otherIndex) => {
        if (index !== otherIndex) {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha =
              (1 - distance / 100) * 0.3 * particle.life * other.life;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      });
    });

    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, speed]);

  const start = () => {
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const reset = () => {
    stop();
    initParticles();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#222222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    initParticles();
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#222222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [particleCount, initParticles]);

  useEffect(() => {
    if (isRunning) {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, speed, animate]);

  return {
    canvasRef,
    isRunning,
    start,
    stop,
    reset,
    particleCount,
    setParticleCount,
    speed,
    setSpeed,
  };
};

export default function WebGLPlaygroundPage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";
  const {
    canvasRef,
    isRunning,
    start,
    stop,
    reset,
    particleCount,
    setParticleCount,
    speed,
    setSpeed,
  } = useWebGLSimulation();

  const [selectedDemo, setSelectedDemo] = useState("particles");

  const demos = [
    {
      id: "particles",
      title: "Particle System",
      description: "インタラクティブなパーティクルシステム",
      tech: "Canvas 2D API",
    },
    {
      id: "geometry",
      title: "3D Geometry",
      description: "3Dジオメトリとシェーダー（準備中）",
      tech: "WebGL / Three.js",
    },
    {
      id: "shaders",
      title: "Custom Shaders",
      description: "カスタムシェーダー実験（準備中）",
      tech: "GLSL",
    },
    {
      id: "physics",
      title: "Physics Simulation",
      description: "物理シミュレーション（準備中）",
      tech: "WebGL + Physics",
    },
  ];

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
                WebGL Playground
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                WebGL・Three.js・WebGPU実験場です.
                <br />
                3D表現、シェーダー、パーティクルシステム、インタラクティブ体験を実験しています.
              </p>
            </header>

            {/* Demo Selection */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Experiments
              </h2>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
                {demos.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => setSelectedDemo(demo.id)}
                    className={`bg-base border p-4 space-y-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background ${
                      selectedDemo === demo.id
                        ? "border-accent text-accent"
                        : "border-foreground hover:border-accent hover:text-accent"
                    }`}
                  >
                    <div className="flex items-center">
                      <Box className="w-6 h-6 mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg">
                        {demo.title}
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm">
                      {demo.description}
                    </p>
                    <span className="noto-sans-jp-light text-xs border px-2 py-1 inline-block">
                      {demo.tech}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Main Demo Area */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Interactive Demo
              </h2>
              <div className="bg-base border border-foreground p-4 space-y-4">
                {selectedDemo === "particles" ? (
                  <>
                    {/* Canvas */}
                    <div className="border border-foreground overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="block w-full h-auto max-w-full"
                        style={{ aspectRatio: "2/1" }}
                      />
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          onClick={isRunning ? stop : start}
                          className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          {isRunning ? (
                            <Pause className="w-4 h-4 mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          <span className="noto-sans-jp-light text-sm">
                            {isRunning ? "Pause" : "Start"}
                          </span>
                        </button>

                        <button
                          onClick={reset}
                          className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          <span className="noto-sans-jp-light text-sm">
                            Reset
                          </span>
                        </button>
                      </div>

                      <div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-4">
                        <div className="space-y-2">
                          <label className="noto-sans-jp-light text-sm text-foreground">
                            Particle Count: {particleCount}
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="200"
                            value={particleCount}
                            onChange={(e) =>
                              setParticleCount(Number(e.target.value))
                            }
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="noto-sans-jp-light text-sm text-foreground">
                            Speed: {speed.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Settings className="w-16 h-16 text-accent mx-auto" />
                      <h3 className="zen-kaku-gothic-new text-xl text-primary">
                        {demos.find((d) => d.id === selectedDemo)?.title}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        この実験は準備中です
                      </p>
                      <p className="noto-sans-jp-light text-xs text-accent">
                        Coming Soon...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Technical Notes */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Technical Notes
              </h2>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="flex items-center">
                    <Zap className="w-6 h-6 text-accent mr-3" />
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Performance Optimization
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • requestAnimationFrame による滑らかなアニメーション
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • メモリ効率的なパーティクル管理
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • 適切なリソース解放とクリーンアップ
                    </p>
                  </div>
                </div>

                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="flex items-center">
                    <Box className="w-6 h-6 text-accent mr-3" />
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Future Implementations
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • Three.js による本格的な3D表現
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • カスタムシェーダーとGLSL実装
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • WebGPU による次世代グラフィックス
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <nav aria-label="WebGL playground navigation">
              <h3 className="sr-only">WebGL Playground機能</h3>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <Link
                  href="/portfolio/playground/design"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Design Playground</span>
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
                  © 2025 samuido - WebGL Playground
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
