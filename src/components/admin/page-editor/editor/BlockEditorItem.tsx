import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import { Box, Stack } from "@mui/material";
import type { DragEvent, KeyboardEvent, MouseEvent } from "react";
import type { Block } from "@/cms/types/blocks";
import type { BlockRenderer } from "./block-editor-config";
import type { DropPosition } from "./block-editor-types";

interface BlockEditorItemProps {
	block: Block;
	Component: BlockRenderer;
	readOnly: boolean;
	contentId?: string;
	isActive: boolean;
	isDragging: boolean;
	dropIndicator: DropPosition | null;
	isHovered: boolean;
	autoFocus: boolean;
	onSelect: (blockId: string) => void;
	onMouseEnter: (blockId: string) => void;
	onMouseLeave: (event: MouseEvent<HTMLDivElement>) => void;
	onDragStart: (event: DragEvent<HTMLSpanElement>, blockId: string) => void;
	onDragOver: (event: DragEvent<HTMLDivElement>, blockId: string) => void;
	onDragLeave: (event: DragEvent<HTMLDivElement>, blockId: string) => void;
	onDrop: (event: DragEvent<HTMLDivElement>, blockId: string) => void;
	onDragEnd: () => void;
	onOpenHandleMenu: (
		event: MouseEvent<HTMLButtonElement>,
		blockId: string,
	) => void;
	onOpenAddMenu: (
		event: MouseEvent<HTMLButtonElement>,
		blockId: string,
	) => void;
	onContentChange: (blockId: string, content: string) => void;
	onAttributesChange: (
		blockId: string,
		attributes: Record<string, unknown>,
	) => void;
	onKeyDown: (blockId: string, event: KeyboardEvent<HTMLDivElement>) => void;
}

export function BlockEditorItem({
	block,
	Component,
	readOnly,
	contentId,
	isActive,
	isDragging,
	dropIndicator,
	isHovered,
	autoFocus,
	onSelect,
	onMouseEnter,
	onMouseLeave,
	onDragStart,
	onDragOver,
	onDragLeave,
	onDrop,
	onDragEnd,
	onOpenHandleMenu,
	onOpenAddMenu,
	onContentChange,
	onAttributesChange,
	onKeyDown,
}: BlockEditorItemProps) {
	const supportsKeyboardShortcuts =
		block.type === "paragraph" ||
		block.type === "heading" ||
		block.type === "list";
	const handleBlockKeyDown = supportsKeyboardShortcuts
		? (event: KeyboardEvent<HTMLDivElement>) => onKeyDown(block.id, event)
		: undefined;
	const showControls = !readOnly && (isHovered || isActive);

	return (
		<Box
			onClick={() => onSelect(block.id)}
			onMouseEnter={(event) => {
				// イベントバブリングを防ぐ
				event.stopPropagation();
				onMouseEnter(block.id);
			}}
			onMouseLeave={(event) => {
				// イベントバブリングを防ぐ
				event.stopPropagation();
				onMouseLeave(event);
			}}
			onDragEnter={(event) => onDragOver(event, block.id)}
			onDragOver={(event) => onDragOver(event, block.id)}
			onDragLeave={(event) => onDragLeave(event, block.id)}
			onDrop={(event) => onDrop(event, block.id)}
			sx={{
				position: "relative",
				display: "flex",
				alignItems: "stretch",
				gap: readOnly ? 0 : 1.5,
				px: readOnly ? 0 : 1,
				py: readOnly ? 0.75 : 1.25,
				borderRadius: readOnly ? 0 : 1,
				bgcolor: readOnly
					? "transparent"
					: isActive
						? "action.hover"
						: "rgba(255,255,255,0.02)",
				cursor: readOnly ? "default" : "text",
				opacity: isDragging ? 0.4 : 1,
				transition: readOnly
					? "none"
					: "background-color 0.2s ease, opacity 0.2s ease",
				boxShadow: readOnly
					? undefined
					: dropIndicator === "before"
						? (theme) => `inset 0 2px 0 ${theme.palette.primary.main}`
						: dropIndicator === "after"
							? (theme) => `inset 0 -2px 0 ${theme.palette.primary.main}`
							: undefined,
				"&:not(:last-of-type)": {
					borderBottom: readOnly
						? "1px solid rgba(242, 242, 242, 0.1)"
						: (theme) => `1px solid ${theme.palette.divider}`,
				},
			}}
			data-block-id={block.id}
		>
			{showControls && (
				<Box
					component="button"
					aria-label="Block handle"
					draggable
					tabIndex={0}
					onClick={(event) =>
						onOpenHandleMenu(
							event as unknown as MouseEvent<HTMLButtonElement>,
							block.id,
						)
					}
					onDragStart={(event) => onDragStart(event, block.id)}
					onDragEnd={onDragEnd}
					sx={{
						position: "absolute",
						top: 8,
						left: -36,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "transparent",
						border: 0,
						padding: 0,
						lineHeight: 0,
						width: 28,
						height: 28,
						cursor: "grab",
						color: isActive ? "text.primary" : "text.secondary",
						"&:active": { cursor: "grabbing" },
					}}
				>
					<DragIndicatorRoundedIcon fontSize="small" />
				</Box>
			)}
			{showControls && (
				<Box
					component="button"
					aria-label="Add block"
					tabIndex={0}
					onClick={(event) =>
						onOpenAddMenu(
							event as unknown as MouseEvent<HTMLButtonElement>,
							block.id,
						)
					}
					sx={{
						position: "absolute",
						top: 8,
						left: -64,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "transparent",
						border: 0,
						padding: 0,
						lineHeight: 0,
						width: 28,
						height: 28,
						cursor: "pointer",
						color: isActive ? "text.primary" : "text.secondary",
					}}
				>
					<AddRoundedIcon fontSize="small" />
				</Box>
			)}
			<Stack spacing={1} sx={{ flex: 1, px: 0, py: 0, position: "relative" }}>
				<Box sx={{ px: 0.5, py: 0.25 }}>
					<Component
						block={block}
						readOnly={readOnly}
						contentId={contentId}
						onContentChange={(content) => onContentChange(block.id, content)}
						onAttributesChange={(attributes) =>
							onAttributesChange(block.id, attributes)
						}
						autoFocus={autoFocus}
						onKeyDown={handleBlockKeyDown}
					/>
				</Box>
			</Stack>
		</Box>
	);
}
