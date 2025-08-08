/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import WorkshopPage from "../page";

// Mock Next.js components
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock Breadcrumbs component
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

// Mock fetch for API calls
global.fetch = jest.fn();

describe("WorkshopPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete (process.env as { NEXT_PUBLIC_BASE_URL?: string; NODE_ENV?: string })
      .NEXT_PUBLIC_BASE_URL;
    delete (process.env as { NEXT_PUBLIC_BASE_URL?: string; NODE_ENV?: string })
      .NODE_ENV;
  });

  const mockApiResponse = (data: unknown) => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data }),
    });
  };

  it("renders the main heading", async () => {
    mockApiResponse([]);

    const component = await WorkshopPage();
    render(component);

    expect(
      screen.getByRole("heading", { level: 1, name: "Workshop" }),
    ).toBeInTheDocument();
  });

  it("renders the page description", async () => {
    mockApiResponse([]);

    const component = await WorkshopPage();
    render(component);

    expect(
      screen.getByText(
        /プラグイン配布、技術記事、素材ダウンロードのクリエイティブハブ/,
      ),
    ).toBeInTheDocument();
  });

  it("renders breadcrumbs navigation", async () => {
    mockApiResponse([]);

    const component = await WorkshopPage();
    render(component);

    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
    expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Workshop");
  });
});
