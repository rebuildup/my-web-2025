"use client";

import { Add, Delete, Download } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Card,
	CardContent,
	Divider,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Slider,
	Stack,
	Tab,
	Tabs,
	TextField,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// 設定の型定義
type StyleSettings = {
	colors: {
		bgColor: string;
		textColor: string;
		accentColor: string;
		correctColor: string;
		incorrectColor: string;
		blockBg: string;
	};
	textSize: {
		base: number;
		title: number;
		header: number;
		section: number;
		blank: number;
	};
	button: {
		borderRadius: number;
		padding: string;
		fontSize: number;
	};
	blank: {
		borderStyle: "solid" | "dashed" | "dotted" | "double";
		borderWidth: number;
		backgroundColor: string;
	};
	navTab: {
		borderRadius: number;
		padding: string;
		fontSize: number;
	};
};

// プリセットテンプレート
const presets: Record<string, StyleSettings> = {
	default: {
		colors: {
			bgColor: "#f0f2f5",
			textColor: "#222",
			accentColor: "#2c3e50",
			correctColor: "#27ae60",
			incorrectColor: "#c0392b",
			blockBg: "#fff",
		},
		textSize: {
			base: 16,
			title: 24,
			header: 20.8,
			section: 19.2,
			blank: 15,
		},
		button: {
			borderRadius: 4,
			padding: "8px 16px",
			fontSize: 14,
		},
		blank: {
			borderStyle: "solid",
			borderWidth: 1,
			backgroundColor: "#f9f9f9",
		},
		navTab: {
			borderRadius: 20,
			padding: "8px 14px",
			fontSize: 14,
		},
	},
	modern: {
		colors: {
			bgColor: "#ffffff",
			textColor: "#1a1a1a",
			accentColor: "#6366f1",
			correctColor: "#10b981",
			incorrectColor: "#ef4444",
			blockBg: "#f9fafb",
		},
		textSize: {
			base: 16,
			title: 28,
			header: 22,
			section: 18,
			blank: 16,
		},
		button: {
			borderRadius: 8,
			padding: "10px 20px",
			fontSize: 14,
		},
		blank: {
			borderStyle: "dashed",
			borderWidth: 2,
			backgroundColor: "#ffffff",
		},
		navTab: {
			borderRadius: 12,
			padding: "10px 16px",
			fontSize: 14,
		},
	},
	warm: {
		colors: {
			bgColor: "#fef3e2",
			textColor: "#3e2723",
			accentColor: "#d84315",
			correctColor: "#2e7d32",
			incorrectColor: "#c62828",
			blockBg: "#fff8e1",
		},
		textSize: {
			base: 17,
			title: 26,
			header: 21,
			section: 19,
			blank: 16,
		},
		button: {
			borderRadius: 6,
			padding: "9px 18px",
			fontSize: 15,
		},
		blank: {
			borderStyle: "solid",
			borderWidth: 2,
			backgroundColor: "#fff3e0",
		},
		navTab: {
			borderRadius: 16,
			padding: "9px 15px",
			fontSize: 15,
		},
	},
	minimal: {
		colors: {
			bgColor: "#fafafa",
			textColor: "#212121",
			accentColor: "#000000",
			correctColor: "#4caf50",
			incorrectColor: "#f44336",
			blockBg: "#ffffff",
		},
		textSize: {
			base: 15,
			title: 22,
			header: 18,
			section: 16,
			blank: 15,
		},
		button: {
			borderRadius: 0,
			padding: "8px 16px",
			fontSize: 13,
		},
		blank: {
			borderStyle: "solid",
			borderWidth: 1,
			backgroundColor: "#ffffff",
		},
		navTab: {
			borderRadius: 0,
			padding: "8px 12px",
			fontSize: 13,
		},
	},
};

// Style & script snippets borrowed from public/history-quiz.html（圧縮版）
const generateStyle = (settings: StyleSettings): string => {
	const { colors, textSize, button, blank, navTab } = settings;
	return `:root{--bg-color:${colors.bgColor};--text-color:${colors.textColor};--accent-color:${colors.accentColor};--correct-color:${colors.correctColor};--incorrect-color:${colors.incorrectColor};--block-bg:${colors.blockBg}}body{background:var(--bg-color);color:var(--text-color);font-family:sans-serif;line-height:1.6;font-size:${textSize.base}px}.container{max-width:900px;margin:0 auto 80px}.sheet{display:none}.sheet.active{display:block}h1.sheet-title{text-align:center;font-family:sans-serif;font-size:${textSize.title}px;margin:40px 0 20px;padding-bottom:10px;border-bottom:3px solid var(--accent-color);color:var(--accent-color)}h2.main-header{font-size:${textSize.header}px;margin:40px 0 15px;color:#444;font-family:sans-serif;border-left:5px solid #888;padding-left:10px}.quiz-section{background:var(--block-bg);padding:30px;margin-bottom:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #e1e4e8;color:var(--text-color)}.quiz-section h3{font-family:sans-serif;margin-top:0;padding-bottom:10px;border-bottom:1px solid #eee;font-size:${textSize.section}px;color:var(--accent-color)}p{margin-bottom:1.5em;text-align:justify;color:var(--text-color);font-size:${textSize.base}px}.input-wrapper{position:relative;display:inline-block;margin:0 2px}input.blank{font-family:sans-serif;font-size:${textSize.blank}px;border:none;border-bottom:${blank.borderWidth}px ${blank.borderStyle} #333;background-color:${blank.backgroundColor};text-align:center;padding:0 4px;font-weight:bold;color:var(--accent-color);transition:.2s;border-radius:3px 3px 0 0}input.blank:focus{outline:none;background-color:#eaf6ff;border-bottom:${blank.borderWidth + 1}px ${blank.borderStyle} #3498db}input.blank.correct{border-bottom:${blank.borderWidth}px ${blank.borderStyle} var(--correct-color);background-color:#e8f8f5;color:#145a32}input.blank.incorrect{border-bottom:${blank.borderWidth}px ${blank.borderStyle} var(--incorrect-color);background-color:#fdedec}.ans-tooltip{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:var(--incorrect-color);color:#fff;padding:4px 8px;font-size:12px;border-radius:4px;white-space:nowrap;pointer-events:none;opacity:0;transition:.2s;z-index:10;margin-bottom:5px;box-shadow:0 2px 4px rgba(0,0,0,.2)}.ans-tooltip:after{content:'';position:absolute;top:100%;left:50%;margin-left:-5px;border-width:5px;border-style:solid;border-color:var(--incorrect-color) transparent transparent transparent}.input-wrapper.show-ans .ans-tooltip{opacity:1}.section-controls{margin-top:20px;padding-top:15px;border-top:1px dashed #ddd;text-align:right;display:flex;justify-content:flex-end;gap:10px}.btn-mini{padding:${button.padding};border-radius:${button.borderRadius}px;font-size:${button.fontSize}px;border:none;cursor:pointer;font-weight:bold;font-family:sans-serif;transition:.2s}.btn-check{background:var(--correct-color);color:#fff}.btn-ans{background:var(--incorrect-color);color:#fff}.btn-reset{background:#ecf0f1;color:#333;border:1px solid #ccc}.nav-bar{position:sticky;top:0;z-index:5;background:rgba(255,255,255,.95);padding:10px 0;display:flex;gap:8px;flex-wrap:wrap}.nav-btn{background:transparent;border:1px solid #ccc;padding:${navTab.padding};border-radius:${navTab.borderRadius}px;font-weight:bold;color:#555;font-family:sans-serif;transition:.2s;font-size:${navTab.fontSize}px}.nav-btn.active{background:var(--accent-color);color:#fff;border-color:var(--accent-color)}`;
};

