"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
	Alert,
	AlertColor,
	Box,
	Button,
	Chip,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	InputAdornment,
	MenuItem,
	Paper,
	Select,
	Snackbar,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
	CircularProgress,
	FormControl,
	InputLabel,
} from "@mui/material";
import {
	BarChart3,
	Edit2,
	FileText,
	PenSquare,
	Plus,
	RefreshCcw,
	Search,
	Trash2,
} from "lucide-react";
import type { MarkdownPage, MarkdownStats } from "@/cms/types/markdown";
import { MarkdownForm } from "@/components/admin/cms";
import { PageHeader } from "@/components/admin/layout";
import { ConfirmDialog } from "@/components/admin/ui";
import { useCmsResource } from "@/hooks/useCmsResource";

type StatusFilter = "all" | "draft" | "published" | "archived";
type SortField = "updatedAt" | "createdAt";
type SortOrder = "desc" | "asc";

interface SnackbarState {
	open: boolean;
	message: string;
	severity: AlertColor;
}

interface StatsDialogState {
	open: boolean;
	page: MarkdownPage | null;
	stats: MarkdownStats | null;
	loading: boolean;
}

const STATUS_OPTIONS: StatusFilter[] = [
	"all",
	"published",
	"draft",
	"archived",
];

function formatDate(value?: string) {
	if (!value) return "-";
	try {
		return new Date(value).toLocaleString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	} catch {
		return value;
	}
}

interface MarkdownFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	sortField: SortField;
	onSortFieldChange: (value: SortField) => void;
	sortOrder: SortOrder;
	onSortOrderChange: (value: SortOrder) => void;
	statusFilter: StatusFilter;
	onStatusFilterChange: (value: StatusFilter) => void;
}

function MarkdownFilters({
	searchQuery,
	onSearchChange,
	sortField,
	onSortFieldChange,
	sortOrder,
	onSortOrderChange,
	statusFilter,
	onStatusFilterChange,
}: MarkdownFiltersProps) {
	return (
		<>
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={2}
				alignItems={{ xs: "stretch", md: "center" }}
			>
				<TextField
					placeholder="タイトル・スラッグ・IDで検索"
					value={searchQuery}
					onChange={(event) => onSearchChange(event.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search size={16} />
							</InputAdornment>
						),
					}}
					sx={{ flex: 1 }}
				/>
				<FormControl size="small" sx={{ minWidth: 150 }}>
					<InputLabel id="markdown-sort-label">ソート</InputLabel>
					<Select
						labelId="markdown-sort-label"
						value={sortField}
						label="ソート"
						onChange={(event) =>
							onSortFieldChange(event.target.value as SortField)
						}
					>
						<MenuItem value="updatedAt">更新日</MenuItem>
						<MenuItem value="createdAt">作成日</MenuItem>
					</Select>
				</FormControl>
				<FormControl size="small" sx={{ minWidth: 120 }}>
					<InputLabel id="markdown-sort-order-label">順序</InputLabel>
					<Select
						labelId="markdown-sort-order-label"
						value={sortOrder}
						label="順序"
						onChange={(event) =>
							onSortOrderChange(event.target.value as SortOrder)
						}
					>
						<MenuItem value="desc">降順</MenuItem>
						<MenuItem value="asc">昇順</MenuItem>
					</Select>
				</FormControl>
			</Stack>

			<Stack direction="row" spacing={1} flexWrap="wrap">
				{STATUS_OPTIONS.map((option) => (
					<Chip
						key={option}
						label={option === "all" ? "すべて" : option.toUpperCase()}
						variant={statusFilter === option ? "filled" : "outlined"}
						color={statusFilter === option ? "primary" : "default"}
						size="small"
						onClick={() => onStatusFilterChange(option)}
					/>
				))}
			</Stack>
		</>
	);
}

interface MarkdownTableRowProps {
	page: MarkdownPage;
	onShowStats: (page: MarkdownPage) => void;
	onEdit: (page: MarkdownPage) => void;
	onDelete: (page: MarkdownPage) => void;
}

