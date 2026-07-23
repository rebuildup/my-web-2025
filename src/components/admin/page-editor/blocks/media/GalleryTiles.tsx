import { Box, Link, Typography } from "@mui/material";
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
					<Box
						onMouseEnter={() => onAddHoverChange(true)}
						onMouseLeave={() => onAddHoverChange(false)}
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: (theme) => `1px dashed ${theme.palette.primary.main}`,
							bgcolor: "rgba(59,130,246,0.06)",
							color: "primary.main",
							borderRadius: 1.5,
							aspectRatio: "1 / 1",
							minHeight: 160,
							cursor: "pointer",
						}}
					>
						<Typography variant="body2">+ Add media</Typography>
					</Box>
				</div>
			)}
			{items.slice(0, visibleCount).map((item, idx) => (
				<div key={`${item.kind}-${item.url}`} className={colSpanClass}>
					<Box
						onClick={() => onSelect(idx)}
						sx={{
							border: (theme) =>
								`1px solid ${selected === idx ? theme.palette.primary.main : theme.palette.divider}`,
							boxShadow:
								selected === idx
									? (theme) => `0 0 0 2px ${theme.palette.primary.main}33 inset`
									: undefined,
							cursor: "pointer",
							borderRadius: 1.5,
							overflow: "hidden",
							bgcolor: "rgba(255,255,255,0.03)",
						}}
					>
						{item.kind === "image" && (
							<Box
								component="img"
								src={item.url}
								alt={item.label ?? ""}
								sx={{
									display: "block",
									width: "100%",
									height: 140,
									objectFit: "cover",
								}}
							/>
						)}
						{item.kind === "video" && (
							<Box
								component="video"
								src={item.url}
								controls
								sx={{
									display: "block",
									width: "100%",
									height: 140,
									objectFit: "cover",
								}}
							/>
						)}
						{item.kind === "audio" && (
							<Box sx={{ p: 1 }}>
								<audio src={item.url} controls style={{ width: "100%" }}>
									<track kind="captions" />
								</audio>
							</Box>
						)}
						{item.kind === "file" && (
							<Box sx={{ p: 1 }}>
								<Typography variant="caption" color="text.secondary">
									File
								</Typography>
								<Link
									href={item.url}
									target="_blank"
									rel="noreferrer"
									underline="hover"
									sx={{
										display: "block",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{item.label ?? item.url}
								</Link>
							</Box>
						)}
					</Box>
				</div>
			))}
		</div>
	);
}
