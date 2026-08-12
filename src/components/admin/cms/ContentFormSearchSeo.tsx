import { contentFormStyles as s } from "./ContentForm.styles";
import type { ContentFormSectionProps } from "./ContentForm.types";
import { resolveOgImageUrl } from "./ContentForm.utils";
import { ContentFormInputField } from "./ContentFormInputField";

export function ContentFormSearchSeo({
	formData,
	setFormData,
}: ContentFormSectionProps) {
	const ogImageUrl = resolveOgImageUrl(formData);
	return (
		<div style={s.col2}>
			<div>
				<div style={s.sectionTitle}>OG 画像プレビュー</div>
				<div style={s.label}>
					Rust API が配信する OG 画像 (1200x630 推奨) — サムネイル / YouTube URL
					から自動解決
				</div>
				{ogImageUrl ? (
					<>
						<div
							style={{
								marginTop: 6,
								position: "relative",
								width: "100%",
								maxWidth: 480,
								aspectRatio: "1200 / 630",
								background: "#f3f4f6",
								border: "1px solid #e5e7eb",
								overflow: "hidden",
							}}
						>
							<img
								src={ogImageUrl}
								alt="OG image preview"
								style={{
									position: "absolute",
									inset: 0,
									width: "100%",
									height: "100%",
									objectFit: "cover",
								}}
							/>
						</div>
						<div style={{ ...s.helper, wordBreak: "break-all" }}>
							{ogImageUrl}
						</div>
					</>
				) : (
					<div style={{ ...s.helper, marginTop: 6 }}>
						サムネイル画像 / GIF / WEBM / YouTube URL のいずれかを設定すると,
						Rust API が OG 画像として配信します.
					</div>
				)}
			</div>
			<div style={s.divider} />
			<ContentFormInputField
				label="全文検索テキスト"
				value={formData.searchable?.fullText || ""}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						searchable: { ...(prev.searchable || {}), fullText: value },
					}))
				}
				multiline
				minRows={3}
			/>
			<ContentFormInputField
				label="トークン（カンマ区切り）"
				value={(formData.searchable?.tokens || []).join(", ")}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						searchable: {
							...(prev.searchable || {}),
							tokens: value
								.split(",")
								.map((token) => token.trim())
								.filter(Boolean),
						},
					}))
				}
			/>
			<div style={s.divider} />
			<ContentFormInputField
				label="Meta タイトル"
				value={formData.seo?.meta?.title || ""}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							meta: { ...(prev.seo?.meta || {}), title: value },
						},
					}))
				}
			/>
			<ContentFormInputField
				label="Meta 説明"
				value={formData.seo?.meta?.description || ""}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							meta: { ...(prev.seo?.meta || {}), description: value },
						},
					}))
				}
				multiline
				minRows={2}
			/>
			<ContentFormInputField
				label="OG タイトル"
				value={formData.seo?.openGraph?.title || ""}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							openGraph: { ...(prev.seo?.openGraph || {}), title: value },
						},
					}))
				}
			/>
			<ContentFormInputField
				label="OG 説明"
				value={formData.seo?.openGraph?.description || ""}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							openGraph: {
								...(prev.seo?.openGraph || {}),
								description: value,
							},
						},
					}))
				}
				multiline
				minRows={2}
			/>
			<div style={s.divider} />
			<ContentFormInputField
				label="Canonical"
				value={formData.seo?.meta?.canonical || ""}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							meta: { ...(prev.seo?.meta || {}), canonical: value },
						},
					}))
				}
			/>
			<ContentFormInputField
				label="Robots"
				value={formData.seo?.meta?.robots || "index,follow"}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							meta: { ...(prev.seo?.meta || {}), robots: value },
						},
					}))
				}
			/>
			<ContentFormInputField
				label="Keywords"
				value={(formData.seo?.meta?.keywords || []).join(", ")}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							meta: {
								...(prev.seo?.meta || {}),
								keywords: value
									.split(",")
									.map((keyword) => keyword.trim())
									.filter(Boolean),
							},
						},
					}))
				}
			/>
		</div>
	);
}
