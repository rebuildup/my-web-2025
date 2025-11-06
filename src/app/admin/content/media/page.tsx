"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Alert,
	AlertColor,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Snackbar,
	Stack,
	TextField,
	Tooltip,
	Typography,
	CircularProgress,
} from "@mui/material";
import {
	Database,
	FileText,
	FolderOpen,
	Image as ImageIcon,
	RefreshCcw,
	Search,
	Trash2,
	UploadCloud,
} from "lucide-react";
import type { Content } from "@/cms/types/content";
import type { MediaItem } from "@/cms/types/media";
import { MediaUploadForm } from "@/components/admin/cms";
import { PageHeader } from "@/components/admin/layout";
import { ConfirmDialog } from "@/components/admin/ui";
import { useCmsResource } from "@/hooks/useCmsResource";

interface MediaWithPreview extends MediaItem {
	preview?: string;
}

interface SnackbarState {
	open: boolean;
	message: string;
	severity: AlertColor;
}

function formatBytes(bytes: number) {
	if (!bytes) return "0 B";
	const units = ["B", "KB", "MB", "GB"];
	let value = bytes;
	let index = 0;
	while (value >= 1024 && index < units.length - 1) {
		value /= 1024;
		index += 1;
	}
	return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function AdminMediaManager() {
	const {
		data: contents,
		loading: contentsLoading,
		error: contentsError,
	} = useCmsResource<Content[]>("/api/cms/contents", {
		parse: (raw) => (Array.isArray(raw) ? raw : []),
	});

	const [selectedContentId, setSelectedContentId] = useState("");
	const [mediaItems, setMediaItems] = useState<MediaWithPreview[]>([]);
	const [mediaLoading, setMediaLoading] = useState(false);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<MediaWithPreview | null>(
		null,
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("all");

	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});

	const showSnackbar = useCallback((message: string, severity: AlertColor) => {
		setSnackbar({ open: true, message, severity });
	}, []);

	const closeSnackbar = useCallback(() => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	}, []);

	useEffect(() => {
		if (!selectedContentId && contents && contents.length > 0) {
			setSelectedContentId(contents[0].id);
		}
	}, [contents, selectedContentId]);

	const fetchMedia = useCallback(
		async (contentId: string) => {
			if (!contentId) {
				setMediaItems([]);
				return;
			}
			setMediaLoading(true);
			try {
				const response = await fetch(
					`/api/cms/media?contentId=${encodeURIComponent(contentId)}`,
				);
				if (!response.ok) {
					throw new Error(`Failed to fetch media: ${response.status}`);
				}
				const data = (await response.json()) as MediaItem[];
				const itemsWithPreview = await Promise.all(
					data.map(async (item) => {
						if (item.base64) {
							return {
								...item,
								preview: `data:${item.mimeType};base64,${item.base64}`,
							};
						}
						try {
							const detailResponse = await fetch(
								`/api/cms/media?contentId=${encodeURIComponent(contentId)}&id=${encodeURIComponent(item.id)}`,
							);
							if (!detailResponse.ok) {
								return item;
							}
							const detail = await detailResponse.json();
							if (detail.base64) {
								return {
									...item,
									preview: `data:${detail.mimeType};base64,${detail.base64}`,
								};
							}
						} catch (error) {
							console.warn("Failed to fetch media preview", error);
						}
						return item;
					}),
				);
				setMediaItems(itemsWithPreview);
			} catch (error) {
				console.error("[Media] fetch failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "メディアの取得に失敗しました",
					"error",
				);
				setMediaItems([]);
			} finally {
				setMediaLoading(false);
			}
		},
		[showSnackbar],
	);

	useEffect(() => {
		if (selectedContentId) {
			void fetchMedia(selectedContentId);
		}
	}, [fetchMedia, selectedContentId]);

	const handleUpload = useCallback(
		async (formData: FormData) => {
			const file = formData.get("file") as File | null;
			const contentId = (formData.get("contentId") as string | null) ?? "";
			if (!file || !contentId) {
				showSnackbar("ファイルとコンテンツIDを入力してください", "error");
				return;
			}
			setIsUploading(true);
			try {
				const base64Data = await readFileAsBase64(file);
				const payload = {
					contentId,
					filename: file.name,
					mimeType: file.type,
					base64Data,
					alt: formData.get("alt") || undefined,
					description: formData.get("description") || undefined,
					tags: formData
						.get("tags")
						?.toString()
						.split(",")
						.map((tag) => tag.trim())
						.filter(Boolean),
				};

				const response = await fetch("/api/cms/media", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!response.ok) {
					const error = await response.json();
					throw new Error(
						error.error || "メディアのアップロードに失敗しました",
					);
				}
				showSnackbar("メディアをアップロードしました", "success");
				setIsUploadDialogOpen(false);
				if (contentId === selectedContentId) {
					await fetchMedia(contentId);
				}
			} catch (error) {
				console.error("[Media] upload failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "メディアのアップロードに失敗しました",
					"error",
				);
			} finally {
				setIsUploading(false);
			}
		},
		[fetchMedia, selectedContentId, showSnackbar],
	);

	const handleDelete = useCallback(
		async (media: MediaWithPreview) => {
			if (!selectedContentId) return;
			try {
				const response = await fetch(
					`/api/cms/media?contentId=${encodeURIComponent(selectedContentId)}&id=${encodeURIComponent(media.id)}`,
					{ method: "DELETE" },
				);
				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.error || "メディアの削除に失敗しました");
				}
				showSnackbar("メディアを削除しました", "success");
				setDeleteTarget(null);
				await fetchMedia(selectedContentId);
			} catch (error) {
				console.error("[Media] delete failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "メディアの削除に失敗しました",
					"error",
				);
			}
		},
		[fetchMedia, selectedContentId, showSnackbar],
	);

	const filteredMedia = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		return mediaItems.filter((item) => {
			if (tagFilter !== "all" && !(item.tags ?? []).includes(tagFilter)) {
				return false;
			}
			if (!query) return true;
			const tokens = [
				item.filename,
				item.alt,
				item.description,
				item.tags?.join(" "),
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return tokens.includes(query);
		});
	}, [mediaItems, tagFilter, searchQuery]);

	const uniqueTags = useMemo(() => {
		const tags = new Set<string>();
		mediaItems.forEach((item) => {
			item.tags?.forEach((tag) => tags.add(tag));
		});
		return Array.from(tags).sort();
	}, [mediaItems]);

	const selectedContent = contents?.find(
		(item) => item.id === selectedContentId,
	);

	const totalSize = mediaItems.reduce((acc, item) => acc + (item.size ?? 0), 0);

	return (
		<Box sx={{ display: "grid", gap: 4 }}>
			<PageHeader
				title="メディアライブラリ"
				description="コンテンツごとの画像・アセットを一元管理します。検索やタグフィルタで目的のメディアを素早く見つけ、詳細情報やプレビューを確認できます。"
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "Content", href: "/admin/content" },
					{ label: "Media" },
				]}
				actions={[
					<Button
						key="refresh"
						variant="outlined"
						startIcon={<RefreshCcw size={16} />}
						onClick={() =>
							selectedContentId && void fetchMedia(selectedContentId)
						}
					>
						更新
					</Button>,
					<Button
						key="upload"
						variant="contained"
						startIcon={<UploadCloud size={18} />}
						onClick={() => setIsUploadDialogOpen(true)}
						disabled={!selectedContentId}
					>
						メディアを追加
					</Button>,
				]}
			/>

			<Paper
				variant="outlined"
				sx={{ p: 3, display: "grid", gap: 2.5, borderColor: "divider" }}
			>
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={2}
					alignItems={{ xs: "stretch", md: "center" }}
				>
					<FormControl fullWidth>
						<InputLabel id="media-content-select-label">コンテンツ</InputLabel>
						<Select
							labelId="media-content-select-label"
							value={selectedContentId}
							label="コンテンツ"
							onChange={(event) => setSelectedContentId(event.target.value)}
							disabled={contentsLoading || (contents?.length ?? 0) === 0}
						>
							{contents?.map((content) => (
								<MenuItem key={content.id} value={content.id}>
									{content.title} ({content.id})
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						placeholder="ファイル名・タグ・説明で検索"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search size={16} />
								</InputAdornment>
							),
						}}
						sx={{ flex: 1 }}
					/>
					<FormControl size="small" sx={{ minWidth: 160 }}>
						<InputLabel id="media-tag-filter-label">タグ</InputLabel>
						<Select
							labelId="media-tag-filter-label"
							value={tagFilter}
							label="タグ"
							onChange={(event) => setTagFilter(event.target.value)}
						>
							<MenuItem value="all">すべて</MenuItem>
							{uniqueTags.map((tag) => (
								<MenuItem key={tag} value={tag}>
									{tag}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>

				{contentsError && (
					<Alert severity="error">
						コンテンツ一覧の取得に失敗しました。再読み込みしてください。
					</Alert>
				)}

				{selectedContent && (
					<Paper
						variant="outlined"
						sx={{
							p: 2.5,
							borderColor: "divider",
							bgcolor: "background.default",
						}}
					>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
							justifyContent="space-between"
						>
							<Box>
								<Typography variant="subtitle2" color="text.secondary">
									選択中のコンテンツ
								</Typography>
								<Typography variant="body1" fontWeight={600}>
									{selectedContent.title}
								</Typography>
								{selectedContent.summary && (
									<Typography variant="caption" color="text.secondary">
										{selectedContent.summary}
									</Typography>
								)}
							</Box>
							<Stack direction="row" spacing={1.5}>
								<StatItem label="メディア数" value={mediaItems.length} />
								<StatItem label="合計サイズ" value={formatBytes(totalSize)} />
							</Stack>
						</Stack>
					</Paper>
				)}

				{mediaLoading ? (
					<Box
						sx={{
							py: 10,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<CircularProgress size={32} />
					</Box>
				) : filteredMedia.length === 0 ? (
					<Box
						sx={{
							py: 10,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 1.5,
							textAlign: "center",
						}}
					>
						<ImageIcon size={40} color="#9ca3af" />
						<Typography variant="body1" fontWeight={600}>
							メディアが見つかりません
						</Typography>
						<Typography variant="body2" color="text.secondary">
							条件を変更するか、メディアをアップロードしてください。
						</Typography>
					</Box>
				) : (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "repeat(auto-fill, minmax(220px, 1fr))",
								md: "repeat(auto-fill, minmax(260px, 1fr))",
							},
							gap: 3,
						}}
					>
						{filteredMedia.map((media) => (
							<Card
								key={media.id}
								variant="outlined"
								sx={{ overflow: "hidden" }}
							>
								<Box
									sx={{
										position: "relative",
										height: 180,
										bgcolor: "grey.900",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									{media.preview ? (
										<Image
											src={media.preview}
											alt={media.alt || media.filename}
											fill
											sizes="320px"
											style={{ objectFit: "cover" }}
										/>
									) : (
										<ImageIcon size={32} color="#9ca3af" />
									)}
								</Box>
								<CardContent sx={{ display: "grid", gap: 1 }}>
									<Typography variant="subtitle2" fontWeight={600}>
										{media.filename}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{media.mimeType} ・ {formatBytes(media.size)}
									</Typography>
									{media.alt && (
										<Typography variant="caption" color="text.secondary">
											Alt: {media.alt}
										</Typography>
									)}
									{media.description && (
										<Typography variant="body2" color="text.secondary">
											{media.description}
										</Typography>
									)}
									{media.tags && media.tags.length > 0 && (
										<Stack
											direction="row"
											spacing={0.5}
											flexWrap="wrap"
											useFlexGap
										>
											{media.tags.map((tag) => (
												<Chip
													key={tag}
													label={tag}
													size="small"
													variant="outlined"
												/>
											))}
										</Stack>
									)}
									<Stack
										direction="row"
										spacing={0.5}
										justifyContent="flex-end"
									>
										<Tooltip title="メディアを削除">
											<IconButton
												size="small"
												color="error"
												onClick={() => setDeleteTarget(media)}
											>
												<Trash2 size={16} />
											</IconButton>
										</Tooltip>
									</Stack>
								</CardContent>
							</Card>
						))}
					</Box>
				)}
			</Paper>

			<Dialog
				open={isUploadDialogOpen}
				onClose={() => setIsUploadDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>メディアをアップロード</DialogTitle>
				<DialogContent>
					<MediaUploadForm
						onSubmit={handleUpload}
						onCancel={() => setIsUploadDialogOpen(false)}
						isLoading={isUploading}
						contentId={selectedContentId}
					/>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={Boolean(deleteTarget)}
				title="メディアを削除しますか？"
				description="この操作は元に戻せません。削除されたメディアはコンテンツからも参照できなくなります。"
				confirmLabel="削除する"
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => deleteTarget && void handleDelete(deleteTarget)}
			/>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={3200}
				onClose={closeSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={closeSnackbar}
					severity={snackbar.severity}
					variant="filled"
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}

function StatItem({ label, value }: { label: string; value: string | number }) {
	return (
		<Box
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: 1.5,
				px: 2,
				py: 1,
				display: "grid",
				gap: 0.25,
				minWidth: 120,
			}}
		>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body2" fontWeight={600}>
				{value}
			</Typography>
		</Box>
	);
}

async function readFileAsBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			resolve(result.split(",")[1] ?? "");
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}
