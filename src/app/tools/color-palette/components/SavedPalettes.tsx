"use client";

import type { ColorInfo } from "@/lib/utils/color";
import type { SavedPalette } from "./color-palette-types";

interface SavedPalettesProps {
	savedPalettes: SavedPalette[];
	onLoad: (colors: ColorInfo[]) => void;
	onDelete: (id: string) => void;
}

export function SavedPalettes({
	savedPalettes,
	onLoad,
	onDelete,
}: SavedPalettesProps) {
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "8px" }}>
			<legend>Saved Palettes</legend>
			<div
				style={{
					maxHeight: "160px",
					overflowY: "auto",
					fontSize: "12px",
				}}
			>
				{savedPalettes.length === 0
					? "No saved palettes."
					: savedPalettes.map((palette) => (
							<div
								key={palette.id}
								style={{
									display: "flex",
									justifyContent: "space-between",
									gap: "8px",
									marginBottom: "4px",
									borderBottom: "1px solid #eee",
									paddingBottom: "4px",
								}}
							>
								<span
									style={{
										minWidth: 0,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{palette.name} ({palette.colors.length}c)
								</span>
								<div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
									<button
										type="button"
										style={{
											padding: "4px 8px",
											cursor: "pointer",
											fontSize: "12px",
										}}
										onClick={() => onLoad(palette.colors)}
									>
										Load
									</button>
									<button
										type="button"
										style={{
											padding: "4px 8px",
											cursor: "pointer",
											fontSize: "12px",
										}}
										onClick={() => onDelete(palette.id)}
									>
										Del
									</button>
								</div>
							</div>
						))}
			</div>
		</fieldset>
	);
}
