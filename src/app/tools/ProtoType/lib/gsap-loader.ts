/**
 * GSAP loader module
 * This file ensures GSAP is included in the production bundle.
 * The module-level execution and exports prevent tree-shaking.
 */

import gsapModule from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { CustomEase } from "gsap/all";

// Export the GSAP module to prevent tree-shaking
export const gsap = gsapModule;

// Export plugins for registration in components
export { PixiPlugin, CustomEase };

// Module-level initialization to force inclusion
// This runs when the module is imported
if (typeof window !== "undefined") {
	// Assign to window to prevent tree-shaking
	(window as any).gsap = gsapModule;
}

// Default export
export default gsapModule;
