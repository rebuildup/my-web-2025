/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import DevelopCommissionPage from "../develop/page";

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

describe("DevelopCommissionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEffect.mockImplementation(() => {
      // Don't execute the effect to avoid side effect issues
    });
  });

  it("should render without crashing", () => {
    expect(() => {
      render(<DevelopCommissionPage />);
    }).not.toThrow();
  });

  it("should contain basic page information", () => {
    render(<DevelopCommissionPage />);

    // Check if the component renders basic text content
    expect(screen.getByText("開発依頼")).toBeInTheDocument();
  });

  it("should display service sections", () => {
    render(<DevelopCommissionPage />);

    // Check for service-related content using getAllByText
    const webDevElements = screen.getAllByText(/Web開発/);
    expect(webDevElements.length).toBeGreaterThan(0);
  });

  it("should show contact information", () => {
    render(<DevelopCommissionPage />);

    // Check for contact information
    expect(screen.getByText(/rebuild\.up\.up.*gmail\.com/)).toBeInTheDocument();
  });
});
