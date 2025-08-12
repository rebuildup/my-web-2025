/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import React from "react";
import EstimateLayout from "../layout";

describe("EstimateLayout", () => {
  const mockChildren = <div data-testid="mock-children">Test Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    expect(() => {
      render(<EstimateLayout>{mockChildren}</EstimateLayout>);
    }).not.toThrow();
  });

  it("should render children content", () => {
    const { getByTestId } = render(
      <EstimateLayout>{mockChildren}</EstimateLayout>,
    );

    const childrenElement = getByTestId("mock-children");
    expect(childrenElement).toBeInTheDocument();
    expect(childrenElement).toHaveTextContent("Test Content");
  });

  it("should render structured data script", () => {
    render(<EstimateLayout>{mockChildren}</EstimateLayout>);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(structuredDataScript).toBeInTheDocument();

    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );
    expect(structuredData["@context"]).toBe("https://schema.org");
    expect(structuredData["@type"]).toBe("WebApplication");
  });

  it("should contain proper structured data for web application", () => {
    render(<EstimateLayout>{mockChildren}</EstimateLayout>);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );

    expect(structuredData.name).toBe("samuido Video Estimate Calculator");
    expect(structuredData.description).toBe(
      "映像制作の見積もりを自動計算するアプリケーション",
    );
    expect(structuredData.url).toBe(
      "https://yusuke-kim.com/about/commission/estimate",
    );
    expect(structuredData.applicationCategory).toBe("BusinessApplication");
    expect(structuredData.operatingSystem).toBe("Web Browser");
  });

  it("should contain author information in structured data", () => {
    render(<EstimateLayout>{mockChildren}</EstimateLayout>);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );

    expect(structuredData.author).toBeDefined();
    expect(structuredData.author["@type"]).toBe("Person");
    expect(structuredData.author.name).toBe("木村友亮");
    expect(structuredData.author.alternateName).toBe("samuido");
  });

  it("should contain offer information in structured data", () => {
    render(<EstimateLayout>{mockChildren}</EstimateLayout>);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );

    expect(structuredData.offers).toBeDefined();
    expect(structuredData.offers["@type"]).toBe("Offer");
    expect(structuredData.offers.price).toBe("0");
    expect(structuredData.offers.priceCurrency).toBe("JPY");
  });

  it("should render as a React fragment with structured data and children", () => {
    const { container } = render(
      <EstimateLayout>{mockChildren}</EstimateLayout>,
    );

    // Check that the layout doesn't add extra wrapper elements
    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(scriptElement).toBeInTheDocument();

    const childrenElement = container.querySelector(
      '[data-testid="mock-children"]',
    );
    expect(childrenElement).toBeInTheDocument();
  });

  it("should handle multiple children", () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </>
    );

    const { getByTestId } = render(
      <EstimateLayout>{multipleChildren}</EstimateLayout>,
    );

    expect(getByTestId("child-1")).toBeInTheDocument();
    expect(getByTestId("child-2")).toBeInTheDocument();
    expect(getByTestId("child-3")).toBeInTheDocument();
  });

  it("should handle empty children", () => {
    expect(() => {
      render(<EstimateLayout>{null}</EstimateLayout>);
    }).not.toThrow();
  });

  it("should handle undefined children", () => {
    expect(() => {
      render(<EstimateLayout>{undefined}</EstimateLayout>);
    }).not.toThrow();
  });

  it("should render structured data with proper JSON format", () => {
    render(<EstimateLayout>{mockChildren}</EstimateLayout>);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(structuredDataScript?.textContent).toBeDefined();

    // Verify it's valid JSON
    expect(() => {
      JSON.parse(structuredDataScript?.textContent || "");
    }).not.toThrow();
  });

  it("should have proper TypeScript types for children prop", () => {
    // This test ensures the component accepts React.ReactNode
    const stringChild = "String child";
    const numberChild = 42;
    const booleanChild = true;
    const arrayChild = [
      <div key="1">Array item 1</div>,
      <div key="2">Array item 2</div>,
    ];

    expect(() => {
      render(<EstimateLayout>{stringChild}</EstimateLayout>);
    }).not.toThrow();

    expect(() => {
      render(<EstimateLayout>{numberChild}</EstimateLayout>);
    }).not.toThrow();

    expect(() => {
      render(<EstimateLayout>{booleanChild}</EstimateLayout>);
    }).not.toThrow();

    expect(() => {
      render(<EstimateLayout>{arrayChild}</EstimateLayout>);
    }).not.toThrow();
  });

  it("should maintain structured data consistency across renders", () => {
    const { rerender } = render(
      <EstimateLayout>{mockChildren}</EstimateLayout>,
    );

    const firstRenderScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    const firstRenderData = JSON.parse(firstRenderScript?.textContent || "{}");

    rerender(
      <EstimateLayout>
        <div>Different content</div>
      </EstimateLayout>,
    );

    const secondRenderScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    const secondRenderData = JSON.parse(
      secondRenderScript?.textContent || "{}",
    );

    // Structured data should remain the same regardless of children
    expect(firstRenderData).toEqual(secondRenderData);
  });
});
