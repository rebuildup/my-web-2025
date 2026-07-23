import { type ChangeEvent, useCallback, useRef } from "react";
import type { Content } from "@/cms/types/content";
import type { SetContentFormData } from "./ContentForm.types";

export function useContentFormMedia(
	formData: Partial<Content>,
	setFormData: SetContentFormData,
) {
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
		[uploadMediaFile, setFormData],
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
		[uploadMediaFile, setFormData],
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
		[uploadMediaFile, setFormData],
	);

	return {
		gifInputRef,
		handleGifFileChange,
		handleImageFileChange,
		handleWebmFileChange,
		imageInputRef,
		webmInputRef,
	};
}
