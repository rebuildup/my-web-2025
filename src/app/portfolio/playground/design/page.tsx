/**
 * Design Playground Page — Linear-style polish v4 (2026-09-11)
 *
 * Major direction changes from v3 based on product feedback:
 *   * Colors: stone-50/100 base, blue accent, never pure-neutral wireframe.
 *   * Missing sections added: hero (display + CTA), performance strip (always
 *     visible), Shortcuts & commands grid, Resources block.
 *   * Typography hierarchy: display (neue-haas-grotesk-display, 4xl/5xl) >
 *     section (2xl) > body (sm) > label (mono xs).
 *   * Spacing discipline: NO bordered card wrappers around content sections.
 *     Padding only on interactive surfaces (input / button / chip).
 *     Region separation = bg contrast + vertical rhythm, not borders.
 *   * Card layout: only the experiment grid cells are tiles. Everything else
 *     is heading + body in the grid.
 *   * Animation: replaced animate-pulse / animate-ping on the status dot with
 *     custom cubic-bezier keyframes. All hover transitions are 200ms ease-out.
 *
 * Skill application: layout-system § 4 Nesting, § 5 Application/Tool density,
 * typesetting § 7 semantic tokens, responsive-design § 6 continuous,
 * accessibility-audit § 5 native semantics.
 */

"use client";

import { ArrowRight, CircleDot, Command, Sparkles } from "lucide-react";
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

// ─── Page-shell constants ───────────────────────────────────────────────────

// Reusable container.
const SHELL = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

// Vertical rhythm between sections.
const SECTION_GAP = "space-y-12 lg:space-y-16";

// Horizontal rule (border-b only, no full card border).
const HAIRLINE = "border-stone-200/80";

// Mono caps label primitive.
const EYEBROW_SM =
	"font-mono text-[11px] uppercase tracking-[0.08em] text-stone-500";
const EYEBROW_ACCENT =
	"font-mono text-[11px] uppercase tracking-[0.08em] text-blue-600";

// Tabular nums primitive.
const TABS = "tabular-nums";

