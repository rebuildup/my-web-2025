/**
 * Error state view for the Video & Design gallery.
 * Extracted from VideoDesignGallery.tsx to keep the main component small.
 */

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateViewProps {
	message: string;
	onRetry: () => void;
}

export function ErrorStateView({ message, onRetry }: ErrorStateViewProps) {
	return (
		<div className="space-y-8">
			<div className="   p-6 rounded-lg">
				<div className="flex items-center mb-4">
					<AlertTriangle className="w-6 h-6  mr-3" />
					<h2 className="zen-kaku-gothic-new text-lg " role="alert">
						Error Loading Gallery
					</h2>
				</div>
				<p className="noto-sans-jp-light text-sm  mb-4" role="alert">
					{message}
				</p>
				<button
					type="button"
					onClick={onRetry}
					className="flex items-center space-x-2 px-4 py-2"
				>
					<RefreshCw className="w-4 h-4" />
					<span>Retry</span>
				</button>
			</div>
		</div>
	);
}
