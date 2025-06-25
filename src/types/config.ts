export interface SiteConfig {
  // 基本情報
  site: {
    name: string;
    description: string;
    url: string;
    logo: string;
    favicon: string;
  };

  // 作者情報
  author: {
    name: string;
    handle: string;
    email: string;
    bio: string;
    avatar: string;
    location: string;
  };

  // ソーシャルメディア
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    booth?: string;
    [key: string]: string | undefined;
  };

  // ナビゲーション
  navigation: NavigationItem[];

  // テーマ設定
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkMode: boolean;
  };

  // 機能設定
  features: {
    blog: boolean;
    portfolio: boolean;
    tools: boolean;
    shop: boolean;
    comments: boolean;
    analytics: boolean;
  };

  // SEO設定
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultKeywords: string[];
    defaultOgImage: string;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
}
