"use client";

import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { useMemo } from "react";
import type { Block, ListItem } from "@/cms/types/blocks";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

interface BlogBlockRendererProps {
	blocks: Block[];
	contentId?: string;
}

export function BlogBlockRenderer({ blocks }: BlogBlockRendererProps) {
	if (!blocks || blocks.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-12">
			{blocks.map((block) => (
				<BlockRenderer key={block.id} block={block} />
			))}
		</div>
	);
}

function BlockRenderer({ block }: { block: Block }) {
	switch (block.type) {
		case "paragraph":
			return <ParagraphBlock content={block.content} />;
		case "heading":
			return (
				<HeadingBlock
					level={Number(block.attributes.level) || 2}
					content={block.content}
				/>
			);
		case "list":
			return (
				<ListBlock
					ordered={Boolean(block.attributes?.ordered)}
					items={toListItems(block.attributes?.items)}
				/>
			);
		case "quote":
			return <QuoteBlock content={block.content} />;
		case "callout":
			return (
				<CalloutBlock content={block.content} attributes={block.attributes} />
			);
		case "divider":
			return <DividerBlock />;
		case "image":
			return (
				<ImageBlock content={block.content} attributes={block.attributes} />
			);
		case "video":
			return (
				<VideoBlock content={block.content} attributes={block.attributes} />
			);
		case "audio":
			return <AudioBlock attributes={block.attributes} />;
		case "file":
			return (
				<FileBlock attributes={block.attributes} content={block.content} />
			);
		case "bookmark":
			return (
				<BookmarkBlock attributes={block.attributes} content={block.content} />
			);
		case "code":
			return (
				<CodeBlock
					content={block.content}
					language={String(block.attributes?.language ?? "")}
				/>
			);
		case "math":
			return <MathBlock content={block.content} />;
		case "toggle":
			return <ToggleBlock block={block} />;
		case "html":
			return <HtmlBlock content={block.content} />;
		case "spacer":
			return <SpacerBlock attributes={block.attributes} />;
		case "table":
		case "tableOfContents":
		case "gallery":
		case "board":
		case "calendar":
		default:
			return <UnsupportedBlock type={block.type} />;
	}
}

function ParagraphBlock({ content }: { content: string }) {
	if (!content.trim()) return null;
	return (
		<p className="noto-sans-jp-light text-base leading-relaxed text-main/85 whitespace-pre-wrap">
			{content}
		</p>
	);
}

