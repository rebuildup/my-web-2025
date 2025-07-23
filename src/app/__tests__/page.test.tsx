import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home", () => {
  it("renders the main page content", () => {
    render(<Home />);

    // Check for key elements in the new samuido design
    expect(screen.getByText("samuido")).toBeInTheDocument();
    expect(
      screen.getByText("クリエイティブポートフォリオ & ツール"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/映像制作、デザイン、プログラミング/),
    ).toBeInTheDocument();

    // Check navigation sections
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Workshop")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();

    // Check global functions
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
  });

  it("renders the footer", () => {
    render(<Home />);

    const footer = screen.getByText(
      "© 2025 samuido - Creative Portfolio & Tools",
    );
    expect(footer).toBeInTheDocument();
  });

  it("applies custom design system classes", () => {
    render(<Home />);

    const mainHeading = screen.getByText("samuido");
    expect(mainHeading).toHaveClass("neue-haas-grotesk-display");
    expect(mainHeading).toHaveClass("text-primary");

    const subtitle = screen.getByText("クリエイティブポートフォリオ & ツール");
    expect(subtitle).toHaveClass("zen-kaku-gothic-new");
  });
});
