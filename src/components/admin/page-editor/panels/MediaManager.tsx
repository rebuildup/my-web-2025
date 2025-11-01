"use client";

import {
	Alert,
	Box,
	Button,
	CardMedia,
	IconButton,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { File, Film, Music, Trash2, Upload } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
	deleteMedia,
	getMediaUrl,
	uploadMediaFile,
} from "@/cms/page-editor/lib/api/media";
import { formatFileSize } from "@/cms/page-editor/lib/utils/file-upload";
import type { MediaItem } from "@/cms/types/media";

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
	const topFileInputRef = useRef<HTMLInputElement | null>(null);

	const handleTopFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file || !contentId) return;
			try {
				setIsUploading(true);
				setError(null);
				await uploadMediaFile(contentId, file);
				onRefresh?.();
			} catch (err) {
				console.error("Failed to upload media", err);
				setError(err instanceof Error ? err.message : "Media upload failed");
			} finally {
				if (topFileInputRef.current) topFileInputRef.current.value = "";
				setIsUploading(false);
			}
		},
		[contentId, onRefresh],
	);

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
		<Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 0 }}>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{ px: 0, py: 1.5 }}
			>
				<Typography variant="subtitle1" fontWeight={600}>
					Media
				</Typography>
				<Button
					size="small"
					variant="outlined"
					startIcon={<Upload />}
					disabled={!contentId || isUploading}
					onClick={() => topFileInputRef.current?.click()}
				>
					<input
						ref={topFileInputRef}
						type="file"
						hidden
						onChange={handleTopFileChange}
					/>
					{isUploading ? "Uploading..." : "Add file"}
				</Button>
			</Stack>
			<Stack spacing={1.5} sx={{ px: 0, py: 0 }}>
				{!contentId ? (
					<Alert severity="info">
						Select a content item to manage media assets.
					</Alert>
				) : (
					<>
						<Box
							sx={{
								p: 2,
								textAlign: "center",
								color: "text.secondary",
								cursor: "default",
							}}
						>
							<Typography variant="body2" sx={{ fontWeight: 500 }}>
								Use the button above to upload a file.
							</Typography>
						</Box>
						{error && <Alert severity="error">{error}</Alert>}
						<Stack spacing={0}>
							{media.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									{emptyStateLabel}
								</Typography>
							) : (
								media.map((item) => (
									<Box
										key={item.id}
										sx={{
											display: "flex",
											alignItems: "center",
											px: 1.5,
											py: 1,
											gap: 1.5,
											borderRadius: 1,
											"&:hover": { bgcolor: "action.hover" },
										}}
									>
										<MediaPreview
											item={item}
											contentId={item.contentId ?? contentId}
										/>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												gap: 0.25,
												flex: 1,
												minWidth: 0,
											}}
										>
											<Typography
												variant="subtitle2"
												fontWeight={600}
												sx={{
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
												}}
											>
												{item.filename}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{item.mimeType} · {formatFileSize(item.size)}
											</Typography>
										</Box>
										<IconButton
											color="error"
											onClick={() => void handleDelete(item)}
											size="small"
										>
											<Trash2 />
										</IconButton>
									</Box>
								))
							)}
						</Stack>
					</>
				)}
			</Stack>
		</Paper>
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
			<CardMedia
				component="img"
				sx={{
					width: 72,
					height: 72,
					borderRadius: 2,
					objectFit: "cover",
					border: (theme) => `1px solid ${theme.palette.divider}`,
				}}
				src={getMediaUrl(contentId, item.id)}
				alt={item.alt ?? ""}
			/>
		);
	}

	const Icon = item.mimeType.startsWith("audio/")
		? Music
		: item.mimeType.startsWith("video/")
			? Film
			: File;

	return (
		<Box
			sx={{
				width: 72,
				height: 72,
				borderRadius: 2,
				bgcolor: "rgba(255,255,255,0.08)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				border: (theme) => `1px solid ${theme.palette.divider}`,
			}}
		>
			<Icon size={18} />
		</Box>
	);
}
