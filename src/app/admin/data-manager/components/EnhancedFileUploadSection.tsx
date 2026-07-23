"use client";

import Image from "next/image";
import { EnhancedFileUploadOptions, FileUploadResult } from "@/types";
import { useCallback, useRef, useState } from "react";

interface EnhancedFileUploadSectionProps {
	images: string[];
	originalImages?: string[];
	thumbnail?: string;
	onImagesChange: (images: string[]) => void;
	onOriginalImagesChange?: (images: string[]) => void;
	onThumbnailChange: (thumbnail: string | undefined) => void;
	uploadOptions?: EnhancedFileUploadOptions;
	onUploadOptionsChange?: (options: EnhancedFileUploadOptions) => void;
}

interface UploadProgress {
	filename: string;
	progress: number;
	status: "uploading" | "processing" | "complete" | "error";
	error?: string;
	result?: FileUploadResult;
}

const inputStyle =
	"w-full  px-3 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base ";
const labelStyle =
	"block noto-sans-jp-regular text-sm font-medium mb-1";
const buttonStyle =
	" px-3 py-1 text-xs hover: hover: transition-colors";

function EnhancedFileUploadHeader() {
	return (
		<h3 className="font-medium ">Enhanced File Upload</h3>
	);
}

interface UploadOptionsFormProps {
	options: EnhancedFileUploadOptions;
	onOptionsChange: (options: Partial<EnhancedFileUploadOptions>) => void;
}

