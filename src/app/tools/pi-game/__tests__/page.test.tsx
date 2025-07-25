import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PiGamePage from "../page";

// Mock the PiGame component to avoid complex game logic in page tests
jest.mock("../components/PiGame", () => {
  return function MockPiGame() {
    return (
      <div data-testid="pi-game">
        <div>Pi Memory Game Component</div>
        <button>ゲーム開始</button>
        <div>3.1415926535...</div>
      </div>
    );
  };
});

describe("Pi Game Page", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("renders the page with correct title and description", () => {
    render(<PiGamePage />);

    expect(
      screen.getByRole("heading", { name: "Pi Memory Game" })
    ).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return (
          element?.textContent ===
          "円周率の桁を記憶して入力するゲームです。テンキーインターフェースで楽しく学習できます。"
        );
      })
    ).toBeInTheDocument();
  });

  it("renders the PiGame component", () => {
    render(<PiGamePage />);

    expect(screen.getByTestId("pi-game")).toBeInTheDocument();
    expect(screen.getByText("Pi Memory Game Component")).toBeInTheDocument();
  });

  it("has navigation back to tools", () => {
    render(<PiGamePage />);

    const backLink = screen.getByRole("link", { name: "← Tools" });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/tools");
  });

  it("has proper accessibility structure", () => {
    render(<PiGamePage />);

    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toHaveTextContent("Pi Memory Game");

    // Check for main landmark
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    // Check for navigation
    const nav = screen.getByRole("navigation", { name: "Site navigation" });
    expect(nav).toBeInTheDocument();
  });

  it("renders with proper CSS classes for design system", () => {
    render(<PiGamePage />);

    const container = screen.getByRole("main").parentElement;
    expect(container).toHaveClass(
      "min-h-screen",
      "bg-background",
      "text-foreground"
    );

    const mainContent = screen.getByRole("main");
    expect(mainContent).toHaveClass("py-10");

    const containerSystem = mainContent.firstChild;
    expect(containerSystem).toHaveClass("container-system");
  });
});
