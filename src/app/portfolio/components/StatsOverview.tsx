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

	const fontSizeFor = (value: number, emphasis = false) => {
		const digits = String(Math.max(0, value)).length;
		if (digits <= 2) return emphasis ? "text-4xl" : "text-3xl";
		if (digits === 3) return emphasis ? "text-3xl" : "text-2xl";
		if (digits === 4) return emphasis ? "text-2xl" : "text-xl";
		return emphasis ? "text-xl" : "text-lg";
	};

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

	const baseCard =
		"min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5";

	return (
		<section className="overflow-hidden">
			<div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] w-full max-w-full overflow-hidden">
				<div className="grid gap-3 md:gap-4 min-w-0 max-w-full">
					<Link
						href={
							latestItem
								? `/portfolio/${latestItem.id}`
								: "/portfolio/gallery/all"
						}
						className="group relative flex h-full min-h-[260px] w-full max-w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 md:p-7"
					>
						<div className="absolute inset-0">
							{latestItem?.thumbnail ? (
								<SafeImage
									src={latestItem.thumbnail}
									alt={latestItem.title}
									fill
									className="object-cover object-center opacity-70"
									sizes="(max-width: 1024px) 100vw, 66vw"
								/>
							) : (
								<div className="absolute inset-0 bg-gradient-to-br from-[#0b0b16] via-black to-[#0b1225]" />
							)}
							<div className="absolute inset-0 bg-black/40" />
							<div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-[#0b0b16]/40 to-black/70" />
							<div className="absolute right-[-15%] top-[-20%] h-64 w-64 rounded-full bg-[#2b57ff]/20 blur-3xl" />
							<div className="absolute bottom-[-20%] left-[-10%] h-56 w-56 rounded-full bg-white/5 blur-3xl" />
						</div>
						<div className="relative z-10">
							<div className="text-[10px] font-mono tracking-widest text-main/50 uppercase">
								Latest Content
							</div>
							<div className="mt-6 text-2xl md:text-3xl font-display font-semibold text-main line-clamp-2">
								{latestItem?.title || "Latest Work"}
							</div>
							<p className="mt-3 text-[11px] text-main/70 max-w-sm">
								{latestItem
									? "最新の公開コンテンツをピックアップ。"
									: "最新のコンテンツをチェックできます。"}
							</p>
						</div>
						<div className="relative z-10 mt-8 text-[10px] font-mono uppercase tracking-widest text-main/40">
							{latestItem ? "View details →" : "View all →"}
						</div>
					</Link>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 min-w-0 max-w-full">
						<div className={baseCard}>
							<div className="noto-sans-jp-light text-xs text-main/70 mb-2">
								直近7日のコンテンツ
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-main leading-none " +
										fontSizeFor(v7)
									}
								>
									{v7.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</div>

						<div className={baseCard}>
							<div className="noto-sans-jp-light text-xs text-main/70 mb-2">
								直近30日のコンテンツ
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-main leading-none " +
										fontSizeFor(v30)
									}
								>
									{v30.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</div>

						<div className={baseCard}>
							<div className="noto-sans-jp-light text-xs text-main/70 mb-2">
								直近1年のコンテンツ
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-main leading-none " +
										fontSizeFor(v365)
									}
								>
									{v365.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="grid gap-3 md:gap-4 min-w-0 max-w-full">
					<div className="grid grid-cols-2 gap-3 md:gap-4 min-w-0 max-w-full">
						<div className={baseCard}>
							<div className="noto-sans-jp-light text-xs text-main/70 mb-2">
								総コンテンツ
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-main leading-none " +
										fontSizeFor(vTotal, true)
									}
								>
									{vTotal.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</div>

						<div className={baseCard}>
							<div className="noto-sans-jp-light text-xs text-main/70 mb-2">
								develop
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-main leading-none " +
										fontSizeFor(vDevelop)
									}
								>
									{vDevelop.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</div>

						<div className={baseCard}>
							<div className="noto-sans-jp-light text-xs text-main/70 mb-2">
								video
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-main leading-none " +
										fontSizeFor(vVideo)
									}
								>
									{vVideo.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</div>

						<div className={baseCard}>
							<div className="noto-sans-jp-light text-xs text-main/70 mb-2">
								video&design
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-main leading-none " +
										fontSizeFor(vVideoDesign)
									}
								>
									{vVideoDesign.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</div>
					</div>

					<button
						type="button"
						className="text-left group w-full min-w-0 max-w-full"
						onClick={rotateHighlight}
						title="クリックで入れ替え"
					>
						<div className="relative h-full min-h-[220px] w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
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
									<div className="w-full h-full bg-base/30" />
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
							</div>
							<div className="absolute left-0 right-0 bottom-0 p-4 md:p-5">
								<div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-main/70">
									<span className="font-mono">Random Pick</span>
									<span className="font-mono">Click to shuffle</span>
								</div>
								{randomItem ? (
									<div className="mt-2 zen-kaku-gothic-new text-sm md:text-base text-main line-clamp-2">
										{randomItem.title}
									</div>
								) : (
									<div className="mt-2 text-[10px] text-main/60">
										アイテムがありません
									</div>
								)}
								<div className="mt-1 text-[10px] text-main/60">
									手動で入れ替えて、思わぬ発見を。
								</div>
								{randomItem && (
									<Link
										href={`/portfolio/${randomItem.id}`}
										className="mt-2 inline-block text-[10px] underline underline-offset-2 text-main/80 hover:text-main transition-colors"
										onClick={(e) => e.stopPropagation()}
									>
										詳細を見る →
									</Link>
								)}
							</div>
						</div>
					</button>
				</div>
			</div>
		</section>
	);
}
