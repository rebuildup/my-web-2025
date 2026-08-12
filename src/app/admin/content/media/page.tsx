"use client";

import Image from "next/image";
import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
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
import { getCmsApiBaseUrl } from "@/lib/cms-api/config";
import {
	ConfirmDialog,
	SimpleSelect,
	type SimpleSelectOption,
} from "@/components/admin/ui";
import { adminColor } from "@/components/admin/ui/tokens";
import { useCmsResource } from "@/hooks/useCmsResource";

interface MediaWithPreview extends MediaItem {
	preview?: string;
}

type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface SnackbarState {
	open: boolean;
	message: string;
	severity: SnackbarSeverity;
}

const severityPalette: Record<
	SnackbarSeverity,
	{ bg: string; fg: string; border: string }
> = {
	success: {
		bg: adminColor.success,
		fg: "#ffffff",
		border: adminColor.success,
	},
	error: { bg: adminColor.error, fg: "#ffffff", border: adminColor.error },
	info: { bg: adminColor.info, fg: "#ffffff", border: adminColor.info },
	warning: {
		bg: adminColor.warning,
		fg: "#ffffff",
		border: adminColor.warning,
	},
};

const primaryButtonStyle: CSSProperties = {
	padding: "8px 18px",
	fontSize: 14,
	fontWeight: 600,
	color: "#ffffff",
	backgroundColor: adminColor.accent,
	border: `1px solid ${adminColor.accent}`,
	borderRadius: 6,
	cursor: "pointer",
	display: "inline-flex",
	alignItems: "center",
	gap: 6,
};

const outlinedButtonStyle: CSSProperties = {
	padding: "8px 18px",
	fontSize: 14,
	fontWeight: 600,
	color: adminColor.textPrimary,
	backgroundColor: "transparent",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	cursor: "pointer",
	display: "inline-flex",
	alignItems: "center",
	gap: 6,
};

const disabledPrimaryStyle: CSSProperties = {
	...primaryButtonStyle,
	opacity: 0.5,
	cursor: "not-allowed",
};

const panelStyle: CSSProperties = {
	border: `1px solid ${adminColor.border}`,
	borderRadius: 8,
	padding: 24,
	backgroundColor: adminColor.bgPanel,
	display: "grid",
	gap: 20,
};

const cardStyle: CSSProperties = {
	border: `1px solid ${adminColor.border}`,
	borderRadius: 8,
	overflow: "hidden",
	backgroundColor: adminColor.bgPanel,
};

const searchWrapStyle: CSSProperties = {
	flex: 1,
	display: "flex",
	alignItems: "center",
	gap: 8,
	padding: "0 12px",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	backgroundColor: "#ffffff",
};

const chipStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	padding: "2px 10px",
	fontSize: 12,
	fontWeight: 500,
	color: adminColor.textSecondary,
	backgroundColor: "#f3f4f6",
	border: `1px solid ${adminColor.border}`,
	borderRadius: 999,
};

const iconButtonStyle = (color: string): CSSProperties => ({
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	padding: 6,
	backgroundColor: "transparent",
	color,
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	cursor: "pointer",
});

const snackbarStyle = (severity: SnackbarSeverity): CSSProperties => {
	const p = severityPalette[severity];
	return {
		position: "fixed",
		left: "50%",
		bottom: 24,
		transform: "translateX(-50%)",
		padding: "10px 20px",
		fontSize: 14,
		fontWeight: 500,
		color: p.fg,
		backgroundColor: p.bg,
		borderRadius: 6,
		boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
		zIndex: 1500,
		display: "inline-flex",
		alignItems: "center",
		gap: 12,
	};
};

const dialogBackdropStyle: CSSProperties = {
	position: "fixed",
	inset: 0,
	backgroundColor: "rgba(0,0,0,0.5)",
	display: "flex",
	alignItems: "flex-start",
	justifyContent: "center",
	paddingTop: 64,
	zIndex: 1400,
};

