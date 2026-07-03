// Test strip-visual-styles regex patterns
const NO_SHADE = "white|black|transparent|current|inherit|currentcolor";
const SHADED = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_PROPS = "bg|text|border|ring|outline|from|via|to|divide|placeholder|caret|fill|stroke|accent|decoration|backdrop";
const ARBITRARY_COLOR = "\\[(?:#[0-9a-fA-F]+|[a-z-]+\\([^)]+\\)|var\\([^)]+\\))\\]";
const STATE = "(?:(?:hover|focus|active|disabled|group-hover|group-focus|focus-within|focus-visible|visited|first|last|odd|even|placeholder|md|sm|lg|xl|2xl):+)*";

const COLOR_CLASS = new RegExp(
	`\\b${STATE}(?:${COLOR_PROPS})-` +
		`(?:` +
		`(?:${NO_SHADE})(?:\\/(?:\\d+|${ARBITRARY_COLOR}))?` +
		`|(?:${SHADED})(?:-[0-9]+)?(?:\\/(?:\\d+|${ARBITRARY_COLOR}))?` +
		`|${ARBITRARY_COLOR}` +
		`)\\b`,
	"g",
);
const SHADOW_CLASS = new RegExp(
	`\\b${STATE}(?:shadow(?:-(?:sm|md|lg|xl|2xl|inner|none|${ARBITRARY_COLOR}))?|drop-shadow(?:-(?:sm|md|lg|xl|2xl|none|${ARBITRARY_COLOR}))?)\\b`,
	"g",
);
const OPACITY_CLASS = new RegExp(`\\b${STATE}opacity-(?:[0-9]+|\\[.+\\])\\b`, "g");
const MIX_BLEND = new RegExp(
	`\\b${STATE}mix-blend-(?:normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity)\\b`,
	"g",
);
const BACKDROP_FILTER = new RegExp(`\\b${STATE}backdrop-(?:blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)-\\S+`, "g");
const BORDER_PLAIN = new RegExp(`\\b${STATE}border(?:-(?:[0-9]+|t|r|b|l|x|y|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing|t-[0-9]+|r-[0-9]+|b-[0-9]+|l-[0-9]+|x-[0-9]+|y-[0-9]+))?\\b`, "g");
const DIVIDE_PLAIN = new RegExp(`\\b${STATE}divide(?:-(?:x|y|[0-9]+|x-[0-9]+|y-[0-9]+|reverse))?\\b`, "g");
const OUTLINE_PLAIN = new RegExp(`\\b${STATE}outline(?:-(?:[0-9]+|solid|dashed|dotted|double|hidden|none|offset-[0-9]+))?\\b`, "g");
const RING_PLAIN = new RegExp(`\\b${STATE}ring(?:-(?:[0-9]+|inset))?\\b`, "g");

function process(input) {
	let r = input;
	r = r.replace(COLOR_CLASS, "");
	r = r.replace(SHADOW_CLASS, "");
	r = r.replace(OPACITY_CLASS, "");
	r = r.replace(MIX_BLEND, "");
	r = r.replace(BACKDROP_FILTER, "");
	r = r.replace(BORDER_PLAIN, "");
	r = r.replace(DIVIDE_PLAIN, "");
	r = r.replace(OUTLINE_PLAIN, "");
	r = r.replace(RING_PLAIN, "");
	r = r.replace(/(['"`])([ \t]+)/g, "$1 ");
	r = r.replace(/([ \t]+)(['"`])/g, " $1");
	return r;
}

const tests = [
	["bg-white", ""],
	["bg-white/10", ""],
	["bg-gray-300", ""],
	["hover:bg-red-500", ""],
	["hover:bg-red-500/50", ""],
	["text-white", ""],
	["border-gray-200", ""],
	["shadow-md", ""],
	["shadow-lg", ""],
	["drop-shadow-sm", ""],
	["opacity-50", ""],
	["ring-2 ring-red-500", ""],
	["bg-[#fff]", ""],
	["bg-[rgba(0,0,0,0.5)]", ""],
	["outline-red-500", ""],
	["from-blue-500 via-red-500 to-green-500", ""],
	["border", ""],
	["border-2", ""],
	["border-t", ""],
	["ring-2", ""],
	["ring", ""],
	["divide-x", ""],
	["divide-y-2", ""],
	["outline-none", ""],
	["outline-2", ""],
	["placeholder-Image.svg", "placeholder-Image.svg"],
	["text-[10px]", "text-[10px]"],
	["text-[9px]", "text-[9px]"],
	["text-[#aaaaaa]", ""],
	["bg-[#020202]", ""],
	["border-[1px]", "border-[1px]"],
	["border-[#333]", ""],
	["text-xs", "text-xs"],
	["text-4xl", "text-4xl"],
	["text-sm", "text-sm"],
	["text-gray-300", ""],
	["font-bold", "font-bold"],
	["italic", "italic"],
	["placeholder-white", ""],
	["hover:shadow-md", ""],
	["text-[length:14px]", "text-[length:14px]"],
	["text-[1.5em]", "text-[1.5em]"],
	["border-spacing-2", "border-spacing-2"],
	["border-t-[2px]", "border-t-[2px]"],
	["flex flex-col items-center", "flex flex-col items-center"],
	["mt-3 text-xs sm:text-xs leading-relaxed", "mt-3 text-xs sm:text-xs leading-relaxed"],
	["text-4xl sm:text-4xl font-bold italic tracking-tight", "4xl sm:4xl font-bold italic tracking-tight"],
	["text-4xl sm:text-4xl font-bold italic tracking-tight ".trim(), "4xl sm:4xl font-bold italic tracking-tight"],
];

let pass = 0, fail = 0;
for (const [input, expected] of tests) {
	const out = process(input).trim();
	const ok = out === expected;
	if (ok) pass++;
	else fail++;
	console.log(`${ok ? "PASS" : "FAIL"}: "${input}" -> "${out}"${ok ? "" : ` (expected: "${expected}")`}`);
}
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail > 0 ? 1 : 0);
