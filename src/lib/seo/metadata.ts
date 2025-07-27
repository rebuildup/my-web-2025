/**
 * Comprehensive SEO Metadata Generator
 * Generates Next.js Metadata objects for all content types
 */

import { Metadata } from "next";
import { ContentItem } from "@/types/content";

export interface SEOConfig {
  baseUrl: string;
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  author: {
    name: string;
    twitter: string;
  };
  images: {
    ogImage: string;
    twitterImage: string;
    favicon: string;
  };
}

const defaultSEOConfig: SEOConfig = {
  baseUrl: "https://yusuke-kim.com",
  siteName: "samuido",
  defaultTitle: "samuidoのサイトルート",
  defaultDescription:
    "フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました",
  defaultKeywords: [
    "ポートフォリオ",
    "Webデザイン",
    "フロントエンド開発",
    "ツール",
    "プラグイン",
    "ブログ",
    "samuido",
    "木村友亮",
  ],
  author: {
    name: "samuido",
    twitter: "@361do_sleep",
  },
  images: {
    ogImage: "/images/og-image.jpg",
    twitterImage: "/images/twitter-image.jpg",
    favicon: "/favicon.ico",
  },
};

/**
 * Generate base metadata for any page
 */
export function generateBaseMetadata(
  pageData: {
    title?: string;
    description?: string;
    keywords?: string[];
    path: string;
    noindex?: boolean;
    nofollow?: boolean;
    ogImage?: string;
    twitterImage?: string;
  },
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  const title = pageData.title
    ? `${pageData.title} - ${config.siteName}`
    : config.defaultTitle;
  const description = pageData.description || config.defaultDescription;
  const keywords = pageData.keywords || config.defaultKeywords;
  const canonical = `${config.baseUrl}${pageData.path}`;
  const ogImage = pageData.ogImage || config.images.ogImage;
  const twitterImage = pageData.twitterImage || config.images.twitterImage;

  const robots = [];
  if (pageData.noindex) robots.push("noindex");
  else robots.push("index");
  if (pageData.nofollow) robots.push("nofollow");
  else robots.push("follow");

  return {
    title,
    description,
    keywords,
    authors: [{ name: config.author.name, url: `${config.baseUrl}/about` }],
    creator: config.author.name,
    publisher: config.author.name,
    robots: robots.join(", "),
    metadataBase: new URL(config.baseUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: [
        {
          url: `${config.baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: config.siteName,
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${config.baseUrl}${twitterImage}`],
      creator: config.author.twitter,
    },
  };
}

/**
 * Generate metadata for portfolio pages
 */
export function generatePortfolioMetadata(
  item: ContentItem,
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  const baseMetadata = generateBaseMetadata(
    {
      title: item.title,
      description: item.description,
      keywords: [...config.defaultKeywords, ...item.tags],
      path: `/portfolio/${item.id}`,
      ogImage: item.thumbnail || config.images.ogImage,
      twitterImage: item.thumbnail || config.images.twitterImage,
    },
    config,
  );

  // Add portfolio-specific Open Graph properties
  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      publishedTime: item.publishedAt || item.createdAt,
      modifiedTime: item.updatedAt || item.createdAt,
      authors: [config.author.name],
      tags: item.tags,
    },
  };
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogMetadata(
  item: ContentItem,
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  const baseMetadata = generateBaseMetadata(
    {
      title: item.title,
      description: item.description,
      keywords: [...config.defaultKeywords, ...item.tags, "ブログ", "記事"],
      path: `/workshop/blog/${item.id}`,
      ogImage: item.thumbnail || config.images.ogImage,
      twitterImage: item.thumbnail || config.images.twitterImage,
    },
    config,
  );

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      publishedTime: item.publishedAt || item.createdAt,
      modifiedTime: item.updatedAt || item.createdAt,
      authors: [config.author.name],
      section: item.category,
      tags: item.tags,
    },
  };
}

/**
 * Generate metadata for plugin pages
 */
export function generatePluginMetadata(
  item: ContentItem,
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  const baseMetadata = generateBaseMetadata(
    {
      title: item.title,
      description: item.description,
      keywords: [
        ...config.defaultKeywords,
        ...item.tags,
        "プラグイン",
        "ダウンロード",
        "無料",
      ],
      path: `/workshop/plugins/${item.id}`,
      ogImage: item.thumbnail || config.images.ogImage,
      twitterImage: item.thumbnail || config.images.twitterImage,
    },
    config,
  );

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "website",
    },
  };
}

/**
 * Generate metadata for tool pages
 */
