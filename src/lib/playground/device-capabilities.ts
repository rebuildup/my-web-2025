/**
 * Device Capabilities Detection for Playground Optimization
 * Detects device performance level and capabilities for optimal experiment settings
 */

import { DeviceCapabilities, PerformanceSettings } from "@/types/playground";

interface PerformanceMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Detect device capabilities for playground optimization
 */
export class DeviceCapabilitiesDetector {
  private static instance: DeviceCapabilitiesDetector;
  private capabilities: DeviceCapabilities | null = null;

  static getInstance(): DeviceCapabilitiesDetector {
    if (!DeviceCapabilitiesDetector.instance) {
      DeviceCapabilitiesDetector.instance = new DeviceCapabilitiesDetector();
    }
    return DeviceCapabilitiesDetector.instance;
  }

  /**
   * Get device capabilities with caching
   */
  async getCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    this.capabilities = await this.detectCapabilities();
    return this.capabilities;
  }

  /**
   * Force refresh capabilities detection
   */
  async refreshCapabilities(): Promise<DeviceCapabilities> {
    this.capabilities = null;
    return this.getCapabilities();
  }

  /**
   * Detect all device capabilities
   */
  private async detectCapabilities(): Promise<DeviceCapabilities> {
    const webglSupport = this.detectWebGLSupport();
    const webgl2Support = this.detectWebGL2Support();
    const performanceLevel = await this.detectPerformanceLevel();
    const touchSupport = this.detectTouchSupport();
    const maxTextureSize = this.detectMaxTextureSize();
    const devicePixelRatio = this.getDevicePixelRatio();
    const hardwareConcurrency = this.getHardwareConcurrency();
    const memoryLimit = this.estimateMemoryLimit();

    return {
      webglSupport,
      webgl2Support,
      performanceLevel,
      touchSupport,
      maxTextureSize,
      devicePixelRatio,
      hardwareConcurrency,
      memoryLimit,
    };
  }

  /**
   * Detect WebGL support
   */
  private detectWebGLSupport(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    } catch {
      return false;
    }
  }

  /**
   * Detect WebGL2 support
   */
  private detectWebGL2Support(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      return !!gl;
    } catch {
      return false;
    }
  }

  /**
   * Detect device performance level through benchmarking
   */
  private async detectPerformanceLevel(): Promise<"low" | "medium" | "high"> {
    try {
      // Quick performance benchmark
      const startTime = performance.now();

      // CPU benchmark: Array operations
      const arraySize = 100000;
      const testArray = new Array(arraySize).fill(0).map((_, i) => i);
      testArray.sort((a, b) => Math.sin(a) - Math.sin(b));

      const cpuTime = performance.now() - startTime;

      // GPU benchmark if WebGL is available
      let gpuScore = 0;
      if (this.detectWebGLSupport()) {
        gpuScore = await this.benchmarkGPU();
      }

      // Memory benchmark
      const memoryScore = this.benchmarkMemory();

      // Calculate overall performance score
      const cpuScore = Math.max(0, 100 - cpuTime); // Lower time = higher score
      const totalScore = (cpuScore + gpuScore + memoryScore) / 3;

      if (totalScore > 70) return "high";
      if (totalScore > 40) return "medium";
      return "low";
    } catch {
      console.warn("Performance detection failed");
      return "medium"; // Safe default
    }
  }

  /**
   * GPU benchmark using WebGL
   */
  private async benchmarkGPU(): Promise<number> {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;

      const gl = canvas.getContext("webgl");
      if (!gl) return 0;

      // Simple fragment shader benchmark
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

      if (!vertexShader || !fragmentShader) return 0;

      const vertexSource = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fragmentSource = `
        precision mediump float;
        uniform float time;
        void main() {
          vec2 uv = gl_FragCoord.xy / 256.0;
          float color = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time);
          gl_FragColor = vec4(color, color, color, 1.0);
        }
      `;

      gl.shaderSource(vertexShader, vertexSource);
      gl.shaderSource(fragmentShader, fragmentSource);
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);

      const program = gl.createProgram();
      if (!program) return 0;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      const startTime = performance.now();

      // Render multiple frames
      for (let i = 0; i < 60; i++) {
        gl.useProgram(program);
        gl.uniform1f(gl.getUniformLocation(program, "time"), i * 0.016);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      const gpuTime = performance.now() - startTime;
      return Math.max(0, 100 - gpuTime); // Lower time = higher score
    } catch {
      return 0;
    }
  }

  /**
   * Memory benchmark
   */
  private benchmarkMemory(): number {
    try {
      const memory = (performance as { memory?: PerformanceMemory }).memory;
      if (memory) {
        const usedRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        return Math.max(0, 100 - usedRatio * 100);
      }

      // Fallback: Test array allocation speed
      const startTime = performance.now();
      const testArrays = [];
      for (let i = 0; i < 1000; i++) {
        testArrays.push(new Array(1000).fill(Math.random()));
      }
      const memoryTime = performance.now() - startTime;

      return Math.max(0, 100 - memoryTime);
    } catch {
      return 50; // Default score
    }
  }

  /**
   * Detect touch support
   */
  private detectTouchSupport(): boolean {
    const nav = navigator as { msMaxTouchPoints?: number };
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (nav.msMaxTouchPoints || 0) > 0
    );
  }

  /**
   * Detect maximum texture size for WebGL
   */
  private detectMaxTextureSize(): number {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");
      if (!gl) return 2048; // Safe default

      return gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048;
    } catch {
      return 2048; // Safe default
    }
  }

  /**
   * Get device pixel ratio
   */
  private getDevicePixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * Get hardware concurrency (CPU cores)
   */
  private getHardwareConcurrency(): number {
    return navigator.hardwareConcurrency || 4; // Default to 4 cores
  }

  /**
   * Estimate memory limit
   */
  private estimateMemoryLimit(): number {
    try {
      const memory = (performance as { memory?: PerformanceMemory }).memory;
      if (memory && memory.jsHeapSizeLimit) {
        return Math.floor(memory.jsHeapSizeLimit / (1024 * 1024)); // Convert to MB
      }

      // Fallback estimation based on device type
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes("mobile") || userAgent.includes("android")) {
        return 512; // Mobile devices typically have less memory
      }

      return 2048; // Desktop default
    } catch {
      return 1024; // Safe default
    }
  }

  /**
   * Get recommended performance settings based on capabilities
   */
  getRecommendedSettings(
    capabilities: DeviceCapabilities,
  ): PerformanceSettings {
    const settings: PerformanceSettings = {
      targetFPS: 60,
      qualityLevel: "medium",
      enableOptimizations: true,
    };

    // Adjust based on performance level
    switch (capabilities.performanceLevel) {
      case "high":
        settings.qualityLevel = "high";
        break;

      case "low":
        settings.targetFPS = 30;
        settings.qualityLevel = "low";
        break;

      default: // medium
        // Use default settings
        break;
    }

    // Adjust for WebGL support
    if (!capabilities.webglSupport) {
      settings.qualityLevel = "low";
      settings.enableOptimizations = true;
    }

    // Adjust for mobile devices
    if (capabilities.touchSupport && capabilities.devicePixelRatio > 2) {
      settings.targetFPS = Math.min(settings.targetFPS, 30);
    }

    return settings;
  }
}

// Export singleton instance
export const deviceCapabilitiesDetector =
  DeviceCapabilitiesDetector.getInstance();