function UploadOptionsForm({ options, onOptionsChange }: UploadOptionsFormProps) {
	return (
		<div className="  p-4 rounded-lg">
			<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
				Upload Options
			</h4>

			{/* Basic Options */}
			<div className="grid grid-cols-2 gap-4 mb-4">
				<label className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={options.skipProcessing}
						onChange={(e) =>
							onOptionsChange({ skipProcessing: e.target.checked })
						}
						className=""
					/>
					<span className="text-sm ">Skip Processing</span>
				</label>

				<label className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={options.preserveOriginal}
						onChange={(e) =>
							onOptionsChange({ preserveOriginal: e.target.checked })
						}
						className=""
					/>
					<span className="text-sm ">Preserve Original</span>
				</label>

				<label className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={options.generateVariants}
						onChange={(e) =>
							onOptionsChange({ generateVariants: e.target.checked })
						}
						className=""
					/>
					<span className="text-sm ">Generate Variants</span>
				</label>
			</div>

			{/* Custom Processing Options */}
			{!options.skipProcessing && (
				<div className=" pt-4">
					<h5 className="noto-sans-jp-regular text-sm font-medium mb-2">
						Custom Processing
					</h5>

					<div className="grid grid-cols-2 gap-4">
						{/* Format Selection */}
						<div>
							<label htmlFor="output-format" className={labelStyle}>
								Output Format
							</label>
							<select
								id="output-format"
								value={options.customProcessing?.format || "jpeg"}
								onChange={(e) =>
									onOptionsChange({
										customProcessing: {
											...options.customProcessing,
											format: e.target.value as "jpeg" | "png" | "webp",
										},
									})
								}
								className={inputStyle}
							>
								<option value="jpeg">JPEG</option>
								<option value="png">PNG</option>
								<option value="webp">WebP</option>
							</select>
						</div>

						{/* Watermark Option */}
						<label
							htmlFor="add-watermark"
							className="flex items-center space-x-2 pt-6"
						>
							<input
								id="add-watermark"
								type="checkbox"
								checked={options.customProcessing?.watermark || false}
								onChange={(e) =>
									onOptionsChange({
										customProcessing: {
											...options.customProcessing,
											watermark: e.target.checked,
										},
									})
								}
								className=""
							/>
							<span className="text-sm ">Add Watermark</span>
						</label>

						{/* Resize Options */}
						<div>
							<label htmlFor="max-width" className={labelStyle}>
								Max Width
							</label>
							<input
								id="max-width"
								type="number"
								value={options.customProcessing?.resize?.width || 1920}
								onChange={(e) =>
									onOptionsChange({
										customProcessing: {
											...options.customProcessing,
											resize: {
												...options.customProcessing?.resize,
												width: parseInt(e.target.value) || 1920,
												height:
													options.customProcessing?.resize?.height || 1080,
											},
										},
									})
								}
								className={inputStyle}
								min="100"
								max="4000"
							/>
						</div>

						<div>
							<label htmlFor="max-height" className={labelStyle}>
								Max Height
							</label>
							<input
								id="max-height"
								type="number"
								value={options.customProcessing?.resize?.height || 1080}
								onChange={(e) =>
									onOptionsChange({
										customProcessing: {
											...options.customProcessing,
											resize: {
												width:
													options.customProcessing?.resize?.width || 1920,
												height: parseInt(e.target.value) || 1080,
											},
										},
									})
								}
								className={inputStyle}
								min="100"
								max="4000"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

interface UploadProgressListProps {
	progress: UploadProgress[];
}

function UploadProgressList({ progress }: UploadProgressListProps) {
	if (progress.length === 0) return null;

	return (
		<div className=" p-4 rounded-lg">
			<h4 className="text-sm font-medium  mb-3">
				Upload Progress
			</h4>
			<div className="space-y-2">
				{progress.map((item) => (
					<div key={item.filename} className="space-y-1">
						<div className="flex justify-between items-center">
							<span className="text-sm  truncate flex-1">
								{item.filename}
							</span>
							<span className="text-xs  ml-2">
								{item.status === "complete"
									? "Complete"
									: item.status === "error"
										? "Error"
										: item.status === "processing"
											? "Processing"
											: `${item.progress}%`}
							</span>
						</div>
						<div className="w-full  rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${
									item.status === "complete"
										? ""
										: item.status === "error"
											? ""
											: item.status === "processing"
												? ""
												: ""
								}`}
								style={{ width: `${item.progress}%` }}
							/>
						</div>
						{item.error && (
							<p className="text-xs ">{item.error}</p>
						)}
						{item.result && item.status === "complete" && (
							<div className="text-xs ">
								{item.result.isDuplicate && "Duplicate detected - "}
								{item.result.originalUrl && "Original saved"}
								{item.result.processedUrl && " • Processed saved"}
								{item.result.variants &&
									` • ${Object.keys(item.result.variants).length} variants`}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

interface FileUploadAreaProps {
	isUploading: boolean;
	skipProcessing: boolean;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	onFileInputChange: (files: FileList) => void;
	onDrop: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
}

function FileUploadArea({
	isUploading,
	skipProcessing,
	fileInputRef,
	onFileInputChange,
	onDrop,
	onDragOver,
}: FileUploadAreaProps) {
	return (
		<div
			onDrop={onDrop}
			onDragOver={onDragOver}
			className="   rounded-lg p-6 text-center  transition-colors"
		>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/*"
				onChange={(e) =>
					e.target.files && onFileInputChange(e.target.files)
				}
				className="hidden"
			/>

			{isUploading ? (
				<div className="space-y-2">
					<div className="animate-spin rounded-full h-8 w-8  mx-auto"></div>
					<p className="text-sm ">Uploading...</p>
				</div>
			) : (
				<div className="space-y-2">
					<div className="">
						<svg
							className="mx-auto h-12 w-12"
							stroke="currentColor"
							fill="none"
							viewBox="0 0 48 48"
						>
							<path
								d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<div>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="font-medium"
						>
							Click to upload
						</button>
						<span className=""> or drag and drop</span>
					</div>
					<p className="text-xs ">
						{skipProcessing
							? "Files will be uploaded without processing"
							: "Images will be processed according to your settings"}
					</p>
				</div>
			)}
		</div>
	);
}

interface ThumbnailSelectorProps {
	images: string[];
	originalImages: string[];
	thumbnail?: string;
	onThumbnailChange: (thumbnail: string | undefined) => void;
}

function ThumbnailSelector({
	images,
	originalImages,
	thumbnail,
	onThumbnailChange,
}: ThumbnailSelectorProps) {
	if (images.length === 0) return null;

	return (
		<div>
			<label htmlFor="thumbnail-select" className={labelStyle}>
				Thumbnail
			</label>
			<select
				id="thumbnail-select"
				value={thumbnail || ""}
				onChange={(e) => onThumbnailChange(e.target.value || undefined)}
				className={`${inputStyle} `}
			>
				<option value="" className=" ">
					Select thumbnail...
				</option>
				{images.map((image, index) => (
					<option
						key={image}
						value={image}
						className=" "
					>
						Processed Image {index + 1}
					</option>
				))}
				{originalImages.map((image, index) => (
					<option
						key={`original-${image}`}
						value={image}
						className=" "
					>
						Original Image {index + 1}
					</option>
				))}
			</select>
		</div>
	);
}

const FALLBACK_IMAGE_DATA_URL =
	"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTk5OTkiPkVycm9yPC90ZXh0Pjwvc3ZnPg==";

interface ImageCardProps {
	image: string;
	index: number;
	alt: string;
	thumbnail?: string;
	onSetThumbnail: (imageUrl: string) => void;
	onRemove: (index: number) => void;
	removeTitle: string;
	indicatorText: string;
}

function ImageCard({
	image,
	index,
	alt,
	thumbnail,
	onSetThumbnail,
	onRemove,
	removeTitle,
	indicatorText,
}: ImageCardProps) {
	return (
		<div className="relative group">
			<div className="aspect-square    rounded overflow-hidden">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<Image
					src={image} width={200} height={200} unoptimized
					alt={alt}
					className="w-full h-full object-cover"
					onError={(e) => {
						(e.target as HTMLImageElement).src = FALLBACK_IMAGE_DATA_URL;
					}}
				/>
			</div>

			{/* Image Controls */}
			<div className="absolute inset-0  bg-opacity-50   transition-opacity flex items-center justify-center space-x-2">
				<button
					type="button"
					onClick={() => onSetThumbnail(image)}
					className="px-2 py-1 text-xs"
					title="Set as thumbnail"
				>
					Thumb
				</button>
				<button
					type="button"
					onClick={() => onRemove(index)}
					className="px-2 py-1 text-xs"
					title={removeTitle}
				>
					Remove
				</button>
			</div>

			{/* Thumbnail Indicator */}
			{thumbnail === image && (
				<div className="absolute top-1 left-1  px-2 py-1 text-xs rounded">
					Thumbnail
				</div>
			)}

			{/* Processed / Original Indicator */}
			<div className="absolute top-1 right-1   px-2 py-1 text-xs rounded">
				{indicatorText}
			</div>
		</div>
	);
}

interface ProcessedImagesGalleryProps {
	images: string[];
	thumbnail?: string;
	onSetThumbnail: (imageUrl: string) => void;
	onRemove: (index: number) => void;
}

function ProcessedImagesGallery({
	images,
	thumbnail,
	onSetThumbnail,
	onRemove,
}: ProcessedImagesGalleryProps) {
	if (images.length === 0) return null;

	return (
		<div>
			<h4 className="text-sm font-medium  mb-2">
				Processed Images ({images.length})
			</h4>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{images.map((image, index) => (
					<ImageCard
						key={image}
						image={image}
						index={index}
						alt={`Processed ${index + 1}`}
						thumbnail={thumbnail}
						onSetThumbnail={onSetThumbnail}
						onRemove={onRemove}
						removeTitle="Remove image"
						indicatorText="Processed"
					/>
				))}
			</div>
		</div>
	);
}

interface OriginalImagesGalleryProps {
	originalImages: string[];
	preserveOriginal: boolean;
	thumbnail?: string;
	onSetThumbnail: (imageUrl: string) => void;
	onRemoveOriginal: (index: number) => void;
}

function OriginalImagesGallery({
	originalImages,
	preserveOriginal,
	thumbnail,
	onSetThumbnail,
	onRemoveOriginal,
}: OriginalImagesGalleryProps) {
	if (originalImages.length === 0 || !preserveOriginal) return null;

	return (
		<div>
			<h4 className="text-sm font-medium  mb-2">
				Original Images ({originalImages.length})
			</h4>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{originalImages.map((image, index) => (
					<ImageCard
						key={`${image}-original`}
						image={image}
						index={index}
						alt={`Original ${index + 1}`}
						thumbnail={thumbnail}
						onSetThumbnail={onSetThumbnail}
						onRemove={onRemoveOriginal}
						removeTitle="Remove image"
						indicatorText="Original"
					/>
				))}
			</div>
		</div>
	);
}

interface ManualUrlInputProps {
	onAdd: (url: string) => void;
}

function ManualUrlInput({ onAdd }: ManualUrlInputProps) {
	const handleAdd = (value: string) => {
		const trimmed = value.trim();
		if (trimmed) {
			onAdd(trimmed);
		}
	};

	return (
		<div>
			<label htmlFor="manual-url" className={labelStyle}>
				Add Image URL
			</label>
			<div className="flex gap-2">
				<input
					id="manual-url"
					type="url"
					placeholder="https://example.com/image.jpg"
					className={`${inputStyle} flex-1`}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							const input = e.target as HTMLInputElement;
							handleAdd(input.value);
							input.value = "";
						}
					}}
				/>
				<button
					type="button"
					onClick={(e) => {
						const input = (e.target as HTMLButtonElement)
							.previousElementSibling as HTMLInputElement;
						handleAdd(input.value);
						input.value = "";
					}}
					className={buttonStyle}
				>
					Add
				</button>
			</div>
		</div>
	);
}

export function EnhancedFileUploadSection({
	images,
	originalImages = [],
	thumbnail,
	onImagesChange,
	onOriginalImagesChange,
	onThumbnailChange,
	uploadOptions = {},
	onUploadOptionsChange,
}: EnhancedFileUploadSectionProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	const [options, setOptions] = useState<EnhancedFileUploadOptions>({
		skipProcessing: false,
		preserveOriginal: true,
		generateVariants: false,
		customProcessing: {
			resize: { width: 1920, height: 1080 },
			format: "jpeg",
			watermark: false,
		},
		...uploadOptions,
	});

	const fileInputRef = useRef<HTMLInputElement>(null);

	const updateProgress = useCallback(
		(filename: string, updates: Partial<UploadProgress>) => {
			setUploadProgress((prev) =>
				prev.map((p) => (p.filename === filename ? { ...p, ...updates } : p)),
			);
		},
		[],
	);

	const handleOptionsChange = (
		newOptions: Partial<EnhancedFileUploadOptions>,
	) => {
		const updatedOptions = { ...options, ...newOptions };
		setOptions(updatedOptions);
		onUploadOptionsChange?.(updatedOptions);
	};

	const handleFileUpload = async (files: FileList) => {
		if (!files.length) return;

		setIsUploading(true);
		const fileArray = Array.from(files);

		// Initialize progress tracking
		const initialProgress = fileArray.map((file) => ({
			filename: file.name,
			progress: 0,
			status: "uploading" as const,
		}));
		setUploadProgress(initialProgress);

		const uploadedImages: string[] = [];
		const uploadedOriginals: string[] = [];

		const cleanup = () => {
			setIsUploading(false);
			// Clear progress after a delay
			setTimeout(() => setUploadProgress([]), 3000);
		};

		for (const file of fileArray) {
			updateProgress(file.name, { progress: 10 });

			// Create form data for API upload
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "portfolio");
			formData.append("processingOptions", JSON.stringify(options));

			updateProgress(file.name, { progress: 30 });

			// Upload via API
			const response = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			}).catch((networkError: unknown) => {
				console.error("Upload network error:", networkError);
				return null;
			});

			if (!response) {
				updateProgress(file.name, {
					status: "error",
					error: "Upload failed",
				});
				continue;
			}

			updateProgress(file.name, { progress: 70 });

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage =
					(errorData as { error?: string }).error || "Upload failed";
				updateProgress(file.name, {
					status: "error",
					error: errorMessage,
				});
				continue;
			}

			const result = await response.json().catch(() => null);
			if (!result) {
				updateProgress(file.name, {
					status: "error",
					error: "Failed to parse response",
				});
				continue;
			}

			updateProgress(file.name, {
				progress: 90,
				status: "processing",
				result: result.files?.[0],
			});

			// Handle different result types
			const fileResult = result.files?.[0];
			if (!fileResult) {
				updateProgress(file.name, {
					status: "error",
					error: "No file result returned",
				});
				continue;
			}

			// Add URLs to appropriate arrays
			if (options.skipProcessing && fileResult.originalUrl) {
				uploadedOriginals.push(fileResult.originalUrl);
			} else {
				if (fileResult.processedUrl) {
					uploadedImages.push(fileResult.processedUrl);
				} else if (fileResult.url) {
					uploadedImages.push(fileResult.url);
				}

				if (fileResult.originalUrl && options.preserveOriginal) {
					uploadedOriginals.push(fileResult.originalUrl);
				}
			}

			updateProgress(file.name, {
				progress: 100,
				status: "complete",
			});
		}

		// Update state with uploaded files
		if (uploadedImages.length > 0) {
			const newImages = [...images, ...uploadedImages];
			onImagesChange(newImages);

			// Set first uploaded image as thumbnail if no thumbnail exists
			if (!thumbnail && uploadedImages.length > 0) {
				console.log(
					"Setting first uploaded image as thumbnail:",
					uploadedImages[0],
				);
				onThumbnailChange(uploadedImages[0]);
			}
		}

		if (uploadedOriginals.length > 0 && onOriginalImagesChange) {
			const newOriginals = [...originalImages, ...uploadedOriginals];
			onOriginalImagesChange(newOriginals);
		}

		cleanup();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileUpload(files);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const removeImage = (index: number, isOriginal = false) => {
		if (isOriginal && onOriginalImagesChange) {
			const newOriginals = originalImages.filter((_, i) => i !== index);
			onOriginalImagesChange(newOriginals);
		} else {
			const newImages = images.filter((_, i) => i !== index);
			onImagesChange(newImages);

			// If removed image was thumbnail, clear thumbnail
			if (thumbnail === images[index]) {
				onThumbnailChange(undefined);
			}
		}
	};

	const setAsThumbnail = (imageUrl: string) => {
		onThumbnailChange(imageUrl);
	};

	const handleManualUrlAdd = (url: string) => {
		onImagesChange([...images, url]);
	};

	return (
		<div className="space-y-4">
			<EnhancedFileUploadHeader />

			<UploadOptionsForm
				options={options}
				onOptionsChange={handleOptionsChange}
			/>

			<UploadProgressList progress={uploadProgress} />

			<FileUploadArea
				isUploading={isUploading}
				skipProcessing={options.skipProcessing}
				fileInputRef={fileInputRef}
				onFileInputChange={handleFileUpload}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			/>

			<ThumbnailSelector
				images={images}
				originalImages={originalImages}
				thumbnail={thumbnail}
				onThumbnailChange={onThumbnailChange}
			/>

			<ProcessedImagesGallery
				images={images}
				thumbnail={thumbnail}
				onSetThumbnail={setAsThumbnail}
				onRemove={(index) => removeImage(index)}
			/>

			<OriginalImagesGallery
				originalImages={originalImages}
				preserveOriginal={options.preserveOriginal}
				thumbnail={thumbnail}
				onSetThumbnail={setAsThumbnail}
				onRemoveOriginal={(index) => removeImage(index, true)}
			/>

			<ManualUrlInput onAdd={handleManualUrlAdd} />
		</div>
	);
}
