/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import LinksPage from "../page";

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
  usePathname: () => "/about/links",
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
  className?: string;
  target?: string;
  rel?: string;
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
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
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

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  ExternalLink: ({ className }: { className?: string }) => (
    <svg data-testid="external-link-icon" className={className} />
  ),
  Github: ({ className }: { className?: string }) => (
    <svg data-testid="github-icon" className={className} />
  ),
  Mail: ({ className }: { className?: string }) => (
    <svg data-testid="mail-icon" className={className} />
  ),
  Twitter: ({ className }: { className?: string }) => (
    <svg data-testid="twitter-icon" className={className} />
  ),
  Youtube: ({ className }: { className?: string }) => (
    <svg data-testid="youtube-icon" className={className} />
  ),
}));

describe("LinksPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    expect(() => {
      render(<LinksPage />);
    }).not.toThrow();
  });

  it("should render the page title", () => {
    render(<LinksPage />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Links");
  });

  it("should render breadcrumbs navigation", () => {
    render(<LinksPage />);

    const breadcrumbs = screen.getByTestId("breadcrumbs");
    expect(breadcrumbs).toBeInTheDocument();
  });

  it("should render structured data script", () => {
    render(<LinksPage />);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(structuredDataScript).toBeInTheDocument();

    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );
    expect(structuredData["@context"]).toBe("https://schema.org");
    expect(structuredData["@type"]).toBe("Person");
    expect(structuredData.name).toBe("木村友亮");
    expect(structuredData.alternateName).toBe("samuido");
  });

  it("should render page description", () => {
    render(<LinksPage />);

    const description = screen.getByText(
      /各種SNSアカウント、ポートフォリオサイト、プロフェッショナルリンクをまとめました/,
    );
    expect(description).toBeInTheDocument();
  });

  it("should render Social Media section", () => {
    render(<LinksPage />);

    const socialMediaHeading = screen.getByRole("heading", {
      level: 2,
      name: "Social Media",
    });
    expect(socialMediaHeading).toBeInTheDocument();
  });

  it("should render social media links with proper attributes", () => {
    render(<LinksPage />);

    // Check for Twitter links
    const twitterLinks = screen.getAllByText(/Twitter/);
    expect(twitterLinks.length).toBeGreaterThan(0);

    // Check for GitHub link
    const githubLink = screen.getByText("GitHub");
    expect(githubLink).toBeInTheDocument();

    // Check for YouTube link
    const youtubeLink = screen.getByText("YouTube");
    expect(youtubeLink).toBeInTheDocument();
  });

  it("should render external link icons", () => {
    render(<LinksPage />);

    const externalLinkIcons = screen.getAllByTestId("external-link-icon");
    expect(externalLinkIcons.length).toBeGreaterThan(0);
  });

  it("should render social media icons", () => {
    render(<LinksPage />);

    const twitterIcons = screen.getAllByTestId("twitter-icon");
    expect(twitterIcons.length).toBeGreaterThan(0);

    const githubIcon = screen.getByTestId("github-icon");
    expect(githubIcon).toBeInTheDocument();

    const youtubeIcon = screen.getByTestId("youtube-icon");
    expect(youtubeIcon).toBeInTheDocument();
  });

  it("should render Contact section", () => {
    render(<LinksPage />);

    const contactHeading = screen.getByRole("heading", {
      level: 2,
      name: "Contact",
    });
    expect(contactHeading).toBeInTheDocument();
  });

  it("should render contact email addresses", () => {
    render(<LinksPage />);

    const techEmail = screen.getByText("rebuild.up.up(at)gmail.com");
    expect(techEmail).toBeInTheDocument();

    const designEmail = screen.getByText("361do.sleep@gmail.com");
    expect(designEmail).toBeInTheDocument();
  });

  it("should render mail icons in contact section", () => {
    render(<LinksPage />);

    const mailIcons = screen.getAllByTestId("mail-icon");
    expect(mailIcons.length).toBeGreaterThan(0);
  });

  it("should render link validation notice", () => {
    render(<LinksPage />);

    const linkNoticeHeading = screen.getByRole("heading", {
      level: 3,
      name: "リンクについて",
    });
    expect(linkNoticeHeading).toBeInTheDocument();

    const externalLinkNotice =
      screen.getByText("• 外部リンクは新しいタブで開きます");
    expect(externalLinkNotice).toBeInTheDocument();
  });

  it("should render navigation CTA section", () => {
    render(<LinksPage />);

    const profileLink = screen.getByRole("link", { name: "Profile" });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/about/profile/real");

    const commissionLink = screen.getByRole("link", { name: "Commission" });
    expect(commissionLink).toBeInTheDocument();
    expect(commissionLink).toHaveAttribute("href", "/about/commission/develop");

    const contactLink = screen.getByRole("link", { name: "Contact" });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("should render footer", () => {
    render(<LinksPage />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    const copyright = screen.getByText("© 2025 samuido - External Links");
    expect(copyright).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<LinksPage />);

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", {
      name: "About navigation",
    });
    expect(navigation).toBeInTheDocument();
  });

  it("should render all required headings in proper hierarchy", () => {
    render(<LinksPage />);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Links");

    const h2Elements = screen.getAllByRole("heading", { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);

    const h3Elements = screen.getAllByRole("heading", { level: 3 });
    expect(h3Elements.length).toBeGreaterThan(0);
  });

  it("should contain proper meta information in structured data", () => {
    render(<LinksPage />);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );

    expect(structuredData.url).toBe("https://yusuke-kim.com/about/links");
    expect(structuredData.sameAs).toBeInstanceOf(Array);
    expect(structuredData.sameAs.length).toBeGreaterThan(0);
  });

  it("should render social link descriptions", () => {
    render(<LinksPage />);

    const techDescription = screen.getByText("技術・開発関連のツイート");
    expect(techDescription).toBeInTheDocument();

    const designDescription = screen.getByText("映像・デザイン関連のツイート");
    expect(designDescription).toBeInTheDocument();

    const githubDescription =
      screen.getByText("開発プロジェクトとソースコード");
    expect(githubDescription).toBeInTheDocument();
  });

  it("should render contact category descriptions", () => {
    render(<LinksPage />);

    const techCategory = screen.getByText("技術・開発関連");
    expect(techCategory).toBeInTheDocument();

    const designCategory = screen.getByText("映像・デザイン関連");
    expect(designCategory).toBeInTheDocument();
  });
});
