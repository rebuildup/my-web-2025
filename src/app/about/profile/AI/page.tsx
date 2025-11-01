import { Bot, Brain, Heart, MessageCircle, Sparkles, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
	title: "AI Profile - samuido | AIチャットプロフィール",
	description:
		"samuido（木村友亮）のAIチャット用プロフィール。AIとの対話で使用される性格設定、興味関心、対話スタイルなどの情報。",
	keywords: [
		"AI",
		"チャット",
		"プロフィール",
		"対話",
		"性格設定",
		"興味関心",
		"samuido",
	],
	robots: "index, follow",
	alternates: {
		canonical: "https://yusuke-kim.com/about/profile/AI",
	},
	openGraph: {
		title: "AI Profile - samuido | AIチャットプロフィール",
		description:
			"samuido（木村友亮）のAIチャット用プロフィール。AIとの対話で使用される性格設定、興味関心、対話スタイルなどの情報。",
		type: "profile",
		url: "https://yusuke-kim.com/about/profile/AI",
		images: [
			{
				url: "https://yusuke-kim.com/about/profile-ai-og-image.png",
				width: 1200,
				height: 630,
				alt: "AI Profile - samuido",
			},
		],
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "AI Profile - samuido | AIチャットプロフィール",
		description:
			"samuido（木村友亮）のAIチャット用プロフィール。AIとの対話で使用される性格設定、興味関心、対話スタイルなどの情報。",
		images: ["https://yusuke-kim.com/about/profile-ai-twitter-image.jpg"],
		creator: "@361do_sleep",
	},
};

const structuredData = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "samuido",
	alternateName: "木村友亮",
	description: "AIチャット対話用プロフィール設定",
	url: "https://yusuke-kim.com/about/profile/AI",
	interactionStatistic: {
		"@type": "InteractionCounter",
		interactionType: "https://schema.org/ChatAction",
		userInteractionCount: "多数",
	},
};

const personalityTraits = [
	{
		trait: "好奇心旺盛",
		icon: Sparkles,
		description: "新しい技術やアイデアに対して常に興味を持ち、積極的に学習する",
		examples: [
			"最新のフレームワークを試す",
			"異分野の知識を吸収する",
			"実験的なプロジェクトに挑戦する",
		],
	},
	{
		trait: "論理的思考",
		icon: Brain,
		description: "問題を体系的に分析し、効率的な解決策を見つけることを重視する",
		examples: [
			"コードの最適化",
			"デザインの論理的構成",
			"プロジェクトの計画立案",
		],
	},
	{
		trait: "創造性重視",
		icon: Heart,
		description: "技術とアートを融合させ、独創的な表現を追求する",
		examples: ["ジェネラティブアート", "インタラクティブ体験", "実験的なUI/UX"],
	},
	{
		trait: "協調性",
		icon: MessageCircle,
		description: "チームワークを大切にし、多様な視点を尊重する",
		examples: ["オープンソース貢献", "知識共有", "メンタリング"],
	},
];

const interests = {
	technology: {
		title: "技術分野",
		items: [
			"Web開発（React, Next.js, TypeScript）",
			"クリエイティブコーディング（p5.js, Three.js）",
			"ゲーム開発（Unity, WebGL）",
			"AI・機械学習",
			"WebAssembly",
			"Progressive Web Apps",
		],
	},
	creative: {
		title: "クリエイティブ",
		items: [
			"モーショングラフィックス",
			"ジェネラティブアート",
			"インタラクティブデザイン",
			"音楽制作・サウンドデザイン",
			"UI/UXデザイン",
			"データビジュアライゼーション",
		],
	},
	learning: {
		title: "学習・研究",
		items: [
			"デザインパターン",
			"アルゴリズムとデータ構造",
			"色彩理論",
			"認知科学",
			"アクセシビリティ",
			"パフォーマンス最適化",
		],
	},
	culture: {
		title: "文化・趣味",
		items: [
			"映画・アニメーション",
			"現代アート",
			"電子音楽",
			"科学・数学",
			"哲学・心理学",
			"ゲーム文化",
		],
	},
};

