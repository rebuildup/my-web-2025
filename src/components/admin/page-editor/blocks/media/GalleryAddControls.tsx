import { adminColor } from "@/components/admin/ui/tokens";
import { appendGalleryItem, type MediaKind } from "./gallery-utils";

interface GalleryAddControlsProps {
	content?: string;
	itemCount: number;
	onContentChange?: (content: string) => void;
	onSelect: (index: number) => void;
}

const MEDIA_KINDS: Array<{ kind: MediaKind; label: string }> = [
	{ kind: "image", label: "Image" },
	{ kind: "video", label: "Video" },
	{ kind: "audio", label: "Audio" },
	{ kind: "file", label: "File" },
];

export function GalleryAddControls({
	content,
	itemCount,
	onContentChange,
	onSelect,
}: GalleryAddControlsProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 8,
			}}
		>
			{MEDIA_KINDS.map(({ kind, label }) => (
				<button
					key={kind}
					type="button"
					onClick={() => {
						onContentChange?.(appendGalleryItem(content, kind));
						onSelect(itemCount);
					}}
					style={{
						padding: "6px 12px",
						fontSize: 14,
						border: `1px solid ${adminColor.borderInput}`,
						borderRadius: 4,
						backgroundColor: adminColor.bgPanel,
						color: adminColor.textPrimary,
						cursor: "pointer",
					}}
				>
					{label}
				</button>
			))}
		</div>
	);
}
