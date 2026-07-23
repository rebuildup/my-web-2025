"use client";

import { animate, stagger } from "animejs";
import Link from "next/link";
import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";
import SamuidoIcon from "@/components/icons/SamuidoIcon";
import { type PortfolioContentItem } from "@/types/portfolio";
import { historyData, skillIconIds } from "./data";

// Minimal CSS to ensure icon starts hidden before JS kicks in
const INITIAL_CSS = `
.about-icon-wrapper {
 transform: scale(0);
 display: inline-flex;
 transform-origin: center center;
}
.about-hidden {
 opacity: 0 !important;
}
`;

function SectionHeader({
	title,
	subtitle,
	comment,
}: {
	title: string;
	subtitle: string;
	comment: string;
}) {
	return (
		<div
			className="section-header w-full flex items-center"
			style={{ opacity: 0, transform: "translateY(24px)" }}
		>
			<div className="flex flex-col shrink-0 pr-3">
				<span
					className="text-[16px] leading-tight"
					style={{
						fontFamily: "var(--font-inter), Inter, sans-serif",
					}}
				>
					{title}
				</span>
				<span
					className="text-[12px] leading-tight"
					style={{
						fontFamily: "var(--font-inter), Inter, sans-serif",
					}}
				>
					{subtitle}
				</span>
			</div>
			<div className="flex-1  " />
			<span
				className="text-[12px] leading-tight shrink-0 pl-3"
				style={{ fontFamily: "var(--font-noto-sans-jp)" }}
			>
				{comment}
			</span>
		</div>
	);
}

function SectionFooter({
	iconColor,
	text,
}: {
	iconColor: "yellow" | "lime" | "blue" | "red";
	text: string;
}) {
	return (
		<div
			className="section-footer grid grid-cols-6 gap-3 w-full mt-2 items-center"
			style={{ opacity: 0, transform: "translateY(24px)" }}
		>
			<div />
			<div className="flex justify-center">
				<SamuidoIcon size={71} color={iconColor} />
			</div>
			<p
				className="col-span-3 text-[12px] whitespace-pre-line"
				style={{ fontFamily: "var(--font-noto-sans-jp)" }}
			>
				{text}
			</p>
			<div />
		</div>
	);
}

function Section({
	title,
	subtitle,
	comment,
	footerIcon,
	footerText,
	children,
}: {
	title: string;
	subtitle: string;
	comment: string;
	footerIcon: "yellow" | "lime" | "blue" | "red";
	footerText: string;
	children: ReactNode;
}) {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const header = el.querySelector<HTMLElement>(":scope > .section-header");
		const content = el.querySelector<HTMLElement>(":scope > .section-content");
		const footer = el.querySelector<HTMLElement>(":scope > .section-footer");
		const targets = [header, content, footer].filter(Boolean) as HTMLElement[];

		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				io.disconnect();
				animate(targets, {
					opacity: [0, 1],
					translateY: [24, 0],
					duration: 700,
					delay: stagger(150),
					ease: "out(3)",
				});
			},
			{ rootMargin: "-5% 0px" },
		);
		io.observe(el);

		return () => {
			io.disconnect();
		};
	}, []);

	return (
		<section
			ref={ref}
			className="w-full flex flex-col items-center py-8 gap-4 overflow-hidden"
		>
			<SectionHeader title={title} subtitle={subtitle} comment={comment} />
			<div
				className="section-content w-full flex flex-col items-center gap-4"
				style={{ opacity: 0, transform: "translateY(24px)" }}
			>
				{children}
			</div>
			<SectionFooter iconColor={footerIcon} text={footerText} />
		</section>
	);
}

function Breadcrumb() {
	return (
		<span
			className="text-[12px]"
			style={{ fontFamily: "var(--font-noto-sans-jp)" }}
		>
			<Link href="/" className="hover:underline">
				Home
			</Link>
			<span> / </span>
			<span>About</span>
		</span>
	);
}

const quickLinks = [
	{ id: "twitter-tech", label: "X (Tech)", href: "https://x.com/361do_sleep" },
	{
		id: "twitter-design",
		label: "X (Design)",
		href: "https://x.com/361do_design",
	},
	{ id: "github", label: "GitHub", href: "https://github.com/rebuildup" },
	{
		id: "youtube",
		label: "YouTube",
		href: "https://www.youtube.com/@361do_sleep",
	},
	{ id: "discord", label: "Discord", href: "https://discord.gg/qmCGSBmc28" },
];

