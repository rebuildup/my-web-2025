interface RotatedSlugProps {
	slug: string;
	side: "left" | "right";
}

export function RotatedSlug({ slug, side }: RotatedSlugProps) {
	if (!slug) return null;
	const isLeft = side === "left";
	const sideStyle = isLeft ? { left: 20 } : { right: 20 };
	return (
		<div
			style={{
				position: "absolute",
				top: 200,
				fontSize: 14,
				fontWeight: 700,
				color: "#333",
				letterSpacing: "4px",
				textTransform: "uppercase",
				whiteSpace: "nowrap",
				...sideStyle,
			}}
		>
			{slug}
		</div>
	);
}
