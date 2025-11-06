"use client";

/**
 * Portfolio Card Component
 * Task 3.1: 統一されたカードレイアウトの実装
 * Task 4.1: Gallery cards never display markdown content (Requirements 6.1, 6.2, 6.3, 6.4, 6.5)
 *
 * Gallery Card Content Rules:
 * - NEVER display markdown content or legacy content field
 * - ONLY show: title, description, thumbnail, category, tags, metadata
 * - Show subtle indicator for items with markdown content
 * - Maintain consistent layout regardless of content type
 */

import { FileText } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import { SafeImage } from "@/components/ui/SafeImage";
import type { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import type { EnhancedContentItem } from "@/types";
import { isEnhancedContentItem } from "@/types/enhanced-content";

interface PortfolioCardProps {
	item: PortfolioContentItem | EnhancedContentItem;
	onClick?: () => void;
	// Gallery cards should NEVER display markdown content (Requirement 6.1)
	// Only display: title, description, thumbnail, category, tags (Requirement 6.2)
	showMarkdownIndicator?: boolean; // Default: true
	hideMarkdownContent?: boolean; // Always true for gallery cards (Requirement 6.1)
	variant?: "default" | "glow";
}

export function PortfolioCard({
	item,
	onClick,
	showMarkdownIndicator = true,
	variant = "default",
}: PortfolioCardProps) {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!onClick) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick();
		}
	};

	// Check if item has detailed markdown content (Requirements 6.5)
	// Only check for markdown content, not legacy content field
	const hasDetailedContent = isEnhancedContentItem(item) && item.markdownPath;

	const CardRoot = ({ children }: { children: React.ReactNode }) => {
		if (variant === "glow") {
			return (
				<GlowCard className="group cursor-pointer text-left block bg-base/30 backdrop-blur flex flex-col">
					{children}
				</GlowCard>
			);
		}
		return (
			<article
				className="bg-base border border-main hover:border-accent transition-colors cursor-pointer group flex flex-col"
				onClick={onClick}
				onKeyDown={handleKeyDown}
				aria-label={`View details for ${item.title}`}
			>
				{children}
			</article>
		);
	};

	return (
		<CardRoot>
			{/* Thumbnail */}
			<div className="aspect-video bg-base overflow-hidden relative rounded-md">
				{item.thumbnail ? (
					<SafeImage
						src={item.thumbnail}
						alt={item.title}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
						style={{ objectPosition: "center center" }}
						onError={() => {
							console.error(
								"Image failed to load:",
								item.thumbnail,
								"for item:",
								item.title,
							);
						}}
						onLoad={() => {
							console.log("Image loaded successfully:", item.thumbnail);
						}}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-base">
						<span className="noto-sans-jp-light text-xs text-main/60">
							{item.title}
						</span>
					</div>
				)}

				{/* Subtle indicator for items with detailed markdown content (Requirement 6.5) */}
				{hasDetailedContent && showMarkdownIndicator && (
					<div
						className="absolute top-2 right-2 bg-main/80 text-white p-1.5 rounded-full shadow-sm backdrop-blur-sm"
						title="View detailed content"
						aria-hidden="true"
					>
						<FileText className="w-3 h-3" />
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4 space-y-3 flex flex-col">
				{/* Title (1-line) */}
				<h2 className="zen-kaku-gothic-new text-base text-main group-hover:text-accent transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
					{item.title}
				</h2>

				{/* Description (1-line) */}
				<p className="noto-sans-jp-light text-sm text-main whitespace-nowrap overflow-hidden text-ellipsis">
					{item.description || "\u00A0"}
				</p>

				{/* Tags (left) + Date (right) */}
				<div className="flex items-center justify-between">
					<div className="flex flex-nowrap gap-1.5 overflow-hidden">
						{((item as PortfolioContentItem).technologies || item.tags || [])
							.slice(0, 3)
							.map((tech, index) => (
								<span
									key={`${tech}-${index}`}
									className="noto-sans-jp-light text-xs text-main/90 px-3 py-1 bg-main/10 rounded-full whitespace-nowrap shrink-0"
								>
									{tech}
								</span>
							))}
						{((item as PortfolioContentItem).technologies || item.tags || [])
							.length > 3 && (
							<span className="noto-sans-jp-light text-xs tag-overflow-indicator px-3 py-1 bg-main/10 rounded-full text-main/90 whitespace-nowrap shrink-0">
								+
								{(
									(item as PortfolioContentItem).technologies ||
									item.tags ||
									[]
								).length - 3}
							</span>
						)}
					</div>
					<span className="noto-sans-jp-light text-xs text-main/60 whitespace-nowrap">
						{(() => {
							const effective =
								(item as any).publishedAt || item.updatedAt || item.createdAt;
							return new Date(effective).toLocaleDateString("ja-JP");
						})()}
					</span>
				</div>
			</div>
		</CardRoot>
	);
}
