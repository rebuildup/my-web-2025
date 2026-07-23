import { BookOpen, Heart, Info, Star } from "lucide-react";
import { CATEGORY_NAMES, DIFFICULTY_NAMES } from "./ae-expression-data";
import type { AEExpression, ParameterValue } from "./ae-expression-types";

interface ExpressionParametersProps {
	expression: AEExpression | null;
	values: Record<string, ParameterValue>;
	showDocumentation: boolean;
	onToggleDocumentation: () => void;
	onToggleFavorite: (id: string) => void;
	onUpdateParameter: (name: string, value: ParameterValue) => void;
}

export function ExpressionParameters({
	expression,
	values,
	showDocumentation,
	onToggleDocumentation,
	onToggleFavorite,
	onUpdateParameter,
}: ExpressionParametersProps) {
	return (
		<div className="space-y-4">
			<h2 className="neue-haas-grotesk-display text-xl ">パラメータ設定</h2>
			{expression ? (
				<div className="space-y-4 rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
					<div className="mb-4">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-lg noto-sans-jp-regular font-medium flex items-center gap-2">
								{expression.name}
								{expression.isFavorite && <Star className="w-4 h-4  " />}
							</h3>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => onToggleFavorite(expression.id)}
									className="p-2"
									aria-label={
										expression.isFavorite
											? "お気に入りから削除"
											: "お気に入りに追加"
									}
								>
									<Heart
										className={`w-4 h-4 ${expression.isFavorite ? " " : ""}`}
									/>
								</button>
								<button
									type="button"
									onClick={onToggleDocumentation}
									className="p-2"
									aria-label={
										showDocumentation
											? "ドキュメントを隠す"
											: "ドキュメントを表示"
									}
								>
									<Info className="w-4 h-4" />
								</button>
							</div>
						</div>
						<p className="text-sm noto-sans-jp-light  mb-2">
							{expression.description}
						</p>
						<div className="flex items-center gap-4 text-xs  noto-sans-jp-light">
							<span>難易度: {DIFFICULTY_NAMES[expression.difficulty]}</span>
							<span>カテゴリ: {CATEGORY_NAMES[expression.category]}</span>
							{!!expression.usageCount && (
								<span>使用回数: {expression.usageCount}</span>
							)}
						</div>
					</div>
					{showDocumentation && expression.documentation && (
						<div className="rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 mb-4">
							<h4 className="text-sm noto-sans-jp-regular font-medium mb-2 flex items-center gap-2">
								<BookOpen className="w-4 h-4" />
								詳細ドキュメント
							</h4>
							<p className="text-sm noto-sans-jp-light leading-relaxed ">
								{expression.documentation}
							</p>
							{expression.tags && (
								<div className="mt-3">
									<span className="text-xs noto-sans-jp-regular">タグ: </span>
									<div className="flex flex-wrap gap-1 mt-1">
										{expression.tags.map((tag) => (
											<span key={tag} className="text-xs   px-2 py-1 rounded">
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					)}
					<div className="space-y-4">
						{expression.parameters.map((param) => (
							<div key={param.name} className="space-y-2">
								<label className="text-sm noto-sans-jp-regular flex items-center gap-2">
									{param.name}
									{param.unit && (
										<span className="text-xs ">({param.unit})</span>
									)}
								</label>
								<p className="text-xs  noto-sans-jp-light">
									{param.description}
								</p>
								{param.type === "number" && (
									<div className="space-y-2">
										<input
											type="range"
											min={param.min}
											max={param.max}
											step={param.step}
											value={Number(values[param.name] ?? param.defaultValue)}
											onChange={(e) =>
												onUpdateParameter(
													param.name,
													parseFloat(e.target.value),
												)
											}
											className="w-full"
											aria-label={`${param.name}（範囲）`}
										/>
										<input
											type="number"
											min={param.min}
											max={param.max}
											step={param.step}
											value={Number(values[param.name] ?? param.defaultValue)}
											onChange={(e) =>
												onUpdateParameter(
													param.name,
													parseFloat(e.target.value),
												)
											}
											className="w-full px-3 py-2"
											aria-label={`${param.name}（数値）`}
										/>
									</div>
								)}
								{param.type === "select" && (
									<select
										value={String(values[param.name] ?? param.defaultValue)}
										onChange={(e) =>
											onUpdateParameter(param.name, e.target.value)
										}
										className="w-full px-3 py-2"
										aria-label={`${param.name}を選択`}
									>
										{param.options?.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
								)}
								{param.type === "boolean" && (
									<label className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={Boolean(
												values[param.name] ?? param.defaultValue,
											)}
											onChange={(e) =>
												onUpdateParameter(param.name, e.target.checked)
											}
											className="w-4 h-4"
											aria-label={`${param.name}を有効にする`}
										/>
										<span className="text-sm noto-sans-jp-light">有効</span>
									</label>
								)}
								{param.type === "string" && (
									<input
										type="text"
										value={String(values[param.name] ?? param.defaultValue)}
										onChange={(e) =>
											onUpdateParameter(param.name, e.target.value)
										}
										className="w-full px-3 py-2"
										aria-label={`${param.name}を入力`}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-8 text-center">
					<p className=" noto-sans-jp-light">
						左側からエクスプレッションを選択してください
					</p>
				</div>
			)}
		</div>
	);
}
