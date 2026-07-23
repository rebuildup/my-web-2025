"use client";

import Link from "next/link";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
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
	Divider,
	Grid,
	Paper,
	Snackbar,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import {
	Database,
	HardDrive,
	RefreshCcw,
	ServerCog,
	Trash2,
	UploadCloud,
	FileText,
	FolderOpen,
	PenSquare,
} from "lucide-react";
import { PageHeader } from "@/components/admin/layout";
import { ConfirmDialog } from "@/components/admin/ui";
import { useCmsResource } from "@/hooks/useCmsResource";

interface DatabaseInfo {
	id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	size: number;
	isActive: boolean;
}

interface DatabaseStats {
	contentsCount: number;
	markdownPagesCount: number;
	tagsCount: number;
	fileSize: number;
}

interface SnackbarState {
	open: boolean;
	message: string;
	severity: AlertColor;
}

interface DatabaseSummary {
	total: number;
	activeName: string;
	totalSize: number;
}

function DatabaseHeader({ onRefresh }: { onRefresh: () => void | Promise<void> }) {
	return (
		<PageHeader
			title="データベース管理"
			description="現在 Rust CMS API が利用している SQLite データベースを確認します. Next.js 側では参照とメタ情報編集のみ行い、実行時の切替や削除は Rust 側で管理します."
			actions={[
				<Button
					key="refresh"
					variant="outlined"
					startIcon={<RefreshCcw size={16} />}
					onClick={onRefresh}
				>
					更新
				</Button>,
			]}
		/>
	);
}

function DatabaseActionPanel({
	database,
	onRefreshStats,
	onEdit,
}: {
	database: DatabaseInfo;
	onRefreshStats: (databaseId: string) => Promise<void>;
	onEdit: (database: DatabaseInfo) => void;
}) {
	return (
		<Stack direction="row" spacing={1} flexWrap="wrap">
			<Button
				size="small"
				variant="outlined"
				startIcon={<RefreshCcw size={14} />}
				onClick={() => void onRefreshStats(database.id)}
			>
				統計を更新
			</Button>
			<Button
				size="small"
				variant="outlined"
				startIcon={<ServerCog size={14} />}
				onClick={() => onEdit(database)}
			>
				情報を編集
			</Button>
		</Stack>
	);
}

function DatabaseCard({
	database,
	stats,
	onRefreshStats,
	onEdit,
}: {
	database: DatabaseInfo;
	stats?: DatabaseStats;
	onRefreshStats: (databaseId: string) => Promise<void>;
	onEdit: (database: DatabaseInfo) => void;
}) {
	const isActive = database.isActive;

	return (
		<Grid item xs={12} md={6} key={database.id}>
			<Card
				variant="outlined"
				sx={{
					height: "100%",
					borderColor: isActive ? "primary.main" : "divider",
					bgcolor: isActive ? "action.hover" : "background.paper",
				}}
			>
				<CardContent sx={{ display: "grid", gap: 2 }}>
					<Stack
						direction="row"
						spacing={2}
						justifyContent="space-between"
						alignItems="flex-start"
					>
						<Box>
							<Typography variant="h6" fontWeight={600}>
								{database.name || database.id}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{database.description || "説明が設定されていません"}
							</Typography>
						</Box>
						<Chip
							label={isActive ? "アクティブ" : "バックアップ"}
							color={isActive ? "primary" : "default"}
							size="small"
						/>
					</Stack>

					<Stack direction="row" spacing={1.5} flexWrap="wrap">
						<InfoPill
							icon={<HardDrive size={16} />}
							label="更新日"
							value={new Date(database.updatedAt).toLocaleString("ja-JP")}
						/>
						<InfoPill
							icon={<Database size={16} />}
							label="サイズ"
							value={formatBytes(database.size)}
						/>
					</Stack>

					<Divider />

					{stats ? (
						<Stack direction="row" spacing={1.5} flexWrap="wrap">
							<StatBadge
								label="コンテンツ"
								value={stats.contentsCount}
							/>
							<StatBadge
								label="Markdown"
								value={stats.markdownPagesCount}
							/>
							<StatBadge label="タグ" value={stats.tagsCount} />
							<StatBadge
								label="合計サイズ"
								value={formatBytes(stats.fileSize)}
							/>
						</Stack>
					) : (
						<Typography variant="caption" color="text.secondary">
							統計情報を取得しています...
						</Typography>
					)}

					<DatabaseActionPanel
						database={database}
						onRefreshStats={onRefreshStats}
						onEdit={onEdit}
					/>
				</CardContent>
			</Card>
		</Grid>
	);
}

