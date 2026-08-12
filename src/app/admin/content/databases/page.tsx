"use client";

import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	Database,
	HardDrive,
	RefreshCcw,
	ServerCog,
} from "lucide-react";
import { PageHeader } from "@/components/admin/layout";
import { ConfirmDialog } from "@/components/admin/ui";
import { adminColor } from "@/components/admin/ui/tokens";
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

type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface SnackbarState {
	open: boolean;
	message: string;
	severity: SnackbarSeverity;
}

interface DatabaseSummary {
	total: number;
	activeName: string;
	totalSize: number;
}

const severityPalette: Record<
	SnackbarSeverity,
	{ bg: string; fg: string; border: string }
> = {
	success: { bg: adminColor.success, fg: "#ffffff", border: adminColor.success },
	error: { bg: adminColor.error, fg: "#ffffff", border: adminColor.error },
	info: { bg: adminColor.info, fg: "#ffffff", border: adminColor.info },
	warning: { bg: adminColor.warning, fg: "#ffffff", border: adminColor.warning },
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

const smallButtonStyle: CSSProperties = {
	...outlinedButtonStyle,
	padding: "4px 10px",
	fontSize: 12,
};

const primaryButtonStyle = (disabled: boolean): CSSProperties => ({
	padding: "8px 18px",
	fontSize: 14,
	fontWeight: 600,
	color: "#ffffff",
	backgroundColor: adminColor.accent,
	border: `1px solid ${adminColor.accent}`,
	borderRadius: 6,
	cursor: disabled ? "not-allowed" : "pointer",
	opacity: disabled ? 0.5 : 1,
});

const outlinedFormButtonStyle = (disabled: boolean): CSSProperties => ({
	...outlinedButtonStyle,
	opacity: disabled ? 0.5 : 1,
	cursor: disabled ? "not-allowed" : "pointer",
});

const panelStyle: CSSProperties = {
	border: `1px solid ${adminColor.border}`,
	borderRadius: 8,
	padding: 24,
	backgroundColor: adminColor.bgPanel,
	display: "grid",
	gap: 24,
};

const cardStyle = (active: boolean): CSSProperties => ({
	border: `1px solid ${active ? adminColor.accent : adminColor.border}`,
	borderRadius: 8,
	backgroundColor: active ? adminColor.accentSelected : adminColor.bgPanel,
	padding: 16,
	display: "grid",
	gap: 16,
	height: "100%",
});

const chipStyle = (active: boolean): CSSProperties => ({
	display: "inline-flex",
	alignItems: "center",
	padding: "2px 10px",
	fontSize: 12,
	fontWeight: 500,
	color: active ? adminColor.accent : adminColor.textSecondary,
	backgroundColor: active ? "rgba(44, 123, 229, 0.12)" : "#f3f4f6",
	border: `1px solid ${active ? adminColor.accent : adminColor.border}`,
	borderRadius: 999,
});

const pillStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: 6,
	border: `1px solid ${adminColor.border}`,
	borderRadius: 999,
	padding: "4px 12px",
	fontSize: 12,
};

const statBadgeStyle: CSSProperties = {
	border: `1px solid ${adminColor.border}`,
	borderRadius: 6,
	padding: "6px 12px",
	minWidth: 120,
};

const labelStyle: CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	color: adminColor.textPrimary,
};

const helperStyle: CSSProperties = {
	fontSize: 12,
	color: adminColor.textSecondary,
};

const inputStyle = (disabled: boolean): CSSProperties => ({
	width: "100%",
	padding: "8px 12px",
	fontSize: 14,
	color: adminColor.textPrimary,
	backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	outline: "none",
	cursor: disabled ? "not-allowed" : "text",
});

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
	margin: 0,
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

