"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sanitizeUrl } from "@/cms/page-editor/lib/utils/sanitize";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

const sectionStyle: React.CSSProperties = {
	position: "relative",
	borderRadius: 12,
	border: `1px solid ${adminColor.border}`,
	backgroundColor: "rgba(255,255,255,0.02)",
	overflow: "hidden",
};

const urlInputWrapperStyle: React.CSSProperties = {
	position: "absolute",
	top: 8,
	right: 8,
	zIndex: 2,
	backgroundColor: "rgba(15,23,42,0.5)",
	backdropFilter: "blur(4px)",
	borderRadius: 4,
	maxWidth: "min(520px, 80vw)",
	transition: "opacity 120ms ease",
};

const urlInputStyle: React.CSSProperties = {
	margin: 8,
	minWidth: 260,
	padding: "6px 10px",
	fontSize: 14,
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 4,
	backgroundColor: "rgba(0,0,0,0.5)",
	color: adminColor.textPrimary,
	outline: "none",
};

const linkRowStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "stretch",
	borderTop: `1px solid ${adminColor.border}`,
	color: "inherit",
	textDecoration: "none",
};

function getUrlWrapperOpacity(hovered: boolean): React.CSSProperties {
	return {
		...urlInputWrapperStyle,
		opacity: hovered ? 1 : 0,
		pointerEvents: hovered ? ("auto" as const) : ("none" as const),
	};
}

function getLinkStyle(url: string): React.CSSProperties {
	return {
		...linkRowStyle,
		pointerEvents: url ? ("auto" as const) : ("none" as const),
	};
}

export function WebBookmarkBlock({
	block,
	readOnly,
	onAttributesChange,
}: BlockComponentProps) {
	const url = (block.attributes.url as string | undefined) ?? "";
	const title = (block.attributes.title as string | undefined) ?? "";
	const description =
		(block.attributes.description as string | undefined) ?? "";
	const image = (block.attributes.image as string | undefined) ?? "";

	const [hovered, setHovered] = useState(false);
	const safeUrl = useMemo(() => sanitizeUrl(url), [url]);

	const urlHostname = useMemo(() => {
		if (!safeUrl) return "";
		try {
			const urlObj = new URL(safeUrl);
			return urlObj.host;
		} catch {
			return "";
		}
	}, [safeUrl]);

	const displayTitle = useMemo(() => {
		if (title) return title;
		if (urlHostname) return urlHostname;
		return "Bookmark";
	}, [title, urlHostname]);

	const onAttributesChangeRef = useRef(onAttributesChange);
	useEffect(() => {
		onAttributesChangeRef.current = onAttributesChange;
	}, [onAttributesChange]);

	useEffect(() => {
		const controller = new AbortController();
		const fetchOg = async () => {
			if (!safeUrl) {
				if (image) {
					onAttributesChangeRef.current({ image: "" });
				}
				return;
			}
			let data: {
				image?: string;
				title?: string;
				description?: string;
			} | null = null;

			try {
				const res = await fetch(
					`/api/metadata?url=${encodeURIComponent(safeUrl)}`,
					{ signal: controller.signal },
				);
				if (!res.ok) {
					return;
				}
				data = (await res.json()) as {
					image?: string;
					title?: string;
					description?: string;
				};
			} catch (err) {
				if ((err as Error).name === "AbortError") return;
				if (!controller.signal.aborted && image) {
					onAttributesChangeRef.current({ image: "" });
				}
				return;
			}

			if (!controller.signal.aborted && data) {
				const next: Record<string, string> = {};

				const dataImage = data.image || "";
				const currentImage = image || "";
				if (dataImage !== currentImage) {
					next.image = dataImage;
				}

				const dataTitle = data.title || "";
				const currentTitle = title || "";
				if (dataTitle !== currentTitle) {
					next.title = dataTitle;
				}

				const dataDescription = data.description || "";
				const currentDescription = description || "";
				if (dataDescription !== currentDescription) {
					next.description = dataDescription;
				}

				if (Object.keys(next).length > 0) {
					onAttributesChangeRef.current(next);
				}
			}
		};
		void fetchOg();
		return () => {
			controller.abort();
		};
	}, [safeUrl, image, title, description]);

	return (
		<section
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={sectionStyle}
		>
			{!readOnly && (
				<div
					className="bookmark-url-input"
					style={getUrlWrapperOpacity(hovered)}
				>
					<label
						htmlFor="web-bookmark-url-input"
						style={{
							position: "absolute",
							width: 1,
							height: 1,
							overflow: "hidden",
							clip: "rect(0 0 0 0)",
						}}
					>
						Bookmark URL
					</label>
					<input
						id="web-bookmark-url-input"
						placeholder="https://example.com"
						value={url}
						onChange={(event) =>
							onAttributesChange({ url: event.target.value })
						}
						onFocus={() => setHovered(true)}
						onBlur={() => setHovered(false)}
						style={urlInputStyle}
					/>
				</div>
			)}
			<div style={{ padding: 0 }} />
			<a
				href={url || undefined}
				target="_blank"
				rel="noreferrer"
				aria-disabled={!url}
				style={getLinkStyle(url)}
			>
				{image ? (
					<img
						src={image}
						alt=""
						style={{
							width: 140,
							objectFit: "cover",
						}}
					/>
				) : (
					<div style={{ width: 0 }} />
				)}
				<div style={{ flex: 1, padding: 16 }}>
					<h3
						style={{
							margin: 0,
							fontSize: 16,
							fontWeight: 600,
							color: adminColor.textPrimary,
						}}
					>
						{displayTitle}
					</h3>
					{description && (
						<p
							style={{
								margin: "4px 0 0 0",
								fontSize: 14,
								color: adminColor.textSecondary,
							}}
						>
							{description}
						</p>
					)}
					{url && (
						<p
							style={{
								margin: "8px 0 0 0",
								fontSize: 12,
								color: adminColor.textSecondary,
							}}
						>
							{url}
						</p>
					)}
				</div>
			</a>
		</section>
	);
}
