/**
 * Utility Types
 * Based on documents/01_global.md specifications
 */

// Performance optimization types
export interface LazyComponentConfig {
  component: React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType;
}

export interface ImageOptimizationConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "png" | "jpg";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheManager {
  setCache: <T>(key: string, data: T, ttl?: number) => void;
  getCache: <T>(key: string) => T | null;
  clearCache: (pattern?: string) => void;
}

// Memory management types for 3D components
export interface MemoryOptimization {
  disposeThreeObjects: (scene: Record<string, unknown>) => void;
  disposePixiObjects: (app: Record<string, unknown>) => void;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  error?: string;
}

export interface Validators {
  email: (value: string) => boolean;
  required: (value: unknown) => boolean;
  minLength: (value: string, min: number) => boolean;
  maxLength: (value: string, max: number) => boolean;
  url: (value: string) => boolean;
  fileType: (file: File, allowedTypes: string[]) => boolean;
  fileSize: (file: File, maxSize: number) => boolean;
}

// File management types
export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  destination: string;
  generateThumbnail?: boolean;
  optimize?: boolean;
}

export interface ProcessedFile {
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  thumbnailPath?: string;
  optimizedPath?: string;
}

// Color utility types (for tools)
export interface ColorPalette {
  id: string;
  name: string;
  colors: ColorInfo[];
  createdAt: string;
}

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

// Tool configuration types
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  settings: Record<string, unknown>;
  accessibility: {
    keyboardShortcuts: Record<string, string>;
    ariaLabels: Record<string, string>;
    screenReaderSupport: boolean;
  };
}

// Grid system types
export interface GridSystemConfig {
  base: number; // 384px
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  ratios: {
    golden: number; // 1.618
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
  };
}
