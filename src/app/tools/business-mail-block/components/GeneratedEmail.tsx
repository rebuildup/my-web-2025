import { Copy, Download, Save } from "lucide-react";

interface GeneratedEmailProps {
	generatedEmail: string;
	copyToClipboard: () => void;
	downloadEmail: () => void;
	saveAsTemplateFromUI: () => void;
	composedBlocksCount: number;
}

export default function GeneratedEmail({
	generatedEmail,
	copyToClipboard,
	downloadEmail,
	saveAsTemplateFromUI,
	composedBlocksCount,
}: GeneratedEmailProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="neue-haas-grotesk-display text-lg ">生成されたメール</h3>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={copyToClipboard}
						disabled={!generatedEmail}
						className="px-4 py-2 flex items-center gap-2 noto-sans-jp-regular"
					>
						<Copy className="w-4 h-4" />
						コピー
					</button>
					<button
						type="button"
						onClick={downloadEmail}
						disabled={!generatedEmail}
						className="px-4 py-2 flex items-center gap-2 noto-sans-jp-regular"
					>
						<Download className="w-4 h-4" />
						ダウンロード
					</button>
					<button
						type="button"
						onClick={saveAsTemplateFromUI}
						disabled={composedBlocksCount === 0}
						className="px-4 py-2 flex items-center gap-2 noto-sans-jp-regular"
					>
						<Save className="w-4 h-4" />
						テンプレート保存
					</button>
				</div>
			</div>

			<div className="rounded-xl  shadow-[0_8px_24px_rgba(0,0,0,0.25)] p-4 min-h-32">
				<pre className="whitespace-pre-wrap text-sm noto-sans-jp-light leading-relaxed">
					{generatedEmail || "メールブロックを追加してください..."}
				</pre>
			</div>
		</div>
	);
}
