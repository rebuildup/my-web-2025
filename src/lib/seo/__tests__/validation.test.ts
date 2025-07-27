/**
 * Tests for SEO validation utilities
 */

import {
  validateTitle,
  validateDescription,
  validateKeywords,
  validateOpenGraph,
  validateTwitterCard,
  validateMetadata,
  validateStructuredData,
} from "../validation";
import { Metadata } from "next";

describe("SEO Validation", () => {
  const defaultConfig = {
    maxTitleLength: 60,
    maxDescriptionLength: 160,
    minDescriptionLength: 120,
    maxKeywords: 10,
    requiredOGProperties: ["title", "description", "type", "url", "images"],
    requiredTwitterProperties: ["card", "title", "description", "images"],
  };

  describe("validateTitle", () => {
    it("should validate a good title", () => {
      const result = validateTitle("Great SEO Title", defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should reject empty title", () => {
      const result = validateTitle("", defaultConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required");
    });

    it("should reject null/undefined title", () => {
      const result = validateTitle(null, defaultConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required");
    });

    it("should warn about long title", () => {
      const longTitle =
        "This is a very long title that exceeds the recommended length for SEO";
      const result = validateTitle(longTitle, defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("too long"))).toBe(true);
    });

    it("should warn about short title", () => {
      const result = validateTitle("Short", defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("too short"))).toBe(true);
    });

    it("should warn about duplicate words", () => {
      const result = validateTitle("Test Test Title", defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("duplicate words"))).toBe(
        true,
      );
    });
  });

  describe("validateDescription", () => {
    it("should validate a good description", () => {
      const goodDescription =
        "This is a comprehensive description that provides valuable information about the page content and encourages users to click through to learn more about our services.";
      const result = validateDescription(goodDescription, defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty description", () => {
      const result = validateDescription("", defaultConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Description is required");
    });

    it("should warn about long description", () => {
      const longDescription =
        "This is a very long description that exceeds the recommended length for meta descriptions in search engine results pages and may be truncated by search engines when displayed.";
      const result = validateDescription(longDescription, defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("too long"))).toBe(true);
    });

    it("should warn about short description", () => {
      const result = validateDescription("Short description", defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("too short"))).toBe(true);
    });

    it("should warn about missing action words", () => {
      const result = validateDescription(
        "This is a description without any action words that might encourage clicks from users browsing search results.",
        defaultConfig,
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("action words"))).toBe(
        true,
      );
    });
  });

  describe("validateKeywords", () => {
    it("should validate good keywords array", () => {
      const result = validateKeywords(
        ["seo", "optimization", "web", "development"],
        defaultConfig,
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should validate keywords string", () => {
      const result = validateKeywords(
        "seo, optimization, web, development",
        defaultConfig,
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should warn about too many keywords", () => {
      const manyKeywords = Array.from({ length: 15 }, (_, i) => `keyword${i}`);
      const result = validateKeywords(manyKeywords, defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("Too many keywords"))).toBe(
        true,
      );
    });

    it("should warn about duplicate keywords", () => {
      const result = validateKeywords(
        ["seo", "web", "seo", "development"],
        defaultConfig,
      );

      expect(result.isValid).toBe(true);
      expect(
        result.warnings.some((w) => w.includes("Duplicate keywords")),
      ).toBe(true);
    });

    it("should warn about long keywords", () => {
      const result = validateKeywords(
        ["seo", "this-is-a-very-long-keyword-that-exceeds-normal-length"],
        defaultConfig,
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("Long keywords"))).toBe(
        true,
      );
    });
  });

  describe("validateOpenGraph", () => {
    it("should validate good Open Graph data", () => {
      const ogData = {
        title: "Test Title",
        description: "Test description",
        type: "website" as const,
        url: "https://example.com",
        images: [
          {
            url: "https://example.com/image.jpg",
            width: 1200,
            height: 630,
            alt: "Test image",
          },
        ],
      };

      const result = validateOpenGraph(ogData, defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject missing Open Graph data", () => {
      const result = validateOpenGraph(undefined, defaultConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Open Graph metadata is required");
    });

    it("should reject missing required properties", () => {
      const ogData = {
        title: "Test Title",
        // Missing description, type, url, images
      };

      const result = validateOpenGraph(ogData, defaultConfig);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("description is required")),
      ).toBe(true);
      expect(result.errors.some((e) => e.includes("type is required"))).toBe(
        true,
      );
    });

    it("should warn about image aspect ratio", () => {
      const ogData = {
        title: "Test Title",
        description: "Test description",
        type: "website" as const,
        url: "https://example.com",
        images: [
          {
            url: "https://example.com/image.jpg",
            width: 800,
            height: 800, // Square image, not 1.91:1 ratio
            alt: "Test image",
          },
        ],
      };

      const result = validateOpenGraph(ogData, defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("aspect ratio"))).toBe(
        true,
      );
    });
  });

  describe("validateTwitterCard", () => {
    it("should validate good Twitter Card data", () => {
      const twitterData = {
        card: "summary_large_image" as const,
        title: "Test Title",
        description: "Test description",
        images: ["https://example.com/image.jpg"],
      };

      const result = validateTwitterCard(twitterData, defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject missing Twitter Card data", () => {
      const result = validateTwitterCard(undefined, defaultConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Twitter Card metadata is required");
    });

    it("should reject invalid card type", () => {
      const twitterData = {
        card: "invalid_card_type" as "summary",
        title: "Test Title",
        description: "Test description",
        images: ["https://example.com/image.jpg"],
      };

      const result = validateTwitterCard(twitterData, defaultConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid Twitter card type");
    });
  });

  describe("validateMetadata", () => {
    it("should validate complete metadata object", () => {
      const metadata: Metadata = {
        title: "Good SEO Title",
        description:
          "This is a comprehensive description that provides valuable information about the page content and encourages users to learn more.",
        keywords: ["seo", "optimization", "web"],
        openGraph: {
          title: "Good SEO Title",
          description: "This is a comprehensive description",
          type: "website",
          url: "https://example.com",
          images: [
            {
              url: "https://example.com/image.jpg",
              width: 1200,
              height: 630,
              alt: "Test image",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "Good SEO Title",
          description: "This is a comprehensive description",
          images: ["https://example.com/image.jpg"],
        },
      };

      const result = validateMetadata(metadata, defaultConfig);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(90);
    });

    it("should calculate score based on errors and warnings", () => {
      const badMetadata: Metadata = {
        title: "", // Error
        description: "Short", // Warning
        // Missing other required fields - more errors
      };

      const result = validateMetadata(badMetadata, defaultConfig);

      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(70);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("validateStructuredData", () => {
    it("should validate good structured data", () => {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Test Site",
        description: "A test website",
        url: "https://example.com",
      };

      const result = validateStructuredData(structuredData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject missing @context", () => {
      const structuredData = {
        "@type": "WebSite",
        name: "Test Site",
      };

      const result = validateStructuredData(structuredData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "@context is required in structured data",
      );
    });

    it("should reject missing @type", () => {
      const structuredData = {
        "@context": "https://schema.org",
        name: "Test Site",
      };

      const result = validateStructuredData(structuredData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("@type is required in structured data");
    });

    it("should warn about missing recommended fields", () => {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        // Missing name/headline and description
      };

      const result = validateStructuredData(structuredData);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("name or headline"))).toBe(
        true,
      );
      expect(result.warnings.some((w) => w.includes("description"))).toBe(true);
    });
  });
});
