/**
 * Grid item tile component for the Video & Design gallery.
 * Extracted from VideoDesignGallery.tsx (along with the EnhancedGridItem
 * type, which describes the shape produced by the useVideoDesignItems hook).
 */

import { Palette, Video } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import {
	getGridItemClasses,
	getGridItemMinHeight,
} from "@/lib/portfolio/grid-layout-utils";
import type { GridItem } from "@/lib/portfolio/grid-layout-utils";
import type { EnhancedCategoryType } from "@/types/enhanced-content";

export interface EnhancedGridItem extends GridItem {
	categories?: EnhancedCategoryType[];
	randomOffset?: number;
	description?: string;
	createdAt: string;
	images?: string[];
}

interface GridItemComponentProps {
	item: EnhancedGridItem;
	onHover: (id: string | null) => void;
}

export function GridItemComponentV2({ item, onHover }: GridItemComponentProps) {
	const [imageError, setImageError] = useState(false);

	// Get the best available thumbnail image
	const thumbnailSrc =
		item.thumbnail ||
		(item.images && item.images.length > 0 ? item.images[0] : null) ||
		"/images/portfolio/default-thumb.jpg";
	const handleImageError = useCallback(() => {
		if (
			process.env.NODE_ENV !== "production" &&
			process.env.NODE_ENV !== "test"
		) {
			console.error("Image failed to load:", thumbnailSrc);
		}
		setImageError(true);
	}, [thumbnailSrc]);

	const handleImageLoad = useCallback(() => {
		setImageError(false);
	}, []);

	const gridClasses = getGridItemClasses(item.gridSize);
	const minHeightClass = getGridItemMinHeight(item.gridSize);
	const overlayClasses = "px-2 py-[1px]   rounded-[4px]";

	// Debug: Log the classes being applied
	console.log("Grid classes for item:", item.id, gridClasses);
	console.log("Item thumbnail:", item.thumbnail);
	console.log("Item images:", item.images);
	console.log("Resolved thumbnail src:", thumbnailSrc);
	console.log("Image error state:", imageError);
	console.log(
		"Item createdAt:",
		item.createdAt,
		"Type:",
		typeof item.createdAt,
	);

	console.log("Component updated");

	// Check if this is a placeholder item
	const isPlaceholder = item.category === "placeholder";

	// Enhanced hover effects are now handled via CSS classes for better performance

	// For placeholder items, render a simple black box
	if (isPlaceholder) {
		return (
			<div
				className={`${gridClasses} ${minHeightClass} min-h-[200px] `}
				style={{
					display: "block",
					position: "relative",
				}}
			/>
		);
	}

	return (
		<Link
			href={item.url}
			// isolation keeps the overlay and image within the same stacking context
			className={`${gridClasses} ${minHeightClass} video-design-gallery-item group block relative  overflow-hidden hover:/50 transition-colors    min-h-[200px]  isolate`}
			onMouseEnter={() => onHover(item.id)}
			onMouseLeave={() => onHover(null)}
			onFocus={() => onHover(item.id)}
			onBlur={() => onHover(null)}
		>
			{/* Image Container - タイル全面にフィットさせる（親のminHeightに追従） */}
			<div
				className="gallery-image-container absolute inset-0 overflow-hidden"
				style={{ zIndex: 0 }}
			>
				{thumbnailSrc && !imageError ? (
					<div
						className="absolute inset-0 overflow-hidden"
						style={{ borderRadius: "6px" }}
					>
						<SafeImage
							src={thumbnailSrc}
							alt={item.title || "Portfolio item"}
							fill
							className="gallery-image object-cover object-center"
							style={{
								objectFit: "cover",
								objectPosition: "center center",
								width: "100%",
								height: "100%",
								borderRadius: "6px",
							}}
							loading="lazy"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							onLoad={handleImageLoad}
							onError={handleImageError}
						/>
					</div>
				) : (
					<div className="absolute inset-0 flex items-center justify-center  bg-opacity-10">
						<div className="text-center ">
							<Palette className="w-8 h-8 mx-auto mb-2" />
							<span className="text-xs">No Image</span>
						</div>
					</div>
				)}
			</div>

			{/* Content Overlay */}
			<div className="gallery-text-overlay absolute inset-0 p-2 flex flex-col justify-end z-10">
				<div
					className={`${overlayClasses} inline-flex w-fit flex-col gap-0  transition-opacity duration-200  group-focus-within:`}
				>
					{/* Row: icons + title inline */}
					<div className="flex items-center gap-1 leading-none">
						<div className="flex items-center gap-1">
							{item.categories?.includes("video") && (
								<Video className="w-4 h-4" />
							)}
							{item.categories?.includes("design") && (
								<Palette className="w-4 h-4" />
							)}
						</div>
						<h3 className="zen-kaku-gothic-new text-sm font-medium leading-tight line-clamp-1">
							{item.title}
						</h3>
					</div>

					{/* Description (optional) */}
					{item.description && (
						<p className="noto-sans-jp-light text-xs leading-snug line-clamp-2">
							{item.description}
						</p>
					)}

					{/* Row: published date at right */}
					<div className="flex items-center justify-end mt-0">
						<span className="text-[11px] leading-none">
							{(() => {
								const baseDate =
									(item as any).publishedAt ||
									(item as any).updatedAt ||
									item.createdAt;
								const d = baseDate ? new Date(baseDate) : null;
								return d && !Number.isNaN(d.getTime())
									? d.toLocaleDateString("ja-JP", {
											year: "numeric",
											month: "2-digit",
											day: "2-digit",
										})
									: "";
							})()}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
}
