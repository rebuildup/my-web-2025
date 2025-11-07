"use client";

import { useState } from "react";
import type { ConversionResult, SVGInputData } from "../types";

interface PreviewPanelProps {
	svgInput: SVGInputData | null;
	conversionResult: ConversionResult | null;
}

export function PreviewPanel({
	svgInput,
	conversionResult,
}: PreviewPanelProps) {
	const [activeTab, setActiveTab] = useState<"svg" | "tsx">("svg");

	return (
		<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
			<h3 className="text-lg font-medium mb-4">プレビュー</h3>

			{/* Tab Navigation */}
			<div className="flex border-b border-main/20 mb-4">
				{[
					{ key: "svg", label: "SVGプレビュー" },
					{ key: "tsx", label: "TSXコード" },
				].map(({ key, label }) => (
					<button
						type="button"
						key={key}
						onClick={() => setActiveTab(key as typeof activeTab)}
						className={`px-4 py-2 border-b-2 transition-colors ${
							activeTab === key
								? "border-accent text-main"
								: "border-transparent hover:border-main/40"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			{/* SVG Preview */}
			{activeTab === "svg" && (
				<div className="space-y-4">
					{svgInput?.content ? (
						<div className="rounded-lg bg-main/10 p-4">
							<div className="flex justify-center items-center min-h-[200px]">
								<div
									dangerouslySetInnerHTML={{ __html: svgInput.content }}
									className="max-w-full max-h-[400px]"
								/>
							</div>
						</div>
					) : (
						<div className="rounded-lg bg-main/5 p-8 text-center text-main/50">
							SVGを入力してください
						</div>
					)}
				</div>
			)}

			{/* TSX Code Preview */}
			{activeTab === "tsx" && (
				<div className="space-y-4">
					{conversionResult ? (
						<div>
							{conversionResult.success ? (
								<div className="rounded-lg bg-main/10">
									<pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
										<code>{conversionResult.tsxCode}</code>
									</pre>
								</div>
							) : (
								<div className="border border-red-500 bg-red-50 p-4 text-red-700">
									<h4 className="font-medium mb-2">変換エラー</h4>
									<p className="text-sm">{conversionResult.error}</p>
								</div>
							)}

							{conversionResult.warnings &&
								conversionResult.warnings.length > 0 && (
									<div className="border border-yellow-500 bg-yellow-50 p-4 text-yellow-700">
										<h4 className="font-medium mb-2">警告</h4>
										<ul className="text-sm space-y-1">
											{conversionResult.warnings.map((warning, index) => (
												<li key={`${warning}-${index}`}>• {warning}</li>
											))}
										</ul>
									</div>
								)}
						</div>
					) : (
						<div className="rounded-lg bg-main/5 p-8 text-center text-main/50">
							SVGを入力すると変換結果が表示されます
						</div>
					)}
				</div>
			)}
		</div>
	);
}
