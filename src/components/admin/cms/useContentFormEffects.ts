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
	}, [formData.id]);

	useEffect(() => {
		const controller = new AbortController();
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

	useEffect(() => {
		if (mode === "edit" && initialData.id) {
			setFormData(createContentFormData(initialData));
			setInitialDataState(initialData);
		}
	}, [
		mode,
		initialData.id,
		initialData.publishedAt,
		initialData.title,
		initialData.summary,
	]);

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

	useEffect(() => {
		if (controlledStatus)
			setFormData((prev) => ({ ...prev, status: controlledStatus }));
	}, [controlledStatus]);

	useEffect(() => {
		if (controlledVisibility)
			setFormData((prev) => ({ ...prev, visibility: controlledVisibility }));
	}, [controlledVisibility]);
}