function DatabaseListSection({
	databaseList,
	statsMap,
	summary,
	databaseError,
	loadingDatabases,
	onRefreshStats,
	onEdit,
}: {
	databaseList: DatabaseInfo[] | null | undefined;
	statsMap: Record<string, DatabaseStats>;
	summary: DatabaseSummary;
	databaseError: unknown;
	loadingDatabases: boolean;
	onRefreshStats: (databaseId: string) => Promise<void>;
	onEdit: (database: DatabaseInfo) => void;
}) {
	return (
		<Paper
			variant="outlined"
			sx={{ p: 3, borderColor: "divider", display: "grid", gap: 3 }}
		>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={2}
				justifyContent="space-between"
				alignItems={{ xs: "flex-start", sm: "center" }}
			>
				<Box>
					<Typography variant="subtitle2" color="text.secondary">
						アクティブデータベース
					</Typography>
					<Typography variant="h6" fontWeight={700}>
						{summary.activeName}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						合計 {summary.total} 件 ・ 総容量 {formatBytes(summary.totalSize)}
					</Typography>
				</Box>
			</Stack>

			{databaseError && (
				<Alert severity="error">
					データベース一覧の取得に失敗しました.再読み込みしてください.
				</Alert>
			)}

			<Grid container spacing={2.5}>
				{(databaseList ?? []).map((database) => (
					<DatabaseCard
						database={database}
						stats={statsMap[database.id]}
						onRefreshStats={onRefreshStats}
						onEdit={onEdit}
						key={database.id}
					/>
				))}
			</Grid>

			{loadingDatabases && (
				<Typography variant="body2" color="text.secondary">
					データベース情報を読み込んでいます...
				</Typography>
			)}
		</Paper>
	);
}

