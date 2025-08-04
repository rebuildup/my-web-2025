/**
 * WebGL Memory Manager
 * GPU memory management, texture optimization, and resource cleanup
 * Task 3.1: プレイグラウンドのパフォーマンス最適化 - メモリ使用量制限・GPU使用量最適化
 */

import * as THREE from "three";

export interface MemoryUsage {
  textures: number;
  geometries: number;
  materials: number;
  total: number;
  gpuMemoryEstimate: number;
}

export interface TextureOptimizationSettings {
  maxTextureSize: number;
  compressionFormat: string;
  mipmapGeneration: boolean;
  anisotropicFiltering: number;
}

export class WebGLMemoryManager {
  private static instance: WebGLMemoryManager;
  private textureCache = new Map<string, THREE.Texture>();
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  private materialCache = new Map<string, THREE.Material>();

  private memoryLimit = 512 * 1024 * 1024; // 512MB default limit
  private currentUsage: MemoryUsage = {
    textures: 0,
    geometries: 0,
    materials: 0,
    total: 0,
    gpuMemoryEstimate: 0,
  };

  private cleanupCallbacks: (() => void)[] = [];
  private memoryWarningCallbacks: ((usage: MemoryUsage) => void)[] = [];

  static getInstance(): WebGLMemoryManager {
    if (!WebGLMemoryManager.instance) {
      WebGLMemoryManager.instance = new WebGLMemoryManager();
    }
    return WebGLMemoryManager.instance;
  }

  /**
   * Set memory limit in bytes
   */
  setMemoryLimit(limitMB: number): void {
    this.memoryLimit = limitMB * 1024 * 1024;
  }

  /**
   * Create optimized texture based on device capabilities
   */
  createOptimizedTexture(
    source: HTMLImageElement | HTMLCanvasElement | ImageData,
    settings: TextureOptimizationSettings,
    cacheKey?: string,
  ): THREE.Texture {
    // Check cache first
    if (cacheKey && this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    // Create canvas for texture optimization
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create 2D context for texture optimization");
    }

    // Determine optimal size
    let { width, height } = this.getSourceDimensions(source);
    const maxSize = settings.maxTextureSize;

    if (width > maxSize || height > maxSize) {
      const scale = Math.min(maxSize / width, maxSize / height);
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
    }

    // Ensure power of 2 for better performance
    width = this.nearestPowerOfTwo(width);
    height = this.nearestPowerOfTwo(height);

    canvas.width = width;
    canvas.height = height;

    // Draw optimized image
    ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);

    // Create Three.js texture
    const texture = new THREE.CanvasTexture(canvas);

    // Apply optimization settings
    texture.generateMipmaps = settings.mipmapGeneration;
    texture.minFilter = settings.mipmapGeneration
      ? THREE.LinearMipmapLinearFilter
      : THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    // Estimate memory usage
    const memoryUsage = this.estimateTextureMemory(
      width,
      height,
      texture.format as THREE.PixelFormat,
    );
    this.currentUsage.textures += memoryUsage;
    this.currentUsage.total += memoryUsage;
    this.currentUsage.gpuMemoryEstimate += memoryUsage;

    // Cache if key provided
    if (cacheKey) {
      this.textureCache.set(cacheKey, texture);
    }

    // Check memory usage
    this.checkMemoryUsage();