// Inline SVG icons for each social link (no external API needed)
function ServiceIcon({ id }: { id: string }) {
	const cls = "w-full h-full";
	switch (id) {
		case "twitter-tech":
		case "twitter-design":
			return (
				<svg className={cls} viewBox="0 0 24 24" fill="currentColor">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
			);
		case "github":
			return (
				<svg className={cls} viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
				</svg>
			);
		case "youtube":
			return (
				<svg className={cls} viewBox="0 0 24 24" fill="currentColor">
					<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
				</svg>
			);
		case "discord":
			return (
				<svg className={cls} viewBox="0 0 24 24" fill="currentColor">
					<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.08.114 18.1.128 18.113a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
				</svg>
			);
		default:
			return null;
	}
}

function QuickLinks() {
	return (
		<div className="flex justify-center gap-4 mt-2" style={{ opacity: 0 }}>
			{quickLinks.map((link) => (
				<button
					key={link.id}
					type="button"
					onClick={() =>
						window.open(link.href, "_blank", "noopener,noreferrer")
					}
					title={link.label}
					aria-label={link.label}
					className="w-8 h-8 flex items-center justify-center rounded-full border-0 bg-transparent p-1.5 transition-colors cursor-pointer"
				>
					<ServiceIcon id={link.id} />
				</button>
			))}
		</div>
	);
}

function TimelineRow({ entry }: { entry: (typeof historyData)[number] }) {
	if (entry.separator) {
		return <div className="w-full   my-1" />;
	}

	return (
		<div className="flex gap-2 w-full" style={{ minHeight: 19 }}>
			<span
				className="text-[12px] shrink-0 text-right"
				style={{
					fontFamily: "var(--font-noto-sans-jp)",
					width: "7ch",
				}}
			>
				{entry.date}
			</span>
			<span
				className="text-[12px] shrink-0"
				style={{
					fontFamily: "var(--font-noto-sans-jp)",
					width: 200,
				}}
			>
				{entry.title}
			</span>
			<span
				className="text-[12px] flex-1"
				style={{
					fontFamily: "var(--font-noto-sans-jp)",
				}}
			>
				{entry.description}
			</span>
		</div>
	);
}

type HistorySegment =
	| { type: "highlighted"; entry: (typeof historyData)[number] }
	| { type: "muted-group"; entries: (typeof historyData)[number][] };

function buildHistorySegments(
	data: (typeof historyData)[number][],
): HistorySegment[] {
	const segments: HistorySegment[] = [];
	for (const entry of data) {
		if (entry.separator) {
			segments.push({ type: "highlighted", entry });
			continue;
		}
		if (entry.muted) {
			const last = segments[segments.length - 1];
			if (last && last.type === "muted-group") {
				last.entries.push(entry);
			} else {
				segments.push({ type: "muted-group", entries: [entry] });
			}
		} else {
			segments.push({ type: "highlighted", entry });
		}
	}
	return segments;
}

const historySegments = buildHistorySegments(historyData);

function ExpandToggle({
	expanded,
	onToggle,
}: {
	expanded: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-label={expanded ? "Collapse details" : "Expand details"}
			className="flex items-center gap-2 w-full py-1 group border-0 bg-transparent cursor-pointer"
		>
			<div className="flex-1 h-px" />
			<span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-transform">
				<svg
					width="10"
					height="10"
					viewBox="0 0 10 10"
					fill="none"
					style={{
						transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
						transition: "transform 0.15s ease",
					}}
				>
					<path
						d="M3 1L7 5L3 9"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
			<div className="flex-1 h-px" />
		</button>
	);
}

function HistorySection({
	expandedGroups,
	onToggle,
}: {
	expandedGroups: Set<number>;
	onToggle: (index: number) => void;
}) {
	return (
		<div className="flex flex-col gap-0.5 w-full overflow-x-auto px-6">
			{historySegments.map((seg, idx) => {
				if (seg.type === "highlighted") {
					return (
						<TimelineRow
							key={`h-${seg.entry.date}-${seg.entry.title}`}
							entry={seg.entry}
						/>
					);
				}
				const isExpanded = expandedGroups.has(idx);
				return (
					<div
						key={`mg-${seg.entries[0]?.date}-${seg.entries[0]?.title}`}
						className="flex flex-col gap-0.5"
					>
						<ExpandToggle
							expanded={isExpanded}
							onToggle={() => onToggle(idx)}
						/>
						{isExpanded &&
							seg.entries.map((entry) => (
								<TimelineRow
									key={`m-${entry.date}-${entry.title}`}
									entry={entry}
								/>
							))}
					</div>
				);
			})}
		</div>
	);
}

