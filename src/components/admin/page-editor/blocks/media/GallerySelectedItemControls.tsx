import { Stack, TextField } from "@mui/material";
import { replaceGalleryLine, type ParsedGalleryItem } from "./gallery-utils";

interface GallerySelectedItemControlsProps {
	content?: string;
	item: ParsedGalleryItem;
	selected: number;
	onContentChange?: (content: string) => void;
}

export function GallerySelectedItemControls({
	content,
	item,
	selected,
	onContentChange,
}: GallerySelectedItemControlsProps) {
	const updateLine = (line: string) => {
		onContentChange?.(replaceGalleryLine(content, selected, line));
	};

	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			spacing={1.5}
			sx={{
				flexDirection: { xs: "column", sm: "row" },
				alignItems: { xs: "stretch", sm: "center" },
			}}
		>
			{item.kind === "image" && (
				<>
					<TextField
						label="URL"
						fullWidth
						defaultValue={item.url}
						onBlur={(event) => updateLine(`[image] ${event.target.value}`)}
					/>
					<TextField
						label="Alt (label)"
						fullWidth
						defaultValue={item.label ?? ""}
						onBlur={(event) =>
							updateLine(
								`${event.target.value || item.url} | image | ${item.url}`,
							)
						}
					/>
				</>
			)}
			{item.kind === "video" && (
				<TextField
					label="URL"
					fullWidth
					defaultValue={item.url}
					onBlur={(event) => updateLine(`[video] ${event.target.value}`)}
				/>
			)}
			{item.kind === "audio" && (
				<TextField
					label="URL"
					fullWidth
					defaultValue={item.url}
					onBlur={(event) => updateLine(`[audio] ${event.target.value}`)}
				/>
			)}
			{item.kind === "file" && (
				<>
					<TextField
						label="Name"
						fullWidth
						defaultValue={item.label ?? ""}
						onBlur={(event) =>
							updateLine(
								`${event.target.value || item.url} | file | ${item.url}`,
							)
						}
					/>
					<TextField
						label="URL"
						fullWidth
						defaultValue={item.url}
						onBlur={(event) =>
							updateLine(
								`${item.label ?? ""} | file | ${event.target.value}`.trim(),
							)
						}
					/>
				</>
			)}
		</Stack>
	);
}
