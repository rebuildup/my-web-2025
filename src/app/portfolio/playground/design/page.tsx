/**
 * Design Playground Page — 12-col CSS Grid rewrite (2026-09-10)
 * Skill application: layout-system § 4 Nesting + § 5 Application/Tool,
 * typesetting § 9 responsive transformation, responsive-design § 9 verify,
 * accessibility-audit § 5 semantic. See .tmp/design-brief-design-playground.md.
 */

"use client";

import { ChevronDown, ChevronUp, Monitor, Settings } from "lucide-react";
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

const GRID = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

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
				<div className="flex aspect-video items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50">
					<div className="text-center">
						<div className="text-lg font-semibold">⚠️ Loading Error</div>
						<p className="mt-1 text-sm text-neutral-600">
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
				<div className="text-center">
					<div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
					<p lang="ja" className="text-sm text-neutral-600">
						デバイス性能を検出中...
					</p>
				</div>
			</div>
		);
	}

	// ─── Layout ──────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-neutral-50 text-neutral-900">
			{/* ── Header (full-width top bar) ─────────────────────────── */}
			<header className="border-b-2 border-neutral-900 bg-white">
				<div className={`${GRID} py-6 sm:py-8`}>
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

					<div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
								Playground
							</p>
							<h1
								className="font-semibold leading-[1.05] tracking-tight text-[clamp(2rem,1.5rem+2.5vw,3.5rem)]"
								aria-level={1}
							>
								Design Playground
							</h1>
							<h2 className="sr-only" aria-level={2}>
								Interactive design experiments
							</h2>
						</div>
						<p
							lang="ja"
							className="max-w-md text-sm leading-relaxed text-neutral-600"
						>
							インタラクティブなデザイン実験とアニメーションの実験場.
							CSS、SVG、Canvas
							を使った視覚的表現とリアルタイム更新機能を体験できます.
						</p>
					</div>
				</div>
			</header>

			{/* ── Filter bar (sticky toolbar) ───────────────────────── */}
			<div className="sticky top-0 z-20 border-b border-neutral-200 bg-stone-50/95 backdrop-blur">
				<div className={`${GRID} py-4`}>
					<div className="mb-3 flex items-baseline justify-between gap-3">
						<div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-700">
							<span className="inline-block h-2 w-2 bg-neutral-900" />
							Filter
						</div>
						<div className="text-xs text-neutral-500">
							{filteredExperiments.length} / {designExperiments.length} 件
						</div>
					</div>
					<ResponsiveFilterBar
						filter={filter}
						onFilterChange={setFilter}
						availableCategories={availableCategories}
						availableTechnologies={availableTechnologies}
					/>
				</div>
			</div>

			{/* ── Main canvas (12-col grid: sidebar 3 + canvas 9) ── */}
			<main aria-label="Design playground" className={`${GRID} py-8 sm:py-10`}>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
					{/* Sidebar: settings + performance */}
					<aside className="space-y-6 lg:sticky lg:top-28 lg:col-span-3 lg:self-start">
						{/* Settings card */}
						<section className="rounded-md border border-neutral-300 bg-white">
							<button
								type="button"
								onClick={() => setShowSettings(!showSettings)}
								className="flex w-full items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
								aria-expanded={showSettings}
								aria-controls="device-settings-panel"
							>
								<h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-800">
									<Settings className="h-4 w-4" aria-hidden />
									Device &amp; Settings
								</h3>
								{showSettings ? (
									<ChevronUp className="h-4 w-4 text-neutral-500" aria-hidden />
								) : (
									<ChevronDown
										className="h-4 w-4 text-neutral-500"
										aria-hidden
									/>
								)}
							</button>

							{showSettings && (
								<div
									id="device-settings-panel"
									className="space-y-4 p-4 text-sm"
								>
									<dl className="grid grid-cols-2 gap-3 text-xs">
										<div className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5">
											<dt className="text-neutral-500">Performance</dt>
											<dd className="font-semibold text-neutral-900">
												{deviceCapabilities.performanceLevel}
											</dd>
										</div>
										<div className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5">
											<dt className="text-neutral-500">Touch</dt>
											<dd className="font-semibold text-neutral-900">
												{deviceCapabilities.touchSupport ? "Yes" : "No"}
											</dd>
										</div>
										<div className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5">
											<dt className="text-neutral-500">DPR</dt>
											<dd className="font-semibold text-neutral-900">
												{deviceCapabilities.devicePixelRatio}x
											</dd>
										</div>
										<div className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5">
											<dt className="text-neutral-500">CPU</dt>
											<dd className="font-semibold text-neutral-900">
												{deviceCapabilities.hardwareConcurrency} cores
											</dd>
										</div>
									</dl>

									<div className="space-y-1.5">
										<label
											htmlFor="qualityLevel"
											className="block text-xs font-semibold uppercase tracking-wider text-neutral-600"
										>
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
											className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
											data-testid="quality-select"
										>
											<option value="low">Low (30 FPS)</option>
											<option value="medium">Medium (60 FPS)</option>
											<option value="high">High (60+ FPS)</option>
										</select>
									</div>

									<label className="flex items-center gap-2 text-sm">
										<input
											type="checkbox"
											checked={performanceSettings.enableOptimizations}
											onChange={(e) =>
												setPerformanceSettings((prev) => ({
													...prev,
													enableOptimizations: e.target.checked,
												}))
											}
											className="h-4 w-4 rounded border-neutral-400 text-neutral-900 focus:ring-neutral-900"
										/>
										<span>Auto optimize</span>
									</label>
								</div>
							)}
						</section>

						{/* Performance card */}
						<section className="rounded-md border border-neutral-300 bg-white">
							<button
								type="button"
								onClick={() => setShowPerformance(!showPerformance)}
								className="flex w-full items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
								aria-expanded={showPerformance}
								aria-controls="performance-monitor-panel"
							>
								<h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-800">
									<Monitor className="h-4 w-4" aria-hidden />
									Performance
								</h3>
								{showPerformance ? (
									<ChevronUp className="h-4 w-4 text-neutral-500" aria-hidden />
								) : (
									<ChevronDown
										className="h-4 w-4 text-neutral-500"
										aria-hidden
									/>
								)}
							</button>

							{showPerformance && (
								<div
									id="performance-monitor-panel"
									className="grid grid-cols-3 gap-2 p-4 text-center"
								>
									<div className="rounded border border-neutral-200 bg-neutral-50 px-2 py-3">
										<div className="text-2xl font-bold tabular-nums text-neutral-900">
											{performanceMetrics.fps}
										</div>
										<div className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
											FPS
										</div>
									</div>
									<div className="rounded border border-neutral-200 bg-neutral-50 px-2 py-3">
										<div className="text-2xl font-bold tabular-nums text-neutral-900">
											{performanceMetrics.frameTime.toFixed(1)}
										</div>
										<div className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
											ms / frame
										</div>
									</div>
									<div className="rounded border border-neutral-200 bg-neutral-50 px-2 py-3">
										<div className="text-2xl font-bold tabular-nums text-neutral-900">
											{performanceMetrics.memoryUsage}
										</div>
										<div className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
											MB
										</div>
									</div>
								</div>
							)}
						</section>
					</aside>

					{/* Canvas: experiments grid + active viewer */}
					<section className="space-y-10 lg:col-span-9">
						<div className="rounded-md border border-neutral-300 bg-white p-5">
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
							<div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">
								<p>{experimentError}</p>
								<button
									type="button"
									onClick={() => setExperimentError(null)}
									className="mt-2 text-xs font-semibold uppercase tracking-wider text-red-700 underline"
								>
									Dismiss
								</button>
							</div>
						)}

						{activeExperiment && (
							<div
								className="rounded-md border border-neutral-300 bg-white p-5"
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
								<div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
									<div>
										<p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
											Active
										</p>
										<h2 className="text-lg font-semibold tracking-tight text-neutral-900">
											{
												designExperiments.find(
													(exp) => exp.id === activeExperiment,
												)?.title
											}
										</h2>
									</div>
									{responsive.isMobile && experimentIds.length > 1 && (
										<div className="text-right text-xs text-neutral-500">
											<div className="font-semibold tabular-nums text-neutral-900">
												{currentExperimentIndex + 1} / {experimentIds.length}
											</div>
											<div className="mt-0.5 text-[10px] uppercase tracking-wider">
												スワイプで切替
											</div>
										</div>
									)}
								</div>
								{renderExperiment(activeExperiment)}
							</div>
						)}
					</section>
				</div>
			</main>

			{/* ── Footer nav ─────────────────────────────────────────── */}
			<footer className="mt-12 border-t border-neutral-200 bg-white">
				<div className={`${GRID} py-8`}>
					<nav
						aria-label="Design playground navigation"
						className="grid grid-cols-1 gap-3 sm:grid-cols-3"
					>
						<Link
							href="/portfolio/playground/WebGL"
							className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
						>
							WebGL Playground →
						</Link>
						<Link
							href="/portfolio"
							className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
						>
							Portfolio Home →
						</Link>
						<Link
							href="/tools"
							className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
						>
							Tools →
						</Link>
					</nav>
					<p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-neutral-500">
						© 2025 samuido — Design Playground
					</p>
				</div>
			</footer>
		</div>
	);
}
