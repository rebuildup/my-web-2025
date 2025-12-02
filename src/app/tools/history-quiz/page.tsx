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
				const scriptElement = document.createElement("script");
				scriptElement.textContent = script;
				document.body.appendChild(scriptElement);

				// DOMContentLoadedイベントを手動で発火（既にDOMは読み込まれているため）
				const event = new Event("DOMContentLoaded", {
					bubbles: true,
					cancelable: true,
				});
				window.dispatchEvent(event);

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
