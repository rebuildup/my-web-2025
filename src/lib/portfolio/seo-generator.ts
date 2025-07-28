/**
 * SEO Metadata Generation for Portfolio
 * Task 1.2: SEOメタデータ自動生成
 */

import { Metadata } from "next";
import { PortfolioContentItem } from "./data-processor";

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
  structuredData: object;
}

export interface OpenGraphData {
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
  siteName: string;
  locale: string;
}

export interface TwitterCardData {
  card: "summary" | "summary_large_image";
  title: string;
  description: string;
  image: string;
  creator: string;
}

/**
 * SEO Metadata Generator Class
 */
export class SEOMetadataGenerator {
  private readonly BASE_URL = "https://yusuke-kim.com";
  private readonly SITE_NAME = "samuido";
  private readonly TWITTER_CREATOR = "@361do_sleep";

  /**
   * Generate metadata for portfolio gallery pages
   */
  generateGalleryMetadata(galleryType: string): Metadata {
    const titles = {
      all: "全作品ギャラリー",
      develop: "開発作品ギャラリー",
      video: "映像作品ギャラリー",
      "video&design": "映像・デザイン作品ギャラリー",
    };

    const descriptions = {
      all: "samuidoの全作品を時系列・カテゴリ・技術で絞り込み表示。Web開発、ゲーム開発、映像制作、デザインの包括的なポートフォリオ。",
      develop:
        "Web開発・ゲーム開発・技術実装に重点を置いた作品集。React、Unity、TypeScriptなどの技術スタックと実装詳細を紹介。",
      video:
        "映像制作・モーショングラフィックス・アニメーション作品集。After Effects、Premiere Proを使用した制作プロセスも掲載。",
      "video&design":
        "デザインコンセプトと映像表現を融合した作品集。ブランディング、UI/UX、モーショングラフィックスの統合的なアプローチ。",
    };

    const keywords = {
      all: [
        "ポートフォリオ",
        "全作品",
        "Web開発",
        "映像制作",
        "デザイン",
        "ゲーム開発",
      ],
      develop: [
        "Web開発",
        "ゲーム開発",
        "React",
        "Unity",
        "TypeScript",
        "技術実装",
      ],
      video: [
        "映像制作",
        "モーショングラフィックス",
        "After Effects",
        "アニメーション",
      ],
      "video&design": [
        "映像デザイン",
        "ブランディング",
        "UI/UX",
        "モーショングラフィックス",
      ],
    };

    const title = `${titles[galleryType as keyof typeof titles]} - ${this.SITE_NAME} | ポートフォリオ`;
    const description = descriptions[galleryType as keyof typeof descriptions];
    const keywordList = keywords[galleryType as keyof typeof keywords];
    const canonical = `${this.BASE_URL}/portfolio/gallery/${galleryType}`;

    return {
      title,
      description,
      keywords: keywordList,
      robots: "index, follow",
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
            url: `${this.BASE_URL}/images/portfolio/gallery-${galleryType}-og.jpg`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        siteName: this.SITE_NAME,
        locale: "ja_JP",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [
          `${this.BASE_URL}/images/portfolio/gallery-${galleryType}-twitter.jpg`,
        ],
        creator: this.TWITTER_CREATOR,
      },
    };
  }

  /**
   * Generate metadata for portfolio detail pages
   */
  generateDetailMetadata(item: PortfolioContentItem): Metadata {
    const title = `${item.title} - ${this.SITE_NAME} | ポートフォリオ`;
    const description = item.description;
    const keywords = [
      ...item.tags,
      ...item.technologies,
      "ポートフォリオ",
      "作品詳細",
      this.SITE_NAME,
    ];
    const canonical = `${this.BASE_URL}/portfolio/${item.id}`;

    return {
      title,
      description,
      keywords,
      robots: "index, follow",
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        type: "article",
        url: canonical,
        images: [
          {
            url:
              item.thumbnail ||
              `${this.BASE_URL}/images/portfolio/default-og.jpg`,
            width: 1200,
            height: 630,
            alt: item.title,
          },
        ],
        siteName: this.SITE_NAME,
        locale: "ja_JP",
        publishedTime: item.publishedAt,
        modifiedTime: item.updatedAt,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [
          item.thumbnail ||
            `${this.BASE_URL}/images/portfolio/default-twitter.jpg`,
        ],
        creator: this.TWITTER_CREATOR,
      },
    };
  }

  /**
   * Generate metadata for playground pages
   */
  generatePlaygroundMetadata(playgroundType: "design" | "WebGL"): Metadata {
    const titles = {
      design: "デザインプレイグラウンド",
      WebGL: "WebGLプレイグラウンド",
    };

    const descriptions = {
      design:
        "インタラクティブデザイン実験とCSS/JavaScript実装のプレイグラウンド。アニメーション、インタラクション、UI/UXの実験的な取り組み。",
      WebGL:
        "Three.js・WebGLを使用した3Dグラフィックス・シェーダー実験のプレイグラウンド。インタラクティブな3D体験とWebGL技術の探求。",
    };

    const keywords = {
      design: [
        "デザイン実験",
        "インタラクティブ",
        "CSS",
        "JavaScript",
        "アニメーション",
        "UI/UX",
      ],
      WebGL: [
        "WebGL",
        "Three.js",
        "3Dグラフィックス",
        "シェーダー",
        "インタラクティブ",
        "3D",
      ],
    };

    const title = `${titles[playgroundType]} - ${this.SITE_NAME} | ポートフォリオ`;
    const description = descriptions[playgroundType];
    const keywordList = keywords[playgroundType];
    const canonical = `${this.BASE_URL}/portfolio/playground/${playgroundType}`;

    return {
      title,
      description,
      keywords: keywordList,
      robots: "index, follow",
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
            url: `${this.BASE_URL}/images/portfolio/playground-${playgroundType}-og.jpg`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        siteName: this.SITE_NAME,
        locale: "ja_JP",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [
          `${this.BASE_URL}/images/portfolio/playground-${playgroundType}-twitter.jpg`,
        ],
        creator: this.TWITTER_CREATOR,
      },
    };
  }

  /**
   * Generate structured data for portfolio items
   */
  generatePortfolioStructuredData(item: PortfolioContentItem): object {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: item.title,
      description: item.description,
      url: `${this.BASE_URL}/portfolio/${item.id}`,
      creator: {
        "@type": "Person",
        name: "木村友亮",
        alternateName: this.SITE_NAME,
        url: this.BASE_URL,
      },
      dateCreated: item.createdAt,
      dateModified: item.updatedAt || item.createdAt,
      keywords: item.tags.join(", "),
      image: item.thumbnail,
      genre: item.category,
    };

    // Add category-specific structured data
    switch (item.category) {
      case "develop":
        return {
          ...baseData,
          "@type": "SoftwareApplication",
          applicationCategory: "WebApplication",
          programmingLanguage: item.technologies,
          operatingSystem: "Web Browser",
          applicationSubCategory: item.projectType,
        };

      case "video":
        return {
          ...baseData,
          "@type": "VideoObject",
          genre: item.videoType || "Video Production",
          duration: item.duration ? `PT${item.duration}S` : undefined,
          uploadDate: item.publishedAt,
          thumbnailUrl: item.thumbnail,
        };

      case "design":
        return {
          ...baseData,
          "@type": "VisualArtwork",
          artMedium: "Digital Design",
          artworkSurface: "Digital",
        };

      default:
        return baseData;
    }
  }

  /**
   * Generate structured data for gallery pages
   */
  generateGalleryStructuredData(
    galleryType: string,
    items: PortfolioContentItem[],
  ): object {
    const titles = {
      all: "全作品ギャラリー",
      develop: "開発作品ギャラリー",
      video: "映像作品ギャラリー",
      "video&design": "映像・デザイン作品ギャラリー",
    };

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: titles[galleryType as keyof typeof titles],
      description: `${this.SITE_NAME}の${titles[galleryType as keyof typeof titles]}`,
      url: `${this.BASE_URL}/portfolio/gallery/${galleryType}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: items.length,
        itemListElement: items.slice(0, 10).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            name: item.title,
            description: item.description,
            url: `${this.BASE_URL}/portfolio/${item.id}`,
            image: item.thumbnail,
          },
        })),
      },
      creator: {
        "@type": "Person",
        name: "木村友亮",
        alternateName: this.SITE_NAME,
        url: this.BASE_URL,
      },
    };
  }

  /**
   * Generate sitemap entries for portfolio pages
   */
  generateSitemapEntries(items: PortfolioContentItem[]): Array<{
    url: string;
    lastModified: Date;
    changeFrequency: "weekly" | "monthly";
    priority: number;
  }> {
    const staticPages = [
      {
        url: `${this.BASE_URL}/portfolio`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: `${this.BASE_URL}/portfolio/gallery/all`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      },
      {
        url: `${this.BASE_URL}/portfolio/gallery/develop`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      },
      {
        url: `${this.BASE_URL}/portfolio/gallery/video`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      },
      {
        url: `${this.BASE_URL}/portfolio/gallery/video&design`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      },
      {
        url: `${this.BASE_URL}/portfolio/playground/design`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${this.BASE_URL}/portfolio/playground/WebGL`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
    ];

    const dynamicPages = items.map((item) => ({
      url: `${this.BASE_URL}/portfolio/${item.id}`,
      lastModified: new Date(item.updatedAt || item.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...dynamicPages];
  }
}

// Export singleton instance
export const seoMetadataGenerator = new SEOMetadataGenerator();
