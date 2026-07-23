"use client";

import * as QRCode from "qrcode";
import { useEffect, useRef } from "react";
import type { InputType, QRRenderOptions } from "./qr-code.utils";
import {
	generateQRFilename,
	triggerDownload,
	validateInput,
} from "./qr-code.utils";

interface QRCodeDisplayProps {
	processedTexts: string[];
	inputType: InputType;
	isBulkMode: boolean;
	options: QRRenderOptions;
	onReset: () => void;
}

export default function QRCodeDisplay({
	processedTexts,
	inputType,
	isBulkMode,
	options,
	onReset,
}: QRCodeDisplayProps) {
	const { size, margin, errorLevel, foregroundColor, backgroundColor } =
		options;
	const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
	const hasValidInput = processedTexts.length > 0;

	useEffect(() => {
		canvasRefs.current = canvasRefs.current.slice(0, processedTexts.length);

		processedTexts.forEach((text, index) => {
			const canvas = canvasRefs.current[index];
			if (canvas) {
				QRCode.toCanvas(canvas, text, {
					width: size,
					margin: margin,
					errorCorrectionLevel: errorLevel,
					color: {
						dark: foregroundColor,
						light: backgroundColor,
					},
				}).catch((err) => {
					console.error("QR Generation Error:", err);
				});
			}
		});
	}, [
		processedTexts,
		size,
		margin,
		errorLevel,
		foregroundColor,
		backgroundColor,
	]);

	const downloadPNG = () => {
		processedTexts.forEach((_text, index) => {
			const canvas = canvasRefs.current[index];
			if (!canvas) return;
			setTimeout(() => {
				const url = canvas.toDataURL("image/png");
				const filename = generateQRFilename(
					"png",
					index,
					processedTexts.length,
				);
				triggerDownload(url, filename);
			}, index * 200);
		});
	};

	const downloadSVG = () => {
		processedTexts.forEach((text, index) => {
			setTimeout(() => {
				QRCode.toString(text, {
					type: "svg",
					width: size,
					margin: margin,
					errorCorrectionLevel: errorLevel,
					color: {
						dark: foregroundColor,
						light: backgroundColor,
					},
				})
					.then((svg) => {
						const blob = new Blob([svg], {
							type: "image/svg+xml;charset=utf-8",
						});
						const url = URL.createObjectURL(blob);
						const filename = generateQRFilename(
							"svg",
							index,
							processedTexts.length,
						);
						triggerDownload(url, filename);
						setTimeout(() => URL.revokeObjectURL(url), 1000);
					})
					.catch(console.error);
			}, index * 200);
		});
	};

	const testQRCode = () => {
		if (inputType === "url") {
			processedTexts.forEach((text, index) => {
				if (validateInput(text, "url")) {
					setTimeout(() => window.open(text, "_blank"), index * 200);
				}
			});
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<div
				style={{
					border: "1px solid #ccc",
					padding: "15px",
					marginBottom: "20px",
					flex: 1,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "baseline",
						marginBottom: "15px",
					}}
				>
					<h2
						style={{
							fontSize: "1.1rem",
							margin: 0,
							fontWeight: "normal",
						}}
					>
						Generated QR {isBulkMode ? "Codes" : "Code"}
					</h2>
					{isBulkMode && (
						<span style={{ fontSize: "0.85rem", color: "#666" }}>
							Total: {processedTexts.length}
						</span>
					)}
				</div>

				<div className="w-full bg-[#f9f9f9] border border-[#eee] flex flex-wrap gap-5 items-center justify-center p-5 box-border min-h-[300px] overflow-y-auto flex-1">
					{processedTexts.length > 0 ? (
						processedTexts.map((text, index) => (
							<div
								key={text}
								className="flex flex-col items-center gap-2.5 bg-white p-2.5 border border-[#ddd] shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
							>
								<canvas
									ref={(el) => {
										canvasRefs.current[index] = el;
									}}
									style={{
										width: "100%",
										maxWidth: `${size}px`,
										height: "auto",
										display: "block",
									}}
								/>
								<div
									style={{
										fontSize: "0.75rem",
										color: "#666",
										maxWidth: "150px",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
									title={text}
								>
									#{index + 1}: {text}
								</div>
							</div>
						))
					) : (
						<span style={{ color: "#999" }}>[ No Data ]</span>
					)}
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "10px",
						marginTop: "15px",
					}}
				>
					<button
						onClick={downloadPNG}
						disabled={!hasValidInput}
						style={{ fontSize: "13px", padding: "4px 8px" }}
					>
						Download PNG
					</button>
					<button
						onClick={downloadSVG}
						disabled={!hasValidInput}
						style={{ fontSize: "13px", padding: "4px 8px" }}
					>
						Download SVG
					</button>
					{inputType === "url" && (
						<button
							onClick={testQRCode}
							disabled={!hasValidInput}
							style={{ fontSize: "13px", padding: "4px 8px" }}
						>
							Test URLs
						</button>
					)}
					<button
						onClick={onReset}
						style={{ fontSize: "13px", padding: "4px 8px" }}
					>
						Reset
					</button>
				</div>
			</div>
		</div>
	);
}
