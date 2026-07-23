import { Button, Stack, TextField } from "@mui/material";
import { appendGalleryItem, type MediaKind } from "./gallery-utils";

interface GallerySettingsProps {
	content?: string;
	columns: number;
	maxRows: number;
	readOnly?: boolean;
	onContentChange?: (content: string) => void;
	onAttributesChange?: (attributes: Record<string, unknown>) => void;
}

const MEDIA_KINDS: Array<{ kind: MediaKind; label: string }> = [
	{ kind: "image", label: "+ Image" },
	{ kind: "video", label: "+ Video" },
	{ kind: "audio", label: "+ Audio" },
	{ kind: "file", label: "+ File" },
];

export function GallerySettings({
	content,
	columns,
	maxRows,
	readOnly,
	onContentChange,
	onAttributesChange,
}: GallerySettingsProps) {
	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			spacing={1.5}
			sx={{
				flexDirection: { xs: "column", sm: "row" },
				alignItems: { xs: "stretch", sm: "center" },
			}}
		>
			<TextField
				label="Columns"
				type="number"
				slotProps={{ htmlInput: { min: 1, max: 6 } }}
				sx={{ width: 140 }}
				value={columns}
				onChange={(event) =>
					onAttributesChange?.({
						columns: Math.max(1, Math.min(6, Number(event.target.value ?? 3))),
					})
				}
			/>
			<TextField
				label="Max rows"
				type="number"
				slotProps={{ htmlInput: { min: 0, max: 20 } }}
				sx={{ width: 140 }}
				value={maxRows}
				onChange={(event) =>
					onAttributesChange?.({
						maxRows: Math.max(0, Math.min(20, Number(event.target.value ?? 0))),
					})
				}
			/>
			<Stack spacing={1}>
				{MEDIA_KINDS.map(({ kind, label }) => (
					<Button
						key={kind}
						size="small"
						variant="outlined"
						onClick={() => onContentChange?.(appendGalleryItem(content, kind))}
						disabled={readOnly}
					>
						{label}
					</Button>
				))}
			</Stack>
		</Stack>
	);
}
