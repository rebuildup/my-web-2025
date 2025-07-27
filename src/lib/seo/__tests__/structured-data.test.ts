/**
 * Tests for structured data generation
 */

import {
  generateWebSiteStructuredData,
  generatePersonStructuredData,
  generateCreativeWorkStructuredData,
  generateArticleStructuredData,
  generateWebApplicationStructuredData,
} from "../structured-data";
import { ContentItem } from "@/types/content";

describe("Structured Data Generation", () => {
  const mockConfig = {
    baseUrl: "https://example.com",
    siteName: "Test Site",
    author: {
      name: "Test Author",
      jobTitle: "Developer",
      url: "https://example.com/about",
      sameAs: ["https://twitter.com/test"],
    },
    organization: {
      name: "Test Org",
      url: "https://example.com",
      logo: "https://example.com/logo.png",
    },
  };

  describe("generateWebSiteStructuredData", () => {
    it("should generate valid website structured data", () => {
      const result = generateWebSiteStructuredData(mockConfig);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("WebSite");
      expect(result.name).toBe(mockConfig.siteName);
      expect(result.url).toBe(mockConfig.baseUrl);
      expect(result.author.name).toBe(mockConfig.author.name);
      expect(result.potentialAction["@type"]).toBe("SearchAction");
    });
  });

  describe("generatePersonStructuredData", () => {
    it("should generate valid person structured data", () => {
      const profileData = {
        name: "John Doe",
        jobTitle: "Web Developer",
        description: "A skilled web developer",
        skills: ["JavaScript", "React"],
        awards: ["Best Developer 2023"],
      };

      const result = generatePersonStructuredData(profileData, mockConfig);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("Person");
      expect(result.name).toBe(profileData.name);
      expect(result.jobTitle).toBe(profileData.jobTitle);
      expect(result.knowsAbout).toEqual(profileData.skills);
      expect(result.award).toEqual(profileData.awards);
    });
  });

  describe("generateCreativeWorkStructuredData", () => {
    it("should generate valid creative work structured data", () => {
      const mockItem: ContentItem = {
        id: "test-item",
        type: "portfolio",
        title: "Test Portfolio Item",
        description: "A test portfolio item",
        category: "develop",
        tags: ["JavaScript", "React"],
        status: "published",
        priority: 80,
        createdAt: "2023-01-01T00:00:00Z",
        thumbnail: "/images/test.jpg",
      };

      const result = generateCreativeWorkStructuredData(mockItem, mockConfig);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("SoftwareApplication");
      expect(result.name).toBe(mockItem.title);
      expect(result.description).toBe(mockItem.description);
      expect(result.keywords).toBe(mockItem.tags.join(", "));
      expect(
        (result as { programmingLanguage?: string[] }).programmingLanguage,
      ).toEqual(["JavaScript", "React"]);
    });

    it("should generate VideoObject for video category", () => {
      const mockItem: ContentItem = {
        id: "test-video",
        type: "portfolio",
        title: "Test Video",
        description: "A test video",
        category: "video",
        tags: ["video", "editing"],
        status: "published",
        priority: 80,
        createdAt: "2023-01-01T00:00:00Z",
        videos: [
          {
            type: "youtube",
            url: "https://youtube.com/watch?v=test",
            duration: 120,
          },
        ],
      };

      const result = generateCreativeWorkStructuredData(mockItem, mockConfig);

      expect(result["@type"]).toBe("VideoObject");
      expect((result as { duration?: string }).duration).toBe("PT120S");
    });
  });

  describe("generateArticleStructuredData", () => {
    it("should generate valid article structured data", () => {
      const mockItem: ContentItem = {
        id: "test-article",
        type: "blog",
        title: "Test Article",
        description: "A test blog article",
        category: "tutorial",
        tags: ["tutorial", "javascript"],
        status: "published",
        priority: 70,
        createdAt: "2023-01-01T00:00:00Z",
        content: "This is test content for the article.",
      };

      const result = generateArticleStructuredData(mockItem, mockConfig);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("Article");
      expect(result.headline).toBe(mockItem.title);
      expect(result.articleSection).toBe(mockItem.category);
      expect(result.wordCount).toBe(mockItem.content?.length);
      expect(result.publisher.name).toBe(mockConfig.organization.name);
    });
  });

  describe("generateWebApplicationStructuredData", () => {
    it("should generate valid web application structured data", () => {
      const toolData = {
        name: "Test Tool",
        description: "A test web tool",
        url: "https://example.com/tools/test",
        category: "utility",
        features: ["Feature 1", "Feature 2"],
      };

      const result = generateWebApplicationStructuredData(toolData, mockConfig);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("WebApplication");
      expect(result.name).toBe(toolData.name);
      expect(result.applicationCategory).toBe("UtilityApplication");
      expect(result.featureList).toEqual(toolData.features);
      expect(result.isAccessibleForFree).toBe(true);
      expect(result.offers.price).toBe("0");
    });
  });
});