function MarkdownTableRow({
	page,
	onShowStats,
	onEdit,
	onDelete,
}: MarkdownTableRowProps) {
	return (
		<TableRow hover>
			<TableCell>
				<Stack spacing={0.5}>
					<Typography variant="body2" fontWeight={600}>
						{page.frontmatter?.title || page.slug}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{page.frontmatter?.description || "説明なし"}
					</Typography>
				</Stack>
			</TableCell>
			<TableCell>
				{page.contentId ? (
					<Chip
						label={page.contentId}
						size="small"
						variant="outlined"
					/>
				) : (
					<Chip
						label="未紐付け"
						size="small"
						color="warning"
						variant="outlined"
					/>
				)}
			</TableCell>
			<TableCell>
				<Chip
					label={page.status ?? "draft"}
					size="small"
					color={
						page.status === "published"
							? "success"
							: page.status === "archived"
								? "default"
								: "warning"
					}
				/>
			</TableCell>
			<TableCell>{formatDate(page.updatedAt)}</TableCell>
			<TableCell>{formatDate(page.createdAt)}</TableCell>
			<TableCell>
				<Typography variant="caption" color="text.secondary">
					{page.slug}
				</Typography>
			</TableCell>
			<TableCell align="right">
				<Stack
					direction="row"
					spacing={0.5}
					justifyContent="flex-end"
				>
					<Tooltip title="統計を見る">
						<IconButton
							size="small"
							onClick={() => onShowStats(page)}
						>
							<BarChart3 size={16} />
						</IconButton>
					</Tooltip>
					<Tooltip title="編集">
						<IconButton
							size="small"
							onClick={() => onEdit(page)}
						>
							<Edit2 size={16} />
						</IconButton>
					</Tooltip>
					<Tooltip title="削除">
						<IconButton
							size="small"
							color="error"
							onClick={() => onDelete(page)}
						>
							<Trash2 size={16} />
						</IconButton>
					</Tooltip>
				</Stack>
			</TableCell>
		</TableRow>
	);
}

interface MarkdownTableProps {
	pagesLoading: boolean;
	filteredPages: MarkdownPage[];
	onShowStats: (page: MarkdownPage) => void;
	onEdit: (page: MarkdownPage) => void;
	onDelete: (page: MarkdownPage) => void;
}

