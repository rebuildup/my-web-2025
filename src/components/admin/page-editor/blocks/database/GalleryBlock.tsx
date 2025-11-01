"use client";

import { Paper, Stack, Typography } from "@mui/material";
import { Images } from "lucide-react";
import type { BlockComponentProps } from "../types";

export function GalleryBlock({ block }: BlockComponentProps) {
	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 3,
				p: 2.5,
				bgcolor: "rgba(255,255,255,0.02)",
			}}
		>
			<Stack spacing={1}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Images size={18} />
					<Typography variant="subtitle2">Gallery block</Typography>
				</Stack>
				<Typography variant="body2" color="text.secondary">
					{block.content || "This gallery will render media in a grid layout."}
				</Typography>
			</Stack>
		</Paper>
	);
}
