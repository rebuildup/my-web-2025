"use client";

import { FileText, UploadCloud } from "lucide-react";
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

export function FileBlock({
	block,
	readOnly,
	onAttributesChange,
	contentId,
}: BlockComponentProps) {
	const url = (block.attributes.src as string | undefined) ?? "";
	const name = (block.attributes.filename as string | undefined) ?? "";
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
				console.error("Failed to upload file", error);
				setUploadError(
					error instanceof Error ? error.message : "Failed to upload file.",
				);
			} finally {
				setIsUploading(false);
			}
		},
		[contentId, onAttributesChange],
	);

	return (
		<div
			className="block-file"
			style={{
				position: "relative",
				border: `1px solid ${adminColor.border}`,
				borderRadius: 8,
				padding: 8,
				backgroundColor: "rgba(255,255,255,0.02)",
			}}
		>
			<div className="file-preview" style={{ transition: "margin 120ms ease" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						padding: 10,
						borderRadius: 6,
						border: `1px solid ${adminColor.border}`,
						backgroundColor: "rgba(255,255,255,0.03)",
					}}
				>
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: 4,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "rgba(59,130,246,0.15)",
							color: adminColor.accent,
							flexShrink: 0,
						}}
					>
						<FileText size={20} />
					</div>
					<div style={{ minWidth: 0, flex: 1 }}>
						{url ? (
							<a
								href={url}
								target="_blank"
								rel="noreferrer"
								style={{
									display: "block",
									color: adminColor.textPrimary,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									textDecoration: "underline",
								}}
							>
								{name || url}
							</a>
						) : (
							<p
								style={{
									fontSize: 14,
									color: adminColor.textSecondary,
									margin: 0,
								}}
							>
								Upload a file or paste a URL
							</p>
						)}
						{typeof size === "number" && (
							<p
								style={{
									fontSize: 12,
									color: adminColor.textSecondary,
									margin: "2px 0 0 0",
								}}
							>
								{formatFileSize(size)}
							</p>
						)}
					</div>
				</div>
			</div>

			{!readOnly && (
				<div
					className="file-controls"
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
							alignItems: "center",
							gap: 12,
						}}
					>
						<button
							type="button"
							disabled={!contentId || isUploading}
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
							<input
								ref={fileInputRef}
								type="file"
								style={{ display: "none" }}
								onChange={handleFileChange}
							/>
							{isUploading ? "Uploading..." : "Upload file"}
						</button>

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
								<label style={labelStyle}>File name</label>
								<input
									value={name}
									onChange={(e) =>
										onAttributesChange({ filename: e.target.value })
									}
									style={inputStyle}
								/>
							</div>
							<div style={{ width: "100%" }}>
								<label style={labelStyle}>URL</label>
								<input
									value={url}
									onChange={(e) => onAttributesChange({ src: e.target.value })}
									placeholder="https://example.com/file.pdf"
									style={inputStyle}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
