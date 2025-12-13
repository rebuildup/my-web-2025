
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    AlertColor,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
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
    NoSsr,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import {
    CalendarClock,
    Edit2,
    ExternalLink,
    FilterX,
    FolderOpen,
    Plus,
    RefreshCcw,
    Search,
    Tag as TagIcon,
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
type SortField = "updatedAt" | "createdAt" | "publishedAt" | "title";

type SnackbarState = {
    open: boolean;
    message: string;
    severity: AlertColor;
};

const STATUS_OPTIONS: StatusFilter[] = ["all", "published", "draft", "archived"];
const VISIBILITY_OPTIONS: VisibilityFilter[] = ["all", "public", "unlisted", "private", "draft"];

const STATUS_LABEL: Record<StatusFilter, string> = {
    all: "全ステータス",
    published: "公開",
    draft: "下書き",
    archived: "アーカイブ",
};

const VISIBILITY_LABEL: Record<VisibilityFilter, string> = {
    all: "公開範囲:すべて",
    public: "公開",
    unlisted: "限定公開",
    private: "非公開",
    draft: "下書き",
};

const SORT_LABEL: Record<SortField, string> = {
    updatedAt: "更新日",
    createdAt: "作成日",
    publishedAt: "公開日",
    title: "タイトル",
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function formatDate(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return dateFormatter.format(date);
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
    return value.toFixed(value >= 10 || index === 0 ? 0 : 1) + " " + units[index];
}

function getThumbnailUrl(content: Content) {
    const variants = content.thumbnails;
    if (!variants) return null;
    const prefer = variants.prefer || ["webm", "gif", "image"];
    for (const key of prefer) {
        if (key === "image" && variants.image?.src) return variants.image.src;
        if (key === "gif" && variants.gif?.src) return variants.gif.src;
        if (key === "webm" && variants.webm?.poster) return variants.webm.poster;
    }
    if (variants.image?.src) return variants.image.src;
    if (variants.gif?.src) return variants.gif?.src;
    if (variants.webm?.poster) return variants.webm.poster;
    return null;
}

function StatCard({ title, value, loading }: { title: string; value: string | number; loading?: boolean }) {
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
            <Typography variant="subtitle2" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ minHeight: 40, display: "flex", alignItems: "center" }}>
                {loading ? "…" : value}
            </Typography>
        </Paper>
    );
}

