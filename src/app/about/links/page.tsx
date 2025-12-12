"use client";

import { motion } from "framer-motion";
import {
	ArrowLeft,
	Code,
	Gamepad2,
	Github,
	Languages,
	LayoutGrid,
	Linkedin,
	Mail,
	MessageCircle,
	MousePointer2,
	Palette,
	ShoppingBag,
	Twitter,
	User,
	Video,
	Youtube,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type LinkItem = {
	id: string;
	title: string;
	url: string;
	icon: React.ComponentType<{
		className?: string;
		style?: React.CSSProperties;
	}>;
	description?: string;
	color?: string; // Optional custom color for the icon/glow
};

const links: LinkItem[] = [
	// --- Internal / Works ---
	{
		id: "profile",
		title: "Profile",
		url: "yusuke-kim.com/about",
		icon: User,
		description: "About Me",
		color: "#ffffff",
	},
	{
		id: "portfolio",
		title: "Portfolio",
		url: "yusuke-kim.com/portfolio",
		icon: LayoutGrid,
		description: "All Works",
		color: "#ffffff",
	},
	{
		id: "develop",
		title: "Development",
		url: "yusuke-kim.com/portfolio/gallery/develop",
		icon: Code,
		description: "develop pj",
		color: "#00ff9d",
	},
	{
		id: "video",
		title: "Video",
		url: "yusuke-kim.com/portfolio/gallery/video",
		icon: Video,
		description: "video pj",
		color: "#00ccff",
	},
	{
		id: "design",
		title: "Design",
		url: "yusuke-kim.com/portfolio/gallery/video&design",
		icon: Palette,
		description: "design pj",
		color: "#ff00d4",
	},

	// --- Socials / Professional ---
	{
		id: "twitter-tech",
		title: "X (Tech)",
		url: "https://x.com/361do_sleep",
		icon: Twitter,
		description: "@361do_sleep",
		color: "#1da1f2",
	},
	{
		id: "twitter-design",
		title: "X (Design)",
		url: "https://x.com/361do_design",
		icon: Twitter,
		description: "@361do_design",
		color: "#1da1f2",
	},
	{
		id: "github",
		title: "GitHub",
		url: "https://github.com/rebuildup",
		icon: Github,
		description: "rebuildup",
		color: "#ffffff",
	},
	{
		id: "linkedin",
		title: "LinkedIn",
		url: "https://www.linkedin.com/in/yusuke-kimura-835055398/",
		icon: Linkedin,
		description: "Yusuke Kimura",
		color: "#0a66c2",
	},
	{
		id: "youtube",
		title: "YouTube",
		url: "https://www.youtube.com/@361do_sleep",
		icon: Youtube,
		description: "@361do_sleep",
		color: "#ff0000",
	},
	{
		id: "discord",
		title: "Discord Server",
		url: "https://discord.gg/qmCGSBmc28",
		icon: MessageCircle,
		description: "いど端",
		color: "#5865F2",
	},

	// --- Store / Hobbies ---
	{
		id: "booth",
		title: "Booth",
		url: "https://361do.booth.pm",
		icon: ShoppingBag,
		description: "361doのbooth",
		color: "#FC4D50",
	},
	{
		id: "tetrio",
		title: "Tetrio",
		url: "https://ch.tetr.io/u/samuido",
		icon: Gamepad2,
		description: "samuido",
		color: "#BC40E4",
	},
	{
		id: "osu",
		title: "osu!",
		url: "https://osu.ppy.sh/users/36986836",
		icon: MousePointer2,
		description: "samuido",
		color: "#ff66aa",
	},
	{
		id: "duolingo",
		title: "Duolingo",
		url: "https://www.duolingo.com/profile/samuido",
		icon: Languages,
		description: "samuido",
		color: "#58cc02",
	},
];

const contactLinks: LinkItem[] = [
	{
		id: "mail-tech",
		title: "Email (Dev)",
		url: "mailto:rebuild.up.up@gmail.com",
		icon: Mail,
		description: "rebuild.up.up(at)gmail.com",
	},
	{
		id: "mail-design",
		title: "Email (Design)",
		url: "mailto:361do.sleep@gmail.com",
		icon: Mail,
		description: "361do.sleep(at)gmail.com",
	},
];

// --- Components ---

const AboutBackground = dynamic(() => import("@/components/AboutBackground"), {
	ssr: false,
});

const getFaviconUrl = (url: string) => {
	try {
		const domain = new URL(url).hostname;
		return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
	} catch {
		return "";
	}
};

function LinkIcon({ item, className }: { item: LinkItem; className?: string }) {
	const isExternal = item.url.startsWith("http");
	const favicon = isExternal ? getFaviconUrl(item.url) : null;

	if (isExternal && favicon) {
		return (
			<img
				src={favicon}
				alt={item.title}
				className={cn(
					"object-contain opacity-90 hover:opacity-100 transition-opacity rounded-sm",
					className,
				)}
			/>
		);
	}

	return (
		<item.icon
			className={className}
			style={{ color: item.color || "currentColor" }}
		/>
	);
}

function ProfileHeader() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="flex flex-col items-center text-center mb-10"
		>
			<div className="relative mb-6 flex justify-center items-center gap-6">
				{/* Tech Avatar */}
				<a
					href="https://x.com/361do_sleep"
					target="_blank"
					rel="noopener noreferrer"
					className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent p-[2px] shadow-2xl z-10 cursor-pointer group"
					title="Tech Account (@361do_sleep)"
				>
					<div className="w-full h-full rounded-full overflow-hidden bg-base relative">
						<motion.img
							whileHover={{ rotate: 360 }}
							transition={{ duration: 2, ease: [0.9, 0, 0.1, 1] }}
							src="https://pbs.twimg.com/profile_images/1977152336486449153/uWHA4dAC_400x400.jpg"
							alt="samuido (Tech)"
							className="w-full h-full object-cover"
						/>
					</div>
				</a>

				{/* Design Avatar */}
				<a
					href="https://x.com/361do_design"
					target="_blank"
					rel="noopener noreferrer"
					className="w-20 h-20 rounded-full bg-gradient-to-tr p-[2px] shadow-xl z-10 cursor-pointer group"
					title="Design Account (@361do_design)"
				>
					<div className="w-full h-full rounded-full overflow-hidden bg-base relative">
						<motion.img
							whileHover={{ rotate: 360 }}
							transition={{ duration: 2, ease: [0.9, 0, 0.1, 1] }}
							src="https://pbs.twimg.com/profile_images/1932016030551048192/xWwBlKiB_400x400.jpg"
							alt="samuido (Design)"
							className="w-full h-full object-cover"
						/>
					</div>
				</a>
			</div>

			<h1 className="text-3xl font-display font-black text-main tracking-tight mb-2">
				samuido
			</h1>
			<p className="text-main/60 font-mono text-xs tracking-widest uppercase">
				Developer / Creator
			</p>

			<div className="flex justify-center gap-4 mt-4 mb-6">
				{links
					.filter((l) =>
						["twitter-tech", "github", "linkedin", "discord", "booth"].includes(
							l.id,
						),
					)
					.map((link) => (
						<a
							key={link.id}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-main/60 hover:text-accent transition-colors overflow-hidden p-1.5"
						>
							<LinkIcon item={link} className="w-full h-full" />
						</a>
					))}
			</div>

			<p className="text-sm text-main/80 max-w-sm leading-relaxed font-light">
				Web制作・映像制作・ツール開発。
				<span className="text-xs text-main/50 mt-1 block">
					Yamaguchi, Japan
				</span>
			</p>
		</motion.div>
	);
}

