"use client";

import { Paper, Stack, Typography } from "@mui/material";
import { List } from "lucide-react";

export function TableOfContentsBlock() {
	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 3,
				p: 2.5,
				bgcolor: "rgba(255,255,255,0.02)",
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			<Stack direction="row" spacing={1.5} alignItems="center">
				<List color="currentColor" size={18} />
				<Typography variant="subtitle2" fontWeight={600}>
					Table of contents
				</Typography>
			</Stack>
			<Typography variant="body2" color="text.secondary">
				Table of contents is generated automatically based on heading blocks.
			</Typography>
		</Paper>
	);
}
