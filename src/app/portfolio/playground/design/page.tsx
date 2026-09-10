/**
 * Design Playground Page — Linear-style polish (2026-09-10 v3)
 * Skill application: layout-system § 4 Nesting + § 5 Application/Tool,
 * typesetting § 9 responsive transformation, responsive-design § 9 verify,
 * accessibility-audit § 5 semantic. See .tmp/design-brief-design-playground.md § 5.
 *
 * Visual direction: hairline borders, compact 12-col grid, mono-caps labels,
 * tabular-nums metrics, restrained palette, subtle hover transitions. No
 * marketing eyebrow, no oversized h1, no wireframe-style 2px borders.
 */

"use client";

import { ChevronDown, Monitor, Settings } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ResponsiveExperimentGrid,
	ResponsiveFilterBar,
} from "@/components/playground/common";
import { designExperiments } from "@/components/playground/design-experiments/experiments-data";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useResponsive } from "@/hooks/useResponsive";
import { useExperimentSwipe } from "@/hooks/useTouchGestures";
import { deviceCapabilitiesDetector } from "@/lib/playground/device-capabilities";
import {
	getExperimentComponent,
	preloadCriticalExperiments,
} from "@/lib/playground/dynamic-loader";
import type {
	DeviceCapabilities,
	ExperimentFilter,
	PerformanceMetrics,
	PerformanceSettings,
} from "@/types/playground";

// Container: 12-col shell (max-w-7xl = 80rem). Subtle inner padding.
const SHELL = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

// Hairline border tokens — never 2px.
const HAIRLINE = "border-neutral-200";
const HAIRLINE_STRONG = "border-neutral-300";

// Mono caps label primitive (Linear-style section eyebrow).
const EYEBROW =
	"font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-500";

// Tabular nums primitive.
const TABS = "tabular-nums font-mono";

