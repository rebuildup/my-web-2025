import { GripVertical, Plus } from "lucide-react";
import type { DragEvent, KeyboardEvent, MouseEvent } from "react";
import type { Block } from "@/cms/types/blocks";
import { adminColor } from "@/components/admin/ui/tokens";
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

const buttonStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	background: "transparent",
	border: 0,
	padding: 0,
	lineHeight: 0,
	width: 24,
	height: 24,
	borderRadius: 6,
	cursor: "pointer",
};

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

	const wrapperStyle: React.CSSProperties = {
		position: "relative",
		display: "flex",
		alignItems: "stretch",
		gap: readOnly ? 0 : 12,
		paddingLeft: readOnly ? 0 : 8,
		paddingRight: readOnly ? 0 : 8,
		paddingTop: readOnly ? 6 : 10,
		paddingBottom: readOnly ? 6 : 10,
		borderRadius: readOnly ? 0 : 4,
		backgroundColor: readOnly
			? "transparent"
			: isActive
				? adminColor.accentHover
				: "transparent",
		cursor: readOnly ? "default" : "text",
		opacity: isDragging ? 0.4 : 1,
		transition: readOnly
			? "none"
			: "background-color 0.2s ease, opacity 0.2s ease",
		boxShadow: readOnly
			? undefined
			: dropIndicator === "before"
				? "inset 0 2px 0 #2c7be5"
				: dropIndicator === "after"
					? "inset 0 -2px 0 #2c7be5"
					: undefined,
	};

	const dividerStyle: React.CSSProperties = {
		borderBottom: readOnly
			? "1px solid rgba(242, 242, 242, 0.1)"
			: `1px solid ${adminColor.border}`,
	};

	const activeColor = isActive
		? adminColor.textPrimary
		: adminColor.textSecondary;
	const hoverStyle = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.currentTarget.style.background = adminColor.accentHover;
	};
	const clearHoverStyle = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.currentTarget.style.background = "transparent";
	};

	return (
		<div
			onClick={() => onSelect(block.id)}
			onMouseEnter={(event) => {
				event.stopPropagation();
				onMouseEnter(block.id);
			}}
			onMouseLeave={(event) => {
				event.stopPropagation();
				onMouseLeave(event);
			}}
			onDragEnter={(event) => onDragOver(event, block.id)}
			onDragOver={(event) => onDragOver(event, block.id)}
			onDragLeave={(event) => onDragLeave(event, block.id)}
			onDrop={(event) => onDrop(event, block.id)}
			style={wrapperStyle}
			data-block-id={block.id}
			className="block-editor-item"
		>
			<style>{`.block-editor-item:not(:last-of-type) { ${objectToStyleString(dividerStyle)} }`}</style>
			{showControls ? (
				<div
					style={{
						display: "flex",
						flexShrink: 0,
						width: 28,
						paddingTop: 2,
						alignItems: "center",
						flexDirection: "column",
						gap: 2,
					}}
				>
					<button
						type="button"
						aria-label="Add block"
						tabIndex={0}
						onClick={(event) =>
							onOpenAddMenu(
								event as unknown as MouseEvent<HTMLButtonElement>,
								block.id,
							)
						}
						style={{ ...buttonStyle, color: activeColor }}
						onMouseEnter={hoverStyle}
						onMouseLeave={clearHoverStyle}
					>
						<Plus size={16} />
					</button>
					<button
						type="button"
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
						style={{ ...buttonStyle, color: activeColor, cursor: "grab" }}
						onMouseEnter={hoverStyle}
						onMouseLeave={clearHoverStyle}
					>
						<GripVertical size={16} />
					</button>
				</div>
			) : (
				<div style={{ flexShrink: 0, width: 28 }} />
			)}
			<div
				style={{
					flex: 1,
					padding: 0,
					position: "relative",
					minWidth: 0,
				}}
			>
				<div
					style={{
						paddingLeft: 2,
						paddingRight: 2,
						paddingTop: 1,
						paddingBottom: 1,
					}}
				>
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
				</div>
			</div>
		</div>
	);
}

function objectToStyleString(obj: React.CSSProperties): string {
	return Object.entries(obj)
		.map(([key, value]) => `${camelToKebab(key)}: ${value};`)
		.join(" ");
}

function camelToKebab(str: string): string {
	return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
