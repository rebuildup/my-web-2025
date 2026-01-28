"use client";

import { Calendar, GraduationCap, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollFloat } from "@/components/ScrollFloat";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const deterministicSample = (items: string[], count: number) => {
	if (!items.length || count <= 0) return [];
	const seed = items
		.join("|")
		.split("")
		.reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 7);
	const start = Math.abs(seed) % items.length;
	const looped = [...items.slice(start), ...items.slice(0, start)];
	return looped.slice(0, Math.min(count, items.length));
};

// react-bits componentsを動的インポート
const ScrollVelocity = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.ScrollVelocity),
	{ ssr: false },
);
const SpotlightCard = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.SpotlightCard),
	{ ssr: false },
);
// ランダム選択された性格をリスト表示するコンポーネント
function RandomPersonalityList({ items }: { items: string[] }) {
	const selectedItems = useMemo(() => deterministicSample(items, 3), [items]);

	return (
		<div className="space-y-3">
			{selectedItems.map((item, index) => (
				<SpotlightCard key={index} className="bg-main/5 p-3 rounded-lg">
					<p className="noto-sans-jp-light text-sm text-main">{item}</p>
				</SpotlightCard>
			))}
		</div>
	);
}

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
	name: "木村友亮",
	alternateName: "samuido",
	birthDate: "2007-10",
	jobTitle: "学生・開発者・デザイナー",
	description:
		"高等専門学校在学中の学生.プログラミング、デザイン、映像制作に従事",
	url: "https://yusuke-kim.com/about/profile/real",
	sameAs: ["https://twitter.com/361do_sleep", "https://github.com/361do"],
	alumniOf: {
		"@type": "EducationalOrganization",
		name: "高等専門学校",
	},
	knowsAbout: [
		"Web Development",
		"Game Development",
		"Video Production",
		"Graphic Design",
		"UI/UX Design",
	],
	award: [
		"中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位",
		"U-16プログラミングコンテスト山口大会2023 技術賞・企業賞",
		"U-16プログラミングコンテスト山口大会2022 アイデア賞",
	],
};

const personalInfo = {
	name: "木村友亮",
	nameReading: "きむら ゆうすけ",
	handleName: "samuido",
	birthDate: "2007年10月",
	age: "18歳",
	location: "山口県 宇部市",
	status: "高等専門学校在学中",
	graduationYear: "2028年予定",
};

const education = [
	{
		date: "2023/3",
		contentJa: "公立中学校 卒業",
		contentEn: "Graduated from public junior high school",
	},
	{
		date: "2023/4",
		contentJa: "宇部高等専門学校 制御情報工学科 入学",
		contentEn: "Enrolled in Ube National Institute of Technology",
	},
	{
		date: "~2028/3",
		contentJa: "宇部高等専門学校 制御情報工学科 在学中",
		contentEn: "Currently enrolled in Ube National Institute of Technology",
	},
];

const achievements = [
	{
		date: "2024/3",
		contentJa: "中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位",
		contentEn:
			"Chugoku Regional National Institute of Technology Computer Festival 2024 - Game Division 1st Place",
	},
	{
		date: "2023/10",
		contentJa:
			"U-16プログラミングコンテスト山口大会2023 技術賞・企業(プライムゲート)賞",
		contentEn:
			"U-16 Programming Contest Yamaguchi 2023 - Technical Award, Corporate (PrimeGate) Award",
	},
	{
		date: "2022/10",
		contentJa: "U-16プログラミングコンテスト山口大会2022 アイデア賞",
		contentEn: "U-16 Programming Contest Yamaguchi 2022 - Idea Award",
	},
	{
		date: "~2023",
		contentJa: "市区学校美術展覧会 入選・特選 複数回受賞",
		contentEn: "Multiple awards at city school art exhibition",
	},
];

const activities = [
	{
		ja: "宇部高専コンピューター部部長",
		en: "President of Ube Kosen Computer Club",
	},
	{
		ja: "学生寮広報委員",
		en: "Public Relations Committee Member of Dormitory",
	},
	{
		ja: "高専祭のWebサイト制作",
		en: "Website Development for Kosen Festival",
	},
	{
		ja: "自作ツールのオンライン販売 実績 20万円",
		en: "Online Tool Sales - 200,000 JPY Revenue",
	},
	{
		ja: "自作ツールのオンライン配布 DL数 8000回以上",
		en: "Online Tool Distribution - Over 8,000 Downloads",
	},
	{
		ja: "映像依頼実績 5件",
		en: "Video Production Requests - 5 Projects",
	},
	{
		ja: "宇部市 第2回地球温暖化対策ショートムービーコンテスト　3位",
		en: "Ube City 2nd Short Movie Contest on Global Warming - 3rd Place",
	},
	{
		ja: "全国高等専門学校プログラミングコンテスト 2年連続出場",
		en: "National Technical College Programming Contest - Participated 2 Years Consecutively",
	},
	{
		ja: "U-16プログラミングコンテスト 動画編集 講師",
		en: "U-16 Programming Contest - Video Editing Instructor",
	},
];

