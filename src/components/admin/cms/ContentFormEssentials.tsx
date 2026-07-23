import type { Dispatch, SetStateAction } from "react";
import { contentFormStyles as s } from "./ContentForm.styles";
import type { ContentFormSectionProps } from "./ContentForm.types";
import { ContentFormInputField } from "./ContentFormInputField";

interface ContentFormEssentialsProps extends ContentFormSectionProps {
	newTag: string;
	setNewTag: Dispatch<SetStateAction<string>>;
	tagOptions: string[];
	addTag: () => void;
	removeTag: (tag: string) => void;
}

export function ContentFormEssentials({
	formData,
	setFormData,
	newTag,
	setNewTag,
	tagOptions,
	addTag,
	removeTag,
}: ContentFormEssentialsProps) {
	return (
		<div style={s.col2}>
			<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
				<div style={{ flex: 1, minWidth: 200 }}>
					<ContentFormInputField
						label="タイトル"
						value={formData.title || ""}
						onChange={(value) =>
							setFormData((prev) => ({ ...prev, title: value }))
						}
						required
					/>
				</div>
				<div style={{ flex: 1, minWidth: 200 }}>
					<ContentFormInputField
						label="ID"
						value={formData.id || ""}
						onChange={(value) =>
							setFormData((prev) => ({ ...prev, id: value }))
						}
						required
					/>
				</div>
			</div>
			<ContentFormInputField
				label="公開日"
				value={
					formData.publishedAt
						? new Date(formData.publishedAt).toISOString().slice(0, 10)
						: ""
				}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						publishedAt: value ? new Date(value).toISOString() : undefined,
					}))
				}
				type="date"
			/>
			<ContentFormInputField
				label="公開URL"
				value={formData.publicUrl || ""}
				onChange={(value) =>
					setFormData((prev) => ({ ...prev, publicUrl: value }))
				}
			/>
			<div>
				<div style={s.label}>タグ</div>
				<div
					style={{
						display: "flex",
						gap: 8,
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<input
						style={{ ...s.input, flex: 1, minWidth: 150 }}
						value={newTag}
						onChange={(event) => setNewTag(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								addTag();
							}
						}}
						placeholder="タグを入力してEnter"
						list="tag-suggestions"
					/>
					<datalist id="tag-suggestions">
						{tagOptions.map((tag) => (
							<option key={tag} value={tag} />
						))}
					</datalist>
					<button type="button" style={s.btnPrimary} onClick={addTag}>
						追加
					</button>
				</div>
				<div
					style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}
				>
					{(formData.tags || []).map((tag) => (
						<span key={tag} style={s.chip}>
							{tag}
							<button
								type="button"
								style={{ ...s.btnDanger, padding: 0, fontSize: 11 }}
								onClick={() => removeTag(tag)}
							>
								×
							</button>
						</span>
					))}
				</div>
			</div>
			<ContentFormInputField
				label="概要"
				value={formData.summary || ""}
				onChange={(value) =>
					setFormData((prev) => ({ ...prev, summary: value }))
				}
				multiline
				minRows={3}
			/>
		</div>
	);
}
