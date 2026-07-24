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
				gap: 24,
				justifyContent: "flex-start",
			}}
		>
			<h1
				style={{
					fontSize: 56,
					fontWeight: 700,
					color: theme.textColor,
					lineHeight: 1.2,
					margin: 0,
					overflow: "hidden",
					textOverflow: "ellipsis",
					display: "flex",
					borderLeftWidth: 12,
					borderLeftColor: theme.accentColor,
					borderStyle: "solid",
					paddingLeft: 32,
					fontStyle: "italic",
				}}
			>
				{title}
			</h1>
			{summary && (
				<p
					style={{
						fontSize: 24,
						fontWeight: 400,
						color: theme.secondaryColor,
						margin: 0,
						lineHeight: 1.5,
						overflow: "hidden",
						textOverflow: "ellipsis",
						display: "flex",
						paddingLeft: 44,
					}}
				>
					{summary}
				</p>
			)}
		</div>
	);
}
