"use client";

import { Box, Stack } from "@mui/material";
import { useMemo, useState } from "react";
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
		<Stack spacing={1.5}>
			<Box
				sx={{
					position: "relative",
					pb: 0,
					transition: "padding-bottom 150ms ease",
					"&:hover": { pb: 14 },
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
				<Box
					className="gallery-controls"
					sx={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						opacity: 0,
						pointerEvents: "none",
						transition: "opacity 120ms ease",
					}}
				>
					<Box
						sx={{
							border: (theme) => `1px solid ${theme.palette.divider}`,
							borderRadius: 1,
							p: 1,
							bgcolor: "rgba(0,0,0,0.35)",
						}}
					>
						<Stack spacing={1.5}>
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
						</Stack>
					</Box>
				</Box>
			</Box>
		</Stack>
	);
}
