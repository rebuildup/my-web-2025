"use client";

import {
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { adminColor, adminRadius, adminShadow } from "./tokens";
import { useClickAway } from "./useClickAway";

export type MenuItemDescriptor = {
	disabled?: boolean;
	divider?: boolean;
};

export type ContextMenuItem = MenuItemDescriptor & {
	key: string;
	label: ReactNode;
	onSelect?: () => void;
};

export function computeMenuRect(
	anchor: { top: number; bottom: number; left: number; height: number } | null,
	menu: { width: number; height: number },
	viewport: { width: number; height: number },
	gap = 4,
	edge = 8,
): { top: number; left: number } {
	if (!anchor) return { top: 0, left: 0 };
	const below = anchor.bottom + gap;
	const flips = below + menu.height > viewport.height;
	const top = flips ? Math.max(edge, anchor.top - menu.height - gap) : below;
	const idealLeft = anchor.left;
	const maxLeft = Math.max(edge, viewport.width - menu.width - edge);
	const left = Math.min(Math.max(edge, idealLeft), maxLeft);
	return { top, left };
}

export function nextIndex(
	current: number,
	items: MenuItemDescriptor[],
	dir: 1 | -1 | "home" | "end",
): number {
	if (items.length === 0) return -1;
	const enabled = (i: number) => !items[i]?.disabled && !items[i]?.divider;
	if (dir === "home") {
		for (let i = 0; i < items.length; i++) if (enabled(i)) return i;
		return -1;
	}
	if (dir === "end") {
		for (let i = items.length - 1; i >= 0; i--) if (enabled(i)) return i;
		return -1;
	}
	const startFrom =
		current < 0 ? (dir === 1 ? 0 : items.length - 1) : current + dir;
	const search = (from: number): number => {
		let i = from;
		while (i >= 0 && i < items.length) {
			if (enabled(i)) return i;
			i += dir;
		}
		return -1;
	};
	const primary = search(startFrom);
	if (primary >= 0) return primary;
	const wrapFrom = dir === 1 ? 0 : items.length - 1;
	if (wrapFrom === startFrom) return current >= 0 ? current : -1;
	return search(wrapFrom);
}

export interface ContextMenuProps {
	open: boolean;
	anchorRect: DOMRect | null;
	onClose: () => void;
	items: ContextMenuItem[];
	ariaLabel?: string;
	menuMinWidth?: number;
}

const menuStyle: CSSProperties = {
	position: "fixed",
	background: adminColor.bgPanel,
	border: `1px solid ${adminColor.border}`,
	borderRadius: adminRadius.md,
	boxShadow: adminShadow.menu,
	padding: 4,
	minWidth: 160,
	zIndex: 2000,
	display: "flex",
	flexDirection: "column",
	gap: 2,
	color: adminColor.textPrimary,
	fontSize: "0.85rem",
	outline: "none",
};

const rowStyle: CSSProperties = {
	appearance: "none",
	background: "transparent",
	border: 0,
	padding: "8px 12px",
	font: "inherit",
	color: "inherit",
	textAlign: "left",
	width: "100%",
	borderRadius: adminRadius.sm,
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	gap: 8,
};

const rowDisabledStyle: CSSProperties = {
	color: adminColor.textDisabled,
	cursor: "not-allowed",
};

const rowFocusedStyle: CSSProperties = {
	background: adminColor.accentHover,
};

const dividerStyle: CSSProperties = {
	height: 1,
	background: adminColor.border,
	margin: "4px 6px",
};

const dividerHeaderStyle: CSSProperties = {
	...rowStyle,
	...rowDisabledStyle,
	fontWeight: 600,
	fontSize: "0.75rem",
	textTransform: "uppercase",
	letterSpacing: 0.5,
	padding: "6px 12px 2px",
	cursor: "default",
};

export function ContextMenu({
	open,
	anchorRect,
	onClose,
	items,
	ariaLabel,
	menuMinWidth = 160,
}: ContextMenuProps) {
	const ref = useRef<HTMLDivElement | null>(null);
	const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const [focusIndex, setFocusIndex] = useState(-1);
	const [measured, setMeasured] = useState<{
		width: number;
		height: number;
	} | null>(null);

	useEffect(() => {
		if (!open) {
			setFocusIndex(-1);
			setMeasured(null);
		}
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const node = ref.current;
		if (!node) return;
		const rect = node.getBoundingClientRect();
		setMeasured({ width: rect.width, height: rect.height });
	}, [open, items.length]);

	useEffect(() => {
		if (!open || focusIndex < 0) return;
		const el = itemRefs.current[focusIndex];
		if (el && !el.disabled) el.focus();
	}, [focusIndex, open]);

	const handleKeyDown = useCallback(
		(event: ReactKeyboardEvent<HTMLDivElement>) => {
			if (event.key === "Tab") {
				onClose();
				return;
			}
			const total = items.length;
			if (total === 0) return;
			const enabled = (i: number) => !items[i]?.disabled && !items[i]?.divider;
			const findFrom = (from: number, step: 1 | -1): number => {
				let i = from;
				while (i >= 0 && i < total) {
					if (enabled(i)) return i;
					i += step;
				}
				return -1;
			};
			let next = -1;
			switch (event.key) {
				case "ArrowDown":
					next = focusIndex < 0 ? findFrom(0, 1) : findFrom(focusIndex + 1, 1);
					if (next < 0) next = findFrom(0, 1);
					break;
				case "ArrowUp":
					next =
						focusIndex < 0
							? findFrom(total - 1, -1)
							: findFrom(focusIndex - 1, -1);
					if (next < 0) next = findFrom(total - 1, -1);
					break;
				case "Home":
					next = findFrom(0, 1);
					break;
				case "End":
					next = findFrom(total - 1, -1);
					break;
				default:
					return;
			}
			event.preventDefault();
			if (next >= 0) setFocusIndex(next);
		},
		[focusIndex, items, onClose],
	);

	useClickAway(ref, open, onClose);

	if (!open) return null;

	const viewport =
		typeof window === "undefined"
			? { width: 1280, height: 800 }
			: { width: window.innerWidth, height: window.innerHeight };
	const position = computeMenuRect(
		anchorRect
			? {
					top: anchorRect.top,
					bottom: anchorRect.bottom,
					left: anchorRect.left,
					height: anchorRect.height,
				}
			: null,
		measured ?? { width: menuMinWidth, height: 200 },
		viewport,
	);

	return (
		<div
			ref={ref}
			role="menu"
			aria-label={ariaLabel}
			tabIndex={-1}
			onKeyDown={handleKeyDown}
			style={{
				...menuStyle,
				minWidth: menuMinWidth,
				top: position.top,
				left: position.left,
			}}
		>
			{items.map((item, idx) => {
				const isPureDivider =
					!!item.divider &&
					(item.label === undefined ||
						item.label === null ||
						item.label === false);
				if (isPureDivider) {
					return <div key={item.key} role="separator" style={dividerStyle} />;
				}
				const setItemRef = (el: HTMLButtonElement | null) => {
					itemRefs.current[idx] = el;
				};
				const handleClick = () => {
					if (item.disabled || item.divider) return;
					item.onSelect?.();
					onClose();
				};
				const handleFocus = () => setFocusIndex(idx);
				const focused = focusIndex === idx;
				const styleForItem: CSSProperties = item.divider
					? dividerHeaderStyle
					: {
							...rowStyle,
							...(item.disabled ? rowDisabledStyle : {}),
							...(focused && !item.disabled ? rowFocusedStyle : {}),
						};
				return (
					<button
						key={item.key}
						ref={setItemRef}
						type="button"
						role="menuitem"
						disabled={!!item.disabled || !!item.divider}
						aria-disabled={item.disabled || item.divider ? true : undefined}
						onClick={handleClick}
						onFocus={handleFocus}
						style={styleForItem}
					>
						{item.label}
					</button>
				);
			})}
		</div>
	);
}
