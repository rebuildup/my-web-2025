"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BentoCardGrid, ParticleCard } from "@/components/MagicBento";
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
	lastUpdate,
	items,
	featured,
}: {
	total: number;
	develop: number;
	video: number;
	videoDesign: number;
	count7d: number;
	count30d: number;
	count365d: number;
	lastUpdate: Date;
	items: { id: string; title: string; thumbnail?: string }[];
	featured?: { id: string; title: string; thumbnail?: string } | null;
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

	// Highlights data
	const pool = useMemo(
		() =>
			Array.isArray(items)
				? items.filter((it) => typeof it?.id === "string")
				: [],
		[items],
	);
	const pickRandom = useCallback(() => {
		if (pool.length === 0) return null;
		const i = Math.floor(Math.random() * pool.length);
		return pool[i] || null;
	}, [pool]);
	const [randomItem, setRandomItem] = useState<{
		id: string;
		title: string;
		thumbnail?: string;
	} | null>(null);
	useEffect(() => {
		setRandomItem(pickRandom());
	}, [pickRandom]);

	return (
		<section>
			<BentoCardGrid>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-3 gap-3 md:gap-4 w-full max-w-full auto-rows-fr">
					{/* Featured画像（左上、2×2） */}
					{featured ? (
						<Link
							href={`/portfolio/${featured.id}`}
							className="md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2"
						>
							<ParticleCard
								className="card flex flex-col justify-between relative w-full h-full p-0 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow"
								style={{
									backgroundColor: "#060010",
									borderColor: "#392e4e",
									color: "#fff",
								}}
								enableTilt={true}
								clickEffect={true}
								enableMagnetism={true}
							>
								<div className="relative w-full h-full overflow-hidden">
									{featured.thumbnail ? (
										<SafeImage
											src={featured.thumbnail}
											alt={featured.title}
											fill
											className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
											style={{
												objectPosition: "center center",
												transformOrigin: "center center",
											}}
											sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
										/>
									) : (
										<div className="w-full h-full bg-base/30" />
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
									<div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 lg:p-6 z-10">
										<div className="noto-sans-jp-light text-xs md:text-sm text-white/90 mb-1.5">
											Featured
										</div>
										<div className="zen-kaku-gothic-new text-xl md:text-3xl lg:text-4xl text-white line-clamp-2 leading-tight">
											{featured.title}
										</div>
									</div>
								</div>
							</ParticleCard>
						</Link>
					) : (
						<ParticleCard
							className="card flex items-center justify-center relative w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] p-5 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
						>
							<div className="text-center">
								<div className="noto-sans-jp-light text-sm text-main/70 mb-1.5">
									Featured
								</div>
								<div className="text-xs text-main/50">該当なし</div>
							</div>
						</ParticleCard>
					)}

					{/* 種別アイテム数（右上、1×2、2×2グリッドで配置） */}
					<div className="md:col-span-1 md:row-span-2 lg:col-span-1 lg:row-span-2 grid grid-cols-2 gap-3 md:gap-4">
						{/* 総コンテンツ */}
						<ParticleCard
							className="card flex flex-col justify-between relative w-full h-full min-h-[120px] p-4 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
							enableTilt={true}
							clickEffect={true}
						>
							<div className="noto-sans-jp-light text-xs mb-2 text-main/90">
								総コンテンツ
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-accent leading-none " +
										fontSizeFor(vTotal, true)
									}
								>
									{vTotal.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</ParticleCard>

						{/* develop */}
						<ParticleCard
							className="card flex flex-col justify-between relative w-full h-full min-h-[120px] p-4 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
							enableTilt={true}
							clickEffect={true}
						>
							<div className="noto-sans-jp-light text-xs mb-2 text-main/75">
								develop
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-accent leading-none " +
										fontSizeFor(vDevelop, false)
									}
								>
									{vDevelop.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</ParticleCard>

						{/* video */}
						<ParticleCard
							className="card flex flex-col justify-between relative w-full h-full min-h-[120px] p-4 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
							enableTilt={true}
							clickEffect={true}
						>
							<div className="noto-sans-jp-light text-xs mb-2 text-main/75">
								video
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-accent leading-none " +
										fontSizeFor(vVideo, false)
									}
								>
									{vVideo.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</ParticleCard>

						{/* video&design */}
						<ParticleCard
							className="card flex flex-col justify-between relative w-full h-full min-h-[120px] p-4 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
							enableTilt={true}
							clickEffect={true}
						>
							<div className="noto-sans-jp-light text-xs mb-2 text-main/75">
								video&design
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-accent leading-none " +
										fontSizeFor(vVideoDesign, false)
									}
								>
									{vVideoDesign.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</ParticleCard>
					</div>

					{/* 直近コンテンツ数（左下、2×1、3つ均等に配置） */}
					<div className="md:col-span-2 lg:col-span-2 lg:row-span-1 flex flex-row gap-3 md:gap-4">
						{/* 直近7日 */}
						<ParticleCard
							className="card flex flex-col justify-between relative w-full h-full min-h-[180px] p-4 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow flex-1"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
							enableTilt={true}
							clickEffect={true}
						>
							<div className="noto-sans-jp-light text-xs mb-2 text-main/75">
								直近7日のコンテンツ
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-accent leading-none " +
										fontSizeFor(v7, false)
									}
								>
									{v7.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</ParticleCard>

						{/* 直近30日 */}
						<ParticleCard
							className="card flex flex-col justify-between relative w-full h-full min-h-[180px] p-4 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow flex-1"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
							enableTilt={true}
							clickEffect={true}
						>
							<div className="noto-sans-jp-light text-xs mb-2 text-main/75">
								直近30日のコンテンツ
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-accent leading-none " +
										fontSizeFor(v30, false)
									}
								>
									{v30.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</ParticleCard>

						{/* 直近1年 */}
						<ParticleCard
							className="card flex flex-col justify-between relative w-full h-full min-h-[180px] p-4 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow flex-1"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
							enableTilt={true}
							clickEffect={true}
						>
							<div className="noto-sans-jp-light text-xs mb-2 text-main/75">
								直近1年のコンテンツ
							</div>
							<div className="flex items-end gap-2">
								<div
									className={
										"neue-haas-grotesk-display text-accent leading-none " +
										fontSizeFor(v365, false)
									}
								>
									{v365.toLocaleString("ja-JP")}
								</div>
								<div className="noto-sans-jp-light text-[10px] text-main/50 mb-1">
									items
								</div>
							</div>
						</ParticleCard>
					</div>

					{/* Random画像（右下、1×1） */}
					<button
						type="button"
						className="text-left group md:col-span-1 lg:col-span-1 lg:row-span-1"
						onClick={() => setRandomItem(pickRandom())}
						title="クリックで入れ替え"
					>
						<ParticleCard
							className="card flex flex-col justify-between relative w-full h-full min-h-[180px] p-0 rounded-[20px] border border-solid border-main/30 font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow"
							style={{
								backgroundColor: "#060010",
								borderColor: "#392e4e",
								color: "#fff",
							}}
							enableTilt={true}
							clickEffect={true}
						>
							<div className="relative w-full h-full overflow-hidden aspect-[16/9]">
								{randomItem?.thumbnail ? (
									<SafeImage
										key={randomItem.id}
										src={randomItem.thumbnail}
										alt={randomItem.title}
										fill
										className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
										style={{
											objectPosition: "center center",
											transformOrigin: "center center",
										}}
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
									/>
								) : (
									<div className="w-full h-full bg-base/30" />
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10">
									<div className="noto-sans-jp-light text-[10px] md:text-xs text-white/90 mb-1">
										Random Pick
									</div>
									{randomItem ? (
										<div className="zen-kaku-gothic-new text-xs md:text-sm text-white line-clamp-2 mb-1">
											{randomItem.title}
										</div>
									) : (
										<div className="text-[10px] text-white/70 mb-1">
											アイテムがありません
										</div>
									)}
									{randomItem && (
										<Link
											href={`/portfolio/${randomItem.id}`}
											className="text-[10px] underline underline-offset-2 text-accent/90 hover:text-white transition-colors"
											onClick={(e) => e.stopPropagation()}
										>
											詳細を見る →
										</Link>
									)}
								</div>
							</div>
						</ParticleCard>
					</button>
				</div>
			</BentoCardGrid>
		</section>
	);
}
