"use client";

import { Calendar, ExternalLink, Play, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import type { ContentItem, EnhancedContentItem } from "@/types";

interface VideoDetailPanelProps {
	item: ContentItem | EnhancedContentItem | null;
	isOpen: boolean;
	onClose: () => void;
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

type FullContent = ContentItem & {
	ext?: any;
	assets?: Array<{ src?: string; type?: string }>;
	links?: Array<{ href: string; label?: string; rel?: string }>;
};

export default function VideoDetailPanel({
	item,
	isOpen,
	onClose,
}: VideoDetailPanelProps) {
	const [isVideoLoaded, setIsVideoLoaded] = useState(false);
	const [full, setFull] = useState<FullContent | null>(null);

	// Load full content (with links/assets/ext) when panel opens
	useEffect(() => {
		if (!isOpen || !item?.id) {
			setFull(null);
			return;
		}
		let aborted = false;
		fetch(`/api/cms/contents?id=${encodeURIComponent(item.id)}`, {
			cache: "no-store",
		})
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (aborted) return;
				setFull(data as FullContent);
			})
			.finally(() => {
				// no-op
			});
		return () => {
			aborted = true;
		};
	}, [isOpen, item?.id]);

	const youTubeUrl: string | null = useMemo(() => {
		// 1) ext.thumbnail.youtube
		const extUrl = (full as any)?.ext?.thumbnail?.youtube;
		if (typeof extUrl === "string" && extUrl) return extUrl;
		// 2) assets type video/youtube
		const assetUrl = (full?.assets || []).find(
			(a) => a?.type === "video/youtube",
		)?.src;
		if (typeof assetUrl === "string" && assetUrl) return assetUrl;
		// 3) links that include youtube
		const linkUrl = (full?.links || []).find(
			(l) =>
				typeof l?.href === "string" && /youtu\.?be|youtube\.com/.test(l.href),
		)?.href;
		if (typeof linkUrl === "string" && linkUrl) return linkUrl;
		// 4) fallback to item.videos
		const v = (item as any)?.videos?.find?.(
			(vv: any) => vv?.type === "youtube",
		)?.url;
		return typeof v === "string" ? v : null;
	}, [full, item]);

	if (!isOpen || !item) return null;

	const videoId = youTubeUrl ? getYouTubeVideoId(youTubeUrl) : null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
			<div className="rounded-[20px] w-[92vw] max-w-[1100px] max-h-[90vh] overflow-hidden backdrop-blur bg-gradient-to-b from-black/50 to-base/20 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
				{/* Header removed to reduce top whitespace */}

				<div className="p-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{/* Video Player (left 2/3) */}
						<div className="lg:col-span-2 xl:col-span-3 space-y-4">
							<div className="aspect-video bg-base/30 rounded-[12px] overflow-hidden relative">
								{!isVideoLoaded ? (
									<>
										{/* Background Thumbnail */}
										{item.thumbnail ? (
											<SafeImage
												src={item.thumbnail}
												alt={item.title}
												fill
												sizes="(max-width: 768px) 100vw, 100vw"
												className="object-cover object-center"
												style={{ objectPosition: "center center" }}
											/>
										) : (
											<SafeImage
												src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
												alt={item.title}
												fill
												sizes="(max-width: 768px) 100vw, 100vw"
												className="object-cover object-center"
												style={{ objectPosition: "center center" }}
												fallbackSrc={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
											/>
										)}
										{/* Play Button Overlay */}
										<div
											className="absolute inset-0 flex items-center justify-center"
											style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
										>
											<button
												type="button"
												onClick={() => setIsVideoLoaded(true)}
												className="flex items-center gap-2 text-black px-6 py-3 rounded-lg transition-all duration-300"
												style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor =
														"rgba(255, 255, 255, 1)";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor =
														"rgba(255, 255, 255, 0.9)";
												}}
											>
												<Play className="w-6 h-6" />
												<span className="noto-sans-jp-light text-sm font-medium">
													動画を再生
												</span>
											</button>
										</div>
									</>
								) : (
									<iframe
										src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
										title={item.title}
										className="w-full h-full"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
									/>
								)}
							</div>
							{/* Title under the video (YouTube-like) */}
							<h2 className="zen-kaku-gothic-new text-2xl text-main mt-6 mb-4">
								{item.title}
							</h2>
							{/* Description moved under the title */}
							{item.description && (
								<p className="noto-sans-jp-light text-sm text-main leading-relaxed mb-2">
									{item.description}
								</p>
							)}
						</div>
						{/* Right column: close + info + actions */}
						<div
							className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2"
							style={{ maxHeight: "calc(90vh - 48px)" }}
						>
							{/* 作品情報 */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<h3 className="zen-kaku-gothic-new text-lg text-main">
										作品情報
									</h3>
									<button
										type="button"
										onClick={onClose}
										className="p-1.5 rounded-md hover:bg-base/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
										aria-label="Close panel"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4 text-main" />
										<span className="noto-sans-jp-light text-sm text-main">
											{new Date(
												item.updatedAt || item.createdAt,
											).toLocaleDateString("ja-JP")}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="noto-sans-jp-light text-xs text-accent bg-accent/10 px-2 py-1 rounded-full ring-1 ring-accent/20">
											{item.category}
										</span>
									</div>
								</div>
							</div>
							{/* 説明（左に移動したため削除） */}

							{/* 関連リンク */}
							{(item.externalLinks && item.externalLinks.length > 0) ||
							(Array.isArray(full?.links) && full!.links!.length > 0) ? (
								<div>
									<h3 className="zen-kaku-gothic-new text-lg text-main mb-2">
										リンク
									</h3>
									<div className="flex flex-wrap gap-2">
										{[
											...(item.externalLinks || []).map((l: any) => ({
												href: l.url,
												label: l.title,
											})),
											...((full?.links || []) as any[]).map((l: any) => ({
												href: l.href,
												label: l.label || l.href,
											})),
										]
											.filter(
												(v, i, arr) =>
													v?.href &&
													arr.findIndex((x) => x.href === v.href) === i,
											)
											.map((link, index) => (
												<a
													key={index}
													href={link.href}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-accent hover:text-main transition-colors max-w-full overflow-hidden px-1 py-0.5 rounded-[4px]"
												>
													<ExternalLink className="w-3.5 h-3.5" />
													<span className="noto-sans-jp-light text-xs truncate max-w-[220px] sm:max-w-[280px] md:max-w-[340px]">
														{link.label}
													</span>
												</a>
											))}
									</div>
								</div>
							) : null}

							{/* 関連メディア */}
							{Array.isArray(full?.assets) && full!.assets!.length > 0 && (
								<div>
									<h3 className="zen-kaku-gothic-new text-lg text-main mb-2">
										関連メディア
									</h3>
									<div className="grid grid-cols-1 gap-3">
										{(full!.assets as any[]).map((asset, idx) => {
											const href = asset?.src || "";
											const type = String(asset?.type || "");
											const isImage =
												/image\//.test(type) ||
												/\.(png|jpe?g|gif|webp|avif)$/i.test(href);

											// Derive a thumbnail when YouTube link is provided
											let thumbSrc: string | null = null;
											if (isImage) {
												thumbSrc = href;
											} else if (
												type === "video/youtube" ||
												/youtu(\.be|be\.com)/.test(href)
											) {
												const vid = getYouTubeVideoId(href);
												if (vid) {
													thumbSrc = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
												}
											}

											return (
												<Link
													key={idx}
													href={`/portfolio/${item.id}`}
													className="block w-full group"
												>
													<div className="relative aspect-video w-full rounded-[10px] overflow-hidden bg-base/30">
														{thumbSrc ? (
															<SafeImage
																src={thumbSrc}
																alt={`asset-${idx}`}
																fill
																className="object-cover object-center group-hover:scale-[1.02] transition-transform"
																style={{ objectPosition: "center center" }}
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center text-main/70">
																<span className="noto-sans-jp-light text-xs">
																	{type || "media"}
																</span>
															</div>
														)}
													</div>
												</Link>
											);
										})}
									</div>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex flex-col gap-1.5 pt-2 mt-auto">
								<Link
									href={`/portfolio/${item.id}`}
									className="bg-main text-sm px-3 py-1.5 rounded-[8px] hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 w-full text-left"
								>
									<span className="noto-sans-jp-light text-xs">
										詳細ページを見る
									</span>
								</Link>
								{youTubeUrl && (
									<a
										href={youTubeUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="px-3 py-1.5 rounded-[8px] bg-base/30 hover:bg-base/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 w-full text-left text-sm"
									>
										<span className="noto-sans-jp-light text-xs">
											YouTubeで見る
										</span>
									</a>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
