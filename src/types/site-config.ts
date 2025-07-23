/**
 * Site Configuration Types
 * Based on documents/01_global.md specifications
 */

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