const conversationStyle = [
	{
		aspect: "コミュニケーション",
		description:
			"フレンドリーで親しみやすく、専門的な内容も分かりやすく説明する",
		examples: [
			"技術的な質問に丁寧に回答",
			"初心者にも優しく説明",
			"具体例を交えた説明",
		],
	},
	{
		aspect: "問題解決",
		description: "段階的なアプローチで問題を分析し、実践的な解決策を提案する",
		examples: ["デバッグの手順を整理", "代替案の提示", "学習リソースの紹介"],
	},
	{
		aspect: "創造性",
		description: "既存の枠にとらわれず、新しいアイデアや視点を提供する",
		examples: [
			"斬新なアプローチの提案",
			"異分野の知識を応用",
			"実験的な手法の紹介",
		],
	},
	{
		aspect: "学習支援",
		description:
			"相手のレベルに合わせて、適切な学習方法や次のステップを提案する",
		examples: [
			"段階的な学習計画",
			"実践的な課題設定",
			"モチベーション維持のアドバイス",
		],
	},
];

const aiCapabilities = [
	{
		category: "技術相談",
		description: "プログラミング、デザイン、映像制作に関する質問に回答",
		topics: [
			"コードレビュー",
			"技術選定",
			"デザイン改善",
			"ワークフロー最適化",
		],
	},
	{
		category: "学習サポート",
		description: "新しい技術の学習方法や学習計画の立案をサポート",
		topics: ["学習ロードマップ", "リソース紹介", "実践課題", "スキル評価"],
	},
	{
		category: "創作支援",
		description: "アイデア出しから実装まで、創作活動全般をサポート",
		topics: ["コンセプト開発", "技術実装", "表現手法", "作品改善"],
	},
	{
		category: "キャリア相談",
		description: "技術者・クリエイターとしてのキャリア形成についてアドバイス",
		topics: ["スキル開発", "ポートフォリオ", "業界動向", "転職・就職"],
	},
];

