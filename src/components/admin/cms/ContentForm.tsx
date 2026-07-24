"use client";

import type { ContentFormProps } from "./ContentForm.types";
import { ContentFormLayout } from "./ContentFormLayout";
import { ContentFormSections } from "./ContentFormSections";
import { useContentForm } from "./useContentForm";

export function ContentForm({
	initialData = {},
	onSubmit,
	onCancel,
	isLoading = false,
	mode,
	controlledStatus,
	controlledVisibility,
}: ContentFormProps) {
	const {
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
	} = useContentForm({
		initialData,
		onSubmit,
		mode,
		controlledStatus,
		controlledVisibility,
	});

	return (
		<ContentFormLayout
			sectionIndex={sectionIndex}
			setSectionIndex={setSectionIndex}
			feedback={feedback}
			onDismissFeedback={() => setFeedback(null)}
			onSubmit={handleSubmit}
			onCancel={onCancel}
			isLoading={isLoading}
			isDirty={isDirty}
			mode={mode}
		>
			<ContentFormSections
				sectionIndex={sectionIndex}
				formData={formData}
				setFormData={setFormData}
				newTag={newTag}
				setNewTag={setNewTag}
				tagOptions={tagOptions}
				addTag={addTag}
				removeTag={removeTag}
				generatedOgImageUrl={generatedOgImageUrl}
				applyGeneratedOgImageUrl={applyGeneratedOgImageUrl}
				imageInputRef={media.imageInputRef}
				gifInputRef={media.gifInputRef}
				webmInputRef={media.webmInputRef}
				handleImageFileChange={media.handleImageFileChange}
				handleGifFileChange={media.handleGifFileChange}
				handleWebmFileChange={media.handleWebmFileChange}
			/>
		</ContentFormLayout>
	);
}
