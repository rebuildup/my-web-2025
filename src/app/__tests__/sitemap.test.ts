import { generateCompleteSitemap } from "@/lib/seo/sitemap-generator";
import sitemap from "../sitemap";

// Mock the sitemap generator
jest.mock("@/lib/seo/sitemap-generator", () => ({
  generateCompleteSitemap: jest.fn(),
}));

const mockGenerateCompleteSitemap =
  generateCompleteSitemap as jest.MockedFunction<
    typeof generateCompleteSitemap
  >;

describe("sitemap.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls generateCompleteSitemap with correct parameters", async () => {
    const mockSitemapData = [
      {
        url: "https://yusuke-kim.com/",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: "https://yusuke-kim.com/about",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "monthly" as const,
        priority: 0.9,
      },
    ];

    mockGenerateCompleteSitemap.mockResolvedValue(mockSitemapData);

    const result = await sitemap();

    expect(mockGenerateCompleteSitemap).toHaveBeenCalledWith({
      baseUrl: "https://yusuke-kim.com",
      defaultChangeFreq: "monthly",
      defaultPriority: 0.5,
    });

    expect(result).toEqual(mockSitemapData);
  });

  it("returns the result from generateCompleteSitemap", async () => {
    const mockSitemapData = [
      {
        url: "https://yusuke-kim.com/",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: "https://yusuke-kim.com/portfolio",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      },
      {
        url: "https://yusuke-kim.com/tools",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
    ];

    mockGenerateCompleteSitemap.mockResolvedValue(mockSitemapData);

    const result = await sitemap();

    expect(result).toEqual(mockSitemapData);
    expect(result).toHaveLength(3);
  });

  it("uses correct base URL", async () => {
    mockGenerateCompleteSitemap.mockResolvedValue([]);

    await sitemap();

    expect(mockGenerateCompleteSitemap).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: "https://yusuke-kim.com",
      }),
    );
  });

  it("uses correct default change frequency", async () => {
    mockGenerateCompleteSitemap.mockResolvedValue([]);

    await sitemap();

    expect(mockGenerateCompleteSitemap).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultChangeFreq: "monthly",
      }),
    );
  });

  it("uses correct default priority", async () => {
    mockGenerateCompleteSitemap.mockResolvedValue([]);

    await sitemap();

    expect(mockGenerateCompleteSitemap).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultPriority: 0.5,
      }),
    );
  });

  it("handles empty sitemap data", async () => {
    mockGenerateCompleteSitemap.mockResolvedValue([]);

    const result = await sitemap();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles sitemap generation errors", async () => {
    const error = new Error("Sitemap generation failed");
    mockGenerateCompleteSitemap.mockRejectedValue(error);

    await expect(sitemap()).rejects.toThrow("Sitemap generation failed");
  });

  it("returns MetadataRoute.Sitemap compatible format", async () => {
    const mockSitemapData = [
      {
        url: "https://yusuke-kim.com/",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: "https://yusuke-kim.com/about",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "monthly" as const,
        priority: 0.9,
      },
    ];

    mockGenerateCompleteSitemap.mockResolvedValue(mockSitemapData);

    const result = await sitemap();

    // Check that each entry has the required properties
    result.forEach((entry) => {
      expect(entry).toHaveProperty("url");
      expect(entry).toHaveProperty("lastModified");
      expect(entry).toHaveProperty("changeFrequency");
      expect(entry).toHaveProperty("priority");

      expect(typeof entry.url).toBe("string");
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(typeof entry.changeFrequency).toBe("string");
      expect(typeof entry.priority).toBe("number");
    });
  });

  it("validates URL format in sitemap entries", async () => {
    const mockSitemapData = [
      {
        url: "https://yusuke-kim.com/",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: "https://yusuke-kim.com/about",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "monthly" as const,
        priority: 0.9,
      },
    ];

    mockGenerateCompleteSitemap.mockResolvedValue(mockSitemapData);

    const result = await sitemap();

    result.forEach((entry) => {
      expect(entry.url).toMatch(/^https:\/\/.+/);
      expect(entry.url).toContain("yusuke-kim.com");
    });
  });

  it("validates change frequency values", async () => {
    const mockSitemapData = [
      {
        url: "https://yusuke-kim.com/",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: "https://yusuke-kim.com/about",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "monthly" as const,
        priority: 0.9,
      },
    ];

    mockGenerateCompleteSitemap.mockResolvedValue(mockSitemapData);

    const result = await sitemap();

    const validFrequencies = [
      "always",
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "yearly",
      "never",
    ];

    result.forEach((entry) => {
      expect(validFrequencies).toContain(entry.changeFrequency);
    });
  });

  it("validates priority values", async () => {
    const mockSitemapData = [
      {
        url: "https://yusuke-kim.com/",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "weekly" as const,
        priority: 1.0,
      },
      {
        url: "https://yusuke-kim.com/about",
        lastModified: new Date("2024-01-01"),
        changeFrequency: "monthly" as const,
        priority: 0.9,
      },
    ];

    mockGenerateCompleteSitemap.mockResolvedValue(mockSitemapData);

    const result = await sitemap();

    result.forEach((entry) => {
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    });
  });

  it("is an async function", () => {
    expect(sitemap).toBeInstanceOf(Function);
    expect(sitemap().then).toBeInstanceOf(Function);
  });

  it("calls generateCompleteSitemap only once per invocation", async () => {
    mockGenerateCompleteSitemap.mockResolvedValue([]);

    await sitemap();

    expect(mockGenerateCompleteSitemap).toHaveBeenCalledTimes(1);
  });

  it("passes through all configuration options", async () => {
    mockGenerateCompleteSitemap.mockResolvedValue([]);

    await sitemap();

    const expectedConfig = {
      baseUrl: "https://yusuke-kim.com",
      defaultChangeFreq: "monthly",
      defaultPriority: 0.5,
    };

    expect(mockGenerateCompleteSitemap).toHaveBeenCalledWith(expectedConfig);
  });
});
