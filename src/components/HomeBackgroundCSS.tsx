/**
 * Lazy-loaded starfield background
 * CSS-only gradient for instant FCP, then canvas stars loaded in next frame
 */
"use client";

import { useEffect, useRef, useState } from "react";

export default function HomeBackgroundCSS() {
	const [mounted, setMounted] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number | undefined>(undefined);
	const starsRef = useRef<Float32Array | null>(null);

	// First, set mounted for CSS animations
	useEffect(() => {
		setMounted(true);

		// Load canvas in next frame (after initial paint)
		const rafId = requestAnimationFrame(() => {
			initCanvas();
		});

		return () => {
			cancelAnimationFrame(rafId);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, []);

	const initCanvas = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		// Set canvas size and regenerate stars on resize
		const generateStars = () => {
			const stars = new Float32Array(300 * 3); // x, y, size
			for (let i = 0; i < 300; i++) {
				const base = i * 3;
				stars[base] = Math.random() * canvas.width;
				stars[base + 1] = Math.random() * canvas.height;
				stars[base + 2] = Math.random() * 1.5 + 0.5;
			}
			return stars;
		};

		// Initialize stars
		starsRef.current = generateStars();

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			// Regenerate stars for new canvas size
			starsRef.current = generateStars();
		};
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		// Shooting stars
		interface ShootingStar {
			x: number;
			y: number;
			vx: number;
			vy: number;
			length: number;
			alpha: number;
		}
		const shootingStars: ShootingStar[] = [];

		const spawnShootingStar = () => {
			if (Math.random() < 0.005 && shootingStars.length < 3) {
				shootingStars.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height * 0.5,
					vx: 8 + Math.random() * 4,
					vy: 4 + Math.random() * 3,
					length: 50 + Math.random() * 80,
					alpha: 1,
				});
			}
		};

		let time = 0;

		// Animation loop
		const animate = () => {
			time += 0.01;

			// Clear canvas (transparent)
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw twinkle stars
			const stars = starsRef.current;
			if (stars) {
				for (let i = 0; i < 300; i++) {
					const base = i * 3;
					const x = stars[base];
					const y = stars[base + 1];
					const size = stars[base + 2];

					// Twinkle effect
					const twinkle = Math.sin(time * 2 + i * 0.1) * 0.3 + 0.7;
					const alpha = size * 0.3 * twinkle;

					ctx.beginPath();
					ctx.arc(x, y, size, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
					ctx.fill();
				}
			}

			// Spawn and update shooting stars
			spawnShootingStar();

			for (let i = shootingStars.length - 1; i >= 0; i--) {
				const star = shootingStars[i];
				star.x += star.vx;
				star.y += star.vy;
				star.alpha -= 0.01;

				if (
					star.alpha <= 0 ||
					star.x > canvas.width ||
					star.y > canvas.height
				) {
					shootingStars.splice(i, 1);
					continue;
				}

				// Draw shooting star with trail
				const gradient = ctx.createLinearGradient(
					star.x,
					star.y,
					star.x - star.vx * (star.length / 20),
					star.y - star.vy * (star.length / 20),
				);
				gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`);
				gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

				ctx.beginPath();
				ctx.moveTo(star.x, star.y);
				ctx.lineTo(
					star.x - star.vx * (star.length / 20),
					star.y - star.vy * (star.length / 20),
				);
				ctx.strokeStyle = gradient;
				ctx.lineWidth = 2;
				ctx.stroke();

				// Bright head
				ctx.beginPath();
				ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
				ctx.fill();
			}

			animationRef.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
		};
	};

	return (
		<div className="fixed inset-0 bg-[#020202]" style={{ zIndex: -1 }}>
			{/* Canvas stars - rendered immediately in next frame */}
			<canvas
				ref={canvasRef}
				className="absolute inset-0"
				style={{ opacity: mounted ? 1 : 0, transition: "opacity 1000ms" }}
				aria-hidden="true"
			/>

			{/* Subtle vignette */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.4) 100%)",
				}}
			/>
		</div>
	);
}
