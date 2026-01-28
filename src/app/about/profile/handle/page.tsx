"use client";

import { Code, Coffee, Gamepad2, Music, Palette, Video } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollFloat } from "@/components/ScrollFloat";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// react-bits componentsを動的インポート
const ScrollVelocity = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.ScrollVelocity),
	{ ssr: false },
);
// Custom typing animation component
function TypingText({
	text,
	className,
	speed = 20,
	delay = 0,
}: {
	text: string;
	className?: string;
	speed?: number;
	delay?: number;
}) {
	const [displayedText, setDisplayedText] = useState("");
	const indexRef = useRef(0);

	useEffect(() => {
		setDisplayedText("");
		indexRef.current = 0;
		let timeoutId: NodeJS.Timeout | null = null;
		let intervalId: NodeJS.Timeout | null = null;

		const startTyping = () => {
			intervalId = setInterval(() => {
				const nextIndex = indexRef.current + 1;
				if (nextIndex <= text.length) {
					indexRef.current = nextIndex;
					setDisplayedText(text.slice(0, nextIndex));
				} else {
					if (intervalId) clearInterval(intervalId);
				}
			}, speed);
		};

		if (delay > 0) {
			timeoutId = setTimeout(startTyping, delay);
		} else {
			startTyping();
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (intervalId) clearInterval(intervalId);
		};
	}, [text, speed, delay]);

	return (
		<p className={className} style={{ minHeight: "1.5em" }}>
			{displayedText || "\u00A0"}
		</p>
	);
}

const structuredData = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "samuido",
	alternateName: "木村友亮",
	description: "クリエイティブコーダー・デザイナー・映像制作者",
	url: "https://yusuke-kim.com/about/profile/handle",
	sameAs: [
		"https://twitter.com/361do_sleep",
		"https://twitter.com/361do_design",
		"https://github.com/361do",
	],
	knowsAbout: [
		"Creative Coding",
		"Interactive Design",
		"Motion Graphics",
		"Game Development",
		"Web Development",
	],
};

const creativeAreas = [
	{
		title: "Creative Coding",
		icon: Code,
		description: "p5.js、PIXI.js、Three.jsを使ったインタラクティブ作品制作",
		projects: [
			"ジェネラティブアート",
			"データビジュアライゼーション",
			"インタラクティブ体験",
		],
	},
	{
		title: "Motion Graphics",
		icon: Video,
		description: "After Effectsを中心とした映像表現とアニメーション制作",
		projects: ["MV制作", "リリックモーション", "プロモーション映像"],
	},
	{
		title: "Game Development",
		icon: Gamepad2,
		description: "Unityとweb技術を使ったゲーム開発とインタラクティブコンテンツ",
		projects: ["ブラウザゲーム", "教育ゲーム", "実験的インタラクション"],
	},
	{
		title: "UI/UX Design",
		icon: Palette,
		description: "ユーザー体験を重視したインターフェースデザインと実装",
		projects: ["Webサイト", "アプリUI", "デザインシステム"],
	},
	{
		title: "Sound Design",
		icon: Music,
		description: "Cubaseを使った音楽制作とサウンドデザイン",
		projects: ["BGM制作", "効果音", "アンビエント"],
	},
	{
		title: "Tool Development",
		icon: Coffee,
		description: "開発効率化とクリエイティブワークフローの改善ツール制作",
		projects: ["プラグイン開発", "自動化ツール", "ユーティリティ"],
	},
];

const currentFocus = [
	{
		area: "WebGL & Three.js",
		description: "ブラウザ上での3D表現とインタラクティブ体験の探求",
		status: "学習中",
	},
	{
		area: "Generative AI",
		description: "AIを活用したクリエイティブワークフローの研究",
		status: "実験中",
	},
	{
		area: "Real-time Graphics",
		description: "リアルタイム映像処理とライブパフォーマンス",
		status: "研究中",
	},
	{
		area: "Accessibility",
		description: "誰もが使いやすいデザインとインクルーシブな体験設計",
		status: "重視",
	},
];

const workStyle = {
	development: [
		"エディタ: Visual Studio Code, Cursor",
		"バージョン管理: Git / GitHub",
		"デザイン: Figma, Adobe Creative Suite",
		"映像: After Effects, Premiere Pro",
	],
	workflow: [
		"プロトタイプ重視の開発",
		"継続的な実験と改善",
		"ドキュメント化と知識共有",
		"オープンソースへの貢献",
	],
};

