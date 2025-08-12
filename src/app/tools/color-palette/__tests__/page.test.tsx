import { render, screen } from "@testing-library/react";
import ColorPalettePage, { metadata } from "../page";

// Mock the ColorPaletteGenerator component
jest.mock("../components/ColorPaletteGenerator", () => {
  return function MockColorPaletteGenerator() {
    return (
      <div data-testid="color-palette-generator">
        Color Palette Generator Component
      </div>
    );
  };
});

// Mock the Breadcrumbs component
jest.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: ({
    items,
  }: {
    items: Array<{ label: string; href?: string; isCurrent?: boolean }>;
  }) => (
    <nav data-testid="breadcrumbs">
      {items.map((item, index) => (
        <span key={index} data-testid={`breadcrumb-${index}`}>
          {item.label}
        </span>
      ))}
    </nav>
  ),
}));

describe("ColorPalettePage", () => {
  it("should render the page correctly", () => {
    render(<ColorPalettePage />);

    // Check if breadcrumbs are rendered
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Tools");
    expect(screen.getByTestId("breadcrumb-2")).toHaveTextContent(
      "Color Palette Generator",
    );

    // Check if ColorPaletteGenerator component is rendered
    expect(screen.getByTestId("color-palette-generator")).toBeInTheDocument();
  });

  it("should have correct container classes", () => {
    render(<ColorPalettePage />);

    const containerSystem = document.querySelector(".container-system");
    expect(containerSystem).toBeInTheDocument();
    expect(containerSystem).toHaveClass("pt-10", "pb-4");
  });

  it("should render structured data script", () => {
    render(<ColorPalettePage />);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(structuredDataScript).toBeInTheDocument();

    if (structuredDataScript) {
      const structuredData = JSON.parse(
        structuredDataScript.textContent || "{}",
      );
      expect(structuredData["@context"]).toBe("https://schema.org");
      expect(structuredData["@type"]).toBe("WebApplication");
      expect(structuredData.name).toBe("Color Palette Generator");
      expect(structuredData.description).toBe(
        "色域を指定してランダムにカラーパレットを生成",
      );
      expect(structuredData.url).toBe(
        "https://yusuke-kim.com/tools/color-palette",
      );
      expect(structuredData.applicationCategory).toBe("DesignApplication");
      expect(structuredData.operatingSystem).toBe("Web Browser");
      expect(structuredData.author["@type"]).toBe("Person");
      expect(structuredData.author.name).toBe("木村友亮");
      expect(structuredData.author.alternateName).toBe("samuido");
      expect(structuredData.offers["@type"]).toBe("Offer");
      expect(structuredData.offers.price).toBe("0");
      expect(structuredData.offers.priceCurrency).toBe("JPY");
    }
  });

  describe("metadata", () => {
    it("should have correct metadata properties", () => {
      expect(metadata.title).toBe("Color Palette Generator");
      expect(metadata.description).toBe(
        "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。",
      );
      expect(metadata.keywords).toBe(
        "カラーパレット, 色生成, デザイン, ランダム色, 色域設定, CSS変数",
      );
      expect(metadata.robots).toBe("index, follow");
      expect(metadata.canonical).toBe(
        "https://yusuke-kim.com/tools/color-palette",
      );
    });

    it("should have correct OpenGraph metadata", () => {
      const openGraph = metadata.openGraph as Record<string, unknown>;
      expect(openGraph.title).toBe(
        "Color Palette Generator - samuido | カラーパレット生成",
      );
      expect(openGraph.description).toBe(
        "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。",
      );
      expect(openGraph.type).toBe("website");
      expect(openGraph.url).toBe("https://yusuke-kim.com/tools/color-palette");
      expect(openGraph.siteName).toBe("samuido");
      expect(openGraph.locale).toBe("ja_JP");
    });

    it("should have correct Twitter metadata", () => {
      const twitter = metadata.twitter as Record<string, unknown>;
      expect(twitter.card).toBe("summary_large_image");
      expect(twitter.title).toBe(
        "Color Palette Generator - samuido | カラーパレット生成",
      );
      expect(twitter.description).toBe(
        "色域を指定してランダムにカラーパレットを生成。デザインに活用できる美しい色の組み合わせを作成。",
      );
      expect(twitter.creator).toBe("@361do_sleep");
    });
  });
});
