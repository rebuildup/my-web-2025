import { render, screen } from "@testing-library/react";
import SVGToTSXPage from "../page";

// Mock the SVGToTSXConverter component
jest.mock("../components/SVGToTSXConverter", () => ({
  SVGToTSXConverter: () => (
    <div data-testid="svg-to-tsx-converter">SVG to TSX Converter</div>
  ),
}));

describe("SVG to TSX Page", () => {
  it("renders the page with correct metadata", () => {
    render(<SVGToTSXPage />);

    expect(screen.getByTestId("svg-to-tsx-converter")).toBeInTheDocument();
  });

  it("includes structured data script", () => {
    render(<SVGToTSXPage />);

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    if (script) {
      const jsonLd = JSON.parse(script.textContent || "");
      expect(jsonLd["@type"]).toBe("WebApplication");
      expect(jsonLd.name).toBe("SVG to TSX Converter");
    }
  });
});
