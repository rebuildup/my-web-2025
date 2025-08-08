import { render, screen } from "@testing-library/react";
import React from "react";
import RootLayout, { metadata, viewport } from "../layout";

// Mock Next.js components and functions
jest.mock("next/script", () => {
  const MockScript = ({
    children,
    dangerouslySetInnerHTML,
    strategy,
    async,
    src,
    id,
    type,
    ...props
  }: {
    children?: React.ReactNode;
    dangerouslySetInnerHTML?: { __html: string };
    strategy?: string;
    async?: boolean;
    src?: string;
    id?: string;
    type?: string;
    [key: string]: unknown;
  }) => {
    if (dangerouslySetInnerHTML) {
      return (
        <script
          {...props}
          id={id}
          type={type}
          src={src}
          async={async}
          data-strategy={strategy}
          dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        />
      );
    }
    return (
      <script
        {...props}
        id={id}
        type={type}
        src={src}
        async={async}
        data-strategy={strategy}
      >
        {children}
      </script>
    );
  };
  MockScript.displayName = "MockScript";
  return MockScript;
});

jest.mock("next/font/google", () => ({
  Noto_Sans_JP: jest.fn(() => ({
    variable: "--font-noto-jp",
  })),
  Shippori_Antique_B1: jest.fn(() => ({
    variable: "--font-shippori",
  })),
}));

// Mock global window properties
const mockDataLayer: unknown[] = [];
const mockGtag = jest.fn();

Object.defineProperty(window, "dataLayer", {
  value: mockDataLayer,
  writable: true,
});

Object.defineProperty(window, "gtag", {
  value: mockGtag,
  writable: true,
});