function LinkButton({ item, index }: { item: LinkItem; index: number }) {
	return (
		<motion.a
			href={item.url}
			target={
				item.url.startsWith("mailto") || item.url.startsWith("/")
					? undefined
					: "_blank"
			}
			rel={
				item.url.startsWith("mailto") || item.url.startsWith("/")
					? undefined
					: "noopener noreferrer"
			}
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				delay: index * 0.03 + 0.1,
				duration: 0.3,
				ease: [0.4, 0, 1, 1], // 加速するイージング（easeOutCubic）
			}}
			className="relative group block w-full"
		>
			<div className="relative z-10 flex items-center px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors duration-200 overflow-hidden">
				{/* Icon container */}
				<div className="flex-shrink-0 w-8 h-8 rounded-md bg-base/50 flex items-center justify-center border border-white/5 overflow-hidden p-[5px]">
					<LinkIcon item={item} className="w-full h-full" />
				</div>

				{/* Text content */}
				<div className="flex-grow px-4 text-left min-w-0 flex items-baseline justify-between">
					<span className="text-main font-bold text-sm tracking-tight truncate">
						{item.title}
					</span>
					<span className="text-main/40 text-xs font-mono ml-2 flex-shrink-0 truncate max-w-[120px]">
						{item.description}
					</span>
				</div>
			</div>
		</motion.a>
	);
}

export default function LinksPage() {
	return (
		<div className="min-h-screen relative bg-transparent overflow-x-hidden selection:bg-accent/30 text-main">
			{/* Shared Background */}
			<AboutBackground />

			<main className="relative z-10 w-full max-w-lg mx-auto px-6 py-12 min-h-screen flex flex-col items-center">
				{/* Top Nav */}
				<div className="absolute top-6 left-6 z-50">
					<Link
						href="/about"
						className="group flex items-center gap-2 text-main/50 hover:text-main transition-colors text-[10px] font-mono uppercase tracking-widest backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5 bg-black/20 hover:bg-black/40"
					>
						<ArrowLeft className="w-3 h-3" />
						Back
					</Link>
				</div>

				{/* Content */}
				<div className="w-full flex-grow flex flex-col items-center pt-6">
					<ProfileHeader />

					<div className="w-full flex flex-col gap-3">
						{links.map((link, idx) => (
							<LinkButton key={link.id} item={link} index={idx} />
						))}
					</div>

					<div className="w-full mt-8 pt-6 border-t border-white/5">
						<motion.h3
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							className="text-center text-[10px] font-mono text-main/30 uppercase tracking-widest mb-4"
						>
							Contact
						</motion.h3>
						<div className="flex flex-col gap-3 w-full">
							{contactLinks.map((link, idx) => (
								<LinkButton
									key={link.id}
									item={link}
									index={links.length + idx}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Footer */}
				<motion.footer
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
					className="text-center mt-12 text-main/20 text-[10px] font-mono"
				>
					© 2025 361do_sleep
				</motion.footer>
			</main>
		</div>
	);
}
