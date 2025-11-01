"use client";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

export interface ConfirmDialogProps {
	open: boolean;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = "実行する",
	cancelLabel = "キャンセル",
	onConfirm,
	onCancel,
	isLoading = false,
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle>{title}</DialogTitle>
			{description && (
				<DialogContent>
					<DialogContentText>{description}</DialogContentText>
				</DialogContent>
			)}
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onCancel} disabled={isLoading}>
					{cancelLabel}
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="error"
					disabled={isLoading}
				>
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
