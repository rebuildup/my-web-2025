import { contentFormStyles as s } from "./ContentForm.styles";
import type { ContentFormSectionProps } from "./ContentForm.types";
import { ContentFormInputField } from "./ContentFormInputField";

export function ContentFormStructure({
	formData,
	setFormData,
}: ContentFormSectionProps) {
	return (
		<div style={s.col2}>
			<ContentFormInputField
				label="親ID"
				value={formData.parentId || ""}
				onChange={(value) =>
					setFormData((prev) => ({ ...prev, parentId: value }))
				}
			/>
			<ContentFormInputField
				label="パス"
				value={formData.path || ""}
				onChange={(value) => setFormData((prev) => ({ ...prev, path: value }))}
			/>
			<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
				<div style={{ flex: 1, minWidth: 120 }}>
					<ContentFormInputField
						label="深度"
						value={String(formData.depth || 0)}
						onChange={(value) =>
							setFormData((prev) => ({
								...prev,
								depth: Number(value) || 0,
							}))
						}
						type="number"
					/>
				</div>
				<div style={{ flex: 1, minWidth: 120 }}>
					<ContentFormInputField
						label="順序"
						value={String(formData.order || 0)}
						onChange={(value) =>
							setFormData((prev) => ({
								...prev,
								order: Number(value) || 0,
							}))
						}
						type="number"
					/>
				</div>
				<div style={{ flex: 1, minWidth: 120 }}>
					<ContentFormInputField
						label="子要素数"
						value={String((formData as any).childCount || 0)}
						onChange={() => {}}
						type="number"
						disabled
					/>
				</div>
			</div>
		</div>
	);
}