export default function HandleProfilePage() {
	const [mounted, setMounted] = useState(false);

	const creativeAreasRef = useRef<HTMLElement>(null);
	const currentFocusRef = useRef<HTMLElement>(null);
	const workStyleRef = useRef<HTMLElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const Global_title = "noto-sans-jp-regular text-base leading-snug";

	return (
		<>
			<script type="application/ld+json">
				{JSON.stringify(structuredData)}
			</script>

			<div className="min-h-screen relative">
				{/* Decorative ScrollVelocity */}
				{mounted && (
					<div className="fixed top-20 right-10 z-5 pointer-events-none hidden lg:block">
						<ScrollVelocity
							text="Handle Handle Handle "
							className="text-main/10 text-6xl"
						/>
					</div>
				)}

				<main
					id="main-content"
					className="relative z-10 min-h-screen pt-8 pb-16 px-4"
					tabIndex={-1}
				>
					<div className="container mx-auto max-w-5xl">
						{/* Breadcrumbs */}
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "About", href: "/about" },
								{ label: "Profile", href: "/about" },
								{ label: "Handle", isCurrent: true },
							]}
							className="mb-8"
						/>

						{/* Hidden h1 for SEO */}
						<h1 className="sr-only">samuidoのプロフィール - Handle Profile</h1>

						{/* Header */}
						<section className="mb-24 overflow-visible">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="-mb-8">
										<TypingText
											text="「面白い」を見つけて、探求する"
											className="text-main text-base md:text-lg mb-2 -ml-2"
											speed={15}
											delay={800}
										/>
										<TypingText
											text="こんにちは samuidoです"
											className="text-main text-base md:text-lg mb-4"
											speed={15}
											delay={1000}
										/>
										<TypingText
											text="Discovering and exploring what's interesting"
											className="text-main/60 text-[10px] md:text-xs leading-relaxed"
											speed={5}
											delay={1200}
										/>
										<TypingText
											text="Hello, I'm samuido."
											className="text-main/60 text-[10px] md:text-xs leading-relaxed"
											speed={5}
											delay={1400}
										/>
									</div>
								)}
							</ScrollFloat>
						</section>

						{/* Introduction */}
						<section className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="About About About "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<ScrollFloat stagger={100}>
								<div className="bg-main/5 p-6 rounded-lg space-y-4">
									<p className="noto-sans-jp-light text-sm text-main leading-relaxed">
										「samuido」は、技術とクリエイティビティの境界を探求するハンドルネームです.
										プログラミング、デザイン、映像制作を通じて、新しい表現方法を模索しています.
									</p>
									<p className="noto-sans-jp-light text-sm text-main leading-relaxed">
										コードを書くことも、デザインすることも、音楽を作ることも、
										すべて創造的な行為として捉え、それらを組み合わせた作品作りを心がけています.
									</p>
									<p className="noto-sans-jp-light text-sm text-main leading-relaxed">
										現在は高専生として学習を続けながら、個人プロジェクトやコンテストへの参加を通じて
										スキルアップを図っています.
									</p>
								</div>
							</ScrollFloat>
						</section>

						{/* Creative Areas */}
						<section ref={creativeAreasRef} className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Creative Areas Creative Areas Creative Areas "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<h2 className="sr-only">Creative Areas List</h2>
							<ScrollFloat stagger={100}>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{creativeAreas.map((area) => (
										<div
											key={area.title}
											className="bg-main/5 p-4 rounded-lg hover:bg-main/10 transition-colors flex flex-col"
										>
											<div className="flex items-center mb-2">
												<area.icon className="w-6 h-6 text-accent mr-3 shrink-0" />
												<h3 className="zen-kaku-gothic-new text-lg text-main">
													{area.title}
												</h3>
											</div>
											<p className="noto-sans-jp-light text-sm text-main mb-3">
												{area.description}
											</p>
											<div className="space-y-1 grow">
												{area.projects.map((project) => (
													<div
														key={project}
														className="noto-sans-jp-light text-xs text-main/60"
													>
														• {project}
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</ScrollFloat>
						</section>

						{/* Current Focus */}
						<section ref={currentFocusRef} className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Current Focus Current Focus "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<h2 className="sr-only">Current Focus Areas</h2>
							<ScrollFloat stagger={100}>
								<div className="space-y-3">
									{currentFocus.map((focus) => (
										<div
											key={focus.area}
											className="bg-main/5 p-4 rounded-lg hover:bg-main/10 transition-colors"
										>
											<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
												<h3 className="zen-kaku-gothic-new text-base text-main">
													{focus.area}
												</h3>
												<span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1 inline-block w-fit">
													{focus.status}
												</span>
											</div>
											<p className="noto-sans-jp-light text-sm text-main">
												{focus.description}
											</p>
										</div>
									))}
								</div>
							</ScrollFloat>
						</section>

						{/* Work Style */}
						<section ref={workStyleRef} className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Work Style Work Style Work Style "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<h2 className="sr-only">Work Style Details</h2>
							<ScrollFloat stagger={100}>
								<div className="bg-main/5 p-6 rounded-lg space-y-6">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										<div className="space-y-3">
											<h3 className="zen-kaku-gothic-new text-lg text-main">
												開発環境
											</h3>
											<div className="space-y-2">
												{workStyle.development.map((item, index) => (
													<p
														key={index}
														className="noto-sans-jp-light text-sm text-main"
													>
														• {item}
													</p>
												))}
											</div>
										</div>

										<div className="space-y-3">
											<h3 className="zen-kaku-gothic-new text-lg text-main">
												ワークフロー
											</h3>
											<div className="space-y-2">
												{workStyle.workflow.map((item, index) => (
													<p
														key={index}
														className="noto-sans-jp-light text-sm text-main"
													>
														• {item}
													</p>
												))}
											</div>
										</div>
									</div>

									<div className="pt-4 mt-4">
										<h3 className="zen-kaku-gothic-new text-lg text-main mb-3">
											コラボレーション
										</h3>
										<p className="noto-sans-jp-light text-sm text-main leading-relaxed">
											異なる専門分野の方との協働を大切にしています.
											デザイナー、エンジニア、アーティスト、音楽家など、
											多様なバックグラウンドを持つ方々との共同制作に興味があります.
										</p>
									</div>
								</div>
							</ScrollFloat>
						</section>

						{/* Social Links */}
						<section className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Connect Connect Connect "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<h2 className="sr-only">Social Media Links</h2>
							<ScrollFloat stagger={100}>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="bg-main/5 p-4 rounded-lg hover:bg-main/10 transition-colors">
										<h3 className="zen-kaku-gothic-new text-lg text-main mb-3">
											技術・開発
										</h3>
										<div className="space-y-2">
											<p className="noto-sans-jp-light text-sm text-main">
												Twitter: @361do_sleep
											</p>
											<p className="noto-sans-jp-light text-sm text-main">
												GitHub: @361do
											</p>
										</div>
									</div>

									<div className="bg-main/5 p-4 rounded-lg hover:bg-main/10 transition-colors">
										<h3 className="zen-kaku-gothic-new text-lg text-main mb-3">
											映像・デザイン
										</h3>
										<div className="space-y-2">
											<p className="noto-sans-jp-light text-sm text-main">
												Twitter: @361do_design
											</p>
											<p className="noto-sans-jp-light text-sm text-main">
												Instagram: @361do_sleep
											</p>
										</div>
									</div>

									<div className="bg-main/5 p-4 rounded-lg hover:bg-main/10 transition-colors">
										<h3 className="zen-kaku-gothic-new text-lg text-main mb-3">
											作品・ポートフォリオ
										</h3>
										<div className="space-y-2">
											<p className="noto-sans-jp-light text-sm text-main">
												YouTube: @361do
											</p>
											<p className="noto-sans-jp-light text-sm text-main">
												このサイト: /portfolio
											</p>
										</div>
									</div>
								</div>
							</ScrollFloat>
						</section>

						{/* CTA */}
						<nav aria-label="Profile navigation" className="mb-24">
							<ScrollFloat stagger={0}>
								<h2 className="sr-only">Profile機能</h2>
								<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-6">
									<Link
										href="/about/profile/real"
										className="bg-main/5 text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base hover:bg-main/10 transition-colors rounded-lg"
									>
										<span className={Global_title}>Real Profile</span>
									</Link>

									<Link
										href="/portfolio"
										className="bg-main/5 text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base hover:bg-main/10 transition-colors rounded-lg"
									>
										<span className={Global_title}>Portfolio</span>
									</Link>

									<a
										href="https://links.yusuke-kim.com"
										className="bg-main/5 text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base hover:bg-main/10 transition-colors rounded-lg"
									>
										<span className={Global_title}>Links</span>
									</a>
								</div>
							</ScrollFloat>
						</nav>

						<div className="p-40" />
						{/* Footer */}
						<footer className="left-0 right-0 z-10 flex items-center justify-center">
							<span className="text-xs text-main">© 2025 361do_sleep</span>
						</footer>
					</div>
				</main>
			</div>
		</>
	);
}
