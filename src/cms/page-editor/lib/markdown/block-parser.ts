import {
	convertBlocksToMarkdown,
	convertMarkdownToBlocks,
} from "@/cms/page-editor/lib/conversion";
import type { Block } from "@/cms/types/blocks";

export function parseBlocks(markdown: string): Block[] {
	return convertMarkdownToBlocks(markdown);
}

export function stringifyBlocks(value: Block[]): string {
	return convertBlocksToMarkdown(value);
}
