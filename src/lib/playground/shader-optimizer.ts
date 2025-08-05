/**
 * Shader Optimizer
 * GLSL shader compilation optimization and caching
 * Task 3.1: プレイグラウンドのパフォーマンス最適化 - シェーダーコンパイル最適化
 */

import { DeviceCapabilities } from "@/types/playground";
import * as THREE from "three";

export interface ShaderOptimizationSettings {
  precision: "lowp" | "mediump" | "highp";
  enableOptimizations: boolean;
  stripComments: boolean;
  minifyCode: boolean;
  cacheShaders: boolean;
}

export interface CompiledShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [key: string]: THREE.IUniform };
  hash: string;
  compilationTime: number;
}

export class ShaderOptimizer {
  private static instance: ShaderOptimizer;
  private shaderCache = new Map<string, CompiledShader>();
  private compilationStats = {
    totalCompilations: 0,
    cacheHits: 0,
    averageCompilationTime: 0,
    totalCompilationTime: 0,
  };

  static getInstance(): ShaderOptimizer {
    if (!ShaderOptimizer.instance) {
      ShaderOptimizer.instance = new ShaderOptimizer();
    }
    return ShaderOptimizer.instance;
  }

  /**
   * Optimize and compile shader
   */
  optimizeShader(
    vertexShader: string,
    fragmentShader: string,
    uniforms: { [key: string]: THREE.IUniform },
    deviceCapabilities: DeviceCapabilities,
    settings: ShaderOptimizationSettings,
  ): CompiledShader {
    const startTime = performance.now();

    // Create hash for caching
    const hash = this.createShaderHash(vertexShader, fragmentShader, settings);

    // Check cache first
    if (settings.cacheShaders && this.shaderCache.has(hash)) {
      this.compilationStats.cacheHits++;
      return this.shaderCache.get(hash)!;
    }

    // Optimize vertex shader
    const optimizedVertexShader = this.optimizeShaderCode(
      vertexShader,
      "vertex",
      deviceCapabilities,
      settings,
    );

    // Optimize fragment shader
    const optimizedFragmentShader = this.optimizeShaderCode(
      fragmentShader,
      "fragment",
      deviceCapabilities,
      settings,
    );

    // Optimize uniforms
    const optimizedUniforms = this.optimizeUniforms(
      uniforms,
      deviceCapabilities,
    );

    const compilationTime = performance.now() - startTime;

    const compiledShader: CompiledShader = {
      vertexShader: optimizedVertexShader,
      fragmentShader: optimizedFragmentShader,
      uniforms: optimizedUniforms,
      hash,
      compilationTime,
    };

    // Update stats
    this.compilationStats.totalCompilations++;
    this.compilationStats.totalCompilationTime += compilationTime;
    this.compilationStats.averageCompilationTime =
      this.compilationStats.totalCompilationTime /
      this.compilationStats.totalCompilations;

    // Cache the result
    if (settings.cacheShaders) {
      this.shaderCache.set(hash, compiledShader);
    }

    return compiledShader;
  }

