import {
	BookOpen,
	CheckCircle,
	FileText,
	Heart,
	Plus,
	Search,
} from "lucide-react";

interface ControlsProps {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	selectedCategory: string;
	setSelectedCategory: (value: string) => void;
	showFavoritesOnly: boolean;
	setShowFavoritesOnly: (value: boolean) => void;
	showTemplateLibrary: boolean;
	setShowTemplateLibrary: (value: boolean) => void;
	showValidation: boolean;
	setShowValidation: (value: boolean) => void;
	showGuidelines: boolean;
	setShowGuidelines: (value: boolean) => void;
	showCustomBlockForm: boolean;
	setShowCustomBlockForm: (value: boolean) => void;
}

export default function Controls({
	searchTerm,
	setSearchTerm,
	selectedCategory,
	setSelectedCategory,
	showFavoritesOnly,
	setShowFavoritesOnly,
	showTemplateLibrary,
	setShowTemplateLibrary,
	showValidation,
	setShowValidation,
	showGuidelines,
	setShowGuidelines,
	showCustomBlockForm,
	setShowCustomBlockForm,
}: ControlsProps) {
	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4 items-center">
				<div className="relative flex-1 min-w-64">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 " />
					<input
						type="text"
						placeholder="ブロックを検索..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						aria-label="メールブロックを検索"
						className="w-full pl-10 pr-4 py-2"
					/>
				</div>

				<select
					value={selectedCategory}
					onChange={(e) => setSelectedCategory(e.target.value)}
					className="px-4 py-2"
					aria-label="カテゴリで絞り込み"
				>
					<option value="all">全カテゴリ</option>
					<option value="greeting">挨拶</option>
					<option value="body">本文</option>
					<option value="closing">締め</option>
					<option value="signature">署名</option>
				</select>

				<button
					type="button"
					onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
					className={`px-4 py-2 flex items-center gap-2 noto-sans-jp-light ${showFavoritesOnly ? " " : " "}`}
				>
					<Heart className="w-4 h-4" />
					お気に入りのみ
				</button>
			</div>

			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
					className={`px-3 py-2 text-sm flex items-center gap-2 noto-sans-jp-light ${showTemplateLibrary ? " " : " "}`}
				>
					<FileText className="w-4 h-4" />
					テンプレート
				</button>

				<button
					type="button"
					onClick={() => setShowValidation(!showValidation)}
					className={`px-3 py-2 text-sm flex items-center gap-2 noto-sans-jp-light ${showValidation ? " " : " "}`}
				>
					<CheckCircle className="w-4 h-4" />
					バリデーション
				</button>

				<button
					type="button"
					onClick={() => setShowGuidelines(!showGuidelines)}
					className={`px-3 py-2 text-sm flex items-center gap-2 noto-sans-jp-light ${showGuidelines ? " " : " "}`}
				>
					<BookOpen className="w-4 h-4" />
					ガイドライン
				</button>

				<button
					type="button"
					onClick={() => setShowCustomBlockForm(!showCustomBlockForm)}
					className={`px-3 py-2 text-sm flex items-center gap-2 noto-sans-jp-light ${showCustomBlockForm ? " " : " "}`}
				>
					<Plus className="w-4 h-4" />
					カスタムブロック
				</button>
			</div>
		</div>
	);
}
