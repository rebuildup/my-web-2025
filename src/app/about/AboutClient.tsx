"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

// --- Types ---
interface BilingualText {
	ja: string;
	en: string;
}

interface SystemStats {
	totalContents: number;
	totalViews: number;
	lastUpdated: string;
	dbSize: number;
	totalComponents: number;
}

interface TimelineItem {
	date: string;
	title: BilingualText;
	subtitle: BilingualText;
	description?: BilingualText;
	tags?: string[];
}

interface SkillCategory {
	title: string;
	items: string[];
}

interface ProfileData {
	name: string;
	role: BilingualText;
	bio: BilingualText;
	interests: { ja: string[]; en: string[] };
}

interface AboutClientProps {
	stats: SystemStats;
	profile: ProfileData;
	education: TimelineItem[];
	achievements: TimelineItem[];
	skills: SkillCategory[];
	latestProject: {
		id: string;
		title: string;
		date: string;
		type: string;
	} | null;
}

// --- Components ---

function CodeBlock({
	title,
	data,
	className,
}: {
	title: string;
	data: object;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative group rounded-xl overflow-hidden bg-[#1e1e1e]/90 backdrop-blur-md shadow-2xl transition-all hover:shadow-accent/10 border border-white/5",
				className,
			)}
		>
			{/* Editor Header */}
			<div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-black/50">
				<div className="flex gap-2">
					<div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
					<div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
					<div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
				</div>
				<span className="text-[10px] font-mono text-white/50">{title}</span>
			</div>

			{/* Code Content */}
			<div className="p-4 overflow-x-auto custom-scrollbar bg-[#1e1e1e]">
				<div className="flex font-mono text-xs md:text-sm leading-relaxed">
					{/* Line Numbers */}
					<div className="flex flex-col text-right text-white/20 select-none mr-3 pr-3 border-r border-white/10 font-mono">
						{Array.from({ length: 12 }, (_, i) => (
							<span key={i}>{i + 1}</span>
						))}
					</div>
					{/* Code - Simplified rendering for stability */}
					<pre className="text-[#d4d4d4] whitespace-pre-wrap font-mono">
						{
							JSON.stringify(data, null, 2).replace(/"([^"]+)":/g, "$1:") // Remove quotes from keys for cleaner look
						}
					</pre>
				</div>
			</div>

			{/* Glow Effect */}
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
		</div>
	);
}

// System Metrics as a Compact List
function SystemMetricsList({
	stats,
	lang,
}: {
	stats: SystemStats;
	lang: "ja" | "en";
}) {
	return (
		<div className="hidden md:flex items-center gap-6 text-[10px] font-mono tracking-widest text-main/40 uppercase">
			<div className="flex items-center gap-2">
				<span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-pulse" />
				<span>Total Content: {stats.totalContents}</span>
			</div>
			<div className="w-[1px] h-3 bg-main/10" />
			<div>
				<span>Total Views: {stats.totalViews.toLocaleString()}</span>
			</div>
			<div className="w-[1px] h-3 bg-main/10" />
			<div>
				<span>System Ver: 2.5.0</span>
			</div>
		</div>
	);
}

