"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import type { Doc } from "./types";

export const resizeInputElement = (input: HTMLInputElement) => {
	const base = Number.parseInt(input.dataset.baseWidth ?? "0", 10) || 80;
	const dynamic = Math.min(500, Math.max(base, (input.value.length + 1) * 12));
	input.style.width = `${dynamic}px`;
};

export const checkSection = (btn: HTMLButtonElement) => {
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

export const showSectionAns = (btn: HTMLButtonElement) => {
	const section = btn.closest(".quiz-section");
	if (!section) return;
	section.querySelectorAll<HTMLInputElement>("input.blank").forEach((input) => {
		if (!input.classList.contains("correct")) {
			input.parentElement?.classList.add("show-ans");
			input.classList.add("incorrect");
		}
	});
};

export const resetSection = (btn: HTMLButtonElement) => {
	const section = btn.closest(".quiz-section");
	if (!section) return;
	section.querySelectorAll<HTMLInputElement>("input.blank").forEach((input) => {
		input.value = "";
		input.classList.remove("correct", "incorrect");
		input.parentElement?.classList.remove("show-ans");
		resizeInputElement(input);
	});
};

export function usePreviewSync(
	containerRef: RefObject<HTMLDivElement | null>,
	docs: Doc[],
	activePage: number,
	tab: string,
) {
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
	}, [docs, activePage, tab, containerRef]);
}
