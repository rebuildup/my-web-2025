export type ImageItem = string | { src: string; alt?: string };

export type DomeGalleryProps = {
	images?: ImageItem[];
	fit?: number;
	fitBasis?: "auto" | "min" | "max" | "width" | "height";
	minRadius?: number;
	maxRadius?: number;
	padFactor?: number;
	overlayBlurColor?: string;
	maxVerticalRotationDeg?: number;
	dragSensitivity?: number;
	enlargeTransitionMs?: number;
	segments?: number;
	dragDampening?: number;
	openedImageWidth?: string;
	openedImageHeight?: string;
	imageBorderRadius?: string;
	openedImageBorderRadius?: string;
	grayscale?: boolean;
};

export type ItemDef = {
	src: string;
	alt: string;
	x: number;
	y: number;
	sizeX: number;
	sizeY: number;
};
