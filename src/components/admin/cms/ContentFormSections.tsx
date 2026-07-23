import type {
	ChangeEventHandler,
	Dispatch,
	RefObject,
	SetStateAction,
} from "react";
import { ContentFormEssentials } from "./ContentFormEssentials";
import { ContentFormLinksMedia } from "./ContentFormLinksMedia";
import { ContentFormPermissionsI18nExt } from "./ContentFormPermissionsI18nExt";
import { ContentFormRelations } from "./ContentFormRelations";
import { ContentFormSearchSeo } from "./ContentFormSearchSeo";
import { ContentFormStructure } from "./ContentFormStructure";
import { ContentFormThumbnail } from "./ContentFormThumbnail";
import type { ContentFormSectionProps } from "./ContentForm.types";

interface ContentFormSectionsProps extends ContentFormSectionProps {
	sectionIndex: number;
	newTag: string;
	setNewTag: Dispatch<SetStateAction<string>>;
	tagOptions: string[];
	addTag: () => void;
	removeTag: (tag: string) => void;
	generatedOgImageUrl: string;
	applyGeneratedOgImageUrl: () => void;
	imageInputRef: RefObject<HTMLInputElement | null>;
	gifInputRef: RefObject<HTMLInputElement | null>;
	webmInputRef: RefObject<HTMLInputElement | null>;
	handleImageFileChange: ChangeEventHandler<HTMLInputElement>;
	handleGifFileChange: ChangeEventHandler<HTMLInputElement>;
	handleWebmFileChange: ChangeEventHandler<HTMLInputElement>;
}

export function ContentFormSections({
	sectionIndex,
	formData,
	setFormData,
	newTag,
	setNewTag,
	tagOptions,
	addTag,
	removeTag,
	generatedOgImageUrl,
	applyGeneratedOgImageUrl,
	imageInputRef,
	gifInputRef,
	webmInputRef,
	handleImageFileChange,
	handleGifFileChange,
	handleWebmFileChange,
}: ContentFormSectionsProps) {
	switch (sectionIndex) {
		case 0:
			return (
				<ContentFormEssentials
					formData={formData}
					setFormData={setFormData}
					newTag={newTag}
					setNewTag={setNewTag}
					tagOptions={tagOptions}
					addTag={addTag}
					removeTag={removeTag}
				/>
			);
		case 1:
			return (
				<ContentFormThumbnail
					formData={formData}
					setFormData={setFormData}
					imageInputRef={imageInputRef}
					gifInputRef={gifInputRef}
					webmInputRef={webmInputRef}
					handleImageFileChange={handleImageFileChange}
					handleGifFileChange={handleGifFileChange}
					handleWebmFileChange={handleWebmFileChange}
				/>
			);
		case 2:
			return (
				<ContentFormLinksMedia formData={formData} setFormData={setFormData} />
			);
		case 3:
			return (
				<ContentFormSearchSeo
					formData={formData}
					setFormData={setFormData}
					generatedOgImageUrl={generatedOgImageUrl}
					applyGeneratedOgImageUrl={applyGeneratedOgImageUrl}
				/>
			);
		case 4:
			return (
				<ContentFormPermissionsI18nExt
					formData={formData}
					setFormData={setFormData}
				/>
			);
		case 5:
			return (
				<ContentFormRelations formData={formData} setFormData={setFormData} />
			);
		case 6:
			return (
				<ContentFormStructure formData={formData} setFormData={setFormData} />
			);
		default:
			return (
				<ContentFormEssentials
					formData={formData}
					setFormData={setFormData}
					newTag={newTag}
					setNewTag={setNewTag}
					tagOptions={tagOptions}
					addTag={addTag}
					removeTag={removeTag}
				/>
			);
	}
}
