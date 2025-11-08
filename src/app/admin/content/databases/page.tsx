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
			try {
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
					throw new Error(`Failed to fetch stats: ${response.status}`);
				}
				const data = (await response.json()) as DatabaseStats;
				setStatsMap((prev) => ({ ...prev, [databaseId]: data }));
			} catch (error) {
				// 404エラー以外のエラーのみログに記録
				if (
					error instanceof Error &&
					!error.message.includes("404")
				) {
					console.error("[Database] stats failed", error);
					showSnackbar(
						error.message || "統計情報の取得に失敗しました",
						"error",
					);
				}
			}
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
			try {
				const response = await fetch("/api/cms/databases", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "create", ...payload }),
				});
				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.error || "データベースの作成に失敗しました");
				}
				showSnackbar("データベースを作成しました", "success");
				setIsCreateDialogOpen(false);
				const created = await response.json();
				await reloadData();
				if (created?.id) {
					await fetchStats(created.id);
				}
			} catch (error) {
				console.error("[Database] create failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "データベースの作成に失敗しました",
					"error",
				);
			} finally {
				setIsSubmitting(false);
			}
		},
		[fetchStats, reloadData, showSnackbar],
	);

	const handleEdit = useCallback(
		async (payload: Partial<DatabaseInfo>) => {
			setIsSubmitting(true);
			try {
				const response = await fetch("/api/cms/databases", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.error || "データベースの更新に失敗しました");
				}
				showSnackbar("データベース情報を更新しました", "success");
				setEditingDatabase(null);
				setIsEditDialogOpen(false);
				await reloadData();
			} catch (error) {
				console.error("[Database] update failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "データベースの更新に失敗しました",
					"error",
				);
			} finally {
				setIsSubmitting(false);
			}
		},
		[reloadData, showSnackbar],
	);

	const handleDelete = useCallback(
		async (database: DatabaseInfo) => {
			try {
				const response = await fetch(
					`/api/cms/databases?id=${encodeURIComponent(database.id)}`,
					{ method: "DELETE" },
				);
				if (!response.ok) {
					const error = await response.json();
					throw new Error(
						error.error ||
							"データベースの削除に失敗しました（アクティブ状態を確認してください）",
					);
				}
				showSnackbar("データベースを削除しました", "success");
				setDeleteTarget(null);
				setStatsMap((prev) => {
					const updated = { ...prev };
					delete updated[database.id];
					return updated;
				});
				await reloadData();
			} catch (error) {
				console.error("[Database] delete failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "データベースの削除に失敗しました",
					"error",
				);
			}
		},
		[reloadData, showSnackbar],
	);

	const handleSwitch = useCallback(
		async (database: DatabaseInfo) => {
			try {
				const response = await fetch("/api/cms/databases", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "switch", id: database.id }),
				});
				if (!response.ok) {
					const error = await response.json();
					throw new Error(
						error.error || "データベースの切り替えに失敗しました",
					);
				}
				showSnackbar("アクティブなデータベースを切り替えました", "success");
				setSwitchTarget(null);
				await reloadData();
			} catch (error) {
				console.error("[Database] switch failed", error);
				showSnackbar(
					error instanceof Error
						? error.message
						: "データベースの切り替えに失敗しました",
					"error",
				);
			}
		},
		[reloadData, showSnackbar],
	);

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
			<PageHeader
				title="データベース管理"
				description="SQLiteベースのコンテンツデータベースをコピー・切替・編集します。アクティブなDBを切り替えることで、柔軟な運用フローを実現します。"
				
				actions={[
					<Button
						key="refresh"
						variant="outlined"
						startIcon={<RefreshCcw size={16} />}
						onClick={reloadData}
					>
						更新
					</Button>,
					<Button
						key="create"
						variant="contained"
						startIcon={<UploadCloud size={18} />}
						onClick={() => setIsCreateDialogOpen(true)}
					>
						新しいDB
					</Button>,
				]}
			/>

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
						データベース一覧の取得に失敗しました。再読み込みしてください。
					</Alert>
				)}

				<Grid container spacing={2.5}>
					{(databaseList ?? []).map((database) => {
						const stats = statsMap[database.id];
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
												value={new Date(database.updatedAt).toLocaleString(
													"ja-JP",
												)}
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

										<Stack direction="row" spacing={1} flexWrap="wrap">
											<Button
												size="small"
												variant="outlined"
												startIcon={<RefreshCcw size={14} />}
												onClick={() => void fetchStats(database.id)}
											>
												統計を更新
											</Button>
											<Button
												size="small"
												variant="outlined"
												startIcon={<ServerCog size={14} />}
												onClick={() => {
													setEditingDatabase(database);
													setIsEditDialogOpen(true);
												}}
											>
												情報を編集
											</Button>
											{!isActive && (
												<Button
													size="small"
													variant="contained"
													onClick={() => setSwitchTarget(database)}
												>
													アクティブにする
												</Button>
											)}
											{!isActive && (
												<Button
													size="small"
													variant="outlined"
													color="error"
													startIcon={<Trash2 size={14} />}
													onClick={() => setDeleteTarget(database)}
												>
													削除
												</Button>
											)}
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>

				{loadingDatabases && (
					<Typography variant="body2" color="text.secondary">
						データベース情報を読み込んでいます...
					</Typography>
				)}
			</Paper>

			<Dialog
				open={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>新しいデータベース</DialogTitle>
				<DialogContent>
					<DatabaseForm
						onSubmit={handleCreate}
						onCancel={() => setIsCreateDialogOpen(false)}
						isLoading={isSubmitting}
					/>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isEditDialogOpen}
				onClose={() => {
					setIsEditDialogOpen(false);
					setEditingDatabase(null);
				}}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>データベース情報を編集</DialogTitle>
				<DialogContent>
					{editingDatabase && (
						<DatabaseForm
							initialData={editingDatabase}
							onSubmit={handleEdit}
							onCancel={() => {
								setIsEditDialogOpen(false);
								setEditingDatabase(null);
							}}
							isLoading={isSubmitting}
						/>
					)}
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={Boolean(deleteTarget)}
				title="データベースを削除しますか？"
				description="この操作は元に戻せません。必要に応じて事前にバックアップを取得してください。"
				confirmLabel="削除する"
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => deleteTarget && void handleDelete(deleteTarget)}
			/>

			<ConfirmDialog
				open={Boolean(switchTarget)}
				title="アクティブなデータベースを切り替えますか？"
				description="現在利用中のデータベースが変更されます。よろしければ実行してください。"
				confirmLabel="切り替える"
				onCancel={() => setSwitchTarget(null)}
				onConfirm={() => switchTarget && void handleSwitch(switchTarget)}
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