export function generateToolMetadata(
  toolData: {
    name: string;
    description: string;
    keywords: string[];
    path: string;
  },
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  return generateBaseMetadata(
    {
      title: toolData.name,
      description: toolData.description,
      keywords: [
        ...config.defaultKeywords,
        ...toolData.keywords,
        "ツール",
        "無料",
      ],
      path: toolData.path,
    },
    config,
  );
}

/**
 * Generate metadata for gallery pages
 */
export function generateGalleryMetadata(
  galleryData: {
    title: string;
    description: string;
    category: string;
    path: string;
    itemCount: number;
  },
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  return generateBaseMetadata(
    {
      title: galleryData.title,
      description: `${galleryData.description} (${galleryData.itemCount}件)`,
      keywords: [
        ...config.defaultKeywords,
        "ギャラリー",
        "作品集",
        galleryData.category,
      ],
      path: galleryData.path,
    },
    config,
  );
}

/**
 * Generate metadata for search pages
 */
export function generateSearchMetadata(
  query?: string,
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  const title = query ? `"${query}"の検索結果` : "サイト内検索";
  const description = query
    ? `"${query}"に関する検索結果を表示しています。`
    : "サイト内のコンテンツを検索できます。ポートフォリオ、ブログ、ツールなどから目的の情報を見つけてください。";

  return generateBaseMetadata(
    {
      title,
      description,
      keywords: [...config.defaultKeywords, "検索", "サイト内検索"],
      path: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
      noindex: !!query, // Search result pages should not be indexed
    },
    config,
  );
}

/**
 * Generate metadata for contact page
 */
export function generateContactMetadata(
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  return generateBaseMetadata(
    {
      title: "お問い合わせ",
      description:
        "samuidoへのお問い合わせページ。開発・デザイン・動画制作に関するご相談やご依頼をお受けしています。",
      keywords: [
        ...config.defaultKeywords,
        "お問い合わせ",
        "連絡先",
        "依頼",
        "相談",
      ],
      path: "/contact",
    },
    config,
  );
}

/**
 * Generate metadata for about pages
 */
export function generateAboutMetadata(
  pageType: "main" | "profile" | "commission" | "links",
  subType?: string,
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  const titles = {
    main: "About - 自己紹介",
    profile: "プロフィール",
    commission: "制作依頼・料金",
    links: "リンク集",
  };

  const descriptions = {
    main: "フロントエンドエンジニアsamuidoの自己紹介ページ。スキル、経歴、制作実績などを紹介しています。",
    profile:
      "samuidoの詳細なプロフィール情報。経歴、スキル、受賞歴などを掲載しています。",
    commission:
      "制作依頼の料金体系と依頼方法について。開発・デザイン・動画制作のご相談を承ります。",
    links: "samuidoの各種SNSアカウントや外部サイトへのリンク集です。",
  };

  const paths = {
    main: "/about",
    profile: `/about/profile${subType ? `/${subType}` : ""}`,
    commission: `/about/commission${subType ? `/${subType}` : ""}`,
    links: "/about/links",
  };

  return generateBaseMetadata(
    {
      title: titles[pageType],
      description: descriptions[pageType],
      keywords: [
        ...config.defaultKeywords,
        "自己紹介",
        "プロフィール",
        "経歴",
        "スキル",
      ],
      path: paths[pageType],
    },
    config,
  );
}

/**
 * Generate metadata for admin pages (development only)
 */
export function generateAdminMetadata(
  pageType: "main" | "data-manager",
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  const titles = {
    main: "Admin Panel",
    "data-manager": "Data Manager",
  };

  const descriptions = {
    main: "開発環境専用の管理パネル",
    "data-manager": "コンテンツデータ管理ツール",
  };

  const paths = {
    main: "/admin",
    "data-manager": "/admin/data-manager",
  };

  return generateBaseMetadata(
    {
      title: titles[pageType],
      description: descriptions[pageType],
      keywords: ["admin", "管理", "開発"],
      path: paths[pageType],
      noindex: true, // Admin pages should never be indexed
      nofollow: true,
    },
    config,
  );
}

/**
 * Generate metadata for error pages
 */
export function generateErrorMetadata(
  errorType: "404" | "500",
  config: SEOConfig = defaultSEOConfig,
): Metadata {
  const titles = {
    "404": "ページが見つかりません",
    "500": "サーバーエラー",
  };

  const descriptions = {
    "404":
      "お探しのページは見つかりませんでした。URLをご確認いただくか、サイト内検索をご利用ください。",
    "500":
      "サーバーエラーが発生しました。しばらく時間をおいてから再度アクセスしてください。",
  };

  return generateBaseMetadata(
    {
      title: titles[errorType],
      description: descriptions[errorType],
      keywords: [...config.defaultKeywords, "エラー", errorType],
      path: `/${errorType}`,
      noindex: true, // Error pages should not be indexed
    },
    config,
  );
}