const _baseStyle = generateStyle(presets.default);

const defaultInput = `# 第1回 第二次世界大戦の終焉
## 第二次世界大戦の終焉
### 枢軸国の敗北・日本の敗戦
日本は開戦後半年間で「{{大東亜共栄圏|360}}」を唱え、1942年6月の{{ミッドウェー|120}}海戦で大敗した。

### 第二次世界大戦の結果
{{第二次世界大戦|160}}は民主主義の拡大につながり、冷戦構造（{{資本主義/社会主義|200}}）が形成された。`;

type Section = { title: string; paragraphs: string[] };
type Block = { header: string; sections: Section[] };
type Doc = { title: string; blocks: Block[] };

const placeholderRe = /\{\{([^}|]+)(?:\|([^}]+))?\}\}/g;

function parseDoc(text: string): Doc {
	const lines = text.split(/\r?\n/);
	let title = "Quiz";
	const blocks: Block[] = [];
	let currentBlock: Block | undefined;
	let currentSection: Section | undefined;
	let buffer: string[] = [];

	const flush = () => {
		if (currentSection && buffer.length) {
			currentSection.paragraphs.push(buffer.join(" "));
			buffer = [];
		}
	};

	lines.forEach((line) => {
		if (/^#\s+/.test(line)) {
			title = line.replace(/^#\s+/, "").trim();
		} else if (/^##\s+/.test(line)) {
			flush();
			currentSection = undefined;
			const header = line.replace(/^##\s+/, "").trim();
			currentBlock = { header, sections: [] };
			blocks.push(currentBlock);
		} else if (/^###\s+/.test(line)) {
			flush();
			if (!currentBlock) {
				currentBlock = { header: "", sections: [] };
				blocks.push(currentBlock);
			}
			const title2 = line.replace(/^###\s+/, "").trim();
			currentSection = { title: title2, paragraphs: [] };
			currentBlock.sections.push(currentSection);
		} else if (line.trim() === "") {
			flush();
		} else {
			buffer.push(line.trim());
		}
	});
	flush();
	return { title, blocks };
}

function autoWidth(ans: string) {
	return Math.min(400, Math.max(60, ans.length * 14 + 24));
}

function paragraphToHtml(text: string) {
	return text.replace(placeholderRe, (_, ansRaw, width) => {
		const answers = ansRaw
			.split("/")
			.map((a: string) => a.trim())
			.filter(Boolean);
		const w =
			width && width.trim() !== "" ? width.trim() : `${autoWidth(answers[0])}`;
		return `<input class="blank" data-ans="${answers.join("|")}" data-base-width="${w}" style="width:${w}px">`;
	});
}

function getCaretScreenPosition(textarea: HTMLTextAreaElement) {
	const { selectionStart } = textarea;
	if (selectionStart === null) return null;

	const style = window.getComputedStyle(textarea);
	const fontSize = Number.parseFloat(style.fontSize || "16") || 16;
	const rawLineHeight = Number.parseFloat(style.lineHeight || "0");
	const lineHeight =
		Number.isNaN(rawLineHeight) || rawLineHeight === 0
			? fontSize * 1.2
			: rawLineHeight;
	const div = document.createElement("div");
	Array.from(style).forEach((prop) => {
		// @ts-expect-error dynamic access
		div.style[prop] = style[prop];
	});
	div.style.position = "absolute";
	div.style.visibility = "hidden";
	div.style.whiteSpace = "pre-wrap";
	div.style.wordBreak = "break-word";
	div.style.boxSizing = "border-box";
	div.style.width = `${textarea.clientWidth}px`;
	div.style.height = "auto";
	div.textContent = textarea.value.slice(0, selectionStart);

	const marker = document.createElement("span");
	marker.textContent = "\u200b";
	div.appendChild(marker);

	document.body.appendChild(div);
	const markerRect = marker.getBoundingClientRect();
	const divRect = div.getBoundingClientRect();
	const taRect = textarea.getBoundingClientRect();
	document.body.removeChild(div);

	return {
		left: taRect.left + (markerRect.left - divRect.left) - textarea.scrollLeft,
		top:
			taRect.top +
			(markerRect.top - divRect.top) -
			textarea.scrollTop +
			lineHeight,
	};
}

function renderHtml(docs: Doc[], styleSettings: StyleSettings) {
	const style = generateStyle(styleSettings);
	const nav =
		docs.length > 1
			? `<div class="nav-bar">${docs
					.map(
						(_, i) =>
							`<button class="nav-btn ${i === 0 ? "active" : ""}" onclick="switchSheet(${i + 1})">第${i + 1}回</button>`,
					)
					.join("")}</div>`
			: "";

	const sheets = docs
		.map((doc, i) => {
			const inner = [
				`<h1 class="sheet-title">${doc.title}</h1>`,
				...doc.blocks.flatMap((b) => {
					const arr: string[] = [];
					if (b.header) arr.push(`<h2 class="main-header">${b.header}</h2>`);
					arr.push(
						...b.sections.map((sec) => {
							const paras = sec.paragraphs
								.map((p) => `<p>${paragraphToHtml(p)}</p>`)
								.join("\n");
							return `<div class="quiz-section">
  <h3>${sec.title}</h3>
  ${paras}
  <div class="section-controls">
    <button class="btn-mini btn-check" onclick="checkSection(this)">このセクションを採点</button>
    <button class="btn-mini btn-ans" onclick="showSectionAns(this)">答えを見る</button>
    <button class="btn-mini btn-reset" onclick="resetSection(this)">リセット</button>
  </div>
</div>`;
						}),
					);
					return arr;
				}),
			].join("\n");
			return `<div id="sheet-${i + 1}" class="sheet container ${i === 0 ? "active" : ""}">${inner}</div>`;
		})
		.join("\n");

	const script = `function resizeInput(input){const base=parseInt(input.dataset.baseWidth||'0',10)||80;const dynamic=Math.min(500,Math.max(base,(input.value.length+1)*12));input.style.width=dynamic+'px';}function applyHandlers(root){const inputs=root.querySelectorAll('input.blank');inputs.forEach((input)=>{const wrapper=document.createElement('span');wrapper.className='input-wrapper';input.parentNode.insertBefore(wrapper,input);wrapper.appendChild(input);const tooltip=document.createElement('div');tooltip.className='ans-tooltip';tooltip.innerText=input.dataset.ans.split('|')[0];wrapper.appendChild(tooltip);resizeInput(input);input.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();const section=input.closest('.quiz-section');if(!section)return;const arr=Array.from(section.querySelectorAll('input.blank'));const idx=arr.indexOf(input);if(idx>=0&&idx<arr.length-1){arr[idx+1].focus();}}});input.addEventListener('input',()=>{input.classList.remove('correct','incorrect');wrapper.classList.remove('show-ans');resizeInput(input);});});}function switchSheet(n){document.querySelectorAll('.sheet').forEach(el=>el.classList.remove('active'));document.getElementById('sheet-'+n)?.classList.add('active');document.querySelectorAll('.nav-btn').forEach(el=>el.classList.remove('active'));const btns=document.querySelectorAll('.nav-btn');if(btns[n-1]) btns[n-1].classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}window.checkSection=function(btn){const section=btn.closest('.quiz-section');const inputs=section.querySelectorAll('input.blank');inputs.forEach((input)=>{const val=input.value.trim().replace(/\s+/g,'');const answers=input.dataset.ans.split('|');const ok=answers.some((a)=>val===a||val===a.replace(/・/g,''));if(ok){input.classList.add('correct');input.classList.remove('incorrect');input.parentElement.classList.remove('show-ans');}else{input.classList.add('incorrect');input.classList.remove('correct');}});};window.showSectionAns=function(btn){const section=btn.closest('.quiz-section');section.querySelectorAll('input.blank').forEach((input)=>{if(!input.classList.contains('correct')){input.parentElement.classList.add('show-ans');input.classList.add('incorrect');}});};window.resetSection=function(btn){const section=btn.closest('.quiz-section');section.querySelectorAll('input.blank').forEach((input)=>{input.value='';input.classList.remove('correct','incorrect');input.parentElement.classList.remove('show-ans');resizeInput(input);});};document.addEventListener('DOMContentLoaded',()=>applyHandlers(document));`;

	return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${docs[0]?.title ?? "Quiz"}</title><style>${style}</style></head><body>${nav}${sheets}<script>${script}<\/script></body></html>`;
}

function renderReact(docs: Doc[], styleSettings: StyleSettings) {
	const style = generateStyle(styleSettings);
	const escapedStyle = style.replace(/`/g, "\\`");
	// React版はページ切替用に setPage を内包させる
	return `import { useEffect, useRef, useState } from "react";

const style = \`${escapedStyle}\`;

export function GeneratedQuiz({ title = "${docs[0]?.title ?? "Quiz"}" }) {
  const ref = useRef(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const resizeInput = (input) => {
      const base = parseInt(input.dataset.baseWidth || "0", 10) || 80;
      const dynamic = Math.min(500, Math.max(base, (input.value.length + 1) * 12));
      input.style.width = dynamic + "px";
    };
    const inputs = root.querySelectorAll('input.blank');
    inputs.forEach((input) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'input-wrapper';
      input.parentNode?.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      const tooltip = document.createElement('div');
      tooltip.className = 'ans-tooltip';
      tooltip.innerText = (input.dataset.ans || '').split('|')[0];
      wrapper.appendChild(tooltip);
      resizeInput(input);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const section = input.closest('.quiz-section');
          if (!section) return;
          const arr = Array.from(section.querySelectorAll('input.blank'));
          const idx = arr.indexOf(input);
          if (idx >= 0 && idx < arr.length - 1) arr[idx + 1].focus();
        }
      });
      input.addEventListener('input', () => {
        input.classList.remove('correct', 'incorrect');
        wrapper.classList.remove('show-ans');
        resizeInput(input);
      });
    });
  }, []);

  const checkSection = (btn) => {
    const section = btn.closest('.quiz-section');
    if (!section) return;
    section.querySelectorAll('input.blank').forEach((input) => {
      const val = input.value.trim().replace(/\\s+/g, '');
      const answers = (input.dataset.ans || '').split('|');
      const ok = answers.some((a) => val === a || val === a.replace(/・/g, ''));
      if (ok) { input.classList.add('correct'); input.classList.remove('incorrect'); input.parentElement?.classList.remove('show-ans'); }
      else { input.classList.add('incorrect'); input.classList.remove('correct'); }
    });
  };

  const showSectionAns = (btn) => {
    const section = btn.closest('.quiz-section');
    if (!section) return;
    section.querySelectorAll('input.blank').forEach((input) => {
      if (!input.classList.contains('correct')) {
        input.parentElement?.classList.add('show-ans');
        input.classList.add('incorrect');
      }
    });
  };

  const resetSection = (btn) => {
    const section = btn.closest('.quiz-section');
    if (!section) return;
    section.querySelectorAll('input.blank').forEach((input) => {
      input.value = '';
      input.classList.remove('correct', 'incorrect');
      input.parentElement?.classList.remove('show-ans');
      const base = parseInt(input.dataset.baseWidth || "0", 10) || 80;
      const dynamic = Math.min(500, Math.max(base, (input.value.length + 1) * 12));
      input.style.width = dynamic + "px";
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div className="container" ref={ref}>
        {${docs.length > 1 ? "true" : "false"} && (
          <div className="nav-bar">
            ${docs
							.map(
								(_, i) =>
									`<button className=\\"nav-btn\\" onClick={() => setPage(${i})}>第${i + 1}回</button>`,
							)
							.join("")}
          </div>
        )}
        ${docs
					.map((doc, idx) => {
						const blocks = doc.blocks
							.map((b) => {
								const header = b.header
									? `<h2 className=\\"main-header\\">${b.header}</h2>`
									: "";
								const sections = b.sections
									.map((sec) => {
										const paras = sec.paragraphs
											.map((p) => `<p>${paragraphToHtml(p)}</p>`)
											.join("\\n");
										return `<div className=\\"quiz-section\\">
  <h3>${sec.title}</h3>
  ${paras}
  <div className=\\"section-controls\\">
    <button className=\\"btn-mini btn-check\\" onClick={(e)=>checkSection(e.currentTarget)}>このセクションを採点</button>
    <button className=\\"btn-mini btn-ans\\" onClick={(e)=>showSectionAns(e.currentTarget)}>答えを見る</button>
    <button className=\\"btn-mini btn-reset\\" onClick={(e)=>resetSection(e.currentTarget)}>リセット</button>
  </div>
</div>`;
									})
									.join("\\n");
								return `${header}${sections}`;
							})
							.join("\\n");
						return `<div className=\\"sheet\\" style=\\"display:${idx === 0 ? "block" : "none"}\\">
  <h1 className=\\"sheet-title\\">${idx === 0 ? "{title}" : doc.title}</h1>
  ${blocks}
</div>`;
					})
					.join("")}
      </div>
    </>
  );
}
`;
}

const copyText = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
};

const downloadFile = (content: string, filename: string) => {
	const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

const sanitizeFilename = (name: string) => {
	return name
		.replace(/[<>:"/\\|?*]/g, "")
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]/g, "")
		.substring(0, 50);
};

export default function FillGenPage() {
	const [pages, setPages] = useState<string[]>([defaultInput]);
	const [activePage, setActivePage] = useState(0);
	const [tab, setTab] = useState<"preview" | "html" | "react">("preview");
	const [settings, setSettings] = useState<StyleSettings>(presets.default);
	const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
		null,
	);
	const [selectionRange, setSelectionRange] = useState<{
		start: number;
		end: number;
	} | null>(null);
	const [mounted, setMounted] = useState(false);
	const [history, setHistory] = useState<string[][]>([[defaultInput]]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const menuRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const isWrappingRef = useRef(false);

	const resizeInputElement = (input: HTMLInputElement) => {
		const base = Number.parseInt(input.dataset.baseWidth ?? "0", 10) || 80;
		const dynamic = Math.min(
			500,
			Math.max(base, (input.value.length + 1) * 12),
		);
		input.style.width = `${dynamic}px`;
	};

	const docs = useMemo(() => pages.map((p) => parseDoc(p)), [pages]);
	const currentStyle = useMemo(() => generateStyle(settings), [settings]);
	const htmlCode = useMemo(() => renderHtml(docs, settings), [docs, settings]);
	const reactCode = useMemo(
		() => renderReact(docs, settings),
		[docs, settings],
	);

	const wrapSelectionAsBlank = useCallback(() => {
		const ta = textareaRef.current;
		if (!ta) return;
		const fallbackStart = ta.selectionStart;
		const fallbackEnd = ta.selectionEnd;
		const start = selectionRange?.start ?? fallbackStart;
		const end = selectionRange?.end ?? fallbackEnd;
		if (
			start === null ||
			end === null ||
			start === undefined ||
			end === undefined ||
			start === end
		) {
			alert("先にテキストを選択してください");
			return;
		}
		const { value } = ta;
		const selected = value.slice(start, end);
		const before = value.slice(0, start);
		const after = value.slice(end);
		const wrapped = `${before}{{${selected}}}${after}`;

		// 選択を即座にクリア（先に実行）
		isWrappingRef.current = true;
		setMenuPos(null);
		setSelectionRange(null);
		// グローバルな選択範囲も解除
		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
		}
		// 直接テキストエリアの選択もクリア（カーソル位置に折りたたむ）
		const collapsePos = before.length + selected.length + 4;
		ta.setSelectionRange(collapsePos, collapsePos);

		// 履歴に追加
		setHistory((prev) => {
			const newHistory = prev.slice(0, historyIndex + 1);
			const newPages = [...pages];
			newPages[activePage] = wrapped;
			return [...newHistory, newPages];
		});
		setHistoryIndex((prev) => prev + 1);

		setPages((prev) => {
			const next = [...prev];
			next[activePage] = wrapped;
			return next;
		});

		// テキスト更新後にカーソル位置を設定（複数回実行して確実に選択を解除）
		requestAnimationFrame(() => {
			if (!textareaRef.current) return;
			// メニューを確実に非表示にする
			setMenuPos(null);
			const ta2 = textareaRef.current;
			// グローバルな選択範囲も解除
			const selection2 = window.getSelection();
			if (selection2) {
				selection2.removeAllRanges();
			}
			ta2.focus({ preventScroll: true });
			ta2.setSelectionRange(collapsePos, collapsePos);
			// もう一度確実に選択を解除
			requestAnimationFrame(() => {
				if (!textareaRef.current) return;
				// メニューを確実に非表示にする
				setMenuPos(null);
				const ta3 = textareaRef.current;
				// グローバルな選択範囲も解除
				const selection3 = window.getSelection();
				if (selection3) {
					selection3.removeAllRanges();
				}
				ta3.setSelectionRange(collapsePos, collapsePos);
				// さらに一度確実に選択を解除
				setTimeout(() => {
					if (!textareaRef.current) return;
					// メニューを確実に非表示にする
					setMenuPos(null);
					const ta4 = textareaRef.current;
					// グローバルな選択範囲も解除
					const selection4 = window.getSelection();
					if (selection4) {
						selection4.removeAllRanges();
					}
					ta4.setSelectionRange(collapsePos, collapsePos);
					isWrappingRef.current = false;
				}, 0);
			});
		});
	}, [activePage, selectionRange, pages, historyIndex]);

	const openCaretMenu = useCallback(
		(opts?: {
			start?: number;
			end?: number;
			suppressAlert?: boolean;
			anchor?: { left: number; top: number };
		}) => {
			// 穴埋め化処理中はメニューを表示しない
			if (isWrappingRef.current) return;
			const ta = textareaRef.current;
			if (!ta) return;
			const start = opts?.start ?? selectionRange?.start ?? ta.selectionStart;
			const end = opts?.end ?? selectionRange?.end ?? ta.selectionEnd;
			if (
				start === null ||
				end === null ||
				start === undefined ||
				end === undefined ||
				start === end
			) {
				if (!opts?.suppressAlert) {
					alert("先にテキストを選択してください");
				}
				return;
			}

			if (opts?.anchor) {
				setSelectionRange({ start, end });
				setMenuPos({
					left: Math.round(opts.anchor.left),
					top: Math.round(opts.anchor.top),
				});
				return;
			}

			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				const rect = range.getBoundingClientRect();
				if (rect.width || rect.height) {
					setSelectionRange({ start, end });
					setMenuPos({
						left: Math.round(rect.left + rect.width / 2),
						top: Math.round(rect.top + rect.height),
					});
					return;
				}
			}

			const caretPos = getCaretScreenPosition(ta);
			if (caretPos) {
				setSelectionRange({ start, end });
				setMenuPos({
					left: Math.round(caretPos.left),
					top: Math.round(caretPos.top),
				});
				return;
			}

			// フォールバック：テキストエリア中央
			const rect = ta.getBoundingClientRect();
			setSelectionRange({ start, end });
			setMenuPos({
				left: Math.round(rect.left + rect.width / 2),
				top: Math.round(rect.top + rect.height / 2),
			});
		},
		[selectionRange],
	);

	// Preview side effects
	useEffect(() => {
		const root = containerRef.current;
		if (!root) return;
		root
			.querySelectorAll(".input-wrapper")
			.forEach((w) => w.replaceWith(...Array.from(w.childNodes)));
		root.querySelectorAll(".ans-tooltip").forEach((n) => n.remove());

		const inputs = root.querySelectorAll<HTMLInputElement>("input.blank");
		inputs.forEach((input) => {
			const wrapper = document.createElement("span");
			wrapper.className = "input-wrapper";
			input.parentNode?.insertBefore(wrapper, input);
			wrapper.appendChild(input);
			const tooltip = document.createElement("div");
			tooltip.className = "ans-tooltip";
			tooltip.innerText = (input.dataset.ans || "").split("|")[0];
			wrapper.appendChild(tooltip);
			resizeInputElement(input);
			input.onkeydown = (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					const sec = input.closest(".quiz-section");
					if (!sec) return;
					const arr = Array.from(
						sec.querySelectorAll<HTMLInputElement>("input.blank"),
					);
					const idx = arr.indexOf(input);
					if (idx >= 0 && idx < arr.length - 1) arr[idx + 1].focus();
				}
			};
			input.oninput = () => {
				input.classList.remove("correct", "incorrect");
				wrapper.classList.remove("show-ans");
				resizeInputElement(input);
			};
		});
	}, [docs, activePage, tab]);

	const checkSection = (btn: HTMLButtonElement) => {
		const section = btn.closest(".quiz-section");
		if (!section) return;
		const inputs = section.querySelectorAll<HTMLInputElement>("input.blank");
		inputs.forEach((input) => {
			const val = input.value.trim().replace(/\s+/g, "");
			const answers = (input.dataset.ans || "").split("|");
			const ok = answers.some((a) => val === a || val === a.replace(/・/g, ""));
			if (ok) {
				input.classList.add("correct");
				input.classList.remove("incorrect");
				input.parentElement?.classList.remove("show-ans");
			} else {
				input.classList.add("incorrect");
				input.classList.remove("correct");
			}
		});
	};

	const showSectionAns = (btn: HTMLButtonElement) => {
		const section = btn.closest(".quiz-section");
		if (!section) return;
		section
			.querySelectorAll<HTMLInputElement>("input.blank")
			.forEach((input) => {
				if (!input.classList.contains("correct")) {
					input.parentElement?.classList.add("show-ans");
					input.classList.add("incorrect");
				}
			});
	};

	const resetSection = (btn: HTMLButtonElement) => {
		const section = btn.closest(".quiz-section");
		if (!section) return;
		section
			.querySelectorAll<HTMLInputElement>("input.blank")
			.forEach((input) => {
				input.value = "";
				input.classList.remove("correct", "incorrect");
				input.parentElement?.classList.remove("show-ans");
				resizeInputElement(input);
			});
	};

	const addPage = () => {
		setPages((prev) => [
			...prev,
			"# 新しいページタイトル\n## 見出し\n### セクション\n本文をここに。",
		]);
		setActivePage((prev) => prev + 1);
	};

	const removePage = () => {
		setPages((prev) => {
			if (prev.length === 1) return prev;
			const next = [...prev];
			next.splice(activePage, 1);
			return next;
		});
		setActivePage((prev) => Math.max(0, prev - 1));
	};

	useEffect(() => {
		setMounted(true);
	}, []);

	// pages更新後に選択範囲がnullの場合は選択を確実に解除
	useEffect(() => {
		if (isWrappingRef.current && !selectionRange) {
			const ta = textareaRef.current;
			if (!ta) return;
			// メニューを確実に非表示にする
			setMenuPos(null);
			// グローバルな選択範囲も解除
			const selection = window.getSelection();
			if (selection) {
				selection.removeAllRanges();
			}
			// 選択範囲を確実に解除
			const currentPos = ta.selectionStart ?? 0;
			requestAnimationFrame(() => {
				if (!textareaRef.current) return;
				// メニューを確実に非表示にする
				setMenuPos(null);
				const ta2 = textareaRef.current;
				const selection2 = window.getSelection();
				if (selection2) {
					selection2.removeAllRanges();
				}
				ta2.setSelectionRange(currentPos, currentPos);
			});
		}
	}, [pages, selectionRange]);

	// メニュー表示時にフォーカス・選択状態を維持
	useEffect(() => {
		// メニューが表示されているときのみ選択を維持
		if (!menuPos || !selectionRange) return;
		// 穴埋め化処理中は選択を再適用しない
		if (isWrappingRef.current) return;
		const ta = textareaRef.current;
		if (!ta) return;
		// メニューが表示されているときのみ実行（nullになったときは実行しない）
		// テキストエリアがフォーカスされているか、メニューが表示されている場合のみ選択を維持
		if (document.activeElement === ta || menuPos) {
			// 選択範囲が有効な場合のみ適用
			if (selectionRange.start !== null && selectionRange.end !== null) {
				ta.focus({ preventScroll: true });
				ta.setSelectionRange(selectionRange.start, selectionRange.end);
			}
		}
	}, [menuPos, selectionRange]);

	// メニューの外側クリックで閉じる（選択は保持）
	useEffect(() => {
		if (!menuPos) return;
		const handlePointerDown = (e: PointerEvent) => {
			if (menuRef.current && menuRef.current.contains(e.target as Node)) {
				return;
			}
			setMenuPos(null);
		};
		document.addEventListener("pointerdown", handlePointerDown, true);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
		};
	}, [menuPos]);

	// テキストエリア内の選択終了を直接捕捉してメニューを出す
	useEffect(() => {
		const ta = textareaRef.current;
		if (!ta) return;
		const handlePointerDown = () => {
			setMenuPos(null);
		};
		const handlePointerUp = (e: PointerEvent) => {
			// 穴埋め化処理中は選択範囲を更新しない
			if (isWrappingRef.current) return;
			const { selectionStart, selectionEnd } = ta;
			if (
				selectionStart === null ||
				selectionEnd === null ||
				selectionStart === selectionEnd
			) {
				return;
			}
			setSelectionRange({ start: selectionStart, end: selectionEnd });
			requestAnimationFrame(() => {
				openCaretMenu({
					start: selectionStart,
					end: selectionEnd,
					suppressAlert: true,
					anchor: { left: e.clientX, top: e.clientY },
				});
			});
		};
		ta.addEventListener("pointerdown", handlePointerDown);
		ta.addEventListener("pointerup", handlePointerUp);
		return () => {
			ta.removeEventListener("pointerdown", handlePointerDown);
			ta.removeEventListener("pointerup", handlePointerUp);
		};
	}, [openCaretMenu]);

	// 最終的な選択完了をグローバルに検知してメニューを出す
	useEffect(() => {
		const handler = () => {
			// 穴埋め化処理中は選択範囲を更新しない
			if (isWrappingRef.current) return;
			const ta = textareaRef.current;
			if (!ta) return;
			if (document.activeElement !== ta) return;
			const { selectionStart, selectionEnd } = ta;
			if (
				selectionStart === null ||
				selectionEnd === null ||
				selectionStart === selectionEnd
			) {
				return;
			}
			setSelectionRange({ start: selectionStart, end: selectionEnd });
			requestAnimationFrame(() => {
				openCaretMenu({
					start: selectionStart,
					end: selectionEnd,
					suppressAlert: true,
				});
			});
		};
		document.addEventListener("mouseup", handler);
		document.addEventListener("keyup", handler);
		return () => {
			document.removeEventListener("mouseup", handler);
			document.removeEventListener("keyup", handler);
		};
	}, [openCaretMenu]);

	// Ctrl+ZでUndo
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
				const ta = textareaRef.current;
				if (!ta || document.activeElement !== ta) return;
				e.preventDefault();
				if (historyIndex > 0) {
					const prevIndex = historyIndex - 1;
					setHistoryIndex(prevIndex);
					setPages([...history[prevIndex]]);
					requestAnimationFrame(() => {
						if (textareaRef.current) {
							textareaRef.current.focus();
						}
					});
				}
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [history, historyIndex]);

	if (!mounted) {
		return null;
	}

	return (
		<Box sx={{ py: 4, px: { xs: 2, md: 3 } }}>
			<Box sx={{ maxWidth: 1180, mx: "auto" }}>
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/" },
						{ label: "Tools", href: "/tools" },
						{ label: "穴埋めプリントジェネレーター", isCurrent: true },
					]}
					className="mb-3"
				/>

				<Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
					穴埋めプリントジェネレーター
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					テキストに <code>{"{{答え|幅}}"}</code> を挿入して、プレビュー / HTML
					/ React コードを即座に生成します。
				</Typography>

				<Card sx={{ mb: 3 }}>
					<CardContent>
						<Stack spacing={2}>
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
								sx={{ flexWrap: "wrap", gap: 1 }}
							>
								<Tabs
									value={activePage}
									onChange={(_, value) => setActivePage(value)}
									variant="scrollable"
									allowScrollButtonsMobile
									sx={{ flexGrow: 1, minWidth: 0 }}
								>
									{pages.map((_, i) => (
										<Tab key={i} value={i} label={`ページ ${i + 1}`} />
									))}
								</Tabs>
								<Stack direction="row" spacing={1}>
									<Button
										variant="contained"
										startIcon={<Add />}
										onClick={addPage}
										size="small"
									>
										ページ追加
									</Button>
									<Button
										variant="outlined"
										color="inherit"
										startIcon={<Delete />}
										onClick={removePage}
										disabled={pages.length === 1}
										size="small"
									>
										ページ削除
									</Button>
								</Stack>
							</Stack>

							<TextField
								value={pages[activePage]}
								onChange={(e) =>
									setPages((prev) => {
										const next = [...prev];
										next[activePage] = e.target.value;
										return next;
									})
								}
								inputRef={textareaRef}
								onSelect={(e) => {
									// 穴埋め化処理中は選択範囲を更新しない
									if (isWrappingRef.current) return;
									const { selectionStart, selectionEnd } = e.currentTarget;
									if (selectionStart !== null && selectionEnd !== null) {
										setSelectionRange({
											start: selectionStart,
											end: selectionEnd,
										});
									}
								}}
								onMouseUp={(e) => {
									// 穴埋め化処理中は選択範囲を更新しない
									if (isWrappingRef.current) return;
									const { selectionStart, selectionEnd } = e.currentTarget;
									if (selectionStart !== null && selectionEnd !== null) {
										setSelectionRange({
											start: selectionStart,
											end: selectionEnd,
										});
										if (selectionStart !== selectionEnd) {
											const start = selectionStart;
											const end = selectionEnd;
											const mouseLeft = e.clientX;
											const mouseTop = e.clientY;
											requestAnimationFrame(() => {
												if (mouseLeft || mouseTop) {
													openCaretMenu({
														start,
														end,
														suppressAlert: true,
														anchor: { left: mouseLeft, top: mouseTop },
													});
													return;
												}
												openCaretMenu({
													start,
													end,
													suppressAlert: true,
												});
											});
										}
									}
								}}
								onKeyUp={(e) => {
									// 穴埋め化処理中は選択範囲を更新しない
									if (isWrappingRef.current) return;
									const { selectionStart, selectionEnd } = e.currentTarget;
									if (selectionStart !== null && selectionEnd !== null) {
										setSelectionRange({
											start: selectionStart,
											end: selectionEnd,
										});
										if (selectionStart !== selectionEnd) {
											const start = selectionStart;
											const end = selectionEnd;
											requestAnimationFrame(() => {
												openCaretMenu({
													start,
													end,
													suppressAlert: true,
												});
											});
										}
									}
								}}
								multiline
								minRows={14}
								fullWidth
								placeholder="# タイトル\n## 見出し\n### セクション\n本文を入力"
								sx={{
									fontFamily: "Menlo, monospace",
									"& .MuiInputBase-input": { fontFamily: "Menlo, monospace" },
								}}
							/>
							<Typography variant="caption" color="text.secondary">
								記法: <code>#</code> タイトル, <code>##</code> メイン見出し,{" "}
								<code>###</code>
								セクション見出し, 空行で段落区切り。
							</Typography>
						</Stack>
					</CardContent>
				</Card>

				<Card>
					<CardContent>
						<Stack spacing={2}>
							<Stack direction="row" alignItems="center" spacing={2}>
								<Tabs
									value={tab}
									onChange={(_, value) =>
										setTab(value as "preview" | "html" | "react")
									}
								>
									<Tab label="プレビュー" value="preview" />
									<Tab label="HTML" value="html" />
									<Tab label="React" value="react" />
								</Tabs>
								<Box sx={{ flexGrow: 1 }} />
								{tab !== "preview" && (
									<Stack direction="row" spacing={1}>
										<Button
											variant="outlined"
											startIcon={<Download />}
											onClick={() => {
												const content = tab === "html" ? htmlCode : reactCode;
												const title = docs[0]?.title ?? "quiz";
												const sanitizedTitle = sanitizeFilename(title);
												const filename =
													tab === "html"
														? `${sanitizedTitle}.html`
														: `${sanitizedTitle}.tsx`;
												downloadFile(content, filename);
											}}
										>
											ダウンロード
										</Button>
										<Button
											variant="outlined"
											onClick={async () => {
												const ok = await copyText(
													tab === "html" ? htmlCode : reactCode,
												);
												alert(ok ? "コピーしました" : "コピー失敗");
											}}
										>
											コピー
										</Button>
									</Stack>
								)}
							</Stack>

							{tab === "preview" && (
								<Paper
									variant="outlined"
									sx={{
										p: 2,
										bgcolor: "#fafafa",
										borderRadius: 2,
										maxHeight: "80vh",
										overflow: "auto",
									}}
								>
									<style>{currentStyle}</style>
									{docs.length > 1 && (
										<div
											className="nav-bar"
											style={{
												position: "sticky",
												top: 0,
												background: "#fff",
												padding: 8,
												zIndex: 5,
											}}
										>
											{docs.map((_, i) => (
												<button
													key={i}
													className={`nav-btn ${i === activePage ? "active" : ""}`}
													onClick={() => setActivePage(i)}
													style={{
														marginRight: 8,
														padding: "6px 12px",
														borderRadius: 20,
														border:
															i === activePage
																? "1px solid #2c3e50"
																: "1px solid #ccc",
														background: i === activePage ? "#2c3e50" : "#fff",
														color: i === activePage ? "#fff" : "#555",
													}}
												>
													第{i + 1}回
												</button>
											))}
										</div>
									)}

									{docs.map((doc, idx) => (
										<div
											key={idx}
											className={`sheet ${idx === activePage ? "active" : ""}`}
											style={{ display: idx === activePage ? "block" : "none" }}
											ref={idx === activePage ? containerRef : undefined}
										>
											<h1 className="sheet-title">{doc.title}</h1>
											{doc.blocks.map((block, i) => (
												<div key={i}>
													{block.header && (
														<h2 className="main-header">{block.header}</h2>
													)}
													{block.sections.map((sec, j) => (
														<div key={j} className="quiz-section">
															<h3>{sec.title}</h3>
															{sec.paragraphs.map((p, k) => (
																<p
																	key={k}
																	dangerouslySetInnerHTML={{
																		__html: paragraphToHtml(p),
																	}}
																/>
															))}
															<div className="section-controls">
																<button
																	className="btn-mini btn-check"
																	onClick={(e) => checkSection(e.currentTarget)}
																>
																	このセクションを採点
																</button>
																<button
																	className="btn-mini btn-ans"
																	onClick={(e) =>
																		showSectionAns(e.currentTarget)
																	}
																>
																	答えを見る
																</button>
																<button
																	className="btn-mini btn-reset"
																	onClick={(e) => resetSection(e.currentTarget)}
																>
																	リセット
																</button>
															</div>
														</div>
													))}
												</div>
											))}
										</div>
									))}
								</Paper>
							)}

							{tab === "preview" && (
								<Card sx={{ mt: 2 }}>
									<CardContent>
										<Stack spacing={2}>
											<Stack
												direction="row"
												alignItems="center"
												justifyContent="space-between"
											>
												<Typography variant="h6" fontWeight={700}>
													スタイル設定
												</Typography>
												<FormControl size="small" sx={{ minWidth: 200 }}>
													<InputLabel>プリセット</InputLabel>
													<Select
														value={
															Object.keys(presets).find(
																(key) =>
																	JSON.stringify(presets[key]) ===
																	JSON.stringify(settings),
															) ?? "custom"
														}
														label="プリセット"
														onChange={(e) => {
															const presetName = e.target.value;
															if (
																presetName !== "custom" &&
																presets[presetName]
															) {
																setSettings(presets[presetName]);
															}
														}}
													>
														{Object.keys(presets).map((key) => (
															<MenuItem key={key} value={key}>
																{key === "default"
																	? "デフォルト"
																	: key === "modern"
																		? "モダン"
																		: key === "warm"
																			? "ウォーム"
																			: key === "minimal"
																				? "ミニマル"
																				: key}
															</MenuItem>
														))}
														<MenuItem value="custom">カスタム</MenuItem>
													</Select>
												</FormControl>
											</Stack>

											<Divider />

											<Accordion defaultExpanded>
												<AccordionSummary expandIcon={<ExpandMoreIcon />}>
													<Typography fontWeight={600}>色設定</Typography>
												</AccordionSummary>
												<AccordionDetails>
													<Grid container spacing={2}>
														<Grid item xs={12} sm={6}>
															<Stack spacing={1}>
																<Typography variant="body2">背景色</Typography>
																<input
																	type="color"
																	value={settings.colors.bgColor}
																	onChange={(e) =>
																		setSettings({
																			...settings,
																			colors: {
																				...settings.colors,
																				bgColor: e.target.value,
																			},
																		})
																	}
																	style={{
																		width: "100%",
																		height: 40,
																		border: "1px solid #ddd",
																		borderRadius: 4,
																	}}
																/>
															</Stack>
														</Grid>
														<Grid item xs={12} sm={6}>
															<Stack spacing={1}>
																<Typography variant="body2">
																	テキスト色
																</Typography>
																<input
																	type="color"
																	value={settings.colors.textColor}
																	onChange={(e) =>
																		setSettings({
																			...settings,
																			colors: {
																				...settings.colors,
																				textColor: e.target.value,
																			},
																		})
																	}
																	style={{
																		width: "100%",
																		height: 40,
																		border: "1px solid #ddd",
																		borderRadius: 4,
																	}}
																/>
															</Stack>
														</Grid>
														<Grid item xs={12} sm={6}>
															<Stack spacing={1}>
																<Typography variant="body2">
																	アクセント色
																</Typography>
																<input
																	type="color"
																	value={settings.colors.accentColor}
																	onChange={(e) =>
																		setSettings({
																			...settings,
																			colors: {
																				...settings.colors,
																				accentColor: e.target.value,
																			},
																		})
																	}
																	style={{
																		width: "100%",
																		height: 40,
																		border: "1px solid #ddd",
																		borderRadius: 4,
																	}}
																/>
															</Stack>
														</Grid>
														<Grid item xs={12} sm={6}>
															<Stack spacing={1}>
																<Typography variant="body2">正解色</Typography>
																<input
																	type="color"
																	value={settings.colors.correctColor}
																	onChange={(e) =>
																		setSettings({
																			...settings,
																			colors: {
																				...settings.colors,
																				correctColor: e.target.value,
																			},
																		})
																	}
																	style={{
																		width: "100%",
																		height: 40,
																		border: "1px solid #ddd",
																		borderRadius: 4,
																	}}
																/>
															</Stack>
														</Grid>
														<Grid item xs={12} sm={6}>
															<Stack spacing={1}>
																<Typography variant="body2">
																	不正解色
																</Typography>
																<input
																	type="color"
																	value={settings.colors.incorrectColor}
																	onChange={(e) =>
																		setSettings({
																			...settings,
																			colors: {
																				...settings.colors,
																				incorrectColor: e.target.value,
																			},
																		})
																	}
																	style={{
																		width: "100%",
																		height: 40,
																		border: "1px solid #ddd",
																		borderRadius: 4,
																	}}
																/>
															</Stack>
														</Grid>
														<Grid item xs={12} sm={6}>
															<Stack spacing={1}>
																<Typography variant="body2">
																	ブロック背景色
																</Typography>
																<input
																	type="color"
																	value={settings.colors.blockBg}
																	onChange={(e) =>
																		setSettings({
																			...settings,
																			colors: {
																				...settings.colors,
																				blockBg: e.target.value,
																			},
																		})
																	}
																	style={{
																		width: "100%",
																		height: 40,
																		border: "1px solid #ddd",
																		borderRadius: 4,
																	}}
																/>
															</Stack>
														</Grid>
													</Grid>
												</AccordionDetails>
											</Accordion>

											<Accordion>
												<AccordionSummary expandIcon={<ExpandMoreIcon />}>
													<Typography fontWeight={600}>
														テキストサイズ
													</Typography>
												</AccordionSummary>
												<AccordionDetails>
													<Stack spacing={3}>
														<Box>
															<Typography gutterBottom>
																基本サイズ: {settings.textSize.base}px
															</Typography>
															<Slider
																value={settings.textSize.base}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		textSize: {
																			...settings.textSize,
																			base: value as number,
																		},
																	})
																}
																min={12}
																max={24}
																step={1}
															/>
														</Box>
														<Box>
															<Typography gutterBottom>
																タイトルサイズ: {settings.textSize.title}px
															</Typography>
															<Slider
																value={settings.textSize.title}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		textSize: {
																			...settings.textSize,
																			title: value as number,
																		},
																	})
																}
																min={18}
																max={36}
																step={1}
															/>
														</Box>
														<Box>
															<Typography gutterBottom>
																見出しサイズ: {settings.textSize.header}px
															</Typography>
															<Slider
																value={settings.textSize.header}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		textSize: {
																			...settings.textSize,
																			header: value as number,
																		},
																	})
																}
																min={14}
																max={28}
																step={1}
															/>
														</Box>
														<Box>
															<Typography gutterBottom>
																セクションサイズ: {settings.textSize.section}px
															</Typography>
															<Slider
																value={settings.textSize.section}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		textSize: {
																			...settings.textSize,
																			section: value as number,
																		},
																	})
																}
																min={12}
																max={24}
																step={1}
															/>
														</Box>
														<Box>
															<Typography gutterBottom>
																空欄サイズ: {settings.textSize.blank}px
															</Typography>
															<Slider
																value={settings.textSize.blank}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		textSize: {
																			...settings.textSize,
																			blank: value as number,
																		},
																	})
																}
																min={12}
																max={24}
																step={1}
															/>
														</Box>
													</Stack>
												</AccordionDetails>
											</Accordion>

											<Accordion>
												<AccordionSummary expandIcon={<ExpandMoreIcon />}>
													<Typography fontWeight={600}>
														ボタンスタイル
													</Typography>
												</AccordionSummary>
												<AccordionDetails>
													<Stack spacing={3}>
														<Box>
															<Typography gutterBottom>
																角丸: {settings.button.borderRadius}px
															</Typography>
															<Slider
																value={settings.button.borderRadius}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		button: {
																			...settings.button,
																			borderRadius: value as number,
																		},
																	})
																}
																min={0}
																max={20}
																step={1}
															/>
														</Box>
														<Box>
															<Typography gutterBottom>
																フォントサイズ: {settings.button.fontSize}px
															</Typography>
															<Slider
																value={settings.button.fontSize}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		button: {
																			...settings.button,
																			fontSize: value as number,
																		},
																	})
																}
																min={10}
																max={20}
																step={1}
															/>
														</Box>
													</Stack>
												</AccordionDetails>
											</Accordion>

											<Accordion>
												<AccordionSummary expandIcon={<ExpandMoreIcon />}>
													<Typography fontWeight={600}>空欄スタイル</Typography>
												</AccordionSummary>
												<AccordionDetails>
													<Stack spacing={3}>
														<FormControl fullWidth>
															<InputLabel>線のスタイル</InputLabel>
															<Select
																value={settings.blank.borderStyle}
																label="線のスタイル"
																onChange={(e) =>
																	setSettings({
																		...settings,
																		blank: {
																			...settings.blank,
																			borderStyle: e.target.value as
																				| "solid"
																				| "dashed"
																				| "dotted"
																				| "double",
																		},
																	})
																}
															>
																<MenuItem value="solid">実線</MenuItem>
																<MenuItem value="dashed">破線</MenuItem>
																<MenuItem value="dotted">点線</MenuItem>
																<MenuItem value="double">二重線</MenuItem>
															</Select>
														</FormControl>
														<Box>
															<Typography gutterBottom>
																線の太さ: {settings.blank.borderWidth}px
															</Typography>
															<Slider
																value={settings.blank.borderWidth}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		blank: {
																			...settings.blank,
																			borderWidth: value as number,
																		},
																	})
																}
																min={1}
																max={5}
																step={1}
															/>
														</Box>
														<Stack spacing={1}>
															<Typography variant="body2">背景色</Typography>
															<input
																type="color"
																value={settings.blank.backgroundColor}
																onChange={(e) =>
																	setSettings({
																		...settings,
																		blank: {
																			...settings.blank,
																			backgroundColor: e.target.value,
																		},
																	})
																}
																style={{
																	width: "100%",
																	height: 40,
																	border: "1px solid #ddd",
																	borderRadius: 4,
																}}
															/>
														</Stack>
													</Stack>
												</AccordionDetails>
											</Accordion>

											<Accordion>
												<AccordionSummary expandIcon={<ExpandMoreIcon />}>
													<Typography fontWeight={600}>
														ページ切り替えタブスタイル
													</Typography>
												</AccordionSummary>
												<AccordionDetails>
													<Stack spacing={3}>
														<Box>
															<Typography gutterBottom>
																角丸: {settings.navTab.borderRadius}px
															</Typography>
															<Slider
																value={settings.navTab.borderRadius}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		navTab: {
																			...settings.navTab,
																			borderRadius: value as number,
																		},
																	})
																}
																min={0}
																max={30}
																step={1}
															/>
														</Box>
														<Box>
															<Typography gutterBottom>
																フォントサイズ: {settings.navTab.fontSize}px
															</Typography>
															<Slider
																value={settings.navTab.fontSize}
																onChange={(_, value) =>
																	setSettings({
																		...settings,
																		navTab: {
																			...settings.navTab,
																			fontSize: value as number,
																		},
																	})
																}
																min={10}
																max={20}
																step={1}
															/>
														</Box>
													</Stack>
												</AccordionDetails>
											</Accordion>
										</Stack>
									</CardContent>
								</Card>
							)}

							{tab === "html" && (
								<Paper
									component="pre"
									variant="outlined"
									sx={{
										whiteSpace: "pre-wrap",
										wordBreak: "break-word",
										bgcolor: "#0b1021",
										color: "#e6e6e6",
										p: 2,
										borderRadius: 2,
										maxHeight: "80vh",
										overflow: "auto",
									}}
								>
									{htmlCode}
								</Paper>
							)}

							{tab === "react" && (
								<Paper
									component="pre"
									variant="outlined"
									sx={{
										whiteSpace: "pre-wrap",
										wordBreak: "break-word",
										bgcolor: "#0b1021",
										color: "#e6e6e6",
										p: 2,
										borderRadius: 2,
										maxHeight: "80vh",
										overflow: "auto",
									}}
								>
									{reactCode}
								</Paper>
							)}
						</Stack>
					</CardContent>
				</Card>

				{menuPos && !isWrappingRef.current && (
					<div
						ref={menuRef}
						style={{
							position: "fixed",
							top: Math.round(menuPos.top),
							left: Math.round(menuPos.left),
							transform: "translate(-50%, 8px)",
							background: "#fff",
							border: "1px solid #ddd",
							borderRadius: 8,
							boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
							zIndex: 2000,
							padding: 4,
							minWidth: 160,
						}}
						onMouseDown={(e) => {
							// 選択状態を維持するためフォーカス移動を阻止
							e.preventDefault();
						}}
					>
						<button
							type="button"
							style={{
								width: "100%",
								border: "none",
								background: "transparent",
								padding: "10px 12px",
								textAlign: "left",
								fontSize: 14,
								cursor: "pointer",
							}}
							onClick={() => {
								wrapSelectionAsBlank();
							}}
							onMouseDown={(e) => {
								// クリックでフォーカスが移らないよう抑止
								e.preventDefault();
							}}
						>
							選択範囲を穴埋め化
						</button>
					</div>
				)}
			</Box>
		</Box>
	);
}
