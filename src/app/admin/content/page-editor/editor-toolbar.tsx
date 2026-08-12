"use client";

import { BlockToolbar } from "@/components/admin/page-editor/editor/BlockToolbar";
import { adminColor } from "@/components/admin/ui/tokens";
import type { ToastMessage } from "./types";

export interface EditorToolbarProps {
	onSave: () => void;
	isSaving: boolean;
	lastSaved: Date | null;
	hasUnsavedChanges: boolean;
	toast: ToastMessage | null;
}

const toastStyle = (severity: ToastMessage["type"]) => {
	const palette: Record<ToastMessage["type"], { bg: string; fg: string; border: string }> = {
		success: {
			bg: "rgba(22, 101, 52, 0.08)",
			fg: adminColor.success,
			border: adminColor.success,
		},
		error: {
			bg: "rgba(185, 28, 28, 0.08)",
			fg: adminColor.error,
			border: adminColor.error,
		},
		info: {
			bg: "rgba(30, 64, 175, 0.08)",
			fg: adminColor.info,
			border: adminColor.info,
		},
		warning: {
			bg: "rgba(180, 83, 9, 0.08)",
			fg: adminColor.warning,
			border: adminColor.warning,
		},
	};
	const c = palette[severity];
	return {
		padding: "8px 16px",
		fontSize: 14,
		borderRadius: 4,
		border: `1px solid ${c.border}`,
		borderLeftWidth: 4,
		backgroundColor: c.bg,
		color: c.fg,
	};
};

export function EditorToolbar({
	onSave,
	isSaving,
	lastSaved,
	hasUnsavedChanges,
	toast,
}: EditorToolbarProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<BlockToolbar
				onSave={onSave}
				isSaving={isSaving}
				lastSaved={lastSaved}
				hasUnsavedChanges={hasUnsavedChanges}
			/>
			{toast && (
				<div role={toast.type === "error" ? "alert" : "status"} style={toastStyle(toast.type)}>
					{toast.text}
				</div>
			)}
		</div>
	);
}
