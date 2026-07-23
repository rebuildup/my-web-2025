"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";

function animateCount(
	target: number,
	durationMs: number,
	setValue: (v: number) => void,
) {
	const start = performance.now();
	const from = 0;
	const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
	let raf = 0;
	const tick = (now: number) => {
		const elapsed = now - start;
		const t = Math.min(1, elapsed / durationMs);
		const eased = easeOutCubic(t);
		setValue(Math.round(from + (target - from) * eased));
		if (t < 1) raf = requestAnimationFrame(tick);
	};
	raf = requestAnimationFrame(tick);
	return () => cancelAnimationFrame(raf);
}

type StatsItem = {
	id: string;
	title: string;
	thumbnail?: string;
	publishedAt?: string;
	updatedAt?: string;
	createdAt?: string;
};

type HighlightItem = Pick<StatsItem, "id" | "title" | "thumbnail">;

const baseCard = "min-w-0 border border-current  p-4 md:p-5";

function fontSizeFor(value: number, emphasis = false) {
	const digits = String(Math.max(0, value)).length;
	if (digits <= 2) return emphasis ? "text-4xl" : "text-3xl";
	if (digits === 3) return emphasis ? "text-3xl" : "text-2xl";
	if (digits === 4) return emphasis ? "text-2xl" : "text-xl";
	return emphasis ? "text-xl" : "text-lg";
}

function StatCard({
	label,
	value,
	emphasis = false,
}: {
	label: string;
	value: number;
	emphasis?: boolean;
}) {
	return (
		<div className={baseCard}>
			<div className="noto-sans-jp-light text-xs mb-2">{label}</div>
			<div className="flex items-end gap-2">
				<div
					className={`neue-haas-grotesk-display leading-none ${fontSizeFor(value, emphasis)}`}
				>
					{value.toLocaleString("ja-JP")}
				</div>
				<div className="noto-sans-jp-light text-[10px] mb-1">items</div>
			</div>
		</div>
	);
}

function LatestContentCard({
	latestItem,
	latestHref,
}: {
	latestItem: StatsItem | null | undefined;
	latestHref: string;
}) {
	return (
		<div className="group relative h-full min-h-[260px] w-full max-w-full overflow-hidden border border-current">
			<div className="absolute inset-0 overflow-hidden">
				{latestItem?.thumbnail ? (
					<SafeImage
						src={latestItem.thumbnail}
						alt={latestItem.title}
						fill
						className="object-cover object-center "
						sizes="(max-width: 1024px) 100vw, 66vw"
					/>
				) : (
					<div className="absolute inset-0 " />
				)}
				<div className="absolute inset-0 " />
			</div>
			<div className="relative z-10 p-6 md:p-7 flex flex-col justify-between h-full">
				<div>
					<div className="text-[10px] font-mono tracking-widest uppercase">
						Latest Content
					</div>
					<h3 className="mt-6 text-2xl md:text-3xl font-display font-semibold line-clamp-2">
						<Link href={latestHref}>{latestItem?.title || "Latest Work"}</Link>
					</h3>
					<p className="mt-3 text-[11px] max-w-sm">
						{latestItem
							? "最新の公開コンテンツをピックアップ."
							: "最新のコンテンツをチェックできます."}
					</p>
				</div>
				<div className="text-[10px] font-mono uppercase tracking-widest ">
					View details →
				</div>
			</div>
		</div>
	);
}

function PeriodStatsCards({
	v7,
	v30,
	v365,
}: {
	v7: number;
	v30: number;
	v365: number;
}) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 min-w-0 max-w-full">
			<StatCard label="直近7日のコンテンツ" value={v7} />
			<StatCard label="直近30日のコンテンツ" value={v30} />
			<StatCard label="直近1年のコンテンツ" value={v365} />
		</div>
	);
}

function CategoryStatsCards({
	vTotal,
	vDevelop,
	vVideo,
	vVideoDesign,
}: {
	vTotal: number;
	vDevelop: number;
	vVideo: number;
	vVideoDesign: number;
}) {
	return (
		<div className="grid grid-cols-2 gap-3 md:gap-4 min-w-0 max-w-full">
			<StatCard label="総コンテンツ" value={vTotal} emphasis />
			<StatCard label="develop" value={vDevelop} />
			<StatCard label="video" value={vVideo} />
			<StatCard label="video&design" value={vVideoDesign} />
		</div>
	);
}

