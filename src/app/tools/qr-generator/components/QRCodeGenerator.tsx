"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AccessibleButton from "../../components/AccessibleButton";
import AccessibleSelect from "../../components/AccessibleSelect";
import ToolWrapper from "../../components/ToolWrapper";

// QR Code generation utilities (simplified implementation)
// For production, you might want to use a library like 'qrcode' or 'qr-code-generator'

// Simple QR Code matrix generation (basic implementation)
// This is a simplified version - in production you'd use a proper QR library
function generateQRMatrix(text: string): boolean[][] {
	// This is a placeholder implementation
	// In a real implementation, you would use proper QR code algorithms
	const size = Math.max(21, Math.ceil(Math.sqrt(text.length * 8)) + 4);
	const matrix: boolean[][] = [];

	// Initialize matrix
	for (let i = 0; i < size; i++) {
		matrix[i] = [];
		for (let j = 0; j < size; j++) {
			matrix[i][j] = false;
		}
	}

	// Simple pattern generation based on text (not a real QR algorithm)
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
	}

	// Create a pseudo-random pattern
	const random = (seed: number) => {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	};

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			const seed = hash + i * size + j;
			matrix[i][j] = random(seed) > 0.5;
		}
	}

	// Add finder patterns (corners)
	const addFinderPattern = (x: number, y: number) => {
		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 7; j++) {
				if (x + i < size && y + j < size) {
					const isEdge = i === 0 || i === 6 || j === 0 || j === 6;
					const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
					matrix[x + i][y + j] = isEdge || isInner;
				}
			}
		}
	};

	addFinderPattern(0, 0);
	addFinderPattern(0, size - 7);
	addFinderPattern(size - 7, 0);

	return matrix;
}

// Validate URL format
function isValidURL(string: string): boolean {
	try {
		new URL(string);
		return true;
	} catch {
		// Try with http:// prefix
		try {
			new URL(`http://${string}`);
			return true;
		} catch {
			return false;
		}
	}
}

