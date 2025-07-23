/**
 * Navigation Types
 * Based on documents/01_global.md specifications
 */

export interface NavigationItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
  disabled?: boolean;
  priority: number;
}

export interface PageConfig {
  id: string;
  title: string;
  description: string;
  url: string;
  content: {
    source: "static" | "dynamic" | "api";
    data?: Record<string, unknown>;
    apiEndpoint?: string;
  };
  layout: {
    type: "default" | "custom";
    grid?: GridConfig;
    components?: string[];
  };
  seo: import("./content").SEOData;
  features: {
    search: boolean;
    comments: boolean;
    share: boolean;
  };
}

export interface GridConfig {
  columns: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  gap: string;
  padding: string;
}

// Re-export SEOData from content types for consistency
export type { SEOData } from "./content";