function RandomPickCard({
	randomItem,
	onRotate,
}: {
	randomItem: HighlightItem | null;
	onRotate: () => void;
}) {
	return (
		<button
			type="button"
			className="text-left group w-full min-w-0 max-w-full border-0 p-0 bg-transparent cursor-pointer"
			onClick={onRotate}
			title="クリックで入れ替え"
		>
			<div className="relative h-full min-h-[220px] w-full max-w-full overflow-hidden border border-current ">
				<div className="relative w-full h-full overflow-hidden">
					{randomItem?.thumbnail ? (
						<SafeImage
							key={randomItem.id}
							src={randomItem.thumbnail}
							alt={randomItem.title}
							fill
							className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
							sizes="(max-width: 1024px) 100vw, 33vw"
						/>
					) : (
						<div className="w-full h-full " />
					)}
					<div className="absolute inset-0 " />
				</div>
				<div className="absolute left-0 right-0 bottom-0 p-4 md:p-5">
					<div className="flex items-center gap-3 text-[10px] uppercase tracking-widest ">
						<span className="font-mono">Random Pick</span>
						<span className="font-mono">Click to shuffle</span>
					</div>
					{randomItem ? (
						<h3 className="mt-2 zen-kaku-gothic-new text-sm md: line-clamp-2">
							{randomItem.title}
						</h3>
					) : (
						<div className="mt-2 text-[10px] ">アイテムがありません</div>
					)}
					<div className="mt-1 text-[10px] ">
						手動で入れ替えて、思わぬ発見を.
					</div>
					{randomItem && (
						<Link
							href={`/portfolio/${randomItem.id}`}
							className="mt-2 inline-block text-[10px] underline underline-offset-2 hover: transition-colors"
							onClick={(e) => e.stopPropagation()}
						>
							詳細を見る →
						</Link>
					)}
				</div>
			</div>
		</button>
	);
}

export function StatsOverview({
	total,
	develop,
	video,
	videoDesign,
	count7d,
	count30d,
	count365d,
	items,
}: {
	total: number;
	develop: number;
	video: number;
	videoDesign: number;
	count7d: number;
	count30d: number;
	count365d: number;
	items: {
		id: string;
		title: string;
		thumbnail?: string;
		publishedAt?: string;
		updatedAt?: string;
		createdAt?: string;
	}[];
}) {
	const [vTotal, setVTotal] = useState(0);
	const [vDevelop, setVDevelop] = useState(0);
	const [vVideo, setVVideo] = useState(0);
	const [vVideoDesign, setVVideoDesign] = useState(0);
	const [v7, setV7] = useState(0);
	const [v30, setV30] = useState(0);
	const [v365, setV365] = useState(0);
	const started = useRef(false);

	useEffect(() => {
		if (started.current) return;
		started.current = true;
		const cleanups = [
			animateCount(total, 900, setVTotal),
			animateCount(develop, 850, setVDevelop),
			animateCount(video, 850, setVVideo),
			animateCount(videoDesign, 900, setVVideoDesign),
			animateCount(count7d, 800, setV7),
			animateCount(count30d, 900, setV30),
			animateCount(count365d, 1000, setV365),
		];
		return () => {
			cleanups.forEach((c) => c && c());
		};
	}, [total, develop, video, videoDesign, count7d, count30d, count365d]);

	const pool = useMemo(
		() =>
			Array.isArray(items)
				? items.filter((it) => typeof it?.id === "string")
				: [],
		[items],
	);

	const latestItem = useMemo(() => {
		if (pool.length === 0) return null;
		const getDate = (item: (typeof pool)[number]) =>
			item.publishedAt || item.updatedAt || item.createdAt || "";
		return [...pool].sort((a, b) => {
			const aTime = new Date(getDate(a)).getTime();
			const bTime = new Date(getDate(b)).getTime();
			return (
				(Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
			);
		})[0];
	}, [pool]);

	const deterministicPick = useMemo(() => {
		if (pool.length === 0) return null;
		const seed = pool
			.map((it) => it.id)
			.join("|")
			.split("")
			.reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 7);
		const index = Math.abs(seed) % pool.length;
		return pool[index] || null;
	}, [pool]);

	const [randomItem, setRandomItem] = useState<{
		id: string;
		title: string;
		thumbnail?: string;
	} | null>(null);

	const rotateHighlight = useCallback(() => {
		if (pool.length === 0) return;
		setRandomItem((prev) => {
			const currentIndex = prev
				? pool.findIndex((item) => item.id === prev.id)
				: -1;
			const nextIndex = (currentIndex + 1 + pool.length) % pool.length;
			return pool[nextIndex] || null;
		});
	}, [pool]);

	useEffect(() => {
		setRandomItem(deterministicPick);
	}, [deterministicPick]);

	const latestHref = latestItem
		? `/portfolio/${latestItem.id}`
		: "/portfolio/gallery/all";

	return (
		<section className="overflow-hidden">
			<div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] w-full max-w-full overflow-hidden">
				{/* Left column: Latest Content + 7d/30d/365d */}
				<div className="grid gap-3 md:gap-4 min-w-0 max-w-full">
					<LatestContentCard latestItem={latestItem} latestHref={latestHref} />
					<PeriodStatsCards v7={v7} v30={v30} v365={v365} />
				</div>

				{/* Right column: 2x2 stats + Random Pick */}
				<div className="grid gap-3 md:gap-4 min-w-0 max-w-full">
					<CategoryStatsCards
						vTotal={vTotal}
						vDevelop={vDevelop}
						vVideo={vVideo}
						vVideoDesign={vVideoDesign}
					/>
					<RandomPickCard randomItem={randomItem} onRotate={rotateHighlight} />
				</div>
			</div>
		</section>
	);
}
