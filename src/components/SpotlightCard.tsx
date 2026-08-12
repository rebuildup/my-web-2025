"use client";

import { type CSSProperties, type ReactNode, useCallback, useRef } from "react";

interface SpotlightCardProps {
	children: ReactNode;
	className?: string;
	spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

const DEFAULT_COLOR =
	"rgba(255, 255, 255, 0.25)" satisfies SpotlightCardProps["spotlightColor"];

export function SpotlightCard({
	children,
	className,
	spotlightColor = DEFAULT_COLOR,
}: SpotlightCardProps) {
	const ref = useRef<HTMLDivElement>(null);

	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			const el = ref.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			el.style.setProperty("--spotlight-x", `${x}px`);
			el.style.setProperty("--spotlight-y", `${y}px`);
			el.style.setProperty("--spotlight-color", spotlightColor);
			el.style.setProperty("--spotlight-opacity", "1");
		},
		[spotlightColor],
	);

	const handleMouseLeave = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		el.style.setProperty("--spotlight-opacity", "0");
	}, []);

	const style: CSSProperties = {
		position: "relative",
		backgroundImage:
			"radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), var(--spotlight-color, rgba(255,255,255,0.25)), transparent 60%)",
	};

	return (
		<div
			ref={ref}
			className={className}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={style}
		>
			{children}
		</div>
	);
}
