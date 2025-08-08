import robots from "../robots";

describe("robots.ts", () => {
  it("returns a valid robots configuration", () => {
    const robotsConfig = robots();

    expect(robotsConfig).toBeDefined();
    expect(robotsConfig.rules).toBeDefined();
    expect(robotsConfig.sitemap).toBeDefined();
    expect(robotsConfig.host).toBeDefined();
  });

  it("includes general rules for all user agents", () => {
    const robotsConfig = robots();

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    const generalRule = rules.find(
      (rule: { userAgent: string; allow: string; disallow: string[] }) =>
        rule.userAgent === "*",
    );
    expect(generalRule).toBeDefined();
    expect(generalRule?.allow).toBe("/");
    expect(generalRule?.disallow).toContain("/admin/");
    expect(generalRule?.disallow).toContain("/api/");
    expect(generalRule?.disallow).toContain("/_next/");
    expect(generalRule?.disallow).toContain("/private/");
  });

  it("includes specific rules for Googlebot", () => {
    const robotsConfig = robots();

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    const googlebotRule = rules.find(
      (rule: { userAgent: string; allow: string; disallow: string[] }) =>
        rule.userAgent === "Googlebot",
    );
    expect(googlebotRule).toBeDefined();
    expect(googlebotRule?.allow).toBe("/");
    expect(googlebotRule?.disallow).toContain("/admin/");
    expect(googlebotRule?.disallow).toContain("/api/");
    expect(googlebotRule?.disallow).toContain("/_next/");
    expect(googlebotRule?.disallow).toContain("/private/");
  });

  it("includes specific rules for Bingbot", () => {
    const robotsConfig = robots();

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    const bingbotRule = rules.find(
      (rule: { userAgent: string; allow: string; disallow: string[] }) =>
        rule.userAgent === "Bingbot",
    );
    expect(bingbotRule).toBeDefined();
    expect(bingbotRule?.allow).toBe("/");
    expect(bingbotRule?.disallow).toContain("/admin/");
    expect(bingbotRule?.disallow).toContain("/api/");
    expect(bingbotRule?.disallow).toContain("/_next/");
    expect(bingbotRule?.disallow).toContain("/private/");
  });

  it("allows AI crawlers with proper restrictions", () => {
    const robotsConfig = robots();

    const aiCrawlers = [
      "GPTBot",
      "ChatGPT-User",
      "CCBot",
      "anthropic-ai",
      "Claude-Web",
    ];

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    aiCrawlers.forEach((crawlerName) => {
      const crawlerRule = rules.find(
        (rule: { userAgent: string; allow: string; disallow: string[] }) =>
          rule.userAgent === crawlerName,
      );
      expect(crawlerRule).toBeDefined();
      expect(crawlerRule?.allow).toBe("/");
      expect(crawlerRule?.disallow).toContain("/admin/");
      expect(crawlerRule?.disallow).toContain("/api/");
      expect(crawlerRule?.disallow).toContain("/_next/");
      expect(crawlerRule?.disallow).toContain("/private/");
    });
  });

  it("blocks admin panel from all crawlers", () => {
    const robotsConfig = robots();

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    rules.forEach(
      (rule: { userAgent: string; allow: string; disallow: string[] }) => {
        expect(rule.disallow).toContain("/admin/");
      },
    );
  });

  it("blocks API endpoints from indexing", () => {
    const robotsConfig = robots();

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    rules.forEach(
      (rule: { userAgent: string; allow: string; disallow: string[] }) => {
        expect(rule.disallow).toContain("/api/");
      },
    );
  });

  it("blocks Next.js internal files", () => {
    const robotsConfig = robots();

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    rules.forEach(
      (rule: { userAgent: string; allow: string; disallow: string[] }) => {
        expect(rule.disallow).toContain("/_next/");
      },
    );
  });

  it("blocks private directories", () => {
    const robotsConfig = robots();

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    rules.forEach(
      (rule: { userAgent: string; allow: string; disallow: string[] }) => {
        expect(rule.disallow).toContain("/private/");
      },
    );
  });

  it("includes correct sitemap URL", () => {
    const robotsConfig = robots();

    expect(robotsConfig.sitemap).toBe("https://yusuke-kim.com/sitemap.xml");
  });

  it("includes correct host URL", () => {
    const robotsConfig = robots();

    expect(robotsConfig.host).toBe("https://yusuke-kim.com");
  });

  it("allows root path for all crawlers", () => {
    const robotsConfig = robots();

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    rules.forEach(
      (rule: { userAgent: string; allow: string; disallow: string[] }) => {
        expect(rule.allow).toBe("/");
      },
    );
  });

  it("has consistent disallow rules across all user agents", () => {
    const robotsConfig = robots();

    const expectedDisallowPaths = ["/admin/", "/api/", "/_next/", "/private/"];

    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    rules.forEach(
      (rule: { userAgent: string; allow: string; disallow: string[] }) => {
        expectedDisallowPaths.forEach((path) => {
          expect(rule.disallow).toContain(path);
        });
      },
    );
  });

  it("includes all major AI crawlers", () => {
    const robotsConfig = robots();

    const expectedAICrawlers = [
      "GPTBot",
      "ChatGPT-User",
      "CCBot",
      "anthropic-ai",
      "Claude-Web",
    ];
    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    const actualUserAgents = rules.map(
      (rule: { userAgent: string; allow: string; disallow: string[] }) =>
        rule.userAgent,
    );

    expectedAICrawlers.forEach((crawler) => {
      expect(actualUserAgents).toContain(crawler);
    });
  });

  it("includes major search engine bots", () => {
    const robotsConfig = robots();

    const expectedSearchBots = ["Googlebot", "Bingbot"];
    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    const actualUserAgents = rules.map(
      (rule: { userAgent: string; allow: string; disallow: string[] }) =>
        rule.userAgent,
    );

    expectedSearchBots.forEach((bot) => {
      expect(actualUserAgents).toContain(bot);
    });
  });

  it("returns MetadataRoute.Robots compatible format", () => {
    const robotsConfig = robots();

    // Check that the structure matches Next.js MetadataRoute.Robots type
    expect(robotsConfig).toHaveProperty("rules");
    expect(robotsConfig).toHaveProperty("sitemap");
    expect(robotsConfig).toHaveProperty("host");

    expect(Array.isArray(robotsConfig.rules)).toBe(true);
    expect(typeof robotsConfig.sitemap).toBe("string");
    expect(typeof robotsConfig.host).toBe("string");

    // Check rule structure
    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules
      : [robotsConfig.rules];
    rules.forEach(
      (rule: { userAgent: string; allow: string; disallow: string[] }) => {
        expect(rule).toHaveProperty("userAgent");
        expect(rule).toHaveProperty("allow");
        expect(rule).toHaveProperty("disallow");
        expect(typeof rule.userAgent).toBe("string");
        expect(typeof rule.allow).toBe("string");
        expect(Array.isArray(rule.disallow)).toBe(true);
      },
    );
  });

  it("has proper URL format for sitemap and host", () => {
    const robotsConfig = robots();

    expect(robotsConfig.sitemap).toMatch(/^https:\/\/.+\/sitemap\.xml$/);
    expect(robotsConfig.host).toMatch(/^https:\/\/.+$/);
    expect(robotsConfig.host?.endsWith("/")).toBe(false);
  });
});
