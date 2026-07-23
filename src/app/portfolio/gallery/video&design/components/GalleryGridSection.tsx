/**
 * Gallery grid section for the Video & Design gallery.
 * Renders the masonry-style grid of GridItemComponentV2 tiles.
 * Extracted from VideoDesignGallery.tsx.
 */

import { GridItemComponentV2 } from "./GridItemComponentV2";
import type { EnhancedGridItem } from "./GridItemComponentV2";

interface GalleryGridSectionProps {
	gridItems: EnhancedGridItem[];
}

export function GalleryGridSection({ gridItems }: GalleryGridSectionProps) {
	return (
		<section aria-label="Projects Grid">
			<h2 className="sr-only">Projects Grid</h2>
			<div
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
				style={{ gridAutoRows: "minmax(200px, auto)" }}
			>
				{gridItems.map((item) => (
					<GridItemComponentV2 key={item.id} item={item} onHover={() => {}} />
				))}
			</div>
		</section>
	);
}
