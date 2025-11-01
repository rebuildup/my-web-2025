declare module "@appletosolutions/reactbits" {
	import type { ComponentType } from "react";
	// Minimal type shims to satisfy TS during dev; real types are shipped by the package at runtime
	export const GlitchText: ComponentType<any>;
	export const ShinyText: ComponentType<any>;
	export const SpotlightCard: ComponentType<any>;
	export const StarBorder: ComponentType<any>;
	export const particles: ComponentType<any>;
	export const ScrollVelocity: ComponentType<any>;
	export const CircularText: ComponentType<any>;
	export const TextEffect: ComponentType<any>;
	export const AnimatedText: ComponentType<any>;
	export const GlareHover: ComponentType<any>;
	export const TextType: ComponentType<any>;
}
