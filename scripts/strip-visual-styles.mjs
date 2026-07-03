#!/usr/bin/env node
/**
 * Strip visual style classes (color, border, shadow, opacity, ring, outline,
 * divide) from src/ TypeScript files.
 *
 * Uses lookbehind/lookahead anchors (?![\w-]) instead of \b to handle
 * non-word endings like `]` from arbitrary values correctly.
 *
 * Preserves layout (display, flex, grid, padding, margin, width, height,
 * position, gap), typography (font-*, italic, tracking, leading, text-size),
 * and spacing utility classes.
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv[2] || "src";
const PROJECT_ROOT = process.cwd();

const NB = "(?<![\\w-])"; // boundary: not preceded by word/hyphen
const NE = "(?=$|[\\s\"'`>])"; // boundary: end of string, whitespace, quote, backtick, or HTML close
const NE_STRICT = "(?=$|[\\s\"'`])"; // stricter: no HTML close, used for prop-only keywords like outline/border/ring/divide

const NO_SHADE = "white|black|transparent|current|inherit|currentcolor";
const SHADED =
	"slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const COLOR_PROPS =
	"bg|text|border|ring|outline|from|via|to|divide|placeholder|caret|fill|stroke|accent|decoration|backdrop";

// Arbitrary color values: #hex, rgb(...), rgba(...), hsl(...), hsla(...), var(--...)
const ARB_COLOR =
	"\\[(?:#[0-9a-fA-F]+|#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\\([^)]+\\)|var\\([^)]+\\))\\]";

// Optional Tailwind state prefix on classes (hover:, focus:, md:, sm:, etc.)
const STATE =
	"(?:(?:hover|focus|focus-within|focus-visible|active|visited|disabled|group-hover|group-focus|first|last|odd|even|placeholder|md|sm|lg|xl|2xl):+)*";

// 1. Color setter classes (bg-red-500, text-white, from-blue-300, divide-gray-200, etc.)
//    For `text-` we must be careful: text-xs/4xl/sm are typography, NOT colors.
//    The regex requires the value to look like a color.
const COLOR_CLASS = new RegExp(
	`${NB}${STATE}(?:${COLOR_PROPS})-` +
		`(?:` +
		`(?:${NO_SHADE})(?:\\/(?:\\d+|${ARB_COLOR}))?` +
		`|(?:${SHADED})(?:-[0-9]+)?(?:\\/(?:\\d+|${ARB_COLOR}))?` +
		`|${ARB_COLOR}` +
		`)${NE}`,
	"g",
);

// 2. Shadow / drop-shadow (any variant)
const SHADOW_CLASS = new RegExp(
	`${NB}${STATE}(?:shadow(?:-(?:sm|md|lg|xl|2xl|inner|none))?|drop-shadow(?:-(?:sm|md|lg|xl|2xl|none))?)${NE}`,
	"g",
);

// 3. Opacity
const OPACITY_CLASS = new RegExp(
	`${NB}${STATE}opacity-(?:[0-9]+)${NE}`,
	"g",
);

// 4. Mix-blend-mode
const MIX_BLEND = new RegExp(
	`${NB}${STATE}mix-blend-(?:normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity)${NE}`,
	"g",
);

// 5. Backdrop-filter (visual effects on backdrop)
//    Use (?:\\[[^\\]]+\\]|[\\w-]+) instead of \\S+ to avoid eating trailing quotes
const BACKDROP_FILTER = new RegExp(
	`${NB}${STATE}backdrop-(?:blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)-(?:\\[[^\\]]+\\]|[\\w-]+)${NE}`,
	"g",
);

// 6. Plain border (no color), border-{n} (width), border-{side}, border-{style}
//    Excludes border-spacing, border-collapse, border-separate (CSS table props)
//    REQUIRES a `-modifier` so that bare `border` doesn't match JS variable names
//    (`const border = ...`) or CSS property strings (`getPropertyValue("border")`).
const ARBITRARY = "\\[.+\\]";
const BORDER_PLAIN = new RegExp(
	`${NB}${STATE}border` +
		`(?!-(?:spacing|collapse|separate)\\b)` +
		`(?:-${ARBITRARY}` +
		`|-(?:[0-9]+|t|r|b|l|x|y|solid|dashed|dotted|double|hidden|none)` +
		`(?:-(?:[0-9]+|t|r|b|l|x|y|solid|dashed|dotted|double|hidden|none|${ARBITRARY}))?` +
		`)` +
		`${NE_STRICT}`,
	"g",
);

// 7. Divide plain (border between siblings) — REQUIRES `-x|y|n|...` modifier
const DIVIDE_PLAIN = new RegExp(
	`${NB}${STATE}divide-(?:x|y|[0-9]+|x-[0-9]+|y-[0-9]+|reverse|${ARBITRARY})${NE_STRICT}`,
	"g",
);

// 8. Outline plain (width, style) — REQUIRES `-modifier` to avoid matching JS vars
const OUTLINE_PLAIN = new RegExp(
	`${NB}${STATE}outline-(?:[0-9]+|solid|dashed|dotted|double|hidden|none|offset-[0-9]+|${ARBITRARY})${NE_STRICT}`,
	"g",
);

// 9. Ring plain (width, inset) — REQUIRES `-modifier` to avoid matching JS vars
const RING_PLAIN = new RegExp(
	`${NB}${STATE}ring-(?:[0-9]+|inset|${ARBITRARY})${NE_STRICT}`,
	"g",
);

function strip(content) {
	let r = content;
	r = r.replace(COLOR_CLASS, "");
	r = r.replace(SHADOW_CLASS, "");
	r = r.replace(OPACITY_CLASS, "");
	r = r.replace(MIX_BLEND, "");
	r = r.replace(BACKDROP_FILTER, "");
	r = r.replace(BORDER_PLAIN, "");
	r = r.replace(DIVIDE_PLAIN, "");
	r = r.replace(OUTLINE_PLAIN, "");
	r = r.replace(RING_PLAIN, "");
	return r;
}

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const st = statSync(full);
		if (st.isDirectory()) {
			if (entry === "node_modules" || entry.startsWith(".")) continue;
			yield* walk(full);
		} else if (/\.(tsx?|jsx?|mdx?)$/.test(entry)) {
			yield full;
		}
	}
}

let filesTouched = 0;
let bytesRemoved = 0;

const SKIP_PATH_PATTERNS = [/tools\/ProtoType\//];

for (const file of walk(join(PROJECT_ROOT, ROOT))) {
	const rel = relative(PROJECT_ROOT, file);
	if (SKIP_PATH_PATTERNS.some((p) => p.test(rel))) continue;
	const before = readFileSync(file, "utf8");
	const after = strip(before);
	if (after !== before) {
		writeFileSync(file, after, "utf8");
		filesTouched++;
		bytesRemoved += before.length - after.length;
	}
}

console.log(`Files modified: ${filesTouched}`);
console.log(`Bytes removed: ${bytesRemoved}`);
