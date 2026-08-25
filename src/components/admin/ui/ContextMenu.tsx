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
import { computeMenuRect, type MenuItemDescriptor } from "./context-menu-utils";
import { adminColor, adminRadius, adminShadow } from "./tokens";
import { useClickAway } from "./useClickAway";

export type { MenuItemDescriptor } from "./context-menu-utils";

export type ContextMenuItem = MenuItemDescriptor & {
	key: string;
	label: ReactNode;
	onSelect?: () => void;
};

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
	border: 0,
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

function getViewportSize() {
	if (typeof window === "undefined") {
		return { width: 1280, height: 800 };
	}
	return { width: window.innerWidth, height: window.innerHeight };
}

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

	const measuredRef = useRef<{ width: number; height: number } | null>(null);
	const [measured, setMeasured] = useState<{
		width: number;
		height: number;
	} | null>(null);

	useEffect(() => {
		if (!open) return;
		const node = ref.current;
		if (!node) return;
		const rect = node.getBoundingClientRect();
		const next = { width: rect.width, height: rect.height };
		if (
			measuredRef.current?.width !== next.width ||
			measuredRef.current?.height !== next.height
		) {
			measuredRef.current = next;
			setMeasured(next);
		}
	}, [open, items.length]);

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

	const setItemRef = (el: HTMLButtonElement | null, idx: number) => {
		itemRefs.current[idx] = el;
	};

	useEffect(() => {
		if (!open || focusIndex < 0) return;
		const el = itemRefs.current[focusIndex];
		if (el && !el.disabled) el.focus();
	}, [focusIndex, open]);

	useClickAway(ref, open, onClose);

	if (!open) return null;

	const viewport = getViewportSize();
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
					return <hr key={item.key} style={dividerStyle} />;
				}
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
						ref={(el) => setItemRef(el, idx)}
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