export default function DesignPlaygroundPage() {
	const responsive = useResponsive();

	// ─── State ───────────────────────────────────────────────────────────
	const [deviceCapabilities, setDeviceCapabilities] =
		useState<DeviceCapabilities | null>(null);
	const [performanceSettings, setPerformanceSettings] =
		useState<PerformanceSettings>({
			targetFPS: 60,
			qualityLevel: "medium",
			enableOptimizations: true,
		});
	const [performanceMetrics, setPerformanceMetrics] =
		useState<PerformanceMetrics>({
			fps: 0,
			frameTime: 0,
			memoryUsage: 0,
		});
	const [activeExperiment, setActiveExperiment] = useState<string | null>(null);
	const [filter, setFilter] = useState<ExperimentFilter>({
		category: undefined,
		difficulty: undefined,
		technology: undefined,
	});
	const [showSettings, setShowSettings] = useState(false);
	const [showPerformance, setShowPerformance] = useState(false);
	const [experimentError, setExperimentError] = useState<string | null>(null);

	// ─── Device capabilities + preload ───────────────────────────────────
	useEffect(() => {
		const initializeCapabilities = async () => {
			try {
				const capabilities = await deviceCapabilitiesDetector.getCapabilities();
				setDeviceCapabilities(capabilities);

				const recommendedSettings =
					deviceCapabilitiesDetector.getRecommendedSettings(capabilities);
				setPerformanceSettings(recommendedSettings);

				try {
					await preloadCriticalExperiments();
				} catch (error) {
					console.warn("Failed to preload critical experiments:", error);
				}
			} catch (error) {
				console.error("Failed to detect device capabilities:", error);
				setDeviceCapabilities({
					webglSupport: false,
					webgl2Support: false,
					performanceLevel: "medium",
					touchSupport: false,
					maxTextureSize: 2048,
					devicePixelRatio: 1,
					hardwareConcurrency: 4,
				});
			}
		};

		initializeCapabilities();
	}, []);

	// ─── Performance monitor ────────────────────────────────────────────
	const handlePerformanceUpdate = useCallback(
		(metrics: PerformanceMetrics) => {
			setPerformanceMetrics(metrics);

			if (
				performanceSettings.enableOptimizations &&
				metrics.fps < performanceSettings.targetFPS * 0.7
			) {
				setPerformanceSettings((prev) => ({
					...prev,
					qualityLevel: prev.qualityLevel === "high" ? "medium" : "low",
				}));
			}
		},
		[performanceSettings],
	);

	// ─── Filter ──────────────────────────────────────────────────────────
	const filteredExperiments = useMemo(() => {
		return designExperiments.filter((experiment) => {
			if (filter.category && experiment.category !== filter.category)
				return false;
			if (filter.difficulty && experiment.difficulty !== filter.difficulty)
				return false;
			if (
				filter.performanceLevel &&
				experiment.performanceLevel !== filter.performanceLevel
			)
				return false;
			if (
				filter.interactive !== undefined &&
				experiment.interactive !== filter.interactive
			)
				return false;
			const techFilter = filter.technology?.toLowerCase();
			if (
				techFilter &&
				!experiment.technology.some((tech) =>
					tech.toLowerCase().includes(techFilter),
				)
			)
				return false;
			return true;
		});
	}, [filter]);

	const availableCategories = useMemo(
		() => Array.from(new Set(designExperiments.map((exp) => exp.category))),
		[],
	);

	const availableTechnologies = useMemo(
		() =>
			Array.from(new Set(designExperiments.flatMap((exp) => exp.technology))),
		[],
	);

	// ─── Swipe / experiment switching ────────────────────────────────────
	const experimentIds = filteredExperiments.map((exp) => exp.id);
	const currentExperimentIndex = activeExperiment
		? experimentIds.indexOf(activeExperiment)
		: -1;

	const handleExperimentSwipe = useCallback(
		(newIndex: number) => {
			if (newIndex >= 0 && newIndex < experimentIds.length) {
				setActiveExperiment(experimentIds[newIndex]);
				setExperimentError(null);
			}
		},
		[experimentIds],
	);

	const swipeHandlers = useExperimentSwipe(
		experimentIds,
		currentExperimentIndex,
		handleExperimentSwipe,
	);

	// ─── Render experiment ───────────────────────────────────────────────
	const renderExperiment = (experimentId: string) => {
		const experiment = designExperiments.find((exp) => exp.id === experimentId);
		if (!experiment || !deviceCapabilities) return null;

		const ExperimentComponent = getExperimentComponent(experimentId);

		if (!ExperimentComponent) {
			return (
				<div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50">
					<div className="text-center">
						<div className="text-sm font-semibold text-neutral-900">
							Loading error
						</div>
						<p className="mt-1 text-xs text-neutral-600">
							Failed to load experiment: {experimentId}
						</p>
					</div>
				</div>
			);
		}

		return (
			<ExperimentComponent
				isActive={activeExperiment === experimentId}
				deviceCapabilities={deviceCapabilities}
				performanceSettings={performanceSettings}
				onPerformanceUpdate={handlePerformanceUpdate}
				onError={(error) => {
					console.error("Experiment error:", error);
					setExperimentError(
						`Error loading experiment: ${error.message || error}`,
					);
					setActiveExperiment(null);
				}}
			/>
		);
	};

	// ─── Loading state ──────────────────────────────────────────────────
	if (!deviceCapabilities) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-neutral-50">
				<div className="flex flex-col items-center gap-3">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
					<p
						lang="ja"
						className="font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-500"
					>
						Detecting device capabilities
					</p>
				</div>
			</div>
		);
	}

	// ─── Layout ──────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-white text-neutral-900 antialiased">
			{/* ── Header (linear-style top bar) ──────────────────────────── */}
			<header
				className={`border-b ${HAIRLINE} bg-white`}
				aria-labelledby="page-heading"
			>
				<div className={`${SHELL} py-3.5`}>
					<div className="flex items-center justify-between gap-6">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Portfolio", href: "/portfolio" },
								{
									label: "Playground",
									href: "/portfolio/playground/design",
								},
								{ label: "Design", isCurrent: true },
							]}
						/>
						<div className="hidden items-center gap-1.5 sm:flex">
							<span className="relative flex h-1.5 w-1.5">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
								<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
							</span>
							<span
								className={`${EYEBROW} text-neutral-600 tabular-nums`}
								aria-live="polite"
							>
								{deviceCapabilities.performanceLevel} · ready
							</span>
						</div>
					</div>

					<div className="mt-3.5 flex items-end justify-between gap-6">
						<div className="min-w-0">
							<h1
								id="page-heading"
								className="text-[15px] font-semibold leading-snug tracking-tight text-neutral-900"
							>
								Design Playground
							</h1>
							<p
								lang="ja"
								className="mt-1 max-w-xl text-[13px] leading-relaxed text-neutral-500"
							>
								CSS・SVG・Canvas
								を組み合わせた視覚表現と、リアルタイムに更新される
								インタラクションの実験場。
							</p>
						</div>
						<div className="hidden shrink-0 items-center gap-5 lg:flex">
							<Stat label="FPS" value={performanceMetrics.fps || "—"} />
							<Stat
								label="Frame"
								value={
									performanceMetrics.frameTime
										? `${performanceMetrics.frameTime.toFixed(1)}ms`
										: "—"
								}
							/>
							<Stat
								label="Memory"
								value={
									performanceMetrics.memoryUsage
										? `${performanceMetrics.memoryUsage}MB`
										: "—"
								}
							/>
						</div>
					</div>
				</div>
			</header>

			{/* ── Filter bar (sticky toolbar, compact) ────────────────────── */}
			<div
				className={`sticky top-0 z-20 border-b ${HAIRLINE} bg-white/85 backdrop-blur`}
			>
				<div className={`${SHELL} py-2.5`}>
					<div className="flex items-center gap-4">
						<div className="flex shrink-0 items-center gap-2">
							<span className="h-1 w-1 rounded-full bg-neutral-900" />
							<span
								className={`${EYEBROW} text-neutral-700`}
								style={{ fontVariantCaps: "all-small-caps" }}
							>
								Filter
							</span>
						</div>
						<div className="flex-1 overflow-hidden">
							<ResponsiveFilterBar
								filter={filter}
								onFilterChange={setFilter}
								availableCategories={availableCategories}
								availableTechnologies={availableTechnologies}
							/>
						</div>
						<div
							className={`${EYEBROW} shrink-0 tabular-nums text-neutral-500`}
						>
							<span className="font-medium text-neutral-900">
								{filteredExperiments.length}
							</span>
							<span className="mx-1 text-neutral-300">/</span>
							{designExperiments.length}
						</div>
					</div>
				</div>
			</div>

			{/* ── Main canvas (12-col grid: rail + canvas) ────────────────── */}
			<main aria-label="Design playground" className={`${SHELL} py-6 lg:py-8`}>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
					{/* Rail: settings + performance */}
					<aside className="space-y-3 lg:sticky lg:top-14 lg:col-span-3 lg:self-start">
						{/* Settings card */}
						<section
							className={`rounded-md border ${HAIRLINE_STRONG} bg-white`}
							aria-labelledby="settings-heading"
						>
							<button
								type="button"
								onClick={() => setShowSettings(!showSettings)}
								className="group flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-neutral-50"
								aria-expanded={showSettings}
								aria-controls="device-settings-panel"
							>
								<div className="flex items-center gap-2">
									<Settings
										className="h-3.5 w-3.5 text-neutral-500"
										aria-hidden
									/>
									<h3
										id="settings-heading"
										className="text-[13px] font-medium text-neutral-900"
									>
										Device &amp; settings
									</h3>
								</div>
								<ChevronDown
									className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-150 ${
										showSettings ? "rotate-180" : ""
									}`}
									aria-hidden
								/>
							</button>

							{showSettings && (
								<div
									id="device-settings-panel"
									className={`space-y-3 border-t ${HAIRLINE} px-3.5 py-3.5`}
								>
									<dl className="grid grid-cols-2 gap-px overflow-hidden rounded border border-neutral-200 bg-neutral-200">
										<Cell
											term="Performance"
											detail={deviceCapabilities.performanceLevel}
										/>
										<Cell
											term="Touch"
											detail={deviceCapabilities.touchSupport ? "Yes" : "No"}
										/>
										<Cell
											term="DPR"
											detail={`${deviceCapabilities.devicePixelRatio}×`}
										/>
										<Cell
											term="CPU"
											detail={`${deviceCapabilities.hardwareConcurrency} cores`}
										/>
									</dl>

									<div className="space-y-1.5">
										<label htmlFor="qualityLevel" className={EYEBROW}>
											Quality
										</label>
										<select
											id="qualityLevel"
											value={performanceSettings.qualityLevel}
											onChange={(e) =>
												setPerformanceSettings((prev) => ({
													...prev,
													qualityLevel: e.target
														.value as PerformanceSettings["qualityLevel"],
												}))
											}
											className={`w-full appearance-none rounded border ${HAIRLINE_STRONG} bg-white px-2 py-1 text-[12px] text-neutral-900 transition-colors duration-150 hover:border-neutral-400 focus:border-neutral-900 focus:outline-none`}
											data-testid="quality-select"
										>
											<option value="low">Low · 30 FPS</option>
											<option value="medium">Medium · 60 FPS</option>
											<option value="high">High · 60+ FPS</option>
										</select>
									</div>

									<label className="flex items-center justify-between gap-2 text-[12px]">
										<span className="text-neutral-700">Auto optimize</span>
										<span className="relative inline-flex h-4 w-7 cursor-pointer items-center rounded-full transition-colors duration-150">
											<input
												type="checkbox"
												checked={performanceSettings.enableOptimizations}
												onChange={(e) =>
													setPerformanceSettings((prev) => ({
														...prev,
														enableOptimizations: e.target.checked,
													}))
												}
												className="peer sr-only"
											/>
											<span
												className={`h-4 w-7 rounded-full border ${HAIRLINE_STRONG} transition-colors duration-150 ${
													performanceSettings.enableOptimizations
														? "border-neutral-900 bg-neutral-900"
														: "bg-white"
												}`}
											/>
											<span
												className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all duration-150 ${
													performanceSettings.enableOptimizations
														? "left-3"
														: "left-0.5"
												}`}
											/>
										</span>
									</label>
								</div>
							)}
						</section>

						{/* Performance card */}
						<section
							className={`rounded-md border ${HAIRLINE_STRONG} bg-white`}
							aria-labelledby="performance-heading"
						>
							<button
								type="button"
								onClick={() => setShowPerformance(!showPerformance)}
								className="group flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-neutral-50"
								aria-expanded={showPerformance}
								aria-controls="performance-monitor-panel"
							>
								<div className="flex items-center gap-2">
									<Monitor
										className="h-3.5 w-3.5 text-neutral-500"
										aria-hidden
									/>
									<h3
										id="performance-heading"
										className="text-[13px] font-medium text-neutral-900"
									>
										Performance
									</h3>
								</div>
								<ChevronDown
									className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-150 ${
										showPerformance ? "rotate-180" : ""
									}`}
									aria-hidden
								/>
							</button>

							{showPerformance && (
								<div
									id="performance-monitor-panel"
									className={`grid grid-cols-3 gap-px border-t ${HAIRLINE} bg-neutral-200`}
								>
									<Metric
										value={
											performanceMetrics.fps === 0
												? "—"
												: performanceMetrics.fps.toString()
										}
										label="FPS"
									/>
									<Metric
										value={
											performanceMetrics.frameTime === 0
												? "—"
												: performanceMetrics.frameTime.toFixed(1)
										}
										label="ms/f"
									/>
									<Metric
										value={
											performanceMetrics.memoryUsage === 0
												? "—"
												: performanceMetrics.memoryUsage.toString()
										}
										label="MB"
									/>
								</div>
							)}
						</section>
					</aside>

					{/* Canvas: experiments grid + active viewer */}
					<section className="min-w-0 space-y-6 lg:col-span-9">
						{/* Experiments card (no border around it; component owns its surface) */}
						<div>
							<ResponsiveExperimentGrid
								experiments={filteredExperiments}
								activeExperiment={activeExperiment}
								onExperimentSelect={(experimentId) => {
									setActiveExperiment(experimentId);
									setExperimentError(null);
								}}
							/>
						</div>

						{experimentError && (
							<div
								className={`flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-900`}
								role="alert"
							>
								<div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
								<div className="flex-1">
									<p>{experimentError}</p>
									<button
										type="button"
										onClick={() => setExperimentError(null)}
										className={`mt-1 ${EYEBROW} text-red-700 hover:text-red-900`}
									>
										Dismiss
									</button>
								</div>
							</div>
						)}

						{activeExperiment && (
							<div
								className={`overflow-hidden rounded-md border ${HAIRLINE_STRONG} bg-white`}
								onTouchStart={
									responsive.touch.isTouchDevice
										? swipeHandlers.onTouchStart
										: undefined
								}
								onTouchMove={
									responsive.touch.isTouchDevice
										? swipeHandlers.onTouchMove
										: undefined
								}
								onTouchEnd={
									responsive.touch.isTouchDevice
										? swipeHandlers.onTouchEnd
										: undefined
								}
								aria-live="polite"
							>
								<div
									className={`flex items-center justify-between gap-3 border-b ${HAIRLINE} px-4 py-2.5`}
								>
									<div className="flex min-w-0 items-center gap-2.5">
										<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900" />
										<div className="min-w-0">
											<p className={EYEBROW}>Active</p>
											<h2 className="truncate text-[13px] font-semibold text-neutral-900">
												{
													designExperiments.find(
														(exp) => exp.id === activeExperiment,
													)?.title
												}
											</h2>
										</div>
									</div>
									{responsive.isMobile && experimentIds.length > 1 && (
										<div className="shrink-0 text-right">
											<div
												className={`${TABS} text-[12px] font-semibold text-neutral-900`}
											>
												{currentExperimentIndex + 1} / {experimentIds.length}
											</div>
											<div lang="ja" className={`${EYEBROW} text-neutral-500`}>
												スワイプで切替
											</div>
										</div>
									)}
								</div>
								<div className="p-4">{renderExperiment(activeExperiment)}</div>
							</div>
						)}
					</section>
				</div>
			</main>

			{/* ── Footer (text links, no bordered buttons) ─────────────────── */}
			<footer className={`mt-12 border-t ${HAIRLINE} bg-white`}>
				<div
					className={`${SHELL} flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between`}
				>
					<nav
						aria-label="Design playground navigation"
						className="flex flex-wrap items-center gap-x-5 gap-y-2"
					>
						<FooterLink href="/portfolio/playground/WebGL">
							WebGL Playground
						</FooterLink>
						<FooterLink href="/portfolio">Portfolio</FooterLink>
						<FooterLink href="/tools">Tools</FooterLink>
					</nav>
					<p className={EYEBROW}>© 2026 samuido · Design Playground</p>
				</div>
			</footer>
		</div>
	);
}

// ─── Internal primitives (Linear-style density) ───────────────────────

/** Hairline stat block in header — `FPS · 60` style. */
function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-col items-end leading-none">
			<span className={EYEBROW}>{label}</span>
			<span className={`${TABS} mt-1 text-[13px] font-medium text-neutral-900`}>
				{value}
			</span>
		</div>
	);
}

/** Compact definition-list cell inside device-settings. */
function Cell({ term, detail }: { term: string; detail: string }) {
	return (
		<div className="flex flex-col bg-white px-2.5 py-1.5">
			<dt className={EYEBROW}>{term}</dt>
			<dd className={`${TABS} mt-0.5 text-[12px] font-medium text-neutral-900`}>
				{detail}
			</dd>
		</div>
	);
}

/** Single metric tile inside performance monitor — tabular-nums value. */
function Metric({ value, label }: { value: string; label: string }) {
	return (
		<div className="flex flex-col items-center justify-center bg-white px-2 py-2.5 text-center">
			<span
				className={`${TABS} text-[15px] font-semibold leading-none text-neutral-900`}
			>
				{value}
			</span>
			<span className={`${EYEBROW} mt-1 text-neutral-500`}>{label}</span>
		</div>
	);
}

/** Footer link: subdued text, chevron shifts on hover (Linear-style). */
function FooterLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="group inline-flex items-center gap-1 text-[12px] text-neutral-500 transition-colors duration-150 hover:text-neutral-900"
		>
			<span>{children}</span>
			<span
				aria-hidden
				className="-translate-x-0.5 text-neutral-300 transition-all duration-150 group-hover:translate-x-0 group-hover:text-neutral-600"
			>
				→
			</span>
		</Link>
	);
}
