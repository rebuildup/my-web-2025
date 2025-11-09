"use client";

import { Box, Breadcrumbs, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { Fragment, isValidElement } from "react";

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

export function PageHeader({
	title,
	description,
	breadcrumbs,
	actions,
	statusChip,
}: PageHeaderProps) {
	return (
		<Box
			sx={{
				mb: { xs: 3, md: 4 },
				display: "flex",
				flexDirection: { xs: "column", md: "row" },
				alignItems: { xs: "flex-start", md: "center" },
				gap: 2,
			}}
		>
			<Box sx={{ flex: 1 }}>
				{breadcrumbs && breadcrumbs.length > 0 && (
					<Breadcrumbs
						aria-label="breadcrumb"
						sx={{ mb: 1, "& a": { color: "text.secondary", fontSize: 13 } }}
					>
						{breadcrumbs.map((crumb, index) => {
							const isLast = index === breadcrumbs.length - 1;
							if (crumb.href && !isLast) {
								return (
									<Link key={crumb.label} href={crumb.href}>
										{crumb.label}
									</Link>
								);
							}
							return (
								<Typography
									key={crumb.label}
									color="text.primary"
									fontSize={13}
								>
									{crumb.label}
								</Typography>
							);
						})}
					</Breadcrumbs>
				)}
				<Stack direction="row" alignItems="center" spacing={1.5}>
					<Typography
						variant="h4"
						component="h1"
						fontWeight={700}
						sx={{ lineHeight: 1.2 }}
					>
						{title}
					</Typography>
					{statusChip && (
						<Chip
							size="small"
							label={statusChip.label}
							color={statusChip.color ?? "default"}
						/>
					)}
				</Stack>
				{description && (
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mt: 1, maxWidth: 720 }}
					>
						{description}
					</Typography>
				)}
			</Box>
			{actions && (
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						gap: 1,
						justifyContent: { xs: "flex-start", md: "flex-end" },
					}}
				>
					{Array.isArray(actions)
						? actions.map((action, index) => {
								const actionKey =
									isValidElement(action) && action.key != null
										? action.key
										: `action-${index}`;
								return <Fragment key={actionKey}>{action}</Fragment>;
							})
						: actions}
				</Box>
			)}
		</Box>
	);
}
