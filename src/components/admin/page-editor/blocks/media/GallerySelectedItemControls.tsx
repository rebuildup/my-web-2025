import { adminColor } from "@/components/admin/ui/tokens";
import { type ParsedGalleryItem, replaceGalleryLine } from "./gallery-utils";

interface GallerySelectedItemControlsProps {
	content?: string;
	item: ParsedGalleryItem;
	selected: number;
	onContentChange?: (content: string) => void;
}

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

export function GallerySelectedItemControls({
	content,
	item,
	selected,
	onContentChange,
}: GallerySelectedItemControlsProps) {
	const updateLine = (line: string) => {
		onContentChange?.(replaceGalleryLine(content, selected, line));
	};

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
			{item.kind === "image" && (
				<>
					<div style={{ flex: 1, minWidth: 200 }}>
						<label style={labelStyle}>URL</label>
						<input
							defaultValue={item.url}
							onBlur={(event) => updateLine(`[image] ${event.target.value}`)}
							style={inputStyle}
						/>
					</div>
					<div style={{ flex: 1, minWidth: 200 }}>
						<label style={labelStyle}>Alt (label)</label>
						<input
							defaultValue={item.label ?? ""}
							onBlur={(event) =>
								updateLine(
									`${event.target.value || item.url} | image | ${item.url}`,
								)
							}
							style={inputStyle}
						/>
					</div>
				</>
			)}
			{item.kind === "video" && (
				<div style={{ flex: 1, minWidth: 200 }}>
					<label style={labelStyle}>URL</label>
					<input
						defaultValue={item.url}
						onBlur={(event) => updateLine(`[video] ${event.target.value}`)}
						style={inputStyle}
					/>
				</div>
			)}
			{item.kind === "audio" && (
				<div style={{ flex: 1, minWidth: 200 }}>
					<label style={labelStyle}>URL</label>
					<input
						defaultValue={item.url}
						onBlur={(event) => updateLine(`[audio] ${event.target.value}`)}
						style={inputStyle}
					/>
				</div>
			)}
			{item.kind === "file" && (
				<>
					<div style={{ flex: 1, minWidth: 200 }}>
						<label style={labelStyle}>Name</label>
						<input
							defaultValue={item.label ?? ""}
							onBlur={(event) =>
								updateLine(
									`${event.target.value || item.url} | file | ${item.url}`,
								)
							}
							style={inputStyle}
						/>
					</div>
					<div style={{ flex: 1, minWidth: 200 }}>
						<label style={labelStyle}>URL</label>
						<input
							defaultValue={item.url}
							onBlur={(event) =>
								updateLine(
									`${item.label ?? ""} | file | ${event.target.value}`.trim(),
								)
							}
							style={inputStyle}
						/>
					</div>
				</>
			)}
		</div>
	);
}
