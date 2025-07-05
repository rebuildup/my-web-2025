// TypeScript type definitions for content management
export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: "published" | "draft" | "archived" | "scheduled";
  priority: number; // 0-100
  createdAt: string; // ISO 8601
  updatedAt?: string;
  publishedAt?: string;

  thumbnail?: string;
  images?: string[];
  videos?: MediaEmbed[];
  externalLinks?: ExternalLink[];
  downloadInfo?: DownloadInfo;
  content?: string; // Markdown or HTML
  contentPath?: string; // Markdown path
  stats?: ContentStats;
  seo?: SEOData;
  customFields?: Record<string, any>;
}

export type ContentType =
  | "portfolio"
  | "plugin"
  | "blog"
  | "profile"
  | "page"
  | "tool"
  | "asset"
  | "download";

export interface MediaEmbed {
  type: "youtube" | "vimeo" | "code" | "social" | "iframe";
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ExternalLink {
  type: "github" | "demo" | "booth" | "website" | "other";
  url: string;
  title: string;
  description?: string;
}

export interface DownloadInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  price?: number;
  version?: string;
  downloadCount: number;
  lastDownloaded?: string;
}

export interface ContentStats {
  views: number;
  downloads?: number;
  likes?: number;
  shares?: number;
  lastViewed?: string;
}

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  language: string;
  author: AuthorInfo;
  theme: ThemeConfig;
  features: FeatureConfig;
  integrations: IntegrationConfig;
  seo: GlobalSEOConfig;
}

export interface AuthorInfo {
  name: string;
  alternateName: string;
  email: string;
  jobTitle: string;
  description: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: "twitter" | "github" | "linkedin" | "instagram";
  url: string;
  username: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface FeatureConfig {
  search: boolean;
  comments: boolean;
  rss: boolean;
  analytics: boolean;
  admin: boolean;
}

export interface IntegrationConfig {
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
  };
  adobeFonts: {
    enabled: boolean;
    kitId: string;
  };
  recaptcha: {
    enabled: boolean;
    siteKey: string;
  };
  resend: {
    enabled: boolean;
    apiKey: string;
  };
}

export interface GlobalSEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  defaultTwitterImage: string;
  siteName: string;
  locale: string;
}

export interface FormConfig {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  validation: ValidationRule[];
  submitConfig: SubmitConfig;
  successMessage?: string;
  errorMessage?: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation[];
  options?: FormFieldOption[];
  defaultValue?: any;
}

export type FormFieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "calculator";

export interface FormFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FieldValidation {
  type: "required" | "email" | "minLength" | "maxLength" | "pattern" | "custom";
  value?: any;
  message: string;
}

export interface ValidationRule {
  fieldId: string;
  rules: FieldValidation[];
}

export interface SubmitConfig {
  method: "POST";
  action: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

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
    data?: any;
    apiEndpoint?: string;
  };
  layout: {
    type: "default" | "custom";
    grid?: GridConfig;
    components?: string[];
  };
  seo: SEOData;
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

export interface SearchIndex {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  searchableContent: string;
}

export interface SearchResult {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  url: string;
  score: number;
  highlights: string[];
}

export interface StatData {
  downloads: Record<string, number>;
  views: Record<string, number>;
  searches: Record<string, number>;
  lastUpdated: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export class ContentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "ContentError";
  }
}