const siteLinks = [
	{ href: "/", label: "Home", desc: "トップページ" },
	{ href: "/portfolio", label: "Portfolio", desc: "制作したもの" },
	{ href: "/workshop", label: "Workshop", desc: "ワークショップ" },
	{ href: "/tools", label: "Tools", desc: "ツール集" },
	{ href: "/about/links", label: "Links", desc: "リンク集" },
	{ href: "/search", label: "Search", desc: "検索" },
];

function SiteLinksSection() {
	return (
		<div className="grid grid-cols-2 gap-2 w-full px-8">
			{siteLinks.map((link) => (
				<div
					key={link.href}
					className="relative flex items-center justify-between px-3 py-2.5 rounded border border-current transition-colors group"
				>
					<div className="flex flex-col">
						<Link
							href={link.href}
							className="text-[12px] font-medium before:absolute before:inset-0 before:z-10"
							style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
						>
							{link.label}
						</Link>
						<span
							className="text-[10px]"
							style={{ fontFamily: "var(--font-noto-sans-jp)" }}
						>
							{link.desc}
						</span>
					</div>
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						className="shrink-0 ml-2 transition-transform group-hover:translate-x-0.5"
					>
						<path
							d="M4.5 2L8.5 6L4.5 10"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			))}
		</div>
	);
}

function WorksSection({ items }: { items: PortfolioContentItem[] }) {
	if (items.length === 0) {
		return (
			<p
				className="text-[12px] w-full"
				style={{ fontFamily: "var(--font-noto-sans-jp)" }}
			>
				まだ制作物がありません
			</p>
		);
	}
	return (
		<div className="grid grid-cols-3 gap-3 w-full px-6">
			{items.map((item) => (
				<Link key={item.id} href={`/portfolio/${item.id}`} className="group">
					<div className="aspect-video rounded overflow-hidden">
						{item.thumbnail && (
							// eslint-disable-next-line @next/next/no-img-element
							<Image
								src={item.thumbnail}
								width={320}
								height={320}
								alt={item.title}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							/>
						)}
					</div>
					<span
						className="text-[12px] leading-tight truncate block mt-1.5"
						style={{ fontFamily: "var(--font-noto-sans-jp)" }}
					>
						{item.title}
					</span>
				</Link>
			))}
		</div>
	);
}

function HeroOverlay({
	overlayRef,
	iconWrapperRef,
}: {
	overlayRef: React.RefObject<HTMLDivElement | null>;
	iconWrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 w-screen h-dvh z-50 pointer-events-none flex items-center justify-center"
		>
			{/* Icon wrapper: starts at scale(0) via CSS class */}
			<div ref={iconWrapperRef} className="about-icon-wrapper">
				<SamuidoIcon size={239} color="yellow" />
			</div>
		</div>
	);
}

// Lazy-loads portfolio items for the "works" section.
function usePortfolioItems(): PortfolioContentItem[] {
	const [portfolioItems, setPortfolioItems] = useState<PortfolioContentItem[]>(
		[],
	);
	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				const res = await fetch("/api/content/portfolio", {
					signal: controller.signal,
				});
				if (!res.ok) return;
				const json = (await res.json()) as {
					success: boolean;
					data: Array<{
						id: string;
						title: string;
						description?: string;
						thumbnail?: string;
						tags?: string[];
						category?: string;
						createdAt?: string;
						updatedAt?: string;
						publishedAt?: string;
					}>;
				};
				if (controller.signal.aborted) return;
				if (!json.success || !Array.isArray(json.data)) return;
				const items: PortfolioContentItem[] = json.data
					.filter((item) => item.thumbnail)
					.slice(0, 6)
					.map((item) => ({
						id: item.id,
						type: "portfolio" as const,
						title: item.title,
						description: item.description || "",
						category: item.category || "all",
						tags: Array.isArray(item.tags) ? item.tags : [],
						status: "published" as const,
						priority: 0,
						createdAt: item.createdAt || new Date().toISOString(),
						updatedAt: item.updatedAt || new Date().toISOString(),
						publishedAt: item.publishedAt || new Date().toISOString(),
						thumbnail: item.thumbnail || "",
						images: [],
						technologies: [],
						seo: {
							title: item.title,
							description: item.description || "",
							keywords: Array.isArray(item.tags) ? item.tags : [],
							ogImage: item.thumbnail || "",
							twitterImage: item.thumbnail || "",
							canonical: `https://yusuke-kim.com/portfolio/${item.id}`,
							structuredData: {},
						},
					}));
				setPortfolioItems(items);
			} catch (err) {
				if ((err as Error).name === "AbortError") return;
				// ignore
			}
		})();
		return () => controller.abort();
	}, []);
	return portfolioItems;
}

