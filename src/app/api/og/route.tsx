import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);

		// Get dynamic params
		const title = searchParams.get("title")?.slice(0, 100) || "Portfolio";
		const category = searchParams.get("category") || "portfolio";
		const tags = searchParams.get("tags")?.split(",") || [];
		const displayTags = tags.slice(0, 3); // Show max 3 tags

		// Theme colors based on category
		const getThemeColor = (cat: string) => {
			switch (cat.toLowerCase()) {
				case "develop":
					return "#3b82f6"; // blue
				case "video":
					return "#ef4444"; // red
				case "design":
					return "#a855f7"; // purple
				case "video&design":
					return "#ec4899"; // pink
				default:
					return "#10b981"; // emerald/default
			}
		};

		const accentColor = getThemeColor(category);

		return new ImageResponse(
			(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#050505",
						backgroundImage:
							"radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a1a 2%, transparent 0%)",
						backgroundSize: "100px 100px",
						fontFamily: '"Noto Sans JP", sans-serif',
						position: "relative",
					}}
				>
					{/* Gradient Orb Background */}
					<div
						style={{
							position: "absolute",
							top: "-20%",
							right: "-20%",
							width: "800px",
							height: "800px",
							borderRadius: "50%",
							background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
							filter: "blur(40px)",
						}}
					/>
					<div
						style={{
							position: "absolute",
							bottom: "-20%",
							left: "-20%",
							width: "600px",
							height: "600px",
							borderRadius: "50%",
							background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
							filter: "blur(40px)",
						}}
					/>

					{/* Main Content Container */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-start",
							justifyContent: "space-between",
							width: "90%",
							height: "80%",
							padding: "60px",
							backgroundColor: "rgba(20, 20, 20, 0.6)",
							border: "1px solid rgba(255, 255, 255, 0.1)",
							borderRadius: "24px",
							boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
						}}
					>
						{/* Header: Site Name & Category */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								width: "100%",
								alignItems: "center",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "12px",
								}}
							>
								{/* Simple Logo Placeholder */}
								<div
									style={{
										width: "32px",
										height: "32px",
										borderRadius: "50%",
										background: "white",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontWeight: "bold",
										color: "#000",
										fontSize: "16px",
									}}
								>
									S
								</div>
								<span
									style={{
										color: "rgba(255, 255, 255, 0.9)",
										fontSize: "24px",
										fontWeight: 600,
										letterSpacing: "0.05em",
									}}
								>
									samuido
								</span>
							</div>

							<div
								style={{
									padding: "8px 20px",
									borderRadius: "100px",
									backgroundColor: `${accentColor}20`,
									border: `1px solid ${accentColor}40`,
									color: accentColor,
									fontSize: "18px",
									fontWeight: 600,
									textTransform: "uppercase",
									letterSpacing: "0.1em",
								}}
							>
								{category}
							</div>
						</div>

						{/* Title Section */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "20px",
							}}
						>
							<h1
								style={{
									fontSize: "64px",
									fontWeight: 800,
									background: "linear-gradient(to right, #fff, #aaa)",
									backgroundClip: "text",
									color: "transparent",
									margin: 0,
									lineHeight: 1.1,
									textShadow: "0 2px 10px rgba(0,0,0,0.5)",
								}}
							>
								{title}
							</h1>
							<div
								style={{
									width: "100px",
									height: "4px",
									background: accentColor,
									borderRadius: "2px",
								}}
							/>
						</div>

						{/* Footer: Tags */}
						<div
							style={{
								display: "flex",
								gap: "16px",
								marginTop: "auto",
							}}
						>
							{displayTags.map((tag, i) => (
								<div
									key={i}
									style={{
										padding: "8px 16px",
										background: "rgba(255, 255, 255, 0.05)",
										border: "1px solid rgba(255, 255, 255, 0.1)",
										borderRadius: "8px",
										color: "rgba(255, 255, 255, 0.7)",
										fontSize: "16px",
										display: "flex",
										alignItems: "center",
									}}
								>
									<span style={{ marginRight: "8px", color: accentColor }}>
										#
									</span>
									{tag}
								</div>
							))}
						</div>
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
			},
		);
	} catch (e: any) {
		console.log(`${e.message}`);
		return new Response(`Failed to generate the image`, {
			status: 500,
		});
	}
}