const skillsDetail = [
	"paizaランク B",
	"ゲーム開発(Unity,WebGL,Scratch等)",
	"マイコンプログラミング(実習と趣味で少し Arduino,M5Stack,)",
	"Web開発(html,css,javascript,typescript,React,Vite,NextJS,Tailwind CSS,GCP,Apache,PIXI.js,Three.js,P5JS等)",
	"映像制作(After Effects,Aviutl,Unity)",
	"AfterEffectsプラグイン開発(ExtendScript,C++,CEP)",
	"DTM(Cubase,Studio One,UTAU,Voisona)",
];

const personality = [
	"INTP",
	"コミュ障で声が小さい",
	"雰囲気を伺って帰れそうだったら速攻帰る人",
	"功利主義ぎみ",
	"自分がやったほうがいいことは仕方なくやる人",
	"自分の中の明確な〆切がある人",
	"しばらくゲームしてなかったら、めちゃ下手になってやめた人",
	"土日は昼夜逆転を一周させる人",
	"デュアルモニターじゃないと集中して作業できない人",
	"好き嫌いはほぼ無くて嫌いでも食べるが、梅干しとは和解できない人",
	"甘党",
	"コーヒーを飲みたい日がしばしばある人",
	"フロントエンドに生きたい人",
	"新しいものが好きな人",
	"買い物は4000を超えると考える時間が生まれる人",
	"Adobeを高専1年生のときから契約している人",
	"バス待ち30分なら30分歩く人",
	"コンビニで弁当買って部屋で食べる人",
];

