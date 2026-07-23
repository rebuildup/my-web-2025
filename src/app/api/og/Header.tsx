import { theme } from "./theme";

interface HeaderProps {
	title: string;
	summary: string;
}

export function Header({ title, summary }: HeaderProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "24px",
				justifyContent: "flex-start",
			}}
		>
			<h1
				style={{
					fontSize: "56px",
					fontWeight: 700,
					color: theme.textColor,
					lineHeight: 1.2,
					margin: 0,
					overflow: "hidden",
					textOverflow: "ellipsis",
					display: "-webkit-box",
					borderLeft: `12px solid ${theme.accentColor}`,
					paddingLeft: "32px",
					fontStyle: "italic",
				}}
			>
				{title}
			</h1>
			{summary && (
				<p
					style={{
						fontSize: "24px",
						fontWeight: 400,
						color: theme.secondaryColor,
						margin: 0,
						lineHeight: 1.5,
						overflow: "hidden",
						textOverflow: "ellipsis",
						display: "-webkit-box",
						paddingLeft: "44px",
					}}
				>
					{summary}
				</p>
			)}
		</div>
	);
}
