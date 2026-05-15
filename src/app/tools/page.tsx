import {
	Code,
	FileCode,
	Gamepad2,
	Image,
	Mail,
	Palette,
	QrCode,
	ScrollText,
	Timer,
	Type,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import GlowCard from "@/components/ui/GlowCard";

interface Tool {
	id: string;
	title: string;
	description: string;
	href: string;
	category: string;
	icon: React.ComponentType<{ className?: string }>;
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
		id: "ae-expression",
		title: "AE Expression Tool",
		description:
			"AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定.アニメーション、エフェクト、変形などのエクスプレッションを一覧表示.",
		href: "/tools/ae-expression",
		category: "デザイン",
		icon: Zap,
	},
	{
		id: "business-mail-block",
		title: "Business Mail Block Tool",
		description:
			"ビジネスメールをScratch風ブロックUIで簡単作成.挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成.",
		href: "/tools/business-mail-block",
		category: "ビジネス",
		icon: Mail,
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
		<div className="relative min-h-screen text-main">
			<main
				id="main-content"
				className="relative z-10 min-h-screen py-10"
				tabIndex={-1}
			>
				<div className="container-system">
					<div className="mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Tools", isCurrent: true },
							]}
							className="pt-4"
						/>

						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
								Tools
							</h1>
							<p className="noto-sans-jp-light text-sm text-main/70 leading-relaxed max-w-2xl">
								便利なWebツールのコレクション.オフライン対応・アクセシビリティ準拠のツールを提供しています.
							</p>
						</header>


						{/* Tools Grid */}
						<section className="space-y-6">
							<h2 className="neue-haas-grotesk-display text-3xl text-main">
								All Tools
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{tools.map((tool) => {
									const Icon = tool.icon;
									return (
										<Link
											key={tool.id}
											href={tool.href}
											className="block focus:outline-none group h-full"
										>
											<GlowCard className="bg-base/30 backdrop-blur h-full flex flex-col">
												<div className="flex flex-col p-6 h-full">
													<div className="flex flex-1 flex-col gap-3">
														<div className="flex items-start justify-between gap-2">
															<div className="flex items-center gap-3">
																<Icon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-300 shrink-0" />
																<h3 className="neue-haas-grotesk-display text-lg leading-snug text-main sm:text-xl group-hover:text-accent transition-colors">
																	{tool.title}
																</h3>
															</div>
															<span className="noto-sans-jp-light rounded-full bg-main/10 px-3 py-1 text-[0.75rem] text-main shrink-0">
																{tool.category}
															</span>
														</div>
														<p className="noto-sans-jp-light text-sm leading-relaxed text-main/80 mt-1">
															{tool.description}
														</p>
													</div>
												</div>
											</GlowCard>
										</Link>
									);
								})}
							</div>
						</section>
					</div>
				</div>
			</main>
			<footer className="border-t border-main/30 bg-base/80 py-6 text-center text-xs text-main/70">
				<div className="container-system flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
					<span>© 2025 361do_sleep</span>
					<Link
						href="/privacy-policy"
						className="underline underline-offset-4 transition hover:text-accent"
					>
						Privacy Policy
					</Link>
				</div>
			</footer>
		</div>
	);
}
