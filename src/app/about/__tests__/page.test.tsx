import { render, screen } from "@testing-library/react";
import AboutPage from "../page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe("About Page", () => {
  it("renders the about page with main elements", () => {
    render(<AboutPage />);

    // Check for main heading
    expect(screen.getByText("About samuido")).toBeInTheDocument();

    // Check for profile selection cards
    expect(screen.getByText("Real Profile")).toBeInTheDocument();
    expect(screen.getByText("Handle Profile")).toBeInTheDocument();

    // Check for skills section
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("デザイン")).toBeInTheDocument();
    expect(screen.getByText("プログラミング")).toBeInTheDocument();

    // Check for achievements section
    expect(screen.getByText("Awards & Achievements")).toBeInTheDocument();

    // Check for navigation cards
    expect(screen.getByText("Digital Card")).toBeInTheDocument();
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("Commission")).toBeInTheDocument();

    // Check for basic information
    expect(screen.getByText(/平成19年10月生、現役高専生/)).toBeInTheDocument();
  });

  it("renders skill sections correctly", () => {
    render(<AboutPage />);

    // Check for design skills
    expect(screen.getByText("Photoshop")).toBeInTheDocument();
    expect(screen.getByText("Illustrator")).toBeInTheDocument();
    expect(screen.getByText("Figma")).toBeInTheDocument();

    // Check for programming skills
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();

    // Check for video skills
    expect(screen.getByText("AfterEffects")).toBeInTheDocument();
    expect(screen.getByText("PremierePro")).toBeInTheDocument();
  });

  it("renders achievement items correctly", () => {
    render(<AboutPage />);

    // Check for specific achievements
    expect(
      screen.getByText("中国地区高専コンピュータフェスティバル2024")
    ).toBeInTheDocument();
    expect(screen.getByText("ゲーム部門 1位")).toBeInTheDocument();
    expect(
      screen.getByText("U-16プログラミングコンテスト山口大会2023")
    ).toBeInTheDocument();
    expect(
      screen.getByText("技術賞 企業(プライムゲート)賞")
    ).toBeInTheDocument();
  });

  it("has proper navigation links", () => {
    render(<AboutPage />);

    // Check for profile links - updated to match new structure
    const realProfileSection = screen.getByText("Real Profile").closest("a");
    expect(realProfileSection).toHaveAttribute("href", "/about/profile/real");

    const handleProfileSection = screen
      .getByText("Handle Profile")
      .closest("a");
    expect(handleProfileSection).toHaveAttribute(
      "href",
      "/about/profile/handle"
    );

    // Check for navigation links
    const digitalCardLink = screen.getByText("Digital Card").closest("a");
    expect(digitalCardLink).toHaveAttribute("href", "/about/card/real");

    const linksLink = screen.getByText("Links").closest("a");
    expect(linksLink).toHaveAttribute("href", "/about/links");

    const commissionLink = screen.getByText("Commission").closest("a");
    expect(commissionLink).toHaveAttribute("href", "/about/commission/develop");
  });

  it("displays tagline and description correctly", () => {
    render(<AboutPage />);

    // Check for tagline
    expect(
      screen.getByText(/やる気になれば何でもできるのが強み/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/グラフィックデザイン、映像制作、個人開発など幅広く活動/)
    ).toBeInTheDocument();
  });
});
