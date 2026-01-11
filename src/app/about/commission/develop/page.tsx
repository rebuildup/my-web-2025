import {
	CheckCircle,
	Clock,
	Code,
	Gamepad2,
	Globe,
	Mail,
	MessageCircle,
	Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
	title: "開発依頼 - samuido | Web開発・アプリ開発・プラグイン開発",
	description:
		"Web開発、アプリケーション開発、プラグイン開発の依頼を受け付けています.React、NextJS、AfterEffectsなど幅広い技術に対応.",
	keywords: [
		"Web開発",
		"アプリ開発",
		"プラグイン開発",
		"React",
		"NextJS",
		"AfterEffects",
		"フリーランス",
	],
	robots: "index, follow",
	alternates: {
		canonical: "https://yusuke-kim.com/about/commission/develop",
	},
	openGraph: {
		title: "開発依頼 - samuido | Web開発・アプリ開発・プラグイン開発",
		description:
			"Web開発、アプリケーション開発、プラグイン開発の依頼を受け付けています.React、NextJS、AfterEffectsなど幅広い技術に対応.",
		type: "website",
		url: "https://yusuke-kim.com/about/commission/develop",
		images: [
			{
				url: "https://yusuke-kim.com/about/commission-develop-og-image.png",
				width: 1200,
				height: 630,
				alt: "開発依頼 - samuido",
			},
		],
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "開発依頼 - samuido | Web開発・アプリ開発・プラグイン開発",
		description:
			"Web開発、アプリケーション開発、プラグイン開発の依頼を受け付けています.React、NextJS、AfterEffectsなど幅広い技術に対応.",
		images: [
			"https://yusuke-kim.com/about/commission-develop-twitter-image.jpg",
		],
		creator: "@361do_sleep",
	},
};

const structuredData = {
	"@context": "https://schema.org",
	"@type": "Service",
	name: "samuido 開発サービス",
	description: "Web開発、アプリケーション開発、プラグイン開発サービス",
	url: "https://yusuke-kim.com/about/commission/develop",
	provider: {
		"@type": "Person",
		name: "木村友亮",
		alternateName: "samuido",
		email: "361do.sleep(at)gmail.com",
	},
	serviceType: "Web Development",
	areaServed: "Japan",
	hasOfferCatalog: {
		"@type": "OfferCatalog",
		name: "開発サービス",
		itemListElement: [
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "Web開発",
				},
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "アプリケーション開発",
				},
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "プラグイン開発",
				},
			},
		],
	},
};

