#!/usr/bin/env node
/**
 * Strip visual-override classes from <button>, <input>, <select>, and
 * <textarea> elements only. DOM standard controls already have borders,
 * backgrounds, and padding; this pass removes the custom shadows,
 * rounded corners, transitions, focus rings, and color-hover overrides
 * that survive the broader strip pass — letting the browser defaults
 * show through.
 *
 * Keeps: layout (flex/grid/padding/margin/gap/sizing/position),
 *        typography (text-size/font/leading/tracking),
 *        spacing utilities, and cursor/disabled cursor.
 *
 * Removes from form elements:
 *   - shape: rounded*, shadow*, drop-shadow*, ring[-width]*, ring-offset*
 *   - motion: transition*, duration*, ease*, animate*
 *   - color state: hover:bg*, hover:text*, hover:border*,
 *                  focus:bg*, focus:text*, focus:border*,
 *                  active:bg*, active:text*, active:border*,
 *                  disabled:bg*, disabled:text*, disabled:border*
 *   - leftover interaction: active:scale*, active:translate*
 *   - orphan modifiers: bg-opacity*, text-opacity*, /N, /[...] leftovers
 *
 * Also: collapses runs of whitespace inside className strings and trims.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv[2] || "src";
const PROJECT_ROOT = process.cwd();

// Match the className attribute value, including string, single-quoted,
// template-literal, and JS-expression forms. We only touch the literal
// side; if it's a JS expression we leave the file unchanged.
function findClassName(tagInner) {
	const stringMatch = tagInner.match(/className=("(.*?)"|'(.*?)')/);
	if (stringMatch) {
		return {
			quote: stringMatch[1][0],
			body: stringMatch[2] ?? stringMatch[3] ?? "",
		};
	}
	const tmpl = tagInner.match(/className=\{`([^`]*)`\}/);
	if (tmpl) {
		return { quote: "`", body: tmpl[1] ?? "" };
	}
	return null;
}

// Only these class patterns should be REMOVED from form elements.
// Anything else is kept verbatim (modulo whitespace cleanup).
const STATE =
	"(?:(?:hover|focus|focus-within|focus-visible|active|visited|disabled|group-hover|group-focus|first|last|odd|even|placeholder|md|sm|lg|xl|2xl):+)*";
const NB = "(?<![\\w-])";
const NE = "(?=$|[\\s\"'`>])";

// Shape overrides — also strip arbitrary `shadow-[...]`, `rounded-[...]`,
// `drop-shadow-[...]`, `transition-[...]`, `duration-[...]`, etc.
const ARB = "\\[\\S+?\\]";
const SHAPE = new RegExp(
	`${NB}${STATE}(?:rounded(?:-(?:sm|md|lg|xl|2xl|3xl|none|full|${ARB}))?|shadow(?:-(?:sm|md|lg|xl|2xl|inner|none|${ARB}))?|drop-shadow(?:-(?:sm|md|lg|xl|2xl|none|${ARB}))?)${NE}`,
	"g",
);

// Motion — duration/ease/animate/transition can also use arbitrary values.
const MOTION = new RegExp(
	`${NB}${STATE}(?:transition(?:-(?:all|colors|opacity|shadow|transform|none|${ARB}))?|duration-(?:\\d+|${ARB})|ease-(?:linear|in|out|in-out|${ARB})|animate-(?:\\S+))${NE}`,
	"g",
);
const RING = new RegExp(
	`${NB}${STATE}(?:ring(?:-[0-9]+|-inset|-\\[[^\\]]+\\])?|ring-offset(?:-[0-9]+|-base|-\\[[^\\]]+\\])?)${NE}`,
	"g",
);

// Disabled cursor — disabled controls already display an unavailable
// state via the DOM; an extra `cursor-not-allowed` is a visual override.
const DISABLED_CURSOR = new RegExp(
	`${NB}disabled:cursor-not-allowed${NE}`,
	"g",
);

// Color state overrides — bg/text/border for hover/focus/active/disabled
const COLOR_STATE = new RegExp(
	`${NB}(?:hover|focus|focus-within|focus-visible|active|disabled):+(?:bg|text|border)-(?:white|black|transparent|current|inherit|currentcolor|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|accent|\\[(?:#[0-9a-fA-F]+|#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\\([^)]+\\)|var\\([^)]+\\))\\])(?:\\/(?:\\d+|\\[[^\\]]+\\]))?${NE}`,
	"g",
);

// Active scale/translate (interaction that overrides DOM click feedback)
const ACTIVE_INTERACTION = new RegExp(
	`${NB}active:+(?:scale-|translate-)\\S+${NE}`,
	"g",
);

// Orphan opacity (bg-opacity-*, text-opacity-*)
const ORPHAN_OPACITY = new RegExp(
	`${NB}(?:bg-opacity-|text-opacity-)(?:[0-9]+|\\[[^\\]]+\\])${NE}`,
	"g",
);
const ORPHAN_SLASH = /\s+\/(?:\[[^\]\s]+\]|\d+)(?=$|[\s"'>])/g;

// Orphan state prefix: `hover:` or `focus:` or `active:` etc. with
// nothing visual after. Also consumes an attached orphan slash like
// `hover:/20` so the leftover slash doesn't end up standalone. The
// trailing-quote terminator (`hover:"`) covers JSX template literals
// that contain `" hover:" ` as a string fragment.
const ORPHAN_STATE_PREFIX = new RegExp(
	`${NB}(?:hover|focus|focus-within|focus-visible|active|visited|disabled|group-hover|group-focus|placeholder):+(?:/(?:\\[[^\\]\\s]+\\]|\\d+))?(?=\\s|$|"|')`,
	"g",
);

// Color underline on state — should go (text-decoration visual).
const STATE_UNDERLINE = new RegExp(
	`${NB}(?:hover|focus|focus-within|active):+underline${NE}`,
	"g",
);

function cleanClasses(body) {
	let r = body ?? "";
	r = r.replace(SHAPE, "");
	r = r.replace(MOTION, "");
	r = r.replace(RING, "");
	r = r.replace(COLOR_STATE, "");
	r = r.replace(STATE_UNDERLINE, "");
	r = r.replace(ACTIVE_INTERACTION, "");
	r = r.replace(DISABLED_CURSOR, "");
	r = r.replace(ORPHAN_OPACITY, "");
	r = r.replace(ORPHAN_SLASH, "");
	r = r.replace(ORPHAN_STATE_PREFIX, "");
	r = r.replace(/\s{2,}/g, " ");
	return r.trim();
}

function processText(content) {
	// We need a small parser because JSX opening tags can contain a `>` arrow
	// (`onClick={() => …}`) and string templates that include arbitrary `>` —
	// `\b[^>]*>` is too eager. Walk the source linearly, find each
	// `<button|<input|<select|<textarea` (optionally self-closed `/>`), and
	// for each token, locate `className=` and rewrite its body if it's a
	// literal value (string or template literal — not a JS expression).
	let result = "";
	let i = 0;
	let changed = false;
	const FORM_OPENER = /<(button|input|select|textarea)\b/g;

	while (i < content.length) {
		FORM_OPENER.lastIndex = i;
		const m = FORM_OPENER.exec(content);
		if (!m) {
			result += content.slice(i);
			break;
		}
		// Emit everything before the tag verbatim.
		result += content.slice(i, m.index);
		const tagStart = m.index;
		// Scan to the matching end of the opening tag, tracking nested
		// quotes/braces/parens so we don't stop at `>` inside `onClick={...}`.
		let j = m.index + m[0].length;
		let quote = null;
		const depth = { paren: 0, brace: 0, bracket: 0 };
		while (j < content.length) {
			const ch = content[j];
			if (quote) {
				if (ch === "\\" && quote !== null) {
					j += 2;
					continue;
				}
				if (ch === quote) quote = null;
				j++;
				continue;
			}
			if (ch === '"' || ch === "'") {
				quote = ch;
				j++;
				continue;
			}
			if (ch === "`") {
				// Template literal — scan to closing backtick, skipping `${...}`
				j++;
				while (j < content.length) {
					const c = content[j];
					if (c === "\\") {
						j += 2;
						continue;
					}
					if (c === "`") {
						j++;
						break;
					}
					if (c === "$" && content[j + 1] === "{") {
						j += 2;
						let d = 1;
						while (j < content.length && d > 0) {
							const cc = content[j];
							if (cc === "{") d++;
							else if (cc === "}") d--;
							j++;
						}
						continue;
					}
					j++;
				}
				continue;
			}
			if (ch === "(") depth.paren++;
			else if (ch === ")") depth.paren--;
			else if (ch === "{") depth.brace++;
			else if (ch === "}") depth.brace--;
			else if (ch === "[") depth.bracket++;
			else if (ch === "]") depth.bracket--;
			else if (ch === ">") {
				if (depth.paren === 0 && depth.brace === 0 && depth.bracket === 0) {
					j++;
					break;
				}
			}
			j++;
		}
		const fullTag = content.slice(tagStart, j);
		const tagInner = fullTag.slice(0, -1); // without the closing >
		const tagChanged = rewriteClassName(tagInner);
		if (tagChanged !== tagInner) {
			changed = true;
			result += `${tagChanged}>`;
		} else {
			result += fullTag;
		}
		i = j;
	}
	return { next: result, changed };
}

function rewriteClassName(tagInner) {
	// Find className="..." or className='...' or className={`...`}.
	const cf = findClassName(tagInner);
	if (!cf) return tagInner;
	const cleaned = cleanClasses(cf.body);
	if (cleaned === cf.body.trim() && !/\s{2,}/.test(cf.body)) return tagInner;

	if (cf.quote === "`") {
		// Replace the template literal body verbatim. Embedded ${...}
		// interpolations are preserved because the regex passes through
		// them untouched (their tokens aren't Tailwind class patterns).
		return tagInner.replace(
			/(className=\{`)([\s\S]*?)(`\})/,
			(_full, open, _body, close) => open + cleaned + close,
		);
	}

	const escapedQuote = cf.quote === '"' ? '"' : "'";
	const original = new RegExp(
		`(className=${escapedQuote})((?:\\\\.|[^${escapedQuote}\\\\])*)(${escapedQuote})`,
	);
	return tagInner.replace(original, (_full, open, _body, close) => {
		return open + cleaned + close;
	});
}

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const st = statSync(full);
		if (st.isDirectory()) {
			if (entry === "node_modules" || entry.startsWith(".")) continue;
			yield* walk(full);
		} else if (/\.(tsx?|jsx?)$/.test(entry)) {
			yield full;
		}
	}
}

let filesTouched = 0;
let classesRemoved = 0;

const SKIP_PATH_PATTERNS = [/tools\/ProtoType\//];

for (const file of walk(join(PROJECT_ROOT, ROOT))) {
	const rel = relative(PROJECT_ROOT, file);
	if (SKIP_PATH_PATTERNS.some((p) => p.test(rel))) continue;
	const before = readFileSync(file, "utf8");
	const { next } = processText(before);
	if (next !== before) {
		const removed = before.length - next.length;
		classesRemoved += removed;
		writeFileSync(file, next, "utf8");
		filesTouched++;
	}
}

console.log(`Form-element files modified: ${filesTouched}`);
console.log(`Bytes removed: ${classesRemoved}`);