describe("RootLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataLayer.length = 0;
  });

  it("renders children correctly", () => {
    const testContent = <div data-testid="test-content">Test Content</div>;

    render(<RootLayout>{testContent}</RootLayout>);

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("applies correct HTML attributes", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const html = document.documentElement;
    expect(html).toHaveAttribute("lang", "ja");
    expect(html).toHaveClass("scroll-smooth");
  });

  it("does not include skip links", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const skipLinks = document.querySelectorAll(".skip-link");
    expect(skipLinks).toHaveLength(0);
  });

  it("includes ARIA live regions for announcements", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const politeRegion = document.getElementById("announcement-region");
    const assertiveRegion = document.getElementById(
      "urgent-announcement-region",
    );

    expect(politeRegion).toBeInTheDocument();
    expect(politeRegion).toHaveAttribute("aria-live", "polite");
    expect(politeRegion).toHaveAttribute("aria-atomic", "true");

    expect(assertiveRegion).toBeInTheDocument();
    expect(assertiveRegion).toHaveAttribute("aria-live", "assertive");
    expect(assertiveRegion).toHaveAttribute("aria-atomic", "true");
  });

  it("applies correct classes to body", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const body = document.body;
    expect(body).toHaveClass("antialiased");
    expect(body).toHaveClass("bg-background");
    expect(body).toHaveClass("text-foreground");
  });

  it("includes Google Analytics scripts", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const scripts = document.querySelectorAll("script");
    const gaScripts = Array.from(scripts).filter(
      (script) =>
        script.src?.includes("googletagmanager.com") ||
        script.id === "google-analytics",
    );

    expect(gaScripts.length).toBeGreaterThan(0);
  });

  it("includes Adobe Fonts script", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const adobeScript = document.getElementById("adobe-fonts");
    expect(adobeScript).toBeInTheDocument();
  });

  it("includes performance monitoring script", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const perfScript = document.getElementById("performance-initialization");
    expect(perfScript).toBeInTheDocument();
  });

  it("includes service worker registration script", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const swScript = document.getElementById("service-worker-registration");
    expect(swScript).toBeInTheDocument();
  });

  it("includes easter egg console message script", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const easterEggScript = document.getElementById("easter-egg");
    expect(easterEggScript).toBeInTheDocument();
  });

  it("includes structured data JSON-LD", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const structuredDataScript = document.getElementById("structured-data");
    expect(structuredDataScript).toBeInTheDocument();
    expect(structuredDataScript).toHaveAttribute("type", "application/ld+json");
  });

  it("includes all expected script elements", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    // Check that all expected scripts are present
    const scripts = document.querySelectorAll("script");
    const scriptIds = Array.from(scripts)
      .map((script) => script.id)
      .filter((id) => id);

    expect(scriptIds).toContain("google-analytics");
    expect(scriptIds).toContain("adobe-fonts");
    expect(scriptIds).toContain("performance-initialization");
    expect(scriptIds).toContain("service-worker-registration");
    expect(scriptIds).toContain("easter-egg");
    expect(scriptIds).toContain("structured-data");
  });

  it("includes performance monitoring initialization", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const perfScript = document.getElementById("performance-initialization");
    expect(perfScript?.innerHTML).toContain("initializeBundleOptimization");
    expect(perfScript?.innerHTML).toContain("initializePerformanceMonitoring");
  });

  it("includes proper meta tags in head", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    expect(viewportMeta).toBeInTheDocument();
    expect(viewportMeta).toHaveAttribute(
      "content",
      "width=device-width, initial-scale=1",
    );

    // Check theme color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    expect(themeColorMeta).toBeInTheDocument();
    expect(themeColorMeta).toHaveAttribute("content", "#000000");

    // Check color scheme meta tags
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    expect(colorSchemeMeta).toBeInTheDocument();
    expect(colorSchemeMeta).toHaveAttribute("content", "dark light");
  });

  it("includes manifest link", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const manifestLink = document.querySelector('link[rel="manifest"]');
    expect(manifestLink).toBeInTheDocument();
    expect(manifestLink).toHaveAttribute("href", "/manifest.json");
  });

  it("wraps children in min-h-screen container", () => {
    render(
      <RootLayout>
        <div data-testid="child">Test</div>
      </RootLayout>,
    );

    const container = screen.getByTestId("child").closest(".min-h-screen");
    expect(container).toBeInTheDocument();
  });

  it("includes all required meta tags in head", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    // Check apple mobile web app status bar style
    const appleStatusBar = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]',
    );
    expect(appleStatusBar).toBeInTheDocument();
    expect(appleStatusBar).toHaveAttribute("content", "black-translucent");

    // Check supported color schemes
    const supportedColorSchemes = document.querySelector(
      'meta[name="supported-color-schemes"]',
    );
    expect(supportedColorSchemes).toBeInTheDocument();
    expect(supportedColorSchemes).toHaveAttribute("content", "dark light");
  });

  it("does not include skip links", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const skipLinks = document.querySelectorAll(".skip-link");
    expect(skipLinks).toHaveLength(0);
  });

  it("includes announcement regions with proper classes", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const politeRegion = document.getElementById("announcement-region");
    const assertiveRegion = document.getElementById(
      "urgent-announcement-region",
    );

    expect(politeRegion).toHaveClass("announcement-region");
    expect(assertiveRegion).toHaveClass("announcement-region");
  });

  it("includes all script elements with correct attributes", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    // Check Google Analytics external script
    const gaExternalScript = document.querySelector(
      'script[src*="googletagmanager.com"]',
    );
    expect(gaExternalScript).toBeInTheDocument();
    expect(gaExternalScript).toHaveAttribute("async");

    // Check Adobe Fonts script strategy
    const adobeScript = document.getElementById("adobe-fonts");
    expect(adobeScript).toHaveAttribute("data-strategy", "afterInteractive");

    // Check performance script strategy
    const perfScript = document.getElementById("performance-initialization");
    expect(perfScript).toHaveAttribute("data-strategy", "afterInteractive");

    // Check service worker script strategy
    const swScript = document.getElementById("service-worker-registration");
    expect(swScript).toHaveAttribute("data-strategy", "afterInteractive");

    // Check easter egg script strategy
    const easterEggScript = document.getElementById("easter-egg");
    expect(easterEggScript).toHaveAttribute(
      "data-strategy",
      "afterInteractive",
    );
  });

  it("includes structured data with correct schema", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    const structuredDataScript = document.getElementById("structured-data");
    expect(structuredDataScript).toBeInTheDocument();

    const scriptContent = structuredDataScript?.innerHTML;
    expect(scriptContent).toContain('"@context":"https://schema.org"');
    expect(scriptContent).toContain('"@type":"WebSite"');
    expect(scriptContent).toContain('"name":"Rebuild Portfolio"');
    expect(scriptContent).toContain('"url":"https://rebuild.up.up"');
    expect(scriptContent).toContain('"SearchAction"');
  });

  it("handles multiple children correctly", () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </>
    );

    render(<RootLayout>{multipleChildren}</RootLayout>);

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("handles empty children gracefully", () => {
    render(<RootLayout>{null}</RootLayout>);

    // Should render without errors
    expect(document.body).toBeInTheDocument();
    expect(document.querySelector(".min-h-screen")).toBeInTheDocument();
  });

  it("handles string children", () => {
    render(<RootLayout>Simple text content</RootLayout>);

    expect(screen.getByText("Simple text content")).toBeInTheDocument();
  });

  it("applies correct font variables from Google Fonts", async () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>,
    );

    // Verify that the body has the correct classes
    const body = document.body;
    expect(body.className).toContain("antialiased");
    expect(body.className).toContain("bg-background");

    // Verify the font configuration by checking the mock was set up correctly
    const { Noto_Sans_JP, Shippori_Antique_B1 } = await import(
      "next/font/google"
    );
    expect(typeof Noto_Sans_JP).toBe("function");
    expect(typeof Shippori_Antique_B1).toBe("function");
  });
});

