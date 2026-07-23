import type { Block } from "@/cms/types/blocks";

export async function loadConversionUtils() {
	const conversionModule = await import("@/cms/page-editor/lib/conversion");
	return conversionModule.convertBlocksToMarkdown;
}

export function isDomNode(target: EventTarget | null): target is Node {
	if (typeof window === "undefined" || typeof Node === "undefined") {
		return false;
	}
	return target instanceof Node;
}

export function normalizeBlockContent(block: Block, content: string): Block {
	const sanitized = content.replace(/ /g, " ");

	if (block.type === "paragraph") {
		return transformParagraphBlock(block, sanitized);
	}

	if (block.type === "heading") {
		if (/^\s*#{1,6}\s+/.test(sanitized)) {
			return {
				...block,
				content: sanitized,
			};
		}
		return {
			...block,
			type: "paragraph",
			content: sanitized,
			attributes: {},
		};
	}

	return {
		...block,
		content: sanitized,
	};
}

export function normalizeBlockContentOnTyping(
	block: Block,
	content: string,
): Block {
	const sanitized = content.replace(/ /g, " ");

	if (block.type === "paragraph") {
		return transformParagraphBlockOnTyping(block, sanitized);
	}

	if (block.type === "heading") {
		if (/^\s*#{1,6}\s+/.test(sanitized)) {
			return {
				...block,
				content: sanitized,
			};
		}
		return {
			...block,
			type: "paragraph",
			content: sanitized,
			attributes: {},
		};
	}

	return {
		...block,
		content: sanitized,
	};
}

function transformParagraphBlock(block: Block, content: string): Block {
	const trimmed = content.trimStart();

	if (!trimmed) {
		return {
			...block,
			type: "paragraph",
			content: "",
			attributes: {},
		};
	}

	const headingMatch = trimmed.match(/^(#{1,6})\s+\S/);
	if (headingMatch) {
		const level = headingMatch[1].length;
		return {
			...block,
			type: "heading",
			content,
			attributes: {
				level,
			},
		};
	}

	// リスト自動変換（半角スペース必須）
	// チェックリスト [ ] / [x]
	const todoMatch = trimmed.match(/^\[( |x|X)\]\s+(.*)$/);
	if (todoMatch) {
		return {
			...block,
			type: "list",
			content: todoMatch[2],
			attributes: { kind: "todo", checked: todoMatch[1].toLowerCase() === "x" },
		};
	}

	// ドットリスト -, *, +
	const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
	if (unorderedMatch) {
		return {
			...block,
			type: "list",
			content: unorderedMatch[1],
			attributes: { kind: "unordered" },
		};
	}

	// 数字リスト 1.
	const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
	if (orderedMatch) {
		const order = parseInt(orderedMatch[1] ?? "1", 10) || 1;
		return {
			...block,
			type: "list",
			content: orderedMatch[2],
			attributes: { kind: "ordered", order },
		};
	}

	// Divider: --- のみの行を区切り線に変換
	if (/^---+$/.test(trimmed)) {
		return {
			...block,
			type: "divider",
			content: "",
			attributes: {},
		};
	}

	// Callout: "> [!NOTE]" のような記述を含む場合、callout ブロックに変換（1行目はそのまま保持）
	if (/^>\s*\[!(NOTE|WARNING|CALLOUT|TIP|CAUTION|IMPORTANT)\]/i.test(content)) {
		// 先頭の "> " を取り除いて [!TYPE] は保持
		const withoutArrow = content.replace(/^>\s*/, "");
		return {
			...block,
			type: "callout",
			content: withoutArrow,
			attributes: {},
		};
	}

	// 引用 > で始まる場合は Quote ブロックに変換（全文1ブロック）
	const quoteMatch = trimmed.match(/^>\s+(.*)$/);
	if (quoteMatch) {
		return {
			...block,
			type: "quote",
			content: quoteMatch[1],
			attributes: {},
		};
	}

	return {
		...block,
		type: "paragraph",
		content,
		attributes: {},
	};
}

function transformParagraphBlockOnTyping(block: Block, content: string): Block {
	const trimmed = content.trimStart();

	if (!trimmed) {
		return {
			...block,
			type: "paragraph",
			content: "",
			attributes: {},
		};
	}

	const headingMatch = trimmed.match(/^(#{1,6})\s+\S/);
	if (headingMatch) {
		const level = headingMatch[1].length;
		return {
			...block,
			type: "heading",
			content,
			attributes: { level },
		};
	}

	// タイピング中はリスト自動変換を行わない（タグ編集を妨げないため）
	return {
		...block,
		type: "paragraph",
		content,
		attributes: {},
	};
}

export function isCaretAtEnd(element: HTMLElement): boolean {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) {
		return false;
	}

	const focusNode = selection.focusNode;
	if (!focusNode || !element.contains(focusNode)) {
		return false;
	}

	const range = selection.getRangeAt(0).cloneRange();
	range.selectNodeContents(element);
	range.setStart(focusNode, selection.focusOffset);

	const remaining = range.toString();
	return remaining.length === 0;
}
