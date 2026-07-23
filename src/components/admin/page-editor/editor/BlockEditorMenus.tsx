import { Menu, MenuItem } from "@mui/material";
import type { BlockType } from "@/cms/types/blocks";
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
	return (
		<>
			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={onCloseMenu}
				slotProps={{
					paper: { sx: { bgcolor: "background.paper" } },
				}}
			>
				<MenuItem
					onClick={() => {
						if (menuTarget) onDuplicateBlock(menuTarget);
						onCloseMenu();
					}}
				>
					Duplicate block
				</MenuItem>
				<MenuItem
					disabled={blockCount === 1}
					onClick={() => {
						if (menuTarget) onRemoveBlock(menuTarget);
						onCloseMenu();
					}}
				>
					Delete block
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (menuTarget) onCopyBlock(menuTarget);
						onCloseMenu();
					}}
				>
					Copy block
				</MenuItem>
				<MenuItem disabled divider>
					Convert to
				</MenuItem>
				{AVAILABLE_INSERT_TYPES.filter(
					(type) => type !== selectedBlockType,
				).map((type) => (
					<MenuItem
						key={`convert-${type}`}
						onClick={() => {
							if (menuTarget) onConvertBlockType(menuTarget, type);
							onCloseMenu();
						}}
					>
						{type}
					</MenuItem>
				))}
			</Menu>

			<Menu
				anchorEl={addMenuAnchor}
				open={Boolean(addMenuAnchor)}
				onClose={onCloseAddMenu}
				slotProps={{
					paper: { sx: { bgcolor: "background.paper" } },
				}}
			>
				{AVAILABLE_INSERT_TYPES.map((type) => (
					<MenuItem
						key={`add-${type}`}
						onClick={() => {
							onInsertBlockAfter(addMenuTarget, type);
							onCloseAddMenu();
						}}
					>
						{type}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
