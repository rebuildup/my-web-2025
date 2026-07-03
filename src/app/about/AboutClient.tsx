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
				"relative group rounded-xl overflow-hidden bg-[#1e1e1e]/90   transition-all hover:shadow-accent/10 border ",
				className,
			)}
		>
			{/* Editor Header */}
			<div className="flex items-center justify-between px-4 py-2   ">
				<div className="flex gap-2">
					<div className="w-2.5 h-2.5 rounded-full " />
					<div className="w-2.5 h-2.5 rounded-full " />
					<div className="w-2.5 h-2.5 rounded-full " />
				</div>
				<span className="text-[10px] font-mono ">{title}</span>
			</div>

			{/* Code Content */}
			<div className="p-4 overflow-x-auto custom-scrollbar ">
				<div className="flex font-mono text-xs md:text-sm leading-relaxed">
					{/* Line Numbers */}
					<div className="flex flex-col text-right  select-none mr-3 pr-3   font-mono">
						{Array.from({ length: 12 }, (_, i) => (
							<span key={i}>{i + 1}</span>
						))}
					</div>
					{/* Code - Simplified rendering for stability */}
					<pre className=" whitespace-pre-wrap font-mono">
						{
							JSON.stringify(data, null, 2).replace(/"([^"]+)":/g, "$1:") // Remove quotes from keys for cleaner look
						}
					</pre>
				</div>
			</div>

			{/* Glow Effect */}
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-tr     transition-opacity duration-500" />
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
		<div className="hidden md:flex items-center gap-6 text-[10px] font-mono tracking-widest uppercase">
			<div className="flex items-center gap-2">
				<span className="w-1.5 h-1.5  rounded-full animate-pulse" />
				<span>Total Content: {stats.totalContents}</span>
			</div>
			<div className="w-[1px] h-3" />
			<div>
				<span>Total Views: {stats.totalViews.toLocaleString()}</span>
			</div>
			<div className="w-[1px] h-3" />
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
			<h3 className="text-xl font-bold font-display flex items-center gap-3">
				<span className="flex gap-1">
					<span className="w-1.5 h-1.5 rounded-full " />
					<span className="w-1.5 h-1.5 rounded-full " />
					<span className="w-1.5 h-1.5 rounded-full " />
				</span>
				{title}
			</h3>
			<div className="relative pl-4 space-y-10">
				{/* Timeline Line */}
				<div className="absolute left-[7px] top-4 bottom-0 w-[1px] bg-gradient-to-b   " />

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
						<span className="absolute left-[3px] top-2.5 w-[9px] h-[9px] rounded-full   z-10 group-hover:scale-125  transition-all duration-300" />

						<div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1.5">
							<span className="font-mono  text-[10px] py-0.5 px-2  rounded">
								{item.date}
							</span>
							<h4 className="text-lg font-bold leading-tight  transition-colors">
								{item.title[lang]}
							</h4>
						</div>

						<p className="/80 text-sm mb-3 font-light leading-relaxed">
							{item.subtitle[lang]}
						</p>

						{(item.description || item.tags) && (
							<div className="text-xs md:text-sm space-y-2 pl-4  transition-colors">
								{item.description && <p>{item.description[lang]}</p>}
								{item.tags && (
									<div className="flex flex-wrap gap-2">
										{item.tags.map((tag) => (
											<span
												key={tag}
												className="text-[10px] font-mono px-2 py-0.5 rounded   transition-colors cursor-default"
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
		<div className="flex items-center  rounded-full p-1 border">
			<button
				onClick={() => setLang("ja")}
				className={cn(
					"px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300",
					lang === "ja" ? "  scale-105" : "/40 hover:/80",
				)}
			>
				JP
			</button>
			<button
				onClick={() => setLang("en")}
				className={cn(
					"px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-300",
					lang === "en" ? "  scale-105" : "/40 hover:/80",
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
			className="min-h-screen relative  selection: overflow-hidden"
		>
			<AboutBackground />

			{/* Progress Bar */}
			<motion.div
				style={{ scaleX }}
				className="fixed top-0 left-0 right-0 h-0.5  z-50 origin-left"
			/>

			{/* Top Navigation Bar */}
			<div className="fixed top-0 left-0 right-0 z-40    transition-all">
				<div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex justify-between items-center">
					<div className=" ">
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
							className="inline-flex items-center gap-2 px-3 py-1 rounded-full  border   text-[10px] font-mono tracking-wider "
						>
							<span className="w-1.5 h-1.5 rounded-full  animate-pulse" />
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
								className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-[0.85]  "
							>
								WHO
								<br />I AM
							</motion.h1>
						</div>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1, duration: 0.3, ease: [0.4, 0, 1, 1] }}
							className=" md:text-lg leading-relaxed max-w-lg font-light "
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
							className="w-full  shadow-black/50"
						/>
					</motion.div>
				</div>

				{/* --- Links Section --- */}
				<section className="mb-24 pt-6">
					<div className="flex flex-wrap gap-8 md:gap-16">
						<Link
							href="/about/profile/real"
							className="group flex items-baseline gap-2 font-bold  transition-colors"
						>
							<span className="text-[10px] font-mono">01</span>
							<span className="text-lg tracking-tight whitespace-nowrap">
								{lang === "ja" ? "本名プロフィール" : "Real Profile"}
							</span>
							<span className="block h-[1px] w-8 group-hover:w-24  transition-all duration-300 ml-2" />
						</Link>
						<Link
							href="/about/profile/handle"
							className="group flex items-baseline gap-2 font-bold  transition-colors"
						>
							<span className="text-[10px] font-mono">02</span>
							<span className="text-lg tracking-tight">
								ハンドルネームプロフィール
							</span>
						</Link>
						<a
							href="https://links.yusuke-kim.com"
							className="group flex items-baseline gap-2 font-bold  transition-colors"
						>
							<span className="text-[10px] font-mono">03</span>
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
									<h3 className="text-xl md:text-2xl font-black font-display min-w-[180px]">
										{category.title}
									</h3>
									<div className="flex flex-wrap gap-x-4 gap-y-2">
										{category.items.map((item, i) => (
											<span
												key={item}
												className=" md:text-lg font-medium  transition-colors duration-300 cursor-default"
											>
												<span className=" mr-1">/</span>
												{item}
											</span>
										))}
									</div>
								</div>
								{/* Decor Line */}
								<div className="absolute -bottom-6 left-0 right-0 h-[1px] bg-gradient-to-r from-main/10 via-main/5  w-full" />
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
				<div className="mt-24 pt-8 flex justify-end text-[10px] font-mono">
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
