"use client";

import type { RefObject } from "react";

type Props = {
	menuPos: { top: number; left: number };
	menuRef: RefObject<HTMLDivElement | null>;
	wrapSelectionAsBlank: () => void;
};

export function CaretMenu({ menuPos, menuRef, wrapSelectionAsBlank }: Props) {
	return (
		<div
			ref={menuRef}
			className="fixed -translate-x-1/2 translate-y-2 bg-white border border-[#ddd] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[2000] p-1 min-w-[160px]"
			style={{
				top: Math.round(menuPos.top),
				left: Math.round(menuPos.left),
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
	);
}
