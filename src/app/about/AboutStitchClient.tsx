"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import type { PortfolioContentItem } from "@/types/portfolio";
import { links } from "./links/data";

interface BilingualText {
	ja: string;
	en: string;
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

interface AboutStitchClientProps {
	profile: ProfileData;
	education: TimelineItem[];
	achievements: TimelineItem[];
	skills: SkillCategory[];
	portfolioItems: PortfolioContentItem[];
}

const AboutBackground = dynamic(() => import("@/components/AboutBackgroundCSS"), {
	ssr: false,
});

export default function AboutStitchClient({
	profile,
	education,
	achievements,
	skills,
	portfolioItems,
}: AboutStitchClientProps) {
	const [lang, setLang] = useState<"ja" | "en">("ja");
	const timelineItems = [
		...education.map((item) => ({ ...item, group: "Education" as const })),
		...achievements.map((item) => ({
			...item,
			group: "Achievements" as const,
		})),
	].sort((a, b) => a.date.localeCompare(b.date));

	const summarizeTimeline = (item: TimelineItem) => {
		const parts = [item.subtitle[lang], item.description?.[lang]]
			.filter(Boolean)
			.join(" / ");
		const max = 80;
		if (parts.length <= max) return parts;
		return `${parts.slice(0, max)}…`;
	};

	return (
		<div className="min-h-screen relative overflow-hidden bg-transparent text-main selection:bg-accent selection:text-main">
			<AboutBackground />

			<main className="w-full relative">
				{/* SECTION 01: HERO */}
				<section className="min-h-screen w-full flex flex-col justify-between px-4 py-10 md:p-12 border-b border-white/10 relative overflow-hidden">
					<div className="absolute top-4 left-4 md:top-12 md:left-12 flex items-center gap-2 text-[10px] font-mono tracking-widest text-main/60 z-20">
						<Link href="/" className="hover:text-main transition-colors">
							HOME
						</Link>
						<span className="text-accent">/</span>
						<span className="text-main">ABOUT</span>
					</div>

					<div className="absolute top-4 right-4 md:top-12 md:right-12 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 backdrop-blur-sm p-1 text-[10px] font-mono tracking-widest">
						<button
							type="button"
							onClick={() => setLang("ja")}
							className={
								lang === "ja"
									? "px-3 py-1 rounded-full bg-main text-base"
									: "px-3 py-1 rounded-full text-main/60 hover:text-main transition-colors"
							}
						>
							JA
						</button>
						<button
							type="button"
							onClick={() => setLang("en")}
							className={
								lang === "en"
									? "px-3 py-1 rounded-full bg-main text-base"
									: "px-3 py-1 rounded-full text-main/60 hover:text-main transition-colors"
							}
						>
							EN
						</button>
					</div>

					<div className="flex-grow flex flex-col justify-center max-w-7xl mx-auto w-full z-10 pt-20 md:pt-12 relative">
						<div className="grid grid-cols-1 md:grid-cols-6 gap-x-8 gap-y-10 md:gap-y-12 items-center h-full relative">
							<div className="col-span-1 md:col-span-2 flex flex-col justify-center space-y-6 order-2 md:order-1 text-center md:text-left relative z-10 md:pl-4">
								<div>
									<h1 className="text-2xl md:text-3xl font-display font-bold text-main mb-1 tracking-tight">
										{profile.name}
									</h1>
									<div className="flex items-center gap-2 mb-4">
										<span className="text-main/70 text-sm font-mono tracking-wider border-b border-[#2b57ff]/60">
											@361do_sleep
										</span>
									</div>
									<p className="text-main/60 text-sm font-light leading-relaxed max-w-xs">
										{profile.role[lang]}
										<br />
										{profile.bio[lang]}
									</p>
								</div>

								<div className="pt-2 text-[10px] font-mono tracking-widest text-main/40 uppercase">
									{lang === "ja" ? "creative coder" : "creative coder"}
								</div>
							</div>

							<div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center order-1 md:order-2 relative z-20">
								<div className="w-36 h-36 sm:w-44 sm:h-44 md:w-64 md:h-64 rounded-full overflow-hidden border border-white/10 relative group mb-6 md:mb-8 shadow-[0_0_40px_-10px_rgba(38,31,167,0.25)]">
									<div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
									<img
										alt={profile.name}
										className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
										src="https://pbs.twimg.com/profile_images/1977152336486449153/uWHA4dAC_400x400.jpg"
									/>
								</div>
								<div className="text-center w-full max-w-md">
									<p className="text-base md:text-lg font-display font-medium text-main/90">
										Lost in time. 🫠 Found it nowhere.
									</p>
								</div>
							</div>

							<div className="col-span-1 md:col-span-2 flex flex-col justify-center order-3 relative z-0 md:text-right">
								<div role="presentation" className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-display font-light leading-none tracking-tighter uppercase text-white/10 md:-ml-24 select-none pointer-events-none opacity-20 md:opacity-25">
									PROFILE
								</div>
								<div role="presentation" className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-display font-light leading-none tracking-tighter uppercase text-white/10 md:-ml-12 mt-[-0.5em] select-none pointer-events-none opacity-20 md:opacity-25">
									EXPLORE
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* SECTION 02: PROFILE DETAIL */}
				<section className="min-h-screen w-full flex flex-col justify-between px-4 py-10 md:p-12 relative overflow-hidden border-b border-white/10">
					<div className="flex-grow flex flex-col justify-center max-w-7xl mx-auto w-full z-10 pt-24 md:pt-12 relative">
						<div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
							<div className="md:col-span-4 space-y-6">
								<span className="inline-block px-3 py-1 border border-[#2b57ff] text-main/70 text-xs font-mono tracking-widest uppercase bg-black/40 backdrop-blur-sm">
									Profile Detail
								</span>
								<h2 className="text-3xl md:text-5xl font-display font-bold text-main leading-none">
									{profile.name}
								</h2>
								<p className="text-main/70 text-[11px] md:text-sm leading-relaxed">
									{profile.role[lang]}
								</p>
								<p className="text-main/55 text-[11px] leading-relaxed">
									{profile.bio[lang]}
								</p>
								<div className="pt-4 space-y-2">
									<span className="text-[10px] font-mono tracking-widest text-main/40 uppercase">
										Interests
									</span>
									<div className="flex flex-wrap gap-2">
										{profile.interests[lang].map((item) => (
											<span
												key={item}
												className="text-[9px] font-mono text-main/50 uppercase border border-white/10 px-2 py-1 rounded-sm"
											>
												{item}
											</span>
										))}
									</div>
								</div>
							</div>

							<div className="md:col-span-8 space-y-6">
								<div className="text-xs md:text-sm font-mono tracking-[0.35em] text-main/45 uppercase">
									Skill Set
								</div>
								<div className="space-y-4">
									{skills.map((category) => (
										<div
											key={category.title}
											className="grid grid-cols-1 md:grid-cols-[170px_1fr] gap-2 md:gap-6 items-start"
										>
											<div className="text-sm md:text-base font-display font-semibold text-main">
												{category.title}
											</div>
											<div className="flex flex-wrap gap-x-3 gap-y-1.5 leading-tight">
												{category.items.map((item) => (
													<span
														key={`${category.title}-${item}`}
														className="text-[10px] md:text-[11px] font-mono text-main/55"
													>
														<span className="text-main/30 mr-1">/</span>
														{item}
													</span>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* SECTION 03: TIMELINE */}
				<section className="min-h-screen w-full flex flex-col justify-between px-4 py-10 md:p-12 relative overflow-hidden border-b border-white/10">
					<div className="flex-grow flex flex-col justify-center max-w-7xl mx-auto w-full z-10 pt-20 md:pt-12 relative">
						<div className="space-y-8 md:space-y-10">
							<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
								<div>
									<span className="inline-block px-3 py-1 border border-[#2b57ff] text-main/70 text-xs font-mono tracking-widest uppercase mb-6 bg-black/40 backdrop-blur-sm">
										Timeline
									</span>
									<h2 className="text-5xl md:text-7xl font-display font-bold text-main mb-4 leading-none">
										TIMELINE
									</h2>
									<p className="text-main/60 text-xs md:text-sm font-light max-w-xs">
										{lang === "ja"
											? "学歴と受賞歴のタイムライン."
											: "Education and achievements timeline."}
									</p>
								</div>
								<div className="text-[10px] font-mono tracking-widest text-main/40 uppercase">
									{timelineItems.length.toString().padStart(2, "0")} entries
								</div>
							</div>

							<div className="relative">
								<div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
								<div className="space-y-6 md:space-y-10">
									{timelineItems.map((item, index) => {
										const isLeft = index % 2 === 0;
										return (
											<div
												key={`timeline-${item.group}-${item.date}-${item.title.en}`}
												className="grid grid-cols-1 md:grid-cols-12 relative group"
											>
												{isLeft ? (
													<>
														<div className="md:col-span-6 pr-0 md:pr-16 md:text-right">
															<div className="border-l border-white/10 md:border-none pl-6 md:pl-0">
																<div className="flex items-center gap-4 mb-4 md:justify-end">
																	<span className="text-[9px] font-mono text-main/45 uppercase border border-white/10 px-2 py-0.5 rounded-sm">
																		{item.group}
																	</span>
																	<div className="h-px w-8 bg-white/20 hidden md:block" />
																	<span className="font-mono text-main/70 text-xs font-bold tracking-wider">
																		{item.date}
																	</span>
																</div>
																<h3 className="text-lg md:text-xl font-display font-bold text-main mb-1">
																	{item.title[lang]}
																</h3>
																<p className="text-main/55 text-[11px] leading-relaxed max-w-sm md:ml-auto">
																	{summarizeTimeline(item)}
																</p>
																{item.tags && item.tags.length > 0 && (
																	<div className="flex flex-wrap gap-2 mt-3 md:justify-end">
																		{item.tags.map((tag) => (
																			<span
																				key={`education-${item.date}-${tag}`}
																				className="text-[9px] font-mono text-main/50 uppercase border border-white/10 px-2 py-1 rounded-sm"
																			>
																				{tag}
																			</span>
																		))}
																	</div>
																)}
															</div>
														</div>
														<div className="hidden md:block md:col-span-6" />
													</>
												) : (
													<>
														<div className="hidden md:block md:col-span-6" />
														<div className="md:col-span-6 pl-0 md:pl-16 relative">
															<div className="border-l border-white/10 md:border-none pl-6 md:pl-0">
																<div className="flex items-center gap-4 mb-4">
																	<span className="font-mono text-main/70 text-xs font-bold tracking-wider">
																		{item.date}
																	</span>
																	<div className="h-px w-8 bg-white/20 hidden md:block" />
																	<span className="text-[9px] font-mono text-main/45 uppercase border border-white/10 px-2 py-0.5 rounded-sm">
																		{item.group}
																	</span>
																</div>
																<h3 className="text-lg md:text-xl font-display font-bold text-main mb-1">
																	{item.title[lang]}
																</h3>
																<p className="text-main/55 text-[11px] leading-relaxed max-w-sm">
																	{summarizeTimeline(item)}
																</p>
																{item.tags && item.tags.length > 0 && (
																	<div className="flex flex-wrap gap-2 mt-3">
																		{item.tags.map((tag) => (
																			<span
																				key={`education-${item.date}-${tag}`}
																				className="text-[9px] font-mono text-main/50 uppercase border border-white/10 px-2 py-1 rounded-sm"
																			>
																				{tag}
																			</span>
																		))}
																	</div>
																)}
															</div>
														</div>
													</>
												)}

												<div className="hidden md:flex absolute left-1/2 top-8 -translate-x-1/2 w-3 h-3 bg-base border border-white/30 rounded-full z-20 group-hover:scale-150 group-hover:border-[#2b57ff] transition-all duration-300 items-center justify-center">
													<div className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</section>

				{(() => {
					const getTaggedItems = (tag: string) =>
						portfolioItems.filter(
							(item) =>
								Array.isArray(item.tags) &&
								item.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
						);
					const featuredByTag = {
						develop: getTaggedItems("develop")[0],
						design: getTaggedItems("design")[0],
						video: getTaggedItems("video")[0],
					};

					const TagFeature = ({
						label,
						item,
					}: {
						label: string;
						item?: PortfolioContentItem;
					}) => {
						const title = item?.title || label.toUpperCase();
						const description =
							item?.description || "Selected work from the archive.";
						const href = item ? `/portfolio/${item.id}` : "/portfolio";
						const thumbnail = item?.thumbnail;

						return (
							<section className="min-h-[70vh] md:min-h-screen w-full relative border-b border-white/10 overflow-hidden group">
								<div className="absolute inset-0 z-0 bg-neutral-950">
									<div className="absolute inset-0 bg-gradient-to-tr from-black via-[#09090b] to-black" />
									{thumbnail && (
										<div className="absolute inset-0 opacity-30">
											<SafeImage
												src={thumbnail}
												alt={title}
												fill
												sizes="100vw"
												className="object-cover object-center"
											/>
										</div>
									)}
									<div className="absolute inset-0 bg-black/45" />
								</div>

								<div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent z-10" />

								<div className="relative z-20 w-full max-w-7xl mx-auto min-h-[70vh] md:min-h-screen flex flex-col justify-end px-4 pb-16 md:p-12 md:pb-24">
									<div className="grid grid-cols-1 md:grid-cols-6 gap-8 items-end">
										<div className="col-span-1 md:col-span-4">
											<span className="inline-block px-3 py-1 border border-[#2b57ff] text-main/70 text-xs font-mono tracking-widest uppercase mb-6 bg-black/40 backdrop-blur-sm">
												{label}
											</span>
											<h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-main mb-4 leading-none">
												{title}
											</h2>
											<p className="text-main/60 text-xs md:text-sm font-light max-w-xl">
												{description}
											</p>
										</div>

										<div className="col-span-1 md:col-span-2 md:text-right">
											<Link
												className="inline-flex items-center justify-center md:justify-end gap-3 group/btn px-8 py-4 bg-main text-base font-bold uppercase tracking-wider hover:bg-[#2b57ff] hover:text-white transition-all duration-300"
												href={href}
											>
												<span>View</span>
												<span className="group-hover/btn:translate-x-1 transition-transform">
													→
												</span>
											</Link>
										</div>
									</div>
								</div>
							</section>
						);
					};

					return (
						<>
							<TagFeature label="Develop" item={featuredByTag.develop} />
							<TagFeature label="Design" item={featuredByTag.design} />
							<TagFeature label="Video" item={featuredByTag.video} />
						</>
					);
				})()}

				{/* SECTION 07: LINKS */}
				<section className="min-h-[50vh] w-full flex flex-col justify-between px-4 py-10 md:p-12 relative overflow-hidden bg-transparent border-t border-white/10">
					<div className="flex-grow flex flex-col items-center justify-center z-10">
						<div className="text-center">
							<p className="text-main/40 font-mono uppercase tracking-[0.2em] mb-8">
								Links
							</p>
							<h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-main mb-10 tracking-tighter">
								GITHUB / X
							</h2>
							<div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center justify-center">
								{["github", "twitter-tech", "twitter-design"].map((id) => {
									const link = links.find((item) => item.id === id);
									if (!link) return null;
									return (
										<a
											key={link.id}
											className="text-lg md:text-xl text-main/60 hover:text-main transition-all duration-300 border-b border-transparent hover:border-white/30 pb-1"
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
										>
											{link.title}
										</a>
									);
								})}
								<Link
									className="text-lg md:text-xl text-main/60 hover:text-main transition-all duration-300 border-b border-transparent hover:border-white/30 pb-1"
									href="/about/links"
								>
									More Links
								</Link>
							</div>
						</div>
					</div>

					<div className="w-full border-t border-white/10 pt-6 text-center text-[10px] md:text-xs font-mono text-main/60 uppercase tracking-wider">
						©2025 361do_sleep
					</div>
				</section>
			</main>
		</div>
	);
}
