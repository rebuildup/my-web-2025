interface CustomBlockFormProps {
	customBlockContent: string;
	setCustomBlockContent: (value: string) => void;
	customBlockCategory: "greeting" | "body" | "closing" | "signature";
	setCustomBlockCategory: (
		value: "greeting" | "body" | "closing" | "signature",
	) => void;
	addCustomBlock: () => void;
	onClose: () => void;
}

export default function CustomBlockForm({
	customBlockContent,
	setCustomBlockContent,
	customBlockCategory,
	setCustomBlockCategory,
	addCustomBlock,
	onClose,
}: CustomBlockFormProps) {
	return (
		<div className="rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 space-y-3">
			<h3 className="neue-haas-grotesk-display text-lg ">
				カスタムブロック作成
			</h3>
			<div className="grid-system grid-1 sm:grid-2 gap-4">
				<div className="space-y-2">
					<label
						htmlFor="customBlockCategory"
						className="text-sm noto-sans-jp-regular"
					>
						カテゴリ
					</label>
					<select
						id="customBlockCategory"
						value={customBlockCategory}
						onChange={(e) =>
							setCustomBlockCategory(
								e.target.value as "greeting" | "body" | "closing" | "signature",
							)
						}
						className="w-full px-3 py-2"
					>
						<option value="greeting">挨拶</option>
						<option value="body">本文</option>
						<option value="closing">締め</option>
						<option value="signature">署名</option>
					</select>
				</div>
				<div className="space-y-2">
					<label
						htmlFor="customBlockContent"
						className="text-sm noto-sans-jp-regular"
					>
						内容
					</label>
					<textarea
						id="customBlockContent"
						value={customBlockContent}
						onChange={(e) => setCustomBlockContent(e.target.value)}
						placeholder="ブロックの内容を入力... 変数は{変数名}で指定"
						className="w-full px-3 py-2 resize-none"
						rows={3}
						aria-label="カスタムブロックの内容を入力"
					/>
				</div>
			</div>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={addCustomBlock}
					disabled={!customBlockContent.trim()}
					className="px-4 py-2 noto-sans-jp-regular"
				>
					追加
				</button>
				<button
					type="button"
					onClick={onClose}
					className="px-4 py-2 noto-sans-jp-regular"
				>
					キャンセル
				</button>
			</div>
		</div>
	);
}
