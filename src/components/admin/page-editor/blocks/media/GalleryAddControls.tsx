import { Button, Stack } from "@mui/material";
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
		<Stack spacing={1} sx={{ alignItems: "center", justifyContent: "center" }}>
			{MEDIA_KINDS.map(({ kind, label }) => (
				<Button
					key={kind}
					size="small"
					variant="outlined"
					onClick={() => {
						onContentChange?.(appendGalleryItem(content, kind));
						onSelect(itemCount);
					}}
				>
					{label}
				</Button>
			))}
		</Stack>
	);
}
