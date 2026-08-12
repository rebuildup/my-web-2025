import { adminColor } from "@/components/admin/ui/tokens";
import { appendGalleryItem, type MediaKind } from "./gallery-utils";

interface GallerySettingsProps {
	content?: string;
	columns: number;
	maxRows: number;
	readOnly?: boolean;
	onContentChange?: (content: string) => void;
	onAttributesChange?: (attributes: Record<string, unknown>) => void;
}

const MEDIA_KINDS: Array<{ kind: MediaKind; label: string }> = [
	{ kind: "image", label: "+ Image" },
	{ kind: "video", label: "+ Video" },
	{ kind: "audio", label: "+ Audio" },
	{ kind: "file", label: "+ File" },
];

const inputStyle: React.CSSProperties = {
	width: "100%",
	padding: "6px 8px",
	fontSize: 14,
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 4,
	backgroundColor: adminColor.bgPanel,
	color: adminColor.textPrimary,
	boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
	display: "block",
	fontSize: 12,
	color: adminColor.textSecondary,
	marginBottom: 2,
};

export function GallerySettings({
	content,
	columns,
	maxRows,
	readOnly,
	onContentChange,
	onAttributesChange,
}: GallerySettingsProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				flexWrap: "wrap",
				alignItems: "center",
				gap: 12,
			}}
		>
			<div style={{ width: 140 }}>
				<label style={labelStyle}>Columns</label>
				<input
					type="number"
					min={1}
					max={6}
					value={columns}
					onChange={(event) =>
						onAttributesChange?.({
							columns: Math.max(
								1,
								Math.min(6, Number(event.target.value ?? 3)),
							),
						})
					}
					style={inputStyle}
				/>
			</div>
			<div style={{ width: 140 }}>
				<label style={labelStyle}>Max rows</label>
				<input
					type="number"
					min={0}
					max={20}
					value={maxRows}
					onChange={(event) =>
						onAttributesChange?.({
							maxRows: Math.max(
								0,
								Math.min(20, Number(event.target.value ?? 0)),
							),
						})
					}
					style={inputStyle}
				/>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				{MEDIA_KINDS.map(({ kind, label }) => (
					<button
						key={kind}
						type="button"
						disabled={readOnly}
						onClick={() => onContentChange?.(appendGalleryItem(content, kind))}
						style={{
							padding: "6px 12px",
							fontSize: 14,
							border: `1px solid ${adminColor.borderInput}`,
							borderRadius: 4,
							backgroundColor: adminColor.bgPanel,
							color: adminColor.textPrimary,
							cursor: readOnly ? "not-allowed" : "pointer",
							opacity: readOnly ? 0.6 : 1,
						}}
					>
						{label}
					</button>
				))}
			</div>
		</div>
	);
}
