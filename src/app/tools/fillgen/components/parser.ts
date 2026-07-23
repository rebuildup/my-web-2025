import type { Section, Block, Doc } from "./types";

export function parseDoc(text: string): Doc {
	const lines = text.split(/\r?\n/);
	let title = "Quiz";
	const blocks: Block[] = [];
	let currentBlock: Block | undefined;
	let currentSection: Section | undefined;
	let buffer: string[] = [];

	const flush = () => {
		if (currentSection && buffer.length) {
			currentSection.paragraphs.push(buffer.join(" "));
			buffer = [];
		}
	};

	lines.forEach((line) => {
		if (/^#\s+/.test(line)) {
			title = line.replace(/^#\s+/, "").trim();
		} else if (/^##\s+/.test(line)) {
			flush();
			currentSection = undefined;
			const header = line.replace(/^##\s+/, "").trim();
			currentBlock = { header, sections: [] };
			blocks.push(currentBlock);
		} else if (/^###\s+/.test(line)) {
			flush();
			if (!currentBlock) {
				currentBlock = { header: "", sections: [] };
				blocks.push(currentBlock);
			}
			const title2 = line.replace(/^###\s+/, "").trim();
			currentSection = { title: title2, paragraphs: [] };
			currentBlock.sections.push(currentSection);
		} else if (line.trim() === "") {
			flush();
		} else {
			buffer.push(line.trim());
		}
	});
	flush();
	return { title, blocks };
}

export function autoWidth(ans: string) {
	return Math.min(400, Math.max(60, ans.length * 14 + 24));
}

export function paragraphToHtml(text: string) {
	// React Compiler: avoid shared regex state by creating a fresh instance
	const placeholderRe = /\{\{([^}|]+)(?:\|([^}]+))?\}\}/g;
	return text.replace(placeholderRe, (_, ansRaw, width) => {
		const answers = ansRaw
			.split("/")
			.map((a: string) => a.trim())
			.filter(Boolean);
		const w =
			width && width.trim() !== "" ? width.trim() : `${autoWidth(answers[0])}`;
		return `<input class="blank" data-ans="${answers.join("|")}" data-base-width="${w}" style="width:${w}px">`;
	});
}