function DatabaseHeader({
	onRefresh,
}: {
	onRefresh: () => void | Promise<void>;
}) {
	return (
		<PageHeader
			title="データベース管理"
			description="現在 Rust CMS API が利用している SQLite データベースを確認します. Next.js 側では参照とメタ情報編集のみ行い、実行時の切替や削除は Rust 側で管理します."
			actions={[
				<button
					key="refresh"
					type="button"
					onClick={() => void onRefresh()}
					style={outlinedButtonStyle}
				>
					<RefreshCcw size={16} />
					更新
				</button>,
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
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<button
				type="button"
				onClick={() => void onRefreshStats(database.id)}
				style={smallButtonStyle}
			>
				<RefreshCcw size={14} />
				統計を更新
			</button>
			<button
				type="button"
				onClick={() => onEdit(database)}
				style={smallButtonStyle}
			>
				<ServerCog size={14} />
				情報を編集
			</button>
		</div>
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
		<section style={cardStyle(isActive)}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					gap: 16,
					alignItems: "flex-start",
				}}
			>
				<div>
					<p
						style={{
							margin: 0,
							fontSize: 18,
							fontWeight: 600,
							color: adminColor.textPrimary,
						}}
					>
						{database.name || database.id}
					</p>
					<p
						style={{
							margin: "4px 0 0 0",
							fontSize: 13,
							color: adminColor.textSecondary,
						}}
					>
						{database.description || "説明が設定されていません"}
					</p>
				</div>
				<span style={chipStyle(isActive)}>
					{isActive ? "アクティブ" : "バックアップ"}
				</span>
			</div>

			<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
			</div>

			<hr style={dividerStyle} />

			{stats ? (
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<StatBadge label="コンテンツ" value={stats.contentsCount} />
					<StatBadge label="Markdown" value={stats.markdownPagesCount} />
					<StatBadge label="タグ" value={stats.tagsCount} />
					<StatBadge label="合計サイズ" value={formatBytes(stats.fileSize)} />
				</div>
			) : (
				<p
					style={{
						margin: 0,
						fontSize: 12,
						color: adminColor.textSecondary,
					}}
				>
					統計情報を取得しています...
				</p>
			)}

			<DatabaseActionPanel
				database={database}
				onRefreshStats={onRefreshStats}
				onEdit={onEdit}
			/>
		</section>
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
		<section style={panelStyle}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					gap: 16,
					flexWrap: "wrap",
					alignItems: "center",
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
						アクティブデータベース
					</p>
					<p
						style={{
							margin: "4px 0 0 0",
							fontSize: 18,
							fontWeight: 700,
						}}
					>
						{summary.activeName}
					</p>
					<p
						style={{
							margin: "4px 0 0 0",
							fontSize: 12,
							color: adminColor.textSecondary,
						}}
					>
						合計 {summary.total} 件 ・ 総容量 {formatBytes(summary.totalSize)}
					</p>
				</div>
			</div>

			{databaseError && (
				<div role="alert" style={alertStyle}>
					データベース一覧の取得に失敗しました.再読み込みしてください.
				</div>
			)}

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
					gap: 20,
				}}
			>
				{(databaseList ?? []).map((database) => (
					<DatabaseCard
						key={database.id}
						database={database}
						stats={statsMap[database.id]}
						onRefreshStats={onRefreshStats}
						onEdit={onEdit}
					/>
				))}
			</div>

			{loadingDatabases && (
				<p
					style={{
						margin: 0,
						fontSize: 14,
						color: adminColor.textSecondary,
					}}
				>
					データベース情報を読み込んでいます...
				</p>
			)}
		</section>
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
	if (!isEditDialogOpen) return null;
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="データベース情報を編集"
			style={dialogBackdropStyle}
			onClick={onClose}
		>
			<div
				style={dialogSurfaceStyle}
				onClick={(event) => event.stopPropagation()}
			>
				<header style={dialogHeaderStyle}>データベース情報を編集</header>
				<div style={dialogBodyStyle}>
					{editingDatabase && (
						<DatabaseForm
							initialData={editingDatabase}
							onSubmit={onSubmit}
							onCancel={onClose}
							isLoading={isSubmitting}
						/>
					)}
				</div>
			</div>
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

	const showSnackbar = useCallback(
		(message: string, severity: SnackbarSeverity) => {
			setSnackbar({ open: true, message, severity });
		},
		[],
	);

	const closeSnackbar = useCallback(() => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	}, []);

	const fetchStats = useCallback(
		async (databaseId: string) => {
			const response = await fetch(
				`/api/cms/databases/stats?id=${encodeURIComponent(databaseId)}`,
			);
			if (!response.ok) {
				if (response.status === 404) {
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
				let errMsg =
					"データベースの削除に失敗しました（アクティブ状態を確認してください）";
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
		<div style={{ display: "grid", gap: 32 }}>
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
		<form
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit(formData);
			}}
			style={{ display: "grid", gap: 16, paddingTop: 8 }}
		>
			{!initialData && (
				<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
					<label htmlFor="db-id" style={labelStyle}>
						データベースID
						<span style={{ color: adminColor.error, marginLeft: 4 }} aria-hidden>
							*
						</span>
					</label>
					<input
						id="db-id"
						required
						value={formData.id}
						onChange={(event) =>
							setFormData({ ...formData, id: event.target.value })
						}
						disabled={isLoading}
						style={inputStyle(isLoading)}
					/>
					<p style={helperStyle}>
						ファイル名の一部として利用されます（例: content-main）
					</p>
				</div>
			)}

			<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
				<label htmlFor="db-name" style={labelStyle}>
					表示名
				</label>
				<input
					id="db-name"
					value={formData.name}
					onChange={(event) =>
						setFormData({ ...formData, name: event.target.value })
					}
					disabled={isLoading}
					style={inputStyle(isLoading)}
				/>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
				<label htmlFor="db-description" style={labelStyle}>
					説明
				</label>
				<textarea
					id="db-description"
					rows={3}
					value={formData.description}
					onChange={(event) =>
						setFormData({ ...formData, description: event.target.value })
					}
					disabled={isLoading}
					style={{
						...inputStyle(isLoading),
						resize: "vertical",
						lineHeight: 1.6,
					}}
				/>
			</div>

			<div
				style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
			>
				<button
					type="button"
					onClick={onCancel}
					disabled={isLoading}
					style={outlinedFormButtonStyle(isLoading)}
				>
					キャンセル
				</button>
				<button
					type="submit"
					disabled={isLoading}
					style={primaryButtonStyle(isLoading)}
				>
					保存
				</button>
			</div>
		</form>
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
		<div style={pillStyle}>
			{icon}
			<span style={{ color: adminColor.textSecondary }}>{label}</span>
			<span style={{ fontWeight: 600 }}>{value}</span>
		</div>
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
		<div style={statBadgeStyle}>
			<p
				style={{
					margin: 0,
					fontSize: 12,
					color: adminColor.textSecondary,
				}}
			>
				{label}
			</p>
			<p style={{ margin: "2px 0 0 0", fontSize: 14, fontWeight: 600 }}>
				{value}
			</p>
		</div>
	);
}
