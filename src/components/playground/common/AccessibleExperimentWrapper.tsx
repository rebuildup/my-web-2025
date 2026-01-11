/**
 * Accessible experiment wrapper component
 * Task 2.2: アクセシビリティ対応 - WCAG 2.1 AA準拠
 */

"use client";

import { AlertCircle, Info, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccessibility, useFocusManagement } from "@/hooks/useAccessibility";
import type { ExperimentItem } from "@/types/playground";

interface AccessibleExperimentWrapperProps {
	experiment: ExperimentItem;
	isActive: boolean;
	children: React.ReactNode;
	onToggle?: () => void;
	onReset?: () => void;
	className?: string;
}

export const AccessibleExperimentWrapper: React.FC<
	AccessibleExperimentWrapperProps
> = ({ experiment, isActive, children, onToggle, onReset, className = "" }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { state: accessibilityState, announce } = useAccessibility();
	const { enableFocusTrap, disableFocusTrap } =
		useFocusManagement(containerRef);

	const [isPlaying, setIsPlaying] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");

	// Announce experiment state changes
	useEffect(() => {
		if (isActive) {
			announce(`実験 ${experiment.title} がアクティブになりました`, "polite");
			if (accessibilityState.keyboardNavigation) {
				enableFocusTrap();
			}
		} else {
			disableFocusTrap();
		}
	}, [
		isActive,
		experiment.title,
		announce,
		accessibilityState.keyboardNavigation,
		enableFocusTrap,
		disableFocusTrap,
	]);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isActive) return;

			switch (e.key) {
				case " ": // Space bar
					e.preventDefault();
					if (experiment.interactive) {
						setIsPlaying((prev) => !prev);
						announce(
							isPlaying ? "実験を一時停止しました" : "実験を開始しました",
							"polite",
						);
					}
					break;
				case "r":
				case "R":
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						onReset?.();
						announce("実験をリセットしました", "polite");
					}
					break;
				case "Escape":
					onToggle?.();
					announce("実験を終了しました", "polite");
					break;
			}
		},
		[isActive, experiment.interactive, isPlaying, onReset, onToggle, announce],
	);

	useEffect(() => {
		if (isActive) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [isActive, handleKeyDown]);

	// Error handling
	const handleError = useCallback(
		(error: Error) => {
			setHasError(true);
			setErrorMessage(error.message);
			announce(`実験でエラーが発生しました: ${error.message}`, "assertive");
		},
		[announce],
	);

	// Get ARIA attributes based on experiment type
	const getAriaAttributes = () => {
		const baseAttributes = {
			role: experiment.interactive ? "application" : "img",
			"aria-label": `${experiment.title} - ${experiment.description}`,
			"aria-describedby": `experiment-${experiment.id}-description`,
		};

		if (experiment.interactive) {
			return {
				...baseAttributes,
				"aria-live": "polite" as const,
				"aria-atomic": false,
				"aria-busy": isPlaying,
			};
		}

		return baseAttributes;
	};

	// Get control button classes with proper contrast
	const getControlButtonClasses = (
		variant: "primary" | "secondary" = "secondary",
	) => {
		const baseClasses = `
      inline-flex items-center px-3 py-2 text-sm font-medium rounded
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base
      transition-colors duration-200
    `;

		if (variant === "primary") {
			return `${baseClasses} bg-accent text-main hover:bg-accent/80 focus:ring-accent`;
		}

		return `${baseClasses} border border-main text-main hover:bg-main hover:text-base focus:ring-main`;
	};

	return (
		<div
			ref={containerRef}
			className={`relative ${className}`}
			{...getAriaAttributes()}
		>
			{/* Skip link for keyboard users */}
			{accessibilityState.keyboardNavigation && isActive && (
				<a
					href={`#experiment-${experiment.id}-content`}
					className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-accent text-main px-4 py-2 text-sm font-medium"
				>
					実験コンテンツにスキップ
				</a>
			)}

			{/* Experiment header with controls */}
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="zen-kaku-gothic-new text-lg text-main">
						{experiment.title}
					</h3>
					<p
						id={`experiment-${experiment.id}-description`}
						className="noto-sans-jp-light text-sm text-main mt-1"
					>
						{experiment.description}
					</p>
				</div>

				{/* Control buttons */}
				{isActive && (
					<div className="flex items-center space-x-2">
						{experiment.interactive && (
							<button
								type="button"
								onClick={() => {
									setIsPlaying((prev) => !prev);
									announce(
										isPlaying ? "実験を一時停止しました" : "実験を開始しました",
										"polite",
									);
								}}
								className={getControlButtonClasses("primary")}
								aria-label={isPlaying ? "実験を一時停止" : "実験を開始"}
								aria-pressed={isPlaying}
							>
								{isPlaying ? (
									<Pause className="w-4 h-4 mr-1" aria-hidden="true" />
								) : (
									<Play className="w-4 h-4 mr-1" aria-hidden="true" />
								)}
								{isPlaying ? "一時停止" : "開始"}
							</button>
						)}

						<button
							type="button"
							onClick={() => {
								onReset?.();
								announce("実験をリセットしました", "polite");
							}}
							className={getControlButtonClasses()}
							aria-label="実験をリセット"
						>
							<RotateCcw className="w-4 h-4 mr-1" aria-hidden="true" />
							リセット
						</button>
					</div>
				)}
			</div>

			{/* Error display */}
			{hasError && (
				<div
					className="flex items-center p-3 mb-4 bg-red-50 border border-red-200 rounded"
					role="alert"
					aria-live="assertive"
				>
					<AlertCircle
						className="w-5 h-5 text-red-600 mr-2"
						aria-hidden="true"
					/>
					<div>
						<h4 className="text-sm font-medium text-red-800">実験エラー</h4>
						<p className="text-sm text-red-700 mt-1">{errorMessage}</p>
					</div>
				</div>
			)}

			{/* Accessibility information */}
			{accessibilityState.isScreenReaderActive && isActive && (
				<div className="sr-only" aria-live="polite">
					<p>
						現在の実験: {experiment.title}. カテゴリ: {experiment.category}.
						難易度: {experiment.difficulty}.
						{experiment.interactive &&
							"スペースキーで開始・一時停止、Rキーでリセット、Escapeキーで終了できます."}
					</p>
				</div>
			)}

			{/* Keyboard shortcuts help */}
			{accessibilityState.keyboardNavigation && isActive && (
				<div className="mb-4 p-3 bg-base border border-main rounded">
					<div className="flex items-center mb-2">
						<Info className="w-4 h-4 mr-2" aria-hidden="true" />
						<h4 className="text-sm font-medium">キーボードショートカット</h4>
					</div>
					<ul className="text-xs text-main space-y-1">
						{experiment.interactive && (
							<li>
								<kbd className="px-1 py-0.5 bg-main text-base rounded text-xs">
									Space
								</kbd>{" "}
								開始・一時停止
							</li>
						)}
						<li>
							<kbd className="px-1 py-0.5 bg-main text-base rounded text-xs">
								Ctrl+R
							</kbd>{" "}
							リセット
						</li>
						<li>
							<kbd className="px-1 py-0.5 bg-main text-base rounded text-xs">
								Esc
							</kbd>{" "}
							終了
						</li>
						<li>
							<kbd className="px-1 py-0.5 bg-main text-base rounded text-xs">
								Tab
							</kbd>{" "}
							フォーカス移動
						</li>
					</ul>
				</div>
			)}

			{/* Reduced motion warning */}
			{accessibilityState.prefersReducedMotion &&
				experiment.category === "animation" && (
					<div
						className="flex items-center p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded"
						role="note"
					>
						<Info className="w-5 h-5 text-yellow-600 mr-2" aria-hidden="true" />
						<p className="text-sm text-yellow-800">
							アニメーション設定により、動きが制限されています.
						</p>
					</div>
				)}

			{/* Experiment content */}
			<div
				id={`experiment-${experiment.id}-content`}
				className="relative"
				tabIndex={isActive ? 0 : -1}
				onError={() => handleError(new Error("実験の読み込みに失敗しました"))}
			>
				{children}
			</div>

			{/* Focus indicator for keyboard navigation */}
			{accessibilityState.focusVisible && (
				<style jsx>{`
          div:focus {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
          }
        `}</style>
			)}

			{/* Live region for announcements */}
			<div
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
				id={`experiment-${experiment.id}-announcements`}
			/>
		</div>
	);
};
