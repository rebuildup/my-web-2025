import type React from "react";
import { useEffect, useRef } from "react";

interface WebGLPlaygroundProps {
	width?: number;
	height?: number;
	className?: string;
}

const WebGLPlayground: React.FC<WebGLPlaygroundProps> = ({
	width = 800,
	height = 600,
	className = "",
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl");
		if (!gl) {
			console.warn("WebGL not supported");
			return;
		}

		// Basic WebGL setup
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		return () => {
			// Cleanup
		};
	}, []);

	return (
		<div className={`webgl-playground ${className}`}>
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				style={{ border: "1px solid #ccc" }}
			/>
		</div>
	);
};

export default WebGLPlayground;
