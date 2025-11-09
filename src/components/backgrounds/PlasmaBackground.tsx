"use client";

// Reactbits: Plasma background inspired style
// Reference: https://www.reactbits.dev/backgrounds/plasma
// This is a lightweight CSS-only background (no canvas), responsive and GPU-friendly.

export default function PlasmaBackground() {
	return (
		<div
			aria-hidden
			className="absolute inset-0 -z-10 overflow-hidden"
			style={{
				// Base fallback color
				backgroundColor: "#0b0b0f",
			}}
		>
			<div
				className="absolute inset-0"
				style={{
					filter: "blur(60px) saturate(140%)",
					transform: "translateZ(0)",
					backgroundImage:
						// Multiple moving radial gradients to emulate plasma
						"radial-gradient(40% 40% at 20% 20%, rgba(77, 91, 255, 0.70), rgba(77, 91, 255, 0) 60%)," +
						"radial-gradient(35% 35% at 80% 25%, rgba(255, 90, 196, 0.70), rgba(255, 90, 196, 0) 60%)," +
						"radial-gradient(45% 45% at 30% 80%, rgba(0, 255, 188, 0.60), rgba(0, 255, 188, 0) 60%)," +
						"radial-gradient(35% 35% at 75% 75%, rgba(255, 208, 0, 0.50), rgba(255, 208, 0, 0) 60%)",
					backgroundRepeat: "no-repeat",
					backgroundSize: "120% 120%",
					animation: "plasma-shift 18s ease-in-out infinite alternate",
				}}
			/>
			<style>{`
        @keyframes plasma-shift {
          0% {
            background-position: 10% 10%, 90% 15%, 15% 90%, 85% 85%;
          }
          50% {
            background-position: 20% 30%, 80% 25%, 30% 80%, 75% 70%;
          }
          100% {
            background-position: 30% 20%, 70% 35%, 25% 70%, 65% 80%;
          }
        }
      `}</style>
		</div>
	);
}
