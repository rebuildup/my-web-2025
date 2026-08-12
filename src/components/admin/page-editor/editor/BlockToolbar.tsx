"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CloudCheck, Loader2, Save } from "lucide-react";
import { adminColor } from "@/components/admin/ui/tokens";

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

	const statusColor = isSaving
		? adminColor.textSecondary
		: hasUnsavedChanges
			? adminColor.warning
			: adminColor.success;

	return (
		<section
			style={{
				padding: 0,
				backgroundColor: "transparent",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					maxWidth: 768,
					margin: "0 auto",
					width: "100%",
					gap: 16,
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						gap: 16,
					}}
				>
					{isSaving ? (
						<Loader2 size={20} color={adminColor.textSecondary} />
					) : (
						<div style={{ color: statusColor, display: "inline-flex" }}>
							{hasUnsavedChanges ? (
								<AlertTriangle size={20} />
							) : (
								<CloudCheck size={20} />
							)}
						</div>
					)}
					<div>
						<span
							style={{
								display: "block",
								fontSize: 14,
								fontWeight: 600,
								color: adminColor.textPrimary,
							}}
						>
							{statusLabel}
						</span>
						{lastSaved && (
							<span
								style={{
									display: "block",
									fontSize: 12,
									color: adminColor.textSecondary,
								}}
							>
								Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
							</span>
						)}
					</div>
					{hasUnsavedChanges && !isSaving && (
						<span
							style={{
								display: "inline-block",
								fontSize: 12,
								padding: "2px 8px",
								border: `1px solid ${adminColor.warning}`,
								color: adminColor.warning,
								borderRadius: 12,
							}}
						>
							Draft
						</span>
					)}
				</div>
				<button
					type="button"
					disabled={!hasUnsavedChanges || isSaving || !onSave}
					onClick={() => onSave?.()}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 8,
						padding: "8px 16px",
						fontSize: 14,
						backgroundColor: adminColor.accent,
						color: "#fff",
						border: "none",
						borderRadius: 4,
						cursor:
							!hasUnsavedChanges || isSaving || !onSave
								? "not-allowed"
								: "pointer",
						opacity: !hasUnsavedChanges || isSaving || !onSave ? 0.6 : 1,
					}}
				>
					{!isSaving && <Save size={16} />}
					{isSaving ? "Saving..." : "Save now"}
				</button>
			</div>
			{isSaving && (
				<div
					style={{
						marginTop: 16,
						height: 4,
						width: "100%",
						backgroundColor: adminColor.accentHover,
						borderRadius: 2,
						overflow: "hidden",
					}}
				>
					<div
						style={{
							height: "100%",
							width: "40%",
							backgroundColor: adminColor.accent,
						}}
					/>
				</div>
			)}
		</section>
	);
}
