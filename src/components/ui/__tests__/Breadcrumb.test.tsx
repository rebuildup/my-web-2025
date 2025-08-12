import { render, screen } from "@testing-library/react";
import React from "react";
import { Breadcrumb } from "../Breadcrumb";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
}));

global.IntersectionObserver = mockIntersectionObserver;

// Mock window.IntersectionObserver
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

Object.defineProperty(global, "IntersectionObserverEntry", {
  writable: true,
  configurable: true,
  value: class IntersectionObserverEntry {
    boundingClientRect: DOMRectReadOnly;
    intersectionRatio: number;
    intersectionRect: DOMRectReadOnly;
    isIntersecting: boolean;
    rootBounds: DOMRectReadOnly | null;
    target: Element;
    time: number;

    constructor(entry: {
      boundingClientRect?: DOMRectReadOnly;
      intersectionRatio?: number;
      intersectionRect?: DOMRectReadOnly;
      isIntersecting?: boolean;
      rootBounds?: DOMRectReadOnly | null;
      target: Element;
      time?: number;
    }) {
      this.boundingClientRect =
        entry.boundingClientRect || ({} as DOMRectReadOnly);
      this.intersectionRatio = entry.intersectionRatio || 0;
      this.intersectionRect = entry.intersectionRect || ({} as DOMRectReadOnly);
      this.isIntersecting = entry.isIntersecting || false;
      this.rootBounds = entry.rootBounds || null;
      this.target = entry.target;
      this.time = entry.time || Date.now();
    }
  },
});

import { usePathname } from "next/navigation";
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Breadcrumb", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render on root path", () => {
    mockUsePathname.mockReturnValue("/");

    const { container } = render(<Breadcrumb />);

    expect(container.firstChild).toBeNull();
  });

  it("should render breadcrumbs for simple path", () => {
    mockUsePathname.mockReturnValue("/about");

    render(<Breadcrumb />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("should render breadcrumbs for nested path", () => {
    mockUsePathname.mockReturnValue("/portfolio/gallery/all");

    render(<Breadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    // Gallery segment is skipped in the implementation
    expect(screen.getByText("All Projects")).toBeInTheDocument();
  });

  it("should have proper ARIA attributes", () => {
    mockUsePathname.mockReturnValue("/about/profile");

    render(<Breadcrumb />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
  });
});