// Status dot keyframes (replace animate-pulse/ping entirely).
// Single ring with smooth scale + opacity fade.
const DOT_STYLE = `
@keyframes ripple {
  0%   { transform: scale(0.7); opacity: 0.6; }
  100% { transform: scale(1.8); opacity: 0;   }
}
.dot-static {
  position: relative;
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: rgb(16 185 129);
}
.dot-static::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: rgb(16 185 129 / 0.4);
  animation: ripple 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  transform-origin: center;
}
`;

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
				<div className="flex aspect-video items-center justify-center">
					<div className="text-center">
						<div className="text-sm font-semibold text-stone-900">
							Loading error
						</div>
						<p className="mt-1 text-xs text-stone-500">
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
			<div className="flex min-h-screen items-center justify-center bg-stone-50">
				<div className="flex flex-col items-center gap-3">
					<div className="h-7 w-32 overflow-hidden rounded-full bg-stone-200/60">
						<div className="h-full w-1/2 animate-[shimmer_1.6s_ease-in-out_infinite] rounded-full bg-stone-300/80" />
					</div>
					<p className={EYEBROW_SM}>Detecting device capabilities</p>
				</div>
			</div>
		);
	}

	// ─── Layout ──────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
			<style dangerouslySetInnerHTML={{ __html: DOT_STYLE }} />

			{/* ── Region 1: Top nav (sticky) ──────────────────────────── */}
			<header
				className={`sticky top-0 z-30 border-b ${HAIRLINE} bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70`}
			>
				<div
					className={`${SHELL} flex h-14 items-center justify-between gap-4`}
				>
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
					<div className="flex items-center gap-3">
						<span
							className={`${EYEBROW_SM} hidden items-center gap-1.5 sm:inline-flex`}
						>
							<span className="dot-static" aria-hidden />
							<span className="capitalize tracking-normal text-stone-700">
								{deviceCapabilities.performanceLevel} · ready
							</span>
						</span>
						<button
							type="button"
							className="hidden items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2 py-1 text-[12px] text-stone-500 transition-colors duration-200 ease-out hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700 sm:inline-flex"
							aria-label="Open command palette"
						>
							<Command className="h-3 w-3" aria-hidden />
							<span className="font-mono">⌘K</span>
						</button>
						<div
							className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 ring-2 ring-white"
							aria-hidden
						/>
					</div>
				</div>
			</header>

			{/* ── Region 2: Hero (display title + CTAs) ─────────────────── */}
			<section className="bg-stone-50">
				<div className={`${SHELL} py-12 lg:py-20`}>
					<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
						<div className="lg:col-span-7">
							<p className={EYEBROW_ACCENT}>Playground · 2026</p>
							<h1 className="neue-haas-grotesk-display mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.025em] text-stone-900 sm:text-5xl lg:text-[3.5rem]">
								Design{" "}
								<span className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
									Playground
								</span>
							</h1>
							<p
								lang="ja"
								className="noto-sans-jp-light mt-6 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-[17px]"
							>
								インタラクティブなデザイン実験とアニメーションの実験場。
								CSS・SVG・Canvas
								を組み合わせた視覚表現を、リアルタイムに更新される
								インタラクションで体験できます。
							</p>
							<div className="mt-8 flex flex-wrap items-center gap-3">
								<button
									type="button"
									onClick={() =>
										setActiveExperiment(filteredExperiments[0]?.id)
									}
									className="group inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-[color,background-color,box-shadow,transform] duration-200 ease-out hover:bg-stone-800 hover:shadow-md active:scale-[0.98]"
								>
									<Sparkles className="h-3.5 w-3.5" aria-hidden />
									Launch first experiment
									<ArrowRight
										className="-translate-x-0.5 transition-transform duration-200 ease-out group-hover:translate-x-0"
										aria-hidden
									/>
								</button>
								<Link
									href="#all-experiments"
									className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-[13px] font-medium text-stone-700 transition-[color,background-color,border-color,transform] duration-200 ease-out hover:border-stone-400 hover:bg-stone-50 active:scale-[0.98]"
								>
									Browse library
								</Link>
							</div>
						</div>

						{/* Right column: device + capability summary as 4-up grid */}
						<div className="lg:col-span-5">
							<div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200">
								<CapabilityCell
									term="Performance"
									detail={deviceCapabilities.performanceLevel}
									accent
								/>
								<CapabilityCell
									term="Touch"
									detail={deviceCapabilities.touchSupport ? "Yes" : "No"}
								/>
								<CapabilityCell
									term="Pixel ratio"
									detail={`${deviceCapabilities.devicePixelRatio}×`}
								/>
								<CapabilityCell
									term="CPU threads"
									detail={`${deviceCapabilities.hardwareConcurrency}`}
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Region 3: Performance strip (always visible) ─────────── */}
			<section
				className={`border-y ${HAIRLINE} bg-white`}
				aria-labelledby="performance-heading"
			>
				<div
					className={`${SHELL} flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between`}
				>
					<h2 id="performance-heading" className="sr-only">
						Runtime performance metrics
					</h2>
					<div className="flex items-center gap-6 overflow-x-auto">
						<Metric
							label="FPS"
							value={
								performanceMetrics.fps === 0
									? "—"
									: performanceMetrics.fps.toString()
							}
						/>
						<Metric
							label="Frame"
							value={
								performanceMetrics.frameTime === 0
									? "—"
									: `${performanceMetrics.frameTime.toFixed(1)} ms`
							}
						/>
						<Metric
							label="Memory"
							value={
								performanceMetrics.memoryUsage === 0
									? "—"
									: `${performanceMetrics.memoryUsage} MB`
							}
						/>
						<Metric
							label="Threads"
							value={`${deviceCapabilities.hardwareConcurrency}`}
						/>
					</div>
					<div className="flex shrink-0 items-center gap-3">
						<span className={EYEBROW_SM}>Quality</span>
						<select
							value={performanceSettings.qualityLevel}
							onChange={(e) =>
								setPerformanceSettings((prev) => ({
									...prev,
									qualityLevel: e.target
										.value as PerformanceSettings["qualityLevel"],
								}))
							}
							className="appearance-none rounded-md border border-stone-300 bg-white px-2.5 py-1 text-[12px] font-medium text-stone-700 transition-colors duration-200 ease-out hover:border-stone-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
							data-testid="quality-select"
						>
							<option value="low">Low · 30 fps</option>
							<option value="medium">Medium · 60 fps</option>
							<option value="high">High · 60+ fps</option>
						</select>
					</div>
				</div>
			</section>

			{/* ── Region 4: Filter bar (sticky) ───────────────────────── */}
			<div
				className={`sticky top-14 z-20 border-b ${HAIRLINE} bg-stone-50/85 backdrop-blur supports-[backdrop-filter]:bg-stone-50/70`}
			>
				<div className={`${SHELL} py-3`}>
					<div className="flex items-center gap-4">
						<span
							className={`flex shrink-0 items-center gap-1.5 ${EYEBROW_SM}`}
						>
							<CircleDot className="h-3 w-3 text-blue-600" aria-hidden />
							Filter
						</span>
						<div className="flex-1 overflow-hidden">
							<ResponsiveFilterBar
								filter={filter}
								onFilterChange={setFilter}
								availableCategories={availableCategories}
								availableTechnologies={availableTechnologies}
							/>
						</div>
						<span
							className={`shrink-0 font-mono text-[11px] ${TABS} tracking-tight text-stone-500`}
						>
							<span className="font-semibold text-stone-900">
								{filteredExperiments.length}
							</span>
							<span className="mx-1 text-stone-300">/</span>
							{designExperiments.length}
						</span>
					</div>
				</div>
			</div>

			{/* ── Region 5: Main (12-col: rail 3 / canvas 9) ──────────── */}
			<main
				aria-label="Design playground"
				className={`${SHELL} py-12 lg:py-16`}
			>
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
					{/* Left rail — filter sections (no card wrapper) */}
					<aside className="lg:col-span-3 lg:sticky lg:top-32 lg:self-start">
						<div className={SECTION_GAP}>
							<FilterRailSection
								title="Difficulty"
								options={["beginner", "intermediate", "advanced"].map((d) => ({
									label: d,
									value: d,
									count: designExperiments.filter((x) => x.difficulty === d)
										.length,
								}))}
								active={filter.difficulty}
								onSelect={(v) =>
									setFilter((f) => ({
										...f,
										difficulty: f.difficulty === v ? undefined : (v as never),
									}))
								}
							/>
							<FilterRailSection
								title="Technology"
								options={availableTechnologies.slice(0, 6).map((t) => ({
									label: t,
									value: t,
									count: designExperiments.filter((x) =>
										x.technology.includes(t),
									).length,
								}))}
								active={filter.technology}
								onSelect={(v) =>
									setFilter((f) => ({
										...f,
										technology: f.technology === v ? undefined : (v as never),
									}))
								}
							/>
							<FilterRailSection
								title="Interactive"
								options={[
									{
										label: "Yes",
										value: "true",
										count: designExperiments.filter((x) => x.interactive)
											.length,
									},
									{
										label: "No",
										value: "false",
										count: designExperiments.filter((x) => !x.interactive)
											.length,
									},
								]}
								active={
									filter.interactive === undefined
										? undefined
										: filter.interactive
											? "true"
											: "false"
								}
								onSelect={(v) =>
									setFilter((f) => ({
										...f,
										interactive: v === undefined ? undefined : v === "true",
									}))
								}
							/>
						</div>
					</aside>

					{/* Canvas — heading + body only, no card */}
					<section className="lg:col-span-9">
						<div className={SECTION_GAP}>
							{/* 5.1 — Featured (auto-selects the first interactive one) */}
							{filteredExperiments.length > 0 && (
								<section id="featured" aria-labelledby="featured-heading">
									<div className="flex items-end justify-between gap-4">
										<div>
											<p className={EYEBROW_ACCENT}>Featured</p>
											<h2
												id="featured-heading"
												className="mt-2 text-2xl font-semibold tracking-tight text-stone-900"
											>
												{featuredTitle(filteredExperiments)}
											</h2>
										</div>
										<Link
											href="#all-experiments"
											className="group shrink-0 text-[13px] text-stone-500 transition-colors duration-200 ease-out hover:text-stone-900"
										>
											Skip to library{" "}
											<span
												className="ml-1 inline-block transition-transform duration-200 ease-out group-hover:translate-x-0.5"
												aria-hidden
											>
												→
											</span>
										</Link>
									</div>
									<FeaturedTile
										experiment={filteredExperiments[0]}
										onSelect={() =>
											setActiveExperiment(filteredExperiments[0].id)
										}
										isActive={activeExperiment === filteredExperiments[0].id}
									/>
								</section>
							)}

							{/* 5.2 — All experiments (component owns its own heading) */}
							<section id="all-experiments">
								<ResponsiveExperimentGrid
									experiments={filteredExperiments}
									activeExperiment={activeExperiment}
									onExperimentSelect={(experimentId) => {
										setActiveExperiment(experimentId);
										setExperimentError(null);
									}}
								/>
							</section>

							{/* 5.3 — Shortcuts (NEW section, addresses v4 gap) */}
							<section aria-labelledby="shortcuts-heading">
								<div className="flex items-end justify-between gap-4">
									<div>
										<p className={EYEBROW_SM}>Reference</p>
										<h2
											id="shortcuts-heading"
											className="mt-2 text-2xl font-semibold tracking-tight text-stone-900"
										>
											Shortcuts &amp; commands
										</h2>
									</div>
								</div>
								<dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
									<ShortcutRow keys={["↑", "↓"]} label="Navigate experiments" />
									<ShortcutRow keys={["Enter"]} label="Open experiment" />
									<ShortcutRow keys={["Esc"]} label="Close active panel" />
									<ShortcutRow keys={["⌘", "K"]} label="Command palette" />
									<ShortcutRow keys={["⌘", "/"]} label="Show shortcuts" />
									<ShortcutRow keys={["Q"]} label="Toggle quality preset" />
								</dl>
							</section>

							{experimentError && (
								<div
									className="flex items-start gap-3 rounded-md border border-red-200/80 bg-red-50/70 px-4 py-3 text-[13px] text-red-900"
									role="alert"
								>
									<div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
									<div className="flex-1">
										<p>{experimentError}</p>
										<button
											type="button"
											onClick={() => setExperimentError(null)}
											className={`${EYEBROW_SM} mt-1 text-red-700 hover:text-red-900`}
										>
											Dismiss
										</button>
									</div>
								</div>
							)}

							{/* 5.4 — Active experiment: no card border; bg contrast only */}
							{activeExperiment && (
								<section aria-labelledby="active-heading">
									<div className="flex items-end justify-between gap-4">
										<div>
											<p className={EYEBROW_ACCENT}>Active</p>
											<h2
												id="active-heading"
												className="mt-2 text-2xl font-semibold tracking-tight text-stone-900"
											>
												{
													designExperiments.find(
														(exp) => exp.id === activeExperiment,
													)?.title
												}
											</h2>
										</div>
										{responsive.isMobile && experimentIds.length > 1 && (
											<div className="shrink-0 text-right">
												<div
													className={`${TABS} font-mono text-[13px] font-semibold text-stone-900`}
												>
													{currentExperimentIndex + 1} / {experimentIds.length}
												</div>
												<div
													lang="ja"
													className={`${EYEBROW_SM} text-stone-400`}
												>
													スワイプで切替
												</div>
											</div>
										)}
									</div>
									{/* Experiment surface — bg-100 differentiates from bg-50 page */}
									<div
										className="mt-6 rounded-lg bg-stone-100 p-6"
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
										{renderExperiment(activeExperiment)}
									</div>
								</section>
							)}

							{/* 5.5 — Resources block */}
							<section aria-labelledby="resources-heading">
								<div className="flex items-end justify-between gap-4">
									<div>
										<p className={EYEBROW_SM}>Resources</p>
										<h2
											id="resources-heading"
											className="mt-2 text-2xl font-semibold tracking-tight text-stone-900"
										>
											More from this surface
										</h2>
									</div>
								</div>
								<ul className="mt-6 list-none grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-3">
									<ResourceItem
										href="/portfolio/playground/WebGL"
										title="WebGL Playground"
										note="Shader &amp; GPU"
									/>
									<ResourceItem
										href="/portfolio"
										title="Portfolio home"
										note="Selected projects"
									/>
									<ResourceItem
										href="/tools"
										title="Tools"
										note="Utilities &amp; generators"
									/>
								</ul>
							</section>
						</div>
					</section>
				</div>
			</main>

			{/* ── Region 6: Footer ─────────────────────────────────────── */}
			<footer className={`border-t ${HAIRLINE} bg-white`}>
				<div
					className={`${SHELL} flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between`}
				>
					<nav
						aria-label="Design playground navigation"
						className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-stone-500"
					>
						<FooterLink href="/portfolio/playground/WebGL">
							WebGL Playground
						</FooterLink>
						<FooterLink href="/portfolio">Portfolio</FooterLink>
						<FooterLink href="/tools">Tools</FooterLink>
					</nav>
					<p className={EYEBROW_SM}>© 2026 samuido · Design Playground</p>
				</div>
			</footer>
		</div>
	);
}

