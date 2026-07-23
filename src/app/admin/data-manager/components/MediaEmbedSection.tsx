"use client";

import { MediaEmbed } from "@/types/content";
import { useState } from "react";

interface MediaEmbedSectionProps {
	videos: MediaEmbed[];
	onVideosChange: (videos: MediaEmbed[]) => void;
}

const inputStyle =
	"w-full  px-3 py-2 text-sm   focus: focus:ring-offset-2 focus:ring-offset-base";
const labelStyle = "block noto-sans-jp-regular text-sm font-medium mb-1";
const buttonStyle =
	" px-3 py-1 text-xs hover: hover: transition-colors   focus: focus:ring-offset-2 focus:ring-offset-base";

function extractVideoInfo(url: string) {
	const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
	const youtubeMatch = url.match(youtubeRegex);
	if (youtubeMatch) {
		return {
			type: "youtube" as const,
			videoId: youtubeMatch[1],
			thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
		};
	}
	const vimeoRegex = /vimeo\.com\/(\d+)/;
	const vimeoMatch = url.match(vimeoRegex);
	if (vimeoMatch) {
		return { type: "vimeo" as const, videoId: vimeoMatch[1] };
	}
	return null;
}

function MediaPreview({ video }: { video: MediaEmbed }) {
	if (!video.url) return null;
	return (
		<div className="mt-3 p-3  rounded">
			<p className="text-xs  mb-2">Preview:</p>
			<div className="text-sm">
				<div className="flex items-center gap-2 mb-1">
					<span className="  px-2 py-1 text-xs rounded">{video.type}</span>
					{video.title && <span className="font-medium">{video.title}</span>}
				</div>
				<p className="text-xs  break-all">{video.url}</p>
				{video.description && (
					<p className="text-xs  mt-1">{video.description}</p>
				)}
			</div>
		</div>
	);
}

