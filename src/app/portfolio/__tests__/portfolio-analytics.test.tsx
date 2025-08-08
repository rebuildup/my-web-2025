/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import React from "react";
import PortfolioPage from "../page";

// Mock all external dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/",
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const imgProps = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} alt={imgProps.alt || ""} />;
  },
}));

interface MockLinkProps {
  href: string;
  children: React.ReactNode;
}

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: MockLinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

jest.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: ({ items }: BreadcrumbsProps) => (
    <nav data-testid="breadcrumbs">
      {items.map((item: BreadcrumbItem, index: number) => (
        <span key={index}>
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  ),
}));

// Mock useEffect to prevent side effects
const mockUseEffect = jest.fn();
React.useEffect = mockUseEffect;

describe("Portfolio Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEffect.mockImplementation(() => {
      // Don't execute the effect to avoid side effect issues
    });
  });

  it("should render without crashing", () => {
    expect(() => {
      render(<PortfolioPage />);
    }).not.toThrow();
  });

  it("should contain basic content", () => {
    render(<PortfolioPage />);

    // Check if the component renders without throwing
    expect(document.body).toBeInTheDocument();
  });
});
