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
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 1000,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "rgba(0,0,0,0.6)",
			}}
			onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
		>
			<div
				style={{
					background: "#1a1a2e",
					borderRadius: 10,
					border: "1px solid #333",
					padding: "20px 24px",
					minWidth: 320,
					maxWidth: 420,
					boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
				}}
			>
				<div style={{ fontSize: 15, fontWeight: 700, color: "#f3f4f6", marginBottom: description ? 8 : 16 }}>
					{title}
				</div>
				{description && (
					<div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16, lineHeight: 1.5 }}>
						{description}
					</div>
				)}
				<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
					<button
						onClick={onCancel}
						disabled={isLoading}
						style={{
							padding: "6px 14px",
							borderRadius: 6,
							border: "1px solid #333",
							background: "transparent",
							color: "#ccc",
							fontSize: 13,
							cursor: "pointer",
						}}
					>
						{cancelLabel}
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						style={{
							padding: "6px 14px",
							borderRadius: 6,
							border: "none",
							background: "#dc2626",
							color: "#fff",
							fontSize: 13,
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
