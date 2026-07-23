import { theme } from "./theme";

interface FooterProps {
	category: string;
	displayTags: string[];
}

export function Footer({ category, displayTags }: FooterProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "20px",
			}}
		>
			<div
				style={{
					display: "flex",
					gap: "12px",
					flexWrap: "wrap",
				}}
			>
				<span
					style={{
						display: "flex",
						alignItems: "center",
						border: `2px solid ${theme.accentColor}`,
						color: theme.textColor,
						fontSize: "22px",
						fontWeight: 700,
						padding: "8px 16px",
					}}
				>
					{category}
				</span>
				{displayTags.map((tag) => (
					<span
						key={tag}
						style={{
							display: "flex",
							alignItems: "center",
							backgroundColor: "rgba(255, 255, 255, 0.12)",
							color: theme.secondaryColor,
							fontSize: "20px",
							fontWeight: 700,
							padding: "8px 14px",
						}}
					>
						#{tag}
					</span>
				))}
			</div>
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
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: theme.accentColor,
						color: theme.textColor,
						fontSize: "28px",
						fontWeight: 700,
					}}
				>
					S
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
							color: theme.textColor,
							lineHeight: 1,
						}}
					>
						samuido
					</span>
					<span
						style={{
							fontSize: "20px",
							color: theme.secondaryColor,
						}}
					>
						https://yusuke-kim.com
					</span>
				</div>
			</div>
		</div>
	);
}
