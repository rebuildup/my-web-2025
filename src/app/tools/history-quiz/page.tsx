"use client";

import { useEffect, useRef } from "react";

export default function HistoryQuizPage() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		fetch("/history-quiz.html")
			.then((res) => res.text())
			.then((html) => {
				// HTMLのbody部分を抽出
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, "text/html");
				const body = doc.body.innerHTML;
				const style = doc.querySelector("style")?.innerHTML || "";
				const script = doc.querySelector("script")?.innerHTML || "";

				// スタイルを追加
				const styleElement = document.createElement("style");
				styleElement.textContent = style;
				document.head.appendChild(styleElement);

				// ボディの内容を挿入
				if (containerRef.current) {
					containerRef.current.innerHTML = body;
				}

				// スクリプトを実行
				// まず、グローバル関数を定義（DOMContentLoadedの外の部分）
				const scriptElement = document.createElement("script");
				scriptElement.textContent = script;
				document.body.appendChild(scriptElement);

				// DOMContentLoaded内の処理を直接実行
				// コンテナ内のDOMが完全に挿入された後に実行
				setTimeout(() => {
					if (containerRef.current) {
						const inputs = Array.from(
							containerRef.current.querySelectorAll("input.blank"),
						) as HTMLInputElement[];
						inputs.forEach((input) => {
							const wrapper = document.createElement("span");
							wrapper.className = "input-wrapper";
							const parent = input.parentNode;
							if (parent) {
								parent.insertBefore(wrapper, input);
								wrapper.appendChild(input);

								const tooltip = document.createElement("div");
								tooltip.className = "ans-tooltip";
								const ans = input.getAttribute("data-ans");
								if (ans) {
									tooltip.innerText = ans.split("|")[0];
								}
								wrapper.appendChild(tooltip);

								// Add aria-label for accessibility
								input.setAttribute("aria-label", "答えを入力");

								input.addEventListener("keydown", (e) => {
									const keyEvent = e as KeyboardEvent;
									if (keyEvent.key === "Enter") {
										keyEvent.preventDefault();
										// Scope navigation to current section
										const currentSection = input.closest(".quiz-section");
										if (currentSection) {
											const sectionInputs = Array.from(
												currentSection.querySelectorAll("input.blank"),
											) as HTMLInputElement[];
											const idx = sectionInputs.indexOf(input);
											if (idx >= 0 && idx < sectionInputs.length - 1) {
												sectionInputs[idx + 1].focus();
											}
										}
									}
								});

								input.addEventListener("input", () => {
									input.classList.remove("correct", "incorrect");
									wrapper.classList.remove("show-ans");
								});
							}
						});
					}
				}, 0);

				return () => {
					// クリーンアップ
					styleElement.remove();
					scriptElement.remove();
				};
			})
			.catch((err) => {
				console.error("Failed to load HTML:", err);
			});
	}, []);

	return (
		<div
			ref={containerRef}
			style={{
				minHeight: "100vh",
			}}
		/>
	);
}
