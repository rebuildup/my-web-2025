import { MetadataRoute } from "next";
import { ContentItem } from "@/types/content";

const baseUrl = "https://yusuke-kim.com";

// API Response type
interface ContentAPIResponse {
  success: boolean;
  data: ContentItem[];
  total?: number;
}

// XML-safe URL encoding function
function encodeXmlUrl(url: string): string {
  return url
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Static routes configuration
const staticRoutes = [
  {
    url: "",
    priority: 1.0,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/about",
    priority: 0.9,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/portfolio",
    priority: 0.9,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/portfolio/gallery/all",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/portfolio/gallery/develop",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/portfolio/gallery/video",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/portfolio/gallery/video&design",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/portfolio/detail/develop",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/portfolio/detail/video",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/portfolio/detail/video&design",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/portfolio/playground/design",
    priority: 0.6,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/portfolio/playground/WebGL",
    priority: 0.6,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/tools",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/workshop",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/workshop/blog",
    priority: 0.7,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/workshop/plugins",
    priority: 0.7,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/workshop/downloads",
    priority: 0.7,
    changeFrequency: "weekly" as const,
  },
  {
    url: "/workshop/analytics",
    priority: 0.5,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/search",
    priority: 0.6,
    changeFrequency: "monthly" as const,
  },
  {
    url: "/privacy-policy",
    priority: 0.3,
    changeFrequency: "yearly" as const,
  },
];

// Fetch dynamic content for sitemap
async function getDynamicRoutes() {
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // Fetch portfolio items
    const portfolioResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/portfolio`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (portfolioResponse.ok) {
      const portfolioData: ContentAPIResponse = await portfolioResponse.json();
      if (portfolioData.success && portfolioData.data) {
        portfolioData.data.forEach((item: ContentItem) => {
          dynamicRoutes.push({
            url: encodeXmlUrl(`${baseUrl}/portfolio/${item.id}`),
            lastModified: item.updatedAt
              ? new Date(item.updatedAt)
              : new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        });
      }
    }

    // Fetch blog posts
    const blogResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/blog`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (blogResponse.ok) {
      const blogData: ContentAPIResponse = await blogResponse.json();
      if (blogData.success && blogData.data) {
        blogData.data.forEach((item: ContentItem) => {
          dynamicRoutes.push({
            url: encodeXmlUrl(`${baseUrl}/workshop/blog/${item.id}`),
            lastModified: item.updatedAt
              ? new Date(item.updatedAt)
              : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        });
      }
    }

    // Fetch plugins
    const pluginResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/plugin`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (pluginResponse.ok) {
      const pluginData: ContentAPIResponse = await pluginResponse.json();
      if (pluginData.success && pluginData.data) {
        pluginData.data.forEach((item: ContentItem) => {
          dynamicRoutes.push({
            url: encodeXmlUrl(`${baseUrl}/workshop/plugins/${item.id}`),
            lastModified: item.updatedAt
              ? new Date(item.updatedAt)
              : new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
          });
        });
      }
    }

    // Fetch downloads
    const downloadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/download`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (downloadResponse.ok) {
      const downloadData: ContentAPIResponse = await downloadResponse.json();
      if (downloadData.success && downloadData.data) {
        downloadData.data.forEach((item: ContentItem) => {
          dynamicRoutes.push({
            url: encodeXmlUrl(`${baseUrl}/workshop/downloads/${item.id}`),
            lastModified: item.updatedAt
              ? new Date(item.updatedAt)
              : new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
          });
        });
      }
    }
  } catch (error) {
    console.error("Error fetching dynamic routes for sitemap:", error);
  }

  return dynamicRoutes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Generate static routes
  const staticSitemapRoutes: MetadataRoute.Sitemap = staticRoutes.map(
    (route) => ({
      url: encodeXmlUrl(`${baseUrl}${route.url}`),
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })
  );

  // Get dynamic routes
  const dynamicRoutes = await getDynamicRoutes();

  // Combine static and dynamic routes
  return [...staticSitemapRoutes, ...dynamicRoutes];
}
