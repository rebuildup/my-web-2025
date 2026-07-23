"use client";

import type { ColorInfo } from "@/lib/utils/color";

interface GeneratedPaletteProps {
	generatedColors: ColorInfo[];
	notification: string;
	onCopy: (text: string) => void;
}

export function GeneratedPalette({
	generatedColors,
	notification,
	onCopy,
}: GeneratedPaletteProps) {
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "8px" }}>
			<legend>Generated Palette</legend>
			{generatedColors.length === 0 ? (
				<div
					style={{
						padding: "8px",
						textAlign: "center",
						color: "#999",
						fontSize: "12px",
					}}
				>
					Click "Generate Colors" to begin.
				</div>
			) : (
				<>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
							gap: "6px",
						}}
					>
						{generatedColors.map((color) => (
							<div
								key={color.hex}
								style={{
									display: "flex",
									flexDirection: "column",
									border: "1px solid #ccc",
								}}
							>
								<div
									style={{
										backgroundColor: color.hex,
										height: "80px",
										width: "100%",
									}}
								/>
								<div
									style={{
										padding: "4px",
										fontSize: "11px",
										textAlign: "center",
									}}
								>
									<div
										style={{
											fontFamily: "monospace",
											marginBottom: "2px",
										}}
									>
										{color.hex}
									</div>
									<button
										type="button"
										onClick={() => onCopy(color.hex)}
										style={{
											width: "100%",
											padding: "4px 8px",
											cursor: "pointer",
											fontSize: "11px",
										}}
									>
										Copy
									</button>
								</div>
							</div>
						))}
					</div>
					{notification && (
						<div
							style={{
								marginTop: "8px",
								padding: "4px 8px",
								background: "#f5f5f5",
								border: "1px solid #eee",
								fontSize: "12px",
								textAlign: "center",
							}}
						>
							{notification}
						</div>
					)}
				</>
			)}
		</fieldset>
	);
}
