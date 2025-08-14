/**
 * @jest-environment jsdom
 */

import {
  CanonicalConfig,
  extractPathFromCanonical,
  generateAboutCanonicalUrl,
  generateAlternateUrls,
  generateCanonicalUrl,
  generateContentCanonicalUrl,
  generateGalleryCanonicalUrl,
  generateToolCanonicalUrl,
  generateWorkshopCanonicalUrl,
  validateCanonicalUrl,
} from "../canonical";

describe("Canonical URL Management", () => {
  const defaultConfig: CanonicalConfig = {
    baseUrl: "https://yusuke-kim.com",
    trailingSlash: false,
    forceHttps: true,
  };

  const customConfig: CanonicalConfig = {
    baseUrl: "http://example.com",
    trailingSlash: true,
    forceHttps: false,
  };

  describe("generateCanonicalUrl", () => {
    it("should generate canonical URL with default config", () => {
      const url = generateCanonicalUrl("/about");
      expect(url).toBe("https://yusuke-kim.com/about");
    });

    it("should handle path without leading slash", () => {
      const url = generateCanonicalUrl("about");
      expect(url).toBe("https://yusuke-kim.com/about");
    });

    it("should handle root path", () => {
      const url = generateCanonicalUrl("/");
      expect(url).toBe("https://yusuke-kim.com/");
    });

    it("should remove trailing slash by default", () => {
      const url = generateCanonicalUrl("/about/");
      expect(url).toBe("https://yusuke-kim.com/about");
    });

    it("should preserve root path trailing slash", () => {
      const url = generateCanonicalUrl("/");
      expect(url).toBe("https://yusuke-kim.com/");
    });

    it("should add trailing slash when configured", () => {
      const config = { ...defaultConfig, trailingSlash: true };
      const url = generateCanonicalUrl("/about", config);
      expect(url).toBe("https://yusuke-kim.com/about/");
    });

    it("should not add trailing slash to root when configured", () => {
      const config = { ...defaultConfig, trailingSlash: true };
      const url = generateCanonicalUrl("/", config);
      expect(url).toBe("https://yusuke-kim.com/");
    });

    it("should force HTTPS when configured", () => {
      const config = { ...customConfig, forceHttps: true };
      const url = generateCanonicalUrl("/about", config);
      expect(url).toBe("https://example.com/about/");
    });

    it("should preserve HTTP when forceHttps is false", () => {
      const url = generateCanonicalUrl("/about", customConfig);
      expect(url).toBe("http://example.com/about/");
    });

    it("should handle complex paths", () => {
      const url = generateCanonicalUrl("/portfolio/gallery/develop");
      expect(url).toBe("https://yusuke-kim.com/portfolio/gallery/develop");
    });

    it("should handle empty path", () => {
      const url = generateCanonicalUrl("");
      expect(url).toBe("https://yusuke-kim.com/");
    });
  });

  describe("generateContentCanonicalUrl", () => {
    it("should generate portfolio content URL", () => {
      const url = generateContentCanonicalUrl("portfolio", "project-123");
      expect(url).toBe("https://yusuke-kim.com/portfolio/project-123");
    });

    it("should generate blog content URL", () => {
      const url = generateContentCanonicalUrl("blog", "my-blog-post");
      expect(url).toBe("https://yusuke-kim.com/workshop/blog/my-blog-post");
    });

    it("should generate plugin content URL", () => {
      const url = generateContentCanonicalUrl("plugin", "my-plugin");
      expect(url).toBe("https://yusuke-kim.com/workshop/plugins/my-plugin");
    });

    it("should generate download content URL", () => {
      const url = generateContentCanonicalUrl("download", "my-download");
      expect(url).toBe("https://yusuke-kim.com/workshop/downloads/my-download");
    });

    it("should generate tool content URL", () => {
      const url = generateContentCanonicalUrl("tool", "color-palette");
      expect(url).toBe("https://yusuke-kim.com/tools/color-palette");
    });

    it("should work with custom config", () => {
      const url = generateContentCanonicalUrl(
        "portfolio",
        "project-123",
        customConfig,
      );
      expect(url).toBe("http://example.com/portfolio/project-123/");
    });
  });

  describe("generateGalleryCanonicalUrl", () => {
    it("should generate all gallery URL", () => {
      const url = generateGalleryCanonicalUrl("all");
      expect(url).toBe("https://yusuke-kim.com/portfolio/gallery/all");
    });

    it("should generate develop gallery URL", () => {
      const url = generateGalleryCanonicalUrl("develop");
      expect(url).toBe("https://yusuke-kim.com/portfolio/gallery/develop");
    });

    it("should generate video gallery URL", () => {
      const url = generateGalleryCanonicalUrl("video");
      expect(url).toBe("https://yusuke-kim.com/portfolio/gallery/video");
    });

    it("should generate video&design gallery URL", () => {
      const url = generateGalleryCanonicalUrl("video&design");
      expect(url).toBe("https://yusuke-kim.com/portfolio/gallery/video&design");
    });

    it("should work with custom config", () => {
      const url = generateGalleryCanonicalUrl("develop", customConfig);
      expect(url).toBe("http://example.com/portfolio/gallery/develop/");
    });
  });

  describe("generateAboutCanonicalUrl", () => {
    it("should generate main about URL", () => {
      const url = generateAboutCanonicalUrl("main");
      expect(url).toBe("https://yusuke-kim.com/about");
    });

    it("should generate profile about URL", () => {
      const url = generateAboutCanonicalUrl("profile");
      expect(url).toBe("https://yusuke-kim.com/about/profile");
    });

    it("should generate commission about URL", () => {
      const url = generateAboutCanonicalUrl("commission");
      expect(url).toBe("https://yusuke-kim.com/about/commission");
    });

    it("should generate links about URL", () => {
      const url = generateAboutCanonicalUrl("links");
      expect(url).toBe("https://yusuke-kim.com/about/links");
    });

    it("should generate about URL with subsection", () => {
      const url = generateAboutCanonicalUrl("profile", "real");
      expect(url).toBe("https://yusuke-kim.com/about/profile/real");
    });

    it("should generate commission estimate URL", () => {
      const url = generateAboutCanonicalUrl("commission", "estimate");
      expect(url).toBe("https://yusuke-kim.com/about/commission/estimate");
    });

    it("should work with custom config", () => {
      const url = generateAboutCanonicalUrl("profile", "real", customConfig);
      expect(url).toBe("http://example.com/about/profile/real/");
    });
  });

  describe("generateWorkshopCanonicalUrl", () => {
    it("should generate main workshop URL", () => {
      const url = generateWorkshopCanonicalUrl("main");
      expect(url).toBe("https://yusuke-kim.com/workshop");
    });

    it("should generate blog workshop URL", () => {
      const url = generateWorkshopCanonicalUrl("blog");
      expect(url).toBe("https://yusuke-kim.com/workshop/blog");
    });

    it("should generate plugins workshop URL", () => {
      const url = generateWorkshopCanonicalUrl("plugins");
      expect(url).toBe("https://yusuke-kim.com/workshop/plugins");
    });

    it("should generate downloads workshop URL", () => {
      const url = generateWorkshopCanonicalUrl("downloads");
      expect(url).toBe("https://yusuke-kim.com/workshop/downloads");
    });

    it("should generate analytics workshop URL", () => {
      const url = generateWorkshopCanonicalUrl("analytics");
      expect(url).toBe("https://yusuke-kim.com/workshop/analytics");
    });

    it("should work with custom config", () => {
      const url = generateWorkshopCanonicalUrl("blog", customConfig);
      expect(url).toBe("http://example.com/workshop/blog/");
    });
  });

  describe("generateToolCanonicalUrl", () => {
    it("should generate main tools URL", () => {
      const url = generateToolCanonicalUrl();
      expect(url).toBe("https://yusuke-kim.com/tools");
    });

    it("should generate specific tool URL", () => {
      const url = generateToolCanonicalUrl("color-palette");
      expect(url).toBe("https://yusuke-kim.com/tools/color-palette");
    });

    it("should generate QR generator tool URL", () => {
      const url = generateToolCanonicalUrl("qr-generator");
      expect(url).toBe("https://yusuke-kim.com/tools/qr-generator");
    });

    it("should work with custom config", () => {
      const url = generateToolCanonicalUrl("color-palette", customConfig);
      expect(url).toBe("http://example.com/tools/color-palette/");
    });
  });

  describe("validateCanonicalUrl", () => {
    it("should validate correct HTTPS URL", () => {
      const isValid = validateCanonicalUrl("https://yusuke-kim.com/about");
      expect(isValid).toBe(true);
    });

    it("should reject HTTP URL", () => {
      const isValid = validateCanonicalUrl("http://yusuke-kim.com/about");
      expect(isValid).toBe(false);
    });

    it("should reject URL with query parameters", () => {
      const isValid = validateCanonicalUrl(
        "https://yusuke-kim.com/about?param=value",
      );
      expect(isValid).toBe(false);
    });

    it("should reject URL with hash fragment", () => {
      const isValid = validateCanonicalUrl(
        "https://yusuke-kim.com/about#section",
      );
      expect(isValid).toBe(false);
    });

    it("should reject invalid URL", () => {
      const isValid = validateCanonicalUrl("not-a-url");
      expect(isValid).toBe(false);
    });

    it("should reject URL without hostname", () => {
      const isValid = validateCanonicalUrl("https://");
      expect(isValid).toBe(false);
    });

    it("should validate root URL", () => {
      const isValid = validateCanonicalUrl("https://yusuke-kim.com/");
      expect(isValid).toBe(true);
    });

    it("should validate complex path URL", () => {
      const isValid = validateCanonicalUrl(
        "https://yusuke-kim.com/portfolio/gallery/develop",
      );
      expect(isValid).toBe(true);
    });
  });

  describe("extractPathFromCanonical", () => {
    it("should extract path from canonical URL", () => {
      const path = extractPathFromCanonical("https://yusuke-kim.com/about");
      expect(path).toBe("/about");
    });

    it("should extract root path", () => {
      const path = extractPathFromCanonical("https://yusuke-kim.com/");
      expect(path).toBe("/");
    });

    it("should extract complex path", () => {
      const path = extractPathFromCanonical(
        "https://yusuke-kim.com/portfolio/gallery/develop",
      );
      expect(path).toBe("/portfolio/gallery/develop");
    });

    it("should return root for different domain", () => {
      const path = extractPathFromCanonical("https://other-domain.com/about");
      expect(path).toBe("/");
    });

    it("should return root for invalid URL", () => {
      const path = extractPathFromCanonical("not-a-url");
      expect(path).toBe("/");
    });

    it("should work with custom config", () => {
      const path = extractPathFromCanonical(
        "http://example.com/about",
        customConfig,
      );
      expect(path).toBe("/about");
    });

    it("should handle URL with trailing slash", () => {
      const path = extractPathFromCanonical("https://yusuke-kim.com/about/");
      expect(path).toBe("/about/");
    });
  });

  describe("generateAlternateUrls", () => {
    it("should generate alternate URLs for default language", () => {
      const alternates = generateAlternateUrls("/about");
      expect(alternates).toEqual({
        ja: "https://yusuke-kim.com/about",
      });
    });

    it("should generate alternate URLs for multiple languages", () => {
      const alternates = generateAlternateUrls("/about", ["ja", "en"]);
      expect(alternates).toEqual({
        ja: "https://yusuke-kim.com/about",
        en: "https://yusuke-kim.com/en/about",
      });
    });

    it("should generate alternate URLs for multiple languages with custom config", () => {
      const alternates = generateAlternateUrls(
        "/about",
        ["ja", "en", "fr"],
        customConfig,
      );
      expect(alternates).toEqual({
        ja: "http://example.com/about/",
        en: "http://example.com/en/about/",
        fr: "http://example.com/fr/about/",
      });
    });

    it("should handle root path", () => {
      const alternates = generateAlternateUrls("/", ["ja", "en"]);
      expect(alternates).toEqual({
        ja: "https://yusuke-kim.com/",
        en: "https://yusuke-kim.com/en",
      });
    });

    it("should handle complex path", () => {
      const alternates = generateAlternateUrls("/portfolio/gallery/develop", [
        "ja",
        "en",
      ]);
      expect(alternates).toEqual({
        ja: "https://yusuke-kim.com/portfolio/gallery/develop",
        en: "https://yusuke-kim.com/en/portfolio/gallery/develop",
      });
    });

    it("should handle empty languages array", () => {
      const alternates = generateAlternateUrls("/about", []);
      expect(alternates).toEqual({});
    });

    it("should handle single non-Japanese language", () => {
      const alternates = generateAlternateUrls("/about", ["en"]);
      expect(alternates).toEqual({
        en: "https://yusuke-kim.com/en/about",
      });
    });
  });
});
