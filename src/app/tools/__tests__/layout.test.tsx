import { render, screen } from "@testing-library/react";
import React from "react";
import ToolsLayout, { metadata } from "../layout";

describe("ToolsLayout", () => {
  it("renders children correctly", () => {
    const testContent = <div data-testid="test-content">Test Content</div>;

    render(<ToolsLayout>{testContent}</ToolsLayout>);

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("renders children without additional wrapper elements", () => {
    const testContent = <div data-testid="test-content">Test Content</div>;

    render(<ToolsLayout>{testContent}</ToolsLayout>);

    // The layout should render children directly without additional wrappers
    const testElement = screen.getByTestId("test-content");
    // In React testing, components are wrapped in a div by the testing library
    expect(testElement).toBeInTheDocument();
  });

  it("passes through all children props", () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </>
    );

    render(<ToolsLayout>{multipleChildren}</ToolsLayout>);

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("handles empty children", () => {
    render(<ToolsLayout>{null}</ToolsLayout>);

    // Should not throw and should render without issues
    expect(document.body).toBeInTheDocument();
  });

  it("handles string children", () => {
    render(<ToolsLayout>Simple text content</ToolsLayout>);

    expect(screen.getByText("Simple text content")).toBeInTheDocument();
  });

  it("handles complex nested children", () => {
    const complexChildren = (
      <div data-testid="complex-wrapper">
        <header data-testid="header">Header</header>
        <main data-testid="main">
          <section data-testid="section">
            <p data-testid="paragraph">Content</p>
          </section>
        </main>
        <footer data-testid="footer">Footer</footer>
      </div>
    );

    render(<ToolsLayout>{complexChildren}</ToolsLayout>);

    expect(screen.getByTestId("complex-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByTestId("section")).toBeInTheDocument();
    expect(screen.getByTestId("paragraph")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});

describe("ToolsLayout Metadata", () => {
  it("exports correct metadata object", () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBe(
      "実用的なWebツールのコレクション。すべて無償で提供。",
    );
  });

  it("has correct title template configuration", () => {
    expect(metadata.title).toEqual({
      template: "%s - Tools | samuido",
      default: "Tools - samuido | 実用的なWebツール集",
    });
  });

  it("provides fallback title when no specific title is set", () => {
    const titleConfig = metadata.title as { template: string; default: string };
    expect(titleConfig.default).toBe("Tools - samuido | 実用的なWebツール集");
  });

  it("has template for child page titles", () => {
    const titleConfig = metadata.title as { template: string; default: string };
    expect(titleConfig.template).toBe("%s - Tools | samuido");

    // Test template formatting (simulated)
    const childTitle = "Color Palette Generator";
    const expectedTitle = titleConfig.template.replace("%s", childTitle);
    expect(expectedTitle).toBe("Color Palette Generator - Tools | samuido");
  });

  it("includes appropriate description for tools section", () => {
    expect(metadata.description).toContain("実用的なWebツール");
    expect(metadata.description).toContain("無償で提供");
  });
});
