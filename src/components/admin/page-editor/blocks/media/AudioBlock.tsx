"use client";

import { AudioWaveform, UploadCloud } from "lucide-react";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { getMediaUrl, uploadMediaFile } from "@/cms/page-editor/lib/api/media";
import { formatFileSize } from "@/cms/page-editor/lib/utils/file-upload";
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

export function AudioBlock({
	block,
	readOnly,
	onAttributesChange,
	contentId,
}: BlockComponentProps) {
	const src = (block.attributes.src as string | undefined) ?? "";
	const autoplay = Boolean(block.attributes.autoplay);
	const controls = block.attributes.controls !== false;
	const filename =
		(block.attributes.filename as string | undefined) ?? undefined;
	const size = block.attributes.size as number | undefined;
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
				console.error("Failed to upload audio", error);
				setUploadError(
					error instanceof Error ? error.message : "Failed to upload audio.",
				);
			} finally {
				setIsUploading(false);
			}
		},
		[contentId, onAttributesChange],
	);

	return (
		<div
			className="block-audio"
			style={{
				position: "relative",
				border: `1px solid ${adminColor.border}`,
				borderRadius: 8,
				padding: 8,
				backgroundColor: "rgba(255,255,255,0.02)",
			}}
		>
			{!readOnly && (
				<div
					className="audio-controls"
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
							flexDirection: "column",
							gap: 12,
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
								{isUploading ? "Uploading..." : "Upload audio"}
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="audio/*"
								style={{ display: "none" }}
								onChange={handleFileChange}
							/>
						</div>

						{uploadError && (
							<div
								role="alert"
								style={{
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
									margin: 0,
								}}
							>
								Current file: {filename}
								{typeof size === "number" ? ` · ${formatFileSize(size)}` : ""}
							</p>
						)}

						<div>
							<label style={labelStyle}>Audio URL</label>
							<input
								value={src}
								onChange={(e) => onAttributesChange({ src: e.target.value })}
								placeholder="https://example.com/audio.mp3"
								style={inputStyle}
							/>
						</div>

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 16,
							}}
						>
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
				</div>
			)}

			<div
				style={{ transition: "margin 120ms ease" }}
				className="audio-preview"
			>
				{src ? (
					<audio
						src={src}
						controls={controls}
						autoPlay={autoplay}
						style={{ width: "100%" }}
					>
						<track kind="captions" />
					</audio>
				) : (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							paddingTop: 32,
							paddingBottom: 32,
							gap: 8,
							color: adminColor.textSecondary,
						}}
					>
						<AudioWaveform size={24} color={adminColor.accent} />
						<span style={{ fontSize: 14 }}>Paste an audio URL</span>
					</div>
				)}
			</div>
		</div>
	);
}
