"use client";

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
	if (!open) return null;
	return (
		<div
			style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
			onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
		>
			<div style={{ padding: 20, minWidth: 320, maxWidth: 420 }}>
				<div style={{ fontSize: 15, fontWeight: 700, marginBottom: description ? 8 : 16 }}>
					{title}
				</div>
				{description && (
					<div style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
						{description}
					</div>
				)}
				<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
					<button onClick={onCancel} disabled={isLoading} style={{ padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
						{cancelLabel}
					</button>
					<button onClick={onConfirm} disabled={isLoading} style={{ padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
