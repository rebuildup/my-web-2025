import Image from "next/image";
import { adminColor } from "@/components/admin/ui/tokens";
import {
	getGalleryColumnSpanClass,
	type ParsedGalleryItem,
} from "./gallery-utils";

interface GalleryTilesProps {
	items: ParsedGalleryItem[];
	visibleCount: number;
	columns: number;
	selected: number | null;
	readOnly?: boolean;
	onSelect: (index: number) => void;
	onAddHoverChange: (hovered: boolean) => void;
}

const addTileStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	border: `1px dashed ${adminColor.accent}`,
	backgroundColor: "rgba(59,130,246,0.06)",
	color: adminColor.accent,
	borderRadius: 6,
	aspectRatio: "1 / 1",
	minHeight: 160,
	cursor: "pointer",
};

const mediaTileStyle: React.CSSProperties = {
	borderRadius: 6,
	overflow: "hidden",
	backgroundColor: "rgba(255,255,255,0.03)",
	cursor: "pointer",
};

function getSelectedTileStyle(selected: boolean): React.CSSProperties {
	return {
		...mediaTileStyle,
		border: `1px solid ${selected ? adminColor.accent : adminColor.border}`,
		boxShadow: selected ? `0 0 0 2px ${adminColor.accent}33 inset` : undefined,
	};
}

const mediaPreviewStyle: React.CSSProperties = {
	display: "block",
	width: "100%",
	height: 140,
	objectFit: "cover",
};

export function GalleryTiles({
	items,
	visibleCount,
	columns,
	selected,
	readOnly,
	onSelect,
	onAddHoverChange,
}: GalleryTilesProps) {
	const colSpanClass = getGalleryColumnSpanClass(columns);

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
			{!readOnly && (
				<div className="col-span-1 sm:col-span-1 md:col-span-1">
					<button
						type="button"
						onMouseEnter={() => onAddHoverChange(true)}
						onMouseLeave={() => onAddHoverChange(false)}
						onClick={() => onAddHoverChange(false)}
						style={addTileStyle}
					>
						<span style={{ fontSize: 14 }}>+ Add media</span>
					</button>
				</div>
			)}
			{items.slice(0, visibleCount).map((item, idx) => {
				const isSelected = selected === idx;
				return (
					<div key={`${item.kind}-${item.url}`} className={colSpanClass}>
						<button
							type="button"
							onClick={() => onSelect(idx)}
							style={getSelectedTileStyle(isSelected)}
							aria-pressed={isSelected}
						>
							{item.kind === "image" && (
								<Image
									src={item.url}
									alt={item.label ?? ""}
									unoptimized
									width={400}
									height={140}
									style={mediaPreviewStyle}
								/>
							)}
							{item.kind === "video" && (
								<video src={item.url} controls style={mediaPreviewStyle} />
							)}
							{item.kind === "audio" && (
								<div style={{ padding: 8 }}>
									<audio src={item.url} controls style={{ width: "100%" }}>
										<track kind="captions" />
									</audio>
								</div>
							)}
							{item.kind === "file" && (
								<div style={{ padding: 8 }}>
									<p
										style={{
											fontSize: 12,
											color: adminColor.textSecondary,
											margin: 0,
										}}
									>
										File
									</p>
									<a
										href={item.url}
										target="_blank"
										rel="noreferrer"
										style={{
											display: "block",
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											color: adminColor.accent,
											textDecoration: "underline",
										}}
									>
										{item.label ?? item.url}
									</a>
								</div>
							)}
						</button>
					</div>
				);
			})}
		</div>
	);
}
