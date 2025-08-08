/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import HandleCardPage from "../handle/page";
import RealCardPage from "../real/page";

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

interface LinkProps {
  href: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

interface ImageProps {
  alt: string;
  [key: string]: unknown;
}

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
  default: (props: ImageProps) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("qrcode", () => ({
  toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,mockqrcode"),
}));

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

// Mock useEffect to prevent QR code generation
const mockUseEffect = jest.fn();
React.useEffect = mockUseEffect;

describe("Digital Business Card Pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEffect.mockImplementation(() => {
      // Don't execute the effect to avoid QR code generation issues
    });
  });

  describe("Real Name Card Page", () => {
    it("should render without crashing", () => {
      // Simple smoke test
      expect(() => {
        render(<RealCardPage />);
      }).not.toThrow();
    });

    it("should contain basic card information", () => {
      render(<RealCardPage />);

      // Check if the component renders basic text content
      expect(screen.getByText("Digital Card (Real)")).toBeInTheDocument();
    });
  });

  describe("Handle Name Card Page", () => {
    it("should render without crashing", () => {
      // Simple smoke test
      expect(() => {
        render(<HandleCardPage />);
      }).not.toThrow();
    });

    it("should contain basic card information", () => {
      render(<HandleCardPage />);

      // Check if the component renders basic text content
      expect(screen.getByText("Digital Card (Handle)")).toBeInTheDocument();
    });
  });
});
