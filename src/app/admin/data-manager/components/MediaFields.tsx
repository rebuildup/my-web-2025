import type { EnhancedContentItem, EnhancedFileUploadOptions } from "@/types";
import { EnhancedFileUploadSection } from "./EnhancedFileUploadSection";
import { FileUploadSection } from "./FileUploadSection";
import { MediaEmbedSection } from "./MediaEmbedSection";
import type { EnhancedInputChangeHandler, FormData, InputChangeHandler } from "./data-manager-form.types";

interface MediaFieldsProps {
	formData: FormData;
	enhanced: boolean;
	uploadOptions: EnhancedFileUploadOptions;
	setUploadOptions: (options: EnhancedFileUploadOptions) => void;
	handleInputChange: InputChangeHandler;
	handleEnhancedInputChange: EnhancedInputChangeHandler;
}

export function MediaFields({ formData, enhanced, uploadOptions, setUploadOptions, handleInputChange, handleEnhancedInputChange }: MediaFieldsProps) {
	return (
		<div className="space-y-6">
			{enhanced ? (
				<EnhancedFileUploadSection images={formData.images || []} originalImages={(formData as EnhancedContentItem).originalImages || []} thumbnail={formData.thumbnail} onImagesChange={(images) => handleInputChange("images", images)} onOriginalImagesChange={(originalImages) => handleEnhancedInputChange("originalImages", originalImages)} onThumbnailChange={(thumbnail) => handleInputChange("thumbnail", thumbnail)} uploadOptions={uploadOptions} onUploadOptionsChange={setUploadOptions} />
			) : (
				<FileUploadSection images={formData.images || []} thumbnail={formData.thumbnail} onImagesChange={(images) => handleInputChange("images", images)} onThumbnailChange={(thumbnail) => handleInputChange("thumbnail", thumbnail)} />
			)}
			<MediaEmbedSection videos={formData.videos || []} onVideosChange={(videos) => handleInputChange("videos", videos)} />
		</div>
	);
}
