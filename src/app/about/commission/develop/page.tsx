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
	alternates: { canonical: "https://yusuke-kim.com/about/commission/develop" },
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
		itemListElement: ["Web開発", "アプリケーション開発", "プラグイン開発"].map(
			(name) => ({
				"@type": "Offer",
				itemOffered: { "@type": "Service", name },
			}),
		),
	},
};

function Header() {
	return (
		<>
			<Breadcrumbs
				items={[
					{ label: "Home", href: "/" },
					{ label: "About", href: "/about" },
					{ label: "Commission", href: "/about/commission" },
					{ label: "Develop", isCurrent: true },
				]}
				className="pt-4"
			/>
			<header className="space-y-12">
				<h1 className="neue-haas-grotesk-display text-6xl">開発依頼</h1>
				<p className="noto-sans-jp-light text-sm max-w leading-loose">
					Web開発・アプリケーション開発・プラグイン開発の依頼を承ります.
					<br />
					技術的な課題解決から新規開発まで幅広く対応いたします.
				</p>
			</header>
		</>
	);
}

const services = [
	[
		Globe,
		"Web開発",
		["ポートフォリオサイト", "コーポレートサイト", "ECサイト"],
	],
	[Gamepad2, "アプリケーション開発", ["Webアプリ", "ゲーム", "ツール"]],
	[
		Code,
		"プラグイン開発",
		["AfterEffectsプラグイン", "Premiere Proプラグイン"],
	],
	[Wrench, "技術サポート", ["既存システムの改善", "バグ修正"]],
] as const;

function InfoPanel() {
	return (
		<>
			<section>
				<h2 className="neue-haas-grotesk-display text-3xl mb-8">
					開発サービス概要
				</h2>
				<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
					{services.map(([Icon, title, items]) => (
						<div className="p-4 space-y-4" key={title}>
							<div className="flex items-center">
								<Icon className="w-6 h-6 mr-3" />
								<h3 className="zen-kaku-gothic-new text-lg">{title}</h3>
							</div>
							<div className="space-y-2">
								{items.map((item) => (
									<div className="noto-sans-jp-light text-sm" key={item}>
										• {item}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
			<section>
				<h2 className="neue-haas-grotesk-display text-3xl mb-8">依頼の流れ</h2>
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
						<div key={step} className="p-4">
							<div className="flex items-start">
								<div className="shrink-0 w-8 h-8 flex items-center justify-center font-bold mr-4 text-sm">
									{step}
								</div>
								<div className="grow">
									<div className="flex items-center mb-2">
										<Icon className="w-5 h-5 mr-2" />
										<h3 className="zen-kaku-gothic-new">{title}</h3>
									</div>
									<p className="noto-sans-jp-light text-sm">{description}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
		</>
	);
}

function PricingOptionsPanel() {
	return (
		<>
			<section>
				<h2 className="neue-haas-grotesk-display text-3xl mb-8">料金体系</h2>
				<div className="p-4">
					<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
						{[
							["基本料金", "プロジェクト規模に応じた基本料金"],
							["追加料金", "機能追加、修正、サポート費用"],
							["支払い方法", "前払い、分割払い対応"],
							["保証期間", "納品後の保証期間"],
						].map(([title, text]) => (
							<div key={title}>
								<h3 className="zen-kaku-gothic-new text-lg mb-4">{title}</h3>
								<p className="noto-sans-jp-light text-sm mb-4">{text}</p>
							</div>
						))}
					</div>
				</div>
			</section>
			<section>
				<h2 className="neue-haas-grotesk-display text-3xl mb-8">技術スキル</h2>
				<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
					{[
						[
							"フロントエンド",
							["HTML", "CSS", "JavaScript", "TypeScript", "React", "NextJS"],
						],
						["ゲーム開発", ["p5js", "PIXIjs", "Unity"]],
						["プラグイン開発", ["AfterEffects", "Premiere Pro"]],
						["その他", ["C", "C++", "C#", "Python"]],
					].map(([title, skills]) => (
						<div className="p-4 space-y-4" key={title as string}>
							<h3 className="zen-kaku-gothic-new text-lg">{title}</h3>
							<div className="space-y-2">
								{(skills as string[]).map((skill) => (
									<div className="noto-sans-jp-light text-sm" key={skill}>
										{skill}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</>
	);
}

function FormSection() {
	return (
		<section>
			<h2 className="neue-haas-grotesk-display text-3xl mb-8">連絡方法</h2>
			<div className="p-4">
				<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
					<div>
						<div className="flex items-center mb-3">
							<Mail className="w-5 h-5 mr-2" />
							<h3 className="zen-kaku-gothic-new text-lg">メール</h3>
						</div>
						<p className="noto-sans-jp-light text-sm mb-4">
							rebuild.up.up(at)gmail.com
						</p>
						<div className="flex items-center mb-3">
							<MessageCircle className="w-5 h-5 mr-2" />
							<h3 className="zen-kaku-gothic-new text-lg">X (Twitter)</h3>
						</div>
						<p className="noto-sans-jp-light text-sm">@361do_sleep</p>
					</div>
					<div>
						<div className="flex items-center mb-3">
							<Clock className="w-5 h-5 mr-2" />
							<h3 className="zen-kaku-gothic-new text-lg">対応時間</h3>
						</div>
						<p className="noto-sans-jp-light text-sm mb-4">平日 9:00-18:00</p>
						<h3 className="zen-kaku-gothic-new text-lg mb-3">返信時間</h3>
						<p className="noto-sans-jp-light text-sm">24時間以内</p>
					</div>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	const title = "noto-sans-jp-regular leading-snug";
	return (
		<>
			<nav aria-label="Commission navigation">
				<h3 className="sr-only">Commission機能</h3>
				<div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
					<Link
						href="/contact"
						className="text-center p-4 flex items-center justify-center focus: focus:ring-offset-2 focus:ring-offset-base"
					>
						<span className={title}>お問い合わせフォーム</span>
					</Link>
					<Link
						href="/about/commission/estimate"
						className="text-center p-4 flex items-center justify-center focus: focus:ring-offset-2 focus:ring-offset-base"
					>
						<span className={title}>料金計算機</span>
					</Link>
				</div>
			</nav>
			<footer className="pt-4">
				<div className="text-center">
					<p className="shippori-antique-b1-regular text-sm inline-block">
						© 2025 samuido - Development Commission
					</p>
				</div>
			</footer>
		</>
	);
}

export default function DevelopCommissionPage() {
	return (
		<>
			<script type="application/ld+json">
				{JSON.stringify(structuredData)}
			</script>
			<div className="min-h-dvh">
				<main className="flex items-center py-10">
					<div className="container-system">
						<div className="space-y-10">
							<Header />
							<InfoPanel />
							<PricingOptionsPanel />
							<FormSection />
							<Footer />
						</div>
					</div>
				</main>
			</div>
		</>
	);
}