export default function AdminContentPage() {
	const {
		data: contents,
		loading: contentsLoading,
		error: contentsError,
		refresh: refreshContents,
	} = useCmsResource<Content[]>("/api/cms/contents", {
		parse: (raw) => (Array.isArray(raw) ? (raw as Content[]) : []),
	});
	const {
		data: stats,
		loading: statsLoading,
		error: statsError,
		refresh: refreshStats,
	} = useCmsResource<DbStats>("/api/cms/contents/stats");

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Content | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Content | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [createStatus, setCreateStatus] = useState<Content["status"]>("draft");
	const [createVisibility, setCreateVisibility] = useState<Content["visibility"]>("draft");

	const handleRefresh = useCallback(() => {
		void refreshContents();
		void refreshStats();
	}, [refreshContents, refreshStats]);

	const handleCreate = useCallback(
		async (payload: Partial<Content>) => {
			setSubmitting(true);
			const res = await fetch("/api/cms/contents", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				let errMsg = "作成に失敗しました";
				try {
					const err = await res.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[content] create failed", errMsg);
				setSubmitting(false);
				return;
			}
			setIsCreateOpen(false);
			await handleRefresh();
			setSubmitting(false);
		},
		[handleRefresh],
	);

	const handleUpdate = useCallback(
		async (payload: Partial<Content>) => {
			setSubmitting(true);
			const res = await fetch("/api/cms/contents", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				let errMsg = "更新に失敗しました";
				try {
					const err = await res.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[content] update failed", errMsg);
				setSubmitting(false);
				return;
			}
			setEditTarget(null);
			await handleRefresh();
			setSubmitting(false);
		},
		[handleRefresh],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			const res = await fetch(`/api/cms/contents?id=${encodeURIComponent(id)}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				let errMsg = "削除に失敗しました";
				try {
					const err = await res.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[content] delete failed", errMsg);
				return;
			}
			setDeleteTarget(null);
			await handleRefresh();
		},
		[handleRefresh],
	);

	return (
		<NoSsr>
			<Box sx={{ display: "grid", gap: 4 }}>
			<PageHeader
				title="コンテンツ管理"
				description="コンテンツの作成・編集・公開状態を管理します。"
				actions={[
					<Button key="refresh" variant="outlined" onClick={handleRefresh} startIcon={<RefreshCcw size={16} />}>更新</Button>,
					<Button key="create" variant="contained" startIcon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>新規コンテンツ</Button>,
				]}
			/>

			<Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
				<StatCard title="登録コンテンツ" value={contents?.length ?? 0} loading={contentsLoading} />
				<StatCard title="コンテンツDB" value={stats?.totalDbFiles ?? 0} loading={statsLoading} />
				<StatCard title="総容量" value={stats ? formatBytes(stats.totalSize) : "-"} loading={statsLoading} />
			</Stack>

			{(contentsError || statsError) && (
				<Alert severity="warning">データの取得に失敗しました。再読み込みしてください。</Alert>
			)}

			<Paper variant="outlined" sx={{ p: 0, borderColor: "divider" }}>
				<TableContainer sx={{ maxHeight: 560 }}>
					<Table stickyHeader size="small">
						<TableHead>
							<TableRow>
								<TableCell sx={{ width: 32 }} />
								<TableCell sx={{ width: 80 }}>サムネイル</TableCell>
								<TableCell>タイトル</TableCell>
								<TableCell sx={{ width: 120 }}>ステータス</TableCell>
								<TableCell sx={{ width: 130 }}>可視性</TableCell>
								<TableCell sx={{ width: 170 }}>更新日</TableCell>
								<TableCell sx={{ width: 160 }}>ID</TableCell>
								<TableCell sx={{ width: 120 }} align="right">操作</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{contentsLoading ? (
								<TableRow>
									<TableCell colSpan={8} align="center" sx={{ py: 6 }}>
										<CircularProgress size={28} />
									</TableCell>
								</TableRow>
							) : (contents ?? []).length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} align="center" sx={{ py: 6 }}>
										<Typography variant="body2" color="text.secondary">表示するコンテンツがありません。</Typography>
									</TableCell>
								</TableRow>
							) : (
								(contents ?? []).map((content) => {
									const thumb = getThumbnailUrl(content);
									return (
										<TableRow hover key={content.id}>
											<TableCell>🌐</TableCell>
											<TableCell>
												{thumb ? (
													<Box component="img" src={thumb} alt={content.title} sx={{ width: 48, height: 48, objectFit: "cover", borderRadius: 1, border: 1, borderColor: "divider" }} />
												) : (
													<Box sx={{ width: 48, height: 48, borderRadius: 1, border: 1, borderColor: "divider", bgcolor: "action.hover" }} />
												)}
											</TableCell>
											<TableCell>
												<Stack spacing={0.5}>
													<Typography variant="body2" fontWeight={600}>{content.title}</Typography>
													{content.summary && (
														<Typography variant="caption" color="text.secondary">{content.summary}</Typography>
													)}
												</Stack>
											</TableCell>
											<TableCell>
												<Chip size="small" label={content.status ?? "draft"} />
											</TableCell>
											<TableCell>
												<Chip size="small" variant="outlined" label={content.visibility ?? "draft"} />
											</TableCell>
											<TableCell>{formatDate(content.updatedAt as string)}</TableCell>
											<TableCell>
												<Typography variant="caption" color="text.secondary">{content.id}</Typography>
											</TableCell>
											<TableCell align="right">
												<Stack direction="row" spacing={0.5} justifyContent="flex-end">
													<Tooltip title="編集">
														<IconButton
															size="small"
															onClick={async () => {
																// 完全なコンテンツデータを取得
																try {
																	const res = await fetch(
																		`/api/cms/contents?id=${encodeURIComponent(content.id)}`,
																	);
																	if (res.ok) {
																		const fullContent = await res.json();
																		setEditTarget(fullContent);
																	} else {
																		// フォールバック: 一覧データを使用
																		setEditTarget(content);
																	}
																} catch (error) {
																	// エラー時は一覧データを使用
																	setEditTarget(content);
																}
															}}
														>
															<Edit2 size={16} />
														</IconButton>
													</Tooltip>
													<Tooltip title="削除">
														<IconButton size="small" color="error" onClick={() => setDeleteTarget(content)}>
															<Trash2 size={16} />
														</IconButton>
													</Tooltip>
												</Stack>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Create Dialog */}
			<Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Typography variant="h6">新しいコンテンツを作成</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<FormControl size="small" sx={{ minWidth: 140 }}>
								<InputLabel id="create-status">公開ステータス</InputLabel>
								<Select
									labelId="create-status"
									label="公開ステータス"
									value={createStatus}
									onChange={(e) => setCreateStatus(e.target.value as Content["status"])}
								>
									<MenuItem value="draft">draft</MenuItem>
									<MenuItem value="published">published</MenuItem>
									<MenuItem value="archived">archived</MenuItem>
								</Select>
							</FormControl>
							<FormControl size="small" sx={{ minWidth: 140 }}>
								<InputLabel id="create-visibility">可視性</InputLabel>
								<Select
									labelId="create-visibility"
									label="可視性"
									value={createVisibility}
									onChange={(e) => setCreateVisibility(e.target.value as Content["visibility"])}
								>
									<MenuItem value="draft">draft</MenuItem>
									<MenuItem value="public">public</MenuItem>
									<MenuItem value="unlisted">unlisted</MenuItem>
									<MenuItem value="private">private</MenuItem>
								</Select>
							</FormControl>
						</Stack>
					</Stack>
				</DialogTitle>
				<DialogContent>
					<ContentForm
						mode="create"
						isLoading={submitting}
						onSubmit={handleCreate}
						onCancel={() => setIsCreateOpen(false)}
						controlledStatus={createStatus}
						controlledVisibility={createVisibility}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={Boolean(editTarget)} onClose={() => setEditTarget(null)} maxWidth="md" fullWidth>
				<DialogTitle>
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Typography variant="h6">コンテンツを編集</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<FormControl size="small" sx={{ minWidth: 140 }}>
								<InputLabel id="edit-status">公開ステータス</InputLabel>
								<Select labelId="edit-status" label="公開ステータス" value={editTarget?.status ?? "draft"} onChange={(e) => setEditTarget((prev: any) => prev ? { ...prev, status: e.target.value } : prev)}>
									<MenuItem value="draft">draft</MenuItem>
									<MenuItem value="published">published</MenuItem>
									<MenuItem value="archived">archived</MenuItem>
								</Select>
							</FormControl>
							<FormControl size="small" sx={{ minWidth: 140 }}>
								<InputLabel id="edit-visibility">可視性</InputLabel>
								<Select labelId="edit-visibility" label="可視性" value={editTarget?.visibility ?? "draft"} onChange={(e) => setEditTarget((prev: any) => prev ? { ...prev, visibility: e.target.value } : prev)}>
									<MenuItem value="draft">draft</MenuItem>
									<MenuItem value="public">public</MenuItem>
									<MenuItem value="unlisted">unlisted</MenuItem>
									<MenuItem value="private">private</MenuItem>
								</Select>
							</FormControl>
						</Stack>
					</Stack>
				</DialogTitle>
				<DialogContent>
					{editTarget && (
						<ContentForm mode="edit" initialData={editTarget} isLoading={submitting} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} controlledStatus={editTarget.status} controlledVisibility={editTarget.visibility} />
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirm */}
			<ConfirmDialog
				open={Boolean(deleteTarget)}
				title="コンテンツを削除しますか？"
				description="この操作は取り消せません。関連するDBが削除されます。"
				confirmLabel="削除する"
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => deleteTarget && void handleDelete(deleteTarget.id)}
			/>
			</Box>
		</NoSsr>
	);
}
