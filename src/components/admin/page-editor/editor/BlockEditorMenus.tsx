import type { BlockType } from "@/cms/types/blocks";
import {
	ContextMenu,
	type ContextMenuItem,
} from "@/components/admin/ui/ContextMenu";
import { AVAILABLE_INSERT_TYPES } from "./block-editor-config";

interface BlockEditorMenusProps {
	menuAnchor: HTMLElement | null;
	menuTarget: string | null;
	addMenuAnchor: HTMLElement | null;
	addMenuTarget: string | null;
	selectedBlockType?: BlockType;
	blockCount: number;
	onDuplicateBlock: (blockId: string) => void;
	onRemoveBlock: (blockId: string) => void;
	onCopyBlock: (blockId: string) => void;
	onConvertBlockType: (blockId: string, nextType: BlockType) => void;
	onInsertBlockAfter: (blockId: string | null, type: BlockType) => void;
	onCloseMenu: () => void;
	onCloseAddMenu: () => void;
}

export function BlockEditorMenus({
	menuAnchor,
	menuTarget,
	addMenuAnchor,
	addMenuTarget,
	selectedBlockType,
	blockCount,
	onDuplicateBlock,
	onRemoveBlock,
	onCopyBlock,
	onConvertBlockType,
	onInsertBlockAfter,
	onCloseMenu,
	onCloseAddMenu,
}: BlockEditorMenusProps) {
	const handleItems: ContextMenuItem[] = [
		{
			key: "duplicate",
			label: "Duplicate block",
			onSelect: () => menuTarget && onDuplicateBlock(menuTarget),
		},
		{
			key: "delete",
			label: "Delete block",
			disabled: blockCount === 1,
			onSelect: () => menuTarget && onRemoveBlock(menuTarget),
		},
		{
			key: "copy",
			label: "Copy block",
			onSelect: () => menuTarget && onCopyBlock(menuTarget),
		},
		{
			key: "convert-header",
			label: "Convert to",
			divider: true,
		},
		...AVAILABLE_INSERT_TYPES.filter((type) => type !== selectedBlockType).map(
			(type) => ({
				key: `convert-${type}`,
				label: type,
				onSelect: () => menuTarget && onConvertBlockType(menuTarget, type),
			}),
		),
	];

	const insertItems: ContextMenuItem[] = AVAILABLE_INSERT_TYPES.map((type) => ({
		key: `add-${type}`,
		label: type,
		onSelect: () => onInsertBlockAfter(addMenuTarget, type),
	}));

	return (
		<>
			<ContextMenu
				open={Boolean(menuAnchor)}
				anchorRect={menuAnchor ? menuAnchor.getBoundingClientRect() : null}
				onClose={onCloseMenu}
				items={handleItems}
				ariaLabel="Block actions"
			/>
			<ContextMenu
				open={Boolean(addMenuAnchor)}
				anchorRect={
					addMenuAnchor ? addMenuAnchor.getBoundingClientRect() : null
				}
				onClose={onCloseAddMenu}
				items={insertItems}
				ariaLabel="Insert block"
			/>
		</>
	);
}
