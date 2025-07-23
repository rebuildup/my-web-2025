/**
 * API Response Types
 * Based on documents/01_global.md specifications
 */

import type { ContentItem, ContentType, SearchResult } from "./content";

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  pagination?: PaginationInfo;
  query?: string;
  filters?: Record<string, string | number | boolean>;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// Content API Types
export interface ContentApiParams {
  type?: ContentType;
  category?: string;
  limit?: number;
  offset?: number;
  status?: "published" | "draft" | "archived" | "scheduled";
}

export interface SearchApiRequest {
  query: string;
  type?: ContentType;
  category?: string;
  limit?: number;
  includeContent?: boolean;
}

export interface SearchApiResponse extends ApiResponse<SearchResult[]> {
  query: string;
  filters: {
    type?: ContentType;
    category?: string;
  };
}

// Stats API Types
export interface StatsUpdateRequest {
  id: string;
  type?: "download" | "view";
}

export interface StatsResponse extends ApiResponse<Record<string, number>> {
  totalStats?: number;
  period?: string;
}

// Contact API Types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: "technical" | "design" | "general";
  recaptchaToken: string;
}

export interface ContactApiResponse extends ApiResponse {
  messageId?: string;
}

// Admin API Types
export interface AdminContentRequest {
  action: "create" | "update" | "delete";
  data: Partial<ContentItem> | { id: string };
}

export interface AdminUploadRequest {
  file: File;
  type: "image" | "video" | "document" | "favicon" | "og-image";
}

export interface AdminUploadResponse extends ApiResponse {
  data?: {
    filePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class ContentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ContentError";
  }
}
