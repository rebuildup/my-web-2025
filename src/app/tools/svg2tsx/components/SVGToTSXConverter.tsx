"use client";

import { useEffect, useState } from "react";
import ToolWrapper from "../../components/ToolWrapper";
import type {
	ConversionResult,
	ConversionSettings,
	SVGInputData,
} from "../types";
import { parseSVG, validateSVG } from "../utils/svgParser";
import { convertSVGToTSX } from "../utils/tsxConverter";
import { ConversionSettingsPanel } from "./ConversionSettings";
import { DownloadPanel } from "./DownloadPanel";
import { PreviewPanel } from "./PreviewPanel";
import { SVGInput } from "./SVGInput";

const defaultSettings: ConversionSettings = {
	componentName: "MyIcon",
	propsType: "IconProps",
	defaultValues: {},
	includeComments: true,
	removeUnnecessaryAttributes: true,
	optimizePaths: false,
	variableizeColors: false,
	variableizeSizes: true,
	indentSize: 2,
	lineBreaks: "lf",
	exportType: "default",
	fileExtension: ".tsx",
};

export function SVGToTSXConverter() {
	const [svgInput, setSvgInput] = useState<SVGInputData | null>(null);
	const [settings, setSettings] = useState<ConversionSettings>(defaultSettings);
	const [conversionResult, setConversionResult] =
		useState<ConversionResult | null>(null);

	// Convert SVG when input or settings change
	useEffect(() => {
		if (!svgInput?.content) {
			setConversionResult(null);
			return;
		}

		// Validate SVG first
		const validation = validateSVG(svgInput.content);
		if (!validation.isValid) {
			setConversionResult({
				success: false,
				tsxCode: "",
				error: validation.error || "Invalid SVG",
			});
			return;
		}

		// Parse SVG
		const svgElement = parseSVG(svgInput.content);
		if (!svgElement) {
			setConversionResult({
				success: false,
				tsxCode: "",
				error: "Failed to parse SVG",
			});
			return;
		}

		// Convert to TSX
		const result = convertSVGToTSX(svgElement, settings);
		setConversionResult(result);
	}, [svgInput, settings]);

	// Update component name when file name changes
	useEffect(() => {
		if (svgInput?.fileName && svgInput.type === "file") {
			const baseName = svgInput.fileName.replace(/\.svg$/i, "");
			const componentName = baseName
				.replace(/[^a-zA-Z0-9]/g, "")
				.replace(/^[0-9]/, "Icon$&")
				.replace(/^./, (c) => c.toUpperCase());

			if (componentName && componentName !== settings.componentName) {
				setSettings((prev) => ({
					...prev,
					componentName: componentName || "MyIcon",
				}));
			}
		}
	}, [svgInput?.fileName, svgInput?.type, settings.componentName]);

	return (
		<ToolWrapper
			toolName="SVG to TSX Converter"
			description="SVG画像をReactコンポーネント（TSX）に変換します。TypeScript対応で最適化されたコードを生成できます。"
			category="development"
		>
			<div className="space-y-6">
				{/* Input Section */}
				<SVGInput onSVGChange={setSvgInput} currentInput={svgInput} />

				{/* Settings and Preview Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Settings */}
					<ConversionSettingsPanel
						settings={settings}
						onSettingsChange={setSettings}
					/>

					{/* Download */}
					<DownloadPanel
						conversionResult={conversionResult}
						settings={settings}
					/>
				</div>

				{/* Preview Section */}
				<PreviewPanel svgInput={svgInput} conversionResult={conversionResult} />

				{/* Usage Instructions */}
				<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
					<h3 className="text-lg font-medium mb-4">使用方法</h3>
					<div className="space-y-3 text-sm">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<h4 className="font-medium mb-2">📁 入力方法</h4>
								<ul className="space-y-1 text-main/80">
									<li>• SVGファイルをドラッグ&ドロップ</li>
									<li>• ファイル選択ボタンでアップロード</li>
									<li>• SVGコードを直接入力</li>
									<li>• URLから読み込み</li>
								</ul>
							</div>

							<div>
								<h4 className="font-medium mb-2">⚙️ 設定オプション</h4>
								<ul className="space-y-1 text-main/80">
									<li>• コンポーネント名とProps型の設定</li>
									<li>• 色とサイズの変数化</li>
									<li>• コードの最適化オプション</li>
									<li>• 出力形式の選択</li>
								</ul>
							</div>

							<div>
								<h4 className="font-medium mb-2">📋 出力機能</h4>
								<ul className="space-y-1 text-main/80">
									<li>• TSXファイルとしてダウンロード</li>
									<li>• クリップボードにコピー</li>
									<li>• リアルタイムプレビュー</li>
									<li>• エラーと警告の表示</li>
								</ul>
							</div>

							<div>
								<h4 className="font-medium mb-2">🔧 対応機能</h4>
								<ul className="space-y-1 text-main/80">
									<li>• TypeScript型定義生成</li>
									<li>• Props対応（className, style等）</li>
									<li>• SVG属性の最適化</li>
									<li>• ローカル処理（セキュア）</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</ToolWrapper>
	);
}