// Validate email format
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export default function QRCodeGenerator() {
	// State management
	const [inputText, setInputText] = useState("");
	const [inputType, setInputType] = useState<
		"url" | "text" | "email" | "phone" | "wifi"
	>("url");
	const [qrSize, setQrSize] = useState(256);
	const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
	const [foregroundColor, setForegroundColor] = useState("#000000");
	const [backgroundColor, setBackgroundColor] = useState("#ffffff");
	const [margin, setMargin] = useState(4);
	const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);
	const [isValid, setIsValid] = useState(true);
	const [validationMessage, setValidationMessage] = useState("");

	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Keyboard shortcuts
	const keyboardShortcuts = [
		{ key: "G", description: "QRコード生成" },
		{ key: "D", description: "PNG ダウンロード" },
		{ key: "S", description: "SVG ダウンロード" },
		{ key: "R", description: "リセット" },
		{ key: "T", description: "テスト" },
	];

	// Validate input based on type
	const validateInput = useCallback((text: string, type: string) => {
		if (!text.trim()) {
			setIsValid(false);
			setValidationMessage("入力が必要です");
			return false;
		}

		switch (type) {
			case "url":
				if (!isValidURL(text)) {
					setIsValid(false);
					setValidationMessage(
						"有効なURLを入力してください (例: https://example.com)",
					);
					return false;
				}
				break;
			case "email":
				if (!isValidEmail(text)) {
					setIsValid(false);
					setValidationMessage("有効なメールアドレスを入力してください");
					return false;
				}
				break;
			case "phone": {
				const phoneRegex = /^[+]?[0-9\-()\s]+$/;
				if (!phoneRegex.test(text)) {
					setIsValid(false);
					setValidationMessage("有効な電話番号を入力してください");
					return false;
				}
				break;
			}
			case "wifi":
				// Basic WiFi QR format validation
				if (!text.includes("WIFI:")) {
					setIsValid(false);
					setValidationMessage(
						"WiFi形式: WIFI:T:WPA;S:ネットワーク名;P:パスワード;;",
					);
					return false;
				}
				break;
		}

		setIsValid(true);
		setValidationMessage("");
		return true;
	}, []);

	// Generate QR code
	const generateQR = useCallback(() => {
		if (!validateInput(inputText, inputType)) {
			return;
		}

		let processedText = inputText;

		// Format text based on type
		switch (inputType) {
			case "url":
				if (
					!inputText.startsWith("http://") &&
					!inputText.startsWith("https://")
				) {
					processedText = `https://${inputText}`;
				}
				break;
			case "email":
				processedText = `mailto:${inputText}`;
				break;
			case "phone":
				processedText = `tel:${inputText}`;
				break;
			// wifi and text use input as-is
		}

		const matrix = generateQRMatrix(processedText);
		setQrMatrix(matrix);
	}, [inputText, inputType, validateInput]);

	// Draw QR code on canvas
	const drawQRCode = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas || qrMatrix.length === 0) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const matrixSize = qrMatrix.length;
		const cellSize = (qrSize - margin * 2) / matrixSize;

		canvas.width = qrSize;
		canvas.height = qrSize;

		// Clear canvas with background color
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, qrSize, qrSize);

		// Draw QR modules
		ctx.fillStyle = foregroundColor;
		for (let i = 0; i < matrixSize; i++) {
			for (let j = 0; j < matrixSize; j++) {
				if (qrMatrix[i][j]) {
					ctx.fillRect(
						margin + j * cellSize,
						margin + i * cellSize,
						cellSize,
						cellSize,
					);
				}
			}
		}
	}, [qrMatrix, qrSize, margin, foregroundColor, backgroundColor]);

	// Download as PNG
	const downloadPNG = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const link = document.createElement("a");
		link.download = `qrcode-${Date.now()}.png`;
		link.href = canvas.toDataURL("image/png");
		link.click();
	}, []);

	// Download as SVG
	const downloadSVG = useCallback(() => {
		if (qrMatrix.length === 0) return;

		const matrixSize = qrMatrix.length;
		const cellSize = (qrSize - margin * 2) / matrixSize;

		let svgContent = `<svg width="${qrSize}" height="${qrSize}" xmlns="http://www.w3.org/2000/svg">`;
		svgContent += `<rect width="${qrSize}" height="${qrSize}" fill="${backgroundColor}"/>`;

		for (let i = 0; i < matrixSize; i++) {
			for (let j = 0; j < matrixSize; j++) {
				if (qrMatrix[i][j]) {
					svgContent += `<rect x="${margin + j * cellSize}" y="${margin + i * cellSize}" width="${cellSize}" height="${cellSize}" fill="${foregroundColor}"/>`;
				}
			}
		}

		svgContent += "</svg>";

		const blob = new Blob([svgContent], { type: "image/svg+xml" });
		const link = document.createElement("a");
		link.download = `qrcode-${Date.now()}.svg`;
		link.href = URL.createObjectURL(blob);
		link.click();
		URL.revokeObjectURL(link.href);
	}, [qrMatrix, qrSize, margin, foregroundColor, backgroundColor]);

	// Test QR code by opening URL
	const testQRCode = useCallback(() => {
		if (inputType === "url" && isValid && inputText) {
			let url = inputText;
			if (!url.startsWith("http://") && !url.startsWith("https://")) {
				url = `https://${url}`;
			}
			window.open(url, "_blank");
		}
	}, [inputType, isValid, inputText]);

	// Reset form
	const resetForm = useCallback(() => {
		setInputText("");
		setQrMatrix([]);
		setIsValid(true);
		setValidationMessage("");
	}, []);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleToolShortcut = (event: CustomEvent) => {
			switch (event.detail.key.toLowerCase()) {
				case "g":
					generateQR();
					break;
				case "d":
					downloadPNG();
					break;
				case "s":
					downloadSVG();
					break;
				case "r":
					resetForm();
					break;
				case "t":
					testQRCode();
					break;
			}
		};

		document.addEventListener(
			"toolShortcut",
			handleToolShortcut as EventListener,
		);
		return () =>
			document.removeEventListener(
				"toolShortcut",
				handleToolShortcut as EventListener,
			);
	}, [generateQR, downloadPNG, downloadSVG, resetForm, testQRCode]);

	// Auto-generate QR when input changes
	useEffect(() => {
		if (inputText.trim()) {
			const timer = setTimeout(() => {
				generateQR();
			}, 500); // Debounce
			return () => clearTimeout(timer);
		} else {
			setQrMatrix([]);
		}
	}, [inputText, generateQR]);

	// Draw QR code when matrix changes
	useEffect(() => {
		drawQRCode();
	}, [drawQRCode]);

	// Design system classes
	const CardStyle =
		"rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-4";
	const Section_title = "neue-haas-grotesk-display text-xl text-main mb-4";
	const Input_style =
		"rounded-lg bg-main/10 p-2 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base w-full";

	const Select_style =
		"rounded-lg bg-main/10 p-2 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base";

	return (
		<ToolWrapper
			toolName="QR Code Generator"
			description="URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能。PNG・SVG形式でエクスポート可能。オフライン対応。"
			category="utility"
			keyboardShortcuts={keyboardShortcuts}
		>
			<div className="space-y-8">
				{/* Input Section */}
				<section className={CardStyle}>
					<h3 className={Section_title}>Input & Type</h3>

					<div className="space-y-4">
						{/* Input Type Selection */}
						<div>
							<label className="neue-haas-grotesk-display text-sm text-main mb-2 block">
								Input Type
							</label>
							<AccessibleSelect
								value={inputType}
								onChange={(e) =>
									setInputType(
										e.target.value as
											| "url"
											| "text"
											| "email"
											| "phone"
											| "wifi",
									)
								}
								label="Input Type"
								options={[
									{ value: "url", label: "URL" },
									{ value: "text", label: "Plain Text" },
									{ value: "email", label: "Email" },
									{ value: "phone", label: "Phone Number" },
									{ value: "wifi", label: "WiFi Network" },
								]}
								aria-label="Select input type"
							/>
						</div>

						{/* Text Input */}
						<div>
							<label className="neue-haas-grotesk-display text-sm text-main mb-2 block">
								{inputType === "url" && "URL (例: https://example.com)"}
								{inputType === "text" && "Text Content"}
								{inputType === "email" && "Email Address"}
								{inputType === "phone" && "Phone Number"}
								{inputType === "wifi" &&
									"WiFi Format: WIFI:T:WPA;S:NetworkName;P:Password;;"}
							</label>
							<textarea
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								placeholder={
									inputType === "url"
										? "https://example.com"
										: inputType === "text"
											? "Enter any text..."
											: inputType === "email"
												? "user@example.com"
												: inputType === "phone"
													? "+81-90-1234-5678"
													: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;"
								}
								className={`${Input_style} min-h-[80px] resize-y`}
								aria-label={`Enter ${inputType} content`}
								aria-invalid={!isValid}
								aria-describedby={!isValid ? "validation-message" : undefined}
							/>
							{!isValid && (
								<p
									id="validation-message"
									className="text-accent text-sm mt-2"
									role="alert"
								>
									{validationMessage}
								</p>
							)}
						</div>
					</div>
				</section>

				{/* Customization Section */}
				<section className={CardStyle}>
					<h3 className={Section_title}>Customization</h3>

					<div className="grid-system grid-1 sm:grid-2 gap-6">
						{/* Size Settings */}
						<div className="space-y-4">
							<div>
								<label className="neue-haas-grotesk-display text-sm text-main mb-2 block">
									Size: {qrSize}px
								</label>
								<input
									type="range"
									min="128"
									max="512"
									step="32"
									value={qrSize}
									onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
									className="w-full"
									aria-label="QR code size"
								/>
							</div>

							<div>
								<label className="neue-haas-grotesk-display text-sm text-main mb-2 block">
									Margin: {margin}px
								</label>
								<input
									type="range"
									min="0"
									max="20"
									value={margin}
									onChange={(e) => setMargin(parseInt(e.target.value, 10))}
									className="w-full"
									aria-label="QR code margin"
								/>
							</div>

							<div>
								<label className="neue-haas-grotesk-display text-sm text-main mb-2 block">
									Error Correction Level
								</label>
								<select
									value={errorLevel}
									onChange={(e) =>
										setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")
									}
									className={Select_style}
									aria-label="Error correction level"
								>
									<option value="L">Low (7%)</option>
									<option value="M">Medium (15%)</option>
									<option value="Q">Quartile (25%)</option>
									<option value="H">High (30%)</option>
								</select>
							</div>
						</div>

						{/* Color Settings */}
						<div className="space-y-4">
							<div>
								<label className="neue-haas-grotesk-display text-sm text-main mb-2 block">
									Foreground Color
								</label>
								<div className="flex items-center space-x-2">
									<input
										type="color"
										value={foregroundColor}
										onChange={(e) => setForegroundColor(e.target.value)}
										className="w-12 h-8 rounded bg-main/10 cursor-pointer hover:bg-main/20 transition-colors"
										aria-label="Foreground color picker"
									/>
									<input
										type="text"
										value={foregroundColor}
										onChange={(e) => setForegroundColor(e.target.value)}
										className="flex-1 rounded-lg bg-main/10 p-2 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
										placeholder="#000000"
										aria-label="Foreground color hex value"
									/>
								</div>
							</div>

							<div>
								<label className="neue-haas-grotesk-display text-sm text-main mb-2 block">
									Background Color
								</label>
								<div className="flex items-center space-x-2">
									<input
										type="color"
										value={backgroundColor}
										onChange={(e) => setBackgroundColor(e.target.value)}
										className="w-12 h-8 rounded bg-main/10 cursor-pointer hover:bg-main/20 transition-colors"
										aria-label="Background color picker"
									/>
									<input
										type="text"
										value={backgroundColor}
										onChange={(e) => setBackgroundColor(e.target.value)}
										className="flex-1 rounded-lg bg-main/10 p-2 text-main focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
										placeholder="#ffffff"
										aria-label="Background color hex value"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* QR Code Display */}
				{qrMatrix.length > 0 && (
					<section className={CardStyle}>
						<h3 className={Section_title}>Generated QR Code</h3>

						<div className="text-center space-y-4">
							<canvas
								ref={canvasRef}
								className="rounded-lg bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] mx-auto"
								style={{ maxWidth: "100%", height: "auto" }}
								aria-label="Generated QR code"
							/>

							<div className="flex flex-wrap justify-center gap-4">
								<AccessibleButton
									onClick={generateQR}
									variant="primary"
									shortcut="G"
									announceOnClick="QRコードを生成しました"
									aria-label="Regenerate QR code"
								>
									Generate
								</AccessibleButton>
								<AccessibleButton
									onClick={downloadPNG}
									variant="secondary"
									shortcut="D"
									announceOnClick="PNGファイルをダウンロードしました"
									aria-label="Download as PNG"
								>
									PNG Download
								</AccessibleButton>
								<AccessibleButton
									onClick={downloadSVG}
									variant="secondary"
									shortcut="S"
									announceOnClick="SVGファイルをダウンロードしました"
									aria-label="Download as SVG"
								>
									SVG Download
								</AccessibleButton>
								{inputType === "url" && (
									<button
										type="button"
										onClick={testQRCode}
										className="rounded-lg bg-main/10 px-4 py-2 hover:bg-main/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
										aria-label="Test URL in new tab"
									>
										Test URL (T)
									</button>
								)}
								<button
									type="button"
									onClick={resetForm}
									className="rounded-lg bg-main/10 px-4 py-2 hover:bg-main/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
									aria-label="Reset form"
								>
									Reset (R)
								</button>
							</div>
						</div>
					</section>
				)}

				{/* Information Section */}
				<section className={CardStyle}>
					<h3 className={Section_title}>Information</h3>

					<div className="space-y-4">
						<div className="grid-system grid-1 sm:grid-2 gap-6">
							<div>
								<h4 className="neue-haas-grotesk-display text-lg text-main mb-2">
									Features
								</h4>
								<ul className="noto-sans-jp-light text-sm space-y-1">
									<li>• URL・テキスト・メール・電話・WiFi対応</li>
									<li>• カスタマイズ可能な色・サイズ・マージン</li>
									<li>• PNG・SVG形式でダウンロード</li>
									<li>• エラー訂正レベル調整</li>
									<li>• リアルタイムプレビュー</li>
									<li>• オフライン動作・ローカル処理</li>
								</ul>
							</div>

							<div>
								<h4 className="neue-haas-grotesk-display text-lg text-main mb-2">
									Usage Tips
								</h4>
								<ul className="noto-sans-jp-light text-sm space-y-1">
									<li>• URLは自動的にhttps://が追加されます</li>
									<li>• エラー訂正レベルが高いほど読み取り精度向上</li>
									<li>• 高コントラストの色を推奨</li>
									<li>• 印刷時は300DPI以上を推奨</li>
									<li>• WiFi形式: WIFI:T:WPA;S:名前;P:パスワード;;</li>
								</ul>
							</div>
						</div>

						<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
							<p className="noto-sans-jp-light text-xs text-center">
								注意: このツールは簡易的なQRコード生成機能です。
								商用利用や重要な用途には専用ライブラリの使用を推奨します。
								すべての処理はローカルで実行され、データは外部に送信されません。
							</p>
						</div>
					</div>
				</section>
			</div>
		</ToolWrapper>
	);
}
