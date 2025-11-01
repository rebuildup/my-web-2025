"use client";

import { Paper, Stack, Typography } from "@mui/material";
import { Table as TableIcon } from "lucide-react";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function TableBlock({
	block,
	readOnly,
	onContentChange,
}: BlockComponentProps) {
	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 3,
				p: 2.5,
				bgcolor: "rgba(255,255,255,0.02)",
			}}
		>
			<Stack spacing={1.5}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<TableIcon size={18} />
					<Typography variant="subtitle2">
						Table (Markdown-compatible)
					</Typography>
				</Stack>
				<EditableText
					value={block.content}
					onChange={onContentChange}
					readOnly={readOnly}
					placeholder="Describe the table in Markdown"
					sx={{
						fontFamily: "monospace",
						minHeight: "120px",
					}}
				/>
			</Stack>
		</Paper>
	);
}
