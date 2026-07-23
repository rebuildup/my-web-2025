"use client";

import { useCallback, useState } from "react";
import { Edit2, Plus, RefreshCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Content } from "@/cms/types/content";
import { ContentForm } from "@/components/admin/cms";
import { useCmsResource } from "@/hooks/useCmsResource";

interface DbStats {
	totalContents: number;
	totalDbFiles: number;
	totalSize: number;
}

type StatusFilter = "all" | "draft" | "published" | "archived";

const STATUS_OPTIONS: StatusFilter[] = ["all", "published", "draft", "archived"];
const STATUS_LABEL: Record<StatusFilter, string> = {
	all: "すべて",
	published: "公開",
	draft: "下書き",
	archived: "アーカイブ",
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

const s = {
	page: { maxWidth: 960, margin: "0 auto", paddingBottom: 64 } as React.CSSProperties,
	breadcrumb: { fontSize: "0.8rem", marginBottom: 12, color: "#666" } as React.CSSProperties,
	title: { fontSize: "1.4rem", fontWeight: "normal", borderBottom: "1px solid #ccc", paddingBottom: 8, marginBottom: 8 } as React.CSSProperties,
	subtitle: { fontSize: "0.85rem", color: "#666", marginTop: 0, marginBottom: 24 } as React.CSSProperties,
	statsRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" } as React.CSSProperties,
	statCard: { border: "1px solid #ddd", borderRadius: 6, padding: "12px 16px", flex: 1, minWidth: 160 } as React.CSSProperties,
	statLabel: { fontSize: "0.75rem", color: "#888", marginBottom: 4 } as React.CSSProperties,
	statValue: { fontSize: "1.2rem", fontWeight: 700 } as React.CSSProperties,
	toolbar: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" } as React.CSSProperties,
	btn: { display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid #ccc", borderRadius: 4, padding: "5px 12px", fontSize: "0.8rem", background: "#fff", color: "#000", cursor: "pointer" } as React.CSSProperties,
	btnPrimary: { display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid #000", borderRadius: 4, padding: "5px 12px", fontSize: "0.8rem", background: "#000", color: "#fff", cursor: "pointer" } as React.CSSProperties,
	table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" } as React.CSSProperties,
	th: { textAlign: "left", borderBottom: "2px solid #ddd", padding: "8px 10px", fontSize: "0.75rem", color: "#666", fontWeight: 600, whiteSpace: "nowrap" } as React.CSSProperties,
	td: { borderBottom: "1px solid #eee", padding: "8px 10px", verticalAlign: "middle" } as React.CSSProperties,
	thumb: { width: 40, height: 40, borderRadius: 4, objectFit: "cover" as const, border: "1px solid #eee" } as React.CSSProperties,
	thumbPlaceholder: { width: 40, height: 40, borderRadius: 4, border: "1px solid #eee", background: "#f5f5f5" } as React.CSSProperties,
	chip: { display: "inline-block", fontSize: "0.7rem", padding: "2px 8px", borderRadius: 10, background: "#f0f0f0" } as React.CSSProperties,
	idText: { fontSize: "0.75rem", color: "#999", fontFamily: "monospace" } as React.CSSProperties,
	iconBtn: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#555" } as React.CSSProperties,
	iconBtnDanger: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#c00" } as React.CSSProperties,
	overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties,
	dialog: { background: "#fff", borderRadius: 8, border: "1px solid #ddd", width: "92%", maxWidth: 800, maxHeight: "90vh", overflow: "auto", padding: 0 } as React.CSSProperties,
	dialogHeader: { padding: "16px 20px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky" as const, top: 0, background: "#fff", zIndex: 1 } as React.CSSProperties,
	dialogBody: { padding: "16px 20px" } as React.CSSProperties,
	select: { border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px", fontSize: "0.8rem", background: "#fff" } as React.CSSProperties,
	input: { border: "1px solid #ccc", borderRadius: 4, padding: "6px 10px", fontSize: "0.85rem", width: "100%", boxSizing: "border-box" as const } as React.CSSProperties,
	alert: { border: "1px solid #e0c000", background: "#fffbe6", borderRadius: 4, padding: "8px 12px", fontSize: "0.8rem", marginBottom: 16, color: "#665500" } as React.CSSProperties,
};

function ContentPageHeader({
	contentsLoading,
	contents,
	statsLoading,
	stats,
	contentsError,
	statsError,
}: {
	contentsLoading: boolean;
	contents: Content[] | null | undefined;
	statsLoading: boolean;
	stats: DbStats | null | undefined;
	contentsError: unknown;
	statsError: unknown;
}) {
	return (
		<>
			<nav style={s.breadcrumb}>
				<a href="/admin" style={{ color: "#0066cc", textDecoration: "none" }}>Admin</a>
				<span style={{ margin: "0 6px" }}>/</span>
				<span style={{ color: "#000" }}>コンテンツ管理</span>
			</nav>

			<h1 style={s.title}>コンテンツ管理</h1>
			<p style={s.subtitle}>コンテンツの作成・編集・公開状態を管理します.</p>

			<div style={s.statsRow}>
				<div style={s.statCard}>
					<div style={s.statLabel}>登録コンテンツ</div>
					<div style={s.statValue}>{contentsLoading ? "…" : contents?.length ?? 0}</div>
				</div>
				<div style={s.statCard}>
					<div style={s.statLabel}>コンテンツDB</div>
					<div style={s.statValue}>{statsLoading ? "…" : stats?.totalDbFiles ?? 0}</div>
				</div>
				<div style={s.statCard}>
					<div style={s.statLabel}>総容量</div>
					<div style={s.statValue}>{stats ? formatBytes(stats.totalSize) : statsLoading ? "…" : "-"}</div>
				</div>
			</div>

			{(contentsError || statsError) && (
				<div style={s.alert}>データの取得に失敗しました.再読み込みしてください.</div>
			)}
		</>
	);
}

function ContentPageToolbar({
	statusFilter,
	setStatusFilter,
	searchQuery,
	setSearchQuery,
	onRefresh,
	onCreate,
}: {
	statusFilter: StatusFilter;
	setStatusFilter: (v: StatusFilter) => void;
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	onRefresh: () => void;
	onCreate: () => void;
}) {
	return (
		<div style={s.toolbar}>
			<button style={s.btn} onClick={onRefresh}>
				<RefreshCcw size={14} /> 更新
			</button>
			<button style={s.btnPrimary} onClick={onCreate}>
				<Plus size={14} /> 新規コンテンツ
			</button>
			<select
				style={s.select}
				value={statusFilter}
				onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
				aria-label="ステータスでフィルター"
			>
				{STATUS_OPTIONS.map((opt) => (
					<option key={opt} value={opt}>{STATUS_LABEL[opt]}</option>
				))}
			</select>
			<input
				style={{ ...s.input, maxWidth: 220 }}
				placeholder="検索..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
		</div>
	);
}

function ContentTableRow({
	content,
	onEdit,
	onDelete,
}: {
	content: Content;
	onEdit: (content: Content) => void;
	onDelete: (content: Content) => void;
}) {
	const thumb = getThumbnailUrl(content);
	return (
		<tr>
			<td style={s.td}>🌐</td>
			<td style={s.td}>
				{thumb ? (
					<Image src={thumb} alt={content.title} style={s.thumb} width={64} height={64} unoptimized />
				) : (
					<div style={s.thumbPlaceholder} />
				)}
			</td>
			<td style={s.td}>
				<div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{content.title}</div>
				{content.summary && (
					<div style={{ fontSize: "0.75rem", color: "#888", marginTop: 2 }}>{content.summary}</div>
				)}
			</td>
			<td style={s.td}>
				<span style={s.chip}>{content.status ?? "draft"}</span>
			</td>
			<td style={{ ...s.td, fontSize: "0.8rem", color: "#666" }}>{formatDate(content.updatedAt as string)}</td>
			<td style={s.td}><span style={s.idText}>{content.id}</span></td>
			<td style={{ ...s.td, textAlign: "right" }}>
				<button
					style={s.iconBtn}
					title="編集"
					onClick={() => void onEdit(content)}
				>
					<Edit2 size={15} />
				</button>
				<button style={s.iconBtnDanger} title="削除" onClick={() => onDelete(content)}>
					<Trash2 size={15} />
				</button>
			</td>
		</tr>
	);
}

function ContentTable({
	contentsLoading,
	filteredContents,
	onEdit,
	onDelete,
}: {
	contentsLoading: boolean;
	filteredContents: Content[];
	onEdit: (content: Content) => void;
	onDelete: (content: Content) => void;
}) {
	return (
		<div style={{ overflowX: "auto" }}>
			<table style={s.table}>
				<thead>
					<tr>
						<th style={s.th}></th>
						<th style={s.th}>サムネイル</th>
						<th style={s.th}>タイトル</th>
						<th style={s.th}>ステータス</th>
						<th style={s.th}>更新日</th>
						<th style={s.th}>ID</th>
						<th style={{ ...s.th, textAlign: "right" }}>操作</th>
					</tr>
				</thead>
				<tbody>
					{contentsLoading ? (
						<tr><td colSpan={7} style={{ ...s.td, textAlign: "center", padding: 40, color: "#999" }}>読み込み中...</td></tr>
					) : filteredContents.length === 0 ? (
						<tr><td colSpan={7} style={{ ...s.td, textAlign: "center", padding: 40, color: "#999" }}>表示するコンテンツがありません.</td></tr>
					) : (
						filteredContents.map((content) => (
							<ContentTableRow
								key={content.id}
								content={content}
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

function CreateContentDialog({
	open,
	submitting,
	createStatus,
	setCreateStatus,
	createVisibility,
	setCreateVisibility,
	onClose,
	onSubmit,
}: {
	open: boolean;
	submitting: boolean;
	createStatus: Content["status"];
	setCreateStatus: (v: Content["status"]) => void;
	createVisibility: Content["visibility"];
	setCreateVisibility: (v: Content["visibility"]) => void;
	onClose: () => void;
	onSubmit: (payload: Partial<Content>) => Promise<void>;
}) {
	if (!open) return null;
	return (
		<div style={s.overlay} onClick={onClose}>
			<div style={s.dialog} onClick={(e) => e.stopPropagation()}>
				<div style={s.dialogHeader}>
					<span style={{ fontWeight: 600 }}>新しいコンテンツを作成</span>
					<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
						<select
							style={s.select}
							value={createStatus}
							onChange={(e) => setCreateStatus(e.target.value as Content["status"])}
							aria-label="ステータス"
						>
							<option value="draft">draft</option>
							<option value="published">published</option>
							<option value="archived">archived</option>
						</select>
						<select
							style={s.select}
							value={createVisibility}
							onChange={(e) => setCreateVisibility(e.target.value as Content["visibility"])}
							aria-label="公開設定"
						>
							<option value="draft">draft</option>
							<option value="public">public</option>
							<option value="unlisted">unlisted</option>
							<option value="private">private</option>
						</select>
						<button style={s.btn} onClick={onClose}>×</button>
					</div>
				</div>
				<div style={s.dialogBody}>
					<ContentForm
						mode="create"
						isLoading={submitting}
						onSubmit={onSubmit}
						onCancel={onClose}
						controlledStatus={createStatus}
						controlledVisibility={createVisibility}
					/>
				</div>
			</div>
		</div>
	);
}

function EditContentDialog({
	target,
	submitting,
	onClose,
	onChangeTarget,
	onSubmit,
}: {
	target: Content | null;
	submitting: boolean;
	onClose: () => void;
	onChangeTarget: (target: Content) => void;
	onSubmit: (payload: Partial<Content>) => Promise<void>;
}) {
	if (!target) return null;
	return (
		<div style={s.overlay} onClick={onClose}>
			<div style={s.dialog} onClick={(e) => e.stopPropagation()}>
				<div style={s.dialogHeader}>
					<span style={{ fontWeight: 600 }}>コンテンツを編集</span>
					<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
						<select
							style={s.select}
							value={target.status ?? "draft"}
							onChange={(e) => onChangeTarget({ ...target, status: e.target.value as Content["status"] })}
							aria-label="ステータス"
						>
							<option value="draft">draft</option>
							<option value="published">published</option>
							<option value="archived">archived</option>
						</select>
						<select
							style={s.select}
							value={target.visibility ?? "draft"}
							onChange={(e) => onChangeTarget({ ...target, visibility: e.target.value as Content["visibility"] })}
							aria-label="公開設定"
						>
							<option value="draft">draft</option>
							<option value="public">public</option>
							<option value="unlisted">unlisted</option>
							<option value="private">private</option>
						</select>
						<button style={s.btn} onClick={onClose}>×</button>
					</div>
				</div>
				<div style={s.dialogBody}>
					<ContentForm
						mode="edit"
						initialData={target}
						isLoading={submitting}
						onSubmit={onSubmit}
						onCancel={onClose}
						controlledStatus={target.status}
						controlledVisibility={target.visibility}
					/>
				</div>
			</div>
		</div>
	);
}

function DeleteContentDialog({
	target,
	onClose,
	onConfirm,
}: {
	target: Content | null;
	onClose: () => void;
	onConfirm: (id: string) => Promise<void>;
}) {
	if (!target) return null;
	return (
		<div style={s.overlay} onClick={onClose}>
			<div style={{ ...s.dialog, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
				<div style={{ ...s.dialogHeader, borderBottom: "none", paddingBottom: 0 }}>
					<span style={{ fontWeight: 600 }}>コンテンツを削除しますか？</span>
				</div>
				<div style={{ padding: "0 20px 20px" }}>
					<p style={{ fontSize: "0.85rem", color: "#555", margin: "0 0 16px" }}>
						この操作は取り消せません.関連するDBが削除されます.
					</p>
					<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
						<button style={s.btn} onClick={onClose}>キャンセル</button>
						<button
							style={{ ...s.btnPrimary, background: "#c00", borderColor: "#c00" }}
							onClick={() => void onConfirm(target.id)}
						>
							削除する
						</button>
					</div>
				</div>
			</div>
		</div>
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

	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [searchQuery, setSearchQuery] = useState("");
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

	const filteredContents = (contents ?? []).filter((c) => {
		if (statusFilter !== "all" && c.status !== statusFilter) return false;
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			return (
				c.title.toLowerCase().includes(q) ||
				c.id.toLowerCase().includes(q) ||
				(c.summary ?? "").toLowerCase().includes(q)
			);
		}
		return true;
	});

	const handleCreate = useCallback(async (payload: Partial<Content>) => {
		setSubmitting(true);
		const res = await fetch("/api/cms/contents", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		setSubmitting(false);
		if (res.ok) {
			setIsCreateOpen(false);
			await handleRefresh();
		}
	}, [handleRefresh]);

	const handleUpdate = useCallback(async (payload: Partial<Content>) => {
		setSubmitting(true);
		const res = await fetch("/api/cms/contents", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		setSubmitting(false);
		if (res.ok) {
			setEditTarget(null);
			await handleRefresh();
		}
	}, [handleRefresh]);

	const handleDelete = useCallback(async (id: string) => {
		const res = await fetch(`/api/cms/contents?id=${encodeURIComponent(id)}`, {
			method: "DELETE",
		});
		if (res.ok) {
			setDeleteTarget(null);
			await handleRefresh();
		}
	}, [handleRefresh]);

	const handleEdit = useCallback(async (content: Content) => {
		try {
			const res = await fetch(`/api/cms/contents?id=${encodeURIComponent(content.id)}`);
			if (res.ok) {
				setEditTarget(await res.json());
			} else {
				setEditTarget(content);
			}
		} catch {
			setEditTarget(content);
		}
	}, []);

	return (
		<div style={s.page}>
			<ContentPageHeader
				contentsLoading={contentsLoading}
				contents={contents}
				statsLoading={statsLoading}
				stats={stats}
				contentsError={contentsError}
				statsError={statsError}
			/>

			<ContentPageToolbar
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				onRefresh={handleRefresh}
				onCreate={() => setIsCreateOpen(true)}
			/>

			<ContentTable
				contentsLoading={contentsLoading}
				filteredContents={filteredContents}
				onEdit={handleEdit}
				onDelete={(c) => setDeleteTarget(c)}
			/>

			<CreateContentDialog
				open={isCreateOpen}
				submitting={submitting}
				createStatus={createStatus}
				setCreateStatus={setCreateStatus}
				createVisibility={createVisibility}
				setCreateVisibility={setCreateVisibility}
				onClose={() => setIsCreateOpen(false)}
				onSubmit={handleCreate}
			/>

			<EditContentDialog
				target={editTarget}
				submitting={submitting}
				onClose={() => setEditTarget(null)}
				onChangeTarget={setEditTarget}
				onSubmit={handleUpdate}
			/>

			<DeleteContentDialog
				target={deleteTarget}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
}