const dialogSurfaceStyle: CSSProperties = {
	width: "min(640px, calc(100vw - 32px))",
	backgroundColor: adminColor.bgPanel,
	borderRadius: 8,
	boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
	overflow: "hidden",
	maxHeight: "calc(100vh - 96px)",
	display: "flex",
	flexDirection: "column",
};

const dialogHeaderStyle: CSSProperties = {
	padding: "16px 24px",
	borderBottom: `1px solid ${adminColor.border}`,
	fontSize: 16,
	fontWeight: 600,
	color: adminColor.textPrimary,
};

const dialogBodyStyle: CSSProperties = {
	padding: 24,
	overflowY: "auto",
};

const alertStyle: CSSProperties = {
	padding: "8px 16px",
	fontSize: 14,
	borderRadius: 4,
	border: `1px solid ${adminColor.error}`,
	borderLeftWidth: 4,
	backgroundColor: "rgba(185, 28, 28, 0.08)",
	color: adminColor.error,
};

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

function StatItem({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<div
			style={{
				border: `1px solid ${adminColor.border}`,
				borderRadius: 6,
				padding: "4px 16px",
				display: "grid",
				gap: 2,
				minWidth: 120,
			}}
		>
			<span style={{ fontSize: 12, color: adminColor.textSecondary }}>
				{label}
			</span>
			<span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
		</div>
	);
}

interface MediaHeaderProps {
	selectedContentId: string;
	onRefresh: () => void;
	onOpenUpload: () => void;
}

function MediaHeader({
	selectedContentId,
	onRefresh,
	onOpenUpload,
}: MediaHeaderProps) {
	return (
		<PageHeader
			title="メディアライブラリ"
			description="コンテンツごとの画像・アセットを一元管理します.検索やタグフィルタで目的のメディアを素早く見つけ、詳細情報やプレビューを確認できます."
			actions={[
				<button
					key="refresh"
					type="button"
					onClick={onRefresh}
					style={outlinedButtonStyle}
				>
					<RefreshCcw size={16} />
					更新
				</button>,
				<button
					key="upload"
					type="button"
					onClick={onOpenUpload}
					disabled={!selectedContentId}
					style={selectedContentId ? primaryButtonStyle : disabledPrimaryStyle}
				>
					<UploadCloud size={18} />
					メディアを追加
				</button>,
			]}
		/>
	);
}

interface MediaFiltersProps {
	contents: Content[] | undefined;
	contentsLoading: boolean;
	selectedContentId: string;
	searchQuery: string;
	tagFilter: string;
	uniqueTags: string[];
	onSelectContent: (contentId: string) => void;
	onSearch: (query: string) => void;
	onFilterTag: (tag: string) => void;
}

function MediaFilters({
	contents,
	contentsLoading,
	selectedContentId,
	searchQuery,
	tagFilter,
	uniqueTags,
	onSelectContent,
	onSearch,
	onFilterTag,
}: MediaFiltersProps) {
	const contentOptions: SimpleSelectOption[] = (contents ?? []).map((content) => ({
		value: content.id,
		label: `${content.title} (${content.id})`,
	}));
	const tagOptions: SimpleSelectOption[] = [
		{ value: "all", label: "すべて" },
		...uniqueTags.map((tag) => ({ value: tag, label: tag })),
	];

	return (
		<div
			style={{
				display: "flex",
				gap: 16,
				flexWrap: "wrap",
				alignItems: "center",
			}}
		>
			<div style={{ flex: 1, minWidth: 0 }}>
				<SimpleSelect
					label="コンテンツ"
					value={selectedContentId}
					options={contentOptions}
					onChange={onSelectContent}
					disabled={contentsLoading || contentOptions.length === 0}
					fullWidth
				/>
			</div>
			<label style={searchWrapStyle}>
				<Search size={16} color={adminColor.textSecondary} />
				<input
					placeholder="ファイル名・タグ・説明で検索"
					value={searchQuery}
					onChange={(event) => onSearch(event.target.value)}
					style={{
						flex: 1,
						padding: "8px 0",
						fontSize: 14,
						color: adminColor.textPrimary,
						backgroundColor: "transparent",
						border: "none",
						outline: "none",
					}}
				/>
			</label>
			<div style={{ minWidth: 160 }}>
				<SimpleSelect
					label="タグ"
					value={tagFilter}
					options={tagOptions}
					onChange={onFilterTag}
					size="small"
					fullWidth
				/>
			</div>
		</div>
	);
}

