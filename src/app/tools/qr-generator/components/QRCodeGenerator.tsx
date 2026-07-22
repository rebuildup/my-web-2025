"use client";

import * as QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

export default function QRCodeGenerator() {
	const [inputType, setInputType] = useState<
		"url" | "text" | "email" | "phone" | "wifi"
	>("url");
	const [inputText, setInputText] = useState("");
	const [size, setSize] = useState(256);
	const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
	const [margin, setMargin] = useState(4);
	const [foregroundColor, setForegroundColor] = useState("#000000");
	const [backgroundColor, setBackgroundColor] = useState("#ffffff");
	const [processedTexts, setProcessedTexts] = useState<string[]>([]);
	const [isBulkMode, setIsBulkMode] = useState(false);

	const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

	const validateInput = useCallback((text: string, type: string) => {
		if (!text) return false;
		switch (type) {
			case "url":
				return text.startsWith("http://") || text.startsWith("https://");
			case "email":
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
			case "phone":
				return /^[\d\+\-\(\)\s]+$/.test(text);
			case "wifi":
				return text.includes("WIFI:");
			default:
				return true;
		}
	}, []);

	useEffect(() => {
		const handler = setTimeout(() => {
			if (inputText) {
				if (isBulkMode) {
					const texts = inputText
						.split("\n")
						.map((t) => t.trim())
						.filter((t) => t.length > 0);
					setProcessedTexts(texts);
				} else {
					setProcessedTexts([inputText.trim()]);
				}
			} else {
				setProcessedTexts([]);
			}
		}, 500);
		return () => clearTimeout(handler);
	}, [inputText, isBulkMode]);

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
		processedTexts.forEach((text, index) => {
			const canvas = canvasRefs.current[index];
			if (!canvas) return;
			setTimeout(() => {
				const url = canvas.toDataURL("image/png");
				const a = document.createElement("a");
				a.href = url;
				a.download =
					processedTexts.length > 1
						? `qrcode_${index + 1}_${Date.now()}.png`
						: `qrcode_${Date.now()}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			}, index * 200); // Stagger downloads by 200ms
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
						const a = document.createElement("a");
						a.href = url;
						a.download =
							processedTexts.length > 1
								? `qrcode_${index + 1}_${Date.now()}.svg`
								: `qrcode_${Date.now()}.svg`;
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						setTimeout(() => URL.revokeObjectURL(url), 1000);
					})
					.catch(console.error);
			}, index * 200); // Stagger downloads by 200ms
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

	const resetForm = () => {
		setInputText("");
		setSize(256);
		setErrorLevel("M");
		setMargin(4);
		setForegroundColor("#000000");
		setBackgroundColor("#ffffff");
	};

	const hasValidInput = processedTexts.length > 0;

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: 9999,
				backgroundColor: "#ffffff",
				color: "#000000",
				fontFamily: "sans-serif",
				overflowY: "auto",
				padding: "2rem",
			}}
		>
			<div style={{ maxWidth: "900px", margin: "0 auto" }}>
				<nav
					style={{ fontSize: "0.85rem", marginBottom: "1rem", color: "#666" }}
				>
					<a href="/" style={{ color: "#0066cc", textDecoration: "none" }}>
						Home
					</a>
					<span style={{ margin: "0 8px" }}>/</span>
					<a href="/tools" style={{ color: "#0066cc", textDecoration: "none" }}>
						Tools
					</a>
					<span style={{ margin: "0 8px" }}>/</span>
					<span style={{ color: "#000" }}>QR Code Generator</span>
				</nav>

				<h1
					style={{
						borderBottom: "1px solid #ccc",
						paddingBottom: "10px",
						marginBottom: "20px",
						fontSize: "1.5rem",
						fontWeight: "normal",
					}}
				>
					QR Code Generator
				</h1>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "40px",
					}}
				>
					{/* Left Column: Controls */}
					<div>
						<fieldset
							style={{
								border: "1px solid #ccc",
								padding: "15px",
								marginBottom: "20px",
							}}
						>
							<legend>Input Settings</legend>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "100px 1fr",
									gap: "10px",
								}}
							>
								<label htmlFor="inputType" style={{ alignSelf: "center" }}>
									Type:
								</label>
								<select
									id="inputType"
									value={inputType}
									onChange={(e) => setInputType(e.target.value as any)}
								>
									<option value="url">URL</option>
									<option value="text">Text</option>
									<option value="email">Email</option>
									<option value="phone">Phone</option>
									<option value="wifi">WiFi</option>
								</select>

								<label style={{ alignSelf: "center" }}>Mode:</label>
								<div
									style={{ display: "flex", alignItems: "center", gap: "15px" }}
								>
									<label
										style={{
											display: "flex",
											alignItems: "center",
											gap: "5px",
											cursor: "pointer",
										}}
									>
										<input
											type="radio"
											checked={!isBulkMode}
											onChange={() => setIsBulkMode(false)}
										/>
										Single
									</label>
									<label
										style={{
											display: "flex",
											alignItems: "center",
											gap: "5px",
											cursor: "pointer",
										}}
									>
										<input
											type="radio"
											checked={isBulkMode}
											onChange={() => setIsBulkMode(true)}
										/>
										Bulk
									</label>
								</div>

								<label
									htmlFor="inputText"
									style={{
										alignSelf: isBulkMode ? "start" : "center",
										marginTop: isBulkMode ? "4px" : "0",
									}}
								>
									Content:
								</label>
								{isBulkMode ? (
									<textarea
										id="inputText"
										value={inputText}
										onChange={(e) => setInputText(e.target.value)}
										placeholder="Enter content here (1 line = 1 QR)..."
										rows={4}
										style={{
											padding: "4px",
											width: "100%",
											boxSizing: "border-box",
											resize: "vertical",
										}}
									/>
								) : (
									<input
										id="inputText"
										type="text"
										value={inputText}
										onChange={(e) => setInputText(e.target.value)}
										placeholder="Enter content here..."
										style={{
											padding: "2px 4px",
											width: "100%",
											boxSizing: "border-box",
										}}
									/>
								)}
							</div>
						</fieldset>

						<fieldset
							style={{
								border: "1px solid #ccc",
								padding: "15px",
								marginBottom: "20px",
							}}
						>
							<legend>QR Parameters</legend>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "100px 1fr",
									gap: "10px",
									alignItems: "center",
								}}
							>
								<label htmlFor="sizeRange">Size:</label>
								<div
									style={{ display: "flex", alignItems: "center", gap: "10px" }}
								>
									<input
										id="sizeRange"
										type="range"
										min="128"
										max="1024"
										step="32"
										value={size}
										onChange={(e) => setSize(Number(e.target.value))}
										style={{ flex: 1 }}
									/>
									<span style={{ width: "50px", textAlign: "right" }}>
										{size}px
									</span>
								</div>

								<label htmlFor="marginRange">Margin:</label>
								<div
									style={{ display: "flex", alignItems: "center", gap: "10px" }}
								>
									<input
										id="marginRange"
										type="range"
										min="0"
										max="10"
										step="1"
										value={margin}
										onChange={(e) => setMargin(Number(e.target.value))}
										style={{ flex: 1 }}
									/>
									<span style={{ width: "50px", textAlign: "right" }}>
										{margin}
									</span>
								</div>

								<label htmlFor="errorLevel">Error Corr:</label>
								<select
									id="errorLevel"
									value={errorLevel}
									onChange={(e) => setErrorLevel(e.target.value as any)}
								>
									<option value="L">Low (7%)</option>
									<option value="M">Medium (15%)</option>
									<option value="Q">Quartile (25%)</option>
									<option value="H">High (30%)</option>
								</select>
							</div>
						</fieldset>

						<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
							<legend>Colors</legend>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "100px 1fr",
									gap: "10px",
									alignItems: "center",
								}}
							>
								<label htmlFor="fgColor">Foreground:</label>
								<div
									style={{ display: "flex", alignItems: "center", gap: "5px" }}
								>
									<input
										id="fgColor"
										type="color"
										value={foregroundColor}
										onChange={(e) => setForegroundColor(e.target.value)}
									/>
									<input
										type="text"
										value={foregroundColor}
										onChange={(e) => setForegroundColor(e.target.value)}
										style={{ flex: 1, padding: "2px 4px" }}
									/>
								</div>

								<label htmlFor="bgColor">Background:</label>
								<div
									style={{ display: "flex", alignItems: "center", gap: "5px" }}
								>
									<input
										id="bgColor"
										type="color"
										value={backgroundColor}
										onChange={(e) => setBackgroundColor(e.target.value)}
									/>
									<input
										type="text"
										value={backgroundColor}
										onChange={(e) => setBackgroundColor(e.target.value)}
										style={{ flex: 1, padding: "2px 4px" }}
									/>
								</div>
							</div>
						</fieldset>
					</div>

					{/* Right Column: Output */}
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

							<div
								style={{
									width: "100%",
									backgroundColor: "#f9f9f9",
									border: "1px solid #eee",
									display: "flex",
									flexWrap: "wrap",
									gap: "20px",
									alignItems: "center",
									justifyContent: "center",
									padding: "20px",
									boxSizing: "border-box",
									minHeight: "300px",
									overflowY: "auto",
									flex: 1,
								}}
							>
								{processedTexts.length > 0 ? (
									processedTexts.map((text, index) => (
										<div
											key={text}
											style={{
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												gap: "10px",
												background: "#fff",
												padding: "10px",
												border: "1px solid #ddd",
												boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
											}}
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
									style={{
										fontSize: "13px",
										padding: "4px 8px",
									}}
								>
									Download PNG
								</button>
								<button
									onClick={downloadSVG}
									disabled={!hasValidInput}
									style={{
										fontSize: "13px",
										padding: "4px 8px",
									}}
								>
									Download SVG
								</button>
								{inputType === "url" && (
									<button
										onClick={testQRCode}
										disabled={!hasValidInput}
										style={{
											fontSize: "13px",
											padding: "4px 8px",
										}}
									>
										Test URLs
									</button>
								)}
								<button
									onClick={resetForm}
									style={{
										fontSize: "13px",
										padding: "4px 8px",
									}}
								>
									Reset
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
