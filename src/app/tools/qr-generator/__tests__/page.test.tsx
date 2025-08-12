import { render, screen } from "@testing-library/react";
import QRGeneratorPage, { metadata } from "../page";

// Mock the QRCodeGenerator component
jest.mock("../components/QRCodeGenerator", () => {
  return function MockQRCodeGenerator() {
    return (
      <div data-testid="qr-code-generator">QR Code Generator Component</div>
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

describe("QRGeneratorPage", () => {
  it("should render the page correctly", () => {
    render(<QRGeneratorPage />);

    // Check if breadcrumbs are rendered
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Tools");
    expect(screen.getByTestId("breadcrumb-2")).toHaveTextContent(
      "QR Code Generator",
    );

    // Check if QRCodeGenerator component is rendered
    expect(screen.getByTestId("qr-code-generator")).toBeInTheDocument();
  });

  it("should have correct container classes", () => {
    render(<QRGeneratorPage />);

    const containerSystem = document.querySelector(".container-system");
    expect(containerSystem).toBeInTheDocument();
    expect(containerSystem).toHaveClass("pt-10", "pb-4");
  });

  it("should render structured data script", () => {
    render(<QRGeneratorPage />);

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
      expect(structuredData.name).toBe("QR Code Generator");
      expect(structuredData.description).toBe("URL・テキストからQRコード生成");
      expect(structuredData.url).toBe(
        "https://yusuke-kim.com/tools/qr-generator",
      );
      expect(structuredData.applicationCategory).toBe("UtilityApplication");
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
      expect(metadata.title).toBe("QR Code Generator");
      expect(metadata.description).toBe(
        "URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能付きツール",
      );
      expect(metadata.keywords).toBe(
        "QRコード, QR生成, URL, テキスト, ダウンロード, カスタマイズ",
      );
      expect(metadata.robots).toBe("index, follow");
      expect(metadata.canonical).toBe(
        "https://yusuke-kim.com/tools/qr-generator",
      );
    });

    it("should have correct OpenGraph metadata", () => {
      const openGraph = metadata.openGraph as Record<string, unknown>;
      expect(openGraph.title).toBe(
        "QR Code Generator - samuido | QRコード生成",
      );
      expect(openGraph.description).toBe(
        "URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能付きツール",
      );
      expect(openGraph.type).toBe("website");
      expect(openGraph.url).toBe("https://yusuke-kim.com/tools/qr-generator");
      expect(openGraph.siteName).toBe("samuido");
      expect(openGraph.locale).toBe("ja_JP");
    });

    it("should have correct Twitter metadata", () => {
      const twitter = metadata.twitter as Record<string, unknown>;
      expect(twitter.card).toBe("summary_large_image");
      expect(twitter.title).toBe("QR Code Generator - samuido | QRコード生成");
      expect(twitter.description).toBe(
        "URL・テキストからQRコード生成・カスタマイズ・ダウンロード機能付きツール",
      );
      expect(twitter.creator).toBe("@361do_sleep");
    });
  });
});
