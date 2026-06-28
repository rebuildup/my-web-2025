"use client";

import { useEffect, useState } from "react";
import { RawDOMContainer } from "../../components/RawDOMContainer";
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

	useEffect(() => {
		if (!svgInput?.content) {
			setConversionResult(null);
			return;
		}

		const validation = validateSVG(svgInput.content);
		if (!validation.isValid) {
			setConversionResult({
				success: false,
				tsxCode: "",
				error: validation.error || "Invalid SVG",
			});
			return;
		}

		const svgElement = parseSVG(svgInput.content);
		if (!svgElement) {
			setConversionResult({
				success: false,
				tsxCode: "",
				error: "Failed to parse SVG",
			});
			return;
		}

		const result = convertSVGToTSX(svgElement, settings);
		setConversionResult(result);
	}, [svgInput, settings]);

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
		<RawDOMContainer
			title="SVG to TSX Converter"
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Tools", href: "/tools" },
				{ label: "SVG to TSX Converter" },
			]}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				<SVGInput onSVGChange={setSvgInput} currentInput={svgInput} />

				<div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
					<div style={{ flex: "1 1 300px" }}>
						<ConversionSettingsPanel
							settings={settings}
							onSettingsChange={setSettings}
						/>
					</div>
					<div style={{ flex: "1 1 300px" }}>
						<PreviewPanel
							svgInput={svgInput}
							conversionResult={conversionResult}
						/>
					</div>
				</div>

				<DownloadPanel
					conversionResult={conversionResult}
					settings={settings}
				/>
			</div>
		</RawDOMContainer>
	);
}
