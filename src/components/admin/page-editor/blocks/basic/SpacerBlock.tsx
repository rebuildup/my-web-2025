"use client";

import { type CSSProperties } from "react";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

export function SpacerBlock({
	block,
	readOnly,
	onAttributesChange,
}: BlockComponentProps) {
	const lines = Number(block.attributes.lines ?? 1);
	const linePx = 24;
	const height = Math.max(0, Math.round(lines) * linePx);

	const wrapperStyle: CSSProperties = {
		position: "relative",
		border: `1px solid ${adminColor.border}`,
		borderRadius: 12,
		padding: 0,
		backgroundColor: "transparent",
	};
	const previewStyle: CSSProperties = {
		width: "100%",
		height,
		borderRadius: 8,
		border: `1px dashed ${adminColor.border}`,
		backgroundColor: "rgba(255,255,255,0.04)",
	};
	const controlsStyle: CSSProperties = {
		position: "absolute",
		top: 8,
		left: 8,
		right: 8,
		backgroundColor: "rgba(0,0,0,0.3)",
		borderRadius: 4,
		paddingLeft: 8,
		paddingRight: 8,
		paddingTop: 4,
		paddingBottom: 4,
		display: "flex",
		alignItems: "center",
		gap: 8,
		opacity: 0,
		transition: "opacity 120ms ease",
		pointerEvents: "none",
	};
	const inputStyle: CSSProperties = {
		width: 96,
		fontSize: 14,
		padding: "4px 8px",
		border: `1px solid ${adminColor.borderInput}`,
		borderRadius: 4,
		backgroundColor: adminColor.bgPanel,
		color: adminColor.textPrimary,
	};

	return (
		<section style={wrapperStyle} className="block-spacer">
			<div style={previewStyle} />
			<div className="spacer-controls" style={controlsStyle}>
				<span
					style={{
						fontSize: 12,
						opacity: 0.9,
						color: adminColor.textPrimary,
					}}
				>
					Spacer lines
				</span>
				<input
					type="number"
					min={0}
					max={50}
					value={Number.isNaN(lines) ? 0 : lines}
					disabled={readOnly}
					onChange={(e) => {
						const v = Math.max(
							0,
							Math.min(50, Math.floor(Number(e.target.value ?? 0))),
						);
						onAttributesChange({ lines: v, height: v * linePx });
					}}
					style={inputStyle}
				/>
				<span
					style={{
						fontSize: 12,
						color: adminColor.textSecondary,
					}}
				>
					({height}px)
				</span>
			</div>
		</section>
	);
}
