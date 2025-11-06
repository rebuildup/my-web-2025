"use client";

import { useEffect, useRef } from "react";

export default function Plasma() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let width = 0;
		let height = 0;
		let t = 0;

		const resize = () => {
			const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
			width = canvas.clientWidth;
			height = canvas.clientHeight;
			canvas.width = Math.floor(width * dpr);
			canvas.height = Math.floor(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		window.addEventListener("resize", resize);

		const render = () => {
			t += 0.015;
			const imgData = ctx.createImageData(width, height);
			const data = imgData.data;
			let i = 0;
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const v1 = Math.sin(x * 0.018 + t * 1.3);
					const v2 = Math.sin(x * 0.012 + y * 0.02 + t * 0.9);
					const v3 = Math.sin(
						Math.hypot(x - width * 0.5, y - height * 0.5) * 0.02 - t * 1.1,
					);
					const v = (v1 + v2 + v3) / 3;
					// Color palette (dark plasma)
					const r = Math.floor(30 + 140 * (0.5 + 0.5 * v));
					const g = Math.floor(20 + 110 * (0.5 + 0.5 * Math.sin(v + 2)));
					const b = Math.floor(60 + 180 * (0.5 + 0.5 * Math.sin(v + 4)));
					data[i++] = r;
					data[i++] = g;
					data[i++] = b;
					data[i++] = 255;
				}
			}
			ctx.putImageData(imgData, 0, 0);
			rafRef.current = requestAnimationFrame(render);
		};

		rafRef.current = requestAnimationFrame(render);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{ width: "100%", height: "100%", display: "block" }}
		/>
	);
}
