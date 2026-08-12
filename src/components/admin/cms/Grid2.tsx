"use client";

import type { CSSProperties, ReactNode } from "react";

interface Grid2Props {
	children?: ReactNode;
	container?: boolean;
	spacing?: number;
	xs?: number;
	sm?: number;
	md?: number;
	lg?: number;
	xl?: number;
	className?: string;
	style?: CSSProperties;
}

const SPACING_UNIT = 8;

function pickSpan(
	breakpoints: {
		xs?: number;
		sm?: number;
		md?: number;
		lg?: number;
		xl?: number;
	},
	current: keyof typeof breakpoints,
): number {
	const chain: (keyof typeof breakpoints)[] = [
		current,
		"xl",
		"lg",
		"md",
		"sm",
		"xs",
	];
	for (const key of chain) {
		const value = breakpoints[key];
		if (value !== undefined) return value;
	}
	return 12;
}

function Grid2({
	children,
	container,
	spacing,
	xs,
	sm,
	md,
	lg,
	xl,
	className,
	style,
}: Grid2Props) {
	const breakpoints = { xs, sm, md, lg, xl };

	if (container) {
		const gap = spacing ? `${spacing * SPACING_UNIT}px` : "0";
		return (
			<div
				className={className}
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(12, 1fr)",
					gap,
					...style,
				}}
			>
				{children}
			</div>
		);
	}

	const span = pickSpan(breakpoints, "xs");
	const mdSpan = pickSpan(breakpoints, "md");
	const lgSpan = pickSpan(breakpoints, "lg");
	const xlSpan = pickSpan(breakpoints, "xl");

	const classNameFinal =
		`grid2-${xs ?? "-"}-${sm ?? "-"}-${md ?? "-"}-${lg ?? "-"}-${xl ?? "-"} ${className ?? ""}`.trim();

	const responsiveCss = `
      .${classNameFinal.split(" ")[0]} { grid-column: span ${span}; }
      @media (min-width: 600px) { .${classNameFinal.split(" ")[0]} { grid-column: span ${pickSpan(breakpoints, "sm")}; } }
      @media (min-width: 900px) { .${classNameFinal.split(" ")[0]} { grid-column: span ${mdSpan}; } }
      @media (min-width: 1200px) { .${classNameFinal.split(" ")[0]} { grid-column: span ${lgSpan}; } }
      @media (min-width: 1536px) { .${classNameFinal.split(" ")[0]} { grid-column: span ${xlSpan}; } }
    `;

	return (
		<>
			<style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
			<div className={classNameFinal} style={style}>
				{children}
			</div>
		</>
	);
}

export default Grid2;
