import {
	AlertCircle,
	CheckCircle,
	Copy,
	Download,
	Pause,
	Play,
	RotateCcw,
	Save,
} from "lucide-react";
import type { AEExpression, ValidationResult } from "./ae-expression-types";

interface ExpressionOutputProps {
	expression: AEExpression | null;
	generatedCode: string;
	validationResult: ValidationResult;
	isPreviewPlaying: boolean;
	previewTime: number;
	copySuccess: boolean;
	onTogglePreview: () => void;
	onResetPreview: () => void;
	onSave: () => void;
	onExport: () => void;
	onCopy: () => void;
}

export function ExpressionOutput({
	expression,
	generatedCode,
	validationResult,
	isPreviewPlaying,
	previewTime,
	copySuccess,
	onTogglePreview,
	onResetPreview,
	onSave,
	onExport,
	onCopy,
}: ExpressionOutputProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="neue-haas-grotesk-display text-xl ">生成されたコード</h2>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onTogglePreview}
						className="px-3 py-2 flex items-center gap-2 noto-sans-jp-light"
					>
						{isPreviewPlaying ? (
							<Pause className="w-4 h-4" />
						) : (
							<Play className="w-4 h-4" />
						)}
						{isPreviewPlaying ? "停止" : "再生"}
					</button>
					<button
						type="button"
						onClick={onResetPreview}
						className="px-3 py-2 flex items-center gap-2 noto-sans-jp-light"
					>
						<RotateCcw className="w-4 h-4" />
						リセット
					</button>
					<button
						type="button"
						onClick={onSave}
						disabled={!expression || !generatedCode}
						className="px-3 py-2 flex items-center gap-2 noto-sans-jp-light"
					>
						<Save className="w-4 h-4" />
						保存
					</button>
					<button
						type="button"
						onClick={onExport}
						disabled={!generatedCode}
						className="px-3 py-2 flex items-center gap-2 noto-sans-jp-light"
					>
						<Download className="w-4 h-4" />
						エクスポート
					</button>
					<button
						type="button"
						onClick={onCopy}
						disabled={!generatedCode}
						className={`px-4 py-2 flex items-center gap-2 noto-sans-jp-regular ${copySuccess ? " " : " "}`}
					>
						{copySuccess ? (
							<CheckCircle className="w-4 h-4" />
						) : (
							<Copy className="w-4 h-4" />
						)}
						{copySuccess ? "コピー完了" : "コピー"}
					</button>
				</div>
			</div>
			{generatedCode && (
				<div className="space-y-2">
					{validationResult.errors.length > 0 && (
						<div className="   p-3">
							<div className="flex items-center gap-2 mb-2">
								<AlertCircle className="w-4 h-4 " />
								<span className="text-sm noto-sans-jp-regular ">エラー</span>
							</div>
							<ul className="text-sm noto-sans-jp-light  space-y-1">
								{validationResult.errors.map((error) => (
									<li key={error}>• {error}</li>
								))}
							</ul>
						</div>
					)}
					{validationResult.warnings.length > 0 && (
						<div className="   p-3">
							<div className="flex items-center gap-2 mb-2">
								<AlertCircle className="w-4 h-4 " />
								<span className="text-sm noto-sans-jp-regular ">警告</span>
							</div>
							<ul className="text-sm noto-sans-jp-light  space-y-1">
								{validationResult.warnings.map((warning) => (
									<li key={warning}>• {warning}</li>
								))}
							</ul>
						</div>
					)}
					{validationResult.isValid &&
						validationResult.warnings.length === 0 && (
							<div className="   p-3">
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 " />
									<span className="text-sm noto-sans-jp-regular ">
										エクスプレッションは正常です
									</span>
								</div>
							</div>
						)}
				</div>
			)}
			<div className="rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 min-h-32">
				<pre className="whitespace-pre-wrap text-sm noto-sans-jp-light leading-relaxed font-mono">
					{generatedCode || "エクスプレッションを選択してください..."}
				</pre>
			</div>
			{expression && (
				<div className="rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm noto-sans-jp-regular">プレビュー時間</span>
						<span className="text-sm noto-sans-jp-light font-mono">
							{previewTime.toFixed(1)}s
						</span>
					</div>
					<div className="text-xs  noto-sans-jp-light">
						実際のAfter
						Effectsでは、このエクスプレッションが時間に応じて値を変化させます.
					</div>
				</div>
			)}
			{expression && (
				<div className="rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
					<h3 className="text-sm noto-sans-jp-regular mb-2">使用例</h3>
					<pre className="text-xs  noto-sans-jp-light font-mono">
						{expression.example}
					</pre>
				</div>
			)}
		</div>
	);
}
