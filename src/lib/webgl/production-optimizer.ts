/**
 * WebGL Production Optimizer
 * Optimizes WebGL performance for production environment
 */

import { getProductionConfig } from "@/lib/config/production";
import { WebGLPerformanceMonitor } from "@/lib/monitoring/performance";

export interface WebGLOptimizationSettings {
	maxTextureSize: number;
	enableMipmaps: boolean;
	textureCompression: boolean;
	antialiasingLevel: number;
	shadowQuality: "low" | "medium" | "high";
	particleCount: number;
	lodDistance: number;
	enableOcclusion: boolean;
	targetFPS: number;
}

export interface DeviceCapabilities {
	webglVersion: 1 | 2;
	maxTextureSize: number;
	maxVertexAttribs: number;
	maxVaryingVectors: number;
	maxFragmentUniforms: number;
	extensions: string[];
	renderer: string;
	vendor: string;
	performanceLevel: "low" | "medium" | "high";
}

/**
 * WebGL Production Optimizer
 */
export class WebGLProductionOptimizer {
	private gl: WebGLRenderingContext | WebGL2RenderingContext;
	private capabilities: DeviceCapabilities;
	private settings: WebGLOptimizationSettings;
	private performanceMonitor?: WebGLPerformanceMonitor;

	constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
		this.gl = gl;
		this.capabilities = this.detectCapabilities();
		this.settings = this.generateOptimalSettings();

