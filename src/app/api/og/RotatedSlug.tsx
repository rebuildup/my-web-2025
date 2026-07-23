interface RotatedSlugProps {
	slug: string;
	side: "left" | "right";
}

export function RotatedSlug({ slug, side }: RotatedSlugProps) {
	if (!slug) return null;
	const isLeft = side === "left";
	return (
		<div
			style={{
				position: "absolute",
				left: isLeft ? "20px" : undefined,
				right: isLeft ? undefined : "20px",
				top: "50%",
				transform: isLeft
					? "translate(-50%, -50%) rotate(-90deg)"
					: "translate(50%, -50%) rotate(90deg)",
				fontSize: "14px",
				fontWeight: 700,
				color: "#333",
				letterSpacing: "4px",
				zIndex: 2,
				textTransform: "uppercase",
				whiteSpace: "nowrap",
			}}
		>
			{slug}
		</div>
	);
}
