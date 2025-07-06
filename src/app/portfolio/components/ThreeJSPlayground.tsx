import React, { useRef, useEffect } from 'react';

const ThreeJSPlayground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple 2D placeholder animation until Three.js is properly implemented
    let animationId: number;
    let rotation = 0;

    const animate = () => {
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

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-none">
      <h2 className="text-blue-500 text-xl font-bold mb-4 neue-haas-grotesk-display">
        Three.js Playground
      </h2>
      <div className="bg-gray-700 p-4 rounded-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full max-w-full h-auto bg-gray-600 rounded-none"
        />
      </div>
      <div className="mt-4 p-4 bg-gray-700 rounded-none">
        <p className="text-gray-300 text-sm mb-2">
          Interactive 3D graphics and animations powered by Three.js
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-none text-sm transition-colors">
            Reset Scene
          </button>
          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-none text-sm transition-colors">
            Toggle Animation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreeJSPlayground;