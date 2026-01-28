"use client";

import { CheckCircle, Copy, Download, XCircle } from "lucide-react";
import { useState } from "react";
import type { ConversionResult, ConversionSettings } from "../types";

interface DownloadPanelProps {
	conversionResult: ConversionResult | null;
	settings: ConversionSettings;
}

export function DownloadPanel({
	conversionResult,
	settings,
}: DownloadPanelProps) {
	const [fileName, setFileName] = useState(
		settings.componentName || "Component",
	);
	const [copySuccess, setCopySuccess] = useState(false);

	const handleDownload = () => {
		if (!conversionResult?.success || !conversionResult.tsxCode) return;

		const blob = new Blob([conversionResult.tsxCode], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${fileName}${settings.fileExtension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleCopy = async () => {
		if (!conversionResult?.success || !conversionResult.tsxCode) return;

		try {
			await navigator.clipboard.writeText(conversionResult.tsxCode);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	};

	const isDisabled = !conversionResult?.success || !conversionResult.tsxCode;

	return (
		<div className="rounded-xl bg-base/75 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
			<h3 className="text-lg font-medium mb-4">ダウンロード</h3>

			<div className="space-y-4">
				{/* File Name Setting */}
				<div>
					<label className="block text-sm font-medium mb-1">ファイル名</label>
					<div className="flex gap-2">
						<input
							type="text"
							value={fileName}
							onChange={(e) => setFileName(e.target.value)}
							className="flex-1 p-2 rounded-lg bg-main/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
							placeholder="Component"
							aria-label="ファイル名"
						/>
						<span className="flex items-center px-2 text-sm text-main/70">
							{settings.fileExtension}
						</span>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-2">
					<button
						type="button"
						onClick={handleDownload}
						disabled={isDisabled}
						className="flex-1 bg-main text-white px-4 py-2 hover:bg-main/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<Download className="w-4 h-4 mr-2" />
						ファイルをダウンロード
					</button>

					<button
						type="button"
						onClick={handleCopy}
						disabled={isDisabled}
						className={`flex-1 rounded-lg bg-main/10 hover:bg-main/20 px-4 py-2 transition-colors ${
							copySuccess
								? "bg-green-100 text-green-700 border-green-500"
								: "hover:bg-main/10"
						}`}
					>
						{copySuccess ? (
							<>
								<CheckCircle className="w-4 h-4 mr-2" />
								コピー完了
							</>
						) : (
							<>
								<Copy className="w-4 h-4 mr-2" />
								クリップボードにコピー
							</>
						)}
					</button>
				</div>

				{/* Status */}
				{conversionResult && (
					<div className="text-sm">
						{conversionResult.success ? (
							<div className="text-green-600">
								<CheckCircle className="w-4 h-4 inline mr-1" />
								変換完了 ({conversionResult.tsxCode.split("\n").length} 行)
							</div>
						) : (
							<div className="text-red-600">
								<XCircle className="w-4 h-4 inline mr-1" />
								変換エラー: {conversionResult.error}
							</div>
						)}
					</div>
				)}

				{/* Usage Instructions */}
				<div className="text-xs text-main/70 space-y-1">
					<p>
						<strong>使用方法:</strong>
					</p>
					<p>1. 生成されたコンポーネントをプロジェクトにコピー</p>
					<p>2. 必要に応じてpropsを渡して使用</p>
					<p>3. className, style, width, height等のpropsが利用可能</p>
				</div>
			</div>
		</div>
	);
}