interface SelectedContentSummaryProps {
	selectedContent: Content;
	mediaCount: number;
	totalSize: number;
}

function SelectedContentSummary({
	selectedContent,
	mediaCount,
	totalSize,
}: SelectedContentSummaryProps) {
	return (
		<section
			style={{
				padding: 20,
				border: `1px solid ${adminColor.border}`,
				borderRadius: 8,
				backgroundColor: adminColor.bgPage,
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					gap: 16,
					flexWrap: "wrap",
				}}
			>
				<div>
					<p
						style={{
							margin: 0,
							fontSize: 13,
							fontWeight: 600,
							color: adminColor.textSecondary,
						}}
					>
						選択中のコンテンツ
					</p>
					<p
						style={{
							margin: "4px 0 0 0",
							fontSize: 14,
							fontWeight: 600,
						}}
					>
						{selectedContent.title}
					</p>
					{selectedContent.summary && (
						<p
							style={{
								margin: "4px 0 0 0",
								fontSize: 12,
								color: adminColor.textSecondary,
							}}
						>
							{selectedContent.summary}
						</p>
					)}
				</div>
				<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
					<StatItem label="メディア数" value={mediaCount} />
					<StatItem label="合計サイズ" value={formatBytes(totalSize)} />
				</div>
			</div>
		</section>
	);
}

interface MediaGridProps {
	mediaLoading: boolean;
	filteredMedia: MediaWithPreview[];
	onDelete: (media: MediaWithPreview) => void;
}

function MediaGrid({ mediaLoading, filteredMedia, onDelete }: MediaGridProps) {
	if (mediaLoading) {
		return (
			<div
				style={{
					paddingTop: 80,
					paddingBottom: 80,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					aria-label="Loading"
					style={{
						width: 32,
						height: 32,
						borderRadius: "50%",
						border: `3px solid ${adminColor.border}`,
						borderTopColor: adminColor.accent,
					}}
				/>
			</div>
		);
	}

	if (filteredMedia.length === 0) {
		return (
			<div
				style={{
					paddingTop: 80,
					paddingBottom: 80,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 12,
					textAlign: "center",
				}}
			>
				<ImageIcon size={40} color={adminColor.textDisabled} />
				<p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
					メディアが見つかりません
				</p>
				<p
					style={{
						margin: 0,
						fontSize: 13,
						color: adminColor.textSecondary,
					}}
				>
					条件を変更するか、メディアをアップロードしてください.
				</p>
			</div>
		);
	}

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns:
					"repeat(auto-fill, minmax(220px, 1fr))",
				gap: 24,
			}}
		>
			{filteredMedia.map((media) => (
				<MediaCard key={media.id} media={media} onDelete={onDelete} />
			))}
		</div>
	);
}

interface MediaCardProps {
	media: MediaWithPreview;
	onDelete: (media: MediaWithPreview) => void;
}

