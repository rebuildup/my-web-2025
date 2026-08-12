"use client";

import { Film, UploadCloud } from "lucide-react";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { getMediaUrl, uploadMediaFile } from "@/cms/page-editor/lib/api/media";
import { formatFileSize } from "@/cms/page-editor/lib/utils/file-upload";
import { SimpleSelect } from "@/components/admin/ui";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

const inputStyle: React.CSSProperties = {
	width: "100%",
	padding: "6px 8px",
	fontSize: 14,
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 4,
	backgroundColor: adminColor.bgPanel,
	color: adminColor.textPrimary,
	boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
	display: "block",
	fontSize: 12,
	color: adminColor.textSecondary,
	marginBottom: 2,
};

export function VideoBlock({
	block,
	readOnly,
	onAttributesChange,
	contentId,
}: BlockComponentProps) {
	const src = (block.attributes.src as string | undefined) ?? "";
	const poster = (block.attributes.poster as string | undefined) ?? "";
	const autoplay = Boolean(block.attributes.autoplay);
	const controls = block.attributes.controls !== false;
	const filename =
		(block.attributes.filename as string | undefined) ?? undefined;
	const size = block.attributes.size as number | undefined;
	const widthPercent = Number(block.attributes.widthPercent ?? 100);
	const heightPx =
		block.attributes.heightPx === undefined
			? undefined
			: Math.max(0, Number(block.attributes.heightPx));
	const align = (block.attributes.align as string | undefined) ?? "left";
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			if (!file) {
				return;
			}
			if (!contentId) {
				setUploadError("Select a content entry before uploading media.");
				return;
			}
			try {
				setIsUploading(true);
				setUploadError(null);
				const result = await uploadMediaFile(contentId, file);
				const mediaUrl = getMediaUrl(contentId, result.id);
				onAttributesChange({
					src: mediaUrl,
					mediaId: result.id,
					filename: file.name,
					size: file.size,
					mimeType: file.type,
				});
			} catch (error) {
				console.error("Failed to upload video", error);
				setUploadError(
					error instanceof Error ? error.message : "Failed to upload video.",
				);
			} finally {
				setIsUploading(false);
			}
		},
		[contentId, onAttributesChange],
	);

	const alignToText =
		align === "center" ? "center" : align === "right" ? "right" : "left";
	const boxWidth = Math.max(
		0,
		Math.min(100, Number.isNaN(widthPercent) ? 100 : widthPercent),
	);

	return (
		<div
			className="block-video"
			style={{
				position: "relative",
				borderRadius: 8,
				padding: 0,
			}}
		>
			<div style={{ textAlign: alignToText, paddingLeft: 0, paddingRight: 0 }}>
				{src ? (
					<video
						src={src}
						poster={poster || undefined}
						controls={controls}
						autoPlay={autoplay}
						muted
						style={{
							display: "inline-block",
							width: `${boxWidth}%`,
							height: heightPx ? `${heightPx}px` : "auto",
							objectFit: heightPx ? "cover" : "contain",
							borderRadius: 4,
							border: `1px solid ${adminColor.border}`,
							backgroundColor: "rgba(255,255,255,0.02)",
						}}
					/>
				) : (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							paddingTop: 48,
							paddingBottom: 48,
							gap: 8,
							color: adminColor.textSecondary,
						}}
					>
						<Film size={32} color={adminColor.accent} />
						<span style={{ fontSize: 14 }}>Paste a video URL</span>
					</div>
				)}
			</div>

			{!readOnly && (
				<>
					<div
						className="video-controls"
						style={{
							position: "absolute",
							top: 8,
							left: 8,
							right: 8,
							backgroundColor: "rgba(0,0,0,0.35)",
							borderRadius: 4,
							padding: 8,
							opacity: 0,
							pointerEvents: "none",
							transition: "opacity 120ms ease",
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								flexWrap: "wrap",
								alignItems: "center",
								gap: 12,
							}}
						>
							<div style={{ width: 140 }}>
								<label style={labelStyle}>Width (%)</label>
								<input
									type="number"
									min={0}
									max={100}
									value={boxWidth}
									onChange={(e) =>
										onAttributesChange({
											widthPercent: Math.max(
												0,
												Math.min(100, Number(e.target.value ?? 100)),
											),
										})
									}
									style={inputStyle}
								/>
							</div>
							<div style={{ width: 160 }}>
								<label style={labelStyle}>Height (px)</label>
								<input
									type="number"
									min={0}
									max={4000}
									value={heightPx ?? ""}
									onChange={(e) => {
										const v =
											e.target.value === ""
												? undefined
												: Math.max(0, Math.min(4000, Number(e.target.value)));
										onAttributesChange({ heightPx: v });
									}}
									style={inputStyle}
								/>
							</div>
							<div style={{ width: 140 }}>
								<label style={labelStyle}>Align</label>
								<SimpleSelect
									size="small"
									value={align}
									onChange={(value) => onAttributesChange({ align: value })}
									options={[
										{ value: "left", label: "Left" },
										{ value: "center", label: "Center" },
										{ value: "right", label: "Right" },
									]}
									minWidth={140}
									aria-label="Align"
								/>
							</div>
							<label
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 6,
									fontSize: 14,
									color: adminColor.textPrimary,
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									role="switch"
									checked={autoplay}
									onChange={(e) =>
										onAttributesChange({ autoplay: e.target.checked })
									}
								/>
								Autoplay
							</label>
							<label
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 6,
									fontSize: 14,
									color: adminColor.textPrimary,
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									role="switch"
									checked={controls}
									onChange={(e) =>
										onAttributesChange({ controls: e.target.checked })
									}
								/>
								Controls
							</label>
						</div>
					</div>

					<div
						className="video-controls"
						style={{
							position: "absolute",
							top: 56,
							left: 8,
							right: 8,
							backgroundColor: "rgba(0,0,0,0.35)",
							borderRadius: 4,
							padding: 8,
							opacity: 0,
							pointerEvents: "none",
							transition: "opacity 120ms ease",
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 12,
							}}
						>
							<button
								type="button"
								disabled={!contentId || isUploading}
								onClick={() => fileInputRef.current?.click()}
								style={{
									width: "100%",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 8,
									padding: "8px 16px",
									border: `1px solid ${adminColor.borderInput}`,
									borderRadius: 4,
									backgroundColor: adminColor.bgPanel,
									color: adminColor.textPrimary,
									cursor: !contentId || isUploading ? "not-allowed" : "pointer",
									opacity: !contentId || isUploading ? 0.6 : 1,
									whiteSpace: "nowrap",
								}}
							>
								<UploadCloud size={18} />
								{isUploading ? "Uploading..." : "Upload video"}
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="video/*"
								style={{ display: "none" }}
								onChange={handleFileChange}
							/>

							{uploadError && (
								<div
									role="alert"
									style={{
										marginTop: 8,
										padding: "8px 12px",
										borderLeft: `4px solid ${adminColor.error}`,
										backgroundColor: "rgba(185, 28, 28, 0.1)",
										color: adminColor.error,
										fontSize: 14,
										borderRadius: 4,
									}}
								>
									{uploadError}
								</div>
							)}

							{filename && (
								<p
									style={{
										fontSize: 12,
										color: adminColor.textSecondary,
										margin: "4px 0 0 0",
									}}
								>
									Current file: {filename}
									{typeof size === "number" ? ` · ${formatFileSize(size)}` : ""}
								</p>
							)}

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: 12,
									marginTop: 12,
									width: "100%",
								}}
							>
								<div style={{ width: "100%" }}>
									<label style={labelStyle}>URL</label>
									<input
										value={src}
										onChange={(e) =>
											onAttributesChange({ src: e.target.value })
										}
										placeholder="https://.../video.mp4"
										style={inputStyle}
									/>
								</div>
								<div style={{ width: "100%" }}>
									<label style={labelStyle}>Poster</label>
									<input
										value={poster}
										onChange={(e) =>
											onAttributesChange({ poster: e.target.value })
										}
										placeholder="https://.../thumb.jpg"
										style={inputStyle}
									/>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
