"use client";

import {
	type CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	BarChart3,
	Edit2,
	Plus,
	RefreshCcw,
	Search,
	Trash2,
} from "lucide-react";
import type { MarkdownPage, MarkdownStats } from "@/cms/types/markdown";
import { MarkdownForm } from "@/components/admin/cms";
import { PageHeader } from "@/components/admin/layout";
import {
	ConfirmDialog,
	SimpleSelect,
	type SimpleSelectOption,
} from "@/components/admin/ui";
import { adminColor } from "@/components/admin/ui/tokens";
import { useCmsResource } from "@/hooks/useCmsResource";

type StatusFilter = "all" | "draft" | "published" | "archived";
type SortField = "updatedAt" | "createdAt";
type SortOrder = "desc" | "asc";
type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface SnackbarState {
	open: boolean;
	message: string;
	severity: SnackbarSeverity;
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

const severityPalette: Record<
	SnackbarSeverity,
	{ bg: string; fg: string; border: string }
> = {
	success: { bg: adminColor.success, fg: "#ffffff", border: adminColor.success },
	error: { bg: adminColor.error, fg: "#ffffff", border: adminColor.error },
	info: { bg: adminColor.info, fg: "#ffffff", border: adminColor.info },
	warning: {
		bg: adminColor.warning,
		fg: "#ffffff",
		border: adminColor.warning,
	},
};

const statusChipPalette: Record<
	"primary" | "success" | "warning" | "default" | "outlined-warning" | "outlined-default",
	{ bg: string; fg: string; border: string }
> = {
	primary: {
		bg: "rgba(44, 123, 229, 0.12)",
		fg: adminColor.accent,
		border: adminColor.accent,
	},
	success: {
		bg: "rgba(22, 101, 52, 0.12)",
		fg: adminColor.success,
		border: adminColor.success,
	},
	warning: {
		bg: "rgba(180, 83, 9, 0.12)",
		fg: adminColor.warning,
		border: adminColor.warning,
	},
	default: {
		bg: "#f3f4f6",
		fg: adminColor.textSecondary,
		border: adminColor.border,
	},
	"outlined-warning": {
		bg: "transparent",
		fg: adminColor.warning,
		border: adminColor.warning,
	},
	"outlined-default": {
		bg: "transparent",
		fg: adminColor.textSecondary,
		border: adminColor.border,
	},
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

const primaryButtonStyle: CSSProperties = {
	...outlinedButtonStyle,
	color: "#ffffff",
	backgroundColor: adminColor.accent,
	border: `1px solid ${adminColor.accent}`,
};

const panelStyle: CSSProperties = {
	border: `1px solid ${adminColor.border}`,
	borderRadius: 8,
	padding: 24,
	backgroundColor: adminColor.bgPanel,
	display: "grid",
	gap: 20,
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

const dialogSurfaceBase: CSSProperties = {
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

const searchWrapStyle: CSSProperties = {
	flex: 1,
	minWidth: 0,
	display: "flex",
	alignItems: "center",
	gap: 8,
	padding: "0 12px",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	backgroundColor: "#ffffff",
};

const tableWrapStyle: CSSProperties = {
	border: `1px solid ${adminColor.border}`,
	borderRadius: 8,
	overflow: "auto",
	maxHeight: 560,
	backgroundColor: adminColor.bgPanel,
};

const tableStyle: CSSProperties = {
	width: "100%",
	borderCollapse: "separate",
	borderSpacing: 0,
	fontSize: 14,
};

const thStyle: CSSProperties = {
	position: "sticky",
	top: 0,
	padding: "10px 12px",
	backgroundColor: adminColor.bgPage,
	color: adminColor.textSecondary,
	fontSize: 12,
	fontWeight: 600,
	textAlign: "left",
	borderBottom: `1px solid ${adminColor.border}`,
	whiteSpace: "nowrap",
};

const tdStyle: CSSProperties = {
	padding: "10px 12px",
	borderBottom: `1px solid ${adminColor.border}`,
	verticalAlign: "top",
	color: adminColor.textPrimary,
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

const chipStyle = (
	variant: keyof typeof statusChipPalette,
): CSSProperties => {
	const c = statusChipPalette[variant];
	return {
		display: "inline-flex",
		alignItems: "center",
		padding: "2px 10px",
		fontSize: 12,
		fontWeight: 500,
		color: c.fg,
		backgroundColor: c.bg,
		border: `1px solid ${c.border}`,
		borderRadius: 999,
	};
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

const dividerStyle: CSSProperties = {
	height: 1,
	backgroundColor: adminColor.border,
	border: "none",
	margin: "8px 0",
};

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
	const sortOptions: SimpleSelectOption[] = [
		{ value: "updatedAt", label: "更新日" },
		{ value: "createdAt", label: "作成日" },
	];
	const orderOptions: SimpleSelectOption[] = [
		{ value: "desc", label: "降順" },
		{ value: "asc", label: "昇順" },
	];

	return (
		<div style={{ display: "grid", gap: 12 }}>
			<div
				style={{
					display: "flex",
					gap: 16,
					flexWrap: "wrap",
					alignItems: "center",
				}}
			>
				<label style={searchWrapStyle}>
					<Search size={16} color={adminColor.textSecondary} />
					<input
						placeholder="タイトル・スラッグ・IDで検索"
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
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
				<div style={{ minWidth: 150 }}>
					<SimpleSelect
						size="small"
						label="ソート"
						value={sortField}
						options={sortOptions}
						onChange={(value) => onSortFieldChange(value as SortField)}
						fullWidth
					/>
				</div>
				<div style={{ minWidth: 120 }}>
					<SimpleSelect
						size="small"
						label="順序"
						value={sortOrder}
						options={orderOptions}
						onChange={(value) => onSortOrderChange(value as SortOrder)}
						fullWidth
					/>
				</div>
			</div>
			<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
				{STATUS_OPTIONS.map((option) => {
					const active = statusFilter === option;
					return (
						<button
							key={option}
							type="button"
							onClick={() => onStatusFilterChange(option)}
							aria-pressed={active}
							style={chipStyle(active ? "primary" : "default")}
						>
							{option === "all" ? "すべて" : option.toUpperCase()}
						</button>
					);
				})}
			</div>
		</div>
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
	const status = (page.status ?? "draft") as "published" | "draft" | "archived";
	const statusVariant: keyof typeof statusChipPalette =
		status === "published"
			? "success"
			: status === "archived"
				? "default"
				: "warning";

	return (
		<tr>
			<td style={tdStyle}>
				<div style={{ display: "grid", gap: 2 }}>
					<span style={{ fontSize: 14, fontWeight: 600 }}>
						{page.frontmatter?.title || page.slug}
					</span>
					<span style={{ fontSize: 12, color: adminColor.textSecondary }}>
						{page.frontmatter?.description || "説明なし"}
					</span>
				</div>
			</td>
			<td style={tdStyle}>
				{page.contentId ? (
					<span style={chipStyle("outlined-default")}>{page.contentId}</span>
				) : (
					<span style={chipStyle("outlined-warning")}>未紐付け</span>
				)}
			</td>
			<td style={tdStyle}>
				<span style={chipStyle(statusVariant)}>{status}</span>
			</td>
			<td style={tdStyle}>{formatDate(page.updatedAt)}</td>
			<td style={tdStyle}>{formatDate(page.createdAt)}</td>
			<td style={tdStyle}>
				<span style={{ fontSize: 12, color: adminColor.textSecondary }}>
					{page.slug}
				</span>
			</td>
			<td style={{ ...tdStyle, textAlign: "right" }}>
				<div
					style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}
				>
					<button
						type="button"
						onClick={() => onShowStats(page)}
						aria-label="統計を見る"
						title="統計を見る"
						style={iconButtonStyle(adminColor.textPrimary)}
					>
						<BarChart3 size={16} />
					</button>
					<button
						type="button"
						onClick={() => onEdit(page)}
						aria-label="編集"
						title="編集"
						style={iconButtonStyle(adminColor.textPrimary)}
					>
						<Edit2 size={16} />
					</button>
					<button
						type="button"
						onClick={() => onDelete(page)}
						aria-label="削除"
						title="削除"
						style={iconButtonStyle(adminColor.error)}
					>
						<Trash2 size={16} />
					</button>
				</div>
			</td>
		</tr>
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
		<div style={tableWrapStyle}>
			<table style={tableStyle}>
				<thead>
					<tr>
						<th style={thStyle}>タイトル</th>
						<th style={{ ...thStyle, width: 140 }}>コンテンツID</th>
						<th style={{ ...thStyle, width: 110 }}>ステータス</th>
						<th style={{ ...thStyle, width: 160 }}>更新日</th>
						<th style={{ ...thStyle, width: 160 }}>作成日</th>
						<th style={{ ...thStyle, width: 180 }}>スラッグ</th>
						<th style={{ ...thStyle, width: 120, textAlign: "right" }}>
							操作
						</th>
					</tr>
				</thead>
				<tbody>
					{pagesLoading ? (
						<tr>
							<td
								colSpan={7}
								style={{
									...tdStyle,
									textAlign: "center",
									padding: "48px 12px",
								}}
							>
								<div
									aria-label="Loading"
									style={{
										width: 28,
										height: 28,
										borderRadius: "50%",
										border: `3px solid ${adminColor.border}`,
										borderTopColor: adminColor.accent,
										margin: "0 auto",
									}}
								/>
							</td>
						</tr>
					) : filteredPages.length === 0 ? (
						<tr>
							<td
								colSpan={7}
								style={{
									...tdStyle,
									textAlign: "center",
									padding: "48px 12px",
									color: adminColor.textSecondary,
								}}
							>
								表示するMarkdownページがありません.条件を変更するか、新規作成してください.
							</td>
						</tr>
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
				</tbody>
			</table>
		</div>
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
	if (!open) return null;
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="新しいMarkdownページを作成"
			style={dialogBackdropStyle}
			onClick={onClose}
		>
			<div
				style={{ ...dialogSurfaceBase, width: "min(720px, calc(100vw - 32px))" }}
				onClick={(event) => event.stopPropagation()}
			>
				<header style={dialogHeaderStyle}>新しいMarkdownページを作成</header>
				<div style={dialogBodyStyle}>
					<MarkdownForm
						mode="create"
						onSubmit={onSubmit}
						onCancel={onClose}
						isLoading={isSubmitting}
					/>
				</div>
			</div>
		</div>
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
	if (!page) return null;
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Markdownページを編集"
			style={dialogBackdropStyle}
			onClick={onClose}
		>
			<div
				style={{ ...dialogSurfaceBase, width: "min(720px, calc(100vw - 32px))" }}
				onClick={(event) => event.stopPropagation()}
			>
				<header style={dialogHeaderStyle}>Markdownページを編集</header>
				<div style={dialogBodyStyle}>
					<MarkdownForm
						mode="edit"
						initialData={page}
						onSubmit={onSubmit}
						onCancel={onClose}
						isLoading={isSubmitting}
					/>
				</div>
			</div>
		</div>
	);
}

interface MarkdownStatsDialogProps {
	dialog: StatsDialogState;
	onClose: () => void;
}

function MarkdownStatsDialog({ dialog, onClose }: MarkdownStatsDialogProps) {
	if (!dialog.open) return null;
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="コンテンツ統計"
			style={dialogBackdropStyle}
			onClick={onClose}
		>
			<div
				style={{ ...dialogSurfaceBase, width: "min(640px, calc(100vw - 32px))" }}
				onClick={(event) => event.stopPropagation()}
			>
				<header style={dialogHeaderStyle}>コンテンツ統計</header>
				<div style={{ ...dialogBodyStyle, display: "grid", gap: 16, paddingTop: 8 }}>
					{dialog.page && (
						<div>
							<p
								style={{
									margin: 0,
									fontSize: 13,
									fontWeight: 600,
									color: adminColor.textSecondary,
								}}
							>
								対象ページ
							</p>
							<p style={{ margin: "4px 0 0 0", fontSize: 14, fontWeight: 600 }}>
								{dialog.page.frontmatter?.title || dialog.page.slug}
							</p>
							<p
								style={{
									margin: "4px 0 0 0",
									fontSize: 12,
									color: adminColor.textSecondary,
								}}
							>
								ID: {dialog.page.id} / スラッグ: {dialog.page.slug}
							</p>
						</div>
					)}
					<hr style={dividerStyle} />
					{dialog.loading ? (
						<div
							style={{
								padding: "24px 0",
								display: "flex",
								justifyContent: "center",
							}}
						>
							<div
								aria-label="Loading"
								style={{
									width: 28,
									height: 28,
									borderRadius: "50%",
									border: `3px solid ${adminColor.border}`,
									borderTopColor: adminColor.accent,
								}}
							/>
						</div>
					) : dialog.stats ? (
						<div style={{ display: "grid", gap: 12 }}>
							<StatsRow label="文字数" value={dialog.stats.characterCount} />
							<StatsRow label="単語数" value={dialog.stats.wordCount} />
							<StatsRow label="見出し数" value={dialog.stats.headingCount} />
							<StatsRow label="リンク数" value={dialog.stats.linkCount} />
							<StatsRow label="画像数" value={dialog.stats.imageCount} />
							<StatsRow label="行数" value={dialog.stats.lineCount} />
							<StatsRow
								label="推定読了時間"
								value={`${dialog.stats.readingTime.toFixed(1)} 分`}
							/>
						</div>
					) : (
						<div role="alert" style={alertStyle}>
							統計情報の取得に失敗しました.再度お試しください.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function StatsRow({ label, value }: { label: string; value: string | number }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 8,
			}}
		>
			<span style={{ fontSize: 14, color: adminColor.textSecondary }}>
				{label}
			</span>
			<span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
		</div>
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

	const showSnackbar = useCallback(
		(message: string, severity: SnackbarSeverity) => {
			setSnackbar({ open: true, message, severity });
		},
		[],
	);

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
		<div style={{ display: "grid", gap: 32 }}>
			<PageHeader
				title="Markdownページ管理"
				description="コンテンツに紐づくMarkdown本文を一覧・編集・分析します.検索とフィルタで対象ページを素早く特定し、統計情報から文章品質を確認できます."
				actions={[
					<button
						key="refresh"
						type="button"
						onClick={handleRefresh}
						style={outlinedButtonStyle}
					>
						<RefreshCcw size={16} />
						更新
					</button>,
					<button
						key="create"
						type="button"
						onClick={() => setIsCreateDialogOpen(true)}
						style={primaryButtonStyle}
					>
						<Plus size={18} />
						新規Markdown
					</button>,
				]}
			/>

			<section style={panelStyle}>
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
					<div role="alert" style={alertStyle}>
						Markdownページの取得に失敗しました.再読み込みしてください.
					</div>
				)}

				<MarkdownTable
					pagesLoading={pagesLoading}
					filteredPages={filteredPages}
					onShowStats={handleShowStats}
					onEdit={setEditTarget}
					onDelete={setDeleteTarget}
				/>
			</section>

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
