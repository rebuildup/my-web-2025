/**
 * CSS-only gradient background for instant FCP
 * This is a lightweight alternative to Three.js version that uses CSS animations
 */
"use client";

import { useEffect, useState } from "react";

export default function HomeBackgroundCSS() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div
			className="fixed inset-0 bg-[#020202]"
			style={{
				zIndex: 0,
				background: `
					radial-gradient(
						ellipse 80% 50% at 50% 50%,
						rgba(91, 33, 182, 0.15) 0%,
						rgba(45, 212, 191, 0.05) 50%,
						transparent 70%
					),
					#020201
				`,
			}}
		>
			{/* Animated grain overlay */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					animation: mounted ? "grain 8s steps(10) infinite" : "none",
				}}
			/>
			{/* Slow color shift animation */}
			<div
				className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
				style={{
					background: `radial-gradient(
						ellipse 60% 40% at 30% 40%,
						rgba(245, 158, 11, ${mounted ? "0.08" : "0.04"}) 0%,
						transparent 50%
					)`,
					opacity: mounted ? 1 : 0.5,
					animation: mounted
						? "pulse 10s ease-in-out infinite alternate"
						: "none",
				}}
			/>
			<style>{`
				@keyframes grain {
					0%, 100% { transform: translate(0, 0); }
					10% { transform: translate(-5%, -10%); }
					20% { transform: translate(-15%, 5%); }
					30% { transform: translate(7%, -25%); }
					40% { transform: translate(-5%, 25%); }
					50% { transform: translate(-15%, 10%); }
					60% { transform: translate(15%, 0%); }
					70% { transform: translate(0%, 15%); }
					80% { transform: translate(3%, 35%); }
					90% { transform: translate(-10%, 10%); }
				}
				@keyframes pulse {
					0% { opacity: 0.5; }
					100% { opacity: 1; }
				}
			`}</style>
		</div>
	);
}
