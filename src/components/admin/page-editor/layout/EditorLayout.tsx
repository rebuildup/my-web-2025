"use client";

import type { ReactNode } from "react";

export interface EditorLayoutProps {
	sidebar: ReactNode;
	editor: ReactNode;
	toolbar?: ReactNode;
	rightPanel?: ReactNode;
}

export function EditorLayout({
	sidebar,
	editor,
	toolbar,
	rightPanel,
}: EditorLayoutProps) {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: rightPanel
					? "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 320px)"
					: "minmax(0, 1fr) minmax(0, 3fr)",
				height: "calc(100dvh - 96px)",
				width: "100%",
				overflow: "hidden",
				backgroundColor: "transparent",
			}}
		>
			<aside
				style={{
					minHeight: 0,
					backgroundColor: "transparent",
					overflowY: "auto",
					paddingLeft: 24,
					paddingRight: 24,
					paddingTop: 32,
					paddingBottom: 32,
				}}
			>
				{sidebar}
			</aside>
			<main
				style={{
					minHeight: 0,
					position: "relative",
					overflow: "hidden",
					paddingLeft: 48,
					paddingRight: 16,
					paddingTop: 16,
					paddingBottom: 16,
					display: "flex",
					flexDirection: "column",
					gap: 12,
				}}
			>
				{toolbar && <section style={{ flexShrink: 0 }}>{toolbar}</section>}
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						borderRadius: 0,
						backgroundColor: "transparent",
					}}
				>
					<section
						style={{
							flex: 1,
							overflowY: "auto",
							overflowX: "hidden",
							paddingLeft: 12,
							paddingRight: 12,
							paddingTop: 16,
							paddingBottom: 16,
						}}
					>
						{editor}
					</section>
				</div>
			</main>
			{rightPanel && (
				<aside
					style={{
						minHeight: 0,
						backgroundColor: "transparent",
						overflow: "hidden",
						boxSizing: "border-box",
						paddingLeft: 24,
						paddingRight: 24,
						paddingTop: 32,
						paddingBottom: 32,
					}}
				>
					{rightPanel}
				</aside>
			)}
		</div>
	);
}
