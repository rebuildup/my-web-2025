"use client";

import {
	AudioLines,
	File as FileIcon,
	Film,
	Trash2,
	UploadCloud,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
	deleteMedia,
	getMediaUrl,
	uploadMediaFile,
} from "@/cms/page-editor/lib/api/media";
import { formatFileSize } from "@/cms/page-editor/lib/utils/file-upload";
import type { MediaItem } from "@/cms/types/media";
import { adminColor } from "@/components/admin/ui/tokens";

export interface MediaManagerProps {
	contentId?: string;
	media: MediaItem[];
	isLoading?: boolean;
	onRefresh?: () => void;
}

export function MediaManager({
	contentId,
	media,
	isLoading = false,
	onRefresh,
}: MediaManagerProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onDrop = useCallback(
		async (files: File[]) => {
			if (!contentId || files.length === 0) {
				return;
			}
			try {
				setIsUploading(true);
				setError(null);
				const [file] = files;
				await uploadMediaFile(contentId, file);
				onRefresh?.();
			} catch (err) {
				console.error("Failed to upload media", err);
				setError(err instanceof Error ? err.message : "Media upload failed");
			} finally {
				setIsUploading(false);
			}
		},
		[contentId, onRefresh],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		disabled: !contentId || isUploading,
	});

	const handleDelete = useCallback(
		async (item: MediaItem) => {
			if (!contentId) {
				return;
			}
			try {
				await deleteMedia(contentId, item.id);
				onRefresh?.();
			} catch (err) {
				console.error("Failed to delete media", err);
				setError(err instanceof Error ? err.message : "Media deletion failed");
			}
		},
		[contentId, onRefresh],
	);

	const emptyStateLabel = useMemo(() => {
		if (isLoading) {
			return "Loading media...";
		}
		return "No media files yet.";
	}, [isLoading]);

	return (
		<section style={{ backgroundColor: adminColor.bgPanel, borderRadius: 0 }}>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					paddingTop: 12,
					paddingBottom: 12,
				}}
			>
				<h3
					style={{
						margin: 0,
						fontSize: 16,
						fontWeight: 600,
						color: adminColor.textPrimary,
					}}
				>
					Media
				</h3>
				<button
					type="button"
					disabled={!contentId || isUploading}
					{...getRootProps()}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 8,
						fontSize: 13,
						padding: "4px 12px",
						border: `1px solid ${adminColor.borderInput}`,
						borderRadius: 4,
						backgroundColor: adminColor.bgPanel,
						color: adminColor.textPrimary,
						cursor: !contentId || isUploading ? "not-allowed" : "pointer",
						opacity: !contentId || isUploading ? 0.6 : 1,
					}}
				>
					<input {...getInputProps()} />
					<UploadCloud size={16} />
					{isUploading ? "Uploading..." : "Add file"}
				</button>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 12,
				}}
			>
				{!contentId ? (
					<div
						role="status"
						style={{
							padding: "8px 12px",
							borderLeft: `4px solid ${adminColor.info}`,
							backgroundColor: "rgba(30, 64, 175, 0.1)",
							color: adminColor.info,
							fontSize: 14,
							borderRadius: 4,
						}}
					>
						Select a content item to manage media assets.
					</div>
				) : (
					<>
						<div
							{...getRootProps()}
							style={{
								padding: 16,
								textAlign: "center",
								color: adminColor.textSecondary,
								border: `1px dashed ${adminColor.border}`,
								borderRadius: 4,
								cursor: !contentId || isUploading ? "not-allowed" : "pointer",
								backgroundColor: isDragActive
									? adminColor.accentHover
									: "transparent",
							}}
						>
							<input {...getInputProps()} />
							<span style={{ fontSize: 14, fontWeight: 500 }}>
								Drop files here or use the button above to upload.
							</span>
						</div>
						{error && (
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
								{error}
							</div>
						)}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 0,
							}}
						>
							{media.length === 0 ? (
								<span
									style={{
										fontSize: 14,
										color: adminColor.textSecondary,
									}}
								>
									{emptyStateLabel}
								</span>
							) : (
								media.map((item) => (
									<div
										key={item.id}
										style={{
											display: "flex",
											alignItems: "center",
											padding: "8px 12px",
											gap: 12,
											borderRadius: 4,
										}}
									>
										<MediaPreview
											item={item}
											contentId={item.contentId ?? contentId}
										/>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: 2,
												flex: 1,
												minWidth: 0,
											}}
										>
											<span
												style={{
													fontSize: 14,
													fontWeight: 600,
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
													color: adminColor.textPrimary,
												}}
											>
												{item.filename}
											</span>
											<span
												style={{
													fontSize: 12,
													color: adminColor.textSecondary,
												}}
											>
												{item.mimeType} · {formatFileSize(item.size)}
											</span>
										</div>
										<button
											type="button"
											aria-label="Delete"
											onClick={() => void handleDelete(item)}
											style={{
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												padding: 6,
												background: "transparent",
												color: adminColor.error,
												border: "none",
												borderRadius: 4,
												cursor: "pointer",
											}}
										>
											<Trash2 size={18} />
										</button>
									</div>
								))
							)}
						</div>
					</>
				)}
			</div>
		</section>
	);
}

function MediaPreview({
	item,
	contentId,
}: {
	item: MediaItem;
	contentId?: string;
}) {
	if (!contentId) {
		return null;
	}

	if (item.mimeType.startsWith("image/")) {
		return (
			<img
				style={{
					width: 72,
					height: 72,
					borderRadius: 4,
					objectFit: "cover",
					border: `1px solid ${adminColor.border}`,
				}}
				src={getMediaUrl(contentId, item.id)}
				alt={item.alt ?? ""}
			/>
		);
	}

	let Icon = FileIcon;
	if (item.mimeType.startsWith("audio/")) {
		Icon = AudioLines;
	} else if (item.mimeType.startsWith("video/")) {
		Icon = Film;
	}

	return (
		<div
			style={{
				width: 72,
				height: 72,
				borderRadius: 4,
				backgroundColor: "rgba(255,255,255,0.08)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				border: `1px solid ${adminColor.border}`,
				color: adminColor.accent,
			}}
		>
			<Icon size={28} />
		</div>
	);
}
