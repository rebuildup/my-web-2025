import { contentFormStyles as s } from "./ContentForm.styles";
import type { ContentFormSectionProps } from "./ContentForm.types";
import { ContentFormInputField } from "./ContentFormInputField";

export function ContentFormPermissionsI18nExt({
	formData,
	setFormData,
}: ContentFormSectionProps) {
	return (
		<div style={s.col2}>
			<ContentFormInputField
				label="オーナー"
				value={formData.permissions?.owner || ""}
				onChange={() => {}}
				disabled
			/>
			<ContentFormInputField
				label="閲覧者"
				value={(formData.permissions?.readers || []).join(", ")}
				onChange={() => {}}
				disabled
			/>
			<ContentFormInputField
				label="編集者"
				value={(formData.permissions?.editors || []).join(", ")}
				onChange={() => {}}
				disabled
			/>
			<div style={s.divider} />
			<ContentFormInputField
				label="デフォルト言語"
				value={formData.i18n?.defaultLang || formData.lang || "ja"}
				onChange={() => {}}
				disabled
			/>
			<ContentFormInputField
				label="翻訳"
				value={Object.entries(formData.i18n?.translations || {})
					.map(([key, value]) => `${key}:${value}`)
					.join("\n")}
				onChange={() => {}}
				disabled
				multiline
				minRows={2}
			/>
			<div style={s.divider} />
			<ContentFormInputField
				label="Twitter @site"
				value={(formData.ext as any)?.twitter?.site || ""}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						ext: {
							...((prev.ext as any) || {}),
							twitter: {
								...((prev.ext as any)?.twitter || {}),
								site: value,
							},
						} as any,
					}))
				}
			/>
		</div>
	);
}
