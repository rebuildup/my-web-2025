/**
 * @jest-environment jsdom
 */

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { render, screen } from "@testing-library/react";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe("Breadcrumbs", () => {
  it("should render nothing when items array is empty", () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render breadcrumb items correctly", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Development", isCurrent: true },
    ];

    render(<Breadcrumbs items={items} />);

    // Check if all items are rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();

    // Check if links are correct
    const homeLink = screen.getByText("Home").closest("a");
    const portfolioLink = screen.getByText("Portfolio").closest("a");

    expect(homeLink).toHaveAttribute("href", "/");
    expect(portfolioLink).toHaveAttribute("href", "/portfolio");

    // Current item should not be a link
    const currentItem = screen.getByText("Development");
    expect(currentItem.closest("a")).toBeNull();
    expect(currentItem).toHaveAttribute("aria-current", "page");
  });

  it("should use / as separator", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Portfolio", isCurrent: true },
    ];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Portfolio", isCurrent: true },
    ];

    const { container } = render(
      <Breadcrumbs items={items} className="custom-class" />,
    );

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("custom-class");
  });

  it("should have proper accessibility attributes", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Portfolio", isCurrent: true },
    ];

    render(<Breadcrumbs items={items} />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Breadcrumb");

    const currentItem = screen.getByText("Portfolio");
    expect(currentItem).toHaveAttribute("aria-current", "page");
  });

  it("should handle items without href as non-links", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Current Section" }, // No href
    ];

    render(<Breadcrumbs items={items} />);

    const homeLink = screen.getByText("Home").closest("a");
    const currentSection = screen.getByText("Current Section");

    expect(homeLink).toHaveAttribute("href", "/");
    expect(currentSection.closest("a")).toBeNull();
  });

  it("should treat last item as current by default", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Last Item", href: "/last" }, // Has href but is last
    ];

    render(<Breadcrumbs items={items} />);

    const lastItem = screen.getByText("Last Item");
    expect(lastItem.closest("a")).toBeNull(); // Should not be a link
    expect(lastItem).toHaveAttribute("aria-current", "page");
  });

  it("should handle isCurrent flag correctly", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Current", href: "/current", isCurrent: true },
      { label: "Last", href: "/last" },
    ];

    render(<Breadcrumbs items={items} />);

    const currentItem = screen.getByText("Current");
    const lastItem = screen.getByText("Last");

    expect(currentItem.closest("a")).toBeNull();
    expect(currentItem).toHaveAttribute("aria-current", "page");

    // Last item should also be treated as current (last item rule)
    expect(lastItem.closest("a")).toBeNull();
    expect(lastItem).toHaveAttribute("aria-current", "page");
  });
});
