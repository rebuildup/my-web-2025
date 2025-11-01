"use client";

import {
	Box,
	Button,
	Chip,
	LinearProgress,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CloudCheck, Save } from "lucide-react";

export interface BlockToolbarProps {
	onSave?: () => void;
	isSaving?: boolean;
	lastSaved?: Date | null;
	hasUnsavedChanges?: boolean;
}

export function BlockToolbar({
	onSave,
	isSaving = false,
	lastSaved,
	hasUnsavedChanges = false,
}: BlockToolbarProps) {
	const statusLabel = isSaving
		? "Saving..."
		: hasUnsavedChanges
			? "Unsaved changes"
			: "All changes saved";

	return (
		<Paper elevation={0} sx={{ px: 0, py: 0, bgcolor: "transparent" }}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={2}
				alignItems={{ xs: "flex-start", md: "center" }}
				justifyContent="space-between"
				sx={{ maxWidth: 768, mx: "auto", width: "100%" }}
			>
				<Stack direction="row" spacing={2} alignItems="center">
					{isSaving ? (
						<CircularProgress size={20} />
					) : hasUnsavedChanges ? (
						<AlertTriangle size={18} color="#f59e0b" />
					) : (
						<CloudCheck size={18} color="#22c55e" />
					)}
					<Box>
						<Typography variant="subtitle2">{statusLabel}</Typography>
						{lastSaved && (
							<Typography variant="caption" color="text.secondary">
								Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
							</Typography>
						)}
					</Box>
					{hasUnsavedChanges && !isSaving && (
						<Chip
							label="Draft"
							color="warning"
							size="small"
							variant="outlined"
						/>
					)}
				</Stack>
				<Button
					variant="contained"
					color="primary"
					startIcon={!isSaving ? <Save /> : undefined}
					disabled={!hasUnsavedChanges || isSaving || !onSave}
					onClick={() => onSave?.()}
				>
					{isSaving ? "Saving..." : "Save now"}
				</Button>
			</Stack>
			{isSaving && <LinearProgress sx={{ mt: 2 }} />}
		</Paper>
	);
}
