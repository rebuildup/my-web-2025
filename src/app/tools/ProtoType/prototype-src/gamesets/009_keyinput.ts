import type * as PIXI from "pixi.js";
import { keyLayouts } from "../components/012_KeyLayout";
import { settings } from "../SiteInterface";
import { gameData } from "./002_gameConfig";
import { light_key, update_Acc_key } from "./011_keybord";

interface KeyboardLayout {
	name: string;
	layout: string[][];
}

const KEY_CODE_MAP = {
	Digit1: "1",
	Digit2: "2",
	Digit3: "3",
	Digit4: "4",
	Digit5: "5",
	Digit6: "6",
	Digit7: "7",
	Digit8: "8",
	Digit9: "9",
	Digit0: "0",
	KeyA: "a",
	KeyB: "b",
	KeyC: "c",
	KeyD: "d",
	KeyE: "e",
	KeyF: "f",
	KeyG: "g",
	KeyH: "h",
	KeyI: "i",
	KeyJ: "j",
	KeyK: "k",
	KeyL: "l",
	KeyM: "m",
	KeyN: "n",
	KeyO: "o",
	KeyP: "p",
	KeyQ: "q",
	KeyR: "r",
	KeyS: "s",
	KeyT: "t",
	KeyU: "u",
	KeyV: "v",
	KeyW: "w",
	KeyX: "x",
	KeyY: "y",
	KeyZ: "z",
	Comma: ",",
	Period: ".",
	Semicolon: ";",
	Quote: ":",
	BracketLeft: "@",
	BracketRight: "[",
	Backquote: "`",
	Backslash: "]",
	Slash: "/",
	Minus: "-",
	Equal: "^",
	IntlYen: "\\",
	IntlRo: "\\",
	Space: " ",
	Numpad0: "0",
	Numpad1: "1",
	Numpad2: "2",
	Numpad3: "3",
	Numpad4: "4",
	Numpad5: "5",
	Numpad6: "6",
	Numpad7: "7",
	Numpad8: "8",
	Numpad9: "9",
	NumpadDecimal: ".",
	NumpadDivide: "/",
	NumpadMultiply: "*",
	NumpadSubtract: "-",
	NumpadAdd: "+",
};

const CHAR_TO_INDEX_MAP = {
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	"0": 10,
	a: 30,
	b: 48,
	c: 46,
	d: 32,
	e: 18,
	f: 33,
	g: 34,
	h: 35,
	i: 23,
	j: 36,
	k: 37,
	l: 38,
	m: 50,
	n: 49,
	o: 24,
	p: 25,
	q: 16,
	r: 19,
	s: 31,
	t: 20,
	u: 22,
	v: 47,
	w: 17,
	x: 45,
	y: 21,
	z: 44,
	",": 51,
	".": 52,
	";": 39,
	":": 40,
	"@": 26,
	"[": 27,
	"`": 15,
	"]": 41,
	"/": 53,
	"-": 11,
	"^": 12,
	"\\": 13,
	" ": 60,
};

const SHIFT_MAP: { [key: string]: string } = {
	"1": "!",
	"2": '"',
	"3": "#",
	"4": "$",
	"5": "%",
	"6": "&",
	"7": "'",
	"8": "(",
	"9": ")",
	"0": "",
	a: "A",
	b: "B",
	c: "C",
	d: "D",
	e: "E",
	f: "F",
	g: "G",
	h: "H",
	i: "I",
	j: "J",
	k: "K",
	l: "L",
	m: "M",
	n: "N",
	o: "O",
	p: "P",
	q: "Q",
	r: "R",
	s: "S",
	t: "T",
	u: "U",
	v: "V",
	w: "W",
	x: "X",
	y: "Y",
	z: "Z",
	",": "<",
	".": ">",
	";": "+",
	":": "*",
	"@": "`",
	"[": "{",
	"]": "}",
	"/": "?",
	"-": "=",
	"^": "~",
	"\\": "_",
};

function shift_get(input_char: string, backs: boolean = true): string {
	if (input_char === "\\" && !backs) {
		return "|";
	}
	return SHIFT_MAP[input_char] || input_char;
}

