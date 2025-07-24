import { render, screen } from "@testing-library/react";
import NotFound from "../not-found";

// Mock window.history.back
const mockBack = jest.fn();
Object.defineProperty(window, "history", {
  value: { back: mockBack },
  writable: true,
});

describe("404 Not Found Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the 404 page", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<NotFound />);

    expect(
      screen.getByText(
        /お探しのページは存在しないか、移動または削除された可能性があります/
      )
    ).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(<NotFound />);

    const homeButton = screen.getByText("ホームに戻る");
    const searchButton = screen.getByText("サイト内検索");

    expect(homeButton).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();

    expect(homeButton.closest("a")).toHaveAttribute("href", "/");
    expect(searchButton.closest("a")).toHaveAttribute("href", "/search");
  });

  it("renders navigation links", () => {
    render(<NotFound />);

    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Workshop")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<NotFound />);

    const backButton = screen.getByText("前のページに戻る");
    expect(backButton).toBeInTheDocument();
  });

  it("includes structured data", () => {
    render(<NotFound />);

    const structuredData = document.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(structuredData).toBeInTheDocument();

    if (structuredData) {
      const data = JSON.parse(structuredData.textContent || "{}");
      expect(data["@type"]).toBe("WebPage");
      expect(data.name).toBe("404 Error Page");
    }
  });
});
