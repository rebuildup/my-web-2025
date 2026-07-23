import type { Block } from "@/cms/types/blocks";

export type DropPosition = "before" | "after";

export interface DragOverInfo {
	id: string;
	position: DropPosition;
}

export interface BlockEditorProps {
	editorId: string;
	blocks: Block[];
	applyBlocks: (updater: (previous: Block[]) => Block[]) => void;
	readOnly?: boolean;
	onSelectBlock?: (blockId: string | null) => void;
	contentId?: string;
}