function MediaCard({ media, onDelete }: MediaCardProps) {
	return (
		<section style={cardStyle}>
			<div
				style={{
					position: "relative",
					height: 180,
					backgroundColor: "#111827",
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
					<ImageIcon size={32} color={adminColor.textDisabled} />
				)}
			</div>
			<div
				style={{
					padding: 16,
					display: "grid",
					gap: 8,
				}}
			>
				<p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
					{media.filename}
				</p>
				<p
					style={{
						margin: 0,
						fontSize: 12,
						color: adminColor.textSecondary,
					}}
				>
					{media.mimeType} ・ {formatBytes(media.size)}
				</p>
				{media.alt && (
					<p
						style={{
							margin: 0,
							fontSize: 12,
							color: adminColor.textSecondary,
						}}
					>
						Alt: {media.alt}
					</p>
				)}
				{media.description && (
					<p
						style={{
							margin: 0,
							fontSize: 13,
							color: adminColor.textSecondary,
						}}
					>
						{media.description}
					</p>
				)}
				{media.tags && media.tags.length > 0 && (
					<div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
						{media.tags.map((tag) => (
							<span key={tag} style={chipStyle}>
								{tag}
							</span>
						))}
					</div>
				)}
				<div
					style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}
				>
					<button
						type="button"
						onClick={() => onDelete(media)}
						aria-label="メディアを削除"
						title="メディアを削除"
						style={iconButtonStyle(adminColor.error)}
					>
						<Trash2 size={16} />
					</button>
				</div>
			</div>
		</section>
	);
}

interface MediaDialogsProps {
	isUploadDialogOpen: boolean;
	isUploading: boolean;
	selectedContentId: string;
	deleteTarget: MediaWithPreview | null;
	snackbar: SnackbarState;
	onCloseUpload: () => void;
	onUpload: (formData: FormData) => Promise<void>;
	onCancelDelete: () => void;
	onConfirmDelete: () => void;
	onCloseSnackbar: () => void;
}

function MediaDialogs({
	isUploadDialogOpen,
	isUploading,
	selectedContentId,
	deleteTarget,
	snackbar,
	onCloseUpload,
	onUpload,
	onCancelDelete,
	onConfirmDelete,
	onCloseSnackbar,
}: MediaDialogsProps) {
	return (
		<>
			{isUploadDialogOpen && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="メディアをアップロード"
					style={dialogBackdropStyle}
					onClick={onCloseUpload}
				>
					<div
						style={dialogSurfaceStyle}
						onClick={(event) => event.stopPropagation()}
					>
						<header style={dialogHeaderStyle}>メディアをアップロード</header>
						<div style={dialogBodyStyle}>
							<MediaUploadForm
								onSubmit={onUpload}
								onCancel={onCloseUpload}
								isLoading={isUploading}
								contentId={selectedContentId}
							/>
						</div>
					</div>
				</div>
			)}

			<ConfirmDialog
				open={Boolean(deleteTarget)}
				title="メディアを削除しますか？"
				description="この操作は元に戻せません.削除されたメディアはコンテンツからも参照できなくなります."
				confirmLabel="削除する"
				onCancel={onCancelDelete}
				onConfirm={onConfirmDelete}
			/>
		</>
	);
}

