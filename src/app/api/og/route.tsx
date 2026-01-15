import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);

		// Get dynamic params
		// Get dynamic params
		const title = searchParams.get("title")?.slice(0, 100) || "Portfolio";
		const category = searchParams.get("category") || "portfolio";
		const tags = searchParams.get("tags")?.split(",") || [];
		const thumbnail = searchParams.get("thumbnail");
		const slug = searchParams.get("slug") || "";
		const displayTags = tags.slice(0, 3);
// ... existing font loading code ...


		// Theme colors
		const backgroundColor = "#050505"; // Dark background
		const textColor = "#F5F5F5"; // White-ish
		const accentColor = "#0000FF"; // Primary Blue (as requested)
		const secondaryColor = "rgba(255, 255, 255, 0.7)";

		// Resolve thumbnail URL if provided
		let thumbnailSrc = "";
		if (thumbnail) {
			if (thumbnail.startsWith("http")) {
				thumbnailSrc = thumbnail;
			} else {
				// Handle relative path (for local images)
				const host = req.headers.get("host") || "yusuke-kim.com";
				const protocol = host.includes("localhost") ? "http" : "https";
				thumbnailSrc = `${protocol}://${host}${thumbnail}`;
			}
		}

		// Load font
		const fontData = await fetch(
			new URL("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap"),
		).then(async (res) => {
			const css = await res.text();
			const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
			if (resource) {
				return fetch(resource[1]).then((res) => res.arrayBuffer());
			}
			return fetch("https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFYzSD-AsugKSg.ttf").then(res => res.arrayBuffer())
		}).catch(() => null);
		
		const summary = searchParams.get("summary")?.slice(0, 80) + (searchParams.get("summary")?.length && searchParams.get("summary")!.length > 80 ? "..." : "") || "";

		return new ImageResponse(
			(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						flexDirection: "row", // Horizontal layout
						backgroundColor: backgroundColor,
						fontFamily: '"Noto Sans JP", sans-serif',
						// padding: "60px", // REMOVED padding from root to let background fill
						gap: "0px", // REMOVED gap
						alignItems: "center",
						position: "relative",
						overflow: "hidden", // Ensure rotated text doesn't overflow
					}}
				>
					{/* Background Image */}
					{thumbnailSrc && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={thumbnailSrc}
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
					)}

					{/* Rotated Slug - Left */}
					{slug && (
						<div
							style={{
								position: "absolute",
								left: "20px",
								top: "50%",
								transform: "translate(-50%, -50%) rotate(-90deg)",
								fontSize: "14px", // Smaller font size
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
					)}
					{/* Rotated Slug - Right */}
					{slug && (
						<div
							style={{
								position: "absolute",
								right: "20px",
								top: "50%",
								transform: "translate(50%, -50%) rotate(90deg)",
								fontSize: "14px", // Smaller font size
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
					)}

					{/* Content Container */}
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							width: "100%",
							height: "100%",
							padding: "80px 80px", // Increased side padding for slugs
							gap: "40px",
							alignItems: "center", // Vertical align center for the row
							zIndex: 1,
						}}
					>
						{/* Left: Content */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between", // Keeps footer at bottom
								height: "100%",
								flex: 1,
								padding: "20px 0",
							}}
						>
							{/* Top: Header & Title */}
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "24px",
									justifyContent: "flex-start", // ensure title is at top
								}}
							>
								{/* Main Title - Font size reduced from 72px */}
								<h1
									style={{
										fontSize: "56px", 
										fontWeight: 700,
										color: textColor,
										lineHeight: 1.2,
										margin: 0,
										overflow: "hidden",
										textOverflow: "ellipsis",
										display: "-webkit-box",
										// WebkitLineClamp: 4, 
										borderLeft: `12px solid ${accentColor}`,
										paddingLeft: "32px",
										fontStyle: "italic",
									}}
								>
									{title}
								</h1>
								{/* Summary */}
								{summary && (
									<p
										style={{
											fontSize: "24px",
											fontWeight: 400,
											color: secondaryColor,
											margin: 0,
											lineHeight: 1.5,
											overflow: "hidden",
											textOverflow: "ellipsis",
											display: "-webkit-box",
											// WebkitLineClamp: 2,
											paddingLeft: "44px", // Align with title text (12px border + 32px padding)
										}}
									>
										{summary}
									</p>
								)}
							</div>

							{/* Bottom: Footer Info */}
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "20px",
								}}
							>
								{/* User Profile & URL - NO TAGS */}
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "20px",
										marginTop: "10px",
									}}
								>
									<div
										style={{
											width: "80px",
											height: "80px",
											borderRadius: "50%",
											overflow: "hidden",
											// Removed border
											display: "flex",
										}}
									>
										{/* User Icon */}
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src="https://pbs.twimg.com/profile_images/1977152336486449153/uWHA4dAC_400x400.jpg"
											alt="samuido"
											width="80"
											height="80"
											style={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
											}}
										/>
									</div>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											gap: "4px",
										}}
									>
										<span
											style={{
												fontSize: "32px",
												fontWeight: 700,
												color: textColor,
												lineHeight: 1,
											}}
										>
											samuido
										</span>
										<span
											style={{
												fontSize: "20px",
												color: secondaryColor,
											}}
										>
											https://yusuke-kim.com
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Right: Thumbnail (Clean) */}
						{thumbnailSrc ? (
							<div
								style={{
									width: "500px",
									height: "500px",
									display: "flex",
									// Removed shadow/radius
								}}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={thumbnailSrc}
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
						) : (
							<div
								style={{
									width: "0px",
									height: "0px",
									display: "none",
								}}
							/>
						)}
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
				fonts: fontData ? [
					{
						name: 'Noto Sans JP',
						data: fontData,
						style: 'normal',
						weight: 700,
					}
				] : undefined,
			},
		);
	} catch (e: any) {
		console.log(`${e.message}`);
		return new Response(`Failed to generate the image: ${e.message}`, {
			status: 500,
		});
	}
}