export default function DevelopCommissionPage() {
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
									{ label: "Commission", href: "/about/commission" },
									{ label: "Develop", isCurrent: true },
								]}
								className="pt-4"
							/>

							{/* Header */}
							<header className="space-y-12">
								<h1 className="neue-haas-grotesk-display text-6xl text-main">
									開発依頼
								</h1>
								<p className="noto-sans-jp-light text-sm max-w leading-loose">
									Web開発・アプリケーション開発・プラグイン開発の依頼を承ります.
									<br />
									技術的な課題解決から新規開発まで幅広く対応いたします.
								</p>
							</header>

							{/* Services Overview */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									開発サービス概要
								</h2>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
									<div className="bg-base border border-main p-4 space-y-4">
										<div className="flex items-center">
											<Globe className="w-6 h-6 text-accent mr-3" />
											<h3 className="zen-kaku-gothic-new text-lg text-main">
												Web開発
											</h3>
										</div>
										<div className="space-y-2">
											<div className="noto-sans-jp-light text-sm text-main">
												• ポートフォリオサイト
											</div>
											<div className="noto-sans-jp-light text-sm text-main">
												• コーポレートサイト
											</div>
											<div className="noto-sans-jp-light text-sm text-main">
												• ECサイト
											</div>
										</div>
									</div>

									<div className="bg-base border border-main p-4 space-y-4">
										<div className="flex items-center">
											<Gamepad2 className="w-6 h-6 text-accent mr-3" />
											<h3 className="zen-kaku-gothic-new text-lg text-main">
												アプリケーション開発
											</h3>
										</div>
										<div className="space-y-2">
											<div className="noto-sans-jp-light text-sm text-main">
												• Webアプリ
											</div>
											<div className="noto-sans-jp-light text-sm text-main">
												• ゲーム
											</div>
											<div className="noto-sans-jp-light text-sm text-main">
												• ツール
											</div>
										</div>
									</div>

									<div className="bg-base border border-main p-4 space-y-4">
										<div className="flex items-center">
											<Code className="w-6 h-6 text-accent mr-3" />
											<h3 className="zen-kaku-gothic-new text-lg text-main">
												プラグイン開発
											</h3>
										</div>
										<div className="space-y-2">
											<div className="noto-sans-jp-light text-sm text-main">
												• AfterEffectsプラグイン
											</div>
											<div className="noto-sans-jp-light text-sm text-main">
												• Premiere Proプラグイン
											</div>
										</div>
									</div>

									<div className="bg-base border border-main p-4 space-y-4">
										<div className="flex items-center">
											<Wrench className="w-6 h-6 text-accent mr-3" />
											<h3 className="zen-kaku-gothic-new text-lg text-main">
												技術サポート
											</h3>
										</div>
										<div className="space-y-2">
											<div className="noto-sans-jp-light text-sm text-main">
												• 既存システムの改善
											</div>
											<div className="noto-sans-jp-light text-sm text-main">
												• バグ修正
											</div>
										</div>
									</div>
								</div>
							</section>

							{/* Process */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									依頼の流れ
								</h2>
								<div className="space-y-4">
									{[
										{
											step: 1,
											title: "お問い合わせ",
											description: "メールまたはXのDMで依頼内容を相談",
											icon: MessageCircle,
										},
										{
											step: 2,
											title: "要件確認",
											description: "詳細な要件と仕様の確認",
											icon: CheckCircle,
										},
										{
											step: 3,
											title: "見積もり",
											description: "開発期間と料金の見積もり",
											icon: Clock,
										},
										{
											step: 4,
											title: "開発開始",
											description: "要件に基づいた開発作業",
											icon: Code,
										},
										{
											step: 5,
											title: "テスト・修正",
											description: "動作確認と必要に応じた修正",
											icon: Wrench,
										},
										{
											step: 6,
											title: "納品",
											description: "完成品の納品とサポート",
											icon: CheckCircle,
										},
									].map(({ step, title, description, icon: Icon }) => (
										<div key={step} className="bg-base border border-main p-4">
											<div className="flex items-start">
												<div className="flex-shrink-0 w-8 h-8 bg-accent text-main flex items-center justify-center font-bold mr-4 text-sm">
													{step}
												</div>
												<div className="flex-grow">
													<div className="flex items-center mb-2">
														<Icon className="w-5 h-5 text-accent mr-2" />
														<h3 className="zen-kaku-gothic-new text-base text-main">
															{title}
														</h3>
													</div>
													<p className="noto-sans-jp-light text-sm text-main">
														{description}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</section>

							{/* Pricing */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									料金体系
								</h2>
								<div className="bg-base border border-main p-4">
									<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
										<div>
											<h3 className="zen-kaku-gothic-new text-lg text-main mb-4">
												基本料金
											</h3>
											<p className="noto-sans-jp-light text-sm text-main mb-4">
												プロジェクト規模に応じた基本料金
											</p>

											<h3 className="zen-kaku-gothic-new text-lg text-main mb-4">
												追加料金
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												機能追加、修正、サポート費用
											</p>
										</div>
										<div>
											<h3 className="zen-kaku-gothic-new text-lg text-main mb-4">
												支払い方法
											</h3>
											<p className="noto-sans-jp-light text-sm text-main mb-4">
												前払い、分割払い対応
											</p>

											<h3 className="zen-kaku-gothic-new text-lg text-main mb-4">
												保証期間
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												納品後の保証期間
											</p>
										</div>
									</div>
								</div>
							</section>

							{/* Skills */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									技術スキル
								</h2>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
									<div className="bg-base border border-main p-4 space-y-4">
										<h3 className="zen-kaku-gothic-new text-lg text-main">
											フロントエンド
										</h3>
										<div className="space-y-2">
											{[
												"HTML",
												"CSS",
												"JavaScript",
												"TypeScript",
												"React",
												"NextJS",
											].map((skill) => (
												<div
													key={skill}
													className="noto-sans-jp-light text-sm text-main"
												>
													{skill}
												</div>
											))}
										</div>
									</div>

									<div className="bg-base border border-main p-4 space-y-4">
										<h3 className="zen-kaku-gothic-new text-lg text-main">
											ゲーム開発
										</h3>
										<div className="space-y-2">
											{["p5js", "PIXIjs", "Unity"].map((skill) => (
												<div
													key={skill}
													className="noto-sans-jp-light text-sm text-main"
												>
													{skill}
												</div>
											))}
										</div>
									</div>

									<div className="bg-base border border-main p-4 space-y-4">
										<h3 className="zen-kaku-gothic-new text-lg text-main">
											プラグイン開発
										</h3>
										<div className="space-y-2">
											{["AfterEffects", "Premiere Pro"].map((skill) => (
												<div
													key={skill}
													className="noto-sans-jp-light text-sm text-main"
												>
													{skill}
												</div>
											))}
										</div>
									</div>

									<div className="bg-base border border-main p-4 space-y-4">
										<h3 className="zen-kaku-gothic-new text-lg text-main">
											その他
										</h3>
										<div className="space-y-2">
											{["C", "C++", "C#", "Python"].map((skill) => (
												<div
													key={skill}
													className="noto-sans-jp-light text-sm text-main"
												>
													{skill}
												</div>
											))}
										</div>
									</div>
								</div>
							</section>

							{/* Contact */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									連絡方法
								</h2>
								<div className="bg-base border border-main p-4">
									<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
										<div>
											<div className="flex items-center mb-3">
												<Mail className="w-5 h-5 text-accent mr-2" />
												<h3 className="zen-kaku-gothic-new text-lg text-main">
													メール
												</h3>
											</div>
											<p className="noto-sans-jp-light text-sm text-main mb-4">
												rebuild.up.up(at)gmail.com
											</p>

											<div className="flex items-center mb-3">
												<MessageCircle className="w-5 h-5 text-accent mr-2" />
												<h3 className="zen-kaku-gothic-new text-lg text-main">
													X (Twitter)
												</h3>
											</div>
											<p className="noto-sans-jp-light text-sm text-main">
												@361do_sleep
											</p>
										</div>
										<div>
											<div className="flex items-center mb-3">
												<Clock className="w-5 h-5 text-accent mr-2" />
												<h3 className="zen-kaku-gothic-new text-lg text-main">
													対応時間
												</h3>
											</div>
											<p className="noto-sans-jp-light text-sm text-main mb-4">
												平日 9:00-18:00
											</p>

											<h3 className="zen-kaku-gothic-new text-lg text-main mb-3">
												返信時間
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												24時間以内
											</p>
										</div>
									</div>
								</div>
							</section>

							{/* CTA */}
							<nav aria-label="Commission navigation">
								<h3 className="sr-only">Commission機能</h3>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
									<Link
										href="/contact"
										className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className={Global_title}>お問い合わせフォーム</span>
									</Link>

									<Link
										href="/about/commission/estimate"
										className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className={Global_title}>料金計算機</span>
									</Link>
								</div>
							</nav>

							{/* Footer */}
							<footer className="pt-4 border-t border-main">
								<div className="text-center">
									<p className="shippori-antique-b1-regular text-sm inline-block">
										© 2025 samuido - Development Commission
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
