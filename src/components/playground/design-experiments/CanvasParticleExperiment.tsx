/**
 * Canvas Particle System Experiment
 * HTML5 Canvas with particle physics and interactions
 */

"use client";

import { performanceMonitor } from "@/lib/playground/performance-monitor";
import { ExperimentProps } from "@/types/playground";
import { Pause, Play, RotateCcw, Settings } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: "circle" | "square" | "triangle";
}

interface ParticleConfig {
  count: number;
  speed: number;
  size: number;
  gravity: number;
  friction: number;
  colorMode: "rainbow" | "monochrome" | "gradient";
  shape: "mixed" | "circle" | "square" | "triangle";
  physics: "bounce" | "flow" | "attract" | "repel";
}

export const CanvasParticleExperiment: React.FC<ExperimentProps> = ({
  isActive,
  onPerformanceUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });

  const [isAnimating, setIsAnimating] = useState(false);
  const [config, setConfig] = useState<ParticleConfig>({
    count: 100,
    speed: 2,
    size: 3,
    gravity: 0.1,
    friction: 0.99,
    colorMode: "rainbow",
    shape: "mixed",
    physics: "bounce",
  });

  // Color palettes
  const colorPalettes = useMemo(
    () => ({
      rainbow: [
        "#ff0000",
        "#ff8000",
        "#ffff00",
        "#80ff00",
        "#00ff00",
        "#00ff80",
        "#00ffff",
        "#0080ff",
        "#0000ff",
        "#8000ff",
        "#ff00ff",
        "#ff0080",
      ],
      monochrome: [
        "#ffffff",
        "#e0e0e0",
        "#c0c0c0",
        "#a0a0a0",
        "#808080",
        "#606060",
      ],
      gradient: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"],
    }),
    [],
  );

  // Initialize particles
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particles: Particle[] = [];
    const colors = colorPalettes[config.colorMode];

    for (let i = 0; i < config.count; i++) {
      const particle: Particle = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        size: Math.random() * config.size + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        maxLife: Math.random() * 200 + 100,
        type:
          config.shape === "mixed"
            ? (["circle", "square", "triangle"] as const)[
                Math.floor(Math.random() * 3)
              ]
            : (config.shape as Particle["type"]),
      };
      particles.push(particle);
    }

    particlesRef.current = particles;
  }, [config, colorPalettes]);

  // Update particle physics
  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    particles.forEach((particle) => {
      // Apply physics based on mode
      switch (config.physics) {
        case "bounce":
          // Gravity and bounce
          particle.vy += config.gravity;
          particle.vx *= config.friction;
          particle.vy *= config.friction;

          if (
            particle.x <= particle.size ||
            particle.x >= canvas.width - particle.size
          ) {
            particle.vx *= -0.8;
            particle.x = Math.max(
              particle.size,
              Math.min(canvas.width - particle.size, particle.x),
            );
          }
          if (
            particle.y <= particle.size ||
            particle.y >= canvas.height - particle.size
          ) {
            particle.vy *= -0.8;
            particle.y = Math.max(
              particle.size,
              Math.min(canvas.height - particle.size, particle.y),
            );
          }
          break;

        case "flow":
          // Fluid-like movement
          particle.vx += (Math.random() - 0.5) * 0.1;
          particle.vy += (Math.random() - 0.5) * 0.1;
          particle.vx *= 0.98;
          particle.vy *= 0.98;

          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
          break;

        case "attract":
          // Attract to mouse
          const attractDx = mouse.x - particle.x;
          const attractDy = mouse.y - particle.y;
          const attractDistance = Math.sqrt(
            attractDx * attractDx + attractDy * attractDy,
          );

          if (attractDistance > 0) {
            const force = Math.min(100 / attractDistance, 0.5);
            particle.vx += (attractDx / attractDistance) * force;
            particle.vy += (attractDy / attractDistance) * force;
          }

          particle.vx *= 0.95;
          particle.vy *= 0.95;
          break;

        case "repel":
          // Repel from mouse
          const repelDx = particle.x - mouse.x;
          const repelDy = particle.y - mouse.y;
          const repelDistance = Math.sqrt(
            repelDx * repelDx + repelDy * repelDy,
          );

          if (repelDistance > 0 && repelDistance < 100) {
            const force = ((100 - repelDistance) / 100) * 0.5;
            particle.vx += (repelDx / repelDistance) * force;
            particle.vy += (repelDy / repelDistance) * force;
          }

          particle.vx *= 0.98;
          particle.vy *= 0.98;
          break;
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update life
      particle.life -= 1 / particle.maxLife;
      if (particle.life <= 0) {
        // Respawn particle
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
        particle.vx = (Math.random() - 0.5) * config.speed;
        particle.vy = (Math.random() - 0.5) * config.speed;
        particle.life = 1;
        particle.maxLife = Math.random() * 200 + 100;
      }
    });
  }, [config]);

  // Draw particles
  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with trail effect
    ctx.fillStyle = "rgba(34, 34, 34, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    particles.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 1;

      // Draw particle based on type
      switch (particle.type) {
        case "circle":
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "square":
          ctx.fillRect(
            particle.x - particle.size,
            particle.y - particle.size,
            particle.size * 2,
            particle.size * 2,
          );
          break;

        case "triangle":
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y - particle.size);
          ctx.lineTo(particle.x - particle.size, particle.y + particle.size);
          ctx.lineTo(particle.x + particle.size, particle.y + particle.size);
          ctx.closePath();
          ctx.fill();
          break;
      }

      ctx.restore();
    });

    // Draw connections between nearby particles
    if (config.physics === "attract" || config.physics === "repel") {
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.save();
            ctx.globalAlpha =
              (1 - distance / 80) * 0.3 * particle.life * otherParticle.life;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });
    }
  }, [config]);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();
    drawParticles();

    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimating, updateParticles, drawParticles]);

  // Start animation
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  // Stop animation
  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Reset particles
  const resetParticles = useCallback(() => {
    stopAnimation();
    initParticles();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#222222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [stopAnimation, initParticles]);

  // Handle mouse events
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x =
        (event.clientX - rect.left) * (canvas.width / rect.width);
      mouseRef.current.y =
        (event.clientY - rect.top) * (canvas.height / rect.height);
    },
    [],
  );

  const handleMouseDown = useCallback(() => {
    mouseRef.current.isDown = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false;
  }, []);

  // Initialize canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = Math.min(400, container.clientWidth * 0.6);
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Initialize particles
    initParticles();

    // Initial draw
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#222222";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [initParticles]);

  // Update particles when config changes
  useEffect(() => {
    initParticles();
  }, [config, initParticles]);

  // Animation loop effect
  useEffect(() => {
    if (isAnimating) {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animate]);

  // Performance monitoring
  useEffect(() => {
    if (!isActive) return;

    const handlePerformanceUpdate = (metrics: {
      fps: number;
      frameTime: number;
      memoryUsage: number;
    }) => {
      onPerformanceUpdate?.(metrics);
    };

    performanceMonitor.startMonitoring(handlePerformanceUpdate);

    return () => {
      performanceMonitor.stopMonitoring(handlePerformanceUpdate);
    };
  }, [isActive, onPerformanceUpdate]);

  return (
    <div className="space-y-6">
      {/* Canvas Display */}
      <div className="bg-base border border-foreground p-4 space-y-4">
        <div className="border border-foreground overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block w-full h-auto cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={isAnimating ? stopAnimation : startAnimation}
            className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          >
            {isAnimating ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            <span className="noto-sans-jp-light text-sm">
              {isAnimating ? "Pause" : "Start"}
            </span>
          </button>

          <button
            onClick={resetParticles}
            className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span className="noto-sans-jp-light text-sm">Reset</span>
          </button>
        </div>
      </div>

      {/* Particle Controls */}
      <div className="bg-base border border-foreground p-4 space-y-4">
        <h3 className="zen-kaku-gothic-new text-lg text-primary flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Particle System Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Particle Count */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Count: {config.count}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={config.count}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  count: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Speed: {config.speed.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={config.speed}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  speed: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          {/* Size */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Size: {config.size}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.size}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, size: Number(e.target.value) }))
              }
              className="w-full"
            />
          </div>

          {/* Gravity */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Gravity: {config.gravity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.gravity}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  gravity: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Physics Mode */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Physics
            </label>
            <select
              value={config.physics}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  physics: e.target.value as ParticleConfig["physics"],
                }))
              }
              className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
            >
              <option value="bounce">Bounce</option>
              <option value="flow">Flow</option>
              <option value="attract">Attract</option>
              <option value="repel">Repel</option>
            </select>
          </div>

          {/* Color Mode */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Colors
            </label>
            <select
              value={config.colorMode}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  colorMode: e.target.value as ParticleConfig["colorMode"],
                }))
              }
              className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
            >
              <option value="rainbow">Rainbow</option>
              <option value="monochrome">Monochrome</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>

          {/* Shape */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Shape
            </label>
            <select
              value={config.shape}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  shape: e.target.value as ParticleConfig["shape"],
                }))
              }
              className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
            >
              <option value="mixed">Mixed</option>
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          {/* Friction */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Friction: {config.friction.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.9"
              max="1"
              step="0.01"
              value={config.friction}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  friction: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-base border border-foreground p-4 space-y-4">
        <h3 className="zen-kaku-gothic-new text-lg text-primary">
          Interaction Guide
        </h3>

        <div className="noto-sans-jp-light text-sm text-foreground space-y-2">
          <p>• マウスを動かしてパーティクルとインタラクション</p>
          <p>• Attract/Repel モードでマウスの影響を体験</p>
          <p>• 異なる物理モードで様々な動作を確認</p>
          <p>• パーティクル数や速度を調整してパフォーマンスを最適化</p>
        </div>
      </div>
    </div>
  );
};