function TerminalTimeline({
	items,
	title,
	lang,
}: {
	items: TimelineItem[];
	title: string;
	lang: "ja" | "en";
}) {
	return (
		<div className="space-y-6">
			<h3 className="text-xl font-bold font-display text-main flex items-center gap-3">
				<span className="flex gap-1">
					<span className="w-1.5 h-1.5 rounded-full bg-accent" />
					<span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
					<span className="w-1.5 h-1.5 rounded-full bg-accent/20" />
				</span>
				{title}
			</h3>
			<div className="relative pl-4 space-y-10">
				{/* Timeline Line */}
				<div className="absolute left-[7px] top-4 bottom-0 w-[1px] bg-gradient-to-b from-accent/30 via-accent/10 to-transparent" />

				{items.map((item, idx) => (
					<motion.div
						key={idx}
						initial={{ opacity: 0, x: -5 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{
							delay: idx * 0.03,
							duration: 0.3,
							ease: [0.4, 0, 1, 1],
						}}
						className="relative pl-8 group"
					>
						{/* Node */}
						<span className="absolute left-[3px] top-2.5 w-[9px] h-[9px] rounded-full bg-base border-2 border-accent z-10 group-hover:scale-125 group-hover:bg-accent transition-all duration-300" />

						<div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1.5">
							<span className="font-mono text-accent text-[10px] py-0.5 px-2 bg-accent/10 rounded">
								{item.date}
							</span>
							<h4 className="text-lg font-bold text-main leading-tight group-hover:text-accent transition-colors">
								{item.title[lang]}
							</h4>
						</div>

						<p className="text-main/80 text-sm mb-3 font-light leading-relaxed">
							{item.subtitle[lang]}
						</p>

						{(item.description || item.tags) && (
							<div className="text-xs md:text-sm text-main/60 space-y-2 pl-4 border-l border-main/10 group-hover:border-accent/30 transition-colors">
								{item.description && <p>{item.description[lang]}</p>}
								{item.tags && (
									<div className="flex flex-wrap gap-2">
										{item.tags.map((tag) => (
											<span
												key={tag}
												className="text-[10px] font-mono text-main/50 px-2 py-0.5 bg-main/5 rounded hover:bg-accent/10 hover:text-accent transition-colors cursor-default"
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</div>
						)}
					</motion.div>
				))}
			</div>
		</div>
	);
}

function LangToggle({
	lang,
	setLang,
}: {
	lang: "ja" | "en";
	setLang: (l: "ja" | "en") => void;
}) {
	return (
		<div className="flex items-center bg-base/50 backdrop-blur-md rounded-full p-1 border border-main/10">
			<button
				onClick={() => setLang("ja")}
				className={cn(
					"px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300",
					lang === "ja"
						? "bg-main text-base shadow-lg scale-105"
						: "text-main/40 hover:text-main/80",
				)}
			>
				JP
			</button>
			<button
				onClick={() => setLang("en")}
				className={cn(
					"px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300",
					lang === "en"
						? "bg-main text-base shadow-lg scale-105"
						: "text-main/40 hover:text-main/80",
				)}
			>
				EN
			</button>
		</div>
	);
}

// --- Main Client Component ---
const AboutBackground = dynamic(
	() => import("@/components/AboutBackgroundCSS"),
	{
		ssr: false,
	},
);

export default function AboutClient({
	stats,
	profile,
	education,
	achievements,
	skills,
	latestProject,
}: AboutClientProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	const [lang, setLang] = useState<"ja" | "en">("ja");

	return (
		<div
			ref={containerRef}
			className="min-h-screen relative bg-transparent text-main selection:bg-accent/30 overflow-hidden"
		>
			<AboutBackground />

			{/* Progress Bar */}
			<motion.div
				style={{ scaleX }}
				className="fixed top-0 left-0 right-0 h-0.5 bg-accent z-50 origin-left"
			/>

			{/* Top Navigation Bar */}
			<div className="fixed top-0 left-0 right-0 z-40 bg-base/80 backdrop-blur-md border-b border-white/5 transition-all">
				<div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex justify-between items-center">
					<div className="mix-blend-difference text-main">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "About", isCurrent: true },
							]}
						/>
					</div>

					<div className="flex items-center gap-4 md:gap-6">
						<SystemMetricsList stats={stats} lang={lang} />
						<LangToggle lang={lang} setLang={setLang} />
					</div>
				</div>
			</div>

			<main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
				{/* --- Hero Section: Profile as Code --- */}
				<div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16">
					<div className="space-y-6">
						<motion.div
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, ease: [0.4, 0, 1, 1] }}
							className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono tracking-wider backdrop-blur-sm"
						>
							<span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
							SYSTEM_OPERATIONAL
						</motion.div>

						<div className="relative">
							<motion.h1
								initial={{ opacity: 0, x: -5 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									delay: 0.05,
									duration: 0.3,
									ease: [0.4, 0, 1, 1],
								}}
								className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter text-main leading-[0.85] mix-blend-overlay opacity-90"
							>
								WHO
								<br />I AM
							</motion.h1>
						</div>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1, duration: 0.3, ease: [0.4, 0, 1, 1] }}
							className="text-base md:text-lg text-main/80 leading-relaxed max-w-lg font-light drop-shadow-sm"
						>
							{profile.bio[lang]}
						</motion.p>
					</div>

					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.15, duration: 0.3, ease: [0.4, 0, 1, 1] }}
						className="relative"
					>
						<CodeBlock
							title="profile.json"
							data={{
								name: profile.name,
								role: profile.role[lang],
								location: "Yamaguchi, Japan",
								status: "Coding...",
								interests: profile.interests[lang],
								latest_work: latestProject
									? `${latestProject.title} (${latestProject.date})`
									: "Loading...",
							}}
							className="w-full shadow-2xl shadow-black/50"
						/>
					</motion.div>
				</div>

				{/* --- Links Section --- */}
				<section className="mb-24 border-t border-main/5 pt-6">
					<div className="flex flex-wrap gap-8 md:gap-16">
						<Link
							href="/about/profile/real"
							className="group flex items-baseline gap-2 text-main font-bold hover:text-accent transition-colors"
						>
							<span className="text-[10px] font-mono text-main/40">01</span>
							<span className="text-lg tracking-tight whitespace-nowrap">
								{lang === "ja" ? "本名プロフィール" : "Real Profile"}
							</span>
							<span className="block h-[1px] w-8 group-hover:w-24 bg-accent transition-all duration-300 ml-2" />
						</Link>
						<Link
							href="/about/profile/handle"
							className="group flex items-baseline gap-2 text-main/60 font-bold hover:text-accent transition-colors"
						>
							<span className="text-[10px] font-mono text-main/30">02</span>
							<span className="text-lg tracking-tight">
								ハンドルネームプロフィール
							</span>
						</Link>
						<a
							href="https://links.yusuke-kim.com"
							className="group flex items-baseline gap-2 text-main/60 font-bold hover:text-accent transition-colors"
						>
							<span className="text-[10px] font-mono text-main/30">03</span>
							<span className="text-lg tracking-tight">Links</span>
						</a>
					</div>
				</section>

				{/* --- Skills as Tech Clusters --- */}
				<section className="mb-24 relative">
					<div className="space-y-16">
						{skills.map((category, idx) => (
							<motion.div
								key={category.title}
								initial={{ opacity: 0, y: 5 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									delay: idx * 0.03,
									duration: 0.3,
									ease: [0.4, 0, 1, 1],
								}}
								className="group relative"
							>
								<div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12">
									<h3 className="text-xl md:text-2xl font-black font-display text-main min-w-[180px]">
										{category.title}
									</h3>
									<div className="flex flex-wrap gap-x-4 gap-y-2">
										{category.items.map((item, i) => (
											<span
												key={item}
												className="text-base md:text-lg font-medium text-main/50 hover:text-accent transition-colors duration-300 cursor-default"
											>
												<span className="text-accent/40 mr-1">/</span>
												{item}
											</span>
										))}
									</div>
								</div>
								{/* Decor Line */}
								<div className="absolute -bottom-6 left-0 right-0 h-[1px] bg-gradient-to-r from-main/10 via-main/5 to-transparent w-full" />
							</motion.div>
						))}
					</div>
				</section>

				{/* --- Timeline --- */}
				<section className="max-w-5xl mx-auto">
					<div className="grid md:grid-cols-2 gap-12 lg:gap-16">
						<TerminalTimeline items={education} title="Education" lang={lang} />
						<TerminalTimeline
							items={achievements}
							title="Achievements"
							lang={lang}
						/>
					</div>
				</section>

				{/* Footer Info */}
				<div className="mt-24 pt-8 border-t border-main/5 flex justify-end text-[10px] font-mono text-main/20">
					<span>
						LAST_UPDATE:{" "}
						{new Date(stats.lastUpdated).toLocaleString(
							lang === "ja" ? "ja-JP" : "en-US",
						)}
					</span>
				</div>
			</main>
		</div>
	);
}
