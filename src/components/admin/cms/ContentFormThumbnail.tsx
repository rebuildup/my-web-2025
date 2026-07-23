import type { ChangeEventHandler, RefObject } from "react";
import Image from "next/image";
import { contentFormStyles as s } from "./ContentForm.styles";
import type { ContentFormSectionProps } from "./ContentForm.types";
import { toYouTubeEmbed } from "./ContentForm.utils";
import { ContentFormInputField } from "./ContentFormInputField";

interface ContentFormThumbnailProps extends ContentFormSectionProps {
	imageInputRef: RefObject<HTMLInputElement | null>;
	gifInputRef: RefObject<HTMLInputElement | null>;
	webmInputRef: RefObject<HTMLInputElement | null>;
	handleImageFileChange: ChangeEventHandler<HTMLInputElement>;
	handleGifFileChange: ChangeEventHandler<HTMLInputElement>;
	handleWebmFileChange: ChangeEventHandler<HTMLInputElement>;
}

export function ContentFormThumbnail({
	formData,
	setFormData,
	imageInputRef,
	gifInputRef,
	webmInputRef,
	handleImageFileChange,
	handleGifFileChange,
	handleWebmFileChange,
}: ContentFormThumbnailProps) {
	const youTubeUrl = (formData.ext as any)?.thumbnail?.youtube;
	const youTubeEmbedUrl = youTubeUrl ? toYouTubeEmbed(youTubeUrl) : null;

	return (
		<div style={s.col2}>
			<div>
				<ContentFormInputField
					label="画像URL"
					value={formData.thumbnails?.image?.src || ""}
					onChange={(value) =>
						setFormData((prev) => ({
							...prev,
							thumbnails: {
								...(prev.thumbnails || {}),
								image: { ...(prev.thumbnails?.image || {}), src: value },
							},
						}))
					}
				/>
				{formData.thumbnails?.image?.src && (
					<div style={{ marginTop: 8 }}>
						<Image
							src={formData.thumbnails.image.src}
							width={400}
							height={200}
							unoptimized
							alt="thumbnail"
							style={{ maxWidth: "100%", maxHeight: 200 }}
						/>
					</div>
				)}
				<button
					type="button"
					style={{ ...s.btn, marginTop: 6 }}
					onClick={() => imageInputRef.current?.click()}
				>
					ファイルから埋め込み
				</button>
				<input
					ref={imageInputRef}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={handleImageFileChange}
				/>
			</div>
			<div style={s.divider} />
			<div>
				<ContentFormInputField
					label="YouTube URL"
					value={youTubeUrl || ""}
					onChange={(value) => {
						setFormData((prev) => {
							const ext = (prev.ext as any) || {};
							const thumbnail = ext.thumbnail || {};
							return {
								...prev,
								ext: {
									...ext,
									thumbnail: { ...thumbnail, youtube: value },
								} as any,
							};
						});
					}}
				/>
				{youTubeEmbedUrl && (
					<div
						style={{
							marginTop: 8,
							position: "relative",
							paddingBottom: "56.25%",
							height: 0,
							overflow: "hidden",
						}}
					>
						<iframe
							src={youTubeEmbedUrl}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: "100%",
								border: 0,
							}}
							allowFullScreen
						/>
					</div>
				)}
			</div>
			<div style={s.divider} />
			<div>
				<ContentFormInputField
					label="GIF URL"
					value={formData.thumbnails?.gif?.src || ""}
					onChange={(value) =>
						setFormData((prev) => ({
							...prev,
							thumbnails: {
								...(prev.thumbnails || {}),
								gif: { ...(prev.thumbnails?.gif || {}), src: value },
							},
						}))
					}
				/>
				<button
					type="button"
					style={{ ...s.btn, marginTop: 6 }}
					onClick={() => gifInputRef.current?.click()}
				>
					ファイルから埋め込み
				</button>
				<input
					ref={gifInputRef}
					type="file"
					accept="image/gif"
					style={{ display: "none" }}
					onChange={handleGifFileChange}
				/>
			</div>
			<div style={s.divider} />
			<div>
				<ContentFormInputField
					label="WEBM URL"
					value={formData.thumbnails?.webm?.src || ""}
					onChange={(value) =>
						setFormData((prev) => ({
							...prev,
							thumbnails: {
								...(prev.thumbnails || {}),
								webm: {
									...(prev.thumbnails?.webm || ({ src: "" } as any)),
									src: value,
								},
							},
						}))
					}
				/>
				<ContentFormInputField
					label="WEBM ポスターURL"
					value={formData.thumbnails?.webm?.poster || ""}
					onChange={(value) =>
						setFormData((prev) => ({
							...prev,
							thumbnails: {
								...(prev.thumbnails || {}),
								webm: {
									...(prev.thumbnails?.webm || ({ src: "" } as any)),
									poster: value,
								},
							},
						}))
					}
				/>
				<button
					type="button"
					style={{ ...s.btn, marginTop: 6 }}
					onClick={() => webmInputRef.current?.click()}
				>
					ファイルから埋め込み
				</button>
				<input
					ref={webmInputRef}
					type="file"
					accept="video/webm"
					style={{ display: "none" }}
					onChange={handleWebmFileChange}
				/>
				{formData.thumbnails?.webm?.src && (
					<div style={{ marginTop: 8 }}>
						<video
							src={formData.thumbnails.webm.src}
							poster={formData.thumbnails.webm.poster}
							controls
							style={{ maxWidth: "100%", maxHeight: 200 }}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
