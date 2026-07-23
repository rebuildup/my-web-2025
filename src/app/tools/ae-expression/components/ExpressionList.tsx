import { Heart, Search, Star } from "lucide-react";
import {
	CATEGORY_NAMES,
	DIFFICULTY_COLORS,
	DIFFICULTY_NAMES,
} from "./ae-expression-data";
import type { AEExpression } from "./ae-expression-types";

interface ExpressionListProps {
	expressions: AEExpression[];
	selectedExpression: AEExpression | null;
	onSelect: (expression: AEExpression) => void;
	onToggleFavorite: (id: string) => void;
}

export function ExpressionList({
	expressions,
	selectedExpression,
	onSelect,
	onToggleFavorite,
}: ExpressionListProps) {
	return (
		<div className="space-y-4">
			<h2 className="neue-haas-grotesk-display text-xl ">
				エクスプレッション一覧
			</h2>
			<div className="space-y-3 max-h-96 overflow-y-auto rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4">
				{expressions.map((expr) => (
					<div
						key={expr.id}
						className={`p-3 rounded-lg cursor-pointer hover:/20 transition-colors ${selectedExpression?.id === expr.id ? " " : " "}`}
					>
						<div className="flex items-start justify-between mb-2">
							<div
								className="flex-1"
								tabIndex={0}
								role="button"
								onClick={() => onSelect(expr)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onSelect(expr);
									}
								}}
							>
								<div className="flex items-center gap-2 mb-1">
									<span className="text-xs rounded-lg px-2 py-1 noto-sans-jp-light">
										{CATEGORY_NAMES[expr.category]}
									</span>
									<span
										className={`text-xs px-2 py-1  noto-sans-jp-light ${DIFFICULTY_COLORS[expr.difficulty]}`}
									>
										{DIFFICULTY_NAMES[expr.difficulty]}
									</span>
									{!!expr.usageCount && (
										<span className="text-xs     px-2 py-1 noto-sans-jp-light">
											使用回数: {expr.usageCount}
										</span>
									)}
								</div>
								<h3 className="text-sm noto-sans-jp-regular font-medium flex items-center gap-2">
									{expr.name}
									{expr.isFavorite && <Star className="w-3 h-3  " />}
								</h3>
								<p className="text-xs noto-sans-jp-light leading-relaxed mt-1">
									{expr.description}
								</p>
								{expr.tags && (
									<div className="flex flex-wrap gap-1 mt-2">
										{expr.tags.slice(0, 3).map((tag) => (
											<span key={tag} className="text-xs   px-1 py-0.5 rounded">
												{tag}
											</span>
										))}
										{expr.tags.length > 3 && (
											<span className="text-xs ">+{expr.tags.length - 3}</span>
										)}
									</div>
								)}
							</div>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onToggleFavorite(expr.id);
								}}
								className="ml-2 p-1"
								aria-label={
									expr.isFavorite ? "お気に入りから削除" : "お気に入りに追加"
								}
							>
								<Heart className={`w-4 h-4 ${expr.isFavorite ? " " : ""}`} />
							</button>
						</div>
					</div>
				))}
				{expressions.length === 0 && (
					<div className="text-center py-8  noto-sans-jp-light">
						<Search className="w-8 h-8 mx-auto mb-2 " />
						<p>条件に一致するエクスプレッションが見つかりません</p>
					</div>
				)}
			</div>
		</div>
	);
}
