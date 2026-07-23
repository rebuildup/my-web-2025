import { BookOpen, Heart, Search, Settings, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ExportFormat, SavedExpression } from "./ae-expression-types";

interface ExpressionControlsProps {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	selectedCategory: string;
	setSelectedCategory: (value: string) => void;
	selectedDifficulty: string;
	setSelectedDifficulty: (value: string) => void;
	showFavoritesOnly: boolean;
	setShowFavoritesOnly: (value: boolean) => void;
	showAdvancedSettings: boolean;
	setShowAdvancedSettings: (value: boolean) => void;
	exportFormat: ExportFormat;
	setExportFormat: (value: ExportFormat) => void;
	showDocumentation: boolean;
	setShowDocumentation: (value: boolean) => void;
	savedExpressions: SavedExpression[];
	setSavedExpressions: Dispatch<SetStateAction<SavedExpression[]>>;
}

export function ExpressionControls(props: ExpressionControlsProps) {
	const deleteSaved = (id: string) => {
		const updated = props.savedExpressions.filter((saved) => saved.id !== id);
		props.setSavedExpressions(updated);
		localStorage.setItem("ae-expressions-saved", JSON.stringify(updated));
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4 items-center">
				<div className="relative flex-1 min-w-64">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 " />
					<input
						type="text"
						placeholder="エクスプレッション、タグ、テンプレートを検索..."
						value={props.searchTerm}
						onChange={(e) => props.setSearchTerm(e.target.value)}
						aria-label="エクスプレッション、タグ、テンプレートを検索"
						className="w-full pl-10 pr-4 py-2"
					/>
				</div>
				<select
					value={props.selectedCategory}
					onChange={(e) => props.setSelectedCategory(e.target.value)}
					className="px-4 py-2"
					aria-label="カテゴリで絞り込み"
				>
					<option value="all">全カテゴリ</option>
					<option value="animation">アニメーション</option>
					<option value="effect">エフェクト</option>
					<option value="transform">変形</option>
					<option value="utility">ユーティリティ</option>
				</select>
				<select
					value={props.selectedDifficulty}
					onChange={(e) => props.setSelectedDifficulty(e.target.value)}
					className="px-4 py-2"
					aria-label="難易度で絞り込み"
				>
					<option value="all">全難易度</option>
					<option value="beginner">初級</option>
					<option value="intermediate">中級</option>
					<option value="advanced">上級</option>
				</select>
				<button
					type="button"
					onClick={() => props.setShowFavoritesOnly(!props.showFavoritesOnly)}
					className={`px-4 py-2 flex items-center gap-2 noto-sans-jp-light ${props.showFavoritesOnly ? " " : " "}`}
				>
					<Heart className="w-4 h-4" />
					お気に入りのみ
				</button>
				<button
					type="button"
					onClick={() =>
						props.setShowAdvancedSettings(!props.showAdvancedSettings)
					}
					className="px-4 py-2 flex items-center gap-2 noto-sans-jp-light"
				>
					<Settings className="w-4 h-4" />
					詳細設定
				</button>
			</div>
			{props.showAdvancedSettings && (
				<div className="rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-4">
					<h3 className="text-lg noto-sans-jp-regular font-medium">詳細設定</h3>
					<div className="grid-system grid-1 md:grid-2 gap-4">
						<div className="space-y-2">
							<label
								htmlFor="export-format"
								className="text-sm noto-sans-jp-regular"
							>
								エクスポート形式
							</label>
							<select
								id="export-format"
								value={props.exportFormat}
								onChange={(e) =>
									props.setExportFormat(e.target.value as ExportFormat)
								}
								className="w-full px-3 py-2"
							>
								<option value="txt">テキスト (.txt)</option>
								<option value="jsx">JSX (.jsx)</option>
								<option value="json">JSON (.json)</option>
							</select>
						</div>
						<div className="space-y-2">
							<h4 className="text-sm noto-sans-jp-regular">表示オプション</h4>
							<button
								type="button"
								onClick={() =>
									props.setShowDocumentation(!props.showDocumentation)
								}
								className={`px-3 py-2 flex items-center gap-2 noto-sans-jp-light ${props.showDocumentation ? " " : " "}`}
							>
								<BookOpen className="w-4 h-4" />
								ドキュメント
							</button>
						</div>
					</div>
					{props.savedExpressions.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-sm noto-sans-jp-regular">
								保存済みエクスプレッション
							</h4>
							<div className="max-h-32 overflow-y-auto rounded-lg p-2 space-y-1">
								{props.savedExpressions.map((saved) => (
									<div
										key={saved.id}
										className="flex items-center justify-between p-2 rounded-lg"
									>
										<span className="text-sm noto-sans-jp-light truncate">
											{saved.name}
										</span>
										<button
											type="button"
											onClick={() => deleteSaved(saved.id)}
											className=""
											aria-label={`保存済み「${saved.name}」を削除`}
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
