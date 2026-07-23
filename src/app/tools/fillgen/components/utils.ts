export const copyText = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
};

export const downloadFile = (content: string, filename: string) => {
	const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const sanitizeFilename = (name: string) => {
	return name
		.replace(/[<>:"/\\|?*]/g, "")
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]/g, "")
		.substring(0, 50);
};

export function getCaretScreenPosition(textarea: HTMLTextAreaElement) {
	const { selectionStart } = textarea;
	if (selectionStart === null) return null;

	const style = window.getComputedStyle(textarea);
	const fontSize = Number.parseFloat(style.fontSize || "16") || 16;
	const rawLineHeight = Number.parseFloat(style.lineHeight || "0");
	const lineHeight =
		Number.isNaN(rawLineHeight) || rawLineHeight === 0
			? fontSize * 1.2
			: rawLineHeight;
	const div = document.createElement("div");
	Array.from(style).forEach((prop) => {
		// @ts-expect-error dynamic access
		div.style[prop] = style[prop];
	});
	div.style.position = "absolute";
	div.style.visibility = "hidden";
	div.style.whiteSpace = "pre-wrap";
	div.style.wordBreak = "break-word";
	div.style.boxSizing = "border-box";
	div.style.width = `${textarea.clientWidth}px`;
	div.style.height = "auto";
	div.textContent = textarea.value.slice(0, selectionStart);

	const marker = document.createElement("span");
	marker.textContent = "​";
	div.appendChild(marker);

	document.body.appendChild(div);
	const markerRect = marker.getBoundingClientRect();
	const divRect = div.getBoundingClientRect();
	const taRect = textarea.getBoundingClientRect();
	document.body.removeChild(div);

	return {
		left: taRect.left + (markerRect.left - divRect.left) - textarea.scrollLeft,
		top:
			taRect.top +
			(markerRect.top - divRect.top) -
			textarea.scrollTop +
			lineHeight,
	};
}
