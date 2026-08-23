import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import type { Content } from "@/cms/types/content";
import type { ContentFormProps, SetContentFormData } from "./ContentForm.types";
import { createContentFormData, findYouTubeUrl } from "./ContentForm.utils";

interface UseContentFormEffectsOptions {
	mode: ContentFormProps["mode"];
	formData: Partial<Content>;
	setFormData: SetContentFormData;
	initialData: Partial<Content>;
	setInitialDataState: Dispatch<SetStateAction<Partial<Content>>>;
	controlledStatus?: Content["status"];
	controlledVisibility?: Content["visibility"];
	setTagOptions: Dispatch<SetStateAction<string[]>>;
}

export function useContentFormEffects({
	mode,
	formData,
	setFormData,
	initialData,
	setInitialDataState,
	controlledStatus,
	controlledVisibility,
	setTagOptions,
}: UseContentFormEffectsOptions) {
	// Render-time setState pattern (canonical React 19 fix for "adjusting state
	// when a prop changes"): track the previous prop via useRef, and call
	// setState directly during render when the value differs. This eliminates
	// the P4 (value-reaction) and P3 (no-cleanup) 😡 findings without using
	// useEffect for value-mirroring.

	// Mirror controlledStatus into formData when the parent's select changes.
	const prevStatusRef = useRef<Content["status"] | undefined>(controlledStatus);
	if (
		controlledStatus !== undefined &&
		prevStatusRef.current !== controlledStatus
	) {
		prevStatusRef.current = controlledStatus;
		setFormData((prev) =>
			prev.status === controlledStatus
				? prev
				: { ...prev, status: controlledStatus },
		);
	}

	// Mirror controlledVisibility into formData when the parent's select changes.
	const prevVisibilityRef = useRef<Content["visibility"] | undefined>(
		controlledVisibility,
	);
	if (
		controlledVisibility !== undefined &&
		prevVisibilityRef.current !== controlledVisibility
	) {
		prevVisibilityRef.current = controlledVisibility;
		setFormData((prev) =>
			prev.visibility === controlledVisibility
				? prev
				: { ...prev, visibility: controlledVisibility },
		);
	}

	// Reset formData when initialData.id changes (different content selected for edit).
	// Tracking only id (instead of id/publishedAt/title/summary) avoids spurious
	// resets while the user edits the form fields.
	const prevInitialDataIdRef = useRef<string | undefined>(initialData.id);
	if (
		mode === "edit" &&
		initialData.id &&
		prevInitialDataIdRef.current !== initialData.id
	) {
		prevInitialDataIdRef.current = initialData.id;
		setFormData(createContentFormData(initialData));
		setInitialDataState(initialData);
	}

	// Auto-fill YouTube URL preview when the form's id changes.
	const prevFormIdRef = useRef<string | undefined>(formData.id);
	if (prevFormIdRef.current !== formData.id) {
		prevFormIdRef.current = formData.id;
		const extAny = formData.ext as any;
		const hasThumbYouTube = Boolean(extAny?.thumbnail?.youtube);
		if (!hasThumbYouTube) {
			const found = findYouTubeUrl(formData);
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
		}
	}

	// Fetch the full content metadata when editing and key detail fields are missing.
	// Data fetching inside useEffect is 🙃 (acceptable transitional pattern) per the
	// useeffect-extremist skill — kept because it has a matching AbortController cleanup.
	useEffect(() => {
		const controller = new AbortController();
		const targetId = formData.id;
		if (mode !== "edit" || !targetId) {
			return () => controller.abort();
		}
		const hasDetailMetadata = Boolean(
			formData.assets ||
				formData.links ||
				formData.relations ||
				formData.seo ||
				formData.searchable ||
				formData.ext,
		);
		if (hasDetailMetadata) {
			return () => controller.abort();
		}
		(async () => {
			let full: any = null;
			try {
				const res = await fetch(
					`/api/cms/contents/${encodeURIComponent(targetId)}/`,
					{ cache: "no-store", signal: controller.signal },
				);
				if (!res.ok) return;
				full = await res.json();
			} catch (err) {
				if ((err as Error).name === "AbortError") return;
				return;
			}
			if (controller.signal.aborted || !full) return;
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
			controller.abort();
		};
	}, [mode, formData.id]);

	// Fetch existing tags once on mount for the tag autocomplete suggestions.
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
				for (const content of data) {
					if (content && Array.isArray(content.tags)) {
						for (const tag of content.tags) all.push(tag);
					}
				}
			}
			setTagOptions(
				Array.from(
					new Set(all.filter((tag) => typeof tag === "string" && tag.trim())),
				).sort((a, b) => a.localeCompare(b, "ja")),
			);
		})();
		return () => controller.abort();
	}, []);
}