function DatabaseModals({
	isEditDialogOpen,
	editingDatabase,
	onClose,
	onSubmit,
	isSubmitting,
}: {
	isEditDialogOpen: boolean;
	editingDatabase: DatabaseInfo | null;
	onClose: () => void;
	onSubmit: (payload: Partial<DatabaseInfo>) => void | Promise<void>;
	isSubmitting: boolean;
}) {
	return (
		<Dialog open={isEditDialogOpen} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>データベース情報を編集</DialogTitle>
			<DialogContent>
				{editingDatabase && (
					<DatabaseForm
						initialData={editingDatabase}
						onSubmit={onSubmit}
						onCancel={onClose}
						isLoading={isSubmitting}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function DatabaseFooter({
	snackbar,
	onClose,
}: {
	snackbar: SnackbarState;
	onClose: () => void;
}) {
	return (
		<Snackbar
			open={snackbar.open}
			autoHideDuration={3200}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
		>
			<Alert onClose={onClose} severity={snackbar.severity} variant="filled">
				{snackbar.message}
			</Alert>
		</Snackbar>
	);
}

export default function AdminDatabaseManager() {
	const {
		data: databaseList,
		loading: loadingDatabases,
		error: databaseError,
		refresh: refreshDatabases,
	} = useCmsResource<DatabaseInfo[]>("/api/cms/databases", {
		parse: (raw) => {
			if (Array.isArray(raw)) return raw as DatabaseInfo[];
			if (raw && Array.isArray(raw.databases)) {
				return raw.databases as DatabaseInfo[];
			}
			return [];
		},
	});
	const [statsMap, setStatsMap] = useState<Record<string, DatabaseStats>>({});
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingDatabase, setEditingDatabase] = useState<DatabaseInfo | null>(
		null,
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [deleteTarget, setDeleteTarget] = useState<DatabaseInfo | null>(null);
	const [switchTarget, setSwitchTarget] = useState<DatabaseInfo | null>(null);

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

	const fetchStats = useCallback(
		async (databaseId: string) => {
			const response = await fetch(
				`/api/cms/databases/stats?id=${encodeURIComponent(databaseId)}`,
			);
			if (!response.ok) {
				// 404エラーの場合は、データベースが存在しない可能性があるため、静かに処理
				if (response.status === 404) {
					// 統計情報を取得できなかったことを記録するだけ
					// エラーをスローせず、統計情報を表示しない
					return;
				}
				let errMsg = `Failed to fetch stats: ${response.status}`;
				try {
					const err = await response.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[Database] stats failed", errMsg);
				showSnackbar(errMsg, "error");
				return;
			}
			const data = (await response.json()) as DatabaseStats;
			setStatsMap((prev) => ({ ...prev, [databaseId]: data }));
		},
		[showSnackbar],
	);

	const reloadData = useCallback(async () => {
		await refreshDatabases();
	}, [refreshDatabases]);

	useEffect(() => {
		if (!databaseList) return;
		databaseList.forEach((db) => {
			if (!statsMap[db.id]) {
				void fetchStats(db.id);
			}
		});
	}, [databaseList, fetchStats, statsMap]);

	const handleCreate = useCallback(
		async (payload: Partial<DatabaseInfo>) => {
			setIsSubmitting(true);
			const response = await fetch("/api/cms/databases", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "create", ...payload }),
			});
			if (!response.ok) {
				let errMsg = "データベースの作成に失敗しました";
				try {
					const err = await response.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[Database] create failed", errMsg);
				showSnackbar(errMsg, "error");
				setIsSubmitting(false);
				return;
			}
			showSnackbar("データベースを作成しました", "success");
			setIsCreateDialogOpen(false);
			const created = await response.json();
			await reloadData();
			if (created?.id) {
				await fetchStats(created.id);
			}
			setIsSubmitting(false);
		},
		[fetchStats, reloadData, showSnackbar],
	);

	const handleEdit = useCallback(
		async (payload: Partial<DatabaseInfo>) => {
			setIsSubmitting(true);
			const response = await fetch("/api/cms/databases", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!response.ok) {
				let errMsg = "データベースの更新に失敗しました";
				try {
					const err = await response.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[Database] update failed", errMsg);
				showSnackbar(errMsg, "error");
				setIsSubmitting(false);
				return;
			}
			showSnackbar("データベース情報を更新しました", "success");
			setEditingDatabase(null);
			setIsEditDialogOpen(false);
			await reloadData();
			setIsSubmitting(false);
		},
		[reloadData, showSnackbar],
	);

	const handleDelete = useCallback(
		async (database: DatabaseInfo) => {
			const response = await fetch(
				`/api/cms/databases?id=${encodeURIComponent(database.id)}`,
				{ method: "DELETE" },
			);
			if (!response.ok) {
				let errMsg = "データベースの削除に失敗しました（アクティブ状態を確認してください）";
				try {
					const err = await response.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[Database] delete failed", errMsg);
				showSnackbar(errMsg, "error");
				return;
			}
			showSnackbar("データベースを削除しました", "success");
			setDeleteTarget(null);
			setStatsMap((prev) => {
				const updated = { ...prev };
				delete updated[database.id];
				return updated;
			});
			await reloadData();
		},
		[reloadData, showSnackbar],
	);

	const handleSwitch = useCallback(
		async (database: DatabaseInfo) => {
			const response = await fetch("/api/cms/databases", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "switch", id: database.id }),
			});
			if (!response.ok) {
				let errMsg = "データベースの切り替えに失敗しました";
				try {
					const err = await response.json();
					if (err.error) {
						errMsg = err.error;
					}
				} catch {
					// ignore parse errors
				}
				console.error("[Database] switch failed", errMsg);
				showSnackbar(errMsg, "error");
				return;
			}
			showSnackbar("アクティブなデータベースを切り替えました", "success");
			setSwitchTarget(null);
			await reloadData();
		},
		[reloadData, showSnackbar],
	);

	const openEditDialog = useCallback((database: DatabaseInfo) => {
		setEditingDatabase(database);
		setIsEditDialogOpen(true);
	}, []);

	const closeEditDialog = useCallback(() => {
		setIsEditDialogOpen(false);
		setEditingDatabase(null);
	}, []);

	const summary = useMemo(() => {
		const list = databaseList ?? [];
		const active = list.find((db) => db.isActive);
		const totalSize = list.reduce((acc, db) => acc + db.size, 0);
		return {
			total: list.length,
			activeName: active?.name || active?.id || "未設定",
			totalSize,
		};
	}, [databaseList]);

	return (
		<Box sx={{ display: "grid", gap: 4 }}>
			<DatabaseHeader onRefresh={reloadData} />
			<DatabaseListSection
				databaseList={databaseList}
				statsMap={statsMap}
				summary={summary}
				databaseError={databaseError}
				loadingDatabases={loadingDatabases}
				onRefreshStats={fetchStats}
				onEdit={openEditDialog}
			/>
			<DatabaseModals
				isEditDialogOpen={isEditDialogOpen}
				editingDatabase={editingDatabase}
				onClose={closeEditDialog}
				onSubmit={handleEdit}
				isSubmitting={isSubmitting}
			/>
			<DatabaseFooter snackbar={snackbar} onClose={closeSnackbar} />
		</Box>
	);
}

function DatabaseForm({
	initialData,
	onSubmit,
	onCancel,
	isLoading,
}: {
	initialData?: Partial<DatabaseInfo>;
	onSubmit: (data: Partial<DatabaseInfo>) => void;
	onCancel: () => void;
	isLoading: boolean;
}) {
	const [formData, setFormData] = useState<Partial<DatabaseInfo>>({
		id: initialData?.id || "",
		name: initialData?.name || "",
		description: initialData?.description || "",
	});

	return (
		<Box
			component="form"
			sx={{ display: "grid", gap: 2, pt: 1 }}
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit(formData);
			}}
		>
			{!initialData && (
				<TextField
					label="データベースID"
					required
					value={formData.id}
					onChange={(event) =>
						setFormData({ ...formData, id: event.target.value })
					}
					helperText="ファイル名の一部として利用されます（例: content-main）"
					disabled={isLoading}
				/>
			)}

			<TextField
				label="表示名"
				value={formData.name}
				onChange={(event) =>
					setFormData({ ...formData, name: event.target.value })
				}
				disabled={isLoading}
			/>

			<TextField
				label="説明"
				multiline
				rows={3}
				value={formData.description}
				onChange={(event) =>
					setFormData({ ...formData, description: event.target.value })
				}
				disabled={isLoading}
			/>

			<Stack direction="row" spacing={1} justifyContent="flex-end">
				<Button variant="outlined" onClick={onCancel} disabled={isLoading}>
					キャンセル
				</Button>
				<Button type="submit" variant="contained" disabled={isLoading}>
					保存
				</Button>
			</Stack>
		</Box>
	);
}

function InfoPill({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: string;
}) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1,
				border: 1,
				borderColor: "divider",
				borderRadius: 999,
				px: 1.5,
				py: 0.5,
			}}
		>
			{icon}
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body2" fontWeight={600}>
				{value}
			</Typography>
		</Box>
	);
}

function StatBadge({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<Box
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: 1.5,
				px: 1.5,
				py: 0.75,
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
