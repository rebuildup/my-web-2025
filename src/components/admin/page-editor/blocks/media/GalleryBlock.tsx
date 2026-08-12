"use client";

import { useMemo, useState } from "react";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";
import { GalleryAddControls } from "./GalleryAddControls";
import { GallerySelectedItemControls } from "./GallerySelectedItemControls";
import { GallerySettings } from "./GallerySettings";
import { GalleryTiles } from "./GalleryTiles";
import {
	getVisibleGalleryItemCount,
	parseGalleryContent,
} from "./gallery-utils";

export function GalleryBlock({
	block,
	readOnly,
	onContentChange,
	onAttributesChange,
}: BlockComponentProps) {
	const items = useMemo(
		() => parseGalleryContent(block.content ?? ""),
		[block.content],
	);
	const [selected, setSelected] = useState<number | null>(null);
	const [addHovered, setAddHovered] = useState(false);
	const columns = Number(block.attributes.columns ?? 3);
	const maxRows = Number(block.attributes.maxRows ?? 0);
	const visibleCount = useMemo(
		() => getVisibleGalleryItemCount(items.length, maxRows, columns),
		[items.length, maxRows, columns],
	);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div
				className="block-gallery"
				style={{
					position: "relative",
					paddingBottom: 0,
					transition: "padding-bottom 150ms ease",
				}}
			>
				<GalleryTiles
					items={items}
					visibleCount={visibleCount}
					columns={columns}
					selected={selected}
					readOnly={readOnly}
					onSelect={setSelected}
					onAddHoverChange={setAddHovered}
				/>
				<div
					className="gallery-controls"
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						opacity: 0,
						pointerEvents: "none",
						transition: "opacity 120ms ease",
					}}
				>
					<div
						style={{
							border: `1px solid ${adminColor.border}`,
							borderRadius: 4,
							padding: 8,
							backgroundColor: "rgba(0,0,0,0.35)",
						}}
					>
						<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
							{!readOnly && addHovered && (
								<GalleryAddControls
									content={block.content}
									itemCount={items.length}
									onContentChange={onContentChange}
									onSelect={setSelected}
								/>
							)}
							<GallerySettings
								content={block.content}
								columns={columns}
								maxRows={maxRows}
								readOnly={readOnly}
								onContentChange={onContentChange}
								onAttributesChange={onAttributesChange}
							/>
							{selected !== null && items[selected] && (
								<GallerySelectedItemControls
									content={block.content}
									item={items[selected]}
									selected={selected}
									onContentChange={onContentChange}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
