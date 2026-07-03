#!/usr/bin/env node
/**
 * Strip color/border/shadow/opacity visual classes from src/.
 * Uses word-boundary anchored regex to avoid accidental matches on
 * typography classes (text-xs, text-4xl, etc.).
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv[2] || "src";
const PROJECT_ROOT = process.cwd();

const NO_SHADE = "white|black|transparent|current|inherit|currentcolor";
const SHADED =
	"slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const COLOR_PROPS =
	"bg|text|border|ring|outline|from|via|to|divide|placeholder|caret|fill|stroke|accent|decoration|backdrop";

const ARBITRARY_COLOR = "\\[(?:#[0-9a-fA-F]+|[a-z-]+\\([^)]+\\)|var\\([^)]+\\))\\]";

const STATE =
	"(?:(?:hover|focus|active|disabled|group-hover|group-focus|focus-within|focus-visible|visited|first|last|odd|even|placeholder|md|sm|lg|xl|2xl):+)*";

function strip(content, regex, note) {
	return content.replace(regex, () => {
		return "";
	});
}

// 1. Color setter classes. The value must look like a color, otherwise no match.
//    `text-` is special: only match if value is a color (do not match text-xs etc.).
const COLOR_CLASS = new RegExp(
	`\\b${STATE}(?:${COLOR_PROPS})-` +
		`(?:` +
		`(?:${NO_SHADE})(?:\\/(?:\\d+|${ARBITRARY_COLOR}))?` +
		`|(?:${SHADED})(?:-[0-9]+)?(?:\\/(?:\\d+|${ARBITRARY_COLOR}))?` +
		`|${ARBITRARY_COLOR}` +
		`)\\b`,
	"g",
);

// 2. Shadow / drop-shadow (any variant)
const SHADOW_CLASS = new RegExp(
	`\\b${STATE}(?:shadow(?:-(?:sm|md|lg|xl|2xl|inner|none|${ARBITRARY_COLOR}))?|drop-shadow(?:-(?:sm|md|lg|xl|2xl|none|${ARBITRARY_COLOR}))?)\\b`,
	"g",
);

// 3. Opacity
const OPACITY_CLASS = new RegExp(
	`\\b${STATE}opacity-(?:[0-9]+|\\[.+\\])\\b`,
	"g",
);

// 4. Mix-blend-mode (visual blend effects)
const MIX_BLEND = new RegExp(
	`\\b${STATE}mix-blend-(?:normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity)\\b`,
	"g",
);

// 5. Backdrop-filter visual effects (color/visual filters on background)
const BACKDROP_FILTER = new RegExp(
	`\\b${STATE}backdrop-(?:blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)-\\S+`,
	"g",
);

// 6. Plain border (no color), border-{n} (width), border-{side} (side), border-{style}
const BORDER_PLAIN = new RegExp(
	`\\b${STATE}border(?:-(?:[0-9]+|t|r|b|l|x|y|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing|t-[0-9]+|r-[0-9]+|b-[0-9]+|l-[0-9]+|x-[0-9]+|y-[0-9]+))?\\b`,
	"g",
);

// 7. Divide plain (sets border between children)
const DIVIDE_PLAIN = new RegExp(
	`\\b${STATE}divide(?:-(?:x|y|[0-9]+|x-[0-9]+|y-[0-9]+|reverse))?\\b`,
	"g",
);

// 8. Outline plain (width, style)
const OUTLINE_PLAIN = new RegExp(
	`\\b${STATE}outline(?:-(?:[0-9]+|solid|dashed|dotted|double|hidden|none|offset-[0-9]+))?\\b`,
	"g",
);

// 9. Ring plain (width, inset)
const RING_PLAIN = new RegExp(
	`\\b${STATE}ring(?:-(?:[0-9]+|inset))?\\b`,
	"g",
);

function processContent(content) {
	let result = content;
	result = strip(result, COLOR_CLASS, "color");
	result = strip(result, SHADOW_CLASS, "shadow");
	result = strip(result, OPACITY_CLASS, "opacity");
	result = strip(result, MIX_BLEND, "mix-blend");
	result = strip(result, BACKDROP_FILTER, "backdrop");
	result = strip(result, BORDER_PLAIN, "border-plain");
	result = strip(result, DIVIDE_PLAIN, "divide-plain");
	result = strip(result, OUTLINE_PLAIN, "outline-plain");
	result = strip(result, RING_PLAIN, "ring-plain");
	// Collapse runs of whitespace inside className strings
	result = result.replace(/(['"`])([ \t]+)/g, "$1 ");
	result = result.replace(/([ \t]+)(['"`])/g, " $1");
	return result;
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
let totalRemoved = 0;
let totalLines = 0;

const SKIP_PATH_PATTERNS = [/tools\/ProtoType\//];

for (const file of walk(join(PROJECT_ROOT, ROOT))) {
	const rel = relative(PROJECT_ROOT, file);
	if (SKIP_PATH_PATTERNS.some((p) => p.test(rel))) continue;
	const before = readFileSync(file, "utf8");
	const after = processContent(before);
	if (after !== before) {
		writeFileSync(file, after, "utf8");
		filesTouched++;
		const beforeLines = before.length;
		const afterLen = after.length;
		totalRemoved += beforeLines - afterLen;
		totalLines++;
	}
}

console.log(`Files modified: ${filesTouched}`);
console.log(`Total bytes removed: ${totalRemoved}`);
