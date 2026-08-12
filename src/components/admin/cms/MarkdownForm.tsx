"use client";

import { type CSSProperties, type ReactNode, useId, useState } from "react";
import type { MarkdownPage } from "@/cms/types/markdown";
import { SimpleSelect } from "@/components/admin/ui";
import { adminColor } from "@/components/admin/ui/tokens";
import Grid2 from "./Grid2";

interface MarkdownFormProps {
	initialData?: Partial<MarkdownPage>;
	onSubmit: (data: Partial<MarkdownPage>) => void;
	onCancel: () => void;
	isLoading?: boolean;
	mode: "create" | "edit";
}

interface FieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	type?: "text" | "date" | "number";
	min?: number;
	helperText?: string;
	multiline?: boolean;
	rows?: number;
	monospace?: boolean;
	id?: string;
}

const labelStyle: CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	color: adminColor.textPrimary,
};

const helperStyle: CSSProperties = {
	fontSize: 12,
	color: adminColor.textSecondary,
};

const inputBaseStyle: CSSProperties = {
	width: "100%",
	padding: "8px 12px",
	fontSize: 14,
	color: adminColor.textPrimary,
	backgroundColor: "#ffffff",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	outline: "none",
	transition: "border-color 120ms ease, box-shadow 120ms ease",
};

const disabledStyle: CSSProperties = {
	backgroundColor: "#f3f4f6",
	color: adminColor.textDisabled,
	cursor: "not-allowed",
};

function Field({
	label,
	value,
	onChange,
	placeholder,
	disabled = false,
	required = false,
	type = "text",
	min,
	helperText,
	multiline = false,
	rows = 4,
	monospace = false,
	id,
}: FieldProps) {
	const reactId = useId();
	const fieldId = id ?? `mdform-${reactId}`;
	const helperId = helperText ? `${fieldId}-helper` : undefined;

	const sharedStyle: CSSProperties = {
		...inputBaseStyle,
		...(disabled ? disabledStyle : {}),
		fontFamily: monospace
			? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
			: undefined,
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<label htmlFor={fieldId} style={labelStyle}>
				{label}
				{required && (
					<span style={{ color: adminColor.error, marginLeft: 4 }} aria-hidden>
						*
					</span>
				)}
			</label>
			{multiline ? (
				<textarea
					id={fieldId}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					rows={rows}
					aria-describedby={helperId}
					style={{
						...sharedStyle,
						resize: "vertical",
						lineHeight: 1.6,
					}}
				/>
			) : (
				<input
					id={fieldId}
					type={type}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					min={min}
					aria-describedby={helperId}
					style={sharedStyle}
				/>
			)}
			{helperText && (
				<p id={helperId} style={helperStyle}>
					{helperText}
				</p>
			)}
		</div>
	);
}

const tabs: { id: "content" | "frontmatter" | "settings"; label: string }[] = [
	{ id: "content", label: "コンテンツ" },
	{ id: "frontmatter", label: "フロントマター" },
	{ id: "settings", label: "設定" },
];

type TabId = (typeof tabs)[number]["id"];

const tabButtonStyle = (active: boolean): CSSProperties => ({
	padding: "12px 16px",
	fontSize: 14,
	fontWeight: 600,
	background: "transparent",
	color: active ? adminColor.accent : adminColor.textSecondary,
	border: "none",
	borderBottom: `2px solid ${active ? adminColor.accent : "transparent"}`,
	cursor: "pointer",
	transition: "color 120ms ease, border-color 120ms ease",
});

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

const outlinedButtonStyle = (disabled: boolean): CSSProperties => ({
	padding: "8px 18px",
	fontSize: 14,
	fontWeight: 600,
	color: adminColor.textPrimary,
	backgroundColor: "transparent",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	cursor: disabled ? "not-allowed" : "pointer",
	opacity: disabled ? 0.5 : 1,
});

const dividerStyle: CSSProperties = {
	height: 1,
	backgroundColor: adminColor.border,
	margin: "16px 0",
	border: "none",
};

