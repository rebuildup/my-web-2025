import { Trash2 } from "lucide-react";
import Image from "next/image";
import { contentFormStyles as s } from "./ContentForm.styles";
import type { ContentFormSectionProps } from "./ContentForm.types";

export function ContentFormLinksMedia({
	formData,
	setFormData,
}: ContentFormSectionProps) {
	const mediaItems: { src: string; type?: string }[] = [];
	const seen = new Set<string>();
	const addMediaItem = (src?: string, type?: string) => {
		if (src && !seen.has(src)) {
			seen.add(src);
			mediaItems.push({ src, type });
		}
	};
	if (Array.isArray(formData.assets)) {
		for (const asset of formData.assets as any[])
			addMediaItem(asset?.src, asset?.type);
	}
	addMediaItem(formData.thumbnails?.image?.src);
	addMediaItem(formData.thumbnails?.gif?.src);
	addMediaItem(formData.thumbnails?.webm?.src);
	addMediaItem(formData.thumbnails?.webm?.poster);

	return (
		<div style={s.col2}>
			<div>
				<div style={s.sectionTitle}>リンク</div>
				{(formData.links || []).map((link, index) => (
					<div
						key={`${link.href}-${link.label ?? ""}`}
						style={{
							display: "flex",
							gap: 8,
							alignItems: "center",
							marginBottom: 6,
						}}
					>
						<input
							style={{ ...s.input, flex: 1 }}
							value={link.label || ""}
							placeholder="ラベル"
							onChange={(event) => {
								const links = [...(formData.links || [])];
								links[index] = { ...links[index], label: event.target.value };
								setFormData((prev) => ({ ...prev, links }));
							}}
						/>
						<input
							style={{ ...s.input, flex: 2 }}
							value={link.href || ""}
							placeholder="URL"
							onChange={(event) => {
								const links = [...(formData.links || [])];
								links[index] = { ...links[index], href: event.target.value };
								setFormData((prev) => ({ ...prev, links }));
							}}
						/>
						<button
							type="button"
							style={s.btnDanger}
							onClick={() => {
								setFormData((prev) => ({
									...prev,
									links: (prev.links || []).filter(
										(_, itemIndex) => itemIndex !== index,
									),
								}));
							}}
							aria-label="リンクを削除"
						>
							<Trash2 size={16} />
						</button>
					</div>
				))}
				<button
					type="button"
					style={s.btn}
					onClick={() =>
						setFormData((prev) => ({
							...prev,
							links: [...(prev.links || []), { label: "", href: "" }],
						}))
					}
				>
					リンクを追加
				</button>
			</div>
			<div style={s.divider} />
			<div>
				<div style={s.sectionTitle}>メディア</div>
				{mediaItems.map((media) => (
					<div
						key={media.src}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
							marginBottom: 6,
							padding: "4px 8px",
						}}
					>
						{media.src.match(/\.(png|jpe?g|gif|webp|svg)/i) ? (
							<Image
								src={media.src}
								alt=""
								width={40}
								height={40}
								unoptimized
								style={{ width: 40, height: 40, objectFit: "cover" }}
							/>
						) : media.src.match(/\.(mp4|webm|ogv)/i) ? (
							<video src={media.src} style={{ width: 40, height: 40 }} muted />
						) : null}
						<span
							style={{
								flex: 1,
								fontSize: 11,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{media.src}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