function mapKey(
	source: KeyboardLayout,
	target: KeyboardLayout,
	key: string,
): string | undefined {
	for (let rowIndex = 0; rowIndex < source.layout.length; rowIndex++) {
		const row = source.layout[rowIndex];
		const colIndex = row.findIndex(
			(item) => item.toLowerCase() === key.toLowerCase(),
		);
		if (colIndex !== -1) {
			if (
				target.layout[rowIndex] &&
				target.layout[rowIndex][colIndex] !== undefined
			) {
				let mappedKey = target.layout[rowIndex][colIndex];
				if (key === key.toLowerCase() && /^[A-Z]$/.test(mappedKey)) {
					mappedKey = mappedKey.toLowerCase();
				}
				return mappedKey;
			}
		}
	}
	return undefined;
}
export function getLatestKey(
	signal: AbortSignal,
): Promise<{ code: string; shift: boolean }> {
	return new Promise((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException("Aborted", "AbortError"));
			return;
		}
		const handler = (event: KeyboardEvent) => {
			window.removeEventListener("keydown", handler);
			signal.removeEventListener("abort", abortHandler);
			event.preventDefault();
			resolve({
				code: event.code,
				shift: event.shiftKey,
			});
		};
		const abortHandler = () => {
			window.removeEventListener("keydown", handler);
			reject(new DOMException("Aborted", "AbortError"));
		};
		window.addEventListener("keydown", handler);
		signal.addEventListener("abort", abortHandler);
	});
}
export function keyCodeToText(code: string, shift: boolean): string {
	const root_layout = keyLayouts.find(
		(layout) => layout.name === settings.keyLayout,
	) as KeyboardLayout;
	const play_layout = keyLayouts.find(
		(layout) => layout.name === gameData.KeyLayout,
	) as KeyboardLayout;

	// Get the base character for the key code
	const baseChar = KEY_CODE_MAP[code as keyof typeof KEY_CODE_MAP];
	if (!baseChar) return "";

	// Map the character to the target layout
	const mapped = mapKey(root_layout, play_layout, baseChar);
	if (!mapped) return "";

	// Apply shift key if needed
	return shift ? shift_get(mapped, code !== "IntlRo") : mapped;
}

export function light_key_from_code(app: PIXI.Application, code: string) {
	const root_layout = keyLayouts.find(
		(layout) => layout.name === settings.keyLayout,
	) as KeyboardLayout;
	const play_layout = keyLayouts.find(
		(layout) => layout.name === "QWERTY",
	) as KeyboardLayout;

	const baseChar = KEY_CODE_MAP[code as keyof typeof KEY_CODE_MAP];
	if (!baseChar) return;

	const mapped = mapKey(root_layout, play_layout, baseChar);
	if (!mapped) return;

	let index =
		CHAR_TO_INDEX_MAP[mapped.toLowerCase() as keyof typeof CHAR_TO_INDEX_MAP] ||
		28;

	if (mapped === "\\" && code === "IntlYen") {
		index = 13;
	} else if (mapped === "\\" && code === "IntlRo") {
		index = 54;
	}

	light_key(app, index);
}
export function acc_key_from_code(
	app: PIXI.Application,
	code: string,
	set: boolean,
) {
	const root_layout = keyLayouts.find(
		(layout) => layout.name === gameData.KeyLayout,
	) as KeyboardLayout;
	const play_layout = keyLayouts.find(
		(layout) => layout.name === "QWERTY",
	) as KeyboardLayout;

	// Check if this is a shifted character
	let isShiftRequired = false;
	let baseChar = code.toLowerCase();

	// If the character is uppercase or is a shifted symbol
	if (code !== baseChar || Object.values(SHIFT_MAP).includes(code)) {
		isShiftRequired = true;

		// Find the base character for shifted symbols
		for (const [key, value] of Object.entries(SHIFT_MAP)) {
			if (value === code) {
				baseChar = key;
				break;
			}
		}
	}

	// Map the character to the target layout
	const mapped =
		baseChar !== " " ? mapKey(root_layout, play_layout, baseChar) || code : " ";

	// Get the index for the character
	let index =
		CHAR_TO_INDEX_MAP[mapped.toLowerCase() as keyof typeof CHAR_TO_INDEX_MAP] ||
		28;

	if (mapped === "\\" && code === "IntlYen") {
		index = 13;
	} else if (mapped === "\\" && code === "IntlRo") {
		index = 54;
	}

	if (set) {
		if (!gameData.acc_keys.includes(index)) {
			gameData.acc_keys.push(index);
		}

		if (isShiftRequired && !gameData.acc_keys.includes(43)) {
			gameData.acc_keys.push(43);
		}
	} else {
		if (gameData.acc_keys.includes(index)) {
			gameData.acc_keys = gameData.acc_keys.filter((key) => key !== index);
		}

		if (isShiftRequired) {
			// Check if there are any other shifted characters still active
			const stillHasShiftedChars = gameData.acc_keys.some((keyIndex) => {
				const char = Object.entries(CHAR_TO_INDEX_MAP).find(
					([i]) => String(i) === String(keyIndex),
				)?.[0];
				return char && Object.keys(SHIFT_MAP).includes(char);
			});

			if (!stillHasShiftedChars) {
				gameData.acc_keys = gameData.acc_keys.filter((key) => key !== 43);
			}
		}
	}

	update_Acc_key(app);
}
export function isNomalKey(code: string) {
	return Object.keys(KEY_CODE_MAP).includes(code);
}
