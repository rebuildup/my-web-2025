import { type FormEvent, useCallback, useMemo, useState } from "react";
import type { Content } from "@/cms/types/content";
import type {
	ContentFormFeedback,
	ContentFormProps,
} from "./ContentForm.types";
import {
	buildGeneratedOgImageUrl,
	createContentFormData,
	isContentFormDirty,
	parseJsonSafely,
} from "./ContentForm.utils";
import { useContentFormEffects } from "./useContentFormEffects";
import { useContentFormMedia } from "./useContentFormMedia";

interface UseContentFormOptions {
	initialData: Partial<Content>;
	onSubmit: ContentFormProps["onSubmit"];
	mode: ContentFormProps["mode"];
	controlledStatus?: Content["status"];
	controlledVisibility?: Content["visibility"];
}

export function useContentForm({
	initialData,
	onSubmit,
	mode,
	controlledStatus,
	controlledVisibility,
}: UseContentFormOptions) {
	const [formData, setFormData] = useState<Partial<Content>>(() =>
		createContentFormData(initialData),
	);
	const generatedOgImageUrl = useMemo(
		() => buildGeneratedOgImageUrl(formData),
		[
			formData.id,
			formData.seo?.openGraph?.description,
			formData.seo?.openGraph?.title,
			formData.summary,
			formData.tags,
			formData.thumbnails?.image?.src,
			formData.thumbnails?.webm?.poster,
			formData.title,
		],
	);
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

	const [newTag, setNewTag] = useState("");
	const [_jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState<ContentFormFeedback>(null);
	const [tagOptions, setTagOptions] = useState<string[]>([]);
	const [initialDataState, setInitialDataState] =
		useState<Partial<Content>>(initialData);
	const [sectionIndex, setSectionIndex] = useState(0);
	const media = useContentFormMedia(formData, setFormData);

	useContentFormEffects({
		mode,
		formData,
		setFormData,
		initialData,
		setInitialDataState,
		controlledStatus,
		controlledVisibility,
		setTagOptions,
	});

	const isDirty = useMemo(
		() => isContentFormDirty(initialDataState, formData),
		[formData, initialDataState],
	);

	const handleSubmit = (event: FormEvent) => {
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

	return {
		_jsonErrors,
		_handleJsonChange,
		addTag,
		applyGeneratedOgImageUrl,
		feedback,
		formData,
		generatedOgImageUrl,
		handleSubmit,
		isDirty,
		media,
		newTag,
		removeTag,
		sectionIndex,
		setFeedback,
		setFormData,
		setNewTag,
		setSectionIndex,
		tagOptions,
	};
}