function TabBar({
	active,
	onChange,
}: {
	active: TabId;
	onChange: (id: TabId) => void;
}) {
	return (
		<div
			role="tablist"
			aria-label="Markdown form sections"
			style={{
				display: "flex",
				gap: 4,
				borderBottom: `1px solid ${adminColor.border}`,
			}}
		>
			{tabs.map((tab) => {
				const isActive = active === tab.id;
				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						id={`mdform-tab-${tab.id}`}
						aria-selected={isActive}
						aria-controls={`mdform-tabpanel-${tab.id}`}
						tabIndex={isActive ? 0 : -1}
						onClick={() => onChange(tab.id)}
						style={tabButtonStyle(isActive)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

function TabPanel({
	id,
	active,
	children,
}: {
	id: TabId;
	active: TabId;
	children: ReactNode;
}) {
	if (id !== active) return null;
	return (
		<div
			role="tabpanel"
			id={`mdform-tabpanel-${id}`}
			aria-labelledby={`mdform-tab-${id}`}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 16,
				paddingTop: 24,
			}}
		>
			{children}
		</div>
	);
}

export function MarkdownForm({
	initialData = {},
	onSubmit,
	onCancel,
	isLoading = false,
	mode,
}: MarkdownFormProps) {
	const [formData, setFormData] = useState<Partial<MarkdownPage>>({
		id: initialData.id || "",
		slug: initialData.slug || "",
		body: initialData.body || "",
		lang: initialData.lang || "ja",
		status: initialData.status || "draft",
		contentId: initialData.contentId || "",
		path: initialData.path || "",
		frontmatter: initialData.frontmatter || {
			title: "",
			description: "",
			tags: [],
			author: "",
		},
		...initialData,
	});

	const [activeTab, setActiveTab] = useState<TabId>("content");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const updateFrontmatter = (
		key: string,
		value: string | number | boolean | string[],
	) => {
		setFormData({
			...formData,
			frontmatter: {
				...formData.frontmatter,
				[key]: value,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} style={{ paddingTop: 16 }}>
			<TabBar active={activeTab} onChange={setActiveTab} />

			<TabPanel id="content" active={activeTab}>
				{mode === "create" && (
					<Field
						label="ページID"
						required
						value={formData.id || ""}
						onChange={(value) => setFormData({ ...formData, id: value })}
						placeholder="my-page-001"
						disabled={isLoading}
					/>
				)}

				<Field
					label="スラッグ"
					required
					value={formData.slug || ""}
					onChange={(value) => setFormData({ ...formData, slug: value })}
					placeholder="my-page-slug"
					disabled={isLoading}
					helperText="URL用のスラッグ（例: /blog/my-page-slug）"
				/>

				<hr style={dividerStyle} />

				<Field
					label="Markdown本文"
					required
					multiline
					rows={20}
					value={formData.body || ""}
					onChange={(value) => setFormData({ ...formData, body: value })}
					placeholder="# タイトル\n\nここにMarkdown形式で本文を書きます..."
					disabled={isLoading}
					helperText="Markdown記法で記述してください"
					monospace
				/>
			</TabPanel>

			<TabPanel id="frontmatter" active={activeTab}>
				<Field
					label="タイトル"
					value={formData.frontmatter?.title || ""}
					onChange={(value) => updateFrontmatter("title", value)}
					placeholder="ページタイトル"
					disabled={isLoading}
				/>

				<Field
					label="説明"
					multiline
					rows={3}
					value={formData.frontmatter?.description || ""}
					onChange={(value) => updateFrontmatter("description", value)}
					placeholder="ページの説明"
					disabled={isLoading}
				/>

				<Field
					label="著者"
					value={formData.frontmatter?.author || ""}
					onChange={(value) => updateFrontmatter("author", value)}
					placeholder="著者名"
					disabled={isLoading}
				/>

				<Field
					label="タグ（カンマ区切り）"
					value={formData.frontmatter?.tags?.join(", ") || ""}
					onChange={(value) =>
						updateFrontmatter(
							"tags",
							value
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean),
						)
					}
					placeholder="tag1, tag2, tag3"
					disabled={isLoading}
				/>

				<Field
					label="日付"
					type="date"
					value={
						formData.frontmatter?.date
							? new Date(formData.frontmatter.date).toISOString().split("T")[0]
							: ""
					}
					onChange={(value) => updateFrontmatter("date", value)}
					disabled={isLoading}
				/>

				<Field
					label="アイキャッチ画像URL"
					value={String(formData.frontmatter?.image || "")}
					onChange={(value) => updateFrontmatter("image", value)}
					placeholder="/images/featured.jpg"
					disabled={isLoading}
				/>

				<Field
					label="カスタムフィールド（JSON）"
					multiline
					rows={4}
					value={
						formData.frontmatter?.custom
							? JSON.stringify(formData.frontmatter.custom, null, 2)
							: ""
					}
					onChange={(value) => {
						try {
							const parsed = JSON.parse(value);
							updateFrontmatter("custom", parsed);
						} catch {
							// Invalid JSON - ignore
						}
					}}
					placeholder='{"key": "value"}'
					disabled={isLoading}
					monospace
				/>
			</TabPanel>

			<TabPanel id="settings" active={activeTab}>
				<Field
					label="関連コンテンツID"
					value={formData.contentId || ""}
					onChange={(value) => setFormData({ ...formData, contentId: value })}
					placeholder="content-id"
					disabled={isLoading}
					helperText="このページに関連するコンテンツのID"
				/>

				<Field
					label="パス"
					value={formData.path || ""}
					onChange={(value) => setFormData({ ...formData, path: value })}
					placeholder="/blog/category"
					disabled={isLoading}
				/>

				<Grid2 container spacing={2}>
					<Grid2 xs={12} sm={6}>
						<SimpleSelect
							label="言語"
							fullWidth
							value={formData.lang}
							onChange={(value) => setFormData({ ...formData, lang: value })}
							disabled={isLoading}
							options={[
								{ value: "ja", label: "日本語 (ja)" },
								{ value: "en", label: "English (en)" },
								{ value: "zh", label: "中文 (zh)" },
								{ value: "ko", label: "한국어 (ko)" },
							]}
						/>
					</Grid2>

					<Grid2 xs={12} sm={6}>
						<SimpleSelect
							label="ステータス"
							fullWidth
							value={formData.status}
							onChange={(value) =>
								setFormData({
									...formData,
									status: value as "draft" | "published" | "archived",
								})
							}
							disabled={isLoading}
							options={[
								{ value: "draft", label: "下書き" },
								{ value: "published", label: "公開" },
								{ value: "archived", label: "アーカイブ" },
							]}
						/>
					</Grid2>
				</Grid2>

				<Field
					label="バージョン"
					type="number"
					min={1}
					value={String(formData.version || 1)}
					onChange={(value) =>
						setFormData({
							...formData,
							version: parseInt(value, 10) || 1,
						})
					}
					disabled={isLoading}
				/>
			</TabPanel>

			<hr style={{ ...dividerStyle, margin: "24px 0" }} />

			<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
				<button
					type="button"
					onClick={onCancel}
					disabled={isLoading}
					style={outlinedButtonStyle(isLoading)}
				>
					キャンセル
				</button>
				<button
					type="submit"
					disabled={isLoading}
					style={primaryButtonStyle(isLoading)}
				>
					{isLoading ? "保存中..." : mode === "create" ? "作成" : "保存"}
				</button>
			</div>
		</form>
	);
}
