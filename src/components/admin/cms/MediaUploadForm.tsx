"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, type ReactNode, useId, useState } from "react";
import { adminColor } from "@/components/admin/ui/tokens";

interface MediaUploadFormProps {
	onSubmit: (formData: FormData) => void;
	onCancel: () => void;
	isLoading?: boolean;
	contentId?: string;
}

const labelStyle: CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	color: adminColor.textPrimary,
};

const helperStyle: CSSProperties = {
	fontSize: 12,
	color: adminColor.textSecondary,
};

const inputBaseStyle: CSSProperties = {
	width: "100%",
	padding: "8px 12px",
	fontSize: 14,
	color: adminColor.textPrimary,
	backgroundColor: "#ffffff",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	outline: "none",
	transition: "border-color 120ms ease, box-shadow 120ms ease",
};

const disabledStyle: CSSProperties = {
	backgroundColor: "#f3f4f6",
	color: adminColor.textDisabled,
	cursor: "not-allowed",
};

const dividerStyle: CSSProperties = {
	height: 1,
	backgroundColor: adminColor.border,
	margin: "16px 0",
	border: "none",
};

const primaryButtonStyle = (disabled: boolean): CSSProperties => ({
	padding: "8px 18px",
	fontSize: 14,
	fontWeight: 600,
	color: "#ffffff",
	backgroundColor: adminColor.accent,
	border: `1px solid ${adminColor.accent}`,
	borderRadius: 6,
	cursor: disabled ? "not-allowed" : "pointer",
	opacity: disabled ? 0.5 : 1,
});

const outlinedButtonStyle = (disabled: boolean): CSSProperties => ({
	padding: "8px 18px",
	fontSize: 14,
	fontWeight: 600,
	color: adminColor.textPrimary,
	backgroundColor: "transparent",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 6,
	cursor: disabled ? "not-allowed" : "pointer",
	opacity: disabled ? 0.5 : 1,
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 6,
});

function Field({
	label,
	required,
	value,
	onChange,
	placeholder,
	disabled = false,
	helperText,
	multiline = false,
	rows = 4,
	id,
}: {
	label: string;
	required?: boolean;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	helperText?: string;
	multiline?: boolean;
	rows?: number;
	id?: string;
}) {
	const reactId = useId();
	const fieldId = id ?? `muform-${reactId}`;
	const helperId = helperText ? `${fieldId}-helper` : undefined;

	const sharedStyle: CSSProperties = {
		...inputBaseStyle,
		...(disabled ? disabledStyle : {}),
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<label htmlFor={fieldId} style={labelStyle}>
				{label}
				{required && (
					<span style={{ color: adminColor.error, marginLeft: 4 }} aria-hidden>
						*
					</span>
				)}
			</label>
			{multiline ? (
				<textarea
					id={fieldId}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					rows={rows}
					aria-describedby={helperId}
					style={{ ...sharedStyle, resize: "vertical", lineHeight: 1.6 }}
				/>
			) : (
				<input
					id={fieldId}
					type="text"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					aria-describedby={helperId}
					style={sharedStyle}
				/>
			)}
			{helperText && (
				<p id={helperId} style={helperStyle}>
					{helperText}
				</p>
			)}
		</div>
	);
}

function SectionTitle({ children }: { children: ReactNode }) {
	return <p style={{ ...labelStyle, margin: 0 }}>{children}</p>;
}

export function MediaUploadForm({
	onSubmit,
	onCancel,
	isLoading = false,
	contentId,
}: MediaUploadFormProps) {
	const [file, setFile] = useState<File | null>(null);
	const [alt, setAlt] = useState("");
	const [description, setDescription] = useState("");
	const [tags, setTags] = useState("");
	const [selectedContentId, setSelectedContentId] = useState(contentId || "");
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewUrl(reader.result as string);
			};
			reader.readAsDataURL(selectedFile);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) {
			alert("ファイルを選択してください");
			return;
		}

		if (!selectedContentId) {
			alert("コンテンツIDを入力してください");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("contentId", selectedContentId);
		if (alt) formData.append("alt", alt);
		if (description) formData.append("description", description);
		if (tags) formData.append("tags", tags);

		onSubmit(formData);
	};

	const clearFile = () => {
		setFile(null);
		setPreviewUrl(null);
	};

	return (
		<form onSubmit={handleSubmit} style={{ paddingTop: 16 }}>
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<Field
					label="コンテンツID"
					required
					value={selectedContentId}
					onChange={setSelectedContentId}
					placeholder="apple01"
					disabled={isLoading}
					helperText="このメディアを関連付けるコンテンツのID"
				/>

				<hr style={dividerStyle} />

				<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
					<SectionTitle>
						ファイル{" "}
						<span style={{ color: adminColor.error }} aria-hidden>
							*
						</span>
					</SectionTitle>
					<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
						<label style={outlinedButtonStyle(isLoading)}>
							ファイルを選択
							<input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								disabled={isLoading}
								style={{ display: "none" }}
							/>
						</label>
						{file && (
							<button
								type="button"
								onClick={clearFile}
								disabled={isLoading}
								aria-label="選択をクリア"
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									padding: 6,
									backgroundColor: "transparent",
									color: adminColor.error,
									border: `1px solid ${adminColor.borderInput}`,
									borderRadius: 6,
									cursor: isLoading ? "not-allowed" : "pointer",
									opacity: isLoading ? 0.5 : 1,
								}}
							>
								<Trash2 size={16} />
							</button>
						)}
					</div>
					{file && (
						<p
							style={{
								...helperStyle,
								margin: 0,
								fontSize: 12,
							}}
						>
							選択済み: {file.name} ({(file.size / 1024).toFixed(2)} KB)
						</p>
					)}
				</div>

				{previewUrl && (
					<section
						style={{
							border: `1px solid ${adminColor.border}`,
							borderRadius: 8,
							padding: 16,
						}}
					>
						<p style={{ ...labelStyle, margin: 0, marginBottom: 8 }}>
							プレビュー
						</p>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								backgroundColor: "#f9fafb",
								padding: 16,
								borderRadius: 4,
							}}
						>
							<Image
								src={previewUrl}
								alt="Preview"
								width={400}
								height={256}
								style={{
									maxWidth: "100%",
									maxHeight: "16rem",
									objectFit: "contain",
									borderRadius: 4,
								}}
							/>
						</div>
					</section>
				)}

				<hr style={dividerStyle} />

				<Field
					label="代替テキスト（Alt）"
					value={alt}
					onChange={setAlt}
					placeholder="画像の説明"
					disabled={isLoading}
					helperText="アクセシビリティのための画像説明"
				/>

				<Field
					label="説明"
					multiline
					rows={3}
					value={description}
					onChange={setDescription}
					placeholder="メディアの詳細な説明"
					disabled={isLoading}
				/>

				<Field
					label="タグ（カンマ区切り）"
					value={tags}
					onChange={setTags}
					placeholder="tag1, tag2, tag3"
					disabled={isLoading}
				/>
			</div>

			<hr style={{ ...dividerStyle, margin: "24px 0" }} />

			<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
				<button
					type="button"
					onClick={onCancel}
					disabled={isLoading}
					style={outlinedButtonStyle(isLoading)}
				>
					キャンセル
				</button>
				<button
					type="submit"
					disabled={isLoading}
					style={primaryButtonStyle(isLoading)}
				>
					{isLoading ? "アップロード中..." : "アップロード"}
				</button>
			</div>
		</form>
	);
}
