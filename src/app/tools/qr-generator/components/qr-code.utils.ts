export type InputType = "url" | "text" | "email" | "phone" | "wifi";
export type ErrorLevel = "L" | "M" | "Q" | "H";

export interface QRRenderOptions {
	size: number;
	margin: number;
	errorLevel: ErrorLevel;
	foregroundColor: string;
	backgroundColor: string;
}

export function validateInput(text: string, type: string): boolean {
	if (!text) return false;
	switch (type) {
		case "url":
			return text.startsWith("http://") || text.startsWith("https://");
		case "email":
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
		case "phone":
			return /^[\d\+\-\(\)\s]+$/.test(text);
		case "wifi":
			return text.includes("WIFI:");
		default:
			return true;
	}
}

export function processInputTexts(
	inputText: string,
	isBulkMode: boolean,
): string[] {
	if (!inputText) return [];
	if (isBulkMode) {
		return inputText
			.split("\n")
			.map((t) => t.trim())
			.filter((t) => t.length > 0);
	}
	return [inputText.trim()];
}

export function generateQRFilename(
	ext: string,
	index: number,
	total: number,
): string {
	const base =
		total > 1 ? `qrcode_${index + 1}_${Date.now()}` : `qrcode_${Date.now()}`;
	return `${base}.${ext}`;
}

export function triggerDownload(url: string, filename: string): void {
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
