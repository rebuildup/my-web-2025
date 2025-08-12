import { render, screen } from "@testing-library/react";
import AEExpressionPage, { metadata } from "../page";

// Mock the AEExpressionTool component
jest.mock("../components/AEExpressionTool", () => {
  return function MockAEExpressionTool() {
    return (
      <div data-testid="ae-expression-tool">AE Expression Tool Component</div>
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

describe("AEExpressionPage", () => {
  it("should render the page correctly", () => {
    render(<AEExpressionPage />);

    // Check if breadcrumbs are rendered
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Tools");
    expect(screen.getByTestId("breadcrumb-2")).toHaveTextContent(
      "After Effects Expression Helper",
    );

    // Check if AEExpressionTool component is rendered
    expect(screen.getByTestId("ae-expression-tool")).toBeInTheDocument();
  });

  it("should have correct container classes", () => {
    render(<AEExpressionPage />);

    const containerSystem = document.querySelector(".container-system");
    expect(containerSystem).toBeInTheDocument();
    expect(containerSystem).toHaveClass("pt-10", "pb-4");
  });

  it("should render structured data script", () => {
    render(<AEExpressionPage />);

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
      expect(structuredData.name).toBe("AE Expression Tool");
      expect(structuredData.description).toBe(
        "AfterEffectsのエクスプレッションをScratch風ブロックUIで設定",
      );
      expect(structuredData.url).toBe(
        "https://yusuke-kim.com/tools/ae-expression",
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
      expect(metadata.title).toBe("AE Expression Tool");
      expect(metadata.description).toBe(
        "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。",
      );
      expect(metadata.keywords).toBe(
        "AfterEffects, エクスプレッション, アニメーション, エフェクト, Scratch, ブロックUI",
      );
      expect(metadata.robots).toBe("index, follow");
      expect(metadata.canonical).toBe(
        "https://yusuke-kim.com/tools/ae-expression",
      );
    });

    it("should have correct OpenGraph metadata", () => {
      const openGraph = metadata.openGraph as Record<string, unknown>;
      expect(openGraph.title).toBe(
        "AE Expression Tool - samuido | AfterEffects エクスプレッション",
      );
      expect(openGraph.description).toBe(
        "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。",
      );
      expect(openGraph.type).toBe("website");
      expect(openGraph.url).toBe("https://yusuke-kim.com/tools/ae-expression");
      expect(openGraph.siteName).toBe("samuido");
      expect(openGraph.locale).toBe("ja_JP");
    });

    it("should have correct Twitter metadata", () => {
      const twitter = metadata.twitter as Record<string, unknown>;
      expect(twitter.card).toBe("summary_large_image");
      expect(twitter.title).toBe(
        "AE Expression Tool - samuido | AfterEffects エクスプレッション",
      );
      expect(twitter.description).toBe(
        "AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。",
      );
      expect(twitter.creator).toBe("@361do_sleep");
    });
  });
});