// Drives the hero animation: scale-in the icon, move it to the home placeholder,
// then fade in breadcrumb + hero text. Returns the refs the overlay/hero JSX needs.
function useHeroAnimation() {
	const overlayRef = useRef<HTMLDivElement>(null);
	const iconWrapperRef = useRef<HTMLDivElement>(null);
	const homePlaceholderRef = useRef<HTMLDivElement>(null);
	const breadcrumbRef = useRef<HTMLDivElement>(null);
	const [heroReady, setHeroReady] = useState(false);

	// Phase 1+2: scale icon in, then move it to the home placeholder.
	useEffect(() => {
		const overlay = overlayRef.current;
		const iconWrapper = iconWrapperRef.current;
		const placeholder = homePlaceholderRef.current;
		if (!overlay || !iconWrapper || !placeholder) return;

		const START_SCALE = 1.5;

		// Use rAF to start as early as possible after hydration
		const raf = requestAnimationFrame(() => {
			// Phase 1: scale 0 → 1.5 at viewport center
			animate(iconWrapper, {
				scale: [0, START_SCALE],
				duration: 550,
				ease: "out(3)",
				onComplete: () => {
					// Phase 2: measure home and move icon there
					const ph = homePlaceholderRef.current;
					if (!ph) return;
					const rect = ph.getBoundingClientRect();
					const homeCX = rect.left + rect.width / 2;
					const homeCY = rect.top + rect.height / 2;
					const vw = window.innerWidth;
					const vh = window.innerHeight;
					const moveX = homeCX - vw / 2;
					const moveY = homeCY - vh / 2;

					animate(iconWrapper, {
						translateX: [0, moveX],
						translateY: [0, moveY],
						scale: [START_SCALE, 1],
						duration: 750,
						ease: "inOut(3)",
						onComplete: () => {
							const p = homePlaceholderRef.current;
							if (p) p.style.opacity = "1";
							const ov = overlayRef.current;
							if (ov) ov.style.display = "none";
							setHeroReady(true);
						},
					});
				},
			});
		});

		return () => cancelAnimationFrame(raf);
	}, []);

	// After hero animation: fade in breadcrumb + hero text
	useEffect(() => {
		if (!heroReady) return;

		const bc = breadcrumbRef.current;
		if (bc) {
			bc.classList.remove("about-hidden");
			bc.style.opacity = "0";
			animate(bc, { opacity: [0, 1], duration: 400, ease: "out(2)" });
		}

		const section = document.querySelector<HTMLElement>(".hero-text-elements");
		if (!section) return;
		const children = Array.from(section.children) as HTMLElement[];
		children.forEach((c) => {
			c.style.opacity = "0";
			c.style.transform = "translateY(20px)";
		});
		animate(children, {
			opacity: [0, 1],
			translateY: [20, 0],
			duration: 600,
			delay: stagger(80),
			ease: "out(3)",
		});
	}, [heroReady]);

	return {
		overlayRef,
		iconWrapperRef,
		homePlaceholderRef,
		breadcrumbRef,
	};
}

