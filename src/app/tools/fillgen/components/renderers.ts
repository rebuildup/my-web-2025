import { paragraphToHtml } from "./parser";
import { generateStyle } from "./style-generator";
import type { Doc, StyleSettings } from "./types";

export function renderHtml(docs: Doc[], styleSettings: StyleSettings) {
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
				`<h2 class="sheet-title">${doc.title}</h2>`,
				...doc.blocks.flatMap((b) => {
					const arr: string[] = [];
					if (b.header) arr.push(`<h3 class="main-header">${b.header}</h3>`);
					arr.push(
						...b.sections.map((sec) => {
							const paras = sec.paragraphs
								.map((p) => `<p>${paragraphToHtml(p)}</p>`)
								.join("\n");
							return `<div class="quiz-section">
 <h4>${sec.title}</h4>
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

	const script = `function resizeInput(input){const base=parseInt(input.dataset.baseWidth||'0',10)||80;const dynamic=Math.min(500,Math.max(base,(input.value.length+1)*12));input.style.width=dynamic+'px';}function applyHandlers(root){const inputs=root.querySelectorAll('input.blank');inputs.forEach((input)=>{const wrapper=document.createElement('span');wrapper.className='input-wrapper';input.parentNode.insertBefore(wrapper,input);wrapper.appendChild(input);const tooltip=document.createElement('div');tooltip.className='ans-tooltip';tooltip.innerText=input.dataset.ans.split('|')[0];wrapper.appendChild(tooltip);resizeInput(input);input.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();const section=input.closest('.quiz-section');if(!section)return;const arr=Array.from(section.querySelectorAll('input.blank'));const idx=arr.indexOf(input);if(idx>=0&&idx<arr.length-1){arr[idx+1].focus();}}});input.addEventListener('input',()=>{input.classList.remove('correct','incorrect');wrapper.classList.remove('show-ans');resizeInput(input);});});}function switchSheet(n){document.querySelectorAll('.sheet').forEach(el=>el.classList.remove('active'));document.getElementById('sheet-'+n)?.classList.add('active');document.querySelectorAll('.nav-btn').forEach(el=>el.classList.remove('active'));const btns=document.querySelectorAll('.nav-btn');if(btns[n-1]) btns[n-1].classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}window.checkSection=function(btn){const section=btn.closest('.quiz-section');const inputs=section.querySelectorAll('input.blank');inputs.forEach((input)=>{const val=input.value.trim().replace(/\\s+/g,'');const answers=input.dataset.ans.split('|');const ok=answers.some((a)=>val===a||val===a.replace(/・/g,''));if(ok){input.classList.add('correct');input.classList.remove('incorrect');input.parentElement.classList.remove('show-ans');}else{input.classList.add('incorrect');input.classList.remove('correct');}});};window.showSectionAns=function(btn){const section=btn.closest('.quiz-section');section.querySelectorAll('input.blank').forEach((input)=>{if(!input.classList.contains('correct')){input.parentElement.classList.add('show-ans');input.classList.add('incorrect');}});};window.resetSection=function(btn){const section=btn.closest('.quiz-section');section.querySelectorAll('input.blank').forEach((input)=>{input.value='';input.classList.remove('correct','incorrect');input.parentElement.classList.remove('show-ans');resizeInput(input);});};document.addEventListener('DOMContentLoaded',()=>{const root=document.querySelector('.sheet.active');if(root) applyHandlers(root);document.querySelectorAll('.nav-btn').forEach((btn,i)=>{btn.addEventListener('click',()=>setTimeout(()=>{const active=document.querySelector('.sheet.active');if(active) applyHandlers(active);},50));});});`;

	return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${docs[0]?.title ?? "Quiz"}</title><style>${style}</style></head><body>${nav}${sheets}<script>${script}<\/script></body></html>`;
}

export function renderReact(docs: Doc[], styleSettings: StyleSettings) {
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
						? `<h3 className=\\"main-header\\">${b.header}</h3>`
						: "";
					const sections = b.sections
						.map((sec) => {
							const paras = sec.paragraphs
								.map((p) => `<p>${paragraphToHtml(p)}</p>`)
								.join("\\n");
							return `<div className=\\"quiz-section\\">
 <h4>${sec.title}</h4>
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
 <h2 className=\\"sheet-title\\">${idx === 0 ? "{title}" : doc.title}</h2>
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
