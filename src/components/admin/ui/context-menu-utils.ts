export type MenuItemDescriptor = {
	disabled?: boolean;
	divider?: boolean;
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
