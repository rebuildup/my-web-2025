"use client";

import { BlockEditor } from "@/components/admin/page-editor/editor/BlockEditor";
import type { Block } from "@/cms/types/blocks";

export interface EditorCanvasProps {
 editorId: string;
 blocks: Block[];
 applyBlocks: (updater: (blocks: Block[]) => Block[]) => void;
 onSelectBlock: (blockId: string | null) => void;
 contentId: string;
}

export function EditorCanvas({
 editorId,
 blocks,
 applyBlocks,
 onSelectBlock,
 contentId,
}: EditorCanvasProps) {
 return (
 <BlockEditor
 editorId={editorId}
 blocks={blocks}
 applyBlocks={applyBlocks}
 readOnly={false}
 onSelectBlock={onSelectBlock}
 contentId={contentId}
 />
 );
}