  /**
   * Create hash for shader caching
   */
  private createShaderHash(
    vertexShader: string,
    fragmentShader: string,
    settings: ShaderOptimizationSettings,
  ): string {
    const content = vertexShader + fragmentShader + JSON.stringify(settings);
    return this.simpleHash(content);
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Optimize shader code
   */
  private optimizeShaderCode(
    shaderCode: string,
    type: "vertex" | "fragment",
    deviceCapabilities: DeviceCapabilities,
    settings: ShaderOptimizationSettings,
  ): string {
    let optimizedCode = shaderCode;

    // Add precision qualifier if not present
    if (!optimizedCode.includes("precision")) {
      const precision = this.getOptimalPrecision(deviceCapabilities, settings);
      optimizedCode = `precision ${precision} float;\n${optimizedCode}`;
    }

    // Strip comments if enabled
    if (settings.stripComments) {
      optimizedCode = this.stripComments(optimizedCode);
    }

    // Minify code if enabled
    if (settings.minifyCode) {
      optimizedCode = this.minifyShaderCode(optimizedCode);
    }

    // Apply device-specific optimizations
    optimizedCode = this.applyDeviceOptimizations(
      optimizedCode,
      type,
      deviceCapabilities,
    );

    // Validate shader syntax
    if (settings.enableOptimizations) {
      optimizedCode = this.validateAndOptimize(optimizedCode, type);
    }

    return optimizedCode;
  }

  /**
   * Get optimal precision based on device capabilities
   */
  private getOptimalPrecision(
    deviceCapabilities: DeviceCapabilities,
    settings?: ShaderOptimizationSettings,
  ): "lowp" | "mediump" | "highp" {
    // Use settings precision if specified
    if (settings?.precision) {
      return settings.precision;
    }

    // Auto-detect based on device performance
    switch (deviceCapabilities.performanceLevel) {
      case "high":
        return "highp";
      case "medium":
        return "mediump";
      case "low":
      default:
        return "lowp";
    }
  }

  /**
   * Strip comments from shader code
   */
  private stripComments(code: string): string {
    // Remove single-line comments
    code = code.replace(/\/\/.*$/gm, "");

    // Remove multi-line comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, "");

    return code;
  }

  /**
   * Minify shader code
   */
  private minifyShaderCode(code: string): string {
    // Remove extra whitespace
    code = code.replace(/\s+/g, " ");

    // Remove whitespace around operators
    code = code.replace(/\s*([+\-*\/=<>!&|,;{}()])\s*/g, "$1");

    // Remove leading/trailing whitespace
    code = code.trim();

    return code;
  }

  /**
   * Apply device-specific optimizations
   */
  private applyDeviceOptimizations(
    code: string,
    type: "vertex" | "fragment",
    deviceCapabilities: DeviceCapabilities,
  ): string {
    let optimizedCode = code;

    // Optimize for low-performance devices
    if (deviceCapabilities.performanceLevel === "low") {
      // Replace expensive functions with approximations
      optimizedCode = optimizedCode.replace(/\bpow\s*\(/g, "fastPow(");
      optimizedCode = optimizedCode.replace(/\bsin\s*\(/g, "fastSin(");
      optimizedCode = optimizedCode.replace(/\bcos\s*\(/g, "fastCos(");

      // Add fast approximation functions
      const fastFunctions = `
        float fastPow(float a, float b) {
          return exp2(b * log2(a));
        }
        
        float fastSin(float x) {
          x = x * 0.159155; // 1/(2*PI)
          x = x - floor(x);
          return 16.0 * x * (0.5 - x) * (0.5 - x) * (0.75 - x);
        }
        
        float fastCos(float x) {
          return fastSin(x + 1.5708); // PI/2
        }
      `;

      optimizedCode = fastFunctions + optimizedCode;
    }

    // Optimize texture sampling for mobile devices
    if (deviceCapabilities.touchSupport) {
      // Use lower precision for texture coordinates
      optimizedCode = optimizedCode.replace(/highp\s+vec2/g, "mediump vec2");
      optimizedCode = optimizedCode.replace(/highp\s+vec3/g, "mediump vec3");
    }

    // WebGL1 compatibility
    if (!deviceCapabilities.webgl2Support) {
      // Replace WebGL2 specific functions
      optimizedCode = optimizedCode.replace(/\btexture\s*\(/g, "texture2D(");
      optimizedCode = optimizedCode.replace(/#version\s+300\s+es/g, "");
      optimizedCode = optimizedCode.replace(/\bin\s+/g, "attribute ");
      optimizedCode = optimizedCode.replace(/\bout\s+/g, "varying ");
    }

    return optimizedCode;
  }

  /**
   * Validate and optimize shader syntax
   */
  private validateAndOptimize(
    code: string,
    type: "vertex" | "fragment",
  ): string {
    const optimizedCode = code;

    // Check for common performance issues
    const performanceWarnings: string[] = [];

    // Check for expensive operations in loops
    if (optimizedCode.includes("for") && optimizedCode.includes("pow")) {
      performanceWarnings.push("Expensive pow() operation found in loop");
    }

    // Check for unnecessary precision qualifiers
    const precisionMatches = optimizedCode.match(/precision\s+\w+\s+\w+/g);
    if (precisionMatches && precisionMatches.length > 1) {
      performanceWarnings.push("Multiple precision qualifiers found");
    }

    // Check for unused variables
    const variableDeclarations = optimizedCode.match(
      /\b(?:float|vec[234]|mat[234]|int|bool)\s+(\w+)/g,
    );
    if (variableDeclarations) {
      variableDeclarations.forEach((declaration) => {
        const varName = declaration.split(/\s+/).pop();
        if (varName && optimizedCode.split(varName).length === 2) {
          performanceWarnings.push(`Unused variable: ${varName}`);
        }
      });
    }

    // Log warnings in development
    if (
      performanceWarnings.length > 0 &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(
        `Shader optimization warnings for ${type} shader:`,
        performanceWarnings,
      );
    }

    return optimizedCode;
  }

  /**
   * Optimize uniforms
   */
  private optimizeUniforms(
    uniforms: { [key: string]: THREE.IUniform },
    deviceCapabilities: DeviceCapabilities,
  ): { [key: string]: THREE.IUniform } {
    const optimizedUniforms: { [key: string]: THREE.IUniform } = {};

    Object.entries(uniforms).forEach(([key, uniform]) => {
      // Clone the uniform
      optimizedUniforms[key] = { ...uniform };

      // Optimize texture uniforms for low-performance devices
      if (
        uniform.value instanceof THREE.Texture &&
        deviceCapabilities.performanceLevel === "low"
      ) {
        const texture = uniform.value as THREE.Texture;

        // Reduce texture filtering for better performance
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
      }
    });

    return optimizedUniforms;
  }

  /**
   * Create optimized shader material
   */
  createOptimizedMaterial(
    vertexShader: string,
    fragmentShader: string,
    uniforms: { [key: string]: THREE.IUniform },
    deviceCapabilities: DeviceCapabilities,
    settings: ShaderOptimizationSettings,
  ): THREE.ShaderMaterial {
    const compiledShader = this.optimizeShader(
      vertexShader,
      fragmentShader,
      uniforms,
      deviceCapabilities,
      settings,
    );

    return new THREE.ShaderMaterial({
      vertexShader: compiledShader.vertexShader,
      fragmentShader: compiledShader.fragmentShader,
      uniforms: compiledShader.uniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  /**
   * Precompile common shaders
   */
  precompileCommonShaders(deviceCapabilities: DeviceCapabilities): void {
    const settings: ShaderOptimizationSettings = {
      precision: this.getOptimalPrecision(deviceCapabilities),
      enableOptimizations: true,
      stripComments: true,
      minifyCode: true,
      cacheShaders: true,
    };

    // Common vertex shader
    const commonVertexShader = `
      attribute vec3 position;
      attribute vec2 uv;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Common fragment shaders
    const commonFragmentShaders = [
      // Basic color shader
      `
        uniform vec3 color;
        void main() {
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      // Texture shader
      `
        uniform sampler2D map;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(map, vUv);
        }
      `,
      // Time-based animation shader
      `
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec3 color = 0.5 + 0.5 * cos(time + vUv.xyx + vec3(0, 2, 4));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    ];

    // Precompile all combinations
    commonFragmentShaders.forEach((fragmentShader) => {
      this.optimizeShader(
        commonVertexShader,
        fragmentShader,
        {},
        deviceCapabilities,
        settings,
      );
    });

    console.log(`Precompiled ${commonFragmentShaders.length} common shaders`);
  }

  /**
   * Get compilation statistics
   */
  getCompilationStats(): {
    totalCompilations: number;
    cacheHits: number;
    cacheHitRate: number;
    averageCompilationTime: number;
    totalCompilationTime: number;
    cachedShaders: number;
  } {
    return {
      ...this.compilationStats,
      cacheHitRate:
        this.compilationStats.totalCompilations > 0
          ? (this.compilationStats.cacheHits /
              this.compilationStats.totalCompilations) *
            100
          : 0,
      cachedShaders: this.shaderCache.size,
    };
  }

  /**
   * Clear shader cache
   */
  clearCache(): void {
    this.shaderCache.clear();
    this.compilationStats = {
      totalCompilations: 0,
      cacheHits: 0,
      averageCompilationTime: 0,
      totalCompilationTime: 0,
    };
  }

  /**
   * Get cache size in bytes (estimated)
   */
  getCacheSize(): number {
    let totalSize = 0;

    for (const shader of this.shaderCache.values()) {
      totalSize += shader.vertexShader.length;
      totalSize += shader.fragmentShader.length;
      totalSize += JSON.stringify(shader.uniforms).length;
    }

    return totalSize;
  }

  /**
   * Optimize existing shader material
   */
  optimizeExistingMaterial(
    material: THREE.ShaderMaterial,
    deviceCapabilities: DeviceCapabilities,
  ): THREE.ShaderMaterial {
    const settings: ShaderOptimizationSettings = {
      precision: this.getOptimalPrecision(deviceCapabilities),
      enableOptimizations: true,
      stripComments: true,
      minifyCode: true,
      cacheShaders: true,
    };

    const compiledShader = this.optimizeShader(
      material.vertexShader,
      material.fragmentShader,
      material.uniforms,
      deviceCapabilities,
      settings,
    );

    // Update the existing material
    material.vertexShader = compiledShader.vertexShader;
    material.fragmentShader = compiledShader.fragmentShader;
    material.uniforms = compiledShader.uniforms;
    material.needsUpdate = true;

    return material;
  }
}

// Export singleton instance
export const shaderOptimizer = ShaderOptimizer.getInstance();