		const config = getProductionConfig();
		if (config.webgl.performanceMonitoring) {
			this.performanceMonitor = new WebGLPerformanceMonitor(gl);
			this.performanceMonitor.start();
		}
	}

	/**
	 * Detect device capabilities
	 */
	private detectCapabilities(): DeviceCapabilities {
		const gl = this.gl;
		const isWebGL2 = gl instanceof WebGL2RenderingContext;

		// Get basic parameters
		const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
		const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
		const maxFragmentUniforms = gl.getParameter(
			gl.MAX_FRAGMENT_UNIFORM_VECTORS,
		);

		// Get extensions
		const extensions = gl.getSupportedExtensions() || [];

		// Get renderer info
		const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
		const renderer = debugInfo
			? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
			: "Unknown";
		const vendor = debugInfo
			? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
			: "Unknown";

		// Determine performance level
		const performanceLevel = this.determinePerformanceLevel(
			renderer,
			maxTextureSize,
			extensions,
		);

		return {
			webglVersion: isWebGL2 ? 2 : 1,
			maxTextureSize,
			maxVertexAttribs,
			maxVaryingVectors,
			maxFragmentUniforms,
			extensions,
			renderer,
			vendor,
			performanceLevel,
		};
	}

	/**
	 * Determine device performance level
	 */
	private determinePerformanceLevel(
		renderer: string,
		maxTextureSize: number,
		extensions: string[],
	): "low" | "medium" | "high" {
		const rendererLower = renderer.toLowerCase();

		// High-end GPUs
		if (
			rendererLower.includes("rtx") ||
			rendererLower.includes("gtx 1060") ||
			rendererLower.includes("rx 580") ||
			maxTextureSize >= 8192
		) {
			return "high";
		}

		// Medium-end GPUs
		if (
			rendererLower.includes("gtx") ||
			rendererLower.includes("radeon") ||
			maxTextureSize >= 4096 ||
			extensions.includes("EXT_texture_filter_anisotropic")
		) {
			return "medium";
		}

		// Low-end or integrated GPUs
		return "low";
	}

	/**
	 * Generate optimal settings based on capabilities
	 */
	private generateOptimalSettings(): WebGLOptimizationSettings {
		const config = getProductionConfig();
		const { performanceLevel, maxTextureSize } = this.capabilities;

		const baseSettings: WebGLOptimizationSettings = {
			maxTextureSize: Math.min(
				config.webgl.maxTextureSize,
				maxTextureSize,
				performanceLevel === "high"
					? 2048
					: performanceLevel === "medium"
						? 1024
						: 512,
			),
			enableMipmaps: performanceLevel !== "low",
			textureCompression: true,
			antialiasingLevel:
				performanceLevel === "high" ? 4 : performanceLevel === "medium" ? 2 : 0,
			shadowQuality:
				performanceLevel === "high"
					? "high"
					: performanceLevel === "medium"
						? "medium"
						: "low",
			particleCount:
				performanceLevel === "high"
					? 1000
					: performanceLevel === "medium"
						? 500
						: 100,
			lodDistance:
				performanceLevel === "high"
					? 100
					: performanceLevel === "medium"
						? 50
						: 25,
			enableOcclusion: performanceLevel === "high",
			targetFPS: 60,
		};

		return baseSettings;
	}

	/**
	 * Get current optimization settings
	 */
	getSettings(): WebGLOptimizationSettings {
		return { ...this.settings };
	}

	/**
	 * Get device capabilities
	 */
	getCapabilities(): DeviceCapabilities {
		return { ...this.capabilities };
	}

	/**
	 * Update settings based on runtime performance
	 */
	updateSettings(performanceData: { fps: number; frameTime: number }): void {
		const { fps, frameTime } = performanceData;

		// If FPS is too low, reduce quality
		if (fps < this.settings.targetFPS * 0.8) {
			this.reduceQuality();
		}

		// If FPS is consistently high, we can increase quality
		if (fps > this.settings.targetFPS * 1.1 && frameTime < 10) {
			this.increaseQuality();
		}
	}

	/**
	 * Reduce quality settings
	 */
	private reduceQuality(): void {
		const settings = this.settings;

		// Reduce texture size
		if (settings.maxTextureSize > 256) {
			settings.maxTextureSize = Math.max(256, settings.maxTextureSize / 2);
		}

		// Reduce antialiasing
		if (settings.antialiasingLevel > 0) {
			settings.antialiasingLevel = Math.max(0, settings.antialiasingLevel / 2);
		}

		// Reduce particle count
		if (settings.particleCount > 50) {
			settings.particleCount = Math.max(50, settings.particleCount * 0.7);
		}

		// Reduce shadow quality
		if (settings.shadowQuality === "high") {
			settings.shadowQuality = "medium";
		} else if (settings.shadowQuality === "medium") {
			settings.shadowQuality = "low";
		}

		// Disable expensive features
		settings.enableOcclusion = false;
		settings.enableMipmaps = false;
	}

	/**
	 * Increase quality settings (cautiously)
	 */
	private increaseQuality(): void {
		const settings = this.settings;
		const maxCapabilities = this.generateOptimalSettings();

		// Only increase if we're below optimal settings
		if (settings.maxTextureSize < maxCapabilities.maxTextureSize) {
			settings.maxTextureSize = Math.min(
				maxCapabilities.maxTextureSize,
				settings.maxTextureSize * 1.5,
			);
		}

		if (settings.antialiasingLevel < maxCapabilities.antialiasingLevel) {
			settings.antialiasingLevel = Math.min(
				maxCapabilities.antialiasingLevel,
				settings.antialiasingLevel + 1,
			);
		}
	}

	/**
	 * Create optimized texture
	 */
	createOptimizedTexture(
		image: HTMLImageElement | HTMLCanvasElement,
		options: {
			generateMipmaps?: boolean;
			compression?: boolean;
			maxSize?: number;
		} = {},
	): WebGLTexture | null {
		const gl = this.gl;
		const texture = gl.createTexture();

		if (!texture) return null;

		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Resize if necessary
		const maxSize = options.maxSize || this.settings.maxTextureSize;
		const canvas = this.resizeImage(image, maxSize);

		// Upload texture
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

		// Set filtering
		if (options.generateMipmaps && this.settings.enableMipmaps) {
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(
				gl.TEXTURE_2D,
				gl.TEXTURE_MIN_FILTER,
				gl.LINEAR_MIPMAP_LINEAR,
			);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		return texture;
	}

	/**
	 * Resize image to fit within max size
	 */
	private resizeImage(
		image: HTMLImageElement | HTMLCanvasElement,
		maxSize: number,
	): HTMLCanvasElement {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Failed to acquire 2D rendering context for canvas");
		}

		let { width, height } = image;

		// Calculate new dimensions
		if (width > maxSize || height > maxSize) {
			const ratio = Math.min(maxSize / width, maxSize / height);
			width *= ratio;
			height *= ratio;
		}

		// Ensure power of 2 for better performance
		width = this.nextPowerOfTwo(width);
		height = this.nextPowerOfTwo(height);

		canvas.width = width;
		canvas.height = height;

		ctx.drawImage(image, 0, 0, width, height);

		return canvas;
	}

	/**
	 * Get next power of 2
	 */
	private nextPowerOfTwo(value: number): number {
		return 2 ** Math.ceil(Math.log2(value));
	}

	/**
	 * Check for WebGL errors and handle them
	 */
	checkErrors(): boolean {
		const gl = this.gl;
		const error = gl.getError();

		if (error !== gl.NO_ERROR) {
			const errorMessage = this.getErrorMessage(error);
			console.error("WebGL Error:", errorMessage);

			// Send error to monitoring
			if (typeof window !== "undefined") {
				fetch("/api/monitoring/errors", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						message: `WebGL Error: ${errorMessage}`,
						component: "WebGLOptimizer",
						timestamp: Date.now(),
						url: window.location.href,
					}),
				}).catch(console.error);
			}

			return false;
		}

		return true;
	}

	/**
	 * Get human-readable error message
	 */
	private getErrorMessage(error: number): string {
		const gl = this.gl;

		switch (error) {
			case gl.INVALID_ENUM:
				return "Invalid enum";
			case gl.INVALID_VALUE:
				return "Invalid value";
			case gl.INVALID_OPERATION:
				return "Invalid operation";
			case gl.OUT_OF_MEMORY:
				return "Out of memory";
			case gl.CONTEXT_LOST_WEBGL:
				return "Context lost";
			default:
				return `Unknown error: ${error}`;
		}
	}

	/**
	 * Cleanup resources
	 */
	dispose(): void {
		if (this.performanceMonitor) {
			this.performanceMonitor.stop();
		}
	}
}
