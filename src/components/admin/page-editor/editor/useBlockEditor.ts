import { nanoid } from "nanoid";
import {
	type DragEvent,
	type KeyboardEvent,
	type MouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { createInitialBlock } from "@/cms/page-editor/lib/editor/factory";
import type { Block, BlockType } from "@/cms/types/blocks";
import type { DragOverInfo, DropPosition } from "./block-editor-types";
import {
	isCaretAtEnd,
	isDomNode,
	loadConversionUtils,
	normalizeBlockContent,
	normalizeBlockContentOnTyping,
} from "./block-editor-utils";

interface UseBlockEditorOptions {
	blocks: Block[];
	applyBlocks: (updater: (previous: Block[]) => Block[]) => void;
	readOnly: boolean;
	onSelectBlock?: (blockId: string | null) => void;
}

export function useBlockEditor({
	blocks,
	applyBlocks,
	readOnly,
	onSelectBlock,
}: UseBlockEditorOptions) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [menuTarget, setMenuTarget] = useState<string | null>(null);
	const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
	const [addMenuTarget, setAddMenuTarget] = useState<string | null>(null);
	const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);
	const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

	useEffect(() => {
		if (!pendingFocusId) {
			return;
		}
		const timeout = window.setTimeout(() => setPendingFocusId(null), 300);
		return () => window.clearTimeout(timeout);
	}, [pendingFocusId]);

	const setActive = useCallback(
		(id: string | null) => {
			setActiveId(id);
			onSelectBlock?.(id);
		},
		[onSelectBlock],
	);

	const openHandleMenu = useCallback(
		(event: MouseEvent<HTMLButtonElement>, blockId: string) => {
			setMenuAnchor(event.currentTarget);
			setMenuTarget(blockId);
		},
		[],
	);

	const openAddMenu = useCallback(
		(event: MouseEvent<HTMLButtonElement>, blockId: string) => {
			setAddMenuAnchor(event.currentTarget);
			setAddMenuTarget(blockId);
		},
		[],
	);

	const updateContent = useCallback(
		(id: string, content: string) => {
			applyBlocks((previous) =>
				previous.map((block) =>
					block.id === id
						? normalizeBlockContentOnTyping(block, content)
						: block,
				),
			);
		},
		[applyBlocks],
	);

	const updateAttributes = useCallback(
		(id: string, attributes: Record<string, unknown>) => {
			applyBlocks((previous) =>
				previous.map((block) =>
					block.id === id
						? {
								...block,
								attributes: {
									...block.attributes,
									...attributes,
								},
							}
						: block,
				),
			);
		},
		[applyBlocks],
	);

	const moveBlock = useCallback(
		(sourceId: string, targetId: string, position: DropPosition) => {
			if (sourceId === targetId) {
				return;
			}
			applyBlocks((previous) => {
				const sourceIndex = previous.findIndex(
					(block) => block.id === sourceId,
				);
				const targetIndex = previous.findIndex(
					(block) => block.id === targetId,
				);
				if (sourceIndex === -1 || targetIndex === -1) {
					return previous;
				}

				const next = [...previous];
				const [moved] = next.splice(sourceIndex, 1);

				let insertIndex = targetIndex;
				if (targetIndex > sourceIndex) {
					insertIndex -= 1;
				}
				if (position === "after") {
					insertIndex += 1;
				}

				insertIndex = Math.max(0, Math.min(next.length, insertIndex));
				next.splice(insertIndex, 0, moved);
				return next;
			});
			setActive(sourceId);
		},
		[applyBlocks, setActive],
	);

	const removeBlock = useCallback(
		(id: string) => {
			applyBlocks((previous) => previous.filter((block) => block.id !== id));
		},
		[applyBlocks],
	);

	const insertBlockAfter = useCallback(
		(id: string | null, type: BlockType) => {
			applyBlocks((previous) => {
				const next = [...previous];
				const block = createInitialBlock(type);
				if (!id) {
					next.push(block);
					return next;
				}
				const index = previous.findIndex((item) => item.id === id);
				if (index === -1) {
					next.push(block);
					return next;
				}
				next.splice(index + 1, 0, block);
				return next;
			});
		},
		[applyBlocks],
	);

	const duplicateBlock = useCallback(
		(id: string) => {
			applyBlocks((previous) => {
				const index = previous.findIndex((item) => item.id === id);
				if (index === -1) {
					return previous;
				}
				const next = [...previous];
				const source = next[index];
				next.splice(index + 1, 0, {
					...source,
					id: nanoid(8),
					attributes: { ...source.attributes },
				});
				return next;
			});
		},
		[applyBlocks],
	);

	const handleDragStart = useCallback(
		(event: DragEvent<HTMLSpanElement>, blockId: string) => {
			if (readOnly) {
				return;
			}
			setDraggingId(blockId);
			setDragOverInfo(null);
			event.dataTransfer?.setData("application/x-editor-block-id", blockId);
			event.dataTransfer?.setDragImage?.(event.currentTarget, 16, 16);
			event.dataTransfer.effectAllowed = "move";
			setActive(blockId);
		},
		[readOnly, setActive],
	);

	const handleDragOver = useCallback(
		(event: DragEvent<HTMLDivElement>, blockId: string) => {
			if (readOnly || !draggingId || draggingId === blockId) {
				return;
			}
			event.preventDefault();
			const bounds = event.currentTarget.getBoundingClientRect();
			const isAfter = event.clientY > bounds.top + bounds.height / 2;
			const nextState: DragOverInfo = {
				id: blockId,
				position: isAfter ? "after" : "before",
			};
			setDragOverInfo((current) => {
				if (
					current &&
					current.id === nextState.id &&
					current.position === nextState.position
				) {
					return current;
				}
				return nextState;
			});
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = "move";
			}
		},
		[draggingId, readOnly],
	);

	const handleDrop = useCallback(
		(event: DragEvent<HTMLDivElement>, blockId: string) => {
			if (readOnly) {
				return;
			}
			event.preventDefault();
			const sourceId =
				event.dataTransfer?.getData("application/x-editor-block-id") ??
				draggingId;
			if (!sourceId || sourceId === blockId) {
				setDraggingId(null);
				setDragOverInfo(null);
				return;
			}
			const position =
				dragOverInfo?.id === blockId ? dragOverInfo.position : "after";
			moveBlock(sourceId, blockId, position);
			setDraggingId(null);
			setDragOverInfo(null);
		},
		[dragOverInfo, draggingId, moveBlock, readOnly],
	);

	const handleDragEnd = useCallback(() => {
		setDraggingId(null);
		setDragOverInfo(null);
	}, []);

	const handleDragLeave = useCallback(
		(event: DragEvent<HTMLDivElement>, blockId: string) => {
			const related = event.relatedTarget;
			if (!isDomNode(related) || !event.currentTarget.contains(related)) {
				setDragOverInfo((current) =>
					current?.id === blockId ? null : current,
				);
			}
		},
		[],
	);

	const handleKeyDown = useCallback(
		(blockId: string, event: KeyboardEvent<HTMLDivElement>) => {
			if (readOnly) {
				return;
			}

			// Backspace: 先頭で押したら、リストを段落+Markdownトークンに戻す
			if (
				event.key === "Backspace" &&
				!event.shiftKey &&
				!event.ctrlKey &&
				!event.metaKey
			) {
				const target = event.currentTarget;
				const selection = window.getSelection();
				const isAtStart = (() => {
					if (!selection || selection.rangeCount === 0) return false;
					const range = selection.getRangeAt(0).cloneRange();
					range.selectNodeContents(target);
					range.setEnd(selection.focusNode ?? target, selection.focusOffset);
					return range.toString().length === 0;
				})();
				const current = blocks.find((block) => block.id === blockId);
				const contentEmpty = (current?.content ?? "").length === 0;
				if (isAtStart || contentEmpty) {
					if (current?.type === "list") {
						event.preventDefault();
						const kind =
							(current.attributes.kind as string) ||
							(current.attributes.ordered
								? "ordered"
								: current.attributes.checked !== undefined
									? "todo"
									: "unordered");
						const order = (current.attributes.order as number) || 1;
						const prefix =
							kind === "todo"
								? current.attributes.checked
									? "[x] "
									: "[ ] "
								: kind === "ordered"
									? `${order}. `
									: "- ";
						applyBlocks((previous) =>
							previous.map((block) =>
								block.id === blockId
									? {
											...block,
											type: "paragraph",
											content: `${prefix}${block.content ?? ""}`,
											attributes: {},
										}
									: block,
							),
						);
						setPendingFocusId(blockId);
						setActive(blockId);
						return;
					}
					if (current?.type === "quote" || current?.type === "callout") {
						event.preventDefault();
						applyBlocks((previous) =>
							previous.map((block) =>
								block.id === blockId
									? {
											...block,
											type: "paragraph",
											content: `> ${block.content ?? ""}`,
											attributes: {},
										}
									: block,
							),
						);
						setPendingFocusId(blockId);
						setActive(blockId);
						return;
					}
				}
			}

			// スペース入力時もリスト変換を実行
			if (event.key !== "Enter" && event.key !== " ") {
				return;
			}
			if (event.key === "Enter" && event.shiftKey) {
				return;
			}

			const target = event.currentTarget;
			// Enter の場合は末尾でないと実行しない、スペースの場合は常に実行
			if (event.key === "Enter" && !isCaretAtEnd(target)) {
				return;
			}

			// Space: 現在のブロックをリストへ正規化するだけ（新規ブロックは作らない）
			if (event.key === " ") {
				const textContent = target.textContent ?? "";
				applyBlocks((previous) =>
					previous.map((block) =>
						block.id === blockId
							? normalizeBlockContent(block, textContent)
							: block,
					),
				);
				return;
			}

			// Enter: 従来通り、正規化＋必要なら次行を生成
			event.preventDefault();
			const textContent = target.textContent ?? "";
			let newBlock = createInitialBlock("paragraph");

			applyBlocks((previous) => {
				const index = previous.findIndex((block) => block.id === blockId);
				if (index === -1) {
					return previous;
				}
				const next = [...previous];
				const normalized = normalizeBlockContent(next[index], textContent);
				next[index] = normalized;

				// リストの場合は同種の次要素を自動生成
				if (normalized.type === "list") {
					const kind =
						(normalized.attributes.kind as string) ||
						(normalized.attributes.ordered
							? "ordered"
							: normalized.attributes.checked !== undefined
								? "todo"
								: "unordered");
					const currentOrder = (normalized.attributes.order as number) || 1;
					newBlock = {
						...createInitialBlock("list"),
						content: "",
						attributes:
							kind === "ordered"
								? { kind: "ordered", order: currentOrder + 1 }
								: kind === "todo"
									? { kind: "todo", checked: false }
									: { kind: "unordered" },
					} as Block;
				}

				next.splice(index + 1, 0, newBlock);
				return next;
			});

			setPendingFocusId(newBlock.id);
			setActive(newBlock.id);
		},
		[applyBlocks, readOnly, setActive, blocks],
	);

	const handleCloseMenu = useCallback(() => {
		setMenuAnchor(null);
		setMenuTarget(null);
	}, []);

	const handleCloseAddMenu = useCallback(() => {
		setAddMenuAnchor(null);
		setAddMenuTarget(null);
	}, []);

	const handleBlockMouseEnter = useCallback((blockId: string) => {
		setHoveredBlockId((current) => {
			// 既に同じブロックがホバーされている場合は更新しない
			if (current === blockId) {
				return current;
			}
			return blockId;
		});
	}, []);

	const handleBlockMouseLeave = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			// マウスが子要素に移動した場合はホバーを解除しない
			const relatedTarget = event.relatedTarget;
			const currentTarget = event.currentTarget;
			if (isDomNode(relatedTarget) && currentTarget.contains(relatedTarget)) {
				return;
			}
			setHoveredBlockId(null);
		},
		[],
	);

	const selectedBlockType = useMemo(
		() => blocks.find((block) => block.id === menuTarget)?.type,
		[blocks, menuTarget],
	);

	const copyBlockToClipboard = useCallback(
		async (id: string) => {
			const target = blocks.find((block) => block.id === id);
			if (!target) return;
			try {
				// 単一ブロックをMarkdown化してコピー
				const convertBlocksToMarkdown = await loadConversionUtils();
				const markdown = convertBlocksToMarkdown([target]);
				await navigator.clipboard.writeText(markdown);
			} catch {
				// フォールバックでJSON文字列
				try {
					await navigator.clipboard.writeText(JSON.stringify(target));
				} catch {}
			}
		},
		[blocks],
	);

	const convertBlockType = useCallback(
		(id: string, nextType: BlockType) => {
			applyBlocks((previous) =>
				previous.map((block) => {
					if (block.id !== id) return block;
					const {
						createEmptyBlock,
					} = require("@/cms/page-editor/lib/conversion");
					const defaults = createEmptyBlock(nextType);
					return {
						...block,
						type: nextType,
						attributes: defaults.attributes,
					} as Block;
				}),
			);
		},
		[applyBlocks],
	);

	return {
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
	};
}
