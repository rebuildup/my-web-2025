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
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
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
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
	CircularProgress,
} from "@mui/material";
import {
	BarChart3,
	Database,
	Edit2,
	FileText,
	FolderOpen,
	Layers3,
	Plus,
	RefreshCcw,
	Search,
	Trash2,
} from "lucide-react";
import type { Content } from "@/cms/types/content";
import { ContentForm } from "@/components/admin/cms";
import { PageHeader } from "@/components/admin/layout";
import { ConfirmDialog } from "@/components/admin/ui";
import { useCmsResource } from "@/hooks/useCmsResource";

interface DbStats {
	totalContents: number;
	totalDbFiles: number;
	totalSize: number;
	contentsList: Array<{
		id: string;
		title: string;
		dbFile: string;
		size: number;
	}>;
}

type StatusFilter = "all" | "draft" | "published" | "archived";
type VisibilityFilter = "all" | "public" | "unlisted" | "private" | "draft";

interface SnackbarState {
	open: boolean;
	message: string;
	severity: AlertColor;
}

const STATUS_OPTIONS: StatusFilter[] = [
	"all",
	"published",
	"draft",
	"archived",
];
const VISIBILITY_OPTIONS: VisibilityFilter[] = [
	"all",
	"public",
	"unlisted",
	"private",
	"draft",
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

export default function AdminContentHome() {
	const {
		data: contents,
		loading: contentsLoading,
		error: contentsError,
		refresh: refreshContents,
		setData: setContents,
	} = useCmsResource<Content[]>("/api/cms/contents", {
		parse: (raw) => (Array.isArray(raw) ? raw : []),
	});
	const {
		data: stats,
		loading: statsLoading,
		error: statsError,
		refresh: refreshStats,
	} = useCmsResource<DbStats>("/api/cms/contents/stats");

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [visibilityFilter, setVisibilityFilter] =
		useState<VisibilityFilter>("all");
	const [sortField, setSortField] = useState<
		"updatedAt" | "createdAt" | "title"
	>("updatedAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Content | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [deleteTarget, setDeleteTarget] = useState<Content | null>(null);

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

	const handleRefresh = useCallback(() => {
		void refreshContents();
		void refreshStats();
	}, [refreshContents, refreshStats]);

	const filteredContents = useMemo(() => {
		const list = contents ?? [];
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return list
			.filter((item) => {
				if (statusFilter !== "all" && item.status !== statusFilter) {
					return false;
				}
				if (
					visibilityFilter !== "all" &&
					item.visibility !== visibilityFilter
				) {
					return false;
				}
				if (!normalizedQuery) return true;
				const tokens = [
					item.title,
					item.id,
					item.summary,
					item.tags?.join(" "),
					item.publicUrl,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();
				return tokens.includes(normalizedQuery);
			})
			.sort((a, b) => {
				if (sortField === "title") {
					const compare = (a.title || "").localeCompare(
						b.title || "",
						"ja-JP",
						{
							sensitivity: "base",
						},
					);
					return sortOrder === "asc" ? compare : -compare;
				}
				const aDate = new Date(a[sortField] ?? 0).getTime();
				const bDate = new Date(b[sortField] ?? 0).getTime();
				return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
			});
	}, [
		contents,
		searchQuery,
		statusFilter,
		visibilityFilter,
		sortField,
		sortOrder,
	]);

	const openEditDialog = useCallback((item: Content) => {
		setEditTarget({ ...item });
	}, []);

	const handleCreate = useCallback(
		async (payload: Partial<Content>) => {
			setIsSubmitting(true);
			try {
				const response = await fetch("/api/cms/contents", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.error || "コンテンツの作成に失敗しました");
				}
				showSnackbar("コンテンツを作成しました", "success");
				setIsCreateDialogOpen(false);
				await refreshContents();
				await refreshStats();
			} catch (error) {
				console.error("[Content] create failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "コンテンツの作成に失敗しました",
					"error",
				);
			} finally {
				setIsSubmitting(false);
			}
		},
		[refreshContents, refreshStats, showSnackbar],
	);

	const handleUpdate = useCallback(
		async (payload: Partial<Content>) => {
			setIsSubmitting(true);
			try {
				const response = await fetch("/api/cms/contents", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.error || "コンテンツの更新に失敗しました");
				}
				showSnackbar("コンテンツを更新しました", "success");
				setEditTarget(null);
				await refreshContents();
				await refreshStats();
			} catch (error) {
				console.error("[Content] update failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "コンテンツの更新に失敗しました",
					"error",
				);
			} finally {
				setIsSubmitting(false);
			}
		},
		[refreshContents, refreshStats, showSnackbar],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			try {
				const response = await fetch(`/api/cms/contents?id=${id}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.error || "コンテンツの削除に失敗しました");
				}
				showSnackbar("コンテンツを削除しました", "success");
				setDeleteTarget(null);
				await refreshContents();
				await refreshStats();
			} catch (error) {
				console.error("[Content] delete failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "コンテンツの削除に失敗しました",
					"error",
				);
			}
		},
		[refreshContents, refreshStats, showSnackbar],
	);

	return (
		<Box sx={{ display: "grid", gap: 4 }}>
			<PageHeader
				title="コンテンツ管理"
				description="コンテンツの作成・編集・公開状態・関連リソースを横断的に管理します。検索・フィルタ・ソートで大量のコンテンツも素早く絞り込み可能です。"
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "Content", href: "/admin/content" },
				]}
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
						新規コンテンツ
					</Button>,
				]}
			/>

			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={1.5}
				flexWrap="wrap"
			>
				<Button
					component={Link}
					href="/admin/content/markdown"
					variant="outlined"
					startIcon={<FileText size={16} />}
				>
					Markdown管理
				</Button>
				<Button
					component={Link}
					href="/admin/content/media"
					variant="outlined"
					startIcon={<FolderOpen size={16} />}
				>
					メディアライブラリ
				</Button>
				<Button
					component={Link}
					href="/admin/content/databases"
					variant="outlined"
					startIcon={<Database size={16} />}
				>
					データベース
				</Button>
				<Button
					component={Link}
					href="/admin/content/page-editor"
					variant="outlined"
					startIcon={<Layers3 size={16} />}
				>
					ブロックエディタ
				</Button>
			</Stack>

			<Box>
				<Typography
					variant="subtitle2"
					color="text.secondary"
					sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 0.6 }}
				>
					全体サマリー
				</Typography>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					flexWrap="wrap"
				>
					<StatCard
						title="登録コンテンツ"
						value={stats?.totalContents ?? 0}
						icon={FileText}
						loading={statsLoading}
					/>
					<StatCard
						title="コンテンツDB"
						value={stats?.totalDbFiles ?? 0}
						icon={Database}
						loading={statsLoading}
					/>
					<StatCard
						title="総容量"
						value={formatBytes(stats?.totalSize ?? 0)}
						icon={BarChart3}
						loading={statsLoading}
					/>
					<StatCard
						title="登録済み"
						value={stats?.contentsList?.length ?? 0}
						icon={FolderOpen}
						loading={statsLoading}
					/>
				</Stack>
				{statsError && (
					<Alert severity="warning" sx={{ mt: 2 }}>
						統計情報の取得に失敗しました。後ほど再試行してください。
					</Alert>
				)}
			</Box>

			<Paper
				variant="outlined"
				sx={{
					p: 3,
					borderColor: "divider",
					display: "grid",
					gap: 2.5,
				}}
			>
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={2}
					alignItems={{ xs: "stretch", md: "center" }}
				>
					<TextField
						placeholder="タイトル・ID・タグで検索"
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
						<InputLabel id="sort-field-label">ソート</InputLabel>
						<Select
							labelId="sort-field-label"
							value={sortField}
							label="ソート"
							onChange={(event) =>
								setSortField(event.target.value as typeof sortField)
							}
						>
							<MenuItem value="updatedAt">更新日</MenuItem>
							<MenuItem value="createdAt">作成日</MenuItem>
							<MenuItem value="title">タイトル</MenuItem>
						</Select>
					</FormControl>
					<FormControl size="small" sx={{ minWidth: 120 }}>
						<InputLabel id="sort-order-label">順序</InputLabel>
						<Select
							labelId="sort-order-label"
							value={sortOrder}
							label="順序"
							onChange={(event) =>
								setSortOrder(event.target.value as typeof sortOrder)
							}
						>
							<MenuItem value="desc">降順</MenuItem>
							<MenuItem value="asc">昇順</MenuItem>
						</Select>
					</FormControl>
				</Stack>

				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={1.5}
					alignItems={{ xs: "flex-start", md: "center" }}
					justifyContent="space-between"
				>
					<ToggleButtonGroup
						value={statusFilter}
						exclusive
						onChange={(_, value) => value && setStatusFilter(value)}
						size="small"
					>
						{STATUS_OPTIONS.map((option) => (
							<ToggleButton key={option} value={option}>
								{option === "all" ? "すべて" : option.toUpperCase()}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
					<ToggleButtonGroup
						value={visibilityFilter}
						exclusive
						onChange={(_, value) => value && setVisibilityFilter(value)}
						size="small"
					>
						{VISIBILITY_OPTIONS.map((option) => (
							<ToggleButton key={option} value={option}>
								{option === "all" ? "可視性:すべて" : option.toUpperCase()}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Stack>

				<Divider />

				{contentsError && (
					<Alert severity="error">
						コンテンツの取得に失敗しました。再読み込みしてください。
					</Alert>
				)}

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
								<TableCell sx={{ width: 32 }} />
								<TableCell>タイトル</TableCell>
								<TableCell sx={{ width: 120 }}>ステータス</TableCell>
								<TableCell sx={{ width: 130 }}>可視性</TableCell>
								<TableCell>タグ</TableCell>
								<TableCell sx={{ width: 170 }}>更新日</TableCell>
								<TableCell sx={{ width: 170 }}>作成日</TableCell>
								<TableCell sx={{ width: 160 }}>ID</TableCell>
								<TableCell sx={{ width: 96 }} align="right">
									操作
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{contentsLoading ? (
								<TableRow>
									<TableCell colSpan={9} align="center" sx={{ py: 6 }}>
										<CircularProgress size={28} />
									</TableCell>
								</TableRow>
							) : filteredContents.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} align="center" sx={{ py: 6 }}>
										<Typography variant="body2" color="text.secondary">
											表示するコンテンツがありません。条件を変更するか、新規コンテンツを作成してください。
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								filteredContents.map((content) => (
									<TableRow hover key={content.id}>
										<TableCell>
											<Tooltip title={content.publicUrl || "公開URL未設定"}>
												<span>🌐</span>
											</Tooltip>
										</TableCell>
										<TableCell>
											<Stack spacing={0.5}>
												<Typography variant="body2" fontWeight={600}>
													{content.title}
												</Typography>
												{content.summary && (
													<Typography variant="caption" color="text.secondary">
														{content.summary}
													</Typography>
												)}
											</Stack>
										</TableCell>
										<TableCell>
											<Chip
												size="small"
												label={content.status ?? "draft"}
												color={
													content.status === "published"
														? "success"
														: content.status === "archived"
															? "default"
															: "warning"
												}
											/>
										</TableCell>
										<TableCell>
											<Chip
												size="small"
												variant="outlined"
												label={content.visibility ?? "draft"}
											/>
										</TableCell>
										<TableCell>
											<Stack
												direction="row"
												spacing={0.5}
												flexWrap="wrap"
												useFlexGap
											>
												{content.tags?.slice(0, 3).map((tag) => (
													<Chip
														key={tag}
														label={tag}
														size="small"
														variant="outlined"
													/>
												))}
												{content.tags && content.tags.length > 3 && (
													<Chip
														label={`+${content.tags.length - 3}`}
														size="small"
														variant="filled"
													/>
												)}
											</Stack>
										</TableCell>
										<TableCell>{formatDate(content.updatedAt)}</TableCell>
										<TableCell>{formatDate(content.createdAt)}</TableCell>
										<TableCell>
											<Typography variant="caption" color="text.secondary">
												{content.id}
											</Typography>
										</TableCell>
										<TableCell align="right">
											<Stack
												direction="row"
												spacing={0.5}
												justifyContent="flex-end"
											>
												<Tooltip title="編集">
													<IconButton
														size="small"
														onClick={() => openEditDialog(content)}
													>
														<Edit2 size={16} />
													</IconButton>
												</Tooltip>
												<Tooltip title="削除">
													<IconButton
														size="small"
														color="error"
														onClick={() => setDeleteTarget(content)}
													>
														<Trash2 size={16} />
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			<Dialog
				open={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>新しいコンテンツを作成</DialogTitle>
				<DialogContent>
					<ContentForm
						mode="create"
						onSubmit={handleCreate}
						onCancel={() => setIsCreateDialogOpen(false)}
						isLoading={isSubmitting}
					/>
				</DialogContent>
			</Dialog>

			<Dialog
				open={Boolean(editTarget)}
				onClose={() => setEditTarget(null)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>コンテンツを編集</DialogTitle>
				<DialogContent>
					{editTarget && (
						<ContentForm
							mode="edit"
							initialData={editTarget}
							onSubmit={handleUpdate}
							onCancel={() => setEditTarget(null)}
							isLoading={isSubmitting}
						/>
					)}
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={Boolean(deleteTarget)}
				title="コンテンツを削除しますか？"
				description="関連するMarkdownやメディアは保持されますが、コンテンツ本体のデータベースは失われます。必要であれば事前にバックアップを取得してください。"
				confirmLabel="削除する"
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => deleteTarget && void handleDelete(deleteTarget.id)}
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

interface StatCardProps {
	title: string;
	value: string | number;
	icon: React.ComponentType<{ size?: number }>;
	loading?: boolean;
}

function StatCard({ title, value, icon: Icon, loading }: StatCardProps) {
	return (
		<Paper
			variant="outlined"
			sx={{
				flex: 1,
				minWidth: 200,
				borderColor: "divider",
				px: 3,
				py: 2.5,
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			<Stack direction="row" spacing={1.5} alignItems="center">
				<Box
					sx={{
						width: 36,
						height: 36,
						borderRadius: 1.5,
						bgcolor: "action.hover",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "primary.main",
					}}
				>
					<Icon size={18} />
				</Box>
				<Typography variant="subtitle2" color="text.secondary">
					{title}
				</Typography>
			</Stack>
			<Typography variant="h5" fontWeight={700}>
				{loading ? "…" : value}
			</Typography>
		</Paper>
	);
}
