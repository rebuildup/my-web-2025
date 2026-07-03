"use client";

import { DownloadInfo } from "@/types/content";
import { useRef, useState } from "react";

interface DownloadInfoSectionProps {
	downloadInfo?: DownloadInfo;
	onDownloadInfoChange: (downloadInfo: DownloadInfo | undefined) => void;
}

export function DownloadInfoSection({
	downloadInfo,
	onDownloadInfoChange,
}: DownloadInfoSectionProps) {
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileUpload = async (file: File) => {
		setIsUploading(true);
		const formData = new FormData();
		formData.append("file", file);
		formData.append("type", "download");

		const response = await fetch("/api/admin/upload", {
			method: "POST",
			body: formData,
		}).catch((error: unknown) => {
			console.error("Upload error:", error);
			return null;
		});

		if (!response) {
			setIsUploading(false);
			return;
		}

		if (response.ok) {
			await response.json();
			const newDownloadInfo: DownloadInfo = {
				fileName: file.name,
				fileSize: file.size,
				fileType: file.type || "application/octet-stream",
				downloadCount: 0,
				version: "1.0.0",
			};
			onDownloadInfoChange(newDownloadInfo);
		} else {
			console.error("Upload failed");
		}
		setIsUploading(false);
	};

	const handleInputChange = (field: keyof DownloadInfo, value: unknown) => {
		if (!downloadInfo) return;

		onDownloadInfoChange({
			...downloadInfo,
			[field]: value,
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const inputStyle =
		"w-full  px-3 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";
	const labelStyle =
		"block noto-sans-jp-regular text-sm font-medium mb-1";
	const buttonStyle =
		" px-3 py-1 text-xs hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";

	return (
		<div className="space-y-4">
			<h3 className="neue-haas-grotesk-display text-xl leading-snug">
				Download Information
			</h3>

			{!downloadInfo ? (
				/* File Upload Area */
				<div className="   rounded-lg p-6 text-center">
					<input
						ref={fileInputRef}
						type="file"
						onChange={(e) =>
							e.target.files?.[0] && handleFileUpload(e.target.files[0])
						}
						className="hidden"
					/>

					{isUploading ? (
						<div className="space-y-2">
							<div className="animate-spin rounded-full h-8 w-8  mx-auto"></div>
							<p className="text-sm ">Uploading file...</p>
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
										d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-46-4v14c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252"
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
									className=" hover:/80 font-medium"
								>
									Click to upload file
								</button>
							</div>
							<p className="text-xs ">Any file type up to 100MB</p>
						</div>
					)}
				</div>
			) : (
				/* Download Info Form */
				<div className="space-y-4">
					{/* File Information */}
					<div className="   p-4 rounded">
						<h4 className="noto-sans-jp-regular text-sm font-medium mb-2">
							File Information
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
							<div>
								<span className="font-medium ">File Name:</span>
								<p className=" break-all">
									{downloadInfo.fileName}
								</p>
							</div>
							<div>
								<span className="font-medium ">File Size:</span>
								<p className="">
									{formatFileSize(downloadInfo.fileSize)}
								</p>
							</div>
							<div>
								<span className="font-medium ">File Type:</span>
								<p className="">{downloadInfo.fileType}</p>
							</div>
						</div>
					</div>

					{/* Editable Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className={labelStyle}>Version</label>
							<input
								type="text"
								value={downloadInfo.version || ""}
								onChange={(e) => handleInputChange("version", e.target.value)}
								className={inputStyle}
								placeholder="1.0.0"
							/>
						</div>

						<div>
							<label className={labelStyle}>Price (optional)</label>
							<input
								type="number"
								min="0"
								step="0.01"
								value={downloadInfo.price || ""}
								onChange={(e) =>
									handleInputChange(
										"price",
										parseFloat(e.target.value) || undefined,
									)
								}
								className={inputStyle}
								placeholder="0.00"
							/>
						</div>
					</div>

					{/* Statistics (Read-only) */}
					<div className="   p-4 rounded">
						<h4 className="noto-sans-jp-regular text-sm font-medium mb-2">
							Download Statistics
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium ">
									Download Count:
								</span>
								<p className="">{downloadInfo.downloadCount}</p>
							</div>
							{downloadInfo.lastDownloaded && (
								<div>
									<span className="font-medium ">
										Last Downloaded:
									</span>
									<p className="">
										{new Date(downloadInfo.lastDownloaded).toLocaleDateString(
											"ja-JP",
											{
												year: "numeric",
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											},
										)}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-between items-center">
						<button
							type="button"
							onClick={() => onDownloadInfoChange(undefined)}
							className={`${buttonStyle}    `}
						>
							Remove File
						</button>

						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className={buttonStyle}
						>
							Replace File
						</button>
					</div>

					{/* Hidden file input for replacement */}
					<input
						ref={fileInputRef}
						type="file"
						onChange={(e) =>
							e.target.files?.[0] && handleFileUpload(e.target.files[0])
						}
						className="hidden"
					/>
				</div>
			)}

			{/* Manual Download Info Entry */}
			{!downloadInfo && (
				<div className="  p-4 rounded">
					<h4 className="noto-sans-jp-regular text-sm font-medium mb-3">
						Or Enter Manually
					</h4>
					<div className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<input
								type="text"
								placeholder="File name"
								className={inputStyle}
								onBlur={(e) => {
									if (e.target.value.trim()) {
										const manualInfo: DownloadInfo = {
											fileName: e.target.value.trim(),
											fileSize: 0,
											fileType: "application/octet-stream",
											downloadCount: 0,
										};
										onDownloadInfoChange(manualInfo);
									}
								}}
							/>
							<input
								type="text"
								placeholder="File type (e.g., application/zip)"
								className={inputStyle}
							/>
						</div>
						<p className="text-xs ">
							Enter file information manually if you don&apos;t want to upload
							the actual file
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
