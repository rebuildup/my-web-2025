import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../page";

// Mock Next.js Link component
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("Home", () => {
  it("renders the main page content", () => {
    render(<Home />);

    // Check for key elements in the new samuido design
    expect(screen.getByText("samuido's website")).toBeInTheDocument();
    expect(
      screen.getByText(/ようこそ！ このサイトはsamuidoの個人サイトです/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /映像制作\/デザイン\/プログラミングを中心とした創作\/開発の記録と/,
      ),
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

    const mainHeading = screen.getByText("samuido's website");
    expect(mainHeading).toHaveClass("neue-haas-grotesk-display");
    expect(mainHeading).toHaveClass("text-primary");

    const description = screen.getByText(
      /映像制作\/デザイン\/プログラミングを中心とした創作\/開発の記録と/,
    );
    expect(description).toHaveClass("noto-sans-jp-light");
  });
});
