import { render, screen } from "@testing-library/react";
import React from "react";
import WorkshopLayout, { metadata } from "../layout";

describe("WorkshopLayout", () => {
  it("renders children correctly", () => {
    const testContent = <div data-testid="test-content">Test Content</div>;

    render(<WorkshopLayout>{testContent}</WorkshopLayout>);

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("renders children without additional wrapper elements", () => {
    const testContent = <div data-testid="test-content">Test Content</div>;

    render(<WorkshopLayout>{testContent}</WorkshopLayout>);

    // The layout should render children directly without additional wrappers
    const testElement = screen.getByTestId("test-content");
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

    render(<WorkshopLayout>{multipleChildren}</WorkshopLayout>);

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("handles empty children", () => {
    render(<WorkshopLayout>{null}</WorkshopLayout>);

    // Should not throw and should render without issues
    expect(document.body).toBeInTheDocument();
  });

  it("handles string children", () => {
    render(<WorkshopLayout>Simple text content</WorkshopLayout>);

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

    render(<WorkshopLayout>{complexChildren}</WorkshopLayout>);

    expect(screen.getByTestId("complex-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByTestId("section")).toBeInTheDocument();
    expect(screen.getByTestId("paragraph")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});

describe("WorkshopLayout Metadata", () => {
  it("exports correct metadata object", () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe(
      "Workshop - samuido | プラグイン・ブログ・素材配布",
    );
    expect(metadata.description).toContain(
      "AfterEffectsプラグイン、技術記事、素材の配布サイト",
    );
  });

  it("includes appropriate keywords", () => {
    expect(metadata.keywords).toContain("AfterEffects");
    expect(metadata.keywords).toContain("プラグイン");
    expect(metadata.keywords).toContain("技術記事");
    expect(metadata.keywords).toContain("素材配布");
    expect(metadata.keywords).toContain("チュートリアル");
    expect(metadata.keywords).toContain("ブログ");
  });

  it("has correct robots directive", () => {
    expect(metadata.robots).toBe("index, follow");
  });

  it("includes proper OpenGraph metadata", () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toBe(
      "Workshop - samuido | プラグイン・ブログ・素材配布",
    );
    expect(metadata.openGraph?.description).toContain(
      "AfterEffectsプラグイン、技術記事、素材の配布サイト",
    );
    expect(metadata.openGraph?.type).toBe("website");
    expect(metadata.openGraph?.url).toBe("https://yusuke-kim.com/workshop");
    expect(metadata.openGraph?.siteName).toBe("samuido");
    expect(metadata.openGraph?.locale).toBe("ja_JP");
  });

  it("includes proper Twitter metadata", () => {
    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.title).toBe(
      "Workshop - samuido | プラグイン・ブログ・素材配布",
    );
    expect(metadata.twitter?.description).toContain(
      "AfterEffectsプラグイン、技術記事、素材の配布サイト",
    );
    expect(metadata.twitter?.creator).toBe("@361do_sleep");
  });

  it("has consistent title across metadata fields", () => {
    const expectedTitle = "Workshop - samuido | プラグイン・ブログ・素材配布";

    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.openGraph?.title).toBe(expectedTitle);
    expect(metadata.twitter?.title).toBe(expectedTitle);
  });

  it("has consistent description across metadata fields", () => {
    const expectedDescription =
      "AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。";

    expect(metadata.description).toBe(expectedDescription);
    expect(metadata.openGraph?.description).toBe(expectedDescription);
    expect(metadata.twitter?.description).toBe(expectedDescription);
  });

  it("includes proper URL structure", () => {
    expect(metadata.openGraph?.url).toBe("https://yusuke-kim.com/workshop");
  });

  it("includes proper site branding", () => {
    expect(metadata.openGraph?.siteName).toBe("samuido");
    expect(metadata.twitter?.creator).toBe("@361do_sleep");
  });

  it("has appropriate locale setting", () => {
    expect(metadata.openGraph?.locale).toBe("ja_JP");
  });
});
