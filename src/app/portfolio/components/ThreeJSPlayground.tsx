import React, { useRef, useEffect } from 'react';

const ThreeJSPlayground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple 2D placeholder animation until Three.js is properly implemented
    let animationId: number | null = null;
    let rotation = 0;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      try {
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);

        // Set background
        ctx.fillStyle = '#374151';
        ctx.fillRect(0, 0, width, height);

        // Draw rotating cube wireframe
        ctx.strokeStyle = '#0000ff';
        ctx.lineWidth = 2;
        ctx.translate(width / 2, height / 2);
        ctx.rotate(rotation);

        // Draw cube
        const size = 80;
        ctx.strokeRect(-size / 2, -size / 2, size, size);

        // Draw diagonals
        ctx.beginPath();
        ctx.moveTo(-size / 2, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.moveTo(size / 2, -size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.stroke();

        ctx.resetTransform();
        rotation += 0.01;

        if (isMounted) {
          animationId = requestAnimationFrame(animate);
        }
      } catch (error) {
        // Ignore errors in test environment
        console.warn('Animation error:', error);
      }
    };

    animate();

    return () => {
      isMounted = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Three.js Playground
      </h2>
      <div className="rounded-none bg-gray-700 p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="h-auto w-full max-w-full rounded-none bg-gray-600"
        />
      </div>
      <div className="mt-4 rounded-none bg-gray-700 p-4">
        <p className="mb-2 text-sm text-gray-300">
          Interactive 3D graphics and animations powered by Three.js
        </p>
        <div className="flex gap-2">
          <button className="rounded-none bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600">
            Reset Scene
          </button>
          <button className="rounded-none bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
            Toggle Animation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreeJSPlayground;
