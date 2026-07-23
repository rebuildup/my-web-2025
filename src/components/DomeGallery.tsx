import Image from "next/image";
import { useMemo, useRef } from "react";
import { DEFAULT_IMAGES, DEFAULTS } from "./DomeGallery.constants";
import { cssStyles } from "./DomeGallery.styles";
import type { DomeGalleryProps } from "./DomeGallery.types";
import { buildItems } from "./DomeGallery.utils";
import { useDomeGalleryInteractions } from "./useDomeGalleryInteractions";

export default function DomeGallery({
	images = DEFAULT_IMAGES,
	fit = 0.5,
	fitBasis = "auto",
	minRadius = 600,
	maxRadius = Infinity,
	padFactor = 0.25,
	overlayBlurColor = "#060010",
	maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
	dragSensitivity = DEFAULTS.dragSensitivity,
	enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
	segments = DEFAULTS.segments,
	dragDampening = 2,
	openedImageWidth = "400px",
	openedImageHeight = "400px",
	imageBorderRadius = "30px",
	openedImageBorderRadius = "30px",
	grayscale = true,
}: DomeGalleryProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const mainRef = useRef<HTMLDivElement>(null);
	const sphereRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const viewerRef = useRef<HTMLDivElement>(null);
	const scrimRef = useRef<HTMLDivElement>(null);

	const items = useMemo(() => buildItems(images, segments), [images, segments]);

	const { handleItemClick } = useDomeGalleryInteractions({
		rootRef,
		mainRef,
		sphereRef,
		frameRef,
		viewerRef,
		scrimRef,
		fit,
		fitBasis,
		minRadius,
		maxRadius,
		padFactor,
		overlayBlurColor,
		grayscale,
		imageBorderRadius,
		openedImageBorderRadius,
		openedImageWidth,
		openedImageHeight,
		segments,
		dragSensitivity,
		dragDampening,
		maxVerticalRotationDeg,
		enlargeTransitionMs,
	});

	return (
		<>
			<style dangerouslySetInnerHTML={{ __html: cssStyles }} />
			<div
				ref={rootRef}
				className="sphere-root relative w-full h-full"
				style={
					{
						...({
							"--segments-x": segments,
							"--segments-y": segments,
							"--overlay-blur-color": overlayBlurColor,
							"--tile-radius": imageBorderRadius,
							"--enlarge-radius": openedImageBorderRadius,
							"--image-filter": grayscale ? "grayscale(1)" : "none",
						} as React.CSSProperties),
					} as React.CSSProperties
				}
			>
				<main
					ref={mainRef}
					className="absolute inset-0 grid place-items-center overflow-hidden select-none "
					style={{
						touchAction: "none",
						WebkitUserSelect: "none",
					}}
				>
					<div className="stage">
						<div ref={sphereRef} className="sphere">
							{items.map((it, i) => (
								<div
									key={`${it.x},${it.y}`}
									className="sphere-item absolute m-auto"
									data-src={it.src}
									data-alt={it.alt}
									data-offset-x={it.x}
									data-offset-y={it.y}
									data-size-x={it.sizeX}
									data-size-y={it.sizeY}
									style={
										{
											...({
												"--offset-x": it.x,
												"--offset-y": it.y,
												"--item-size-x": it.sizeX,
												"--item-size-y": it.sizeY,
											} as React.CSSProperties),
											top: "-999px",
											bottom: "-999px",
											left: "-999px",
											right: "-999px",
										} as React.CSSProperties
									}
								>
									<div
										className="item__image absolute block overflow-hidden cursor-pointer  transition-transform duration-300"
										role="button"
										tabIndex={0}
										aria-label={it.alt || "Open image"}
										onClick={(e) => {
											handleItemClick(e.currentTarget as HTMLElement);
										}}
										onPointerUp={(e) => {
											if (
												(e.nativeEvent as PointerEvent).pointerType !== "touch"
											)
												return;
											handleItemClick(e.currentTarget as HTMLElement);
										}}
										style={{
											inset: "10px",
											borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
											backfaceVisibility: "hidden",
										}}
									>
										<Image
											src={it.src}
											width={600}
											height={600}
											draggable={false}
											alt={it.alt}
											className="w-full h-full object-cover pointer-events-none"
											style={{
												backfaceVisibility: "hidden",
												filter: `var(--image-filter, ${grayscale ? "grayscale(1)" : "none"})`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					<div
						className="absolute inset-0 m-auto z-[3] pointer-events-none"
						style={{
							backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`,
						}}
					/>

					<div
						className="absolute inset-0 m-auto z-[3] pointer-events-none"
						style={{
							WebkitMaskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
							maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
							backdropFilter: "blur(3px)",
						}}
					/>

					<div
						className="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180"
						style={{
							background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
						}}
					/>
					<div
						className="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none"
						style={{
							background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
						}}
					/>

					<div
						ref={viewerRef}
						className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
						style={{ padding: "var(--viewer-pad)" }}
					>
						<div
							ref={scrimRef}
							className="scrim absolute inset-0 z-10 pointer-events-none  transition-opacity duration-500"
							style={{
								background: "rgba(0, 0, 0, 0.4)",
								backdropFilter: "blur(3px)",
							}}
						/>
						<div
							ref={frameRef}
							className="viewer-frame h-full aspect-square flex"
							style={{
								borderRadius: `var(--enlarge-radius, ${openedImageBorderRadius})`,
							}}
						/>
					</div>
				</main>
			</div>
		</>
	);
}
