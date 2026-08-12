import { describe, expect, test } from "bun:test";
import type { MenuItemDescriptor } from "./ContextMenu";
import { computeMenuRect, nextIndex } from "./ContextMenu";

describe("computeMenuRect", () => {
	test("opens below the anchor when there is room", () => {
		const rect = computeMenuRect(
			{ top: 100, bottom: 132, left: 200, height: 32 },
			{ width: 200, height: 160 },
			{ width: 1280, height: 800 },
		);
		expect(rect.top).toBe(132 + 4);
		expect(rect.left).toBe(200);
	});

	test("flips above the anchor when the menu would overflow the bottom edge", () => {
		const rect = computeMenuRect(
			{ top: 700, bottom: 732, left: 200, height: 32 },
			{ width: 200, height: 160 },
			{ width: 1280, height: 800 },
		);
		expect(rect.top).toBe(700 - 160 - 4);
		expect(rect.left).toBe(200);
	});

	test("clamps the left edge when the menu would overflow the right side", () => {
		const rect = computeMenuRect(
			{ top: 100, bottom: 132, left: 1200, height: 32 },
			{ width: 200, height: 160 },
			{ width: 1280, height: 800 },
		);
		expect(rect.left).toBe(1280 - 200 - 8);
	});

	test("returns 0,0 when no anchor is supplied", () => {
		const rect = computeMenuRect(
			null,
			{ width: 100, height: 100 },
			{ width: 1280, height: 800 },
		);
		expect(rect).toEqual({ top: 0, left: 0 });
	});
});

describe("nextIndex", () => {
	const items: MenuItemDescriptor[] = [
		{ disabled: false },
		{ disabled: true },
		{ divider: true },
		{ disabled: false },
		{ disabled: false },
	];

	test("ArrowDown from -1 returns the first enabled item", () => {
		expect(nextIndex(-1, items, 1)).toBe(0);
	});

	test("ArrowDown skips disabled and divider items", () => {
		expect(nextIndex(0, items, 1)).toBe(3);
	});

	test("ArrowUp from 0 wraps to the last enabled item", () => {
		expect(nextIndex(0, items, -1)).toBe(4);
	});

	test("End jumps to the last non-disabled item", () => {
		expect(nextIndex(-1, items, "end")).toBe(4);
	});

	test("Home jumps to the first non-disabled item", () => {
		expect(nextIndex(2, items, "home")).toBe(0);
	});

	test("returns -1 when no item is enabled", () => {
		const allDisabled: MenuItemDescriptor[] = [
			{ disabled: true },
			{ disabled: true },
		];
		expect(nextIndex(0, allDisabled, 1)).toBe(-1);
	});

	test("returns -1 for an empty list", () => {
		expect(nextIndex(-1, [], 1)).toBe(-1);
	});
});
