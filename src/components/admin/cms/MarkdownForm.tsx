"use client";

import { Box, Button, Divider, Tab, Tabs, TextField } from "@mui/material";
import { useState } from "react";
import type { MarkdownPage } from "@/cms/types/markdown";
import { SimpleSelect } from "@/components/admin/ui";
import Grid2 from "./Grid2";

interface MarkdownFormProps {
	initialData?: Partial<MarkdownPage>;
	onSubmit: (data: Partial<MarkdownPage>) => void;
	onCancel: () => void;
	isLoading?: boolean;
	mode: "create" | "edit";
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

	const [activeTab, setActiveTab] = useState(0);

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

	const tabs = [
		{ label: "コンテンツ" },
		{ label: "フロントマター" },
		{ label: "設定" },
	];

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
			<Tabs
				value={activeTab}
				onChange={(_, newValue) => setActiveTab(newValue)}
			>
				{tabs.map((tab) => (
					<Tab key={tab.label} label={tab.label} />
				))}
			</Tabs>

			<Box sx={{ mt: 3 }}>
				{activeTab === 0 && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{mode === "create" && (
							<TextField
								label="ページID"
								required
								value={formData.id}
								onChange={(e) =>
									setFormData({ ...formData, id: e.target.value })
								}
								placeholder="my-page-001"
								disabled={isLoading}
							/>
						)}

						<TextField
							label="スラッグ"
							required
							value={formData.slug}
							onChange={(e) =>
								setFormData({ ...formData, slug: e.target.value })
							}
							placeholder="my-page-slug"
							disabled={isLoading}
							helperText="URL用のスラッグ（例: /blog/my-page-slug）"
						/>

						<Divider />

						<TextField
							label="Markdown本文"
							required
							multiline
							rows={20}
							value={formData.body}
							onChange={(e) =>
								setFormData({ ...formData, body: e.target.value })
							}
							placeholder="# タイトル\n\nここにMarkdown形式で本文を書きます..."
							disabled={isLoading}
							helperText="Markdown記法で記述してください"
							sx={{ fontFamily: "monospace" }}
						/>
					</Box>
				)}

				{activeTab === 1 && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<TextField
							label="タイトル"
							value={formData.frontmatter?.title || ""}
							onChange={(e) => updateFrontmatter("title", e.target.value)}
							placeholder="ページタイトル"
							disabled={isLoading}
						/>

						<TextField
							label="説明"
							multiline
							rows={3}
							value={formData.frontmatter?.description || ""}
							onChange={(e) => updateFrontmatter("description", e.target.value)}
							placeholder="ページの説明"
							disabled={isLoading}
						/>

						<TextField
							label="著者"
							value={formData.frontmatter?.author || ""}
							onChange={(e) => updateFrontmatter("author", e.target.value)}
							placeholder="著者名"
							disabled={isLoading}
						/>

						<TextField
							label="タグ（カンマ区切り）"
							value={formData.frontmatter?.tags?.join(", ") || ""}
							onChange={(e) =>
								updateFrontmatter(
									"tags",
									e.target.value
										.split(",")
										.map((s) => s.trim())
										.filter(Boolean),
								)
							}
							placeholder="tag1, tag2, tag3"
							disabled={isLoading}
						/>

						<TextField
							label="日付"
							type="date"
							value={
								formData.frontmatter?.date
									? new Date(formData.frontmatter.date)
											.toISOString()
											.split("T")[0]
									: ""
							}
							onChange={(e) => updateFrontmatter("date", e.target.value)}
							disabled={isLoading}
							slotProps={{ inputLabel: { shrink: true } }}
						/>

						<TextField
							label="アイキャッチ画像URL"
							value={String(formData.frontmatter?.image || "")}
							onChange={(e) => updateFrontmatter("image", e.target.value)}
							placeholder="/images/featured.jpg"
							disabled={isLoading}
						/>

						<TextField
							label="カスタムフィールド（JSON）"
							multiline
							rows={4}
							value={
								formData.frontmatter?.custom
									? JSON.stringify(formData.frontmatter.custom, null, 2)
									: ""
							}
							onChange={(e) => {
								try {
									const parsed = JSON.parse(e.target.value);
									updateFrontmatter("custom", parsed);
								} catch {
									// Invalid JSON - ignore
								}
							}}
							placeholder='{"key": "value"}'
							disabled={isLoading}
							sx={{ fontFamily: "monospace" }}
						/>
					</Box>
				)}

				{activeTab === 2 && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<TextField
							label="関連コンテンツID"
							value={formData.contentId || ""}
							onChange={(e) =>
								setFormData({ ...formData, contentId: e.target.value })
							}
							placeholder="content-id"
							disabled={isLoading}
							helperText="このページに関連するコンテンツのID"
						/>

						<TextField
							label="パス"
							value={formData.path || ""}
							onChange={(e) =>
								setFormData({ ...formData, path: e.target.value })
							}
							placeholder="/blog/category"
							disabled={isLoading}
						/>

						<Grid2 container spacing={2}>
							<Grid2 xs={12} sm={6}>
								<SimpleSelect
									label="言語"
									fullWidth
									value={formData.lang}
									onChange={(value) =>
										setFormData({ ...formData, lang: value })
									}
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

						<TextField
							label="バージョン"
							type="number"
							value={formData.version || 1}
							onChange={(e) =>
								setFormData({
									...formData,
									version: parseInt(e.target.value, 10) || 1,
								})
							}
							slotProps={{ htmlInput: { min: 1 } }}
							disabled={isLoading}
						/>
					</Box>
				)}
			</Box>

			<Divider sx={{ my: 3 }} />

			<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
				<Button variant="outlined" onClick={onCancel} disabled={isLoading}>
					キャンセル
				</Button>
				<Button type="submit" variant="contained" disabled={isLoading}>
					{isLoading ? "保存中..." : mode === "create" ? "作成" : "保存"}
				</Button>
			</Box>
		</Box>
	);
}
