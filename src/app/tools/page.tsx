import {
	Code,
	FileCode,
	Gamepad2,
	Image,
	Palette,
	QrCode,
	ScrollText,
	Timer,
	Type,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateBaseMetadata({
	title: "Tools",
	description:
		"便利なWebツールのコレクション.QRコード生成、SVG変換、テキスト解析、タイマーなど日常で役立つツールを公開しています.",
	path: "/tools",
});

interface Tool {
	id: string;
	title: string;
	description: string;
	href: string;
	category: string;
	icon: React.ComponentType<{
		className?: string;
		style?: React.CSSProperties;
	}>;
}

const tools: Tool[] = [
	{
		id: "pi-game",
		title: "Pi Memory Game",
		description:
			"円周率の桁を記憶して入力するゲーム.テンキーインターフェースで楽しく学習できます.",
		href: "/tools/pi-game",
		category: "ゲーム",
		icon: Gamepad2,
	},
	{
		id: "pomodoro",
		title: "Pomodoro Timer",
		description:
			"シンプルなポモドーロタイマー.25分作業・5分休憩のサイクルで効率的な作業時間管理を実現.",
		href: "https://pomodoro.yusuke-kim.com",
		category: "生産性",
		icon: Timer,
	},
	{
		id: "text-counter",
		title: "Text Counter",
		description:
			"テキストの文字数を詳細にカウント.総文字数、単語数、行数、文字種別など豊富な統計情報を提供.",
		href: "/tools/text-counter",
		category: "ユーティリティ",
		icon: Type,
	},
	{
		id: "qr-generator",
		title: "QR Code Generator",
		description:
			"URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能付きツール",
		href: "/tools/qr-generator",
		category: "ユーティリティ",
		icon: QrCode,
	},
	{
		id: "color-palette",
		title: "Color Palette Generator",
		description:
			"色域を指定してランダムにカラーパレットを生成.デザインに活用できる美しい色の組み合わせを作成.",
		href: "/tools/color-palette",
		category: "デザイン",
		icon: Palette,
	},
	{
		id: "svg2tsx",
		title: "SVG to TSX Converter",
		description:
			"SVG画像をReactコンポーネント（TSX）に変換.TypeScript対応で最適化されたコードを生成.",
		href: "/tools/svg2tsx",
		category: "開発",
		icon: FileCode,
	},
	{
		id: "sequential-png-preview",
		title: "Sequential PNG Preview",
		description:
			"連番PNGファイルをアニメーションとしてプレビュー.複数ファイル、フォルダ、ZIPファイルに対応.",
		href: "/tools/sequential-png-preview",
		category: "デザイン",
		icon: Image,
	},
	{
		id: "ProtoType",
		title: "ProtoType Typing Game",
		description:
			"PIXIjsを使用したタイピングゲーム.WPMと正確性を記録し、タイピングスキルの向上を支援.",
		href: "https://prototype.yusuke-kim.com",
		category: "ゲーム",
		icon: Code,
	},
	{
		id: "code-type-p5",
		title: "Code Type p5",
		description:
			"p5.jsでコードタイピング風の映像素材を作成.複数のプログラミング言語に対応し、PNGシーケンスとしてエクスポート可能.",
		href: "/tools/code-type-p5",
		category: "デザイン",
		icon: Code,
	},
	{
		id: "fillgen",
		title: "穴埋めプリントジェネレーター",
		description:
			"{{答え|幅}} を含むテキストから history-quiz 形式のプレビュー／HTML／React を即時生成しコピーできるエディター.",
		href: "/tools/fillgen",
		category: "ユーティリティ",
		icon: ScrollText,
	},
];

export default function ToolsPage() {
	return (
		<div className="min-h-dvh w-full bg-white text-black px-4 sm:px-6 lg:px-12 py-8 pb-[env(safe-area-inset-bottom)]">
			<div className="max-w-5xl mx-auto pb-16">
				<nav className="text-sm mb-4 text-neutral-600">
					<Link href="/" className="text-blue-600 hover:underline">
						Home
					</Link>
					<span className="mx-2">/</span>
					<span className="text-black">Tools</span>
				</nav>

				<h1 className="text-2xl font-normal border-b border-neutral-300 pb-2.5 mb-5">
					Tools
				</h1>
				<p className="text-sm text-neutral-600 mt-0 mb-10">
					便利なWebツールのコレクション.
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{tools.map((tool) => {
						const Icon = tool.icon;
						return (
							<Link
								key={tool.href}
								href={tool.href}
								className="block p-4 rounded-md border border-neutral-300 hover:bg-neutral-50 transition-colors"
							>
								<div className="flex items-center gap-2 mb-1.5">
									<Icon className="w-[18px] h-[18px] shrink-0" />
									<span className="text-[0.95rem] font-semibold">
										{tool.title}
									</span>
									<span className="ml-auto text-[0.7rem] bg-neutral-100 px-2 py-0.5 rounded-full shrink-0">
										{tool.category}
									</span>
								</div>
								<p className="text-[0.8rem] text-neutral-600 mt-0 leading-relaxed">
									{tool.description}
								</p>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
