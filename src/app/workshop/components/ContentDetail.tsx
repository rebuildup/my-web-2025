"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ContentItem, MediaEmbed } from "@/types/content";
import ContentRecommendations from "./ContentRecommendations";

interface ContentDetailProps {
	content: ContentItem;
	backUrl: string;
	backLabel: string;
}

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function MediaEmbedComponent({ media }: { media: MediaEmbed }) {
	const [isLoading, setIsLoading] = useState(true);

	const handleLoad = () => {
		setIsLoading(false);
	};

	const getEmbedUrl = (media: MediaEmbed): string => {
		switch (media.type) {
			case "youtube": {
				const youtubeId = media.url.match(
					/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
				)?.[1];
				return `https://www.youtube.com/embed/${youtubeId}`;
			}
			case "vimeo": {
				const vimeoId = media.url.match(/vimeo\.com\/(\d+)/)?.[1];
				return `https://player.vimeo.com/video/${vimeoId}`;
			}
			case "iframe":
				return media.url;
			default:
				return media.url;
		}
	};

	if (media.type === "code") {
		return (
			<div className="bg-base border border-main p-4 overflow-x-auto">
				<pre className="text-sm noto-sans-jp-light">
					<code>{media.url}</code>
				</pre>
			</div>
		);
	}

	if (media.type === "social") {
		return (
			<div className="bg-base border border-main p-4 text-center">
				<a
					href={media.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-accent hover:text-main noto-sans-jp-light text-sm"
				>
					{media.title || media.url}
				</a>
			</div>
		);
	}

	return (
		<div className="relative">
			{isLoading && (
				<div className="absolute inset-0 bg-base border border-main flex items-center justify-center">
					<span className="noto-sans-jp-light text-sm">読み込み中...</span>
				</div>
			)}
			<iframe
				src={getEmbedUrl(media)}
				title={media.title || "Embedded content"}
				width={media.width || "100%"}
				height={media.height || "315"}
				className="w-full border border-main"
				allowFullScreen
				onLoad={handleLoad}
			/>
		</div>
	);
}

export default function ContentDetail({
	content,
	backUrl,
	backLabel,
}: ContentDetailProps) {
	const [markdownContent, setMarkdownContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [viewTracked, setViewTracked] = useState(false);

	useEffect(() => {
		const loadMarkdownContent = async () => {
			if (content.contentPath) {
				try {
					const response = await fetch(content.contentPath);
					if (response.ok) {
						const text = await response.text();
						setMarkdownContent(text);
					}
				} catch (error) {
					console.error("Error loading markdown content:", error);
				}
			} else if (content.content) {
				setMarkdownContent(content.content);
			}
			setIsLoading(false);
		};

		loadMarkdownContent();
	}, [content.contentPath, content.content]);

	// Track view when component mounts
	useEffect(() => {
		const trackView = async () => {
			if (!viewTracked) {
				try {
					await fetch("/api/stats/view", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ contentId: content.id }),
					});
					setViewTracked(true);
				} catch (error) {
					console.error("Error tracking view:", error);
				}
			}
		};

		// Track view after a short delay to ensure user is actually viewing content
		const timer = setTimeout(trackView, 2000);
		return () => clearTimeout(timer);
	}, [content.id, viewTracked]);

	const handleDownload = async () => {
		if (content.downloadInfo) {
			try {
				// Track download
				await fetch("/api/stats/download", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ contentId: content.id }),
				});

				// Trigger download
				const link = document.createElement("a");
				link.href = `/downloads/${content.downloadInfo.fileName}`;
				link.download = content.downloadInfo.fileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} catch (error) {
				console.error("Error downloading file:", error);
			}
		}
	};

	const Card_title =
		"neue-haas-grotesk-display text-3xl text-main leading-snug";
	const Card_description = "noto-sans-jp-light text-base leading-loose";
	const Card_meta = "noto-sans-jp-light text-sm text-accent";
	const Section_title = "neue-haas-grotesk-display text-xl text-main mb-4";

	return (
		<div className="min-h-screen bg-base text-main">
			<main className="py-10">
				<div className="container-system">
					<div className="space-y-10">
						<header className="space-y-6">
							<div className="space-y-4">
								<h1 className={Card_title}>{content.title}</h1>
								<p className={Card_description}>{content.description}</p>

								<div className="flex flex-wrap gap-4 items-center">
									<time className={Card_meta}>
										{new Date(
											content.publishedAt || content.createdAt,
										).toLocaleDateString("ja-JP")}
									</time>
									{content.stats && (
										<span className={Card_meta}>
											{content.stats.views} 回閲覧
										</span>
									)}
									{content.downloadInfo && (
										<span className={Card_meta}>
											{content.downloadInfo.downloadCount} ダウンロード
										</span>
									)}
								</div>

								{content.tags.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{content.tags.map((tag) => (
											<span
												key={tag}
												className="bg-base border border-main px-3 py-1 text-sm noto-sans-jp-light"
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</div>
						</header>

						{/* Download Section for Plugins and Downloads */}
						{content.downloadInfo && (
							<section className="bg-base border border-main p-6">
								<h2 className={Section_title}>ダウンロード</h2>
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-main">ファイル名:</span>
											<span className="ml-2 text-main">
												{content.downloadInfo.fileName}
											</span>
										</div>
										<div>
											<span className="text-main">ファイルサイズ:</span>
											<span className="ml-2 text-main">
												{formatFileSize(content.downloadInfo.fileSize)}
											</span>
										</div>
										<div>
											<span className="text-main">ファイル形式:</span>
											<span className="ml-2 text-main">
												{content.downloadInfo.fileType.toUpperCase()}
											</span>
										</div>
										{content.downloadInfo.version && (
											<div>
												<span className="text-main">バージョン:</span>
												<span className="ml-2 text-main">
													v{content.downloadInfo.version}
												</span>
											</div>
										)}
									</div>
									<button
										type="button"
										onClick={handleDownload}
										className="bg-accent text-main px-6 py-3 border border-accent hover:bg-base hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className="noto-sans-jp-regular">ダウンロード</span>
									</button>
								</div>
							</section>
						)}

						{/* External Links */}
						{content.externalLinks && content.externalLinks.length > 0 && (
							<section>
								<h2 className={Section_title}>関連リンク</h2>
								<div className="grid-system grid-1 sm:grid-2 gap-4">
									{content.externalLinks.map((link) => (
										<a
											key={link.url}
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											className="bg-base border border-main p-4 block hover:bg-base transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
										>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<span className="text-main font-medium">
														{link.title}
													</span>
													<span className="text-xs text-accent uppercase">
														{link.type}
													</span>
												</div>
												{link.description && (
													<p className="text-sm text-main">
														{link.description}
													</p>
												)}
											</div>
										</a>
									))}
								</div>
							</section>
						)}

						{/* Media Embeds */}
						{content.videos && content.videos.length > 0 && (
							<section>
								<h2 className={Section_title}>メディア</h2>
								<div className="space-y-6">
									{content.videos.map((media) => (
										<div key={media.url}>
											{media.title && (
												<h3 className="text-lg text-main mb-2">
													{media.title}
												</h3>
											)}
											<MediaEmbedComponent media={media} />
											{media.description && (
												<p className="text-sm text-main mt-2">
													{media.description}
												</p>
											)}
										</div>
									))}
								</div>
							</section>
						)}

						{/* Content */}
						<section>
							<h2 className={Section_title}>詳細</h2>
							{isLoading ? (
								<div className="bg-base border border-main p-6">
									<p className="text-center text-main">読み込み中...</p>
								</div>
							) : (
								<div className="bg-base border border-main p-6">
									{markdownContent ? (
										<div
											className="prose prose-invert max-w-none noto-sans-jp-light"
											dangerouslySetInnerHTML={{ __html: markdownContent }}
										/>
									) : (
										<p className="text-center text-main">
											コンテンツが見つかりません
										</p>
									)}
								</div>
							)}
						</section>

						{/* Content Recommendations */}
						<ContentRecommendations
							currentContentId={content.id}
							contentType={content.type}
							category={content.category}
							tags={content.tags}
							limit={3}
						/>

						<nav aria-label="Site navigation">
							<Link
								href={backUrl}
								className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
							>
								<span className="noto-sans-jp-regular text-base leading-snug">
									← {backLabel}
								</span>
							</Link>
						</nav>
					</div>
				</div>
			</main>
		</div>
	);
}
