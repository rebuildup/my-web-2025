import { render, screen } from "@testing-library/react";
import TextCounterPage from "../page";

// Mock the TextCounterTool component since we're testing the page structure
jest.mock("../components/TextCounterTool", () => {
  return function MockTextCounterTool() {
    return <div data-testid="text-counter-tool">Text Counter Tool</div>;
  };
});

describe("Text Counter Page", () => {
  it("should render the page with correct title and description", () => {
    render(<TextCounterPage />);

    // Check for main heading
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Text Counter"
    );

    // Check for description
    expect(
      screen.getByText(/テキストの文字数を詳細にカウント/)
    ).toBeInTheDocument();

    // Check that the tool component is rendered
    expect(screen.getByTestId("text-counter-tool")).toBeInTheDocument();
  });

  it("should include structured data script", () => {
    render(<TextCounterPage />);

    // Check for JSON-LD structured data
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    expect(scripts.length).toBeGreaterThan(0);

    const structuredData = JSON.parse(scripts[0].textContent || "{}");
    expect(structuredData["@type"]).toBe("WebApplication");
    expect(structuredData.name).toBe("Text Counter");
  });

  it("should have proper accessibility attributes", () => {
    render(<TextCounterPage />);

    // Check for proper heading hierarchy
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check for descriptive text
    expect(screen.getByText(/豊富な統計情報を提供/)).toBeInTheDocument();
  });
});