    return texture;
  }

  /**
   * Get source dimensions
   */
  private getSourceDimensions(
    source: HTMLImageElement | HTMLCanvasElement | ImageData,
  ): { width: number; height: number } {
    if (source instanceof HTMLImageElement) {
      return { width: source.naturalWidth, height: source.naturalHeight };
    } else if (source instanceof HTMLCanvasElement) {
      return { width: source.width, height: source.height };
    } else {
      return { width: source.width, height: source.height };
    }
  }

  /**
   * Find nearest power of 2
   */
  private nearestPowerOfTwo(value: number): number {
    return Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
  }

  /**
   * Estimate texture memory usage
   */
  private estimateTextureMemory(
    width: number,
    height: number,
    format: THREE.PixelFormat,
  ): number {
    let bytesPerPixel = 4; // RGBA default

    switch (format) {
      case THREE.RGBFormat:
        bytesPerPixel = 3;
        break;
      case THREE.RedFormat:
        bytesPerPixel = 1;
        break;
      case THREE.RGFormat:
        bytesPerPixel = 2;
        break;
      case THREE.RGBAFormat:
      default:
        bytesPerPixel = 4;
        break;
    }

    // Include mipmaps (adds ~33% more memory)
    const baseMemory = width * height * bytesPerPixel;
    return Math.floor(baseMemory * 1.33);
  }

  /**
   * Create optimized geometry
   */
  createOptimizedGeometry(
    vertices: Float32Array,
    indices?: Uint16Array | Uint32Array,
    cacheKey?: string,
  ): THREE.BufferGeometry {
    // Check cache first
    if (cacheKey && this.geometryCache.has(cacheKey)) {
      return this.geometryCache.get(cacheKey)!;
    }

    const geometry = new THREE.BufferGeometry();

    // Add position attribute
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    // Add indices if provided
    if (indices) {
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    }

    // Optimize geometry
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    // Estimate memory usage
    const memoryUsage = this.estimateGeometryMemory(geometry);
    this.currentUsage.geometries += memoryUsage;
    this.currentUsage.total += memoryUsage;
    this.currentUsage.gpuMemoryEstimate += memoryUsage;

    // Cache if key provided
    if (cacheKey) {
      this.geometryCache.set(cacheKey, geometry);
    }

    // Check memory usage
    this.checkMemoryUsage();

    return geometry;
  }

  /**
   * Estimate geometry memory usage
   */
  private estimateGeometryMemory(geometry: THREE.BufferGeometry): number {
    let totalMemory = 0;

    // Calculate memory for each attribute
    Object.values(geometry.attributes).forEach((attribute) => {
      totalMemory += attribute.array.byteLength;
    });

    // Add index memory if present
    if (geometry.index) {
      totalMemory += geometry.index.array.byteLength;
    }

    return totalMemory;
  }

  /**
   * Create optimized material
   */
  createOptimizedMaterial(
    type: "basic" | "standard" | "shader",
    options: Record<string, unknown>,
    cacheKey?: string,
  ): THREE.Material {
    // Check cache first
    if (cacheKey && this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }

    let material: THREE.Material;

    switch (type) {
      case "basic":
        material = new THREE.MeshBasicMaterial(options);
        break;
      case "standard":
        material = new THREE.MeshStandardMaterial(options);
        break;
      case "shader":
        material = new THREE.ShaderMaterial(options);
        break;
      default:
        material = new THREE.MeshBasicMaterial(options);
    }

    // Estimate memory usage
    const memoryUsage = this.estimateMaterialMemory(material);
    this.currentUsage.materials += memoryUsage;
    this.currentUsage.total += memoryUsage;

    // Cache if key provided
    if (cacheKey) {
      this.materialCache.set(cacheKey, material);
    }

    // Check memory usage
    this.checkMemoryUsage();

    return material;
  }

  /**
   * Estimate material memory usage
   */
  private estimateMaterialMemory(material: THREE.Material): number {
    let memoryUsage = 1024; // Base material memory

    // Add texture memory (already counted in texture cache)
    // This is just for tracking purposes
    if ("map" in material && material.map) {
      memoryUsage += 100; // Small overhead for texture reference
    }

    return memoryUsage;
  }

  /**
   * Dispose texture and update memory usage
   */
  disposeTexture(texture: THREE.Texture, cacheKey?: string): void {
    const memoryUsage = this.estimateTextureMemory(
      texture.image?.width || 256,
      texture.image?.height || 256,
      texture.format as THREE.PixelFormat,
    );

    texture.dispose();

    this.currentUsage.textures -= memoryUsage;
    this.currentUsage.total -= memoryUsage;
    this.currentUsage.gpuMemoryEstimate -= memoryUsage;

    if (cacheKey && this.textureCache.has(cacheKey)) {
      this.textureCache.delete(cacheKey);
    }
  }

  /**
   * Dispose geometry and update memory usage
   */
  disposeGeometry(geometry: THREE.BufferGeometry, cacheKey?: string): void {
    const memoryUsage = this.estimateGeometryMemory(geometry);

    geometry.dispose();

    this.currentUsage.geometries -= memoryUsage;
    this.currentUsage.total -= memoryUsage;
    this.currentUsage.gpuMemoryEstimate -= memoryUsage;

    if (cacheKey && this.geometryCache.has(cacheKey)) {
      this.geometryCache.delete(cacheKey);
    }
  }

  /**
   * Dispose material and update memory usage
   */
  disposeMaterial(material: THREE.Material, cacheKey?: string): void {
    const memoryUsage = this.estimateMaterialMemory(material);

    material.dispose();

    this.currentUsage.materials -= memoryUsage;
    this.currentUsage.total -= memoryUsage;

    if (cacheKey && this.materialCache.has(cacheKey)) {
      this.materialCache.delete(cacheKey);
    }
  }

  /**
   * Check memory usage and trigger cleanup if needed
   */
  private checkMemoryUsage(): void {
    const usagePercent = (this.currentUsage.total / this.memoryLimit) * 100;

    // Trigger warning at 80% usage
    if (usagePercent > 80) {
      this.memoryWarningCallbacks.forEach((callback) => {
        try {
          callback(this.currentUsage);
        } catch (error) {
          console.warn("Memory warning callback error:", error);
        }
      });
    }

    // Trigger cleanup at 90% usage
    if (usagePercent > 90) {
      this.triggerCleanup();
    }
  }

  /**
   * Trigger memory cleanup
   */
  private triggerCleanup(): void {
    console.warn("Memory usage high, triggering cleanup");

    // Run cleanup callbacks
    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.warn("Cleanup callback error:", error);
      }
    });

    // Clear least recently used items from caches
    this.clearLRUCache();
  }

  /**
   * Clear least recently used items from caches
   */
  private clearLRUCache(): void {
    // Simple LRU implementation - clear oldest 25% of cached items
    const clearCount = Math.floor(this.textureCache.size * 0.25);
    let cleared = 0;

    for (const [key, texture] of this.textureCache.entries()) {
      if (cleared >= clearCount) break;
      this.disposeTexture(texture, key);
      cleared++;
    }

    // Clear geometry cache
    const geoClearCount = Math.floor(this.geometryCache.size * 0.25);
    cleared = 0;

    for (const [key, geometry] of this.geometryCache.entries()) {
      if (cleared >= geoClearCount) break;
      this.disposeGeometry(geometry, key);
      cleared++;
    }
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): MemoryUsage {
    return { ...this.currentUsage };
  }

  /**
   * Get memory usage percentage
   */
  getMemoryUsagePercent(): number {
    return (this.currentUsage.total / this.memoryLimit) * 100;
  }

  /**
   * Subscribe to cleanup events
   */
  onCleanup(callback: () => void): () => void {
    this.cleanupCallbacks.push(callback);

    return () => {
      const index = this.cleanupCallbacks.indexOf(callback);
      if (index > -1) {
        this.cleanupCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to memory warning events
   */
  onMemoryWarning(callback: (usage: MemoryUsage) => void): () => void {
    this.memoryWarningCallbacks.push(callback);

    return () => {
      const index = this.memoryWarningCallbacks.indexOf(callback);
      if (index > -1) {
        this.memoryWarningCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    // Dispose all textures
    for (const [key, texture] of this.textureCache.entries()) {
      this.disposeTexture(texture, key);
    }

    // Dispose all geometries
    for (const [key, geometry] of this.geometryCache.entries()) {
      this.disposeGeometry(geometry, key);
    }

    // Dispose all materials
    for (const [key, material] of this.materialCache.entries()) {
      this.disposeMaterial(material, key);
    }

    // Reset usage counters
    this.currentUsage = {
      textures: 0,
      geometries: 0,
      materials: 0,
      total: 0,
      gpuMemoryEstimate: 0,
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    textures: number;
    geometries: number;
    materials: number;
    memoryUsage: MemoryUsage;
    memoryLimit: number;
    usagePercent: number;
  } {
    return {
      textures: this.textureCache.size,
      geometries: this.geometryCache.size,
      materials: this.materialCache.size,
      memoryUsage: this.getMemoryUsage(),
      memoryLimit: this.memoryLimit,
      usagePercent: this.getMemoryUsagePercent(),
    };
  }

  /**
   * Optimize existing Three.js scene for memory usage
   */
  optimizeScene(scene: THREE.Scene): void {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Optimize geometry
        if (object.geometry && !object.geometry.boundingBox) {
          object.geometry.computeBoundingBox();
        }
        if (object.geometry && !object.geometry.boundingSphere) {
          object.geometry.computeBoundingSphere();
        }

        // Check for unused materials
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            if (material.transparent && material.opacity === 0) {
              console.warn(
                "Found transparent material with 0 opacity, consider removing",
              );
            }
          });
        } else if (object.material) {
          if (object.material.transparent && object.material.opacity === 0) {
            console.warn(
              "Found transparent material with 0 opacity, consider removing",
            );
          }
        }
      }
    });
  }
}

// Export singleton instance
export const webglMemoryManager = WebGLMemoryManager.getInstance();
