"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import DarkVeil from "@/components/DarkVeil";
import { ScrollFloat } from "@/components/ScrollFloat";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// react-bits componentsを動的インポート
const GlitchText = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.GlitchText),
	{ ssr: false },
);
const ShinyText = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.ShinyText),
	{ ssr: false },
);
const ScrollVelocity = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.ScrollVelocity),
	{ ssr: false },
);
const CircularText = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.CircularText),
	{ ssr: false },
);
const SpotlightCard = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.SpotlightCard),
	{ ssr: false },
);
const GlareHover = dynamic(
	() => import("@appletosolutions/reactbits").then((mod) => mod.GlareHover),
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

	useEffect(() => {
		setDisplayedText("");
		let currentIndex = 0;
		let timeoutId: NodeJS.Timeout;
		let intervalId: NodeJS.Timeout;

		const startTyping = () => {
			currentIndex = 0;
			intervalId = setInterval(() => {
				if (currentIndex <= text.length) {
					setDisplayedText(text.slice(0, currentIndex));
					currentIndex++;
				} else {
					clearInterval(intervalId);
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

export default function AboutPage() {
	const [mounted, setMounted] = useState(false);
	const [currentSection, setCurrentSection] = useState("About");

	const aboutRef = useRef<HTMLElement>(null);
	const profileRef = useRef<HTMLElement>(null);
	const skillsRef = useRef<HTMLElement>(null);
	const educationRef = useRef<HTMLElement>(null);
	const achievementsRef = useRef<HTMLElement>(null);
	const imageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	// スクロールに応じた画像のパララックス効果（framer-motionを使用）
	const { scrollYProgress } = useScroll({
		target: imageRef,
		offset: ["start end", "end start"],
	});

	const imageY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

	useEffect(() => {
		if (!mounted) return;

		// 優先順位: Profile > Education > Achievements > About > Skills (最後)
		const sections = [
			{ ref: profileRef, name: "Profile", priority: 1 },
			{ ref: educationRef, name: "Education", priority: 2 },
			{ ref: achievementsRef, name: "Achievements", priority: 3 },
			{ ref: aboutRef, name: "About", priority: 4 },
			{ ref: skillsRef, name: "Skills", priority: 5 }, // 最後に判定
		];

		const observer = new IntersectionObserver(
			(entries) => {
				// すべてのエントリを処理
				const sectionStates = entries
					.map((entry) => {
						const section = sections.find(
							(s) => s.ref.current === entry.target,
						);
						if (!section) return null;

						// SKILLSセクションはより厳しい条件（0.95以上）
						if (section.name === "Skills") {
							return {
								...section,
								isIntersecting:
									entry.isIntersecting && entry.intersectionRatio >= 0.95,
								ratio: entry.intersectionRatio,
							};
						}

						// 他のセクションは通常の条件
						return {
							...section,
							isIntersecting:
								entry.isIntersecting && entry.intersectionRatio >= 0.3,
							ratio: entry.intersectionRatio,
						};
					})
					.filter((s): s is NonNullable<typeof s> => s !== null);

				// 交差しているセクションを優先順位でソート
				const intersectingSections = sectionStates
					.filter((s) => s.isIntersecting)
					.sort((a, b) => {
						// まず優先順位でソート
						if (a.priority !== b.priority) {
							return a.priority - b.priority;
						}
						// 同じ優先順位の場合は交差率が高い順
						return b.ratio - a.ratio;
					});

				// SKILLSセクションが選択されるのは、他のセクションが交差していない場合のみ
				const nonSkillsSections = intersectingSections.filter(
					(s) => s.name !== "Skills",
				);
				const skillsSections = intersectingSections.filter(
					(s) => s.name === "Skills",
				);

				let selectedSection = null;

				// 他のセクションがある場合は、その中から優先度の高いものを選択
				if (nonSkillsSections.length > 0) {
					selectedSection = nonSkillsSections[0];
				} else if (skillsSections.length > 0) {
					// SKILLSセクションのみが交差している場合のみ選択
					selectedSection = skillsSections[0];
				}

				// 最も優先度の高いセクションを選択
				if (selectedSection) {
					// デバッグ用（本番環境では削除可能）
					if (process.env.NODE_ENV === "development") {
						console.log(
							"Current section:",
							selectedSection.name,
							"ratio:",
							selectedSection.ratio,
							"all intersecting:",
							intersectingSections
								.map((s) => `${s.name}:${s.ratio}`)
								.join(", "),
						);
					}
					setCurrentSection(selectedSection.name);
				}
			},
			{
				threshold: [0, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 1.0], // より細かいthresholdで監視
				rootMargin: "-200px 0px -200px 0px", // 判定範囲をさらに狭く
			},
		);

		sections.forEach((section) => {
			if (section.ref.current) {
				observer.observe(section.ref.current);
			}
		});

		return () => {
			sections.forEach((section) => {
				if (section.ref.current) {
					observer.unobserve(section.ref.current);
				}
			});
		};
	}, [mounted]);

	const educationData = [
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

	const achievementsData = [
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

	const skillsData = [
		{
			title: "Design",
			items: ["Photoshop", "Illustrator", "AdobeXD", "Figma"],
		},
		{
			title: "Programming Languages",
			items: ["C", "C++", "C#", "HTML", "JavaScript", "TypeScript", "CSS"],
		},
		{
			title: "Tech Stack",
			items: ["React", "NextJS", "Tailwind CSS", "p5js", "PIXIjs", "GSAP"],
		},
		{
			title: "Video",
			items: ["AfterEffects", "Aviutl", "PremierePro", "Blender"],
		},
		{
			title: "Others",
			items: ["Unity", "Cubase", "VSCode", "Cursor", "Visual Studio"],
		},
	];

	return (
		<div className="min-h-screen relative">
			{/* Background - DarkVeil (same as root) */}
			<div id="bg" className="fixed inset-0">
				<DarkVeil />
			</div>

			{/* Decorative ScrollVelocity */}
			{mounted && (
				<div className="fixed top-20 right-10 z-5 pointer-events-none hidden lg:block">
					<ScrollVelocity
						text="About About About "
						className="text-main/10 text-6xl"
					/>
				</div>
			)}

			{/* CircularText - Center of screen, changes based on section */}
			{mounted && (
				<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5 pointer-events-none hidden lg:block circular-text-wrapper">
					<CircularText
						text={
							currentSection === "Achievements"
								? `${currentSection.toUpperCase()} ${currentSection.toUpperCase()} ${currentSection.toUpperCase()} `
								: currentSection === "Education"
									? `${currentSection.toUpperCase()} ${currentSection.toUpperCase()} ${currentSection.toUpperCase()} ${currentSection.toUpperCase()} `
									: `${currentSection.toUpperCase()} ${currentSection.toUpperCase()} ${currentSection.toUpperCase()} ${currentSection.toUpperCase()} ${currentSection.toUpperCase()} `
						}
						spinDuration={20}
					/>
				</div>
			)}

			<main className="relative z-10 min-h-screen pt-8 pb-16 px-4">
				<div className="container mx-auto max-w-5xl">
					{/* Breadcrumbs */}
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "About", isCurrent: true },
						]}
						className="mb-8"
					/>

					{/* About Section */}
					<section ref={aboutRef} className="mb-16 overflow-visible">
						{/* About Title */}
						<h1 className="text-5xl md:text-7xl mb-8">About</h1>

						{/* Self Introduction */}
						<div className="-mb-8">
							{mounted && (
								<TypingText
									text="Web制作/映像制作/ツール制作 などをしている高専生"
									className="text-main text-base md:text-lg mb-2"
									speed={15}
									delay={800}
								/>
							)}
							{mounted && (
								<TypingText
									text="日々、有意義に時間を溶かしています"
									className="text-main text-base md:text-lg mb-4"
									speed={15}
									delay={800}
								/>
							)}
							{mounted && (
								<TypingText
									text="A technical college student engaged in web development, video production, tool creation, and more"
									className="text-main/60 text-[10px] md:text-xs leading-relaxed"
									speed={5}
									delay={800}
								/>
							)}
							{mounted && (
								<TypingText
									text="I spend my days meaningfully melting away the hours."
									className="text-main/60 text-[10px] md:text-xs leading-relaxed"
									speed={5}
									delay={800}
								/>
							)}
						</div>

						{/* Tekuse Image - Horizontal with parallelogram clip */}
						<div
							ref={imageRef}
							className="relative w-full aspect-video mb-12 overflow-hidden"
							style={{
								clipPath: "polygon(0% 40%, 100% 10%, 100% 60%, 0% 90%)",
							}}
						>
							<motion.div
								style={{ y: imageY }}
								className="relative w-full h-full"
								transition={{
									type: "spring",
									damping: 30,
									stiffness: 200,
									mass: 0.5,
								}}
							>
								<Image
									src="/images/20250412_tekuse.jpg"
									alt="Yusuke Kimura"
									fill
									className="object-cover"
									priority
								/>
							</motion.div>
						</div>
					</section>

					{/* Profile Links Section */}
					<section
						ref={profileRef}
						className="-mt-80 mb-16 relative profile-section"
						style={{
							overflowX: "hidden",
							overflowY: "visible",
							paddingTop: "10rem",
							paddingBottom: "10rem",
							minHeight: "auto",
							height: "auto",
							position: "relative",
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{/* Wrapper for all profile content - rotated together */}
						<div
							style={{
								transform: "rotate(-10deg)",
								transformOrigin: "center",
								overflow: "visible",
								minHeight: "auto",
								height: "auto",
								position: "relative",
								touchAction: "none",
							}}
							onWheel={(e) => {
								if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
									e.preventDefault();
								}
							}}
						>
							{/* Top - PROFILE text */}
							<div
								className="mb-0 overflow-visible relative"
								style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
							>
								<div
									className="flex whitespace-nowrap animate-scroll"
									style={{
										transformOrigin: "left center",
									}}
								>
									<span
										className="text-main/50 text-base md:text-lg mr-8 font-bold italic"
										style={{
											fontFamily:
												"neue-haas-grotesk-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
											fontWeight: 700,
											fontStyle: "italic",
										}}
									>
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE{" "}
									</span>
									<span
										className="text-main/50 text-base md:text-lg mr-8 font-bold italic"
										style={{
											fontFamily:
												"neue-haas-grotesk-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
											fontWeight: 700,
											fontStyle: "italic",
										}}
									>
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE{" "}
									</span>
								</div>
							</div>

							<div className="grid md:grid-cols-2 gap-6">
								<Link
									href="/about/profile/real"
									className="profile-link relative inline-block"
								>
									<h2 className="text-xl md:text-2xl font-bold inline-flex items-center gap-2 text-main relative pb-1">
										<span className="relative inline-flex items-center gap-2">
											<span className="profile-link-text">
												「木村友亮」について知りたい方
											</span>
											<span className="profile-link-arrow text-main/60">→</span>
											<span className="profile-link-underline"></span>
										</span>
									</h2>
								</Link>
								<Link
									href="/about/profile/handle"
									className="profile-link relative inline-block"
								>
									<h2 className="text-xl md:text-2xl font-bold inline-flex items-center gap-2 text-main relative pb-1">
										<span className="relative inline-flex items-center gap-2">
											<span className="profile-link-text">
												「samuido」について知りたい方
											</span>
											<span className="profile-link-arrow text-main/60">→</span>
											<span className="profile-link-underline"></span>
										</span>
									</h2>
								</Link>
							</div>

							{/* Bottom - PROFILE text */}
							<div
								className="mt-0 overflow-visible relative"
								style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
							>
								<div
									className="flex whitespace-nowrap animate-scroll"
									style={{
										transformOrigin: "left center",
									}}
								>
									<span
										className="text-main/50 text-base md:text-lg mr-8 font-bold italic"
										style={{
											fontFamily:
												"neue-haas-grotesk-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
											fontWeight: 700,
											fontStyle: "italic",
										}}
									>
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE{" "}
									</span>
									<span
										className="text-main/50 text-base md:text-lg mr-8 font-bold italic"
										style={{
											fontFamily:
												"neue-haas-grotesk-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
											fontWeight: 700,
											fontStyle: "italic",
										}}
									>
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE PROFILE
										PROFILE PROFILE PROFILE{" "}
									</span>
								</div>
							</div>
						</div>
					</section>

					{/* Scroll indicator arrow */}
					<div className="flex justify-end items-center relative z-10 -mt-24">
						<motion.div
							initial={{ y: 0 }}
							animate={{ y: [0, 4, 0] }}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								ease: "easeInOut",
							}}
							className="text-main/60"
						>
							<svg
								width="32"
								height="80"
								viewBox="0 0 24 60"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M12 5v50M12 55l-6-6" />
							</svg>
						</motion.div>
					</div>

					<div className="p-10" />
					{/* Skills Section */}
					<section
						ref={skillsRef}
						className="-mt-80 mb-16 relative skills-section"
						style={{
							overflowX: "hidden",
							overflow: "visible",
							paddingTop: "12rem",
							paddingBottom: "6rem",
							position: "relative",
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{/* Top - SKILLS text - separated and rotated */}
						<ScrollFloat stagger={0}>
							{mounted && (
								<div
									className="mb-0 overflow-visible relative skills-text-wrapper"
									style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
								>
									<ScrollVelocity
										text="Skills Skills Skills "
										className="text-3xl md:text-4xl text-main"
									/>
								</div>
							)}
						</ScrollFloat>

						{/* Skills content - separated, labels not rotated */}
						<div
							style={{
								overflow: "visible",
								position: "relative",
							}}
						>
							{mounted && (
								<div
									className="space-y-20"
									style={{ overflow: "visible", position: "relative" }}
								>
									{skillsData.map((skill) => (
										<div
											key={skill.title}
											className="relative mb-12"
											style={{ overflow: "visible" }}
										>
											<h3
												className="text-xl font-bold text-main text-right mr-4 z-10 relative"
												style={
													{
														transform: "translateY(4.5rem) rotate(10deg)",
														transformOrigin: "right center",
														opacity: 1,
														willChange: "transform",
														display: "block",
														position: "relative",
														marginBottom: "0",
													} as React.CSSProperties
												}
											>
												{skill.title}
											</h3>
											<div
												className="logo-loop-container overflow-hidden"
												style={{
													transform: "rotate(10deg)",
													transformOrigin: "center",
												}}
											>
												<div className="flex logo-loop gap-4">
													{/* 複数回繰り返してシームレスなループ効果を作る */}
													{[
														...skill.items,
														...skill.items,
														...skill.items,
														...skill.items,
														...skill.items,
													].map((item, index) => (
														<div
															key={`${item}-${index}`}
															className="px-4 py-2 text-main bg-main/5 rounded-full border border-main/10 hover:bg-main/10 hover:border-main/20 transition-colors text-center whitespace-nowrap shrink-0"
														>
															<div className="text-sm font-bold">{item}</div>
														</div>
													))}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Bottom - SKILLS text - separated and rotated */}
						<ScrollFloat stagger={0}>
							{mounted && (
								<div
									className="mt-0 overflow-visible relative skills-text-wrapper"
									style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
								>
									<ScrollVelocity
										text="Skills Skills Skills "
										className="text-3xl md:text-4xl text-main"
									/>
								</div>
							)}
						</ScrollFloat>
					</section>

					{/* Education Section */}
					<section ref={educationRef} className="mb-16">
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

								{educationData.map((edu, index) => (
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

					{/* Achievements Section */}
					<section ref={achievementsRef} className="mb-16">
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
								{achievementsData.map((achievement, index) => (
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
					<div className="p-40" />
					<footer className="left-0 right-0 z-10 flex items-center justify-center ">
						<span className="text-xs text-main">© 2025 361do_sleep</span>
					</footer>
				</div>
			</main>
		</div>
	);
}
