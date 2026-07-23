/**
 * Loading state view for the Video & Design gallery.
 * Extracted from VideoDesignGallery.tsx to keep the main component small.
 */

export function LoadingView() {
	return (
		<div className="space-y-8">
			<div className="/30 p-4">
				<div className="flex items-center mb-4">
					<h2 className="zen-kaku-gothic-new text-lg ">Loading...</h2>
				</div>
			</div>
		</div>
	);
}