function SnackbarAutoClose({
	open,
	onClose,
	duration,
	children,
}: {
	open: boolean;
	onClose: () => void;
	duration: number;
	children: ReactNode;
}) {
	useEffect(() => {
		if (!open) return;
		const id = window.setTimeout(onClose, duration);
		return () => window.clearTimeout(id);
	}, [open, duration, onClose]);
	if (!open) return null;
	return <>{children}</>;
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

	const showSnackbar = useCallback(
		(message: string, severity: SnackbarSeverity) => {
			setSnackbar({ open: true, message, severity });
		},
		[],
	);

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
			const response = await fetch(
				`${getCmsApiBaseUrl()}/media?contentId=${encodeURIComponent(contentId)}`,
			);
			if (!response.ok) {
				const errMsg = `メディアの取得に失敗しました (${response.status})`;
				console.error("[Media] fetch failed", errMsg);
				showSnackbar(errMsg, "error");
				setMediaItems([]);
				setMediaLoading(false);
				return;
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
					const detailResponse = await fetch(
						`${getCmsApiBaseUrl()}/media?contentId=${encodeURIComponent(contentId)}&id=${encodeURIComponent(item.id)}&raw=1`,
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
					return item;
				}),
			);
			setMediaItems(itemsWithPreview);
			setMediaLoading(false);
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

			const response = await fetch(`${getCmsApiBaseUrl()}/media`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!response.ok) {
				let errMsg = "メディアのアップロードに失敗しました";
				try {
					const err = await response.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[Media] upload failed", errMsg);
				showSnackbar(errMsg, "error");
				setIsUploading(false);
				return;
			}
			showSnackbar("メディアをアップロードしました", "success");
			setIsUploadDialogOpen(false);
			if (contentId === selectedContentId) {
				await fetchMedia(contentId);
			}
			setIsUploading(false);
		},
		[fetchMedia, selectedContentId, showSnackbar],
	);

	const handleDelete = useCallback(
		async (media: MediaWithPreview) => {
			if (!selectedContentId) return;
			const response = await fetch(
				`${getCmsApiBaseUrl()}/media?contentId=${encodeURIComponent(selectedContentId)}&id=${encodeURIComponent(media.id)}`,
				{ method: "DELETE" },
			);
			if (!response.ok) {
				let errMsg = "メディアの削除に失敗しました";
				try {
					const err = await response.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[Media] delete failed", errMsg);
				showSnackbar(errMsg, "error");
				return;
			}
			showSnackbar("メディアを削除しました", "success");
			setDeleteTarget(null);
			await fetchMedia(selectedContentId);
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
		<div style={{ display: "grid", gap: 32 }}>
			<MediaHeader
				selectedContentId={selectedContentId}
				onRefresh={() => selectedContentId && void fetchMedia(selectedContentId)}
				onOpenUpload={() => setIsUploadDialogOpen(true)}
			/>

			<section style={panelStyle}>
				<MediaFilters
					contents={contents}
					contentsLoading={contentsLoading}
					selectedContentId={selectedContentId}
					searchQuery={searchQuery}
					tagFilter={tagFilter}
					uniqueTags={uniqueTags}
					onSelectContent={setSelectedContentId}
					onSearch={setSearchQuery}
					onFilterTag={setTagFilter}
				/>

				{contentsError && (
					<div role="alert" style={alertStyle}>
						コンテンツ一覧の取得に失敗しました.再読み込みしてください.
					</div>
				)}

				{selectedContent && (
					<SelectedContentSummary
						selectedContent={selectedContent}
						mediaCount={mediaItems.length}
						totalSize={totalSize}
					/>
				)}

				<MediaGrid
					mediaLoading={mediaLoading}
					filteredMedia={filteredMedia}
					onDelete={setDeleteTarget}
				/>
			</section>

			<MediaDialogs
				isUploadDialogOpen={isUploadDialogOpen}
				isUploading={isUploading}
				selectedContentId={selectedContentId}
				deleteTarget={deleteTarget}
				snackbar={snackbar}
				onCloseUpload={() => setIsUploadDialogOpen(false)}
				onUpload={handleUpload}
				onCancelDelete={() => setDeleteTarget(null)}
				onConfirmDelete={() => deleteTarget && void handleDelete(deleteTarget)}
				onCloseSnackbar={closeSnackbar}
			/>

			<SnackbarAutoClose
				open={snackbar.open}
				onClose={closeSnackbar}
				duration={3200}
			>
				<div role="status" style={snackbarStyle(snackbar.severity)}>
					<span>{snackbar.message}</span>
					<button
						type="button"
						onClick={closeSnackbar}
						aria-label="閉じる"
						style={{
							background: "transparent",
							border: "none",
							color: "inherit",
							cursor: "pointer",
							fontSize: 16,
							lineHeight: 1,
						}}
					>
						×
					</button>
				</div>
			</SnackbarAutoClose>
		</div>
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
