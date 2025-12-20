"use client";

import {
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

export type LinkItem = {
	id: string;
	title: string;
	url: string;
	icon: React.ComponentType<{
		className?: string;
		style?: React.CSSProperties;
	}>;
	description?: string;
	color?: string;
};

export const links: LinkItem[] = [
	{
		id: "profile",
		title: "Profile",
		url: "https://yusuke-kim.com/about",
		icon: User,
		description: "About Me",
		color: "#ffffff",
	},
	{
		id: "portfolio",
		title: "Portfolio",
		url: "https://yusuke-kim.com/portfolio",
		icon: LayoutGrid,
		description: "All Works",
		color: "#ffffff",
	},
	{
		id: "develop",
		title: "Development",
		url: "https://yusuke-kim.com/portfolio/gallery/develop",
		icon: Code,
		description: "develop pj",
		color: "#00ff9d",
	},
	{
		id: "video",
		title: "Video",
		url: "https://yusuke-kim.com/portfolio/gallery/video",
		icon: Video,
		description: "video pj",
		color: "#00ccff",
	},
	{
		id: "design",
		title: "Design",
		url: "https://yusuke-kim.com/portfolio/gallery/video&design",
		icon: Palette,
		description: "design pj",
		color: "#ff00d4",
	},
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

export const contactLinks: LinkItem[] = [
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
