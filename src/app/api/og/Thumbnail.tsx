interface ThumbnailProps {
	src: string;
}

export function Thumbnail({ src }: ThumbnailProps) {
	if (!src) {
		return (
			<div
				style={{
					width: "0px",
					height: "0px",
					display: "none",
				}}
			/>
		);
	}
	return (
		<div
			style={{
				width: "500px",
				height: "500px",
				display: "flex",
			}}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={src}
				alt="Thumbnail"
				width="500"
				height="500"
				style={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
				}}
			/>
		</div>
	);
}
