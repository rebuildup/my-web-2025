/**
 * Empty state view for the Video & Design gallery.
 * Extracted from VideoDesignGallery.tsx to keep the main component small.
 */

import { Eye } from "lucide-react";

export function EmptyStateView() {
	return (
		<div className="text-center py-12">
			<div className="/30 p-8">
				<Eye className="w-12 h-12  mx-auto mb-4" />
				<h2 className="zen-kaku-gothic-new text-xl mb-2">No projects found</h2>
				<p className="noto-sans-jp-light text-sm ">
					No video & design projects available.
				</p>
			</div>
		</div>
	);
}