function MarkdownTable({
	pagesLoading,
	filteredPages,
	onShowStats,
	onEdit,
	onDelete,
}: MarkdownTableProps) {
	return (
		<TableContainer
			sx={{
				borderRadius: 2,
				border: 1,
				borderColor: "divider",
				maxHeight: 560,
			}}
		>
			<Table stickyHeader size="small">
				<TableHead>
					<TableRow>
						<TableCell>タイトル</TableCell>
						<TableCell sx={{ width: 140 }}>コンテンツID</TableCell>
						<TableCell sx={{ width: 110 }}>ステータス</TableCell>
						<TableCell sx={{ width: 160 }}>更新日</TableCell>
						<TableCell sx={{ width: 160 }}>作成日</TableCell>
						<TableCell sx={{ width: 180 }}>スラッグ</TableCell>
						<TableCell sx={{ width: 120 }} align="right">
							操作
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{pagesLoading ? (
						<TableRow>
							<TableCell colSpan={7} align="center" sx={{ py: 6 }}>
								<CircularProgress size={28} />
							</TableCell>
						</TableRow>
					) : filteredPages.length === 0 ? (
						<TableRow>
							<TableCell colSpan={7} align="center" sx={{ py: 6 }}>
								<Typography variant="body2" color="text.secondary">
									表示するMarkdownページがありません.条件を変更するか、新規作成してください.
								</Typography>
							</TableCell>
						</TableRow>
					) : (
						filteredPages.map((page) => (
							<MarkdownTableRow
								key={page.id}
								page={page}
								onShowStats={onShowStats}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

interface CreateMarkdownDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (payload: Partial<MarkdownPage>) => Promise<void>;
	isSubmitting: boolean;
}

function CreateMarkdownDialog({
	open,
	onClose,
	onSubmit,
	isSubmitting,
}: CreateMarkdownDialogProps) {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>新しいMarkdownページを作成</DialogTitle>
			<DialogContent>
				<MarkdownForm
					mode="create"
					onSubmit={onSubmit}
					onCancel={onClose}
					isLoading={isSubmitting}
				/>
			</DialogContent>
		</Dialog>
	);
}

interface EditMarkdownDialogProps {
	page: MarkdownPage | null;
	onClose: () => void;
	onSubmit: (payload: Partial<MarkdownPage>) => Promise<void>;
	isSubmitting: boolean;
}

function EditMarkdownDialog({
	page,
	onClose,
	onSubmit,
	isSubmitting,
}: EditMarkdownDialogProps) {
	return (
		<Dialog open={Boolean(page)} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Markdownページを編集</DialogTitle>
			<DialogContent>
				{page && (
					<MarkdownForm
						mode="edit"
						initialData={page}
						onSubmit={onSubmit}
						onCancel={onClose}
						isLoading={isSubmitting}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

interface MarkdownStatsDialogProps {
	dialog: StatsDialogState;
	onClose: () => void;
}

function MarkdownStatsDialog({ dialog, onClose }: MarkdownStatsDialogProps) {
	return (
		<Dialog open={dialog.open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>コンテンツ統計</DialogTitle>
			<DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
				{dialog.page && (
					<Box>
						<Typography variant="subtitle2" color="text.secondary">
							対象ページ
						</Typography>
						<Typography variant="body2" fontWeight={600}>
							{dialog.page.frontmatter?.title || dialog.page.slug}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							ID: {dialog.page.id} / スラッグ: {dialog.page.slug}
						</Typography>
					</Box>
				)}
				<Divider />
				{dialog.loading ? (
					<Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
						<CircularProgress size={28} />
					</Box>
				) : dialog.stats ? (
					<Stack spacing={1.5}>
						<StatsRow
							label="文字数"
							value={dialog.stats.characterCount}
						/>
						<StatsRow label="単語数" value={dialog.stats.wordCount} />
						<StatsRow
							label="見出し数"
							value={dialog.stats.headingCount}
						/>
						<StatsRow label="リンク数" value={dialog.stats.linkCount} />
						<StatsRow label="画像数" value={dialog.stats.imageCount} />
						<StatsRow label="行数" value={dialog.stats.lineCount} />
						<StatsRow
							label="推定読了時間"
							value={`${dialog.stats.readingTime.toFixed(1)} 分`}
						/>
					</Stack>
				) : (
					<Alert severity="warning">
						統計情報の取得に失敗しました.再度お試しください.
					</Alert>
				)}
			</DialogContent>
		</Dialog>
	);
}

interface ManagerSnackbarProps {
	snackbar: SnackbarState;
	onClose: () => void;
}

function ManagerSnackbar({ snackbar, onClose }: ManagerSnackbarProps) {
	return (
		<Snackbar
			open={snackbar.open}
			autoHideDuration={3200}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert
				onClose={onClose}
				severity={snackbar.severity}
				variant="filled"
			>
				{snackbar.message}
			</Alert>
		</Snackbar>
	);
}

export default function AdminMarkdownManager() {
	const {
		data: pages,
		loading: pagesLoading,
		error: pagesError,
		refresh: refreshPages,
	} = useCmsResource<MarkdownPage[]>("/api/cms/markdown", {
		parse: (raw) => (Array.isArray(raw) ? raw : []),
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sortField, setSortField] = useState<SortField>("updatedAt");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<MarkdownPage | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<MarkdownPage | null>(null);

	const [statsDialog, setStatsDialog] = useState<StatsDialogState>({
		open: false,
		page: null,
		stats: null,
		loading: false,
	});

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

	const filteredPages = useMemo(() => {
		const list = pages ?? [];
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return list
			.filter((page) => {
				if (statusFilter !== "all" && page.status !== statusFilter) {
					return false;
				}
				if (!normalizedQuery) return true;
				const tokens = [
					page.frontmatter?.title,
					page.slug,
					page.id,
					page.contentId,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();
				return tokens.includes(normalizedQuery);
			})
			.sort((a, b) => {
				const field = sortField;
				const aDate = new Date(a[field] ?? 0).getTime();
				const bDate = new Date(b[field] ?? 0).getTime();
				return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
			});
	}, [pages, searchQuery, statusFilter, sortField, sortOrder]);

	const handleRefresh = useCallback(() => {
		void refreshPages();
	}, [refreshPages]);

	const handleCreate = useCallback(
		async (payload: Partial<MarkdownPage>) => {
			setIsSubmitting(true);
			const response = await fetch("/api/cms/markdown", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			}).catch((networkError: unknown) => {
				console.error("[Markdown] create failed", networkError);
				return null;
			});
			if (!response) {
				showSnackbar("Markdownページの作成に失敗しました", "error");
				setIsSubmitting(false);
				return;
			}
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					(errorData as { error?: string }).error ||
					"Markdownページの作成に失敗しました";
				console.error("[Markdown] create failed", errorMessage);
				showSnackbar(errorMessage, "error");
				setIsSubmitting(false);
				return;
			}
			showSnackbar("Markdownページを作成しました", "success");
			setIsCreateDialogOpen(false);
			await refreshPages();
			setIsSubmitting(false);
		},
		[refreshPages, showSnackbar],
	);

	const handleUpdate = useCallback(
		async (payload: Partial<MarkdownPage>) => {
			setIsSubmitting(true);
			const response = await fetch("/api/cms/markdown", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			}).catch((networkError: unknown) => {
				console.error("[Markdown] update failed", networkError);
				return null;
			});
			if (!response) {
				showSnackbar("Markdownページの更新に失敗しました", "error");
				setIsSubmitting(false);
				return;
			}
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					(errorData as { error?: string }).error ||
					"Markdownページの更新に失敗しました";
				console.error("[Markdown] update failed", errorMessage);
				showSnackbar(errorMessage, "error");
				setIsSubmitting(false);
				return;
			}
			showSnackbar("Markdownページを更新しました", "success");
			setEditTarget(null);
			await refreshPages();
			setIsSubmitting(false);
		},
		[refreshPages, showSnackbar],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			const response = await fetch(`/api/cms/markdown?id=${id}`, {
				method: "DELETE",
			}).catch((networkError: unknown) => {
				console.error("[Markdown] delete failed", networkError);
				return null;
			});
			if (!response) {
				showSnackbar("Markdownページの削除に失敗しました", "error");
				return;
			}
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					(errorData as { error?: string }).error ||
					"Markdownページの削除に失敗しました";
				console.error("[Markdown] delete failed", errorMessage);
				showSnackbar(errorMessage, "error");
				return;
			}
			showSnackbar("Markdownページを削除しました", "success");
			setDeleteTarget(null);
			await refreshPages();
		},
		[refreshPages, showSnackbar],
	);

	const handleShowStats = useCallback(
		async (page: MarkdownPage) => {
			setStatsDialog({ open: true, page, stats: null, loading: true });
			const response = await fetch("/api/cms/markdown/stats", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ body: page.body }),
			}).catch((networkError: unknown) => {
				console.error("[Markdown] stats failed", networkError);
				return null;
			});
			if (!response) {
				showSnackbar("統計情報の取得に失敗しました", "error");
				setStatsDialog({ open: true, page, stats: null, loading: false });
				return;
			}
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					(errorData as { error?: string }).error ||
					"統計情報の取得に失敗しました";
				console.error("[Markdown] stats failed", errorMessage);
				showSnackbar(errorMessage, "error");
				setStatsDialog({ open: true, page, stats: null, loading: false });
				return;
			}
			const stats = (await response.json()) as MarkdownStats;
			setStatsDialog({ open: true, page, stats, loading: false });
		},
		[showSnackbar],
	);

	return (
		<Box sx={{ display: "grid", gap: 4 }}>
			<PageHeader
				title="Markdownページ管理"
				description="コンテンツに紐づくMarkdown本文を一覧・編集・分析します.検索とフィルタで対象ページを素早く特定し、統計情報から文章品質を確認できます."
				actions={[
					<Button
						key="refresh"
						variant="outlined"
						startIcon={<RefreshCcw size={16} />}
						onClick={handleRefresh}
					>
						更新
					</Button>,
					<Button
						key="create"
						variant="contained"
						startIcon={<Plus size={18} />}
						onClick={() => setIsCreateDialogOpen(true)}
					>
						新規Markdown
					</Button>,
				]}
			/>

			<Paper
				variant="outlined"
				sx={{ p: 3, display: "grid", gap: 2.5, borderColor: "divider" }}
			>
				<MarkdownFilters
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					sortField={sortField}
					onSortFieldChange={setSortField}
					sortOrder={sortOrder}
					onSortOrderChange={setSortOrder}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
				/>

				{pagesError && (
					<Alert severity="error">
						Markdownページの取得に失敗しました.再読み込みしてください.
					</Alert>
				)}

				<MarkdownTable
					pagesLoading={pagesLoading}
					filteredPages={filteredPages}
					onShowStats={handleShowStats}
					onEdit={setEditTarget}
					onDelete={setDeleteTarget}
				/>
			</Paper>

			<CreateMarkdownDialog
				open={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onSubmit={handleCreate}
				isSubmitting={isSubmitting}
			/>

			<EditMarkdownDialog
				page={editTarget}
				onClose={() => setEditTarget(null)}
				onSubmit={handleUpdate}
				isSubmitting={isSubmitting}
			/>

			<MarkdownStatsDialog
				dialog={statsDialog}
				onClose={() => setStatsDialog((prev) => ({ ...prev, open: false }))}
			/>

			<ConfirmDialog
				open={Boolean(deleteTarget)}
				title="Markdownページを削除しますか？"
				description="削除するとこのMarkdownファイルは復元できません.必要に応じて事前にエクスポートしてください."
				confirmLabel="削除する"
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => deleteTarget && void handleDelete(deleteTarget.id)}
			/>

			<ManagerSnackbar snackbar={snackbar} onClose={closeSnackbar} />
		</Box>
	);
}

function StatsRow({ label, value }: { label: string; value: string | number }) {
	return (
		<Stack
			direction="row"
			spacing={1}
			alignItems="center"
			justifyContent="space-between"
		>
			<Typography variant="body2" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body2" fontWeight={600}>
				{value}
			</Typography>
		</Stack>
	);
}