export default function AboutStitchClient() {
	const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
	const portfolioItems = usePortfolioItems();
	const { overlayRef, iconWrapperRef, homePlaceholderRef, breadcrumbRef } =
		useHeroAnimation();

	const toggleGroup = (index: number) => {
		setExpandedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(index)) next.delete(index);
			else next.add(index);
			return next;
		});
	};

	return (
		<main className="w-full px-4 mx-auto" style={{ maxWidth: 680 }}>
			{/* Minimal CSS: ensure icon starts hidden, breadcrumb starts invisible */}
			{/* eslint-disable-next-line react/no-danger */}
			<style dangerouslySetInnerHTML={{ __html: INITIAL_CSS }} />

			{/* Breadcrumb — hidden until hero animation done */}
			<div ref={breadcrumbRef} className="w-full pt-16 about-hidden">
				<Breadcrumb />
			</div>

			{/* Fixed overlay: covers screen during animation, hides page behind icon */}
			<HeroOverlay overlayRef={overlayRef} iconWrapperRef={iconWrapperRef} />

			{/* Hero */}
			<section className="w-full flex flex-col items-center py-16 gap-4">
				{/* Placeholder: opacity:0 reserves space, becomes opacity:1 after animation */}
				<div
					ref={homePlaceholderRef}
					style={{ opacity: 0, width: 239, height: 239, flexShrink: 0 }}
				>
					<SamuidoIcon size={239} color="yellow" />
				</div>
				<div className="hero-text-elements flex flex-col items-center gap-4 w-full">
					<p
						className="text-[16px] text-center"
						style={{
							fontFamily: "var(--font-noto-sans-jp)",
							opacity: 0,
						}}
					>
						時間を溶かしています🫠
					</p>
					<p
						className="text-[12px] text-center"
						style={{
							fontFamily: "var(--font-noto-sans-jp)",
							opacity: 0,
						}}
					>
						Lost in time. 🫠 Found it nowhere.
					</p>
					<QuickLinks />
				</div>
			</section>

			<Section
				title="自己紹介"
				subtitle="profile"
				comment="人です"
				footerIcon="yellow"
				footerText={
					"こんにちは！木村友亮と申します。\n普段はsamuidoという名前で活動しています！\nWeb制作/映像制作/ツール制作などをしています。\nHello World ! It's me, Yusuke Kimura."
				}
			>
				<p
					className="text-[16px] text-center"
					style={{ fontFamily: "var(--font-noto-sans-jp)" }}
				>
					Web制作/映像制作/ツール制作などをしている高専生です
				</p>
			</Section>

			<Section
				title="スキルツリー"
				subtitle="my skills list"
				comment="いいね ワクワクします"
				footerIcon="lime"
				footerText={
					"こう見ると色々と使ってるんですね。まだ他にあります。\n順番に意味はありません。まぁ1回ちゃんと使ったというくらいを最低ラインで並べています。"
				}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<Image
					src={`https://skillicons.dev/icons?i=${skillIconIds}&perline=12`}
					width={520}
					height={80}
					unoptimized
					alt="skills"
					className="w-full max-w-[520px]"
					loading="lazy"
				/>
			</Section>

			<Section
				title="経歴"
				subtitle="history"
				comment="ワクワク枠です"
				footerIcon="blue"
				footerText={
					"華々しい経歴はありませんが、一応年表にまとめました。\n深いことは書いてないです。気になったらトグルを開いてみてください。"
				}
			>
				<HistorySection
					expandedGroups={expandedGroups}
					onToggle={toggleGroup}
				/>
			</Section>

			<Section
				title="制作物"
				subtitle="works"
				comment="作ったもの"
				footerIcon="red"
				footerText={
					"これまでに作ったものたちです。\nWebサイト、映像、ツールなど様々です。他にも色々あるので、ぜひ見ていってください。"
				}
			>
				<WorksSection items={portfolioItems} />
				<div className="grid grid-cols-3 gap-3 w-full px-6 mt-2">
					<Link
						href="/portfolio"
						className="col-start-2 flex items-center justify-center px-3 py-2.5 rounded     transition-colors"
						style={{ fontFamily: "var(--font-noto-sans-jp)" }}
					>
						<span className="text-[12px] leading-tight">もっと見る</span>
					</Link>
				</div>
			</Section>

			<Section
				title="リンク"
				subtitle="links"
				comment="他のページへ"
				footerIcon="blue"
				footerText={
					"私のポートフォリオサイトの各ページへのリンクです。\n制作したものやツールなどがあります。\nぜひ覗いてみてください。"
				}
			>
				<SiteLinksSection />
			</Section>

			<div className="w-full pb-16" />
		</main>
	);
}
