import { render, screen } from "@testing-library/react";
import BusinessMailBlockPage, { metadata } from "../page";

// Mock the BusinessMailBlockTool component
jest.mock("../components/BusinessMailBlockTool", () => {
  return function MockBusinessMailBlockTool() {
    return (
      <div data-testid="business-mail-block-tool">
        Business Mail Block Tool Component
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

describe("BusinessMailBlockPage", () => {
  it("should render the page correctly", () => {
    render(<BusinessMailBlockPage />);

    // Check if breadcrumbs are rendered
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Tools");
    expect(screen.getByTestId("breadcrumb-2")).toHaveTextContent(
      "Business Mail Builder",
    );

    // Check if BusinessMailBlockTool component is rendered
    expect(screen.getByTestId("business-mail-block-tool")).toBeInTheDocument();
  });

  it("should have correct container classes", () => {
    render(<BusinessMailBlockPage />);

    const containerSystem = document.querySelector(".container-system");
    expect(containerSystem).toBeInTheDocument();
    expect(containerSystem).toHaveClass("pt-10", "pb-4");
  });

  it("should render structured data script", () => {
    render(<BusinessMailBlockPage />);

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
      expect(structuredData.name).toBe("Business Mail Block Tool");
      expect(structuredData.description).toBe(
        "ビジネスメールをScratch風ブロックUIで作成",
      );
      expect(structuredData.url).toBe(
        "https://yusuke-kim.com/tools/business-mail-block",
      );
      expect(structuredData.applicationCategory).toBe("BusinessApplication");
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
      expect(metadata.title).toBe("Business Mail Block Tool");
      expect(metadata.description).toBe(
        "ビジネスメールをScratch風ブロックUIで簡単作成。挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成。",
      );
      expect(metadata.keywords).toBe(
        "ビジネスメール, テンプレート, Scratch, ブロックUI, メール作成, ビジネス文書",
      );
      expect(metadata.robots).toBe("index, follow");
      expect(metadata.canonical).toBe(
        "https://yusuke-kim.com/tools/business-mail-block",
      );
    });

    it("should have correct OpenGraph metadata", () => {
      const openGraph = metadata.openGraph as Record<string, unknown>;
      expect(openGraph.title).toBe(
        "Business Mail Block Tool - samuido | ビジネスメール作成",
      );
      expect(openGraph.description).toBe(
        "ビジネスメールをScratch風ブロックUIで簡単作成。挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成。",
      );
      expect(openGraph.type).toBe("website");
      expect(openGraph.url).toBe(
        "https://yusuke-kim.com/tools/business-mail-block",
      );
      expect(openGraph.siteName).toBe("samuido");
      expect(openGraph.locale).toBe("ja_JP");
    });

    it("should have correct Twitter metadata", () => {
      const twitter = metadata.twitter as Record<string, unknown>;
      expect(twitter.card).toBe("summary_large_image");
      expect(twitter.title).toBe(
        "Business Mail Block Tool - samuido | ビジネスメール作成",
      );
      expect(twitter.description).toBe(
        "ビジネスメールをScratch風ブロックUIで簡単作成。挨拶、本文、締め、署名を組み合わせてプロフェッショナルなメールを作成。",
      );
      expect(twitter.creator).toBe("@361do_sleep");
    });
  });
});