function MediaEditor({
	video,
	index,
	onUpdate,
	onRemove,
}: {
	video: MediaEmbed;
	index: number;
	onUpdate: (
		index: number,
		field: keyof MediaEmbed,
		value: unknown,
	) => void;
	onRemove: (index: number) => void;
}) {
	return (
		<div key={video.url} className="  p-4 rounded space-y-3">
			<div className="flex justify-between items-start">
				<div className="flex-1 space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className={labelStyle} htmlFor={`video-${index}-type`}>
								Type
							</label>
							<select
								id={`video-${index}-type`}
								value={video.type}
								onChange={(e) => onUpdate(index, "type", e.target.value)}
								className={inputStyle}
							>
								<option value="youtube">YouTube</option>
								<option value="vimeo">Vimeo</option>
								<option value="code">Code Embed</option>
								<option value="social">Social Media</option>
								<option value="iframe">Custom iFrame</option>
							</select>
						</div>

						<div>
							<label className={labelStyle} htmlFor={`video-${index}-title`}>
								Title
							</label>
							<input
								id={`video-${index}-title`}
								type="text"
								value={video.title || ""}
								onChange={(e) => onUpdate(index, "title", e.target.value)}
								className={inputStyle}
							/>
						</div>
					</div>

					<div>
						<label className={labelStyle} htmlFor={`video-${index}-url`}>
							URL
						</label>
						<input
							id={`video-${index}-url`}
							type="url"
							value={video.url}
							onChange={(e) => onUpdate(index, "url", e.target.value)}
							className={inputStyle}
						/>
					</div>

					<div>
						<label
							className={labelStyle}
							htmlFor={`video-${index}-description`}
						>
							Description
						</label>
						<textarea
							id={`video-${index}-description`}
							value={video.description || ""}
							onChange={(e) => onUpdate(index, "description", e.target.value)}
							className={`${inputStyle} h-16 resize-vertical`}
							rows={2}
						/>
					</div>

					{video.type === "iframe" && (
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									className={labelStyle}
									htmlFor={`video-${index}-width`}
								>
									Width
								</label>
								<input
									id={`video-${index}-width`}
									type="number"
									value={video.width || ""}
									onChange={(e) =>
										onUpdate(
											index,
											"width",
											parseInt(e.target.value) || undefined,
										)
									}
									className={inputStyle}
								/>
							</div>
							<div>
								<label
									className={labelStyle}
									htmlFor={`video-${index}-height`}
								>
									Height
								</label>
								<input
									id={`video-${index}-height`}
									type="number"
									value={video.height || ""}
									onChange={(e) =>
										onUpdate(
											index,
											"height",
											parseInt(e.target.value) || undefined,
										)
									}
									className={inputStyle}
								/>
							</div>
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={() => onRemove(index)}
					className="ml-4 text-sm"
					title="Remove media"
				>
					Remove
				</button>
			</div>

			<MediaPreview video={video} />
		</div>
	);
}

function AddMediaForm({
	newVideo,
	onChange,
	onUrlChange,
	onAdd,
	onCancel,
}: {
	newVideo: MediaEmbed;
	onChange: (updater: (prev: MediaEmbed) => MediaEmbed) => void;
	onUrlChange: (url: string) => void;
	onAdd: () => void;
	onCancel: () => void;
}) {
	return (
		<div className="  p-4 rounded space-y-3">
			<h4 className="noto-sans-jp-regular text-sm font-medium ">
				Add New Media
			</h4>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label className={labelStyle} htmlFor="new-video-type">
						Type
					</label>
					<select
						id="new-video-type"
						value={newVideo.type}
						onChange={(e) =>
							onChange((prev) => ({
								...prev,
								type: e.target.value as MediaEmbed["type"],
							}))
						}
						className={inputStyle}
					>
						<option value="youtube">YouTube</option>
						<option value="vimeo">Vimeo</option>
						<option value="code">Code Embed</option>
						<option value="social">Social Media</option>
						<option value="iframe">Custom iFrame</option>
					</select>
				</div>

				<div>
					<label className={labelStyle}>Title</label>
					<input
						type="text"
						value={newVideo.title || ""}
						onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
						className={inputStyle}
						placeholder="Video title"
					/>
				</div>
			</div>

			<div>
				<label className={labelStyle}>URL *</label>
				<input
					type="url"
					value={newVideo.url}
					onChange={(e) => onUrlChange(e.target.value)}
					className={inputStyle}
					placeholder="https://www.youtube.com/watch?v=..."
				/>
			</div>

			<div>
				<label className={labelStyle}>Description</label>
				<textarea
					value={newVideo.description || ""}
					onChange={(e) =>
						onChange((prev) => ({ ...prev, description: e.target.value }))
					}
					className={`${inputStyle} h-20 resize-vertical`}
					placeholder="Optional description"
					rows={2}
				/>
			</div>

			{newVideo.type === "iframe" && (
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className={labelStyle}>Width</label>
						<input
							type="number"
							value={newVideo.width || ""}
							onChange={(e) =>
								onChange((prev) => ({
									...prev,
									width: parseInt(e.target.value) || undefined,
								}))
							}
							className={inputStyle}
							placeholder="560"
						/>
					</div>
					<div>
						<label className={labelStyle}>Height</label>
						<input
							type="number"
							value={newVideo.height || ""}
							onChange={(e) =>
								onChange((prev) => ({
									...prev,
									height: parseInt(e.target.value) || undefined,
								}))
							}
							className={inputStyle}
							placeholder="315"
						/>
					</div>
				</div>
			)}

			<div className="flex justify-end gap-2">
				<button type="button" onClick={onCancel} className={buttonStyle}>
					Cancel
				</button>
				<button
					type="button"
					onClick={onAdd}
					className={`${buttonStyle}`}
					disabled={!newVideo.url.trim()}
				>
					Add Media
				</button>
			</div>
		</div>
	);
}

export function MediaEmbedSection({
	videos,
	onVideosChange,
}: MediaEmbedSectionProps) {
	const [newVideo, setNewVideo] = useState<MediaEmbed>({
		type: "youtube",
		url: "",
		title: "",
		description: "",
	});
	const [showAddForm, setShowAddForm] = useState(false);

	const addVideo = () => {
		if (!newVideo.url.trim()) {
			alert("URL is required");
			return;
		}
		const videoToAdd = {
			...newVideo,
			url: newVideo.url.trim(),
			title: newVideo.title?.trim() || "",
			description: newVideo.description?.trim() || "",
		};
		console.log("Adding video:", videoToAdd);
		onVideosChange([...videos, videoToAdd]);
		setNewVideo({ type: "youtube", url: "", title: "", description: "" });
		setShowAddForm(false);
	};

	const cancelAdd = () => {
		setNewVideo({ type: "youtube", url: "", title: "", description: "" });
		setShowAddForm(false);
	};

	const updateVideo = (
		index: number,
		field: keyof MediaEmbed,
		value: unknown,
	) => {
		const updatedVideos = videos.map((video, i) =>
			i === index ? { ...video, [field]: value } : video,
		);
		onVideosChange(updatedVideos);
	};

	const removeVideo = (index: number) => {
		onVideosChange(videos.filter((_, i) => i !== index));
	};

	const handleUrlChange = (url: string) => {
		setNewVideo((prev) => ({ ...prev, url }));
		const videoInfo = extractVideoInfo(url);
		if (videoInfo) {
			setNewVideo((prev) => ({
				...prev,
				type: videoInfo.type,
				thumbnail: videoInfo.thumbnail,
			}));
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="neue-haas-grotesk-display text-xl leading-snug">
					Media Embeds
				</h3>
				{!showAddForm && (
					<button
						type="button"
						onClick={() => setShowAddForm(true)}
						className={`${buttonStyle}`}
					>
						+ Add Media
					</button>
				)}
			</div>

			{showAddForm && (
				<AddMediaForm
					newVideo={newVideo}
					onChange={setNewVideo}
					onUrlChange={handleUrlChange}
					onAdd={addVideo}
					onCancel={cancelAdd}
				/>
			)}

			{videos.length > 0 && (
				<div className="space-y-3">
					<h4 className="noto-sans-jp-regular text-sm font-medium ">
						Current Media ({videos.length})
					</h4>
					{videos.map((video, index) => (
						<MediaEditor
							key={video.url}
							video={video}
							index={index}
							onUpdate={updateVideo}
							onRemove={removeVideo}
						/>
					))}
				</div>
			)}
		</div>
	);
}
