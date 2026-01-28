/**
 * CSS-only gradient background for instant FCP
 * Lightweight alternative to Three.js version
 */
export default function AboutBackgroundCSS() {
	return (
		<div
			className="fixed inset-0 -z-10 bg-[#020201]"
			style={{
				background: `
					radial-gradient(
						ellipse 60% 50% at 50% 50%,
						rgba(91, 33, 182, 0.15) 0%,
						rgba(45, 212, 191, 0.08) 30%,
						rgba(245, 158, 11, 0.05) 50%,
						transparent 70%
					),
					#020201
				`,
			}}
		/>
	);
}