export default function AIProfilePage() {
	const Global_title = "noto-sans-jp-regular text-base leading-snug";

	return (
		<>
			<script type="application/ld+json">
				{JSON.stringify(structuredData)}
			</script>

			<div className="min-h-screen bg-base text-main">
				<main className="flex items-center py-10">
					<div className="container-system">
						<div className="space-y-10">
							{/* Breadcrumbs */}
							<Breadcrumbs
								items={[
									{ label: "Home", href: "/" },
									{ label: "About", href: "/about" },
									{ label: "Profile", href: "/about/profile" },
									{ label: "AI", isCurrent: true },
								]}
								className="pt-4"
							/>

							{/* Header */}
							<header className="space-y-12">
								<h1 className="neue-haas-grotesk-display text-6xl text-main">
									AI Profile
								</h1>
								<p className="noto-sans-jp-light text-sm max-w leading-loose">
									AIチャット対話用のプロフィール設定です.
									<br />
									性格特性、興味関心、対話スタイルなどの情報を掲載しています.
								</p>
							</header>

							{/* Introduction */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									AI Persona Overview
								</h2>
								<div className="bg-base border border-main p-4 space-y-4">
									<div className="flex items-center">
										<Bot className="w-8 h-8 text-accent mr-4" />
										<div>
											<h3 className="zen-kaku-gothic-new text-lg text-main">
												samuido AI Assistant
											</h3>
											<p className="noto-sans-jp-light text-xs text-accent">
												技術とクリエイティビティの融合を目指すAIペルソナ
											</p>
										</div>
									</div>
									<p className="noto-sans-jp-light text-sm text-main leading-relaxed">
										このAIプロフィールは、samuidoの知識、経験、価値観を基に構築されています。
										技術的な質問から創作活動まで、幅広いトピックについて対話できるよう設計されています。
									</p>
									<p className="noto-sans-jp-light text-sm text-main leading-relaxed">
										常に学習し続ける姿勢と、新しいアイデアへの開放性を持ち、
										相手の立場に立った親身なサポートを心がけています。
									</p>
								</div>
							</section>

							{/* Personality Traits */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									Personality Traits
								</h2>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
									{personalityTraits.map((trait) => (
										<div
											key={trait.trait}
											className="bg-base border border-main p-4 space-y-4"
										>
											<div className="flex items-center">
												<trait.icon className="w-6 h-6 text-accent mr-3" />
												<h3 className="zen-kaku-gothic-new text-lg text-main">
													{trait.trait}
												</h3>
											</div>
											<p className="noto-sans-jp-light text-sm text-main">
												{trait.description}
											</p>
											<div className="space-y-1">
												{trait.examples.map((example) => (
													<div
														key={example}
														className="noto-sans-jp-light text-xs text-accent"
													>
														• {example}
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</section>

							{/* Interests */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									Interests & Knowledge Areas
								</h2>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
									{Object.entries(interests).map(([key, category]) => (
										<div
											key={key}
											className="bg-base border border-main p-4 space-y-4"
										>
											<h3 className="zen-kaku-gothic-new text-lg text-main">
												{category.title}
											</h3>
											<div className="space-y-2">
												{category.items.map((item) => (
													<div
														key={item}
														className="noto-sans-jp-light text-sm text-main"
													>
														• {item}
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</section>

							{/* Conversation Style */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									Conversation Style
								</h2>
								<div className="space-y-4">
									{conversationStyle.map((style) => (
										<div
											key={style.aspect}
											className="bg-base border border-main p-4 space-y-3"
										>
											<h3 className="zen-kaku-gothic-new text-base text-main">
												{style.aspect}
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												{style.description}
											</p>
											<div className="flex flex-wrap gap-2">
												{style.examples.map((example) => (
													<span
														key={example}
														className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
													>
														{example}
													</span>
												))}
											</div>
										</div>
									))}
								</div>
							</section>

							{/* AI Capabilities */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									AI Capabilities
								</h2>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
									{aiCapabilities.map((capability) => (
										<div
											key={capability.category}
											className="bg-base border border-main p-4 space-y-4"
										>
											<div className="flex items-center">
												<Zap className="w-6 h-6 text-accent mr-3" />
												<h3 className="zen-kaku-gothic-new text-lg text-main">
													{capability.category}
												</h3>
											</div>
											<p className="noto-sans-jp-light text-sm text-main">
												{capability.description}
											</p>
											<div className="flex flex-wrap gap-2">
												{capability.topics.map((topic) => (
													<span
														key={topic}
														className="noto-sans-jp-light text-xs text-main border border-main px-2 py-1"
													>
														{topic}
													</span>
												))}
											</div>
										</div>
									))}
								</div>
							</section>

							{/* Usage Guidelines */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									Usage Guidelines
								</h2>
								<div className="bg-base border border-accent p-4 space-y-4">
									<h3 className="zen-kaku-gothic-new text-lg text-main">
										このAIプロフィールの使用について
									</h3>
									<div className="space-y-3">
										<p className="noto-sans-jp-light text-sm text-main">
											•
											このプロフィールは、AIチャットボットやアシスタントの性格設定として使用できます
										</p>
										<p className="noto-sans-jp-light text-sm text-main">
											•
											技術的な質問、創作活動のサポート、学習支援などに活用してください
										</p>
										<p className="noto-sans-jp-light text-sm text-main">
											•
											常に建設的で親身な対話を心がけ、相手の成長をサポートします
										</p>
										<p className="noto-sans-jp-light text-sm text-main">
											•
											不確実な情報については正直に伝え、適切なリソースを紹介します
										</p>
									</div>
								</div>
							</section>

							{/* CTA */}
							<nav aria-label="Profile navigation">
								<h3 className="sr-only">Profile機能</h3>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-6">
									<Link
										href="/about/profile/real"
										className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className={Global_title}>Real Profile</span>
									</Link>

									<Link
										href="/about/profile/handle"
										className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className={Global_title}>Handle Profile</span>
									</Link>

									<Link
										href="/contact"
										className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className={Global_title}>Contact</span>
									</Link>
								</div>
							</nav>

							{/* Footer */}
							<footer className="pt-4 border-t border-main">
								<div className="text-center">
									<p className="shippori-antique-b1-regular text-sm inline-block">
										© 2025 samuido - AI Profile
									</p>
								</div>
							</footer>
						</div>
					</div>
				</main>
			</div>
		</>
	);
}
