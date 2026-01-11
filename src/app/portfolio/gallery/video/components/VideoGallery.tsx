"use client";

/**
 * Video Gallery Component
 * Task 4.2: Gallery performance optimization - never load markdown files
 *
 * Gallery Performance Rules:
 * - NEVER load markdown files for gallery display
 * - Only display essential information (title, description, thumbnail, category, tags)
 * - Maintain consistent performance with large datasets
 * - Use item.description or item.content (legacy) but never markdown content
 */

import { Calendar, Play, Video as VideoIcon } from "lucide-react";
import { useState } from "react";
import GlowCard from "@/components/ui/GlowCard";
import { SafeImage } from "@/components/ui/SafeImage";
import type { ContentItem } from "@/types";
import VideoDetailPanel from "./VideoDetailPanel";
import YouTubeThumbnail from "./YouTubeThumbnail";

interface VideoGalleryProps {
	items: ContentItem[];
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
		/youtube\.com\/shorts\/([^&\n?#]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

export default function VideoGallery({ items }: VideoGalleryProps) {
	const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
	const [isPanelOpen, setIsPanelOpen] = useState(false);

	const handleItemClick = (item: ContentItem) => {
		setSelectedItem(item);
		setIsPanelOpen(true);
	};

	const handleClosePanel = () => {
		setIsPanelOpen(false);
		setSelectedItem(null);
	};

	if (items.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="noto-sans-jp-light text-main">映像作品がありません.</p>
			</div>
		);
	}

	return (
		<>
			{/* foriio-like beautiful layout */}
			<div className="mx-auto w-full px-0 sm:px-0 lg:px-0">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-stretch">
					{items.map((item) => {
						const youtubeVideo = item.videos?.find((v) => v.type === "youtube");
						const videoId = youtubeVideo
							? getYouTubeVideoId(youtubeVideo.url)
							: null;

						return (
							<button
								key={item.id}
								className="group cursor-pointer text-left w-full"
								type="button"
								onClick={() => handleItemClick(item)}
							>
								{/* Video Thumbnail */}
								<GlowCard className="group cursor-pointer text-left block bg-base/30 backdrop-blur overflow-hidden mb-4">
									<div className="aspect-video relative overflow-hidden rounded-md">
										{item.thumbnail ? (
											<SafeImage
												src={item.thumbnail}
												alt={item.title}
												fill
												sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
												className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
												style={{ objectPosition: "center center" }}
												showDebug={false}
											/>
										) : videoId ? (
											<YouTubeThumbnail
												videoId={videoId}
												alt={item.title}
												fallbackSrc={youtubeVideo?.thumbnail}
												className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
												style={{ objectPosition: "center center" }}
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<VideoIcon className="w-12 h-12 text-main opacity-50" />
											</div>
										)}

										{/* Play Overlay */}
										<div
											className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
											aria-hidden="true"
										>
											<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
												<Play className="w-12 h-12 text-white drop-shadow-lg" />
											</div>
										</div>
									</div>
								</GlowCard>

								{/* Video Info */}
								<div className="space-y-3">
									<h3 className="zen-kaku-gothic-new text-lg text-main group-hover:text-accent transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
										{item.title}
									</h3>

									{/* Description - 1-line truncation */}
									<p className="noto-sans-jp-light text-sm text-main whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
										{item.description}
									</p>

									{/* Tags - moved above date (Requirement 5.2) */}
									{item.tags && item.tags.length > 0 && (
										<div className="flex items-center justify-between">
											<div className="flex flex-nowrap gap-1.5 overflow-hidden">
												{item.tags.slice(0, 3).map((tag) => (
													<span
														key={tag}
														className="noto-sans-jp-light text-xs text-main/90 px-3 py-1 bg-main/10 rounded-full whitespace-nowrap shrink-0"
													>
														{tag}
													</span>
												))}
												{item.tags.length > 3 && (
													<span className="noto-sans-jp-light text-xs text-main/90 px-3 py-1 bg-main/10 rounded-full tag-overflow-indicator">
														+{item.tags.length - 3}
													</span>
												)}
											</div>
											<div className="flex items-center gap-2 text-xs">
												<Calendar className="w-4 h-4 text-main/70" />
												<span className="noto-sans-jp-light text-main/70">
													{new Date(
														(item as any).publishedAt ||
															item.updatedAt ||
															item.createdAt,
													).toLocaleDateString("ja-JP")}
												</span>
											</div>
										</div>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Detail Panel */}
			<VideoDetailPanel
				item={selectedItem}
				isOpen={isPanelOpen}
				onClose={handleClosePanel}
			/>
		</>
	);
}
