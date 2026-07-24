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
				gap: 20,
			}}
		>
			<div
				style={{
					display: "flex",
					gap: 12,
					flexWrap: "wrap",
				}}
			>
				<span
					style={{
						display: "flex",
						alignItems: "center",
						borderWidth: 2,
						borderColor: theme.accentColor,
						borderStyle: "solid",
						color: theme.textColor,
						fontSize: 22,
						fontWeight: 700,
						paddingTop: 8,
						paddingBottom: 8,
						paddingLeft: 16,
						paddingRight: 16,
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
							fontSize: 20,
							fontWeight: 700,
							paddingTop: 8,
							paddingBottom: 8,
							paddingLeft: 14,
							paddingRight: 14,
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
					gap: 20,
					marginTop: 10,
				}}
			>
				<div
					style={{
						width: 80,
						height: 80,
						borderRadius: 40,
						overflow: "hidden",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: theme.accentColor,
						color: theme.textColor,
						fontSize: 28,
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
						gap: 4,
					}}
				>
					<span
						style={{
							fontSize: 32,
							fontWeight: 700,
							color: theme.textColor,
							lineHeight: 1,
						}}
					>
						samuido
					</span>
					<span
						style={{
							fontSize: 20,
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
