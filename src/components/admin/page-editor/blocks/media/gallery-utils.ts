export type MediaKind = "image" | "video" | "audio" | "file";

export interface ParsedGalleryItem {
	kind: MediaKind;
	url: string;
	label?: string;
}

export function parseGalleryContent(text: string): ParsedGalleryItem[] {
	const lines = text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	const items: ParsedGalleryItem[] = [];

	for (const line of lines) {
		const typedUrl = line.match(/^\[(image|video|audio|file)\]\s+(.+)$/i);
		if (typedUrl) {
			items.push({
				kind: typedUrl[1].toLowerCase() as MediaKind,
				url: typedUrl[2],
			});
			continue;
		}

		const labeledUrl = line.match(
			/^([^|]+)\|\s*(image|video|audio|file)\s*\|\s*(.+)$/i,
		);
		if (labeledUrl) {
			items.push({
				kind: labeledUrl[2].toLowerCase() as MediaKind,
				url: labeledUrl[3],
				label: labeledUrl[1].trim(),
			});
			continue;
		}

		const lower = line.toLowerCase();
		if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp)(\?.*)?$/.test(lower)) {
			items.push({ kind: "image", url: line });
		} else if (/(\.mp4|\.webm|\.mov)(\?.*)?$/.test(lower)) {
			items.push({ kind: "video", url: line });
		} else if (/(\.mp3|\.wav|\.ogg)(\?.*)?$/.test(lower)) {
			items.push({ kind: "audio", url: line });
		} else {
			items.push({ kind: "file", url: line });
		}
	}

	return items;
}

export function getVisibleGalleryItemCount(
	itemCount: number,
	maxRows: number,
	columns: number,
): number {
	if (!maxRows || maxRows <= 0) return itemCount;
	const totalMd = 12;
	const colPerItemMd = Math.floor(totalMd / columns) || 3;
	const perRow = Math.floor(totalMd / colPerItemMd) || columns;
	return Math.min(itemCount, perRow * maxRows);
}

export function getGalleryColumnSpanClass(columns: number): string {
	const colSpan = Math.floor(12 / columns);
	if (colSpan === 12) return "col-span-2";
	if (colSpan === 6) return "col-span-1 sm:col-span-1";
	if (colSpan === 4 || colSpan === 3) {
		return "col-span-1 sm:col-span-1 md:col-span-1";
	}
	return "col-span-1";
}

export function appendGalleryItem(
	content: string | undefined,
	kind: MediaKind,
) {
	return `${content ? `${content}\n` : ""}[${kind}] `;
}

export function replaceGalleryLine(
	content: string | undefined,
	index: number,
	line: string,
): string {
	const lines = (content ?? "").split(/\r?\n/);
	lines[index] = line;
	return lines.join("\n");
}
