"use client";

import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { isEnhancedContentItem } from "@/types";
import { ContentItem, MediaEmbed } from "@/types/content";
import { EnhancedContentItem } from "@/types/enhanced-content";
import { useState } from "react";

interface PreviewPanelProps {
	item: ContentItem | EnhancedContentItem;
	onEdit: () => void;
}

export function PreviewPanel({ item, onEdit }: PreviewPanelProps) {
	const [previewMode, setPreviewMode] = useState<
		"desktop" | "tablet" | "mobile"
	>("desktop");
	const [showVideoEmbeds, setShowVideoEmbeds] = useState<boolean>(true);
	const [individualVideoStates, setIndividualVideoStates] = useState<
		Record<number, boolean>
	>({});

	// YouTube動画IDを抽出する関数
	const extractYouTubeId = (url: string): string | null => {
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
			/youtube\.com\/watch\?.*v=([^&\n?#]+)/,
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) return match[1];
		}
		return null;
	};

	// Vimeo動画IDを抽出する関数
	const extractVimeoId = (url: string): string | null => {
		const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
		return match ? match[1] : null;
	};

	// 個別の動画表示状態を取得する関数
	const isVideoVisible = (index: number): boolean => {
		return showVideoEmbeds && individualVideoStates[index] !== false;
	};

	// 個別の動画表示状態を切り替える関数
	const toggleIndividualVideo = (index: number) => {
		setIndividualVideoStates((prev) => ({
			...prev,
			[index]: !isVideoVisible(index),
		}));
	};

	// 動画のサムネイル画像を取得する関数
	const getVideoThumbnail = (video: MediaEmbed): string | null => {
		if (video.thumbnail) return video.thumbnail;

		switch (video.type) {
			case "youtube": {
				const videoId = extractYouTubeId(video.url);
				return videoId
					? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
					: null;
			}
			case "vimeo": {
				// Vimeoのサムネイルは別途APIが必要なので、デフォルトを返す
				return null;
			}
			default:
				return null;
		}
	};

	// 動画の埋め込みコンポーネントを生成する関数
	const renderVideoEmbed = (video: MediaEmbed, index: number) => {
		const aspectRatio = "aspect-video"; // 16:9のアスペクト比

		switch (video.type) {
			case "youtube": {
				const videoId = extractYouTubeId(video.url);
				if (!videoId) {
					return (
						<div className="bg-red-50 border border-red-200 p-4 rounded">
							<p className="text-red-600 text-sm">
								Invalid YouTube URL: {video.url}
							</p>
						</div>
					);
				}

				return (
					<div className={`${aspectRatio} bg-black rounded overflow-hidden`}>
						<iframe
							src={`https://www.youtube.com/embed/${videoId}`}
							title={video.title || `YouTube Video ${index + 1}`}
							className="w-full h-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							loading="lazy"
						/>
					</div>
				);
			}

			case "vimeo": {
				const videoId = extractVimeoId(video.url);
				if (!videoId) {
					return (
						<div className="bg-red-50 border border-red-200 p-4 rounded">
							<p className="text-red-600 text-sm">
								Invalid Vimeo URL: {video.url}
							</p>
						</div>
					);
				}

				return (
					<div className={`${aspectRatio} bg-black rounded overflow-hidden`}>
						<iframe
							src={`https://player.vimeo.com/video/${videoId}`}
							title={video.title || `Vimeo Video ${index + 1}`}
							className="w-full h-full"
							allow="autoplay; fullscreen; picture-in-picture"
							allowFullScreen
							loading="lazy"
						/>
					</div>
				);
			}

			case "iframe": {
				return (
					<div className={`${aspectRatio} bg-gray-100 rounded overflow-hidden`}>
						<iframe
							src={video.url}
							title={video.title || `Embedded Content ${index + 1}`}
							className="w-full h-full"
							sandbox="allow-scripts allow-same-origin allow-presentation"
							loading="lazy"
						/>
					</div>
				);
			}

			default: {
				return (
					<div className="bg-gray-50 border border-gray-200 p-4 rounded">
						<div className="flex justify-between items-start mb-2">
							<span className="font-medium text-sm">
								{video.title || "Untitled Video"}
							</span>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
								{video.type}
							</span>
						</div>
						<a
							href={video.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-blue-600 hover:underline block mb-2"
						>
							{video.url}
						</a>
						{video.description && (
							<p className="text-xs text-gray-600">{video.description}</p>
						)}
					</div>
				);
			}
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "published":
				return "bg-green-100 text-green-800";
			case "draft":
				return "bg-yellow-100 text-yellow-800";
			case "archived":
				return "bg-gray-100 text-gray-800";
			case "scheduled":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getPreviewWidth = () => {
		switch (previewMode) {
			case "mobile":
				return "max-w-sm";
			case "tablet":
				return "max-w-2xl";
			default:
				return "max-w-full";
		}
	};

	const buttonStyle =
		"border border-main px-3 py-1 text-xs hover:bg-main hover:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base";
	const activeButtonStyle =
		"border border-main px-3 py-1 text-xs bg-main text-base focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base";

	return (
		<div className="space-y-6">
			{/* Preview Controls */}
			<div className="flex justify-between items-center">
				<div className="flex gap-2">
					<button type="button"
						onClick={() => setPreviewMode("desktop")}
						className={
							previewMode === "desktop" ? activeButtonStyle : buttonStyle
						}
					>
						Desktop
					</button>
					<button type="button"
						onClick={() => setPreviewMode("tablet")}
						className={
							previewMode === "tablet" ? activeButtonStyle : buttonStyle
						}
					>
						Tablet
					</button>
					<button type="button"
						onClick={() => setPreviewMode("mobile")}
						className={
							previewMode === "mobile" ? activeButtonStyle : buttonStyle
						}
					>
						Mobile
					</button>
				</div>

				<button type="button" onClick={onEdit} className={buttonStyle}>
					Edit
				</button>
			</div>

			{/* Preview Content */}
			<div
				className={`mx-auto ${getPreviewWidth()} transition-all duration-300`}
			>
				<div className="border border-gray-300 bg-white shadow-lg">
					{/* Preview Header */}
					<div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
						<div className="flex justify-between items-center text-xs text-gray-600">
							<span>Preview Mode: {previewMode}</span>
							<span>Type: {item.type}</span>
						</div>
					</div>

					{/* Content Preview */}
					<div className="p-6 space-y-6">
						{/* Title and Status */}
						<div className="space-y-2">
							<div className="flex justify-between items-start">
								<h1 className="neue-haas-grotesk-display text-2xl text-main leading-snug">
									{item.title || "Untitled"}
								</h1>
								<span
									className={`px-2 py-1 text-xs rounded ${getStatusColor(item.status)}`}
								>
									{item.status}
								</span>
							</div>

							{item.description && (
								<p className="noto-sans-jp-light text-xs pb-2 text-gray-600 leading-relaxed">
									{item.description}
								</p>
							)}
						</div>

						{/* Metadata */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							{item.category && (
								<div>
									<span className="noto-sans-jp-regular font-medium text-main">
										Category:
									</span>
									<span className="ml-2 text-gray-600">{item.category}</span>
								</div>
							)}

							<div>
								<span className="noto-sans-jp-regular font-medium text-main">
									Priority:
								</span>
								<span className="ml-2 text-gray-600">{item.priority}/100</span>
							</div>

							<div>
								<span className="noto-sans-jp-regular font-medium text-main">
									Created:
								</span>
								<span className="ml-2 text-gray-600">
									{formatDate(item.createdAt)}
								</span>
							</div>

							{item.updatedAt && (
								<div>
									<span className="noto-sans-jp-regular font-medium text-main">
										Updated:
									</span>
									<span className="ml-2 text-gray-600">
										{formatDate(item.updatedAt)}
									</span>
								</div>
							)}
						</div>

						{/* Tags */}
						{item.tags.length > 0 && (
							<div>
								<h3 className="font-medium text-gray-700 mb-2">Tags</h3>
								<div className="flex flex-wrap gap-2">
									{item.tags.map((tag) => (
										<span
											key={`${item.id}-tag-${tag}`}
											className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Images */}
						{item.images && item.images.length > 0 && (
							<div>
								<h3 className="font-medium text-gray-700 mb-2">Images</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
									{item.images.map((image, index) => (
										<div
											key={image}
											className="aspect-square bg-gray-100 border border-gray-200 rounded overflow-hidden"
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={image}
												alt={`Image ${index + 1}`}
												className="w-full h-full object-cover"
												onError={(e) => {
													(e.target as HTMLImageElement).src =
														"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTk5OTkiPkltYWdlPC90ZXh0Pjwvc3ZnPg==";
												}}
											/>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Videos */}
						{item.videos && item.videos.length > 0 && (
							<div>
								<div className="flex justify-between items-center mb-4">
									<h3 className="font-medium text-gray-700">Videos</h3>
									<button type="button"
										onClick={() => setShowVideoEmbeds(!showVideoEmbeds)}
										className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
									>
										{showVideoEmbeds ? "Hide Embeds" : "Show Embeds"}
									</button>
								</div>
								<div className="space-y-6">
									{item.videos.map((video, index) => (
										<div
											key={video.url || `video-${index}`}
											className="border border-gray-200 rounded-lg p-4 space-y-3"
										>
											{/* Video Header */}
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h4 className="font-medium text-sm text-gray-800 mb-1">
														{video.title || `Video ${index + 1}`}
													</h4>
													{video.description && (
														<p className="text-xs text-gray-600 mb-2">
															{video.description}
														</p>
													)}
												</div>
												<div className="flex items-center gap-2 ml-4">
													<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
														{video.type}
													</span>
													<a
														href={video.url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
														title="Open in new tab"
													>
														↗
													</a>
												</div>
											</div>

											{/* Video Embed */}
											<div className="relative">
												{isVideoVisible(index) ? (
													renderVideoEmbed(video, index)
												) : (
													<div
														className="aspect-video bg-gray-100 border border-gray-200 rounded overflow-hidden relative group cursor-pointer"
														onClick={() => toggleIndividualVideo(index)}
													>
														{getVideoThumbnail(video) ? (
															<div className="relative w-full h-full">
																{/* eslint-disable-next-line @next/next/no-img-element */}
																<img
																	src={getVideoThumbnail(video)!}
																	alt={video.title || "Video thumbnail"}
																	className="w-full h-full object-cover"
																	onError={(e) => {
																		(
																			e.target as HTMLImageElement
																		).style.display = "none";
																	}}
																/>
																<div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
																	<div className="text-white text-center">
																		<svg
																			className="w-16 h-16 mx-auto mb-2"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																		>
																			<path
																				fillRule="evenodd"
																				d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
																				clipRule="evenodd"
																			/>
																		</svg>
																		<p className="text-sm font-medium">
																			Click to load embed
																		</p>
																	</div>
																</div>
															</div>
														) : (
															<div className="flex items-center justify-center h-full">
																<div className="text-center">
																	<div className="text-gray-400 mb-2">
																		<svg
																			className="w-12 h-12 mx-auto"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																		>
																			<path
																				fillRule="evenodd"
																				d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
																				clipRule="evenodd"
																			/>
																		</svg>
																	</div>
																	<p className="text-xs text-gray-500 mb-1">
																		Video embed hidden
																	</p>
																	<p className="text-xs text-blue-600 hover:underline">
																		Click to show embed
																	</p>
																</div>
															</div>
														)}
													</div>
												)}
											</div>

											{/* Video URL */}
											<div className="text-xs text-gray-500 truncate">
												<span className="font-medium">URL: </span>
												<span>{video.url}</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* External Links */}
						{item.externalLinks && item.externalLinks.length > 0 && (
							<div>
								<h3 className="font-medium text-gray-700 mb-2">
									External Links
								</h3>
								<div className="space-y-2">
									{item.externalLinks.map((link, index) => (
										<div
											key={link.url || `external-link-${index}`}
											className="border border-gray-200 p-3 rounded"
										>
											<div className="flex justify-between items-start mb-1">
												<span className="font-medium text-sm">
													{link.title}
												</span>
												<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
													{link.type}
												</span>
											</div>
											<a
												href={link.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-blue-600 hover:underline block mb-1"
											>
												{link.url}
											</a>
											{link.description && (
												<p className="text-xs text-gray-600">
													{link.description}
												</p>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						{/* Content - Markdown or plain text */}
						{(item.content ||
							(isEnhancedContentItem(item) && item.markdownPath)) && (
							<div>
								<h3 className="font-medium text-gray-700 mb-2">Content</h3>
								<div className="bg-gray-50 border border-gray-200 p-4 rounded">
									{isEnhancedContentItem(item) && item.markdownPath ? (
										<MarkdownRenderer
											filePath={item.markdownPath}
											mediaData={{
												images: item.images || [],
												videos: (item.videos || []).map((video) => ({
													...video,
													title: video.title || `Video ${video.url}`,
												})),
												externalLinks: item.externalLinks || [],
											}}
											className="prose prose-sm max-w-none text-gray-700"
											fallbackContent={item.content || "Content not available"}
										/>
									) : item.content ? (
										<pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
											{item.content}
										</pre>
									) : null}
								</div>
							</div>
						)}

						{/* Download Info */}
						{item.downloadInfo && (
							<div>
								<h3 className="font-medium text-gray-700 mb-2">
									Download Information
								</h3>
								<div className="bg-gray-50 border border-gray-200 p-4 rounded space-y-2">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="font-medium">File:</span>
											<span className="ml-2">{item.downloadInfo.fileName}</span>
										</div>
										<div>
											<span className="font-medium">Size:</span>
											<span className="ml-2">
												{(item.downloadInfo.fileSize / 1024 / 1024).toFixed(2)}{" "}
												MB
											</span>
										</div>
										<div>
											<span className="font-medium">Type:</span>
											<span className="ml-2">{item.downloadInfo.fileType}</span>
										</div>
										<div>
											<span className="font-medium">Downloads:</span>
											<span className="ml-2">
												{item.downloadInfo.downloadCount}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* SEO Information */}
						{item.seo && (
							<div>
								<h3 className="font-medium text-gray-700 mb-2">
									SEO Information
								</h3>
								<div className="bg-gray-50 border border-gray-200 p-4 rounded space-y-2">
									{item.seo.title && (
										<div>
											<span className="font-medium text-sm">Title:</span>
											<span className="ml-2 text-sm">{item.seo.title}</span>
										</div>
									)}
									{item.seo.description && (
										<div>
											<span className="font-medium text-sm">Description:</span>
											<span className="ml-2 text-sm">
												{item.seo.description}
											</span>
										</div>
									)}
									{item.seo.keywords && item.seo.keywords.length > 0 && (
										<div>
											<span className="font-medium text-sm">Keywords:</span>
											<span className="ml-2 text-sm">
												{item.seo.keywords.join(", ")}
											</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
