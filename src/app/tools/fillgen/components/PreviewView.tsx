"use client";

import type { RefObject } from "react";
import type { Doc } from "./types";
import { paragraphToHtml } from "./parser";

type Props = {
	docs: Doc[];
	currentStyle: string;
	activePage: number;
	setActivePage: (i: number) => void;
	containerRef: RefObject<HTMLDivElement | null>;
	checkSection: (btn: HTMLButtonElement) => void;
	showSectionAns: (btn: HTMLButtonElement) => void;
	resetSection: (btn: HTMLButtonElement) => void;
};

export function PreviewView({
	docs,
	currentStyle,
	activePage,
	setActivePage,
	containerRef,
	checkSection,
	showSectionAns,
	resetSection,
}: Props) {
	return (
		<div
			style={{
				padding: 16,
				background: "#fafafa",
				borderRadius: 8,
				border: "1px solid #ddd",
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
					{docs.map((doc, i) => (
						<button
							key={doc.title}
							className={`nav-btn ${i === activePage ? "active" : ""}`}
							onClick={() => setActivePage(i)}
							style={{
								marginRight: 8,
								padding: "6px 12px",
								borderRadius: 20,
								border:
									i === activePage ? "1px solid #2c3e50" : "1px solid #ccc",
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
					key={doc.title}
					className={`sheet ${idx === activePage ? "active" : ""}`}
					style={{ display: idx === activePage ? "block" : "none" }}
					ref={idx === activePage ? containerRef : undefined}
				>
					<h2 className="sheet-title">{doc.title}</h2>
					{doc.blocks.map((block) => (
						<div key={block.header ?? `${doc.title}-block`}>
							{block.header && <h3 className="main-header">{block.header}</h3>}
							{block.sections.map((sec, j) => (
								<div key={sec.title ?? `sec-${j}`} className="quiz-section">
									<h4>{sec.title}</h4>
									{sec.paragraphs.map((p, k) => (
										<p
											key={`p-${k}`}
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
											onClick={(e) => showSectionAns(e.currentTarget)}
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
		</div>
	);
}
