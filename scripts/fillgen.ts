#!/usr/bin/env tsx
/**
 * Blank quiz generator
 *
 * 入力となるテキストに「{{答え|幅}}」形式のプレースホルダを挿入すると、
 * ・単独のHTMLページ (--html)
 * ・Reactコンポーネント (--react)
 * を生成する簡易ツール。
 *
 * 入力フォーマット（最小限）:
 *   # シートタイトル
 *   ## メイン見出し
 *   ### セクション見出し
 *   ここに文章。{{大東亜共栄圏|360}} のように書くと空欄に置換される。
 *   空行で段落を区切る。
 *
 * 追加仕様:
 *   - 幅は省略可。省略時は答えの文字数から自動計算。
 *   - 複数正解はスラッシュ区切り: {{ヤルタ協定/ヤルタ会談|140}}
 *   - 同じ入力からHTMLとReactを同時に生成可能:
 *       pnpm tsx scripts/fillgen.ts input.txt --html public/generated-quiz.html --react src/components/GeneratedQuiz.tsx
 *
 * プレビュー:
 *   --preview を付けると --html で指定したファイルをデフォルトブラウザで開く。
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Section = {
	title: string;
	paragraphs: string[];
};

type MainBlock = {
	header: string;
	sections: Section[];
};

type QuizDoc = {
	title: string;
	blocks: MainBlock[];
};

type Options = {
	html?: string;
	react?: string;
	preview?: boolean;
};

const argv = process.argv.slice(2);
if (argv.length === 0 || argv.includes("--help")) {
	console.log(
		[
			"Usage: pnpm tsx scripts/fillgen.ts <input.txt> [--html out.html] [--react out.tsx] [--preview]",
			"",
			"Placeholder syntax: {{答え|幅}}  幅は省略可。複数正解はスラッシュ区切り。",
		].join("\n"),
	);
	process.exit(0);
}

const inputPath = argv[0];
const opts: Options = {};
for (let i = 1; i < argv.length; i += 1) {
	const key = argv[i];
	if (key === "--html") {
		opts.html = argv[i + 1];
		i += 1;
	} else if (key === "--react") {
		opts.react = argv[i + 1];
		i += 1;
	} else if (key === "--preview") {
		opts.preview = true;
	} else {
		console.warn(`Unknown option: ${key}`);
	}
}

if (!existsSync(inputPath)) {
	console.error(`Input file not found: ${inputPath}`);
	process.exit(1);
}

const raw = readFileSync(inputPath, "utf8");

function parse(text: string): QuizDoc {
	const lines = text.split(/\r?\n/);
	let title = "Quiz";
	const blocks: MainBlock[] = [];
	let currentMain: MainBlock | undefined;
	let currentSection: Section | undefined;
	let paragraphBuffer: string[] = [];

	const flushParagraph = () => {
		if (currentSection && paragraphBuffer.length) {
			currentSection.paragraphs.push(paragraphBuffer.join(" "));
			paragraphBuffer = [];
		}
	};

	lines.forEach((line) => {
		if (/^#\s+/.test(line)) {
			title = line.replace(/^#\s+/, "").trim();
		} else if (/^##\s+/.test(line)) {
			flushParagraph();
			currentSection = undefined;
			const header = line.replace(/^##\s+/, "").trim();
			currentMain = { header, sections: [] };
			blocks.push(currentMain);
		} else if (/^###\s+/.test(line)) {
			flushParagraph();
			if (!currentMain) {
				currentMain = { header: "", sections: [] };
				blocks.push(currentMain);
			}
			const sectionTitle = line.replace(/^###\s+/, "").trim();
			currentSection = { title: sectionTitle, paragraphs: [] };
			currentMain.sections.push(currentSection);
		} else if (line.trim() === "") {
			flushParagraph();
		} else {
			paragraphBuffer.push(line.trim());
		}
	});
	flushParagraph();

	return { title, blocks };
}

const doc = parse(raw);

function renderInput(answerRaw: string, widthHint?: string) {
	const answers = answerRaw.split("/").map((a) => a.trim()).filter(Boolean);
	const width =
		widthHint && widthHint.trim() !== ""
			? widthHint
			: Math.min(400, Math.max(60, answers[0].length * 14 + 24)).toString();
	return `<input class="blank" data-ans="${answers.join("|")}" style="width:${width}px">`;
}

const placeholderRe = /\{\{([^}|]+)(?:\|([^}]+))?\}\}/g;
const escapeHtml = (str: string) =>
	str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

function renderParagraph(text: string) {
	return text.replace(placeholderRe, (_, ans, width) => renderInput(ans, width));
}

function renderHtml(doc: QuizDoc) {
	const style = readFileSync(path.join("public", "history-quiz.html"), "utf8")
		.split("<style>")[1]
		.split("</style>")[0];

	const scripts = readFileSync(path.join("public", "history-quiz.html"), "utf8")
		.split("<script>")[1]
		.split("</script>")[0];

	const body = [
		`<div class="container">`,
		`<h1 class="sheet-title">${escapeHtml(doc.title)}</h1>`,
		...doc.blocks.flatMap((block) => {
			const main = [];
			if (block.header) {
				main.push(`<h2 class="main-header">${escapeHtml(block.header)}</h2>`);
			}
			main.push(
				...block.sections.map((sec) => {
					const paras = sec.paragraphs
						.map((p) => `<p>${renderParagraph(p)}</p>`)
						.join("\n");
					return `<div class="quiz-section">
    <h3>${escapeHtml(sec.title)}</h3>
    ${paras}
    <div class="section-controls">
        <button class="btn-mini btn-check" onclick="checkSection(this)">このセクションを採点</button>
        <button class="btn-mini btn-ans" onclick="showSectionAns(this)">答えを見る</button>
        <button class="btn-mini btn-reset" onclick="resetSection(this)">リセット</button>
    </div>
</div>`;
				}),
			);
			return main;
		}),
		`</div>`,
	].join("\n");

	return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.title)}</title>
  <style>${style}</style>
</head>
<body>
${body}
<script>${scripts}</script>
</body>
</html>`;
}

function renderReact(doc: QuizDoc) {
	return `import { useEffect, useRef } from "react";

type Props = { title?: string };

const style = \`
${readFileSync(path.join("public", "history-quiz.html"), "utf8")
	.split("<style>")[1]
	.split("</style>")[0]
	.replace(/`/g, "\\`")}
\`;

export function GeneratedQuiz({ title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const inputs = root.querySelectorAll<HTMLInputElement>("input.blank");
    inputs.forEach((input) => {
      const wrapper = document.createElement("span");
      wrapper.className = "input-wrapper";
      input.parentNode?.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const tooltip = document.createElement("div");
      tooltip.className = "ans-tooltip";
      tooltip.innerText = (input.dataset.ans ?? "").split("|")[0];
      wrapper.appendChild(tooltip);

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const currentSection = input.closest(".quiz-section");
          if (!currentSection) return;
          const sectionInputs = Array.from(currentSection.querySelectorAll<HTMLInputElement>("input.blank"));
          const idx = sectionInputs.indexOf(input);
          if (idx >= 0 && idx < sectionInputs.length - 1) {
            sectionInputs[idx + 1].focus();
          }
        }
      });

      input.addEventListener("input", () => {
        input.classList.remove("correct", "incorrect");
        wrapper.classList.remove("show-ans");
      });
    });
  }, []);

  const checkSection = (btn: HTMLButtonElement) => {
    const section = btn.closest(".quiz-section");
    if (!section) return;
    const inputs = section.querySelectorAll<HTMLInputElement>("input.blank");
    inputs.forEach((input) => {
      const val = input.value.trim().replace(/\\s+/g, "");
      const answers = (input.dataset.ans ?? "").split("|");
      const isMatch = answers.some((ans) => val === ans || val === ans.replace(/・/g, ""));
      if (isMatch) {
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
    const inputs = section.querySelectorAll<HTMLInputElement>("input.blank");
    inputs.forEach((input) => {
      if (!input.classList.contains("correct")) {
        input.parentElement?.classList.add("show-ans");
        input.classList.add("incorrect");
      }
    });
  };

  const resetSection = (btn: HTMLButtonElement) => {
    const section = btn.closest(".quiz-section");
    if (!section) return;
    const inputs = section.querySelectorAll<HTMLInputElement>("input.blank");
    inputs.forEach((input) => {
      input.value = "";
      input.classList.remove("correct", "incorrect");
      input.parentElement?.classList.remove("show-ans");
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div ref={containerRef} className="container">
        <h1 className="sheet-title">{title ?? "${escapeHtml(doc.title)}"}</h1>
        ${doc.blocks
			.map((block) => {
				const mainHeader = block.header
					? `<h2 className="main-header">${escapeHtml(block.header)}</h2>`
					: "";
				const sections = block.sections
					.map((sec) => {
						const paras = sec.paragraphs
							.map((p) => `<p>${renderParagraph(p)}</p>`)
							.join("\\n");
						return `<div className="quiz-section">
  <h3>${escapeHtml(sec.title)}</h3>
  ${paras}
  <div className="section-controls">
    <button className="btn-mini btn-check" onClick={(e)=>checkSection(e.currentTarget)}>このセクションを採点</button>
    <button className="btn-mini btn-ans" onClick={(e)=>showSectionAns(e.currentTarget)}>答えを見る</button>
    <button className="btn-mini btn-reset" onClick={(e)=>resetSection(e.currentTarget)}>リセット</button>
  </div>
</div>`;
					})
					.join("\\n");
				return `${mainHeader}\\n${sections}`;
			})
			.join("\\n")}
      </div>
    </>
  );
}
`;
}

if (opts.html) {
	const htmlOut = renderHtml(doc);
	writeFileSync(opts.html, htmlOut, "utf8");
	console.log(`HTML written: ${opts.html}`);
}

if (opts.react) {
	const reactOut = renderReact(doc);
	writeFileSync(opts.react, reactOut, "utf8");
	console.log(`React component written: ${opts.react}`);
}

if (opts.preview && opts.html) {
	try {
		const resolved = path.resolve(opts.html);
		const opener = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
		execSync(`${opener} "${resolved}"`);
	} catch (err) {
		console.warn("Preview failed:", err);
	}
}
