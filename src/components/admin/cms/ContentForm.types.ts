import type { Dispatch, SetStateAction } from "react";
import type { Content } from "@/cms/types/content";

export interface ContentFormProps {
	initialData?: Partial<Content>;
	onSubmit: (data: Partial<Content>) => void;
	onCancel: () => void;
	isLoading?: boolean;
	mode: "create" | "edit";
	controlledStatus?: Content["status"];
	controlledVisibility?: Content["visibility"];
}

export type SetContentFormData = Dispatch<SetStateAction<Partial<Content>>>;

export interface ContentFormSectionProps {
	formData: Partial<Content>;
	setFormData: SetContentFormData;
}

export type ContentFormFeedback = {
	type: "success" | "error";
	message: string;
} | null;