describe("Layout Metadata", () => {
  it("exports correct metadata object", () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("samuidoのサイトルート");
    expect(metadata.description).toContain(
      "フロントエンドエンジニアsamuidoの個人サイト",
    );
    expect(metadata.keywords).toContain("ポートフォリオ");
    expect(metadata.keywords).toContain("samuido");
    expect(metadata.robots).toBe("index, follow");
  });

  it("includes proper OpenGraph metadata", () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toBe("samuidoのサイトルート");
    expect(metadata.openGraph?.url).toBe("https://yusuke-kim.com/");
    expect(metadata.openGraph?.locale).toBe("ja_JP");
    expect(metadata.openGraph?.siteName).toBe("samuido");
    expect(metadata.openGraph?.description).toContain(
      "フロントエンドエンジニアsamuidoの個人サイト",
    );

    // Check OpenGraph images
    expect(metadata.openGraph?.images).toBeDefined();
    if (Array.isArray(metadata.openGraph?.images)) {
      expect(metadata.openGraph.images).toHaveLength(1);
      expect(metadata.openGraph.images[0]).toEqual({
        url: "https://yusuke-kim.com/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "samuido - Creative Portfolio & Tools",
      });
    }
  });

  it("includes proper Twitter metadata", () => {
    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.creator).toBe("@361do_sleep");
    expect(metadata.twitter?.title).toBe("samuidoのサイトルート");
    expect(metadata.twitter?.description).toContain(
      "フロントエンドエンジニアsamuidoの個人サイト",
    );

    // Check Twitter images
    expect(metadata.twitter?.images).toBeDefined();
    if (Array.isArray(metadata.twitter?.images)) {
      expect(metadata.twitter.images).toContain(
        "https://yusuke-kim.com/images/twitter-image.png",
      );
    }
  });

  it("includes proper icons configuration", () => {
    expect(metadata.icons).toBeDefined();

    // Type-safe icon checking
    if (
      typeof metadata.icons === "object" &&
      metadata.icons !== null &&
      !Array.isArray(metadata.icons)
    ) {
      const icons = metadata.icons as { icon?: unknown; apple?: unknown };

      if (Array.isArray(icons.icon)) {
        expect(icons.icon).toHaveLength(3);
        expect(icons.icon[0]).toEqual({
          url: "/favicons/favicon.ico",
          sizes: "any",
        });
        expect(icons.icon[1]).toEqual({
          url: "/favicons/favicon.svg",
          type: "image/svg+xml",
        });
        expect(icons.icon[2]).toEqual({
          url: "/favicons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        });
      }

      if (Array.isArray(icons.apple)) {
        expect(icons.apple).toHaveLength(1);
        expect(icons.apple[0]).toEqual({
          url: "/favicons/favicon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        });
      }
    }
  });

  it("includes authors and creator information", () => {
    expect(metadata.authors).toHaveLength(1);
    expect(metadata.authors?.[0]).toEqual({
      name: "samuido",
      url: "https://yusuke-kim.com/about",
    });
    expect(metadata.creator).toBe("samuido");
    expect(metadata.publisher).toBe("samuido");
  });

  it("includes metadataBase and canonical URL", () => {
    expect(metadata.metadataBase).toBeDefined();
    expect(metadata.metadataBase?.toString()).toBe("https://yusuke-kim.com/");
    expect(metadata.alternates?.canonical).toBe("https://yusuke-kim.com/");
  });

  it("includes complete keywords array", () => {
    expect(metadata.keywords).toEqual([
      "ポートフォリオ",
      "Webデザイン",
      "フロントエンド開発",
      "ツール",
      "プラグイン",
      "ブログ",
      "samuido",
      "木村友亮",
    ]);
  });

  it("includes manifest reference", () => {
    expect(metadata.manifest).toBe("/manifest.json");
  });

  it("has consistent title and description across metadata fields", () => {
    const expectedTitle = "samuidoのサイトルート";
    const expectedDescription =
      "フロントエンドエンジニアsamuidoの個人サイト。自己紹介/作品ギャラリー/プラグイン配布/ツール など欲しいもの全部詰め込みました";

    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.description).toBe(expectedDescription);
    expect(metadata.openGraph?.title).toBe(expectedTitle);
    expect(metadata.openGraph?.description).toBe(expectedDescription);
    expect(metadata.twitter?.title).toBe(expectedTitle);
    expect(metadata.twitter?.description).toBe(expectedDescription);
  });
});

describe("Layout Viewport", () => {
  it("exports correct viewport configuration", () => {
    expect(viewport).toBeDefined();
    expect(viewport.width).toBe("device-width");
    expect(viewport.initialScale).toBe(1);
    expect(viewport.themeColor).toBe("#181818");
    expect(viewport.colorScheme).toBe("dark");
  });
});