// ─── Helper functions ─────────────────────────────────────────────────────

function featuredTitle<T extends { title: string }>(items: T[]): string {
	const interactive = items.find((x) => "interactive" in x && x.interactive);
	return interactive?.title ?? "Featured experiment";
}

// ─── Primitives (no card wrappers, only surface affordances) ──────────────

/** Compact definition-list cell. Borderless — uses parent bg-stone-200 grid pattern. */
function CapabilityCell({
	term,
	detail,
	accent,
}: {
	term: string;
	detail: string;
	accent?: boolean;
}) {
	return (
		<div className="flex flex-col gap-0.5 bg-white px-3.5 py-2.5">
			<dt className={EYEBROW_SM}>{term}</dt>
			<dd
				className={`${TABS} font-mono text-[13px] font-medium ${
					accent ? "capitalize text-blue-700" : "text-stone-900"
				}`}
			>
				{detail}
			</dd>
		</div>
	);
}

/** Performance strip item — just text. */
function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex shrink-0 flex-col leading-none">
			<span className={EYEBROW_SM}>{label}</span>
			<span
				className={`${TABS} font-mono mt-1 text-[15px] font-semibold text-stone-900`}
			>
				{value}
			</span>
		</div>
	);
}

/** Left-rail filter section. NO card border — heading + chip row only. */
function FilterRailSection({
	title,
	options,
	active,
	onSelect,
}: {
	title: string;
	options: Array<{ label: string; value: string; count: number }>;
	active: string | undefined;
	onSelect: (value: string | undefined) => void;
}) {
	return (
		<div>
			<h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-stone-500">
				{title}
			</h3>
			<ul className="mt-3 list-none space-y-1">
				{options.map((opt) => (
					<li key={opt.value}>
						<button
							type="button"
							onClick={() =>
								onSelect(active === opt.value ? undefined : opt.value)
							}
							className={`group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors duration-200 ease-out ${
								active === opt.value
									? "bg-blue-50 text-blue-700"
									: "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
							}`}
							aria-pressed={active === opt.value}
						>
							<span
								className={`truncate ${active === opt.value ? "font-medium" : ""}`}
							>
								{opt.label}
							</span>
							<span
								className={`${TABS} font-mono text-[11px] ${
									active === opt.value ? "text-blue-500" : "text-stone-400"
								}`}
							>
								{opt.count}
							</span>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Featured experiment tile — single, large, clickable. */
function FeaturedTile({
	experiment,
	onSelect,
	isActive,
}: {
	experiment: (typeof designExperiments)[number];
	onSelect: () => void;
	isActive: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={`group mt-6 flex w-full items-stretch gap-0 overflow-hidden rounded-lg border bg-white text-left transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg ${
				isActive
					? "border-blue-600 shadow-md ring-1 ring-blue-600/20"
					: "border-stone-200 hover:border-stone-300"
			}`}
		>
			<div className="flex flex-1 flex-col gap-3 p-6">
				<div className="flex items-center gap-2">
					<span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-blue-700">
						{experiment.category}
					</span>
					<span className={EYEBROW_SM}>{experiment.difficulty}</span>
				</div>
				<h3 className="text-xl font-semibold tracking-tight text-stone-900">
					{experiment.title}
				</h3>
				<p
					lang="ja"
					className="noto-sans-jp-light text-sm leading-relaxed text-stone-600 line-clamp-2"
				>
					{experiment.description}
				</p>
				<div className="mt-auto flex items-center justify-between">
					<span className={EYEBROW_SM}>
						{experiment.technology.join(" · ")}
					</span>
					<span className="inline-flex items-center gap-1 text-[13px] font-medium text-blue-600 transition-transform duration-200 ease-out group-hover:translate-x-0.5">
						{isActive ? "Running" : "Launch"}{" "}
						<ArrowRight className="h-3.5 w-3.5" aria-hidden />
					</span>
				</div>
			</div>
			{/* Right preview placeholder */}
			<div className="hidden w-64 shrink-0 items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 lg:flex">
				<div className="text-[11px] font-medium uppercase tracking-wider text-blue-700/60">
					Preview
				</div>
			</div>
		</button>
	);
}

/** Shortcut key + label row. Borderless; just text. */
function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
	return (
		<div className="flex items-center justify-between gap-4 border-b border-stone-200/60 py-2.5">
			<dt className="text-[13px] text-stone-700">{label}</dt>
			<dd className="flex shrink-0 items-center gap-1">
				{keys.map((k) => (
					<kbd
						key={k}
						className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-stone-200 bg-white px-1.5 font-mono text-[11px] text-stone-600 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
					>
						{k}
					</kbd>
				))}
			</dd>
		</div>
	);
}

/** Footer resource item. Borderless; gap-px parent grid separates. */
function ResourceItem({
	href,
	title,
	note,
}: {
	href: string;
	title: string;
	note: string;
}) {
	return (
		<li className="bg-white">
			<Link
				href={href}
				className="group flex items-center justify-between gap-4 px-5 py-5 transition-colors duration-200 ease-out hover:bg-stone-50"
			>
				<div>
					<div className="text-[14px] font-medium text-stone-900">{title}</div>
					<div
						className="mt-0.5 text-[12px] text-stone-500"
						dangerouslySetInnerHTML={{ __html: note }}
					/>
				</div>
				<ArrowRight
					className="h-4 w-4 -translate-x-1 text-stone-300 transition-[transform,color] duration-200 ease-out group-hover:translate-x-0 group-hover:text-stone-700"
					aria-hidden
				/>
			</Link>
		</li>
	);
}

/** Footer text link. Subtle hover + chevron shift. */
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
			className="group inline-flex items-center gap-1 transition-colors duration-200 ease-out hover:text-stone-900"
		>
			<span>{children}</span>
			<span
				aria-hidden
				className="-translate-x-0.5 text-stone-300 transition-[transform,color] duration-200 ease-out group-hover:translate-x-0 group-hover:text-stone-700"
			>
				→
			</span>
		</Link>
	);
}
