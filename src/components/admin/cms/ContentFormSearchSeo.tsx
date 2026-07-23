import Image from "next/image";
import { contentFormStyles as s } from "./ContentForm.styles";
import type { ContentFormSectionProps } from "./ContentForm.types";
import { ContentFormInputField } from "./ContentFormInputField";

interface ContentFormSearchSeoProps extends ContentFormSectionProps {
	generatedOgImageUrl: string;
	applyGeneratedOgImageUrl: () => void;
}

export function ContentFormSearchSeo({
	formData,
	setFormData,
	generatedOgImageUrl,
	applyGeneratedOgImageUrl,
}: ContentFormSearchSeoProps) {
	return (
		<div style={s.col2}>
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
			<ContentFormInputField
				label="OG 画像URL"
				value={formData.seo?.openGraph?.image || ""}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							openGraph: { ...(prev.seo?.openGraph || {}), image: value },
						},
					}))
				}
			/>
			<div>
				<button type="button" style={s.btn} onClick={applyGeneratedOgImageUrl}>
					生成OG画像を適用
				</button>
			</div>
			{formData.seo?.openGraph?.image && (
				<div style={{ marginTop: 8 }}>
					<Image
						src={formData.seo.openGraph.image}
						width={400}
						height={200}
						unoptimized
						alt="OG"
						style={{ maxWidth: "100%", maxHeight: 200 }}
					/>
				</div>
			)}
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
				value={((formData.seo as any)?.keywords || []).join(", ")}
				onChange={(value) =>
					setFormData((prev) => ({
						...prev,
						seo: {
							...(prev.seo || {}),
							keywords: value
								.split(",")
								.map((keyword) => keyword.trim())
								.filter(Boolean),
						} as any,
					}))
				}
			/>
			<div style={{ marginTop: 8 }}>
				<div style={s.label}>OG画像プレビュー</div>
				<Image
					src={generatedOgImageUrl}
					width={400}
					height={200}
					unoptimized
					alt="generated OG"
					style={{ maxWidth: "100%", maxHeight: 200 }}
				/>
			</div>
		</div>
	);
}