export default function RealProfilePage() {
	const [mounted, setMounted] = useState(false);
	const shuffledPersonality = useMemo(
		() => deterministicSample(personality, personality.length),
		[],
	);

	const personalInfoRef = useRef<HTMLElement>(null);
	const educationRef = useRef<HTMLElement>(null);
	const skillsRef = useRef<HTMLElement>(null);
	const achievementsRef = useRef<HTMLElement>(null);

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
							text="Profile Profile Profile "
							className="text-main/10 text-6xl"
						/>
					</div>
				)}

				<main className="relative z-10 min-h-screen pt-8 pb-16 px-4">
					<div className="container mx-auto max-w-5xl">
						{/* Breadcrumbs */}
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "About", href: "/about" },
								{ label: "Profile", href: "/about" },
								{ label: "Real", isCurrent: true },
							]}
							className="mb-8"
						/>

						{/* Hidden h1 for SEO */}
						<h1 className="sr-only">木村友亮のプロフィール - Real Profile</h1>

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
											text="こんにちは 木村友亮です"
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
											text="Hello, I'm Yusuke Kimura."
											className="text-main/60 text-[10px] md:text-xs leading-relaxed"
											speed={5}
											delay={1400}
										/>
									</div>
								)}
							</ScrollFloat>
						</section>

						{/* Activities & Achievements */}
						<section className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Activities Activities Activities "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<ScrollFloat stagger={100}>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{activities.map((activity, index) => (
										<div
											key={index}
											className="bg-main/5 p-4 rounded-lg hover:bg-main/10 transition-colors flex flex-col"
										>
											<h4 className="zen-kaku-gothic-new text-base text-main mb-2">
												{activity.ja}
											</h4>
											<p className="noto-sans-jp-light text-xs text-main/60 leading-relaxed grow">
												{activity.en}
											</p>
										</div>
									))}
								</div>
							</ScrollFloat>
						</section>

						{/* Personal Information */}
						<section ref={personalInfoRef} className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Personal Information Personal Information "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<h2 className="sr-only">Personal Information Details</h2>
							<ScrollFloat stagger={100}>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
									<div className="flex items-start gap-2">
										<Calendar className="w-5 h-5 text-accent shrink-0 mt-1" />
										<div className="flex-1">
											<h3 className="zen-kaku-gothic-new text-sm text-main/60 mb-1">
												生年月日・年齢
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												{personalInfo.birthDate}生まれ（{personalInfo.age}）
											</p>
										</div>
									</div>

									<div className="flex items-start gap-2">
										<MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
										<div className="flex-1">
											<h3 className="zen-kaku-gothic-new text-sm text-main/60 mb-1">
												居住地
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												{personalInfo.location}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-2">
										<GraduationCap className="w-5 h-5 text-accent shrink-0 mt-1" />
										<div className="flex-1">
											<h3 className="zen-kaku-gothic-new text-sm text-main/60 mb-1">
												現在の状況
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												{personalInfo.status}
											</p>
											<p className="noto-sans-jp-light text-xs text-accent">
												卒業予定: {personalInfo.graduationYear}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-2">
										<div className="flex-1">
											<h3 className="zen-kaku-gothic-new text-sm text-main/60 mb-1">
												名前
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												{personalInfo.name}（{personalInfo.nameReading}）
											</p>
											<p className="noto-sans-jp-light text-xs text-accent">
												ハンドルネーム: {personalInfo.handleName}
											</p>
										</div>
									</div>
								</div>
							</ScrollFloat>
						</section>

						{/* Education */}
						<section ref={educationRef} className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Education Education Education "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<ScrollFloat stagger={100}>
								<div className="relative pl-8 timeline-container">
									{/* タイムラインの縦線 */}
									<div className="absolute left-0 top-0 bottom-0 w-0.5 bg-main/20 timeline-line"></div>

									{education.map((edu, index) => (
										<div key={index} className="relative mb-8 timeline-item">
											{/* タイムラインノード（点） */}
											<div className="absolute w-3 h-3 rounded-full bg-main/60 border-2 border-main timeline-node"></div>

											<div className="text-main">
												<div className="text-sm md:text-base font-bold text-main/60 mb-2">
													{edu.date}
												</div>
												<div className="text-base md:text-lg text-main mb-1">
													{edu.contentJa}
												</div>
												<div className="text-main/60 text-[10px] md:text-xs leading-relaxed">
													{edu.contentEn}
												</div>
											</div>
										</div>
									))}
								</div>
							</ScrollFloat>
						</section>

						{/* Technical Skills */}
						<section ref={skillsRef} className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Skills Skills Skills "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<ScrollFloat stagger={100}>
								<div className="space-y-3">
									{skillsDetail.map((skill, index) => (
										<div
											key={index}
											className="bg-main/5 p-3 rounded-lg hover:bg-main/10 transition-colors"
										>
											<p className="noto-sans-jp-light text-sm text-main">
												{skill}
											</p>
										</div>
									))}
								</div>
							</ScrollFloat>
						</section>

						{/* Achievements */}
						<section ref={achievementsRef} className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="Achievements Achievements Achievements "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<ScrollFloat stagger={100}>
								<div className="space-y-12 pt-40">
									{achievements.map((achievement, index) => (
										<div key={index} className="text-left">
											<div className="text-main">
												<div className="text-sm md:text-base font-bold text-main/60 mb-2">
													{achievement.date}
												</div>
												<div className="text-base md:text-lg text-main mb-1">
													{achievement.contentJa}
												</div>
												<div className="text-main/60 text-[10px] md:text-xs leading-relaxed">
													{achievement.contentEn}
												</div>
											</div>
										</div>
									))}
								</div>
							</ScrollFloat>
						</section>

						{/* Personality */}
						<section className="mb-24">
							<ScrollFloat stagger={0}>
								{mounted && (
									<div className="mb-8">
										<ScrollVelocity
											text="About Me About Me About Me "
											className="text-3xl md:text-4xl text-main"
										/>
									</div>
								)}
							</ScrollFloat>

							<ScrollFloat stagger={100}>
								{mounted && shuffledPersonality.length > 0 && (
									<RandomPersonalityList items={shuffledPersonality} />
								)}
							</ScrollFloat>
						</section>

						{/* CTA */}
						<nav aria-label="Profile navigation" className="mb-24">
							<ScrollFloat stagger={0}>
								<h2 className="sr-only">Profile機能</h2>
								<div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-6">
									<Link
										href="/about/profile/handle"
										className="bg-main/5 text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base hover:bg-main/10 transition-colors rounded-lg"
									>
										<span className={Global_title}>Handle Profile</span>
									</Link>

									<Link
										href="/about/card/real"
										className="bg-main/5 text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base hover:bg-main/10 transition-colors rounded-lg"
									>
										<span className={Global_title}>Digital Card</span>
									</Link>
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
