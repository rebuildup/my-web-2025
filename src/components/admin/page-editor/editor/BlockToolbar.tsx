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

const sectionStyle: React.CSSProperties = {
	padding: 0,
	backgroundColor: "transparent",
};

const rowStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	maxWidth: 768,
	margin: "0 auto",
	width: "100%",
	gap: 16,
};

const statusRowStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "row",
	alignItems: "center",
	gap: 16,
};

const statusLabelStyle: React.CSSProperties = {
	display: "block",
	fontSize: 14,
	fontWeight: 600,
	color: adminColor.textPrimary,
};

const savedLabelStyle: React.CSSProperties = {
	display: "block",
	fontSize: 12,
	color: adminColor.textSecondary,
};

const draftBadgeStyle: React.CSSProperties = {
	display: "inline-block",
	fontSize: 12,
	padding: "2px 8px",
	border: `1px solid ${adminColor.warning}`,
	color: adminColor.warning,
	borderRadius: 12,
};

const saveButtonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	padding: "8px 16px",
	fontSize: 14,
	backgroundColor: adminColor.accent,
	color: "#fff",
	border: "none",
	borderRadius: 4,
};

function getSaveButtonStyle(disabled: boolean): React.CSSProperties {
	return {
		...saveButtonStyle,
		cursor: disabled ? "not-allowed" : "pointer",
		opacity: disabled ? 0.6 : 1,
	};
}

const progressTrackStyle: React.CSSProperties = {
	marginTop: 16,
	height: 4,
	width: "100%",
	backgroundColor: adminColor.accentHover,
	borderRadius: 2,
	overflow: "hidden",
};

const progressBarStyle: React.CSSProperties = {
	height: "100%",
	width: "40%",
	backgroundColor: adminColor.accent,
};

function getStatusColor(isSaving: boolean, hasUnsavedChanges: boolean): string {
	if (isSaving) return adminColor.textSecondary;
	if (hasUnsavedChanges) return adminColor.warning;
	return adminColor.success;
}

function getStatusLabel(isSaving: boolean, hasUnsavedChanges: boolean): string {
	if (isSaving) return "Saving...";
	if (hasUnsavedChanges) return "Unsaved changes";
	return "All changes saved";
}

export function BlockToolbar({
	onSave,
	isSaving = false,
	lastSaved,
	hasUnsavedChanges = false,
}: BlockToolbarProps) {
	const statusLabel = getStatusLabel(isSaving, hasUnsavedChanges);
	const statusColor = getStatusColor(isSaving, hasUnsavedChanges);
	const saveDisabled = !hasUnsavedChanges || isSaving || !onSave;

	return (
		<section style={sectionStyle}>
			<div style={rowStyle}>
				<div style={statusRowStyle}>
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
						<span style={statusLabelStyle}>{statusLabel}</span>
						{lastSaved && (
							<span style={savedLabelStyle}>
								Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
							</span>
						)}
					</div>
					{hasUnsavedChanges && !isSaving && (
						<span style={draftBadgeStyle}>Draft</span>
					)}
				</div>
				<button
					type="button"
					disabled={saveDisabled}
					onClick={() => onSave?.()}
					style={getSaveButtonStyle(saveDisabled)}
				>
					{!isSaving && <Save size={16} />}
					{isSaving ? "Saving..." : "Save now"}
				</button>
			</div>
			{isSaving && (
				<div style={progressTrackStyle}>
					<div style={progressBarStyle} />
				</div>
			)}
		</section>
	);
}
