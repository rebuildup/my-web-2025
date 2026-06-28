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
import Link from "next/link";

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
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: 9999,
				backgroundColor: "#ffffff",
				color: "#000000",
				colorScheme: "light",
				fontFamily: "sans-serif",
				overflowY: "auto",
				padding: "2rem",
				boxSizing: "border-box",
			}}
		>
			<div
				style={{
					maxWidth: "1100px",
					margin: "0 auto",
					paddingBottom: "4rem",
				}}
			>
				<nav
					style={{
						fontSize: "0.85rem",
						marginBottom: "1rem",
						color: "#666",
					}}
				>
					<a href="/" style={{ color: "#0066cc", textDecoration: "none" }}>
						Home
					</a>
					<span style={{ margin: "0 8px" }}>/</span>
					<span style={{ color: "#000" }}>Tools</span>
				</nav>

				<h1
					style={{
						borderBottom: "1px solid #ccc",
						paddingBottom: "10px",
						marginBottom: "20px",
						fontSize: "1.5rem",
						fontWeight: "normal",
					}}
				>
					Tools
				</h1>
				<p
					style={{
						fontSize: "0.875rem",
						color: "#666",
						marginBottom: "40px",
						marginTop: 0,
					}}
				>
					便利なWebツールのコレクション.
				</p>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
						gap: "12px",
					}}
				>
					{tools.map((tool) => {
						const Icon = tool.icon;
						return (
							<Link
								key={tool.id}
								href={tool.href}
								style={{ textDecoration: "none", color: "inherit" }}
							>
								<div
									style={{
										border: "1px solid #ddd",
										borderRadius: "6px",
										padding: "16px",
										height: "100%",
										cursor: "pointer",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
											marginBottom: "6px",
										}}
									>
										<Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
										<span style={{ fontSize: "0.95rem", fontWeight: 600 }}>
											{tool.title}
										</span>
										<span
											style={{
												marginLeft: "auto",
												fontSize: "0.7rem",
												background: "#f0f0f0",
												padding: "2px 8px",
												borderRadius: "10px",
												flexShrink: 0,
											}}
										>
											{tool.category}
										</span>
									</div>
									<p
										style={{
											fontSize: "0.8rem",
											color: "#555",
											margin: 0,
											lineHeight: 1.5,
										}}
									>
										{tool.description}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