function HeadingBlock({ level, content }: { level: number; content: string }) {
	const safeLevel = Math.min(Math.max(level, 1), 4);
	const cleanContent = content.replace(/^#+\s*/, "").trim();
	const sharedClass = "neue-haas-grotesk-display font-semibold text-main";
	switch (safeLevel) {
		case 1:
			return (
				<h2 className={cn(sharedClass, "text-3xl sm:text-4xl")}>
					{cleanContent}
				</h2>
			);
		case 2:
			return (
				<h3 className={cn(sharedClass, "text-2xl sm:text-3xl")}>
					{cleanContent}
				</h3>
			);
		case 3:
			return (
				<h4 className={cn(sharedClass, "text-xl sm:text-2xl")}>
					{cleanContent}
				</h4>
			);
		default:
			return (
				<h5 className={cn(sharedClass, "text-lg sm:text-xl")}>
					{cleanContent}
				</h5>
			);
	}
}

function toListItems(value: unknown): ListItem[] {
	if (!value) return [];
	if (Array.isArray(value)) {
		return value.filter(
			(item): item is ListItem =>
				typeof item === "object" && item !== null && "content" in item,
		);
	}
	return [];
}

function ListBlock({
	ordered,
	items,
}: {
	ordered: boolean;
	items: ListItem[];
}) {
	if (!items.length) return null;
	const listClass = cn(
		"ml-6 space-y-2",
		ordered ? "list-decimal" : "list-disc",
	);
	const children = items.map((item) => (
		<li
			key={item.id}
			className="noto-sans-jp-light text-base leading-relaxed text-main/85 whitespace-pre-wrap"
		>
			{item.content}
		</li>
	));
	return ordered ? (
		<ol className={listClass}>{children}</ol>
	) : (
		<ul className={listClass}>{children}</ul>
	);
}

function QuoteBlock({ content }: { content: string }) {
	return (
		<blockquote className="border-l-4 border-accent/70 pl-4 italic text-main/80">
			{content}
		</blockquote>
	);
}

function CalloutBlock({
	content,
	attributes,
}: {
	content: string;
	attributes: Record<string, unknown>;
}) {
	const icon = typeof attributes.icon === "string" ? attributes.icon : "💡";
	const tone = typeof attributes.tone === "string" ? attributes.tone : "info";
	const toneClass = getCalloutToneClass(tone);
	return (
		<div className={cn("flex gap-4 rounded-2xl p-4", toneClass)}>
			<div className="text-2xl" aria-hidden>
				{icon}
			</div>
			<p className="noto-sans-jp-light text-base leading-relaxed text-main/85 whitespace-pre-wrap">
				{content}
			</p>
		</div>
	);
}

function getCalloutToneClass(tone: string) {
	switch (tone) {
		case "warning":
			return "bg-amber-500/10 text-amber-100 border border-amber-400/40";
		case "danger":
		case "error":
			return "bg-rose-500/10 text-rose-100 border border-rose-400/40";
		case "success":
			return "bg-emerald-500/10 text-emerald-100 border border-emerald-400/40";
		default:
			return "bg-main/10 text-main border border-main/20";
	}
}

function DividerBlock() {
	return <div className="h-px w-full bg-main/30" />;
}

function ImageBlock({
	content,
	attributes,
}: {
	content: string;
	attributes: Record<string, unknown>;
}) {
	const src = typeof attributes.src === "string" ? attributes.src : undefined;
	const alt =
		typeof attributes.alt === "string" ? attributes.alt : content || "Image";
	const width = Number(attributes.width) || undefined;
	const height = Number(attributes.height) || undefined;
	const caption = content?.trim();
	if (!src) return null;
	return (
		<figure className="overflow-hidden rounded-3xl border border-main/20 bg-main/5">
			<SafeImage
				src={src}
				alt={alt}
				className="h-auto w-full object-cover"
				width={width}
				height={height}
			/>
			{caption && (
				<figcaption className="noto-sans-jp-light px-6 py-4 text-sm text-main/70">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}

function VideoBlock({
	attributes,
	content,
}: {
	attributes: Record<string, unknown>;
	content: string;
}) {
	const src = typeof attributes.src === "string" ? attributes.src : undefined;
	const poster =
		typeof attributes.poster === "string" ? attributes.poster : undefined;
	if (!src) return null;
	return (
		<div className="overflow-hidden rounded-3xl border border-main/20 bg-main/5">
			<video controls poster={poster} className="h-full w-full" src={src}>
				{content && (
					<track kind="captions" label="caption" srcLang="ja" src={content} />
				)}
			</video>
		</div>
	);
}

function AudioBlock({ attributes }: { attributes: Record<string, unknown> }) {
	const src = typeof attributes.src === "string" ? attributes.src : undefined;
	if (!src) return null;
	return (
		<div className="rounded-2xl border border-main/20 bg-main/5 p-4">
			<audio controls className="w-full" src={src} />
		</div>
	);
}

function FileBlock({
	attributes,
	content,
}: {
	attributes: Record<string, unknown>;
	content: string;
}) {
	const href =
		typeof attributes.href === "string" ? attributes.href : undefined;
	const label =
		typeof attributes.label === "string"
			? attributes.label
			: content || "Download";
	if (!href) return null;
	return (
		<Link
			href={href}
			target={attributes.target === "_blank" ? "_blank" : undefined}
			rel={attributes.target === "_blank" ? "noopener noreferrer" : undefined}
			className="group flex items-center justify-between rounded-2xl border border-main/30 bg-main/5 px-6 py-4 transition hover:border-accent/60 hover:bg-accent/5"
		>
			<span className="noto-sans-jp-light text-sm text-main/85">{label}</span>
			<span className="text-xs uppercase tracking-[0.2em] text-accent/80">
				Download
			</span>
		</Link>
	);
}

function BookmarkBlock({
	attributes,
	content,
}: {
	attributes: Record<string, unknown>;
	content: string;
}) {
	const href =
		typeof attributes.href === "string"
			? attributes.href
			: typeof attributes.url === "string"
				? attributes.url
				: undefined;
	if (!href) return null;
	const title =
		typeof attributes.title === "string" ? attributes.title : content || href;
	const description =
		typeof attributes.description === "string"
			? attributes.description
			: undefined;
	return (
		<Link
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="block rounded-2xl border border-main/30 bg-main/5 p-6 transition hover:border-accent/60 hover:bg-accent/5"
		>
			<h3 className="neue-haas-grotesk-display text-lg text-main">{title}</h3>
			{description && (
				<p className="mt-2 text-sm text-main/70 line-clamp-3">{description}</p>
			)}
			<p className="mt-3 text-xs uppercase tracking-[0.2em] text-accent/70">
				Open link
			</p>
		</Link>
	);
}

function CodeBlock({
	content,
	language,
}: {
	content: string;
	language: string;
}) {
	return (
		<pre className="overflow-x-auto rounded-2xl border border-main/20 bg-main/5 p-4 text-sm text-main/85">
			<code
				className={cn(
					language ? `language-${language}` : undefined,
					"font-mono",
				)}
			>
				{content}
			</code>
		</pre>
	);
}

function MathBlock({ content }: { content: string }) {
	return (
		<pre className="overflow-x-auto rounded-2xl border border-main/20 bg-main/5 p-4 font-mono text-base text-main/85">
			{content}
		</pre>
	);
}

function ToggleBlock({ block }: { block: Block }) {
	const summary = String(block.attributes?.summary ?? "詳細を表示");
	const children = Array.isArray(block.children) ? block.children : [];
	return (
		<details className="group rounded-2xl border border-main/20 bg-main/5 p-6">
			<summary className="cursor-pointer text-lg font-semibold text-main">
				{summary}
			</summary>
			{children.length > 0 && (
				<div className="mt-4 flex flex-col gap-4">
					{children.map((child) => (
						<BlockRenderer key={child.id} block={child} />
					))}
				</div>
			)}
		</details>
	);
}

function HtmlBlock({ content }: { content: string }) {
	const sanitized = useMemo(
		() =>
			DOMPurify.sanitize(content, {
				ADD_TAGS: ["iframe", "video", "audio", "source"],
				ADD_ATTR: [
					"allow",
					"allowfullscreen",
					"frameborder",
					"src",
					"width",
					"height",
					"loading",
					"referrerpolicy",
				],
			}),
		[content],
	);
	return (
		<div
			className="prose prose-invert max-w-none prose-a:text-accent prose-strong:text-main"
			dangerouslySetInnerHTML={{ __html: sanitized }}
		/>
	);
}

function SpacerBlock({ attributes }: { attributes: Record<string, unknown> }) {
	const size = Number(attributes.size) || Number(attributes.height) || 32;
	return <div style={{ height: `${size}px` }} aria-hidden />;
}

function UnsupportedBlock({ type }: { type: string }) {
	return (
		<div className="rounded-2xl border border-dashed border-main/30 bg-main/5 p-4 text-sm text-main/60">
			Unsupported block type: {type}
		</div>
	);
}
