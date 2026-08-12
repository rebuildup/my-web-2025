"use client";

import Link from "next/link";
import { type CSSProperties, Fragment, isValidElement } from "react";
import { adminColor } from "@/components/admin/ui/tokens";

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export interface PageHeaderProps {
	title: string;
	description?: string;
	breadcrumbs?: BreadcrumbItem[];
	actions?: React.ReactNode;
	statusChip?: {
		label: string;
		color?:
			| "default"
			| "primary"
			| "secondary"
			| "error"
			| "info"
			| "success"
			| "warning";
	};
}

type ChipColor = NonNullable<
	NonNullable<PageHeaderProps["statusChip"]>["color"]
>;

const chipColorMap: Record<ChipColor, { bg: string; fg: string }> = {
	default: { bg: "#f3f4f6", fg: adminColor.textSecondary },
	primary: { bg: "rgba(44, 123, 229, 0.12)", fg: adminColor.accent },
	secondary: { bg: "#f3f4f6", fg: adminColor.textSecondary },
	error: { bg: "rgba(185, 28, 28, 0.12)", fg: adminColor.error },
	info: { bg: "rgba(30, 64, 175, 0.12)", fg: adminColor.info },
	success: { bg: "rgba(22, 101, 52, 0.12)", fg: adminColor.success },
	warning: { bg: "rgba(180, 83, 9, 0.12)", fg: adminColor.warning },
};

const containerStyle: CSSProperties = {
	marginBottom: 24,
	display: "flex",
	flexDirection: "row",
	flexWrap: "wrap",
	alignItems: "center",
	gap: 16,
};

const contentStackStyle: CSSProperties = {
	flex: 1,
	minWidth: 0,
	display: "flex",
	flexDirection: "column",
	gap: 4,
};

const breadcrumbLinkStyle: CSSProperties = {
	color: adminColor.textSecondary,
	fontSize: 13,
	textDecoration: "none",
};

const breadcrumbCurrentStyle: CSSProperties = {
	color: adminColor.textPrimary,
	fontSize: 13,
};

const titleRowStyle: CSSProperties = {
	display: "flex",
	flexDirection: "row",
	alignItems: "center",
	gap: 12,
};

const titleStyle: CSSProperties = {
	fontSize: 24,
	fontWeight: 700,
	lineHeight: 1.2,
	margin: 0,
	color: adminColor.textPrimary,
};

const descriptionStyle: CSSProperties = {
	marginTop: 4,
	maxWidth: 720,
	fontSize: 14,
	color: adminColor.textSecondary,
};

const actionsStyle: CSSProperties = {
	display: "flex",
	flexWrap: "wrap",
	gap: 8,
	justifyContent: "flex-end",
};

export function PageHeader({
	title,
	description,
	breadcrumbs,
	actions,
	statusChip,
}: PageHeaderProps) {
	const chipColor = chipColorMap[statusChip?.color ?? "default"];

	return (
		<header style={containerStyle}>
			<div style={contentStackStyle}>
				{breadcrumbs && breadcrumbs.length > 0 && (
					<nav aria-label="breadcrumb" style={{ marginBottom: 4 }}>
						<ol
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: 4,
								padding: 0,
								margin: 0,
								listStyle: "none",
								fontSize: 13,
							}}
						>
							{breadcrumbs.map((crumb, index) => {
								const isLast = index === breadcrumbs.length - 1;
								return (
									<li
										key={crumb.label}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 4,
										}}
									>
										{crumb.href && !isLast ? (
											<Link href={crumb.href} style={breadcrumbLinkStyle}>
												{crumb.label}
											</Link>
										) : (
											<span
												aria-current={isLast ? "page" : undefined}
												style={
													isLast ? breadcrumbCurrentStyle : breadcrumbLinkStyle
												}
											>
												{crumb.label}
											</span>
										)}
										{!isLast && (
											<span
												aria-hidden
												style={{ color: adminColor.textSecondary }}
											>
												›
											</span>
										)}
									</li>
								);
							})}
						</ol>
					</nav>
				)}
				<div style={titleRowStyle}>
					<h1 style={titleStyle}>{title}</h1>
					{statusChip && (
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								padding: "2px 10px",
								fontSize: 12,
								fontWeight: 600,
								borderRadius: 999,
								backgroundColor: chipColor.bg,
								color: chipColor.fg,
							}}
						>
							{statusChip.label}
						</span>
					)}
				</div>
				{description && <p style={descriptionStyle}>{description}</p>}
			</div>
			{actions && (
				<div style={actionsStyle}>
					{Array.isArray(actions)
						? actions.map((action, index) => {
								const actionKey =
									isValidElement(action) && action.key != null
										? action.key
										: `action-${index}`;
								return <Fragment key={actionKey}>{action}</Fragment>;
							})
						: actions}
				</div>
			)}
		</header>
	);
}
