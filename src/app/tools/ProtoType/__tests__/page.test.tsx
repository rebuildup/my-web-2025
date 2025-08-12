import { render, screen } from "@testing-library/react";
import ProtoTypePage, { metadata } from "../page";

// Mock the ProtoTypeClient component
jest.mock("../components/ProtoTypeClient", () => {
  return function MockProtoTypeClient() {
    return <div data-testid="prototype-client">ProtoType Client Component</div>;
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

describe("ProtoTypePage", () => {
  beforeEach(() => {
    // Reset any CSS custom properties
    document.documentElement.style.removeProperty("--ProtoTypeMainBG");
    document.documentElement.style.removeProperty("--ProtoTypeMainColor");
  });

  it("should render the page correctly", () => {
    render(<ProtoTypePage />);

    // Check if main container is rendered
    const container = document.querySelector(".min-h-screen");
    expect(container).toBeInTheDocument();

    // Check if breadcrumbs are rendered
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Tools");
    expect(screen.getByTestId("breadcrumb-2")).toHaveTextContent(
      "ProtoType Typing Game",
    );

    // Check if ProtoTypeClient component is rendered
    expect(screen.getByTestId("prototype-client")).toBeInTheDocument();
  });

  it("should apply correct CSS custom properties", () => {
    render(<ProtoTypePage />);

    const container = document.querySelector(".min-h-screen");
    expect(container).toHaveStyle({
      backgroundColor: "var(--ProtoTypeMainBG, #000000)",
      color: "var(--ProtoTypeMainColor, #ffffff)",
    });
  });

  it("should render structured data script", () => {
    render(<ProtoTypePage />);

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
      expect(structuredData.name).toBe("ProtoType Typing Game");
      expect(structuredData.description).toBe(
        "PIXIjsを使用したタイピングゲーム",
      );
      expect(structuredData.url).toBe("https://yusuke-kim.com/tools/ProtoType");
      expect(structuredData.applicationCategory).toBe("GameApplication");
      expect(structuredData.operatingSystem).toBe("Web Browser");
      expect(structuredData.author["@type"]).toBe("Person");
      expect(structuredData.author.name).toBe("木村友亮");
      expect(structuredData.author.alternateName).toBe("samuido");
      expect(structuredData.offers["@type"]).toBe("Offer");
      expect(structuredData.offers.price).toBe("0");
      expect(structuredData.offers.priceCurrency).toBe("JPY");
      expect(structuredData.codeRepository).toBe(
        "https://github.com/rebuildup/ProtoType",
      );
    }
  });

  it("should have correct container classes", () => {
    render(<ProtoTypePage />);

    const containerSystem = document.querySelector(".container-system");
    expect(containerSystem).toBeInTheDocument();
    expect(containerSystem).toHaveClass("pt-10", "pb-4");
  });

  describe("metadata", () => {
    it("should have correct metadata properties", () => {
      expect(metadata.title).toBe("ProtoType Typing Game | Tools - samuido");
      expect(metadata.description).toBe(
        "PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。",
      );
      expect(metadata.keywords).toEqual([
        "タイピングゲーム",
        "PIXIjs",
        "WPM",
        "正確性",
        "スコア記録",
        "練習",
        "タイピング",
        "スキル向上",
      ]);
      expect(metadata.robots).toBe("index, follow");
    });

    it("should have correct OpenGraph metadata", () => {
      const openGraph = metadata.openGraph as Record<string, unknown>;
      expect(openGraph.title).toBe("ProtoType Typing Game | Tools - samuido");
      expect(openGraph.description).toBe(
        "PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。",
      );
      expect(openGraph.type).toBe("website");
      expect(openGraph.url).toBe("https://yusuke-kim.com/tools/ProtoType");
      expect(openGraph.siteName).toBe("samuido");
      expect(openGraph.locale).toBe("ja_JP");
    });

    it("should have correct Twitter metadata", () => {
      const twitter = metadata.twitter as Record<string, unknown>;
      expect(twitter.card).toBe("summary_large_image");
      expect(twitter.title).toBe("ProtoType Typing Game | Tools - samuido");
      expect(twitter.description).toBe(
        "PIXIjsを使用したタイピングゲーム。WPMと正確性を記録し、タイピングスキルの向上を支援。",
      );
      expect(twitter.creator).toBe("@361do_sleep");
    });
  });
});
