"use client";

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

const _stringifyJson = (value: unknown) => {
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

function toYouTubeEmbed(url: string): string | null {
	if (!url) return null;
	try {
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

const s = {
	col2: { display: "flex", flexDirection: "column" as const, gap: 12 },
	label: { marginBottom: 3 },
	input: { width: "100%", padding: "5px 8px", fontSize: 13, outline: "none" },
	textarea: {
		width: "100%",
		padding: "5px 8px",
		fontSize: 13,
		outline: "none",
		resize: "vertical" as const,
		fontFamily: "inherit",
	},
	btn: { padding: "4px 10px", fontSize: 12, cursor: "pointer" },
	btnPrimary: {
		padding: "4px 10px",
		fontSize: 12,
		cursor: "pointer",
		fontWeight: 600 as const,
	},
	btnDanger: {
		padding: "2px 6px",
		cursor: "pointer",
		display: "inline-flex",
		alignItems: "center",
	},
	chip: {
		display: "inline-flex",
		alignItems: "center",
		gap: 4,
		padding: "2px 8px",
	},
	sectionTitle: { fontSize: 13, fontWeight: 600 as const, marginBottom: 4 },
	helper: { fontSize: 11, marginTop: 2 },
	error: { fontSize: 11, marginTop: 2 },
	divider: { height: 1, margin: "8px 0" },
};

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
		const deriveYouTubePreview = () => {
			let hasThumbYouTube = false;
			if (base.ext) {
				const extAny = base.ext as any;
				if (extAny.thumbnail) {
					if (extAny.thumbnail.youtube) {
						hasThumbYouTube = true;
					}
				}
			}
			if (hasThumbYouTube) return;
			if (!Array.isArray(base.assets)) return;
			let ytSrc: string | null = null;
			for (const a of base.assets as any[]) {
				if (a) {
					if (a.type === "video/youtube" && a.src) {
						ytSrc = a.src;
						break;
					}
					if (
						a.src &&
						typeof a.src === "string" &&
						a.src.includes("youtube.")
					) {
						ytSrc = a.src;
						break;
					}
				}
			}
			if (ytSrc) {
				const currentExt = base.ext as any;
				const currentThumbnail = currentExt?.thumbnail || {};
				base.ext = {
					...(currentExt || {}),
					thumbnail: { ...currentThumbnail, youtube: ytSrc },
				} as any;
			}
		};
		try {
			deriveYouTubePreview();
		} catch {}
		return base;
	});

	const generatedOgImageUrl = useMemo(() => {
		const params = new URLSearchParams({
			title: formData.seo?.openGraph?.title || formData.title || "Untitled",
			category: formData.tags?.[0] || "Portfolio",
			tags: (formData.tags || []).join(","),
			thumbnail:
				formData.thumbnails?.image?.src ||
				formData.thumbnails?.webm?.poster ||
				"",
			slug: formData.id || "",
			summary: formData.seo?.openGraph?.description || formData.summary || "",
		});
		return `/api/og?${params.toString()}`;
	}, [
		formData.id,
		formData.seo?.openGraph?.description,
		formData.seo?.openGraph?.title,
		formData.summary,
		formData.tags,
		formData.thumbnails?.image?.src,
		formData.thumbnails?.webm?.poster,
		formData.title,
	]);

	const applyGeneratedOgImageUrl = useCallback(() => {
		setFormData((prev) => ({
			...prev,
			seo: {
				...(prev.seo || {}),
				openGraph: {
					...(prev.seo?.openGraph || {}),
					image: generatedOgImageUrl,
				},
			},
		}));
	}, [generatedOgImageUrl]);

	const prevIdRef = useRef<string | undefined>(formData.id);

	useEffect(() => {
		if (prevIdRef.current === formData.id) return;
		prevIdRef.current = formData.id;
		let current = "";
		if (formData.ext) {
			const extAny = formData.ext as any;
			if (extAny.thumbnail?.youtube) current = extAny.thumbnail.youtube;
		}
		if (current) return;
		const findYouTubeUrl = (): string => {
			if (Array.isArray(formData.assets)) {
				for (const x of formData.assets as any[]) {
					if (x?.type === "video/youtube" && x.src) return x.src;
					if (x?.src && typeof x.src === "string" && x.src.includes("youtube."))
						return x.src;
				}
			}
			if (Array.isArray(formData.links)) {
				for (const x of formData.links as any[]) {
					if (
						x?.href &&
						typeof x.href === "string" &&
						x.href.includes("youtube.")
					)
						return x.href;
				}
			}
			return "";
		};
		const found = findYouTubeUrl();
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
	}, [formData.id]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (mode !== "edit" || !formData.id) return;
			const hasDetailMetadata = Boolean(
				formData.assets ||
					formData.links ||
					formData.relations ||
					formData.seo ||
					formData.searchable ||
					formData.ext,
			);
			if (hasDetailMetadata) return;
			let full: any = null;
			try {
				const res = await fetch(
					`/api/cms/contents?id=${encodeURIComponent(formData.id)}`,
					{ cache: "no-store" },
				);
				if (!res.ok) return;
				full = await res.json();
			} catch {}
			if (cancelled || !full) return;
			setFormData((prev) => {
				const updated: Partial<Content> = { ...prev };
				if (!prev.assets && full.assets) updated.assets = full.assets;
				if (!prev.links && full.links) updated.links = full.links;
				if (!prev.relations && full.relations)
					updated.relations = full.relations;
				if (!prev.seo && full.seo) updated.seo = full.seo;
				if (!prev.searchable && full.searchable)
					updated.searchable = full.searchable;
				if (!prev.ext && full.ext) updated.ext = full.ext;
				if (!prev.thumbnails && full.thumbnails)
					updated.thumbnails = full.thumbnails;
				if (full.publishedAt !== undefined)
					updated.publishedAt = full.publishedAt;
				return updated;
			});
		})();
		return () => {
			cancelled = true;
		};
	}, [mode, formData.id]);

	const [newTag, setNewTag] = useState("");
	const [_jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [tagOptions, setTagOptions] = useState<string[]>([]);
	const [initialDataState, setInitialDataState] =
		useState<Partial<Content>>(initialData);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const gifInputRef = useRef<HTMLInputElement>(null);
	const webmInputRef = useRef<HTMLInputElement>(null);

	const uploadMediaFile = useCallback(
		async (file: File) => {
			if (!formData.id) return null;
			const base64 = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const result = String(reader.result ?? "");
					resolve(result.includes(",") ? (result.split(",")[1] ?? "") : result);
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
			if (!res.ok) return null;
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

	useEffect(() => {
		if (mode === "edit" && initialData?.id) {
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
			const deriveYouTubePreview = () => {
				let hasThumbYouTube = false;
				if (base.ext) {
					const extAny = base.ext as any;
					if (extAny.thumbnail?.youtube) hasThumbYouTube = true;
				}
				if (hasThumbYouTube) return;
				if (!Array.isArray(base.assets)) return;
				let ytSrc: string | null = null;
				for (const a of base.assets as any[]) {
					if (a?.type === "video/youtube" && a.src) {
						ytSrc = a.src;
						break;
					}
					if (
						a?.src &&
						typeof a.src === "string" &&
						a.src.includes("youtube.")
					) {
						ytSrc = a.src;
						break;
					}
				}
				if (ytSrc) {
					const currentExt = base.ext as any;
					const currentThumbnail = currentExt?.thumbnail || {};
					base.ext = {
						...(currentExt || {}),
						thumbnail: { ...currentThumbnail, youtube: ytSrc },
					} as any;
				}
			};
			try {
				deriveYouTubePreview();
			} catch {}
			setFormData(base);
			setInitialDataState(initialData);
		}
	}, [
		mode,
		initialData?.id,
		initialData?.publishedAt,
		initialData?.title,
		initialData?.summary,
	]);

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
			return (
				JSON.stringify(normalize(initialDataState)) !==
				JSON.stringify(normalize(formData))
			);
		} catch {
			return true;
		}
	}, [formData, initialDataState]);

	useEffect(() => {
		if (
			(formData.publicUrl ?? "").trim() === "" &&
			(formData.id ?? "").trim() !== ""
		) {
			setFormData((prev) => ({ ...prev, publicUrl: `/content/${prev.id}` }));
		}
	}, [formData.id]);

	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			let data: any = null;
			try {
				const res = await fetch("/api/cms/contents", {
					signal: controller.signal,
					cache: "no-store",
				});
				if (!res.ok) return;
				data = await res.json();
			} catch {
				return;
			}
			const all: string[] = [];
			if (Array.isArray(data)) {
				for (const c of data) {
					if (c && Array.isArray(c.tags)) {
						for (const tag of c.tags) all.push(tag);
					}
				}
			}
			setTagOptions(
				Array.from(
					new Set(all.filter((t) => typeof t === "string" && t.trim())),
				).sort((a, b) => a.localeCompare(b, "ja")),
			);
		})();
		return () => controller.abort();
	}, []);

	useEffect(() => {
		if (controlledStatus)
			setFormData((prev) => ({ ...prev, status: controlledStatus }));
	}, [controlledStatus]);
	useEffect(() => {
		if (controlledVisibility)
			setFormData((prev) => ({ ...prev, visibility: controlledVisibility }));
	}, [controlledVisibility]);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const submitData: Partial<Content> = {
			...formData,
			updatedAt: new Date().toISOString(),
		};
		const originalId = initialDataState?.id;
		if (
			mode === "edit" &&
			originalId &&
			formData.id &&
			formData.id !== originalId
		) {
			(submitData as any).oldId = originalId;
			const currentSlug = (
				submitData.ext as Record<string, unknown> | undefined
			)?.slug;
			if (!currentSlug || currentSlug === originalId) {
				submitData.ext = { ...(submitData.ext || {}), slug: formData.id };
			}
		}
		if (!Object.hasOwn(submitData, "publishedAt")) {
			submitData.publishedAt = formData.publishedAt;
		}
		onSubmit(submitData);
	};

	const addTag = () => {
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

	const _handleJsonChange = (field: keyof Content, value: string) => {
		try {
			setFormData((prev) => ({ ...prev, [field]: parseJsonSafely(value) }));
			setJsonErrors((prev) => ({ ...prev, [field as string]: "" }));
		} catch {
			setJsonErrors((prev) => ({
				...prev,
				[field as string]: "JSONの形式が正しくありません",
			}));
		}
	};

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

	const InputField = ({
		label,
		value,
		onChange,
		type,
		required,
		disabled,
		multiline,
		minRows,
		placeholder,
		helperText,
	}: {
		label: string;
		value: string;
		onChange: (v: string) => void;
		type?: string;
		required?: boolean;
		disabled?: boolean;
		multiline?: boolean;
		minRows?: number;
		placeholder?: string;
		helperText?: string;
	}) => (
		<div>
			<div style={s.label}>
				{label}
				{required && " *"}
			</div>
			{multiline ? (
				<textarea
					style={s.textarea}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					disabled={disabled}
					placeholder={placeholder}
					rows={minRows || 3}
				/>
			) : (
				<input
					style={s.input}
					type={type || "text"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={required}
					disabled={disabled}
					placeholder={placeholder}
				/>
			)}
			{helperText && <div style={s.helper}>{helperText}</div>}
		</div>
	);

	const Essentials = (
		<div style={s.col2}>
			<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
				<div style={{ flex: 1, minWidth: 200 }}>
					<InputField
						label="タイトル"
						value={formData.title || ""}
						onChange={(v) => setFormData((p) => ({ ...p, title: v }))}
						required
					/>
				</div>
				<div style={{ flex: 1, minWidth: 200 }}>
					<InputField
						label="ID"
						value={formData.id || ""}
						onChange={(v) => setFormData((p) => ({ ...p, id: v }))}
						required
					/>
				</div>
			</div>
			<InputField
				label="公開日"
				value={
					formData.publishedAt
						? new Date(formData.publishedAt).toISOString().slice(0, 10)
						: ""
				}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						publishedAt: v ? new Date(v).toISOString() : undefined,
					}))
				}
				type="date"
			/>
			<InputField
				label="公開URL"
				value={formData.publicUrl || ""}
				onChange={(v) => setFormData((p) => ({ ...p, publicUrl: v }))}
			/>
			<div>
				<div style={s.label}>タグ</div>
				<div
					style={{
						display: "flex",
						gap: 8,
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<input
						style={{ ...s.input, flex: 1, minWidth: 150 }}
						value={newTag}
						onChange={(e) => setNewTag(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addTag();
							}
						}}
						placeholder="タグを入力してEnter"
						list="tag-suggestions"
					/>
					<datalist id="tag-suggestions">
						{tagOptions.map((t) => (
							<option key={t} value={t} />
						))}
					</datalist>
					<button type="button" style={s.btnPrimary} onClick={addTag}>
						追加
					</button>
				</div>
				<div
					style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}
				>
					{(formData.tags || []).map((tag) => (
						<span key={tag} style={s.chip}>
							{tag}
							<button
								type="button"
								style={{ ...s.btnDanger, padding: 0, fontSize: 11 }}
								onClick={() => removeTag(tag)}
							>
								×
							</button>
						</span>
					))}
				</div>
			</div>
			<InputField
				label="概要"
				value={formData.summary || ""}
				onChange={(v) => setFormData((p) => ({ ...p, summary: v }))}
				multiline
				minRows={3}
			/>
		</div>
	);

	const Thumbnail = (
		<div style={s.col2}>
			<div>
				<InputField
					label="画像URL"
					value={formData.thumbnails?.image?.src || ""}
					onChange={(v) =>
						setFormData((p) => ({
							...p,
							thumbnails: {
								...(p.thumbnails || {}),
								image: { ...(p.thumbnails?.image || {}), src: v },
							},
						}))
					}
				/>
				{formData.thumbnails?.image?.src && (
					<div style={{ marginTop: 8 }}>
						<img
							src={formData.thumbnails.image.src}
							alt="thumbnail"
							style={{ maxWidth: "100%", maxHeight: 200 }}
						/>
					</div>
				)}
				<button
					type="button"
					style={{ ...s.btn, marginTop: 6 }}
					onClick={() => imageInputRef.current?.click()}
				>
					ファイルから埋め込み
				</button>
				<input
					ref={imageInputRef}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={handleImageFileChange}
				/>
			</div>
			<div style={s.divider} />
			<div>
				<InputField
					label="YouTube URL"
					value={(formData.ext as any)?.thumbnail?.youtube || ""}
					onChange={(v) => {
						setFormData((p) => {
							const ext = (p.ext as any) || {};
							const thumbnail = ext.thumbnail || {};
							return {
								...p,
								ext: { ...ext, thumbnail: { ...thumbnail, youtube: v } } as any,
							};
						});
					}}
				/>
				{(() => {
					const ytUrl = (formData.ext as any)?.thumbnail?.youtube;
					const embedUrl = ytUrl ? toYouTubeEmbed(ytUrl) : null;
					return embedUrl ? (
						<div
							style={{
								marginTop: 8,
								position: "relative",
								paddingBottom: "56.25%",
								height: 0,
								overflow: "hidden",
							}}
						>
							<iframe
								src={embedUrl}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									border: 0,
								}}
								allowFullScreen
							/>
						</div>
					) : null;
				})()}
			</div>
			<div style={s.divider} />
			<div>
				<InputField
					label="GIF URL"
					value={formData.thumbnails?.gif?.src || ""}
					onChange={(v) =>
						setFormData((p) => ({
							...p,
							thumbnails: {
								...(p.thumbnails || {}),
								gif: { ...(p.thumbnails?.gif || {}), src: v },
							},
						}))
					}
				/>
				<button
					type="button"
					style={{ ...s.btn, marginTop: 6 }}
					onClick={() => gifInputRef.current?.click()}
				>
					ファイルから埋め込み
				</button>
				<input
					ref={gifInputRef}
					type="file"
					accept="image/gif"
					style={{ display: "none" }}
					onChange={handleGifFileChange}
				/>
			</div>
			<div style={s.divider} />
			<div>
				<InputField
					label="WEBM URL"
					value={formData.thumbnails?.webm?.src || ""}
					onChange={(v) =>
						setFormData((p) => ({
							...p,
							thumbnails: {
								...(p.thumbnails || {}),
								webm: {
									...(p.thumbnails?.webm || ({ src: "" } as any)),
									src: v,
								},
							},
						}))
					}
				/>
				<InputField
					label="WEBM ポスターURL"
					value={formData.thumbnails?.webm?.poster || ""}
					onChange={(v) =>
						setFormData((p) => ({
							...p,
							thumbnails: {
								...(p.thumbnails || {}),
								webm: {
									...(p.thumbnails?.webm || ({ src: "" } as any)),
									poster: v,
								},
							},
						}))
					}
				/>
				<button
					type="button"
					style={{ ...s.btn, marginTop: 6 }}
					onClick={() => webmInputRef.current?.click()}
				>
					ファイルから埋め込み
				</button>
				<input
					ref={webmInputRef}
					type="file"
					accept="video/webm"
					style={{ display: "none" }}
					onChange={handleWebmFileChange}
				/>
				{formData.thumbnails?.webm?.src && (
					<div style={{ marginTop: 8 }}>
						<video
							src={formData.thumbnails.webm.src}
							poster={formData.thumbnails.webm.poster}
							controls
							style={{ maxWidth: "100%", maxHeight: 200 }}
						/>
					</div>
				)}
			</div>
		</div>
	);

	const LinksMedia = (
		<div style={s.col2}>
			<div>
				<div style={s.sectionTitle}>リンク</div>
				{(formData.links || []).map((link, i) => (
					<div
						key={`${link.href}-${link.label ?? ""}`}
						style={{
							display: "flex",
							gap: 8,
							alignItems: "center",
							marginBottom: 6,
						}}
					>
						<input
							style={{ ...s.input, flex: 1 }}
							value={link.label || ""}
							placeholder="ラベル"
							onChange={(e) => {
								const links = [...(formData.links || [])];
								links[i] = { ...links[i], label: e.target.value };
								setFormData((p) => ({ ...p, links }));
							}}
						/>
						<input
							style={{ ...s.input, flex: 2 }}
							value={link.href || ""}
							placeholder="URL"
							onChange={(e) => {
								const links = [...(formData.links || [])];
								links[i] = { ...links[i], href: e.target.value };
								setFormData((p) => ({ ...p, links }));
							}}
						/>
						<button
							type="button"
							style={s.btnDanger}
							onClick={() => {
								setFormData((p) => ({
									...p,
									links: (p.links || []).filter((_, j) => j !== i),
								}));
							}}
						>
							<Trash2 size={16} />
						</button>
					</div>
				))}
				<button
					type="button"
					style={s.btn}
					onClick={() =>
						setFormData((p) => ({
							...p,
							links: [...(p.links || []), { label: "", href: "" }],
						}))
					}
				>
					リンクを追加
				</button>
			</div>
			<div style={s.divider} />
			<div>
				<div style={s.sectionTitle}>メディア</div>
				{(() => {
					const mediaItems: { src: string; type?: string }[] = [];
					const seen = new Set<string>();
					const addItem = (src?: string, type?: string) => {
						if (src && !seen.has(src)) {
							seen.add(src);
							mediaItems.push({ src, type });
						}
					};
					if (Array.isArray(formData.assets)) {
						for (const a of formData.assets as any[]) addItem(a?.src, a?.type);
					}
					addItem(formData.thumbnails?.image?.src);
					addItem(formData.thumbnails?.gif?.src);
					addItem(formData.thumbnails?.webm?.src);
					addItem(formData.thumbnails?.webm?.poster);
					return mediaItems.map((m) => (
						<div
							key={m.src}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
								marginBottom: 6,
								padding: "4px 8px",
							}}
						>
							{m.src && m.src.match(/\.(png|jpe?g|gif|webp|svg)/i) ? (
								<img
									src={m.src}
									alt=""
									style={{ width: 40, height: 40, objectFit: "cover" }}
								/>
							) : m.src && m.src.match(/\.(mp4|webm|ogv)/i) ? (
								<video src={m.src} style={{ width: 40, height: 40 }} muted />
							) : null}
							<span
								style={{
									flex: 1,
									fontSize: 11,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{m.src}
							</span>
						</div>
					));
				})()}
			</div>
		</div>
	);

	const SearchSeo = (
		<div style={s.col2}>
			<InputField
				label="全文検索テキスト"
				value={formData.searchable?.fullText || ""}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						searchable: { ...(p.searchable || {}), fullText: v },
					}))
				}
				multiline
				minRows={3}
			/>
			<InputField
				label="トークン（カンマ区切り）"
				value={(formData.searchable?.tokens || []).join(", ")}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						searchable: {
							...(p.searchable || {}),
							tokens: v
								.split(",")
								.map((t) => t.trim())
								.filter(Boolean),
						},
					}))
				}
			/>
			<div style={s.divider} />
			<InputField
				label="Meta タイトル"
				value={formData.seo?.meta?.title || ""}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						seo: {
							...(p.seo || {}),
							meta: { ...(p.seo?.meta || {}), title: v },
						},
					}))
				}
			/>
			<InputField
				label="Meta 説明"
				value={formData.seo?.meta?.description || ""}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						seo: {
							...(p.seo || {}),
							meta: { ...(p.seo?.meta || {}), description: v },
						},
					}))
				}
				multiline
				minRows={2}
			/>
			<InputField
				label="OG タイトル"
				value={formData.seo?.openGraph?.title || ""}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						seo: {
							...(p.seo || {}),
							openGraph: { ...(p.seo?.openGraph || {}), title: v },
						},
					}))
				}
			/>
			<InputField
				label="OG 説明"
				value={formData.seo?.openGraph?.description || ""}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						seo: {
							...(p.seo || {}),
							openGraph: { ...(p.seo?.openGraph || {}), description: v },
						},
					}))
				}
				multiline
				minRows={2}
			/>
			<InputField
				label="OG 画像URL"
				value={formData.seo?.openGraph?.image || ""}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						seo: {
							...(p.seo || {}),
							openGraph: { ...(p.seo?.openGraph || {}), image: v },
						},
					}))
				}
			/>
			<div>
				<button type="button" style={s.btn} onClick={applyGeneratedOgImageUrl}>
					生成OG画像を適用
				</button>
			</div>
			{formData.seo?.openGraph?.image && (
				<div style={{ marginTop: 8 }}>
					<img
						src={formData.seo.openGraph.image}
						alt="OG"
						style={{ maxWidth: "100%", maxHeight: 200 }}
					/>
				</div>
			)}
			<div style={s.divider} />
			<InputField
				label="Canonical"
				value={formData.seo?.meta?.canonical || ""}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						seo: {
							...(p.seo || {}),
							meta: { ...(p.seo?.meta || {}), canonical: v },
						},
					}))
				}
			/>
			<InputField
				label="Robots"
				value={formData.seo?.meta?.robots || "index,follow"}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						seo: {
							...(p.seo || {}),
							meta: { ...(p.seo?.meta || {}), robots: v },
						},
					}))
				}
			/>
			<InputField
				label="Keywords"
				value={((formData.seo as any)?.keywords || []).join(", ")}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						seo: {
							...(p.seo || {}),
							keywords: v
								.split(",")
								.map((t) => t.trim())
								.filter(Boolean),
						} as any,
					}))
				}
			/>
			<div style={{ marginTop: 8 }}>
				<div style={s.label}>OG画像プレビュー</div>
				<img
					src={generatedOgImageUrl}
					alt="generated OG"
					style={{ maxWidth: "100%", maxHeight: 200 }}
				/>
			</div>
		</div>
	);

	const PermissionsI18nExt = (
		<div style={s.col2}>
			<InputField
				label="オーナー"
				value={formData.permissions?.owner || ""}
				onChange={() => {}}
				disabled
			/>
			<InputField
				label="閲覧者"
				value={(formData.permissions?.readers || []).join(", ")}
				onChange={() => {}}
				disabled
			/>
			<InputField
				label="編集者"
				value={(formData.permissions?.editors || []).join(", ")}
				onChange={() => {}}
				disabled
			/>
			<div style={s.divider} />
			<InputField
				label="デフォルト言語"
				value={formData.i18n?.defaultLang || formData.lang || "ja"}
				onChange={() => {}}
				disabled
			/>
			<InputField
				label="翻訳"
				value={Object.entries(formData.i18n?.translations || {})
					.map(([k, v]) => `${k}:${v}`)
					.join("\n")}
				onChange={() => {}}
				disabled
				multiline
				minRows={2}
			/>
			<div style={s.divider} />
			<InputField
				label="Twitter @site"
				value={(formData.ext as any)?.twitter?.site || ""}
				onChange={(v) =>
					setFormData((p) => ({
						...p,
						ext: {
							...((p.ext as any) || {}),
							twitter: { ...((p.ext as any)?.twitter || {}), site: v },
						} as any,
					}))
				}
			/>
		</div>
	);

	const Relations = (
		<div style={s.col2}>
			{(formData.relations || []).map((rel, i) => (
				<div
					key={`${rel.targetId}-${rel.type}`}
					style={{
						display: "flex",
						gap: 8,
						alignItems: "center",
						marginBottom: 6,
					}}
				>
					<input
						style={{ ...s.input, flex: 2 }}
						value={rel.targetId || ""}
						placeholder="ターゲットID"
						onChange={(e) => {
							const rels = [...(formData.relations || [])];
							rels[i] = { ...rels[i], targetId: e.target.value };
							setFormData((p) => ({ ...p, relations: rels }));
						}}
					/>
					<input
						style={{ ...s.input, flex: 1 }}
						value={rel.type || ""}
						placeholder="種類"
						onChange={(e) => {
							const rels = [...(formData.relations || [])];
							rels[i] = { ...rels[i], type: e.target.value };
							setFormData((p) => ({ ...p, relations: rels }));
						}}
					/>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: 4,
							fontSize: 12,
							width: 140,
						}}
					>
						<input
							type="checkbox"
							checked={rel.bidirectional || false}
							onChange={(e) => {
								const rels = [...(formData.relations || [])];
								rels[i] = { ...rels[i], bidirectional: e.target.checked };
								setFormData((p) => ({ ...p, relations: rels }));
							}}
						/>
						双方向
					</label>
					<button
						type="button"
						style={s.btnDanger}
						onClick={() =>
							setFormData((p) => ({
								...p,
								relations: (p.relations || []).filter((_, j) => j !== i),
							}))
						}
					>
						<Trash2 size={16} />
					</button>
				</div>
			))}
			<button
				type="button"
				style={s.btn}
				onClick={() =>
					setFormData((p) => ({
						...p,
						relations: [
							...(p.relations || []),
							{ targetId: "", type: "related", bidirectional: false },
						],
					}))
				}
			>
				リレーションを追加
			</button>
		</div>
	);

	const Structure = (
		<div style={s.col2}>
			<InputField
				label="親ID"
				value={formData.parentId || ""}
				onChange={(v) => setFormData((p) => ({ ...p, parentId: v }))}
			/>
			<InputField
				label="パス"
				value={formData.path || ""}
				onChange={(v) => setFormData((p) => ({ ...p, path: v }))}
			/>
			<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
				<div style={{ flex: 1, minWidth: 120 }}>
					<InputField
						label="深度"
						value={String(formData.depth || 0)}
						onChange={(v) =>
							setFormData((p) => ({ ...p, depth: Number(v) || 0 }))
						}
						type="number"
					/>
				</div>
				<div style={{ flex: 1, minWidth: 120 }}>
					<InputField
						label="順序"
						value={String(formData.order || 0)}
						onChange={(v) =>
							setFormData((p) => ({ ...p, order: Number(v) || 0 }))
						}
						type="number"
					/>
				</div>
				<div style={{ flex: 1, minWidth: 120 }}>
					<InputField
						label="子要素数"
						value={String((formData as any).childCount || 0)}
						onChange={() => {}}
						type="number"
						disabled
					/>
				</div>
			</div>
		</div>
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
		<form
			onSubmit={handleSubmit}
			style={{ display: "flex", flexDirection: "column", gap: 16 }}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "minmax(0,1fr)",
					gap: 24,
					minHeight: 0,
				}}
			>
				{/* Mobile tab bar */}
				<div
					style={{
						display: "flex",
						gap: 4,
						overflowX: "auto",
						paddingBottom: 4,
					}}
					className="md-hidden-tabs"
				>
					{sections.map((label, i) => (
						<button
							key={label}
							type="button"
							onClick={() => setSectionIndex(i)}
							style={{
								padding: "4px 10px",
								fontSize: 12,
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}
						>
							{label}
						</button>
					))}
				</div>
				<div style={{ display: "flex", gap: 24 }}>
					{/* Desktop sidebar */}
					<nav
						style={{
							display: "none",
							flexDirection: "column",
							gap: 2,
							width: 180,
							paddingRight: 12,
							minHeight: 400,
						}}
						className="md-visible-nav"
					>
						{sections.map((label, i) => (
							<button
								key={label}
								type="button"
								onClick={() => setSectionIndex(i)}
								style={{
									textAlign: "left",
									justifyContent: "flex-start",
									padding: "6px 10px",
									fontSize: 13,
									cursor: "pointer",
									fontWeight: sectionIndex === i ? 600 : 400,
								}}
							>
								{label}
							</button>
						))}
					</nav>
					{/* Content */}
					<div
						style={{
							flex: 1,
							maxHeight: 500,
							overflowY: "auto",
							paddingRight: 4,
							minWidth: 0,
							scrollbarWidth: "thin",
						}}
					>
						{feedback && (
							<div
								style={{
									padding: "8px 12px",
									marginBottom: 12,
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									fontSize: 13,
								}}
							>
								{feedback.message}
								<button
									type="button"
									style={s.btnDanger}
									onClick={() => setFeedback(null)}
								>
									×
								</button>
							</div>
						)}
						{renderSection()}
					</div>
				</div>
			</div>
			{/* Footer */}
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: 8,
					paddingTop: 8,
				}}
			>
				<button
					type="button"
					style={s.btn}
					onClick={onCancel}
					disabled={isLoading}
				>
					キャンセル
				</button>
				<button
					type="submit"
					style={isDirty ? s.btnPrimary : s.btn}
					disabled={isLoading || !isDirty}
				>
					{mode === "create" ? "作成" : "更新"}
				</button>
			</div>
			<style>{`
				@media (max-width: 768px) {
					.md-hidden-tabs { display: flex !important; }
					.md-visible-nav { display: none !important; }
				}
				@media (min-width: 769px) {
					.md-hidden-tabs { display: none !important; }
					.md-visible-nav { display: flex !important; }
				}
			`}</style>
		</form>
	);
}
