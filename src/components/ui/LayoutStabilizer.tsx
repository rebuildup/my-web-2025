"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

// Skeleton loader component to prevent layout shifts
interface SkeletonProps {
	width?: string | number;
	height?: string | number;
	className?: string;
	variant?: "text" | "rectangular" | "circular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
	width = "100%",
	height = "1rem",
	className = "",
	variant = "rectangular",
}) => {
	const baseClasses = "animate-pulse bg-gray-200";

	const variantClasses = {
		text: "rounded",
		rectangular: "rounded",
		circular: "rounded-full",
	};

	const style = {
		width: typeof width === "number" ? `${width}px` : width,
		height: typeof height === "number" ? `${height}px` : height,
	};

	return (
		<div
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
			style={style}
			aria-label="Loading..."
		/>
	);
};

// Container that reserves space to prevent layout shifts
interface SpaceReserverProps {
	children: React.ReactNode;
	minHeight?: string | number;
	className?: string;
	loading?: boolean;
	skeleton?: React.ReactNode;
}

export const SpaceReserver: React.FC<SpaceReserverProps> = ({
	children,
	minHeight = "auto",
	className = "",
	loading = false,
	skeleton,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [reservedHeight, setReservedHeight] = useState<string | number>(
		minHeight,
	);

	useEffect(() => {
		if (containerRef.current && !loading) {
			// Measure actual content height and reserve it
			const height = containerRef.current.offsetHeight;
			if (height > 0) {
				setReservedHeight(height);
			}
		}
	}, [loading]);

	const style = {
		minHeight:
			typeof reservedHeight === "number"
				? `${reservedHeight}px`
				: reservedHeight,
	};

	return (
		<div ref={containerRef} className={className} style={style}>
			{loading && skeleton ? skeleton : children}
		</div>
	);
};

// Image component with aspect ratio preservation
interface AspectRatioImageProps {
	src: string;
	alt: string;
	aspectRatio: number; // width / height
	className?: string;
	priority?: boolean;
	onLoad?: () => void;
	onError?: () => void;
}

export const AspectRatioImage: React.FC<AspectRatioImageProps> = ({
	src,
	alt,
	aspectRatio,
	className = "",
	priority = false,
	onLoad,
	onError,
}) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);

	const handleLoad = () => {
		setIsLoaded(true);
		onLoad?.();
	};

	const handleError = () => {
		setHasError(true);
		onError?.();
	};

	return (
		<div
			className={`relative overflow-hidden ${className}`}
			style={{ aspectRatio: aspectRatio.toString() }}
		>
			{!isLoaded && !hasError && (
				<Skeleton
					width="100%"
					height="100%"
					className="absolute inset-0"
					variant="rectangular"
				/>
			)}

			{hasError ? (
				<div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
					<svg
						className="w-8 h-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
			) : (
				<>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={src}
						alt={alt}
						className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
							isLoaded ? "opacity-100" : "opacity-0"
						}`}
						onLoad={handleLoad}
						onError={handleError}
						loading={priority ? "eager" : "lazy"}
					/>
				</>
			)}
		</div>
	);
};

// Font loading optimizer to prevent FOIT/FOUT
interface FontLoaderProps {
	fonts: Array<{
		family: string;
		weight?: string;
		style?: string;
		display?: "auto" | "block" | "swap" | "fallback" | "optional";
	}>;
	children: React.ReactNode;
}

export const FontLoader: React.FC<FontLoaderProps> = ({ fonts, children }) => {
	const [fontsLoaded, setFontsLoaded] = useState(false);

	useEffect(() => {
		const loadFonts = async () => {
			if (!("fonts" in document)) {
				setFontsLoaded(true);
				return;
			}

			try {
				const fontPromises = fonts.map(
					({ family, weight = "400", style = "normal" }) => {
						return document.fonts.load(`${weight} ${style} 16px "${family}"`);
					},
				);

				await Promise.all(fontPromises);
				setFontsLoaded(true);
			} catch (error) {
				console.warn("Font loading failed:", error);
				setFontsLoaded(true); // Continue anyway
			}
		};

		loadFonts();
	}, [fonts]);

	return (
		<div className={fontsLoaded ? "fonts-loaded" : "fonts-loading"}>
			{children}
		</div>
	);
};

// Dynamic content container that prevents layout shifts
interface DynamicContentProps {
	children: React.ReactNode;
	loading: boolean;
	error?: Error | null;
	className?: string;
	minHeight?: string | number;
	errorFallback?: React.ReactNode;
	loadingSkeleton?: React.ReactNode;
}

export const DynamicContent: React.FC<DynamicContentProps> = ({
	children,
	loading,
	error,
	className = "",
	minHeight = 200,
	errorFallback,
	loadingSkeleton,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

	useEffect(() => {
		if (containerRef.current && !loading && !error) {
			const resizeObserver = new ResizeObserver((entries) => {
				const entry = entries[0];
				if (entry) {
					setMeasuredHeight(entry.contentRect.height);
				}
			});

			resizeObserver.observe(containerRef.current);

			return () => {
				resizeObserver.disconnect();
			};
		}
	}, [loading, error]);

	const containerHeight =
		measuredHeight || (typeof minHeight === "number" ? minHeight : undefined);

	const defaultLoadingSkeleton = (
		<div className="space-y-4">
			<Skeleton height={24} width="60%" />
			<Skeleton height={16} width="100%" />
			<Skeleton height={16} width="80%" />
			<Skeleton height={16} width="90%" />
		</div>
	);

	const defaultErrorFallback = (
		<div className="flex items-center justify-center text-gray-500">
			<div className="text-center">
				<svg
					className="w-12 h-12 mx-auto mb-4 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
				<p>コンテンツの読み込みに失敗しました</p>
			</div>
		</div>
	);

	return (
		<div
			ref={containerRef}
			className={className}
			style={{
				minHeight: containerHeight
					? `${containerHeight}px`
					: typeof minHeight === "string"
						? minHeight
						: `${minHeight}px`,
			}}
		>
			{loading && (loadingSkeleton || defaultLoadingSkeleton)}
			{error && (errorFallback || defaultErrorFallback)}
			{!loading && !error && children}
		</div>
	);
};

// Layout shift detector (development only)
export const LayoutShiftDetector: React.FC = () => {
	const [shifts, setShifts] = useState<
		Array<{
			value: number;
			timestamp: number;
			sources: string[];
		}>
	>([]);

	useEffect(() => {
		if (process.env.NODE_ENV !== "development") return;

		let cumulativeScore = 0;

		const observer = new PerformanceObserver((list) => {
			const entries = list.getEntries();

			entries.forEach((entry) => {
				const layoutShiftEntry = entry as PerformanceEntry & {
					value: number;
					hadRecentInput: boolean;
					sources?: Array<{ node?: Element }>;
				};
				if (!layoutShiftEntry.hadRecentInput) {
					cumulativeScore += layoutShiftEntry.value;

					const sources =
						layoutShiftEntry.sources?.map((source) => {
							if (source.node?.tagName) {
								const tagName = source.node.tagName.toLowerCase();
								const className =
									source.node.className &&
									typeof source.node.className === "string"
										? `.${source.node.className.split(" ")[0]}`
										: "";
								const id = source.node.id ? `#${source.node.id}` : "";
								return tagName + className + id;
							}
							return "unknown";
						}) || [];

					setShifts((prev) =>
						[
							...prev,
							{
								value: layoutShiftEntry.value,
								timestamp: Date.now(),
								sources,
							},
						].slice(-10),
					); // Keep only last 10 shifts

					if (layoutShiftEntry.value > 0.1) {
						console.warn("Large layout shift detected:", {
							value: layoutShiftEntry.value,
							cumulativeScore,
							sources,
						});
					}
				}
			});
		});

		observer.observe({ entryTypes: ["layout-shift"] });

		return () => {
			observer.disconnect();
		};
	}, []);

	if (process.env.NODE_ENV !== "development" || shifts.length === 0) {
		return null;
	}

	return (
		<div className="fixed top-4 right-4 bg-red-50 border border-red-400 rounded-lg p-3 text-sm max-w-sm z-50">
			<h4 className="font-semibold text-red-900 mb-2">
				Layout Shifts Detected
			</h4>
			<div className="space-y-1 max-h-32 overflow-y-auto">
				{shifts.map((shift, index) => {
					const shiftKey = `${shift.timestamp ?? Date.now()}-${index}`;
					return (
						<div key={shiftKey} className="text-red-800">
							<div>Value: {shift.value.toFixed(4)}</div>
							{shift.sources.length > 0 && (
								<div className="text-xs text-red-700">
									Sources: {shift.sources.join(", ")}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

// Critical resource preloader
interface CriticalResourcePreloaderProps {
	resources: Array<{
		href: string;
		as: "script" | "style" | "font" | "image";
		type?: string;
		crossOrigin?: "anonymous" | "use-credentials";
	}>;
}

export const CriticalResourcePreloader: React.FC<
	CriticalResourcePreloaderProps
> = ({ resources }) => {
	useEffect(() => {
		resources.forEach(({ href, as, type, crossOrigin }) => {
			const link = document.createElement("link");
			link.rel = "preload";
			link.href = href;
			link.as = as;

			if (type) {
				link.type = type;
			}

			if (crossOrigin) {
				link.crossOrigin = crossOrigin;
			}

			document.head.appendChild(link);
		});
	}, [resources]);

	return null;
};
