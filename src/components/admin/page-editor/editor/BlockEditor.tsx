"use client";

import { Stack } from "@mui/material";
import { BLOCK_COMPONENTS } from "./block-editor-config";
import type { BlockEditorProps } from "./block-editor-types";
import { BlockEditorItem } from "./BlockEditorItem";
import { BlockEditorMenus } from "./BlockEditorMenus";
import { UnknownBlock } from "./UnknownBlock";
import { useBlockEditor } from "./useBlockEditor";

export function BlockEditor({
	editorId,
	blocks,
	applyBlocks,
	readOnly = false,
	onSelectBlock,
	contentId,
}: BlockEditorProps) {
	const {
		activeId,
		menuAnchor,
		menuTarget,
		addMenuAnchor,
		addMenuTarget,
		hoveredBlockId,
		draggingId,
		dragOverInfo,
		pendingFocusId,
		selectedBlockType,
		setActive,
		openHandleMenu,
		openAddMenu,
		updateContent,
		updateAttributes,
		removeBlock,
		insertBlockAfter,
		duplicateBlock,
		handleDragStart,
		handleDragOver,
		handleDrop,
		handleDragEnd,
		handleDragLeave,
		handleKeyDown,
		handleCloseMenu,
		handleCloseAddMenu,
		handleBlockMouseEnter,
		handleBlockMouseLeave,
		copyBlockToClipboard,
		convertBlockType,
	} = useBlockEditor({ blocks, applyBlocks, readOnly, onSelectBlock });

	return (
		<Stack
			spacing={readOnly ? 0 : 2}
			{...(editorId && { "data-editor-id": editorId })}
			sx={{
				position: "relative",
				maxWidth: readOnly ? "100%" : 768,
				mx: "auto",
				width: "100%",
				bgcolor: "transparent",
			}}
		>
			{blocks.map((block) => {
				const Component = BLOCK_COMPONENTS[block.type] ?? UnknownBlock;
				return (
					<BlockEditorItem
						key={block.id}
						block={block}
						Component={Component}
						readOnly={readOnly}
						contentId={contentId}
						isActive={block.id === activeId}
						isDragging={draggingId === block.id}
						dropIndicator={
							dragOverInfo?.id === block.id ? dragOverInfo.position : null
						}
						isHovered={hoveredBlockId === block.id}
						autoFocus={block.id === pendingFocusId}
						onSelect={setActive}
						onMouseEnter={handleBlockMouseEnter}
						onMouseLeave={handleBlockMouseLeave}
						onDragStart={handleDragStart}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onDragEnd={handleDragEnd}
						onOpenHandleMenu={openHandleMenu}
						onOpenAddMenu={openAddMenu}
						onContentChange={updateContent}
						onAttributesChange={updateAttributes}
						onKeyDown={handleKeyDown}
					/>
				);
			})}

			<BlockEditorMenus
				menuAnchor={menuAnchor}
				menuTarget={menuTarget}
				addMenuAnchor={addMenuAnchor}
				addMenuTarget={addMenuTarget}
				selectedBlockType={selectedBlockType}
				blockCount={blocks.length}
				onDuplicateBlock={duplicateBlock}
				onRemoveBlock={removeBlock}
				onCopyBlock={(blockId) => void copyBlockToClipboard(blockId)}
				onConvertBlockType={convertBlockType}
				onInsertBlockAfter={insertBlockAfter}
				onCloseMenu={handleCloseMenu}
				onCloseAddMenu={handleCloseAddMenu}
			/>
		</Stack>
	);
}
