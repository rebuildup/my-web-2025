import type { PropsWithChildren } from "react";

export default function GlowCard({
	className,
	children,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={
				"relative rounded-md transition-transform duration-300 will-change-transform hover:-translate-y-0.5 " +
				(className || "")
			}
			style={{
				background:
					"linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
				border: "1px solid rgba(255,255,255,0.12)",
			}}
		>
			{/* subtle glow ring */}
			<div
				aria-hidden
				className="pointer-events-none absolute -inset-px rounded-md"
				style={{
					background:
						"radial-gradient(120% 60% at 10% 0%, rgba(180,160,255,0.12), transparent 60%), radial-gradient(120% 60% at 100% 100%, rgba(40,180,255,0.08), transparent 50%)",
					mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
					WebkitMask:
						"linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
					padding: 1,
					borderRadius: 8,
				}}
			/>
			<div className="relative z-10">{children}</div>
		</div>
	);
}
