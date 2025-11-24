"use client";

import {
	Alert,
	Autocomplete,
	Box,
	Button,
	Chip,
	IconButton,
	Stack,
	Tab,
	Tabs,
	TextField,
	Typography,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Content } from "@/cms/types/content";

interface ContentFormProps {
	initialData?: Partial<Content>;
	onSubmit: (data: Partial<Content>) => void;
	onCancel: () => void;
	isLoading?: boolean;
	mode: "create" | "edit";
	controlledStatus?: Content["status"];
	controlledVisibility?: Content["visibility"];
}

const _TAG_SUGGESTIONS = [
	"develop",
	"design",
	"video",
	"plugin",
	"blog",
	"tool",
	"web",
	"motion",
];

function _slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "")
		.slice(0, 60);
}

const stringifyJson = (value: unknown) => {
	if (!value) return "";
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return "";
	}
};

const parseJsonSafely = (value: string) => {
	if (!value.trim()) return undefined;
	return JSON.parse(value);
};

// Upload state not used (URL-based inputs only)

function toYouTubeEmbed(url: string): string | null {
	if (!url) return null;
	try {
		// Common patterns: youtu.be/ID , youtube.com/watch?v=ID , youtube.com/shorts/ID , youtube.com/embed/ID
		const u = new URL(
			url,
			typeof window !== "undefined"
				? window.location.origin
				: "https://youtube.com",
		);
		let id = "";
		if (u.hostname.includes("youtu.be")) {
			id = u.pathname.replace(/^\//, "");
		} else if (u.searchParams.get("v")) {
			id = u.searchParams.get("v") || "";
		} else if (u.pathname.includes("/shorts/")) {
			id = u.pathname.split("/shorts/")[1]?.split("/")[0] || "";
		} else if (u.pathname.includes("/embed/")) {
			id = u.pathname.split("/embed/")[1]?.split("/")[0] || "";
		}
		id = id.replace(/[^a-zA-Z0-9_-]/g, "");
		if (!id) return null;
		return `https://www.youtube-nocookie.com/embed/${id}`;
	} catch {
		return null;
	}
}

export function ContentForm({
	initialData = {},
	onSubmit,
	onCancel,
	isLoading = false,
	mode,
	controlledStatus,
	controlledVisibility,
}: ContentFormProps) {
	const [formData, setFormData] = useState<Partial<Content>>(() => {
		const nowIso = new Date().toISOString();
		const base: Partial<Content> = {
			id: initialData.id || "",
			title: initialData.title || "",
			summary: initialData.summary || "",
			status: initialData.status || "draft",
			visibility: initialData.visibility || "draft",
			tags: initialData.tags || [],
			publicUrl: initialData.publicUrl || "",
			lang: initialData.lang || "ja",
			parentId: initialData.parentId || "",
			path: initialData.path || "",
			depth: initialData.depth || 0,
			order: initialData.order || 0,
			thumbnails: initialData.thumbnails || undefined,
			assets: initialData.assets || undefined,
			links: initialData.links || undefined,
			relations: initialData.relations || undefined,
			searchable: initialData.searchable || undefined,
			seo: initialData.seo || undefined,
			i18n: initialData.i18n || undefined,
			permissions: initialData.permissions || undefined,
			ext: initialData.ext || undefined,
			createdAt: initialData.createdAt || nowIso,
			updatedAt: initialData.updatedAt || nowIso,
			publishedAt: initialData.publishedAt ?? undefined,
			unpublishedAt: initialData.unpublishedAt ?? undefined,
		};
		// Derive YouTube preview from assets if ext.thumbnail.youtube is not set
		try {
			const hasThumbYouTube = (base.ext as any)?.thumbnail?.youtube;
			if (!hasThumbYouTube && Array.isArray(base.assets)) {
				const yt = (base.assets as any[]).find(
					(a) =>
						a?.type === "video/youtube" ||
						(typeof a?.src === "string" && a.src.includes("youtube.")),
				);
				if (yt?.src) {
					base.ext = {
						...((base.ext as any) || {}),
						thumbnail: {
							...((base.ext as any)?.thumbnail || {}),
							youtube: yt.src,
						},
					} as any;
				}
			}
		} catch {}
		return base;
	});

	// 一度だけの補完: youtube フィールドが空の場合、assets/linksから推測して補完
	useEffect(() => {
		const current = (formData.ext as any)?.thumbnail?.youtube || "";
		if (current) return; // already set
		let found = "";
		try {
			if (Array.isArray(formData.assets)) {
				const a = (formData.assets as any[]).find(
					(x) =>
						x?.type === "video/youtube" ||
						(typeof x?.src === "string" && x.src.includes("youtube.")),
				);
				if (a?.src) found = a.src;
			}
			if (!found && Array.isArray(formData.links)) {
				const l = (formData.links as any[]).find(
					(x) => typeof x?.href === "string" && x.href.includes("youtube."),
				);
				if (l?.href) found = l.href;
			}
		} catch {}
		if (found) {
			setFormData((prev) => ({
				...prev,
				ext: {
					...((prev.ext as any) || {}),
					thumbnail: {
						...((prev.ext as any)?.thumbnail || {}),
						youtube: found,
					},
				} as any,
			}));
		}
		// run once on mount or when id changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData.id]);

	// 追加フェッチ: 編集時にsummary以外の詳細が欠落している場合は一度だけ詳細をロード
	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (mode !== "edit") return;
			if (!formData.id) return;
			// すでに十分なデータがある場合はスキップ
			const hasDetails = Boolean(
				formData.assets ||
					formData.links ||
					(formData.ext as any)?.thumbnail ||
					formData.seo ||
					formData.searchable,
			);
			if (hasDetails) return;
			try {
				const res = await fetch(
					`/api/cms/contents?id=${encodeURIComponent(formData.id)}`,
					{ cache: "no-store" },
				);
				if (!res.ok) return;
				const full = await res.json();
				if (cancelled || !full) return;
				setFormData((prev) => ({
					...prev,
					assets: prev.assets || full.assets,
					links: prev.links || full.links,
					relations: prev.relations || full.relations,
					seo: prev.seo || full.seo,
					searchable: prev.searchable || full.searchable,
					ext: prev.ext || full.ext,
					thumbnails: prev.thumbnails || full.thumbnails,
					publishedAt:
						full.publishedAt !== undefined
							? full.publishedAt
							: prev.publishedAt, // publishedAtも更新（APIから取得した値で上書き）
				}));
			} catch {}
		})();
		return () => {
			cancelled = true;
		};
	}, [mode, formData.id]);

	const [newTag, setNewTag] = useState("");
	const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [tagOptions, setTagOptions] = useState<string[]>([]);
	const initialRef = useRef<Partial<Content>>(initialData);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const gifInputRef = useRef<HTMLInputElement>(null);
	const webmInputRef = useRef<HTMLInputElement>(null);

	const uploadMediaFile = useCallback(
		async (file: File) => {
			if (!formData.id) {
				console.warn("[ContentForm] Missing content ID for media upload");
				return null;
			}
			const base64 = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const result = String(reader.result ?? "");
					resolve(result.includes(",") ? result.split(",")[1] ?? "" : result);
				};
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(file);
			});
			const res = await fetch("/api/cms/media", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contentId: formData.id,
					filename: file.name,
					mimeType: file.type,
					base64Data: base64,
				}),
			});
			if (!res.ok) {
				console.error("[ContentForm] Failed to upload media", await res.text());
				return null;
			}
			const { id } = (await res.json()) as { id: string };
			return `/api/cms/media?contentId=${formData.id}&id=${id}&raw=1`;
		},
		[formData.id],
	);

	const handleImageFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;
			const url = await uploadMediaFile(file);
			event.target.value = "";
			if (!url) return;
			setFormData((prev) => ({
				...prev,
				thumbnails: {
					...(prev.thumbnails || {}),
					image: { ...(prev.thumbnails?.image || {}), src: url },
				},
			}));
		},
		[uploadMediaFile],
	);

	const handleGifFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;
			const url = await uploadMediaFile(file);
			event.target.value = "";
			if (!url) return;
			setFormData((prev) => ({
				...prev,
				thumbnails: {
					...(prev.thumbnails || {}),
					gif: { ...(prev.thumbnails?.gif || {}), src: url },
				},
			}));
		},
		[uploadMediaFile],
	);

	const handleWebmFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;
			const url = await uploadMediaFile(file);
			event.target.value = "";
			if (!url) return;
			setFormData((prev) => ({
				...prev,
				thumbnails: {
					...(prev.thumbnails || {}),
					webm: { ...(prev.thumbnails?.webm || {}), src: url },
				},
			}));
		},
		[uploadMediaFile],
	);

	// initialDataが変更されたときにformDataを更新（編集モードのみ）
	useEffect(() => {
		if (mode === "edit" && initialData && initialData.id) {
			const nowIso = new Date().toISOString();
			// Derive YouTube preview from assets if ext.thumbnail.youtube is not set
			const base: Partial<Content> = {
				id: initialData.id || "",
				title: initialData.title || "",
				summary: initialData.summary || "",
				status: initialData.status || "draft",
				visibility: initialData.visibility || "draft",
				tags: initialData.tags || [],
				publicUrl: initialData.publicUrl || "",
				lang: initialData.lang || "ja",
				parentId: initialData.parentId || "",
				path: initialData.path || "",
				depth: initialData.depth || 0,
				order: initialData.order || 0,
				thumbnails: initialData.thumbnails || undefined,
				assets: initialData.assets || undefined,
				links: initialData.links || undefined,
				relations: initialData.relations || undefined,
				searchable: initialData.searchable || undefined,
				seo: initialData.seo || undefined,
				i18n: initialData.i18n || undefined,
				permissions: initialData.permissions || undefined,
				ext: initialData.ext || undefined,
				createdAt: initialData.createdAt || nowIso,
				updatedAt: initialData.updatedAt || nowIso,
				publishedAt: initialData.publishedAt ?? undefined,
				unpublishedAt: initialData.unpublishedAt ?? undefined,
			};
			// Derive YouTube preview from assets if ext.thumbnail.youtube is not set
			try {
				const hasThumbYouTube = (base.ext as any)?.thumbnail?.youtube;
				if (!hasThumbYouTube && Array.isArray(base.assets)) {
					const yt = (base.assets as any[]).find(
						(a) =>
							a?.type === "video/youtube" ||
							(typeof a?.src === "string" && a.src.includes("youtube.")),
					);
					if (yt?.src) {
						base.ext = {
							...((base.ext as any) || {}),
							thumbnail: {
								...((base.ext as any)?.thumbnail || {}),
								youtube: yt.src,
							},
						} as any;
					}
				}
			} catch {}
			console.log("[ContentForm] initialData:", {
				id: initialData.id,
				publishedAt: initialData.publishedAt,
			});
			console.log("[ContentForm] setting formData:", {
				publishedAt: base.publishedAt,
			});
			setFormData(base);
			initialRef.current = initialData;
		}
	}, [
		mode,
		initialData?.id,
		initialData?.publishedAt,
		initialData?.title,
		initialData?.summary,
	]); // 編集モードでinitialDataが変更されたとき更新

	function normalize(value: any): any {
		if (Array.isArray(value)) return value.map(normalize);
		if (value && typeof value === "object") {
			const out: Record<string, any> = {};
			Object.keys(value)
				.sort()
				.forEach((k) => {
					if (value[k] !== undefined) out[k] = normalize(value[k]);
				});
			return out;
		}
		return value;
	}
	const isDirty = useMemo(() => {
		try {
			const a = JSON.stringify(normalize(initialRef.current));
			const b = JSON.stringify(normalize(formData));
			return a !== b;
		} catch {
			return true;
		}
	}, [formData]);

	// Auto-set publicUrl when id changes and publicUrl is empty
	useEffect(() => {
		if (
			(formData.publicUrl ?? "").trim() === "" &&
			(formData.id ?? "").trim() !== ""
		) {
			setFormData((prev) => ({ ...prev, publicUrl: `/content/${prev.id}` }));
		}
	}, [formData.id]);

	// Load existing tags from contents for search suggestions
	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				const res = await fetch("/api/cms/contents", {
					signal: controller.signal,
					cache: "no-store",
				});
				if (!res.ok) return;
				const data = await res.json();
				const all: string[] = Array.isArray(data)
					? data.flatMap((c: any) => (Array.isArray(c?.tags) ? c.tags : []))
					: [];
				const unique = Array.from(
					new Set(all.filter((t) => typeof t === "string" && t.trim())),
				);
				unique.sort((a, b) => a.localeCompare(b, "ja"));
				setTagOptions(unique);
			} catch {
				/* ignore */
			}
		})();
		return () => controller.abort();
	}, []);

	// Sync controlled status/visibility if provided
	useEffect(() => {
		if (controlledStatus) {
			setFormData((prev) => ({ ...prev, status: controlledStatus }));
		}
	}, [controlledStatus]);
	useEffect(() => {
		if (controlledVisibility) {
			setFormData((prev) => ({ ...prev, visibility: controlledVisibility }));
		}
	}, [controlledVisibility]);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const submitData: Partial<Content> = {
			...formData,
			updatedAt: new Date().toISOString(),
		};
		// 編集モードでIDが変更された場合、oldIdを含める
		// initialRef.currentを使用して、初期データのIDを参照
		const originalId = initialRef.current?.id;
		if (
			mode === "edit" &&
			originalId &&
			formData.id &&
			formData.id !== originalId
		) {
			(submitData as any).oldId = originalId;
		}
		// publishedAtがundefinedでも明示的に送信する（nullに変換）
		if (!Object.hasOwn(submitData, "publishedAt")) {
			submitData.publishedAt = formData.publishedAt;
		}
		console.log("[ContentForm] handleSubmit formData:", formData);
		console.log("[ContentForm] handleSubmit submitData:", submitData);
		console.log("[ContentForm] handleSubmit publishedAt:", {
			formDataPublishedAt: formData.publishedAt,
			submitDataPublishedAt: submitData.publishedAt,
		});
		onSubmit(submitData);
	};

	const _addTag = () => {
		if (!newTag.trim()) return;
		if ((formData.tags ?? []).includes(newTag.trim())) return;
		setFormData((prev) => ({
			...prev,
			tags: [...(prev.tags ?? []), newTag.trim()],
		}));
		setNewTag("");
	};

	const removeTag = (tag: string) => {
		setFormData((prev) => ({
			...prev,
			tags: (prev.tags ?? []).filter((item) => item !== tag),
		}));
	};

	const handleJsonChange = (field: keyof Content, value: string) => {
		try {
			const parsed = parseJsonSafely(value);
			setFormData((prev) => ({ ...prev, [field]: parsed }));
			setJsonErrors((prev) => ({ ...prev, [field as string]: "" }));
		} catch (error) {
			console.error("[ContentForm] JSON parse error", error);
			setJsonErrors((prev) => ({
				...prev,
				[field as string]: "JSONの形式が正しくありません",
			}));
		}
	};

	// No upload handler (URL-based)

	const _renderJsonField = (
		label: string,
		field: keyof Content,
		helperText?: string,
	) => (
		<Stack spacing={0.5}>
			<Typography variant="subtitle2">{label}</Typography>

			<TextField
				value={stringifyJson(formData[field as keyof Content])}
				onChange={(event) => handleJsonChange(field, event.target.value)}
				multiline
				minRows={4}
				placeholder="JSON形式で入力"
				error={Boolean(jsonErrors[field as string])}
				helperText={jsonErrors[field as string] || helperText}
			/>
		</Stack>
	);

	// requestUpload removed

	const _thumbnailImage = useMemo(
		() => formData.thumbnails?.image?.src || "",
		[formData.thumbnails?.image?.src],
	);

	const sections = [
		"概要",
		"サムネイル",
		"リンク・メディア",
		"検索・SEO",
		"権限・多言語・拡張",
		"リレーション",
		"構造",
	] as const;

	const [sectionIndex, setSectionIndex] = useState(0);

	const Essentials = (
		<Stack spacing={2}>
			{/* First row: Title + ID */}
			<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
				<Box sx={{ flex: 1 }}>
					<TextField
						fullWidth
						label="タイトル"
						value={formData.title}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, title: e.target.value }))
						}
						required
					/>
				</Box>
				<Box sx={{ flex: 1 }}>
					<TextField
						fullWidth
						label="ID"
						value={formData.id}
						onChange={(event) =>
							setFormData((prev) => ({ ...prev, id: event.target.value }))
						}
						required
					/>
				</Box>
			</Stack>

			{/* PublishedAt row */}
			<Box>
				<TextField
					fullWidth
					label="表示日付 (publishedAt)"
					type="date"
					value={
						formData.publishedAt
							? new Date(formData.publishedAt).toISOString().slice(0, 10)
							: ""
					}
					onChange={(e) => {
						const newValue = e.target.value
							? new Date(`${e.target.value}T12:00:00`).toISOString()
							: undefined;
						console.log("[ContentForm] publishedAt onChange:", {
							inputValue: e.target.value,
							newPublishedAt: newValue,
						});
						setFormData((prev) => ({
							...prev,
							publishedAt: newValue,
						}));
					}}
					InputLabelProps={{ shrink: true }}
				/>
			</Box>

			{/* Public URL full width row */}
			<Box>
				<TextField
					fullWidth
					label="公開URL"
					value={formData.publicUrl ?? ""}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, publicUrl: e.target.value }))
					}
					placeholder="https://example.com/..."
				/>
			</Box>

			{/* Tag search row */}
			<Box>
				<Autocomplete
					fullWidth
					sx={{ width: 1 }}
					freeSolo
					options={tagOptions}
					onChange={(_, value) => {
						if (typeof value === "string" && value.trim()) {
							setFormData((prev) => ({
								...prev,
								tags: Array.from(new Set([...(prev.tags ?? []), value.trim()])),
							}));
						}
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							fullWidth
							sx={{ width: 1 }}
							label="タグ検索 / 追加"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									const value = (e.target as HTMLInputElement).value.trim();
									if (value) {
										e.preventDefault();
										setFormData((prev) => ({
											...prev,
											tags: Array.from(new Set([...(prev.tags ?? []), value])),
										}));
									}
								}
							}}
						/>
					)}
				/>
			</Box>

			{/* Tag list row */}
			<Box>
				<Stack
					direction="row"
					spacing={0.5}
					flexWrap="wrap"
					useFlexGap
					sx={{ width: 1 }}
				>
					{(formData.tags ?? []).map((tag) => (
						<Chip key={tag} label={tag} onDelete={() => removeTag(tag)} />
					))}
				</Stack>
			</Box>

			{/* Summary full width row at last */}
			<Box>
				<TextField
					fullWidth
					label="概要"
					value={formData.summary ?? ""}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, summary: e.target.value }))
					}
					multiline
					minRows={3}
				/>
			</Box>
		</Stack>
	);

	const Thumbnail = (
		<Stack spacing={2}>
			<Typography variant="subtitle2">サムネイルURL</Typography>
			<TextField
				fullWidth
				label="画像URL"
				value={formData.thumbnails?.image?.src || ""}
				onChange={(e) =>
					setFormData((prev) => ({
						...prev,
						thumbnails: {
							...prev.thumbnails,
							image: { ...(prev.thumbnails?.image || {}), src: e.target.value },
						},
					}))
				}
			/>
			{formData.thumbnails?.image?.src && (
				<Box
					component="img"
					src={formData.thumbnails.image.src}
					alt="thumbnail"
					sx={{
						width: 192,
						height: 108,
						objectFit: "cover",
						border: 1,
						borderColor: "divider",
						borderRadius: 1,
					}}
				/>
			)}
			<Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
				<Button
					variant="outlined"
					size="small"
					onClick={() => imageInputRef.current?.click()}
				>
					画像を埋め込み
				</Button>
				<input
					ref={imageInputRef}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={handleImageFileChange}
				/>
			</Stack>
			<TextField
				fullWidth
				label="YouTubeリンク (ext.thumbnail.youtube)"
				value={(formData.ext as any)?.thumbnail?.youtube || ""}
				onChange={(e) =>
					setFormData((prev) => ({
						...prev,
						ext: {
							...((prev.ext as any) || {}),
							thumbnail: {
								...((prev.ext as any)?.thumbnail || {}),
								youtube: e.target.value,
							},
						},
						// YouTube を assets にも保存（永続化のため）
						assets: (() => {
							const url = e.target.value.trim();
							const list = [...((prev.assets as any[]) || [])];
							const idx = list.findIndex(
								(a) =>
									a?.type === "video/youtube" ||
									(typeof a?.src === "string" && a.src.includes("youtube.")),
							);
							if (!url) {
								// 空になったら既存のYouTubeエントリを除去
								return idx >= 0 ? list.filter((_, i) => i !== idx) : list;
							}
							if (idx >= 0) {
								list[idx] = {
									...(list[idx] || {}),
									src: url,
									type: "video/youtube",
								};
							} else {
								list.push({ src: url, type: "video/youtube" });
							}
							return list;
						})(),
					}))
				}
			/>
			{(formData.ext as any)?.thumbnail?.youtube && (
				<Box sx={{ position: "relative", pt: "56.25%" }}>
					{(() => {
						const embed = toYouTubeEmbed(
							(formData.ext as any).thumbnail.youtube,
						);
						if (!embed) return null;
						return (
							<Box
								component="iframe"
								src={embed}
								title="YouTube preview"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								sx={{
									position: "absolute",
									inset: 0,
									width: "100%",
									height: "100%",
									border: 0,
								}}
							/>
						);
					})()}
				</Box>
			)}
			<TextField
				fullWidth
				label="GIF URL"
				value={formData.thumbnails?.gif?.src || ""}
				onChange={(e) =>
					setFormData((prev) => ({
						...prev,
						thumbnails: {
							...prev.thumbnails,
							gif: { ...(prev.thumbnails?.gif || {}), src: e.target.value },
						},
					}))
				}
			/>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
				<Button
					variant="outlined"
					size="small"
					onClick={() => gifInputRef.current?.click()}
				>
					GIFを埋め込み
				</Button>
				<input
					ref={gifInputRef}
					type="file"
					accept="image/gif"
					style={{ display: "none" }}
					onChange={handleGifFileChange}
				/>
			</Stack>
			<TextField
				fullWidth
				label="WEBM URL"
				value={formData.thumbnails?.webm?.src || ""}
				onChange={(e) =>
					setFormData((prev) => ({
						...prev,
						thumbnails: {
							...prev.thumbnails,
							webm: { ...(prev.thumbnails?.webm || {}), src: e.target.value },
						},
					}))
				}
			/>
			<TextField
				fullWidth
				label="WEBM ポスター画像URL"
				value={formData.thumbnails?.webm?.poster || ""}
				onChange={(e) =>
					setFormData((prev) => ({
						...prev,
						thumbnails: {
							...prev.thumbnails,
							webm: {
								...(prev.thumbnails?.webm || {}),
								src: prev.thumbnails?.webm?.src || "",
								poster: e.target.value,
							},
						},
					}))
				}
			/>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
				<Button
					variant="outlined"
					size="small"
					onClick={() => webmInputRef.current?.click()}
				>
					WEBMを埋め込み
				</Button>
				<input
					ref={webmInputRef}
					type="file"
					accept="video/webm"
					style={{ display: "none" }}
					onChange={handleWebmFileChange}
				/>
			</Stack>
			{formData.thumbnails?.webm?.src && (
				<Box
					component="video"
					src={formData.thumbnails.webm.src}
					controls
					muted
					style={{ maxWidth: 320 }}
				/>
			)}
		</Stack>
	);

	// Removed Publish/Date section as per requirements

	const Structure = (
		<Stack spacing={2}>
			<TextField
				label="親ID (parentId)"
				value={formData.parentId ?? ""}
				onChange={(e) =>
					setFormData((prev) => ({ ...prev, parentId: e.target.value }))
				}
				fullWidth
			/>
			<TextField
				label="パス (path)"
				value={formData.path ?? ""}
				onChange={(e) =>
					setFormData((prev) => ({ ...prev, path: e.target.value }))
				}
				fullWidth
			/>
			<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
				<TextField
					label="深さ (depth)"
					type="number"
					value={formData.depth ?? 0}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							depth: Number(e.target.value) || 0,
						}))
					}
					fullWidth
				/>
				<TextField
					label="並び順 (order)"
					type="number"
					value={formData.order ?? 0}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							order: Number(e.target.value) || 0,
						}))
					}
					fullWidth
				/>
				<TextField
					label="childCount"
					type="number"
					value={formData.childCount ?? 0}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							childCount: Number(e.target.value) || 0,
						}))
					}
					fullWidth
				/>
			</Stack>
		</Stack>
	);
	const LinksMedia = (
		<Stack spacing={2}>
			<Typography variant="subtitle2">リンク</Typography>
			<Stack spacing={1}>
				{(formData.links || []).map((link: any, idx: number) => (
					<Stack
						key={idx}
						direction={{ xs: "column", md: "row" }}
						spacing={1}
						alignItems={{ md: "center" }}
					>
						<TextField
							label="ラベル"
							value={link?.label || ""}
							onChange={(e) => {
								const next = [...(formData.links || [])];
								next[idx] = { ...(link || {}), label: e.target.value };
								setFormData({ ...formData, links: next });
							}}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="URL"
							value={link?.href || ""}
							onChange={(e) => {
								const next = [...(formData.links || [])];
								next[idx] = { ...(link || {}), href: e.target.value };
								setFormData({ ...formData, links: next });
							}}
							sx={{ flex: 2 }}
						/>
						<IconButton
							color="error"
							onClick={() => {
								const next = [...(formData.links || [])];
								next.splice(idx, 1);
								setFormData({ ...formData, links: next });
							}}
						>
							<Trash2 size={16} />
						</IconButton>
					</Stack>
				))}
				<Button
					variant="outlined"
					size="small"
					onClick={() =>
						setFormData({
							...formData,
							links: [...(formData.links || []), { label: "", href: "" }],
						})
					}
				>
					リンクを追加
				</Button>
			</Stack>

			<Typography variant="subtitle2" sx={{ mt: 2 }}>
				メディア一覧（バイナリ）
			</Typography>
			<Stack spacing={1}>
				{(() => {
					// 1) ベース: assets
					const list: Array<{ src: string; type?: string }> = [
						...((formData.assets as any[]) || []).map((a) => ({
							src: a?.src,
							type: a?.type,
						})),
					];
					// 2) thumbnails を併記（埋め込みURLでも表示）
					if (formData.thumbnails?.image?.src)
						list.push({ src: formData.thumbnails.image.src, type: "image/*" });
					if (formData.thumbnails?.gif?.src)
						list.push({ src: formData.thumbnails.gif.src, type: "image/gif" });
					if (formData.thumbnails?.webm?.src)
						list.push({
							src: formData.thumbnails.webm.src,
							type: "video/webm",
						});
					if (formData.thumbnails?.webm?.poster)
						list.push({
							src: formData.thumbnails.webm.poster,
							type: "image/*",
						});
					// 3) 重複除去
					const dedup = Array.from(
						new Map(list.filter((m) => m.src).map((m) => [m.src, m])).values(),
					);
					return dedup.length === 0 ? (
						<Typography variant="body2" color="text.secondary">
							メディアがありません
						</Typography>
					) : (
						dedup.map((asset: any, idx: number) => (
							<Stack
								key={`${asset.src}-${idx}`}
								direction="row"
								spacing={1}
								alignItems="center"
							>
								{(asset?.type || "").startsWith("image/") ? (
									<Box
										component="img"
										src={asset.src}
										alt="media"
										sx={{
											width: 72,
											height: 48,
											objectFit: "cover",
											border: 1,
											borderColor: "divider",
											borderRadius: 1,
										}}
									/>
								) : (asset?.type || "").startsWith("video/") ? (
									<Box
										component="video"
										src={asset.src}
										controls
										muted
										style={{ width: 120, height: 72 }}
									/>
								) : (
									<Typography variant="caption">
										{asset?.type || "file"}
									</Typography>
								)}
								<Typography
									variant="body2"
									sx={{ flex: 1, minWidth: 0 }}
									noWrap
								>
									{asset?.src}
								</Typography>
								<IconButton
									size="small"
									color="error"
									onClick={async () => {
										const src = asset?.src || "";
										// 1) API上のメディアなら削除リクエスト
										try {
											if (
												src.includes("/api/cms/media") &&
												typeof window !== "undefined"
											) {
												const u = new URL(src, window.location.origin);
												const cid =
													u.searchParams.get("contentId") || formData.id || "";
												const mid = u.searchParams.get("id");
												if (cid && mid) {
													await fetch(
														`/api/cms/media?contentId=${encodeURIComponent(cid)}&id=${encodeURIComponent(mid)}`,
														{ method: "DELETE" },
													).catch(() => undefined);
												}
											}
										} catch {
											/* ignore */
										}

										// 2) formData から参照を削除
										setFormData((prev) => {
											// assets: src一致を削除
											const nextAssets = (prev.assets as any[])?.filter(
												(a) => a?.src !== src,
											);
											// thumbnails: 一致するものを空に
											const nextThumb = { ...(prev.thumbnails || {}) } as any;
											if (nextThumb.image?.src === src)
												nextThumb.image = {
													...(nextThumb.image || {}),
													src: "",
												};
											if (nextThumb.gif?.src === src)
												nextThumb.gif = { ...(nextThumb.gif || {}), src: "" };
											if (nextThumb.webm?.src === src)
												nextThumb.webm = { ...(nextThumb.webm || {}), src: "" };
											if (nextThumb.webm?.poster === src)
												nextThumb.webm = {
													...(nextThumb.webm || {}),
													poster: "",
													src: nextThumb.webm?.src || "",
												};
											return {
												...prev,
												assets: nextAssets,
												thumbnails: nextThumb,
											};
										});
									}}
								>
									<Trash2 size={16} />
								</IconButton>
							</Stack>
						))
					);
				})()}
			</Stack>
		</Stack>
	);
	const SearchSeo = (
		<Stack spacing={2}>
			<Typography variant="subtitle2">検索</Typography>
			<TextField
				label="全文検索テキスト"
				value={formData.searchable?.fullText || ""}
				onChange={(e) =>
					setFormData({
						...formData,
						searchable: {
							...(formData.searchable || {}),
							fullText: e.target.value,
						},
					})
				}
				multiline
				minRows={2}
				fullWidth
			/>
			<TextField
				label="トークン（カンマ区切り）"
				value={(formData.searchable?.tokens || []).join(", ")}
				onChange={(e) =>
					setFormData({
						...formData,
						searchable: {
							...(formData.searchable || {}),
							tokens: e.target.value
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean),
						},
					})
				}
				fullWidth
			/>
			<Typography variant="subtitle2">SEO</Typography>
			<TextField
				label="Meta Title"
				value={formData.seo?.meta?.title || ""}
				onChange={(e) =>
					setFormData({
						...formData,
						seo: {
							...(formData.seo || {}),
							meta: { ...(formData.seo?.meta || {}), title: e.target.value },
						},
					})
				}
				fullWidth
			/>
			<TextField
				label="Meta Description"
				value={formData.seo?.meta?.description || ""}
				onChange={(e) =>
					setFormData({
						...formData,
						seo: {
							...(formData.seo || {}),
							meta: {
								...(formData.seo?.meta || {}),
								description: e.target.value,
							},
						},
					})
				}
				fullWidth
				multiline
				minRows={2}
			/>
			<TextField
				label="OG Title"
				value={formData.seo?.openGraph?.title || ""}
				onChange={(e) =>
					setFormData({
						...formData,
						seo: {
							...(formData.seo || {}),
							openGraph: {
								...(formData.seo?.openGraph || {}),
								title: e.target.value,
							},
						},
					})
				}
				fullWidth
			/>
			<TextField
				label="OG Description"
				value={formData.seo?.openGraph?.description || ""}
				onChange={(e) =>
					setFormData({
						...formData,
						seo: {
							...(formData.seo || {}),
							openGraph: {
								...(formData.seo?.openGraph || {}),
								description: e.target.value,
							},
						},
					})
				}
				fullWidth
				multiline
				minRows={2}
			/>
			<TextField
				label="OG Image URL"
				value={formData.seo?.openGraph?.image || ""}
				onChange={(e) =>
					setFormData({
						...formData,
						seo: {
							...(formData.seo || {}),
							openGraph: {
								...(formData.seo?.openGraph || {}),
								image: e.target.value,
							},
						},
					})
				}
				fullWidth
			/>
			<TextField
				label="Canonical"
				value={formData.seo?.meta?.canonical || ""}
				onChange={(e) =>
					setFormData({
						...formData,
						seo: {
							...(formData.seo || {}),
							meta: {
								...(formData.seo?.meta || {}),
								canonical: e.target.value,
							},
						},
					})
				}
				fullWidth
			/>
			<TextField
				label="Robots"
				value={formData.seo?.meta?.robots || "index,follow"}
				onChange={(e) =>
					setFormData({
						...formData,
						seo: {
							...(formData.seo || {}),
							meta: { ...(formData.seo?.meta || {}), robots: e.target.value },
						},
					})
				}
				fullWidth
			/>
			<TextField
				label="Keywords（カンマ区切り）"
				value={(formData.seo as any)?.keywords || ""}
				onChange={(e) =>
					setFormData((prev) => ({
						...prev,
						seo: { ...(prev.seo || {}), keywords: e.target.value } as any,
					}))
				}
				fullWidth
			/>
		</Stack>
	);
	const PermissionsI18nExt = (
		<Stack spacing={2}>
			<Typography variant="subtitle2">権限</Typography>
			<TextField
				label="オーナー"
				value={formData.permissions?.owner || ""}
				onChange={(e) =>
					setFormData({
						...formData,
						permissions: {
							...(formData.permissions || {}),
							owner: e.target.value,
						},
					})
				}
				fullWidth
			/>
			<TextField
				label="閲覧権限（カンマ区切り）"
				value={(formData.permissions?.readers || []).join(", ")}
				onChange={(e) =>
					setFormData({
						...formData,
						permissions: {
							...(formData.permissions || {}),
							readers: e.target.value
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean),
						},
					})
				}
				fullWidth
			/>
			<TextField
				label="編集権限（カンマ区切り）"
				value={(formData.permissions?.editors || []).join(", ")}
				onChange={(e) =>
					setFormData({
						...formData,
						permissions: {
							...(formData.permissions || {}),
							editors: e.target.value
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean),
						},
					})
				}
				fullWidth
			/>
			<Typography variant="subtitle2">多言語</Typography>
			<TextField
				label="デフォルト言語"
				value={formData.i18n?.defaultLang || formData.lang || "ja"}
				onChange={(e) =>
					setFormData({
						...formData,
						i18n: { ...(formData.i18n || {}), defaultLang: e.target.value },
					})
				}
				fullWidth
			/>
			<Typography variant="body2">翻訳（lang:id を改行区切り）</Typography>
			<TextField
				multiline
				minRows={3}
				value={Object.entries(formData.i18n?.translations || {})
					.map(([k, v]) => `${k}:${v}`)
					.join("\n")}
				onChange={(e) => {
					const map: Record<string, string> = {};
					e.target.value.split(/\n+/).forEach((line) => {
						const [k, ...rest] = line.split(":");
						if (k && rest.length) {
							map[k.trim()] = rest.join(":").trim();
						}
					});
					setFormData({
						...formData,
						i18n: {
							...(formData.i18n || {}),
							translations: map,
							defaultLang: formData.i18n?.defaultLang || formData.lang || "ja",
						},
					});
				}}
				fullWidth
			/>
			<Typography variant="subtitle2">拡張</Typography>
			<TextField
				label="Twitter @site"
				value={(formData.ext as any)?.twitter?.site || ""}
				onChange={(e) =>
					setFormData((prev) => ({
						...prev,
						ext: {
							...((prev.ext as any) || {}),
							twitter: {
								...((prev.ext as any)?.twitter || {}),
								site: e.target.value,
							},
						},
					}))
				}
				fullWidth
			/>
		</Stack>
	);
	const Relations = (
		<Stack spacing={1}>
			{(formData.relations || []).map((rel: any, idx: number) => (
				<Stack
					key={idx}
					direction={{ xs: "column", md: "row" }}
					spacing={1}
					alignItems={{ md: "center" }}
				>
					<TextField
						label="ターゲットID"
						value={rel?.targetId || ""}
						onChange={(e) => {
							const next = [...(formData.relations || [])];
							next[idx] = { ...(rel || {}), targetId: e.target.value };
							setFormData({ ...formData, relations: next });
						}}
						sx={{ flex: 2 }}
					/>
					<TextField
						label="タイプ"
						value={rel?.type || "related"}
						onChange={(e) => {
							const next = [...(formData.relations || [])];
							next[idx] = { ...(rel || {}), type: e.target.value };
							setFormData({ ...formData, relations: next });
						}}
						sx={{ flex: 1 }}
					/>
					<TextField
						label="双方向 (true/false)"
						value={String(Boolean(rel?.bidirectional))}
						onChange={(e) => {
							const v = e.target.value.toLowerCase() === "true";
							const next = [...(formData.relations || [])];
							next[idx] = { ...(rel || {}), bidirectional: v };
							setFormData({ ...formData, relations: next });
						}}
						sx={{ width: 140 }}
					/>
					<IconButton
						color="error"
						onClick={() => {
							const next = [...(formData.relations || [])];
							next.splice(idx, 1);
							setFormData({ ...formData, relations: next });
						}}
					>
						<Trash2 size={16} />
					</IconButton>
				</Stack>
			))}
			<Button
				variant="outlined"
				size="small"
				onClick={() =>
					setFormData({
						...formData,
						relations: [
							...(formData.relations || []),
							{ targetId: "", type: "related", bidirectional: false },
						],
					})
				}
			>
				リレーションを追加
			</Button>
		</Stack>
	);

	const renderSection = () => {
		switch (sectionIndex) {
			case 0:
				return Essentials;
			case 1:
				return Thumbnail;
			case 2:
				return LinksMedia;
			case 3:
				return SearchSeo;
			case 4:
				return PermissionsI18nExt;
			case 5:
				return Relations;
			case 6:
				return Structure;
			default:
				return Essentials;
		}
	};

	return (
		<Box
			component="form"
			onSubmit={handleSubmit}
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: 2,
				minHeight: 0,
				px: 0,
				pt: 0.5,
			}}
		>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "200px 1fr" },
					gap: 3,
					minHeight: 0,
				}}
			>
				<Stack spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
					<Tabs
						orientation="vertical"
						variant="scrollable"
						value={sectionIndex}
						onChange={(_, v) => setSectionIndex(v)}
						sx={{
							borderRight: 1,
							borderColor: "divider",
							minHeight: 400,
							width: 200,
							alignItems: "stretch",
						}}
					>
						{sections.map((label, i) => (
							<Tab
								key={label}
								label={label}
								value={i}
								disableRipple
								sx={{
									justifyContent: "flex-start",
									alignItems: "flex-start",
									textAlign: "left",
									fontSize: 13,
									minHeight: 36,
									py: 0.5,
									px: 1.5,
									textTransform: "none",
								}}
							/>
						))}
					</Tabs>
				</Stack>
				<Box
					sx={{
						maxHeight: 400,
						overflowY: "auto",
						pr: 1,
						minWidth: 0,
						// Thin scrollbar (Firefox)
						scrollbarWidth: "thin",
						// Thin scrollbar (WebKit)
						"&::-webkit-scrollbar": { width: 6 },
						"&::-webkit-scrollbar-thumb": {
							backgroundColor: "rgba(255,255,255,0.25)",
							borderRadius: 8,
						},
						"&::-webkit-scrollbar-track": {
							backgroundColor: "transparent",
						},
					}}
				>
					<Stack spacing={2}>
						{feedback && (
							<Alert severity={feedback.type} onClose={() => setFeedback(null)}>
								{feedback.message}
							</Alert>
						)}
						{renderSection()}
					</Stack>
				</Box>
			</Box>

			{/* Sticky footer actions */}
			<Box
				sx={{
					position: "sticky",
					bottom: 0,
					bgcolor: "background.paper",
					borderColor: "divider",
					py: 0,
					px: 0,
					mt: 0,
				}}
			>
				<Stack direction="row" justifyContent="flex-end" spacing={1.5}>
					<Button variant="outlined" onClick={onCancel} disabled={isLoading}>
						キャンセル
					</Button>
					<Button
						type="submit"
						variant={isDirty ? "contained" : "outlined"}
						color={isDirty ? "primary" : "inherit"}
						disabled={isLoading || !isDirty}
					>
						{mode === "create" ? "作成" : "更新"}
					</Button>
				</Stack>
			</Box>

			{/* file inputs removed: URL-based inputs used */}
		</Box>
	);
}
