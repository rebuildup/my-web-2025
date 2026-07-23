interface BackgroundImageProps {
	src: string;
}

export function BackgroundImage({ src }: BackgroundImageProps) {
	if (!src) return null;
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src}
			alt="Background"
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				objectFit: "cover",
				transform: "scale(1.2)",
				filter: "grayscale(100%)",
				opacity: 0.1,
				zIndex: 0,
			}}
		/>
	);
}
